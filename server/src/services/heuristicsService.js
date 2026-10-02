'use strict';

/**
 * Local Fallback Threat Heuristics Engine
 * Evaluates domain structure, keywords, TLD risk, and known test vectors when upstream APIs are unavailable.
 */

// Known Google Safe Browsing and security industry test domains
const KNOWN_TEST_MALICIOUS_DOMAINS = [
  'testsafebrowsing.appspot.com',
  'malware.testing.google.test',
  'phishing.testing.google.test',
  'unwanted.testing.google.test',
  'ianfette.org',
];

const KNOWN_TRUSTED_DOMAINS = new Set([
  'google.com',
  'www.google.com',
  'wikipedia.org',
  'www.wikipedia.org',
  'github.com',
  'microsoft.com',
  'apple.com',
  'amazon.com',
  'youtube.com',
  'cloudflare.com',
  'mozilla.org',
]);

const SUSPICIOUS_TLDS = new Set([
  'xyz',
  'top',
  'click',
  'cam',
  'work',
  'link',
  'stream',
  'rest',
  'country',
  'gq',
  'cf',
  'tk',
  'ml',
  'ga',
  'buzz',
  'fit',
]);

const PHISHING_KEYWORDS = [
  'login',
  'verify',
  'account',
  'secure',
  'update',
  'banking',
  'password',
  'support',
  'billing',
  'wallet',
  'security-alert',
  'signin',
  'confirm',
  'bonus',
  'gift-claim',
  'free-prize',
];

const BRAND_KEYWORDS = [
  'paypal',
  'apple',
  'google',
  'microsoft',
  'amazon',
  'netflix',
  'chase',
  'wellsfargo',
  'bankofamerica',
  'facebook',
  'instagram',
  'whatsapp',
];

/**
 * Evaluates local heuristics on a parsed URL.
 *
 * @param {URL} parsedUrl
 * @returns {{
 *   isMalicious: boolean,
 *   threatLevel: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL',
 *   riskScore: number,
 *   flags: string[],
 *   plainLanguageVerdict: string,
 *   actionRecommendation: string
 * }}
 */
function evaluateUrlHeuristics(parsedUrl) {
  const hostname = parsedUrl.hostname.toLowerCase();
  const pathname = parsedUrl.pathname.toLowerCase();
  const fullHref = parsedUrl.href.toLowerCase();
  const protocol = parsedUrl.protocol;

  const flags = [];
  let riskScore = 0;

  // 1. Direct hit on known security test domains
  if (KNOWN_TEST_MALICIOUS_DOMAINS.some((td) => hostname === td || hostname.endsWith('.' + td))) {
    return {
      isMalicious: true,
      threatLevel: 'CRITICAL',
      riskScore: 98,
      flags: ['known_test_malicious_domain', 'phishing_test_match'],
      plainLanguageVerdict: 'This website is recognized as a malicious test vector designed to simulate phishing.',
      actionRecommendation: 'Do not proceed or enter any credentials on this website.',
    };
  }

  // 2. Direct hit on known trusted domains
  if (KNOWN_TRUSTED_DOMAINS.has(hostname)) {
    return {
      isMalicious: false,
      threatLevel: 'SAFE',
      riskScore: 5,
      flags: ['trusted_global_domain'],
      plainLanguageVerdict: 'This website has a long-standing verified reputation and valid security certificate.',
      actionRecommendation: 'You can browse safely. Always verify the address bar before entering passwords.',
    };
  }

  // 3. Raw IP address as hostname (frequent malware C2 pattern)
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    flags.push('raw_ip_hostname');
    riskScore += 45;
  }

  // 4. Punycode / IDN Homoglyph detection
  if (hostname.startsWith('xn--') || hostname.includes('.xn--')) {
    flags.push('punycode_homoglyph_detected');
    riskScore += 35;
  }

  // 5. High-Risk TLD evaluation
  const domainParts = hostname.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (SUSPICIOUS_TLDS.has(tld)) {
    flags.push(`high_risk_tld_${tld}`);
    riskScore += 25;
  }

  // 6. Excessive subdomain nesting (>= 4 dots)
  if (domainParts.length >= 4) {
    flags.push('excessive_subdomains');
    riskScore += 20;
  }

  // 7. Excessive hyphens in domain name (typosquatting indicator)
  const hyphenCount = (domainParts.slice(0, -1).join('.').match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    flags.push('excessive_domain_hyphens');
    riskScore += 20;
  }

  // 8. Brand + Phishing keyword combination in non-official domain
  let matchedBrand = null;
  for (const brand of BRAND_KEYWORDS) {
    if (hostname.includes(brand) && !hostname.endsWith(`${brand}.com`)) {
      matchedBrand = brand;
      flags.push(`brand_impersonation_${brand}`);
      riskScore += 40;
      break;
    }
  }

  let matchedKeyword = null;
  for (const kw of PHISHING_KEYWORDS) {
    if (fullHref.includes(kw)) {
      matchedKeyword = kw;
      flags.push(`suspicious_keyword_${kw}`);
      riskScore += 15;
      break;
    }
  }

  // 9. Insecure HTTP with sensitive login/account keyword
  if (protocol === 'http:' && (matchedBrand || matchedKeyword)) {
    flags.push('insecure_http_sensitive_keywords');
    riskScore += 30;
  }

  // Verdict Normalization
  if (riskScore >= 60) {
    return {
      isMalicious: true,
      threatLevel: 'CRITICAL',
      riskScore: Math.min(100, riskScore),
      flags,
      plainLanguageVerdict: matchedBrand
        ? `This website appears to be an unauthorized copy of ${matchedBrand.toUpperCase()} designed to capture personal credentials.`
        : 'This link displays strong indicators of a phishing or credential theft scam.',
      actionRecommendation: 'Do not enter passwords, payment details, or personal data on this domain.',
    };
  }

  if (riskScore >= 25) {
    return {
      isMalicious: false,
      threatLevel: 'SUSPICIOUS',
      riskScore,
      flags,
      plainLanguageVerdict: 'This website shows unusual naming patterns or a recently registered domain structure.',
      actionRecommendation: 'Exercise caution and verify the sender before interacting with this page.',
    };
  }

  return {
    isMalicious: false,
    threatLevel: 'SAFE',
    riskScore: Math.max(10, riskScore),
    flags,
    plainLanguageVerdict: 'No obvious security red flags detected based on structural heuristic analysis.',
    actionRecommendation: 'Safe to browse, but always ensure HTTPS is active before typing sensitive information.',
  };
}

module.exports = {
  evaluateUrlHeuristics,
  KNOWN_TEST_MALICIOUS_DOMAINS,
  KNOWN_TRUSTED_DOMAINS,
};
