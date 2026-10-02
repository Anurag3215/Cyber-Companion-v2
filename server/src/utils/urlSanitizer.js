'use strict';

/**
 * URL Sanitization & SSRF Protection Utility
 * Enforces strict protocol allowlisting and rejects private/internal network targets.
 */

// Private IPv4 ranges (CIDR blocks)
const PRIVATE_IPV4_RANGES = [
  { start: 0x00000000, end: 0x00ffffff }, // 0.0.0.0/8 Current network
  { start: 0x0a000000, end: 0x0affffff }, // 10.0.0.0/8 Private network
  { start: 0x64400000, end: 0x647fffff }, // 100.64.0.0/10 Shared address space / CGNAT
  { start: 0x7f000000, end: 0x7fffffff }, // 127.0.0.0/8 Loopback
  { start: 0xa9fe0000, end: 0xa9feffff }, // 169.254.0.0/16 Link-local / Cloud Metadata
  { start: 0xac100000, end: 0xac1fffff }, // 172.16.0.0/12 Private network
  { start: 0xc0a80000, end: 0xc0a8ffff }, // 192.168.0.0/16 Private network
  { start: 0xc6120000, end: 0xc613ffff }, // 198.18.0.0/15 Benchmark testing
  { start: 0xe0000000, end: 0xefffffff }, // 224.0.0.0/4 Multicast
  { start: 0xf0000000, end: 0xffffffff }, // 240.0.0.0/4 Reserved
];

function ipToLong(ip) {
  return ip
    .split('.')
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isPrivateIPv4(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  for (const part of parts) {
    const num = Number(part);
    if (isNaN(num) || num < 0 || num > 255) return false;
  }
  const long = ipToLong(ip);
  return PRIVATE_IPV4_RANGES.some((range) => long >= range.start && long <= range.end);
}

function isPrivateIPv6(ip) {
  const normalized = ip.toLowerCase();
  if (normalized === '::1' || normalized === '::') return true;
  // Link-local: fe80::/10
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) {
    return true;
  }
  // Unique local: fc00::/7 (fc00:: - fdff::)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return true;
  }
  // IPv4-mapped IPv6: ::ffff:192.168.1.1
  const mappedMatch = normalized.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (mappedMatch) {
    return isPrivateIPv4(mappedMatch[1]);
  }
  return false;
}

/**
 * Validates and sanitizes a URL string for security analysis.
 * Prevents SSRF attacks against internal network resources and metadata APIs.
 *
 * @param {string} rawUrl - Untrusted input URL
 * @returns {{ valid: boolean, sanitizedUrl?: string, error?: string, parsedUrl?: URL }}
 */
function sanitizeAndValidateUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string.' };
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length > 2048) {
    return { valid: false, error: 'URL exceeds maximum allowable length of 2048 characters.' };
  }

  // Prepend protocol if missing for user convenience
  let candidate = trimmed;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(candidate)) {
    candidate = 'https://' + candidate;
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch (_e) {
    return { valid: false, error: 'Malformed or unparseable URL format.' };
  }

  // Enforce protocol allowlist
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      error: `Forbidden protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`,
    };
  }

  // Reject embedded userinfo (SSRF / credential exfiltration vector)
  if (parsed.username || parsed.password) {
    return {
      valid: false,
      error: 'URLs containing embedded credentials (user:password@) are not allowed.',
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (!hostname || hostname.length === 0) {
    return { valid: false, error: 'URL must contain a valid domain or host name.' };
  }

  // Disallow localhost and internal domain extensions
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.corp') ||
    hostname.endsWith('.home')
  ) {
    return {
      valid: false,
      error: 'Access to internal or loopback hostnames is prohibited (SSRF prevention).',
    };
  }

  // IPv4 SSRF check
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    if (isPrivateIPv4(hostname)) {
      return {
        valid: false,
        error: `IP address "${hostname}" belongs to a private/reserved network block (SSRF prevention).`,
      };
    }
  }

  // IPv6 SSRF check (enclosed in square brackets)
  const ipv6Match = hostname.match(/^\[([a-f0-9:]+)\]$/i);
  if (ipv6Match) {
    if (isPrivateIPv6(ipv6Match[1])) {
      return {
        valid: false,
        error: `IPv6 address "${hostname}" belongs to a private/loopback range (SSRF prevention).`,
      };
    }
  }

  return {
    valid: true,
    sanitizedUrl: parsed.href,
    parsedUrl: parsed,
  };
}

module.exports = {
  sanitizeAndValidateUrl,
  isPrivateIPv4,
  isPrivateIPv6,
};
