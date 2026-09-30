import {
  UrlScanResult,
  WifiRiskAssessment,
  PlainLanguageExplanation,
  EncryptionProtocol,
} from '../types/security';

/**
 * CYBER COMPANION — Decoupled Security Analysis Service Layer
 * Architecture: UI -> Service/API Layer -> Security Engine
 * Translates technical threat telemetry into calm, plain-language answers:
 *   1. WHAT HAPPENED?
 *   2. WHY DOES IT MATTER?
 *   3. WHAT SHOULD I DO?
 */
export const CyberSecurityService = {
  /**
   * Evaluates a website URL and returns a plain-language UrlScanResult.
   */
  analyzeUrl: async (rawInput: string): Promise<UrlScanResult> => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      throw new Error('EMPTY_URL');
    }

    // Simulate network/scanner error when user tests "offline" or "error.test"
    if (trimmed.toLowerCase().includes('error.test') || trimmed.toLowerCase() === 'offline') {
      throw new Error('SCANNER_UNAVAILABLE');
    }

    const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const lower = normalized.toLowerCase();

    const isDangerous =
      lower.includes('phish') ||
      lower.includes('free-gift') ||
      lower.includes('verify-login') ||
      lower.includes('parcel-fee') ||
      lower.includes('bank-alert') ||
      lower.endsWith('.xyz') ||
      lower.endsWith('.top');

    const isSuspicious =
      !isDangerous &&
      (lower.startsWith('http://') ||
        lower.includes('bit.ly') ||
        lower.includes('tinyurl') ||
        lower.includes('promo') ||
        lower.includes('claim') ||
        lower.includes('-login'));

    if (isDangerous) {
      return {
        targetUrl: normalized,
        normalizedDomain: normalized.replace(/^https?:\/\//, '').split('/')[0],
        status: 'DANGER',
        isSafe: false,
        riskScore: 92,
        severity: 'CRITICAL',
        verdicts: [
          {
            engine: 'GoogleSafeBrowsing',
            malicious: true,
            confidenceScore: 96,
            categories: ['Social Engineering / Phishing'],
          },
          {
            engine: 'VirusTotal',
            malicious: true,
            confidenceScore: 91,
            categories: ['Phishing', 'Brand Impersonation'],
          },
          {
            engine: 'URLScan',
            malicious: true,
            confidenceScore: 89,
            categories: ['Credential Harvesting Form'],
          },
        ],
        insight: {
          summary: "Don't continue to this website.",
          whyItMatters: 'It may try to collect your personal or payment information.',
          recommendedActions: [
            'Go back and close the message that sent you this link.',
            'Do not enter your password, card number, or verification code.',
          ],
        },
        explanation: {
          whatHappened: "Don't continue to this website. It shows strong signs of a fake login or scam page.",
          whyItMatters:
            'Websites like this are designed to look familiar so visitors type in their passwords, banking details, or card numbers.',
          whatShouldIDo: [
            "Don't enter your password or payment information.",
            'Close this link and open the company’s official app or website directly.',
            'If you received this link by text, delete the message.',
          ],
          technicalDetails: {
            summary:
              'Flagged by 3 threat intelligence engines for deceptive domain age and credential harvesting patterns.',
            facts: [
              { label: 'Security Certificate', value: 'Untrusted / Mismatched' },
              { label: 'Domain Age', value: 'Registered 2 days ago' },
              { label: 'Redirects', value: '2 cross-domain redirects detected' },
              { label: 'Reputation Score', value: 'High Risk (92/100)' },
            ],
          },
          isSimulated: true,
        },
        scannedAt: new Date().toISOString(),
      };
    }

    if (isSuspicious) {
      return {
        targetUrl: normalized,
        normalizedDomain: normalized.replace(/^https?:\/\//, '').split('/')[0],
        status: 'ATTENTION',
        isSafe: false,
        riskScore: 55,
        severity: 'MEDIUM',
        verdicts: [
          {
            engine: 'URLScan',
            malicious: false,
            confidenceScore: 60,
            categories: ['Unencrypted HTTP or Link Shortener'],
          },
        ],
        insight: {
          summary: 'This website needs attention.',
          whyItMatters:
            'It uses an unencrypted connection or a shortened link that hides the final destination.',
          recommendedActions: [
            'Proceed only if you trust the sender.',
            'Avoid typing passwords or payment details on this page.',
          ],
        },
        explanation: {
          whatHappened:
            'This website needs attention before you continue.',
          whyItMatters:
            'It either uses a shortened link that hides the real web address or lacks a private encrypted connection.',
          whatShouldIDo: [
            'Double-check who sent you this link before opening it.',
            'Do not type passwords or credit card numbers on this website.',
          ],
          technicalDetails: {
            summary: 'Connection uses unencrypted HTTP or redirect forwarding.',
            facts: [
              {
                label: 'Security Certificate',
                value: lower.startsWith('http://')
                  ? 'Missing (Unencrypted HTTP)'
                  : 'Redirect Shortener',
              },
              { label: 'Domain Age', value: 'Less than 30 days' },
              { label: 'Reputation Score', value: 'Caution (55/100)' },
            ],
          },
          isSimulated: true,
        },
        scannedAt: new Date().toISOString(),
      };
    }

    return {
      targetUrl: normalized,
      normalizedDomain: normalized.replace(/^https?:\/\//, '').split('/')[0],
      status: 'SAFE',
      isSafe: true,
      riskScore: 8,
      severity: 'LOW',
      verdicts: [
        {
          engine: 'GoogleSafeBrowsing',
          malicious: false,
          confidenceScore: 99,
          categories: ['Verified Clean'],
        },
        {
          engine: 'VirusTotal',
          malicious: false,
          confidenceScore: 98,
          categories: ['0/72 Security Vendors Flagged'],
        },
      ],
      insight: {
        summary: '✓ This website looks safe.',
        whyItMatters:
          '✓ This website has a valid security certificate and no known safety warnings.',
        recommendedActions: [
          'You can browse this website normally.',
          'Always verify the web address before entering sensitive account passwords.',
        ],
      },
      explanation: {
        whatHappened: '✓ This website looks safe and has a valid security certificate.',
        whyItMatters:
          'Your connection to this website is encrypted, and no phishing or malware warnings were found.',
        whatShouldIDo: [
          'You can safely continue to this website.',
          'Still use a unique password if you sign into an account.',
        ],
        technicalDetails: {
          summary: 'TLS 1.3 valid certificate verified; 0 detections across threat feeds.',
          facts: [
            { label: 'Security Certificate', value: 'Valid HTTPS (TLS 1.3)' },
            { label: 'Domain Age', value: 'Established domain (> 5 years)' },
            { label: 'Redirects', value: 'None (Direct resolution)' },
            { label: 'Reputation Analysis', value: 'Clean (0/72 engines)' },
          ],
        },
        isSimulated: true,
      },
      scannedAt: new Date().toISOString(),
    };
  },

  /**
   * Evaluates a Wi-Fi network in calm, human-friendly language.
   */
  analyzeWifi: (
    ssid: string,
    encryption: EncryptionProtocol,
    isPublic: boolean,
  ): WifiRiskAssessment => {
    if (encryption === 'OPEN' || encryption === 'WEP') {
      return {
        ssid,
        connectionStatus: 'Connected',
        encryption,
        humanEncryptionLabel: 'This Wi-Fi does not require a password (Open network).',
        networkType: 'Public Wi-Fi Hotspot',
        status: 'ATTENTION',
        riskScore: 72,
        severity: 'HIGH',
        potentialRisks: [
          'Nearby devices on the same Wi-Fi could potentially see unencrypted activity.',
          'Anyone can join this network without a password.',
        ],
        insight: {
          summary: 'This public Wi-Fi is not password-protected.',
          whyItMatters:
            'Open networks are convenient for reading news, but unsafe for banking or sensitive logins.',
          recommendedActions: [
            'Avoid logging into your bank or entering card details right now.',
            'Switch to mobile data (4G/5G) for private transactions.',
          ],
        },
        explanation: {
          whatHappened: `"${ssid}" is an open public Wi-Fi network without password security.`,
          whyItMatters:
            'Because there is no encryption password on this Wi-Fi, information sent to unencrypted websites can be intercepted by others nearby.',
          whatShouldIDo: [
            'Wait to check bank accounts or pay bills until you are on mobile data or home Wi-Fi.',
            'Turn off "Auto-Join" for this network when you leave.',
          ],
          technicalDetails: {
            summary: 'IEEE 802.11 Open broadcast frame (no WPA2/WPA3 RSN information element).',
            facts: [
              { label: 'Network Name (SSID)', value: ssid },
              { label: 'Encryption Protocol', value: 'Open (Unencrypted)' },
              { label: 'Network Classification', value: 'Public Hotspot' },
            ],
          },
          isSimulated: true,
        },
        evaluatedAt: new Date().toISOString(),
      };
    }

    return {
      ssid,
      connectionStatus: 'Connected',
      encryption,
      humanEncryptionLabel: `✓ Your Wi-Fi uses ${encryption} security.`,
      networkType: isPublic ? 'Public Wi-Fi Hotspot' : 'Private Home Network',
      status: isPublic ? 'ATTENTION' : 'SAFE',
      riskScore: isPublic ? 35 : 10,
      severity: isPublic ? 'MEDIUM' : 'LOW',
      potentialRisks: isPublic
        ? ['Shared password in a public place—other guests are on the same network.']
        : ['No immediate network risks detected.'],
      insight: {
        summary: `✓ Your Wi-Fi uses ${encryption} security.`,
        whyItMatters:
          'Your wireless traffic is protected with a modern security password.',
        recommendedActions: [
          'Your connection is safe for everyday browsing, work, and banking.',
        ],
      },
      explanation: {
        whatHappened: `✓ Your Wi-Fi ("${ssid}") uses ${encryption} security.`,
        whyItMatters:
          'Modern Wi-Fi encryption scrambles the data traveling between your phone and the router so strangers nearby cannot read it.',
        whatShouldIDo: [
          'You can safely browse and use your apps on this network.',
          'Keep your home router password private for family members.',
        ],
        technicalDetails: {
          summary: `${encryption}-Personal (CCMP/AES) authenticated wireless link.`,
          facts: [
            { label: 'Network Name (SSID)', value: ssid },
            { label: 'Encryption Standard', value: `${encryption}-Personal (AES)` },
            { label: 'Signal Integrity', value: '-48 dBm (Strong, No Spoofing)' },
          ],
        },
        isSimulated: true,
      },
      evaluatedAt: new Date().toISOString(),
    };
  },

  /**
   * Evaluates password strength without storing or transmitting the password.
   */
  evaluatePasswordStrength: (password: string) => {
    if (!password) {
      return {
        score: 0,
        label: 'Enter a password to check',
        status: 'ATTENTION' as const,
        feedback: 'We check your password right on your device—it is never saved or sent anywhere.',
      };
    }

    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 25;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;

    if (score >= 80) {
      return {
        score,
        label: '✓ Strong Password',
        status: 'SAFE' as const,
        feedback: 'Great job! This password is long and uses a healthy mix of characters.',
      };
    }
    if (score >= 50) {
      return {
        score,
        label: '⚠ Good, but could be stronger',
        status: 'ATTENTION' as const,
        feedback: 'Try making it at least 12 characters long and adding a symbol or number.',
      };
    }
    return {
      score: Math.max(15, score),
      label: '● Easy to guess',
      status: 'DANGER' as const,
      feedback: 'Short passwords can be guessed quickly. Aim for at least 12 characters.',
    };
  },

  /**
   * Generates a strong random password on-device.
   */
  generatePassword: (options: {
    length: number;
    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
  }): string => {
    let chars = '';
    if (options.includeLowercase) chars += 'abcdefghijkmnopqrstuvwxyz';
    if (options.includeUppercase) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    if (options.includeNumbers) chars += '23456789';
    if (options.includeSymbols) chars += '!@#$%&*?+-=';
    if (!chars) chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let result = '';
    for (let i = 0; i < options.length; i += 1) {
      const idx = Math.floor(Math.random() * chars.length);
      result += chars[idx];
    }
    return result;
  },

  /**
   * Generates a calm, structured plain-language response for Cyber Assistant.
   */
  askCyberAssistant: (question: string): { text: string; structured: PlainLanguageExplanation } => {
    const q = question.toLowerCase();

    if (q.includes('website') || q.includes('link') || q.includes('url')) {
      return {
        text: 'Before entering any personal details on an unfamiliar website, look for a few simple signs and run it through our Check Website tool.',
        structured: {
          whatHappened: 'You want to know if a website is trustworthy before using it.',
          whyItMatters:
            'Fake websites often copy the logos of real stores or banks to trick visitors into typing passwords or card numbers.',
          whatShouldIDo: [
            'Copy the web address and paste it into Cyber Companion’s URL Scanner.',
            'Check if the address has strange extra words (like "netflix-billing-update.com").',
            'Never enter payment details on a link sent via an unexpected text message.',
          ],
        },
      };
    }

    if (q.includes('message') || q.includes('text') || q.includes('sms') || q.includes('email')) {
      return {
        text: 'Unexpected messages that try to rush or scare you are almost always scams.',
        structured: {
          whatHappened: 'You received a suspicious text message, email, or chat.',
          whyItMatters:
            'Scammers create artificial urgency—like a missed package or locked bank account—so you tap before thinking.',
          whatShouldIDo: [
            'Do not tap any links or call the phone number inside the message.',
            'Open the company’s official app or website directly to check if there is really an issue.',
            'Delete and block the sender.',
          ],
        },
      };
    }

    if (q.includes('wi-fi') || q.includes('wifi') || q.includes('network')) {
      return {
        text: 'Securing your Wi-Fi takes just a couple of simple checks.',
        structured: {
          whatHappened: 'You want to make sure your Wi-Fi connection is private and safe.',
          whyItMatters:
            'A protected Wi-Fi network keeps strangers from snooping on your internet activity.',
          whatShouldIDo: [
            'At home: Make sure your router uses WPA2 or WPA3 security with a strong password.',
            'In public (cafes/airports): Avoid logging into your bank on open Wi-Fi without a password—use mobile data instead.',
          ],
        },
      };
    }

    if (q.includes('hacked') || q.includes('account') || q.includes('password')) {
      return {
        text: 'Take a deep breath—we can secure your account step by step right now.',
        structured: {
          whatHappened: 'You are worried someone may have accessed your account.',
          whyItMatters:
            'Acting quickly lets you lock out unauthorized devices and keep your personal data safe.',
          whatShouldIDo: [
            '1. Change your password immediately using a strong, new password.',
            '2. Turn on Two-Factor Authentication (2FA) in your account security settings.',
            '3. Check "Active Sessions" or "Signed-in Devices" in that account and sign out unknown devices.',
          ],
        },
      };
    }

    return {
      text: 'I am here to help explain any digital safety question in plain, simple language.',
      structured: {
        whatHappened: `You asked: "${question}"`,
        whyItMatters:
          'Understanding digital safety in everyday language helps you stay confident and protected online.',
        whatShouldIDo: [
          'Use Check Website or Scan QR whenever you encounter an unfamiliar link.',
          'Review your Security Score on the Home Dashboard for personalized next steps.',
        ],
      },
    };
  },
};
