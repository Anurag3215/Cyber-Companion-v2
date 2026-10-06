'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');
const { sanitizeAndValidateUrl, isPrivateIPv4 } = require('../src/utils/urlSanitizer');
const { evaluateUrlHeuristics } = require('../src/services/heuristicsService');
const { calculateSecurityScore } = require('../src/services/scoringService');

describe('Cyber Companion Threat Gateway Suite', () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('1. SSRF & URL Sanitizer Guard', () => {
    test('permits valid public HTTP and HTTPS domains', () => {
      const res1 = sanitizeAndValidateUrl('https://example.com');
      assert.equal(res1.valid, true);
      assert.equal(res1.sanitizedUrl, 'https://example.com/');

      const res2 = sanitizeAndValidateUrl('www.wikipedia.org/wiki/Cybersecurity');
      assert.equal(res2.valid, true);
      assert.ok(res2.sanitizedUrl.startsWith('https://www.wikipedia.org'));
    });

    test('blocks SSRF against cloud metadata IP (169.254.169.254)', () => {
      const res = sanitizeAndValidateUrl('http://169.254.169.254/latest/meta-data');
      assert.equal(res.valid, false);
      assert.match(res.error, /private\/reserved network block/);
    });

    test('blocks SSRF against loopback addresses (127.0.0.1 & localhost)', () => {
      const res1 = sanitizeAndValidateUrl('http://127.0.0.1:8080/admin');
      assert.equal(res1.valid, false);

      const res2 = sanitizeAndValidateUrl('http://localhost:5000/internal');
      assert.equal(res2.valid, false);
      assert.match(res2.error, /internal or loopback hostnames/);
    });

    test('blocks SSRF against RFC1918 private subnets', () => {
      assert.equal(isPrivateIPv4('10.0.0.1'), true);
      assert.equal(isPrivateIPv4('172.16.0.5'), true);
      assert.equal(isPrivateIPv4('192.168.1.1'), true);
      assert.equal(isPrivateIPv4('8.8.8.8'), false);

      const res = sanitizeAndValidateUrl('http://192.168.1.254/router');
      assert.equal(res.valid, false);
    });

    test('blocks non-HTTP protocols (file:, ftp:, javascript:)', () => {
      assert.equal(sanitizeAndValidateUrl('file:///etc/passwd').valid, false);
      assert.equal(sanitizeAndValidateUrl('javascript:alert(1)').valid, false);
      assert.equal(sanitizeAndValidateUrl('ftp://ftp.example.com').valid, false);
    });

    test('blocks URLs with embedded credentials', () => {
      const res = sanitizeAndValidateUrl('http://admin:secret@malicious.com');
      assert.equal(res.valid, false);
      assert.match(res.error, /embedded credentials/);
    });
  });

  describe('2. Threat Heuristics & Plain-Language Engine', () => {
    test('identifies safe verified global domains', () => {
      const parsed = new URL('https://www.wikipedia.org');
      const verdict = evaluateUrlHeuristics(parsed);
      assert.equal(verdict.isMalicious, false);
      assert.equal(verdict.threatLevel, 'SAFE');
      assert.ok(verdict.plainLanguageVerdict.includes('verified reputation'));
    });

    test('flags known test malicious domains immediately', () => {
      const parsed = new URL('http://testsafebrowsing.appspot.com/s/phishing.html');
      const verdict = evaluateUrlHeuristics(parsed);
      assert.equal(verdict.isMalicious, true);
      assert.equal(verdict.threatLevel, 'CRITICAL');
      assert.ok(verdict.actionRecommendation.includes('Do not proceed'));
    });

    test('detects brand impersonation and high-risk TLD phishing', () => {
      const parsed = new URL('http://paypal-security-update-account.xyz/login');
      const verdict = evaluateUrlHeuristics(parsed);
      assert.equal(verdict.isMalicious, true);
      assert.equal(verdict.threatLevel, 'CRITICAL');
      assert.ok(verdict.plainLanguageVerdict.includes('PAYPAL'));
    });
  });

  describe('3. Multi-Factor Holistic Security Scoring Engine', () => {
    test('computes high score (>=80) for hardened telemetry', () => {
      const telemetry = {
        wifi: { securityType: 'WPA3', isCaptivePortal: false, isArpSpoofed: false },
        device: { isScreenLockEnabled: true, isOsUpToDate: true, isRooted: false },
        permissions: { unnecessaryHighRiskCount: 0 },
        passwords: { twoFactorEnabled: true, hasWeakPasswords: false },
        threats: { maliciousCount: 0, quizPassed: true },
      };
      const result = calculateSecurityScore(telemetry);
      assert.ok(result.overallScore >= 80, `Expected score >= 80, got ${result.overallScore}`);
      assert.equal(result.severity, 'LOW');
      assert.ok(result.breakdown.network >= 90);
      assert.ok(result.breakdown.device >= 90);
    });

    test('computes critical score (<50) for compromised/insecure telemetry', () => {
      const telemetry = {
        wifi: { securityType: 'OPEN', isCaptivePortal: true, isArpSpoofed: true },
        device: { isScreenLockEnabled: false, isOsUpToDate: false, isRooted: true },
        permissions: { unnecessaryHighRiskCount: 6 },
        passwords: { twoFactorEnabled: false, hasWeakPasswords: true },
        threats: { maliciousCount: 3, quizPassed: false },
      };
      const result = calculateSecurityScore(telemetry);
      assert.ok(result.overallScore < 50, `Expected score < 50, got ${result.overallScore}`);
      assert.equal(result.severity, 'CRITICAL');
      assert.ok(result.riskFactors.length > 0);
      assert.ok(result.recommendations.length > 0);
    });
  });

  describe('4. Express Gateway Integration Endpoints', () => {
    test('POST /api/v1/scan/url handles verified safe URL', async () => {
      const response = await fetch(`${baseUrl}/api/v1/scan/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://www.wikipedia.org' }),
      });

      assert.equal(response.status, 200);
      const json = await response.json();
      assert.equal(json.success, true);
      assert.equal(json.data.targetUrl, 'https://www.wikipedia.org/');
      assert.equal(json.data.isMalicious, false);
      assert.equal(json.data.threatLevel, 'SAFE');
      assert.ok(json.data.plainLanguageVerdict);
      assert.ok(json.data.actionRecommendation);
    });

    test('POST /api/v1/scan/url handles simulated malicious vector', async () => {
      const response = await fetch(`${baseUrl}/api/v1/scan/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'http://testsafebrowsing.appspot.com/s/phishing.html' }),
      });

      assert.equal(response.status, 200);
      const json = await response.json();
      assert.equal(json.success, true);
      assert.equal(json.data.isMalicious, true);
      assert.equal(json.data.threatLevel, 'CRITICAL');
      assert.ok(json.data.plainLanguageVerdict);
    });

    test('POST /api/v1/scan/url rejects SSRF internal IP targets with 400', async () => {
      const response = await fetch(`${baseUrl}/api/v1/scan/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'http://169.254.169.254/latest/meta-data' }),
      });

      assert.equal(response.status, 400);
      const json = await response.json();
      assert.equal(json.success, false);
      assert.match(json.message, /private\/reserved network block/);
    });

    test('POST /api/v1/scan/url rejects malformed inputs with 400', async () => {
      const response = await fetch(`${baseUrl}/api/v1/scan/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: '' }),
      });

      assert.equal(response.status, 400);
      const json = await response.json();
      assert.equal(json.success, false);
    });

    test('POST /api/v1/score/calculate returns valid score breakdown', async () => {
      const response = await fetch(`${baseUrl}/api/v1/score/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wifi: { securityType: 'WPA2' },
          device: { isScreenLockEnabled: true, isOsUpToDate: true },
          permissions: { unnecessaryHighRiskCount: 1 },
        }),
      });

      assert.equal(response.status, 200);
      const json = await response.json();
      assert.equal(json.success, true);
      assert.ok(typeof json.data.overallScore === 'number');
      assert.ok(json.data.overallScore >= 0 && json.data.overallScore <= 100);
      assert.ok(json.data.breakdown.network);
      assert.ok(json.data.breakdown.device);
      assert.ok(json.data.breakdown.privacy);
    });

    test('POST /api/v1/scan/url returns cached response on second lookup', async () => {
      const target = 'https://cached-test-domain.org';
      const first = await fetch(`${baseUrl}/api/v1/scan/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });
      const json1 = await first.json();
      assert.equal(json1.success, true);
      assert.equal(Boolean(json1.data.cached), false);

      const second = await fetch(`${baseUrl}/api/v1/scan/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });
      const json2 = await second.json();
      assert.equal(json2.success, true);
      assert.equal(json2.data.cached, true);
      assert.ok(json2.data.cachedAt);
    });
  });
});
