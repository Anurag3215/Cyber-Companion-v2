'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');
const { assessWifiRisk } = require('../src/services/wifiRiskService');

describe('Wi-Fi Risk Analyzer Suite', () => {
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

  describe('1. Unit Heuristics Evaluation', () => {
    test('rates WPA3 encrypted home network as SAFE', () => {
      const assessment = assessWifiRisk({
        ssid: 'Home_Fiber_5G',
        securityType: 'WPA3',
        rssi: -52,
        frequency: 5180,
      });

      assert.equal(assessment.isSafe, true);
      assert.equal(assessment.threatLevel, 'SAFE');
      assert.ok(assessment.riskScore <= 15);
      assert.ok(assessment.verdict.whatHappened.includes('WPA3'));
      assert.ok(assessment.verdict.whatShouldIDo.includes('safely browse'));
    });

    test('flags Open unencrypted network as SUSPICIOUS / High Risk', () => {
      const assessment = assessWifiRisk({
        ssid: 'Cafe_Free_WiFi',
        securityType: 'OPEN',
      });

      assert.equal(assessment.isSafe, false);
      assert.equal(assessment.threatLevel, 'SUSPICIOUS');
      assert.ok(assessment.riskScore >= 75);
      assert.ok(assessment.verdict.whatHappened.includes('open network'));
      assert.ok(assessment.verdict.whatShouldIDo.includes('VPN'));
    });

    test('flags WEP deprecated encryption as CRITICAL', () => {
      const assessment = assessWifiRisk({
        ssid: 'Legacy_Office_Net',
        securityType: 'WEP',
      });

      assert.equal(assessment.isSafe, false);
      assert.equal(assessment.threatLevel, 'CRITICAL');
      assert.ok(assessment.riskScore >= 85);
      assert.ok(assessment.verdict.whyItMatters.includes('decrypt'));
    });

    test('detects ARP Spoofing / Man-In-The-Middle as CRITICAL threat', () => {
      const assessment = assessWifiRisk({
        ssid: 'Airport_Guest',
        securityType: 'WPA2',
        isArpSpoofed: true,
      });

      assert.equal(assessment.isSafe, false);
      assert.equal(assessment.threatLevel, 'CRITICAL');
      assert.ok(assessment.riskScore >= 90);
      assert.ok(assessment.verdict.whatHappened.includes('eavesdropping'));
      assert.ok(assessment.verdict.whatShouldIDo.includes('Disconnect'));
    });

    test('detects Captive Portal redirection requiring attention', () => {
      const assessment = assessWifiRisk({
        ssid: 'Hotel_Lobby_Fast',
        securityType: 'WPA2',
        isCaptivePortal: true,
      });

      assert.equal(assessment.threatLevel, 'SUSPICIOUS');
      assert.ok(assessment.technicalDetails.isCaptivePortal);
      assert.ok(assessment.verdict.whatHappened.includes('login portal'));
    });
  });

  describe('2. HTTP API Endpoint (POST /api/v1/scan/wifi)', () => {
    test('returns 200 with full assessment for WPA2 network', async () => {
      const response = await fetch(`${baseUrl}/api/v1/scan/wifi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ssid: 'MyHome_WiFi',
          securityType: 'WPA2',
          rssi: -58,
          frequency: 5240,
        }),
      });

      assert.equal(response.status, 200);
      const json = await response.json();
      assert.equal(json.success, true);
      assert.equal(json.data.networkName, 'MyHome_WiFi');
      assert.equal(json.data.securityType, 'WPA2');
      assert.equal(json.data.isSafe, true);
      assert.equal(json.data.threatLevel, 'SAFE');
      assert.ok(json.data.verdict.whatHappened);
      assert.ok(json.data.verdict.whyItMatters);
      assert.ok(json.data.verdict.whatShouldIDo);
      assert.equal(json.data.technicalDetails.band, '5 GHz');
    });

    test('returns 200 and flags Public Open network with advice', async () => {
      const response = await fetch(`${baseUrl}/api/v1/scan/wifi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ssid: 'Starbucks_Free_Guest',
          securityType: 'OPEN',
          rssi: -70,
        }),
      });

      assert.equal(response.status, 200);
      const json = await response.json();
      assert.equal(json.success, true);
      assert.equal(json.data.isSafe, false);
      assert.equal(json.data.threatLevel, 'SUSPICIOUS');
      assert.ok(json.data.riskScore >= 75);
    });
  });
});
