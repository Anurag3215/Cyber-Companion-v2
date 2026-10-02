'use strict';

/**
 * Wi-Fi Risk Assessment & Rogue AP Evaluation Engine
 * Analyzes wireless encryption, captive portals, ARP spoofing, and Evil Twin indicators.
 */

const KNOWN_PUBLIC_HOTSPOTS = [
  'starbucks',
  'mcdonalds',
  'airport',
  'hotel',
  'guest',
  'free_wifi',
  'public',
  'cafe',
  'train_wifi',
  'subway',
];

/**
 * Assesses the cybersecurity risk of a wireless network based on telemetry.
 *
 * @param {object} telemetry
 * @param {string} telemetry.ssid - Network name
 * @param {string} [telemetry.bssid] - MAC address of access point
 * @param {'WPA3'|'WPA2'|'WPA'|'WEP'|'OPEN'} [telemetry.securityType] - Encryption protocol
 * @param {number} [telemetry.rssi] - Signal strength in dBm (-30 to -90)
 * @param {number} [telemetry.frequency] - Channel frequency in MHz (e.g., 2412, 5180)
 * @param {boolean} [telemetry.isCaptivePortal] - Whether network redirects HTTP traffic
 * @param {boolean} [telemetry.isArpSpoofed] - Whether ARP table poisoning is detected
 * @param {boolean} [telemetry.hasDnsTampering] - Whether DNS query redirection is detected
 * @returns {object} Standardized Wi-Fi risk assessment
 */
function assessWifiRisk(telemetry = {}) {
  const ssid = (telemetry.ssid || 'Unknown Network').trim();
  const bssid = telemetry.bssid || '00:11:22:33:44:55';
  const rawSecurity = (telemetry.securityType || 'OPEN').toUpperCase();
  const isCaptive = Boolean(telemetry.isCaptivePortal);
  const isArpSpoofed = Boolean(telemetry.isArpSpoofed);
  const hasDnsTampering = Boolean(telemetry.hasDnsTampering);
  const rssi = typeof telemetry.rssi === 'number' ? telemetry.rssi : -62;
  const frequency = telemetry.frequency || 5180;

  let riskScore = 0;
  const flags = [];

  // 1. Encryption Protocol Analysis
  let normalizedSecurity = 'OPEN';
  if (rawSecurity.includes('WPA3')) {
    normalizedSecurity = 'WPA3';
    riskScore += 5;
  } else if (rawSecurity.includes('WPA2')) {
    normalizedSecurity = 'WPA2';
    riskScore += 15;
  } else if (rawSecurity.includes('WPA')) {
    normalizedSecurity = 'WPA';
    riskScore += 45;
    flags.push('deprecated_wpa1_protocol');
  } else if (rawSecurity.includes('WEP')) {
    normalizedSecurity = 'WEP';
    riskScore += 85;
    flags.push('broken_wep_encryption');
  } else {
    normalizedSecurity = 'OPEN';
    riskScore += 75;
    flags.push('unencrypted_open_network');
  }

  // 2. MITM & ARP Poisoning Detection
  if (isArpSpoofed) {
    riskScore += 90;
    flags.push('arp_spoofing_detected');
  }

  // 3. DNS Tampering Detection
  if (hasDnsTampering) {
    riskScore += 50;
    flags.push('dns_hijacking_suspected');
  }

  // 4. Captive Portal Detection
  if (isCaptive) {
    riskScore += 25;
    flags.push('captive_portal_interception');
  }

  // 5. Evil Twin / Rogue AP Heuristics
  const lowerSsid = ssid.toLowerCase();
  const matchesPublicName = KNOWN_PUBLIC_HOTSPOTS.some((kw) => lowerSsid.includes(kw));
  if (matchesPublicName && normalizedSecurity === 'OPEN') {
    flags.push('unencrypted_public_hotspot');
    riskScore += 15;
  }

  // Cap risk score between 0 and 100
  riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));

  // Derive Threat Level & Plain-Language UX Answers
  let threatLevel = 'SAFE';
  let isSafe = true;
  let whatHappened = '';
  let whyItMatters = '';
  let whatShouldIDo = '';

  if (isArpSpoofed) {
    threatLevel = 'CRITICAL';
    isSafe = false;
    whatHappened = `Active eavesdropping detected on "${ssid}". Someone is intercepting local network traffic.`;
    whyItMatters = 'An attacker can capture passwords, session tokens, and personal messages in real time.';
    whatShouldIDo = 'Disconnect from this Wi-Fi network immediately and switch to mobile cellular data.';
  } else if (normalizedSecurity === 'WEP') {
    threatLevel = 'CRITICAL';
    isSafe = false;
    whatHappened = `"${ssid}" uses outdated WEP protection, which is broken and easily hacked.`;
    whyItMatters = 'Nearby devices can decrypt all communications within minutes using automated tools.';
    whatShouldIDo = 'Do not transmit sensitive data. Update the router to WPA2 or WPA3 encryption.';
  } else if (normalizedSecurity === 'OPEN') {
    threatLevel = 'SUSPICIOUS';
    isSafe = false;
    whatHappened = `"${ssid}" is an open network without password encryption.`;
    whyItMatters = 'Anyone in the vicinity can join and monitor unencrypted network packets.';
    whatShouldIDo = 'Avoid banking, shopping, or entering passwords. Use a VPN or your phone mobile data.';
  } else if (isCaptive) {
    threatLevel = 'SUSPICIOUS';
    isSafe = false;
    whatHappened = `"${ssid}" is routing web requests through an authentication login portal.`;
    whyItMatters = 'The network administrator or hotspot operator can track visited hostnames and force redirects.';
    whatShouldIDo = 'Complete the official login page, but avoid entering personal account passwords on non-HTTPS pages.';
  } else {
    threatLevel = 'SAFE';
    isSafe = true;
    whatHappened = `Connected to "${ssid}" with strong ${normalizedSecurity} encryption.`;
    whyItMatters = 'Your connection is protected with modern cryptographic locks that shield your traffic from eavesdroppers.';
    whatShouldIDo = 'You can safely browse, bank, and shop online. Always verify HTTPS in your browser address bar.';
  }

  const signalQuality =
    rssi >= -60 ? 'Excellent' : rssi >= -75 ? 'Good' : 'Weak';
  const band = frequency > 4000 ? '5 GHz' : '2.4 GHz';

  return {
    networkName: ssid,
    bssid,
    securityType: normalizedSecurity,
    isSafe,
    riskScore,
    threatLevel,
    verdict: {
      whatHappened,
      whyItMatters,
      whatShouldIDo,
    },
    technicalDetails: {
      rawSecurity,
      signalStrengthDbm: rssi,
      signalQuality,
      frequencyMhz: frequency,
      band,
      isCaptivePortal: isCaptive,
      isArpSpoofed,
      hasDnsTampering,
      flags,
      assessmentTimestamp: new Date().toISOString(),
    },
  };
}

module.exports = {
  assessWifiRisk,
  KNOWN_PUBLIC_HOTSPOTS,
};
