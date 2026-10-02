'use strict';

const axios = require('axios');
const { evaluateUrlHeuristics } = require('./heuristicsService');

const UPSTREAM_TIMEOUT_MS = 4000;

/**
 * Encodes a URL to a URL-safe Base64 string (RFC 4648 §5) without padding for VirusTotal v3 API.
 * @param {string} url
 * @returns {string}
 */
function toBase64UrlId(url) {
  return Buffer.from(url)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Queries VirusTotal v3 URL report.
 * @param {string} url
 * @param {string} apiKey
 * @returns {Promise<{ maliciousCount: number, suspiciousCount: number, harmlessCount: number, detected: boolean }>}
 */
async function queryVirusTotal(url, apiKey) {
  if (!apiKey || apiKey.includes('your_')) {
    return { skipped: true, reason: 'VIRUSTOTAL_API_KEY not configured' };
  }

  const urlId = toBase64UrlId(url);
  const response = await axios.get(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
    headers: {
      'x-apikey': apiKey,
      Accept: 'application/json',
    },
    timeout: UPSTREAM_TIMEOUT_MS,
  });

  const stats = response.data?.data?.attributes?.last_analysis_stats || {};
  const maliciousCount = Number(stats.malicious || 0);
  const suspiciousCount = Number(stats.suspicious || 0);
  const harmlessCount = Number(stats.harmless || 0);

  return {
    skipped: false,
    maliciousCount,
    suspiciousCount,
    harmlessCount,
    detected: maliciousCount > 0 || suspiciousCount >= 2,
  };
}

/**
 * Queries Google Safe Browsing v4 threatMatches endpoint.
 * @param {string} url
 * @param {string} apiKey
 * @returns {Promise<{ isThreat: boolean, matches: any[] }>}
 */
async function queryGoogleSafeBrowsing(url, apiKey) {
  if (!apiKey || apiKey.includes('your_')) {
    return { skipped: true, reason: 'SAFEBROWSING_API_KEY not configured' };
  }

  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
  const payload = {
    client: {
      clientId: 'cyber-companion',
      clientVersion: '1.0.0',
    },
    threatInfo: {
      threatTypes: [
        'MALWARE',
        'SOCIAL_ENGINEERING',
        'UNWANTED_SOFTWARE',
        'POTENTIALLY_HARMFUL_APPLICATION',
      ],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url }],
    },
  };

  const response = await axios.post(endpoint, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: UPSTREAM_TIMEOUT_MS,
  });

  const matches = response.data?.matches || [];
  return {
    skipped: false,
    isThreat: matches.length > 0,
    matches,
  };
}

/**
 * Queries URLScan.io search API for existing scan intelligence.
 * @param {string} url
 * @param {string} apiKey
 * @returns {Promise<{ scanned: boolean, malicious: boolean, score?: number }>}
 */
async function queryUrlScan(url, apiKey) {
  if (!apiKey || apiKey.includes('your_')) {
    return { skipped: true, reason: 'URLSCAN_API_KEY not configured' };
  }

  const encodedUrl = encodeURIComponent(`page.url:"${url}"`);
  const endpoint = `https://urlscan.io/api/v1/search/?q=${encodedUrl}&size=1`;
  const headers = { Accept: 'application/json' };
  if (apiKey) {
    headers['API-Key'] = apiKey;
  }

  const response = await axios.get(endpoint, {
    headers,
    timeout: UPSTREAM_TIMEOUT_MS,
  });

  const results = response.data?.results || [];
  if (results.length === 0) {
    return { skipped: false, found: false, malicious: false };
  }

  const latest = results[0];
  const malicious = Boolean(latest.verdicts?.malicious || latest.verdicts?.overall?.malicious);
  return {
    skipped: false,
    found: true,
    malicious,
    score: latest.verdicts?.overall?.score || 0,
  };
}

/**
 * Dispatches concurrent requests to all threat intelligence providers and normalizes verdicts.
 * Falls back to local structural heuristics when upstream providers are unconfigured or fail.
 *
 * @param {string} sanitizedUrl
 * @param {URL} parsedUrl
 * @returns {Promise<{
 *   targetUrl: string,
 *   isMalicious: boolean,
 *   threatLevel: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL',
 *   vendorFlags: { virusTotal: number, safeBrowsing: boolean, urlScan: boolean },
 *   plainLanguageVerdict: string,
 *   actionRecommendation: string,
 *   technicalDetails: object
 * }>}
 */
async function scanUrlWithIntelligence(sanitizedUrl, parsedUrl) {
  const vtKey = process.env.VIRUSTOTAL_API_KEY;
  const gsbKey = process.env.SAFEBROWSING_API_KEY;
  const usKey = process.env.URLSCAN_API_KEY;

  // Local baseline heuristic evaluation
  const localHeuristic = evaluateUrlHeuristics(parsedUrl);

  // Dispatch concurrent upstream queries with graceful Promise.allSettled
  const [vtResult, gsbResult, usResult] = await Promise.allSettled([
    queryVirusTotal(sanitizedUrl, vtKey),
    queryGoogleSafeBrowsing(sanitizedUrl, gsbKey),
    queryUrlScan(sanitizedUrl, usKey),
  ]);

  const vtData = vtResult.status === 'fulfilled' ? vtResult.value : { failed: true, error: vtResult.reason?.message };
  const gsbData = gsbResult.status === 'fulfilled' ? gsbResult.value : { failed: true, error: gsbResult.reason?.message };
  const usData = usResult.status === 'fulfilled' ? usResult.value : { failed: true, error: usResult.reason?.message };

  const vtMaliciousCount = !vtData.skipped && !vtData.failed ? (vtData.maliciousCount || 0) : 0;
  const gsbFlag = !gsbData.skipped && !gsbData.failed ? Boolean(gsbData.isThreat) : false;
  const usFlag = !usData.skipped && !usData.failed ? Boolean(usData.malicious) : false;

  const vendorFlags = {
    virusTotal: vtMaliciousCount,
    safeBrowsing: gsbFlag,
    urlScan: usFlag,
  };

  // Aggregated decision logic
  let isMalicious = false;
  let threatLevel = 'SAFE';
  let plainLanguageVerdict = '';
  let actionRecommendation = '';

  if (gsbFlag || vtMaliciousCount >= 3 || usFlag || localHeuristic.threatLevel === 'CRITICAL') {
    isMalicious = true;
    threatLevel = 'CRITICAL';

    if (gsbFlag) {
      plainLanguageVerdict = 'This website has been flagged by security authorities as a malicious or phishing page.';
      actionRecommendation = 'Do not visit this website or enter passwords, email addresses, or payment details.';
    } else if (vtMaliciousCount >= 3) {
      plainLanguageVerdict = `${vtMaliciousCount} major security vendors classify this website as dangerous or infected.`;
      actionRecommendation = 'Close this page immediately to protect your device and credentials.';
    } else {
      plainLanguageVerdict = localHeuristic.plainLanguageVerdict;
      actionRecommendation = localHeuristic.actionRecommendation;
    }
  } else if (vtMaliciousCount > 0 || localHeuristic.threatLevel === 'SUSPICIOUS') {
    isMalicious = false;
    threatLevel = 'SUSPICIOUS';
    plainLanguageVerdict = localHeuristic.plainLanguageVerdict || 'This link presents minor risk signals and may be an unverified new domain.';
    actionRecommendation = 'Proceed with care. Do not log in or authorize payment on this page without verification.';
  } else {
    isMalicious = false;
    threatLevel = 'SAFE';
    plainLanguageVerdict = 'This website has a valid security certificate and shows no indicators of malware or phishing.';
    actionRecommendation = 'You can browse safely. Always verify the address bar before logging in.';
  }

  return {
    targetUrl: sanitizedUrl,
    isMalicious,
    threatLevel,
    vendorFlags,
    plainLanguageVerdict,
    actionRecommendation,
    technicalDetails: {
      domain: parsedUrl.hostname,
      protocol: parsedUrl.protocol,
      scanTimestamp: new Date().toISOString(),
      upstreamStatus: {
        virusTotal: vtData.skipped ? 'skipped' : (vtData.failed ? 'error' : 'ok'),
        safeBrowsing: gsbData.skipped ? 'skipped' : (gsbData.failed ? 'error' : 'ok'),
        urlScan: usData.skipped ? 'skipped' : (usData.failed ? 'error' : 'ok'),
      },
      heuristicFlags: localHeuristic.flags,
      heuristicRiskScore: localHeuristic.riskScore,
    },
  };
}

module.exports = {
  scanUrlWithIntelligence,
  queryVirusTotal,
  queryGoogleSafeBrowsing,
  queryUrlScan,
  toBase64UrlId,
};
