'use strict';

/**
 * Multi-Factor Holistic Security Scoring Engine
 * Computes an aggregated 0–100 integer metric from device, network, permission, and threat telemetry.
 */

function calculateSecurityScore(telemetry = {}) {
  const {
    wifi = {},
    device = {},
    permissions = {},
    passwords = {},
    threats = {},
  } = telemetry;

  // 1. Network / Wi-Fi Factor (Weight: 25%)
  let networkScore = 100;
  const encryption = (wifi.securityType || wifi.encryption || 'WPA2').toUpperCase();
  if (encryption === 'WPA3') {
    networkScore = 100;
  } else if (encryption === 'WPA2' || encryption === 'WPA2-PSK') {
    networkScore = 90;
  } else if (encryption === 'WPA') {
    networkScore = 60;
  } else if (encryption === 'WEP') {
    networkScore = 20;
  } else if (encryption === 'OPEN' || encryption === 'NONE') {
    networkScore = 10;
  }

  if (wifi.isCaptivePortal) networkScore -= 15;
  if (wifi.isArpSpoofed) networkScore -= 45;
  if (wifi.hasSuspiciousDns) networkScore -= 15;
  networkScore = Math.max(0, Math.min(100, Math.round(networkScore)));

  // 2. Device Security Factor (Weight: 25%)
  let deviceScore = 0;
  const isScreenLock = device.isScreenLockEnabled !== false;
  const isOsCurrent = device.isOsUpToDate !== false;
  const isRooted = Boolean(device.isRooted);

  if (isScreenLock) deviceScore += 45;
  if (isOsCurrent) deviceScore += 45;
  if (!isRooted) deviceScore += 10;
  if (isRooted) deviceScore = Math.max(0, deviceScore - 50);
  deviceScore = Math.max(0, Math.min(100, Math.round(deviceScore)));

  // 3. Privacy & App Permissions Factor (Weight: 20%)
  let privacyScore = 100;
  const unnecessaryCount = Number(permissions.unnecessaryHighRiskCount || permissions.unverifiedCount || 0);
  privacyScore -= unnecessaryCount * 10;
  if (permissions.microphoneApps > 2) privacyScore -= 5;
  if (permissions.locationBackgroundApps > 1) privacyScore -= 10;
  privacyScore = Math.max(0, Math.min(100, Math.round(privacyScore)));

  // 4. Password & Account Security Factor (Weight: 20%)
  let passwordScore = 70; // baseline
  if (passwords.twoFactorEnabled) passwordScore += 20;
  if (passwords.hasWeakPasswords) passwordScore -= 25;
  if (passwords.hasReusedPasswords) passwordScore -= 15;
  if (passwords.managerEnabled) passwordScore += 10;
  passwordScore = Math.max(0, Math.min(100, Math.round(passwordScore)));

  // 5. Threat Hygiene & Awareness Factor (Weight: 10%)
  let awarenessScore = 80;
  const maliciousCount = Number(threats.maliciousCount || 0);
  awarenessScore -= maliciousCount * 25;
  if (threats.quizPassed) awarenessScore += 15;
  awarenessScore = Math.max(0, Math.min(100, Math.round(awarenessScore)));

  // Weighted Aggregation: 0.25*Network + 0.25*Device + 0.20*Privacy + 0.20*Password + 0.10*Awareness
  const composite =
    networkScore * 0.25 +
    deviceScore * 0.25 +
    privacyScore * 0.20 +
    passwordScore * 0.20 +
    awarenessScore * 0.10;

  const overallScore = Math.max(0, Math.min(100, Math.round(composite)));

  // Risk factors and actionable recommendations
  const riskFactors = [];
  const recommendations = [];

  if (networkScore < 70) {
    riskFactors.push(`Network security is low (${encryption} encryption).`);
    recommendations.push('Avoid online banking or personal account logins on open Wi-Fi. Switch to cellular data or VPN.');
  }

  if (deviceScore < 75) {
    if (isRooted) riskFactors.push('Device has superuser / root modifications enabled.');
    if (!isOsCurrent) recommendations.push('Install the latest operating system security patches.');
    if (!isScreenLock) recommendations.push('Enable biometric authentication or PIN screen lock.');
  }

  if (privacyScore < 85) {
    riskFactors.push(`${unnecessaryCount || 1} unverified app permission(s) granted.`);
    recommendations.push('Review apps with microphone, camera, or contact permissions in Privacy Center.');
  }

  if (passwordScore < 80) {
    riskFactors.push('One or more accounts lack Two-Factor Authentication or use weak credentials.');
    recommendations.push('Enable 2-Step Verification on email and primary banking accounts.');
  }

  let severity = 'LOW';
  let plainLanguageSummary = 'Your device and digital life are well protected.';

  if (overallScore < 50) {
    severity = 'CRITICAL';
    plainLanguageSummary = 'Critical security items require immediate attention to protect your personal information.';
  } else if (overallScore < 80) {
    severity = 'MEDIUM';
    plainLanguageSummary = 'Your security is fair, but several items need attention.';
  }

  return {
    overallScore,
    severity,
    breakdown: {
      password: passwordScore,
      device: deviceScore,
      network: networkScore,
      privacy: privacyScore,
      awareness: awarenessScore,
    },
    riskFactors: riskFactors.length > 0 ? riskFactors : ['No major vulnerabilities detected.'],
    recommendations: recommendations.length > 0 ? recommendations : ['Continue maintaining good cybersecurity habits.'],
    plainLanguageSummary,
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  calculateSecurityScore,
};
