import {
  LearningTopic,
  ThreatAlertItem,
  SecurityNewsItem,
  QuizQuestion,
  ScanHistoryEntry,
  ActivityTimelineEntry,
  PrivacyPermissionCategory,
} from '../types/security';

export const LEARNING_TOPICS: readonly LearningTopic[] = [
  {
    id: 'phishing',
    title: 'Spotting Fake Emails & Text Links',
    category: 'Phishing',
    difficulty: 'Beginner',
    readingTime: '3 min read',
    summary: 'Learn how scammers impersonate banks, delivery services, and schools.',
    simpleExplanation:
      'Phishing is when someone sends a message pretending to be a company you trust—like your bank or a package delivery service—so you will click a link and type in your password.',
    realWorldExample:
      'You receive a text message at 9 PM saying: "Your parcel could not be delivered due to a $1.50 address fee. Pay within 2 hours at track-parcel-update-now.com."',
    warningSigns: [
      'Urgent countdowns or threats to close your account immediately',
      'Website addresses with extra words or dashes (like amazon-security-check.com)',
      'Generic greetings like "Dear Customer" instead of your name',
    ],
    whatToDo: [
      'Do not tap links inside unexpected text messages or emails.',
      'Paste the link into Cyber Companion’s Check Website tool first.',
      'Open the official app or type the company’s real website yourself.',
    ],
    keyTakeaways: [
      'Real banks and delivery companies will never rush you into paying a fee via text link.',
      'Taking 10 seconds to verify a web address prevents 95% of phishing scams.',
    ],
  },
  {
    id: 'public-wifi',
    title: 'Staying Safe on Cafe & Airport Wi-Fi',
    category: 'Public Wi-Fi',
    difficulty: 'Beginner',
    readingTime: '3 min read',
    summary: 'Understand when free public Wi-Fi is safe and when to avoid logging in.',
    simpleExplanation:
      'Open Wi-Fi networks that do not ask for a password allow anyone sitting nearby to connect to the same network. On unsecured connections, attackers can sometimes see unencrypted traffic.',
    realWorldExample:
      'At an airport gate, you see two networks: "Airport_Official_WiFi" and "Free_Fast_Airport_WiFi". The second one was created by a stranger’s laptop to watch travelers’ connections.',
    warningSigns: [
      'The Wi-Fi network has no lock icon and requires no password',
      'Multiple Wi-Fi networks have almost identical names',
      'Your browser shows a "Connection is Not Private" warning after connecting',
    ],
    whatToDo: [
      'Use Cyber Companion’s Check Wi-Fi tool before logging into sensitive accounts.',
      'Switch to mobile data (4G/5G) when checking your bank or paying bills.',
      'Turn off "Auto-Join" for open public networks.',
    ],
    keyTakeaways: [
      'Reading news on public Wi-Fi is fine, but banking is safer on mobile data.',
      'WPA2 and WPA3 networks protect your connection with a password.',
    ],
  },
  {
    id: 'password-safety',
    title: 'Creating Strong, Memorable Passwords',
    category: 'Password Safety',
    difficulty: 'Beginner',
    readingTime: '4 min read',
    summary: 'Why reusing the same password puts all your accounts at risk.',
    simpleExplanation:
      'If you use the same password for your email, shopping, and bank accounts, a leak at one small shopping website lets attackers unlock your email and bank too.',
    realWorldExample:
      'A recipe forum you joined 4 years ago suffers a data leak. Automated bots immediately test that same email and password on Gmail, Instagram, and PayPal.',
    warningSigns: [
      'Using the same password on more than one website',
      'Passwords shorter than 12 characters or containing birthdays/names',
      'Saving passwords in unencrypted notes',
    ],
    whatToDo: [
      'Use at least 12–16 characters or a 4-word passphrase.',
      'Never reuse your email password anywhere else.',
      'Enable Two-Factor Authentication (2FA) on email and banking.',
    ],
    keyTakeaways: [
      'Length beats complexity—a long phrase is harder to guess than a short word.',
      'Unique passwords stop one website breach from affecting your whole digital life.',
    ],
  },
  {
    id: 'social-engineering',
    title: 'Recognizing Impersonation & Phone Scams',
    category: 'Social Engineering',
    difficulty: 'Intermediate',
    readingTime: '4 min read',
    summary: 'How scammers use friendliness or authority to ask for verification codes.',
    simpleExplanation:
      'Social engineering tricks people rather than hacking devices. Scammers pretend to be tech support, bank fraud staff, or even a family member in trouble.',
    realWorldExample:
      'Someone calls claiming to be from your bank’s fraud department and says: "We just sent a 6-digit code to your phone—read it to me so we can cancel a fraudulent transfer."',
    warningSigns: [
      'Anyone asking you to read back a 6-digit verification code sent to your phone',
      'Callers asking you to install remote screen-sharing apps',
      'Requests for payment via gift cards, crypto, or instant wire transfers',
    ],
    whatToDo: [
      'Never share a One-Time Password (OTP) with anyone—even if they claim to be your bank.',
      'Hang up and call the number printed on the back of your bank card.',
    ],
    keyTakeaways: [
      'Verification codes are only for when YOU are signing in.',
      'Hanging up to verify independently is always the safest move.',
    ],
  },
  {
    id: 'malware',
    title: 'Avoiding Fake Apps & Hidden Malware',
    category: 'Malware',
    difficulty: 'Beginner',
    readingTime: '3 min read',
    summary: 'How malicious software hides inside free utilities and fake updates.',
    simpleExplanation:
      'Malware is harmful software disguised as a useful app—such as a free PDF reader, flashlight, or fake browser update—that secretly reads your data.',
    realWorldExample:
      'A pop-up website says "Your phone has 3 viruses! Download Cleaner Pro now." Installing that app gives it permission to read your SMS notifications.',
    warningSigns: [
      'Websites showing scary pop-ups claiming your phone is infected',
      'Apps downloaded outside the official Google Play Store or App Store',
      'Simple utility apps asking to read your SMS or Contacts',
    ],
    whatToDo: [
      'Close browser tabs that display fake virus alerts.',
      'Only install apps from official app stores and review their permissions.',
    ],
    keyTakeaways: [
      'Websites cannot scan your phone for viruses—those pop-ups are always fake.',
      'Keep your phone operating system updated automatically.',
    ],
  },
  {
    id: 'ransomware',
    title: 'What Is Ransomware & How Backups Protect You',
    category: 'Ransomware',
    difficulty: 'Intermediate',
    readingTime: '4 min read',
    summary: 'How attackers lock personal photos and files, and how cloud backups stop them.',
    simpleExplanation:
      'Ransomware is a type of malware that locks your photos and documents and demands money to unlock them.',
    realWorldExample:
      'Opening an email attachment named "Invoice_Overdue.zip" on a home computer locks all family photos on the hard drive.',
    warningSigns: [
      'Unexpected .zip or .exe attachments from unknown senders',
      'Files suddenly changing their extension or refusing to open',
    ],
    whatToDo: [
      'Keep automatic cloud or external backups of important photos and documents.',
      'Never open unexpected attachments from people you do not know.',
    ],
    keyTakeaways: [
      'If your files are backed up safely, ransomware loses its power over you.',
    ],
  },
  {
    id: 'identity-theft',
    title: 'Protecting Your Personal Identity Online',
    category: 'Identity Theft',
    difficulty: 'Intermediate',
    readingTime: '4 min read',
    summary: 'Keep your ID numbers, home address, and personal documents safe.',
    simpleExplanation:
      'Identity theft happens when someone collects enough of your personal details—like your full name, date of birth, and ID number—to impersonate you.',
    realWorldExample:
      'A fake job application form asks for a photo of your government ID and bank account number before you even have an interview.',
    warningSigns: [
      'Forms asking for government ID numbers without a clear legal reason',
      'Public social media quizzes asking for your mother’s maiden name or first pet',
    ],
    whatToDo: [
      'Share ID documents only through verified official portals.',
      'Limit what personal milestones you make public on social profiles.',
    ],
    keyTakeaways: [
      'Treat photos of your ID card with the same care as your bank card.',
    ],
  },
  {
    id: 'online-scams',
    title: 'Shopping, Marketplace &QR Code Scams',
    category: 'Online Scams',
    difficulty: 'Advanced',
    readingTime: '4 min read',
    summary: 'Stay safe when buying online, scanning QR codes, or selling secondhand items.',
    simpleExplanation:
      'Online scammers create fake stores with huge discounts or send QR codes claiming you need to scan them to "receive" a payment.',
    realWorldExample:
      'A buyer on an online marketplace says they already paid and sends you a QR code to "claim your funds," which actually authorizes a payment FROM your account.',
    warningSigns: [
      'Anyone asking you to scan a QR code or enter your PIN to RECEIVE money',
      'Brand-new online stores offering 80% off luxury electronics',
    ],
    whatToDo: [
      'Remember: You never need to enter your UPI/bank PIN or scan a QR code to receive money.',
      'Scan unfamiliar QR codes with Cyber Companion first.',
    ],
    keyTakeaways: [
      'Scanning a payment QR code is only for paying money out—never for receiving money.',
    ],
  },
];

export const THREAT_ALERTS: readonly ThreatAlertItem[] = [
  {
    id: 'alert-01',
    title: 'Fake Package Delivery SMS Links Active in Your Region',
    severity: 'Critical',
    date: 'Today, 09:15 AM',
    summary: 'Scammers are sending text messages claiming a parcel needs an address update.',
    affectedArea: 'SMS & Messaging Links',
    explanation: {
      whatHappened:
        'A wave of fraudulent text messages pretending to be postal and courier services is circulating today.',
      whyItMatters:
        'The link leads to a realistic fake page designed to steal credit card numbers under the excuse of a $1.99 redelivery fee.',
      whatShouldIDo: [
        'Delete any text message asking for a small fee to deliver a package.',
        'Paste any tracking link into Cyber Companion’s URL Scanner before opening it.',
      ],
      technicalDetails: {
        summary: 'Multiple newly registered lookalike domains (.top, .xyz) flagged by Google Safe Browsing and URLScan.io.',
        facts: [
          { label: 'Threat Type', value: 'SMS Phishing (Smishing)' },
          { label: 'Domain Age', value: 'Less than 48 hours old' },
          { label: 'Detection Engines', value: 'VirusTotal & Safe Browsing' },
        ],
      },
    },
  },
  {
    id: 'alert-02',
    title: '2 Installed Apps Have Unused Microphone & Contact Access',
    severity: 'High',
    date: 'Yesterday, 06:40 PM',
    summary: 'Utility apps on your device can access permissions they do not need.',
    affectedArea: 'Device Privacy',
    explanation: {
      whatHappened:
        'Two utility apps (Flashlight Ultra LED and Quick PDF Scanner) currently hold permissions to access your Microphone and Contacts.',
      whyItMatters:
        'Simple utility apps do not need your contacts or microphone to work. Keeping those permissions open increases privacy risk.',
      whatShouldIDo: [
        'Open Privacy Center in Cyber Companion.',
        'Change Microphone and Contacts access for those apps to "Denied".',
      ],
      technicalDetails: {
        summary: 'Android Package Manager manifest inspection flagged android.permission.RECORD_AUDIO and READ_CONTACTS.',
        facts: [
          { label: 'Flagged Packages', value: '2 installed applications' },
          { label: 'Permissions', value: 'RECORD_AUDIO, READ_CONTACTS' },
        ],
      },
    },
  },
  {
    id: 'alert-03',
    title: 'Public Cafe Wi-Fi Was Connected Without Encryption',
    severity: 'Medium',
    date: 'Sep 28, 2026',
    summary: 'You recently joined an open hotspot ("CoffeeHouse_Free") with no password.',
    affectedArea: 'Network Security',
    explanation: {
      whatHappened:
        'Your device connected to an open public Wi-Fi network that does not encrypt wireless traffic.',
      whyItMatters:
        'Other people on the same open Wi-Fi network could potentially observe unencrypted web activity.',
      whatShouldIDo: [
        'Forget open networks you no longer use.',
        'Use mobile data when signing into banking or personal email away from home.',
      ],
    },
  },
  {
    id: 'alert-04',
    title: 'Monthly Password Hygiene Reminder',
    severity: 'Low',
    date: 'Sep 25, 2026',
    summary: 'It has been 90 days since you last reviewed your main email security settings.',
    affectedArea: 'Password Security',
    explanation: {
      whatHappened: 'Routine 90-day security check-in for your primary accounts.',
      whyItMatters: 'Keeping Two-Factor Authentication active on your email protects all linked accounts.',
      whatShouldIDo: ['Verify that 2FA is enabled on your primary email account.'],
    },
  },
  {
    id: 'alert-05',
    title: 'Suspicious QR Redirect Blocked',
    severity: 'Resolved',
    date: 'Sep 22, 2026',
    summary: 'Cyber Companion stopped a shortened QR link from opening automatically.',
    affectedArea: 'QR Scanner',
    explanation: {
      whatHappened: 'A scanned QR code pointed to an untrusted redirect link and was safely cancelled.',
      whyItMatters: 'Stopping the redirect prevented your browser from visiting a deceptive giveaway page.',
      whatShouldIDo: ['No further action needed—this threat was resolved safely.'],
    },
  },
];

export const SECURITY_NEWS: readonly SecurityNewsItem[] = [
  {
    id: 'news-01',
    title: 'Why Passkeys & Biometrics Are Replacing Traditional Passwords',
    date: 'Sep 30, 2026',
    readTime: '2 min read',
    summary:
      'Major apps now let you sign in with your fingerprint or face instead of typing a password that could be stolen in a phishing scam.',
    takeaway: 'Turn on fingerprint or face sign-in whenever your banking or email app offers it.',
  },
  {
    id: 'news-02',
    title: 'How to Spot Fake Restaurant & Parking Meter QR Stickers',
    date: 'Sep 27, 2026',
    readTime: '3 min read',
    summary:
      'Cities have reported scammers placing counterfeit QR code stickers over public parking meters to collect credit card details.',
    takeaway: 'Always inspect the website address inside Cyber Companion before paying via QR code.',
  },
  {
    id: 'news-03',
    title: 'Android & Browser Updates Fix Important Privacy Gaps',
    date: 'Sep 24, 2026',
    readTime: '2 min read',
    summary:
      'Keeping automatic updates turned on ensures your phone and web browser stay protected against newly discovered security bugs.',
    takeaway: 'Enable automatic system updates in your phone settings.',
  },
];

export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 'q1',
    question:
      'You receive a text message saying your package delivery is delayed and asking you to pay a $1.50 fee via a link. What should you do?',
    options: [
      'Tap the link quickly so the package is not returned',
      'Do not tap the link; check the URL in Cyber Companion or open the official courier app',
      'Reply to the text asking for more details',
    ],
    correctIndex: 1,
    plainExplanation:
      'Delivery fee texts are one of the most common phishing tricks. Always check links in Cyber Companion or use the official delivery app directly.',
  },
  {
    id: 'q2',
    question:
      'Someone calls claiming to be from your bank’s fraud team and asks you to read the 6-digit code just texted to your phone. Is it safe to share?',
    options: [
      'Yes, if the caller sounds professional and knows my name',
      'No—never share a 6-digit verification code with anyone who calls or texts you',
      'Only if they promise to reverse a charge immediately',
    ],
    correctIndex: 1,
    plainExplanation:
      'Real bank staff will NEVER ask you to read back a verification code. That code allows an attacker to sign into your account.',
  },
  {
    id: 'q3',
    question:
      'You are at a coffee shop connected to "Free_Cafe_WiFi" (no password required). Which activity is safest to wait and do on mobile data instead?',
    options: [
      'Checking today’s weather forecast',
      'Logging into your online banking to transfer money',
      'Reading a public news article',
    ],
    correctIndex: 1,
    plainExplanation:
      'Open public Wi-Fi without a password is not encrypted. Sensitive tasks like banking are much safer on mobile data or a WPA2/WPA3 network.',
  },
  {
    id: 'q4',
    question:
      'A simple flashlight app asks for permission to read your Contacts and Microphone. What is the best choice?',
    options: [
      'Allow it so the app runs faster',
      'Deny those permissions—a flashlight only needs the camera flash',
      'Ignore it because all apps ask for contacts',
    ],
    correctIndex: 1,
    plainExplanation:
      'Apps should only have permissions that match what they actually do. A flashlight never needs your microphone or contacts.',
  },
  {
    id: 'q5',
    question:
      'You are selling an item online and the buyer sends you a QR code saying: "Scan this and enter your PIN to receive $50." What happens if you do?',
    options: [
      'You receive $50 into your account',
      'Money is sent OUT of your account—you never scan a QR code or enter a PIN to receive money',
      'Your bank verifies your identity',
    ],
    correctIndex: 1,
    plainExplanation:
      'Payment QR codes and PINs are only used to SEND money out. Anyone asking you to scan a QR code to receive money is running a scam.',
  },
];

export const INITIAL_SCAN_HISTORY: readonly ScanHistoryEntry[] = [];

export const INITIAL_ACTIVITY_TIMELINE: readonly ActivityTimelineEntry[] = [
  {
    id: 'act-init',
    title: 'Cyber Companion Protection Active',
    subtitle: 'Real-time link, Wi-Fi, and permission monitors running',
    status: 'SAFE',
    statusLabel: 'Safe',
    timestamp: 'Just now',
    routeTarget: 'Dashboard',
  },
];

export const INITIAL_PRIVACY_PERMISSIONS: readonly PrivacyPermissionCategory[] = [
  {
    id: 'camera',
    name: 'Camera',
    status: 'Limited',
    appsCount: 0,
    plainDescription: 'Only accessible when you take a photo or scan a QR code.',
    flaggedApps: [],
  },
  {
    id: 'microphone',
    name: 'Microphone',
    status: 'Denied',
    appsCount: 0,
    plainDescription: 'Microphone access is restricted to prevent background audio capture.',
    flaggedApps: [],
  },
  {
    id: 'location',
    name: 'Location',
    status: 'Limited',
    appsCount: 0,
    plainDescription: 'Shared only when actively using maps or network diagnostics.',
    flaggedApps: [],
  },
  {
    id: 'contacts',
    name: 'Contacts',
    status: 'Denied',
    appsCount: 0,
    plainDescription: 'Address book access is protected from third-party harvesting.',
    flaggedApps: [],
  },
  {
    id: 'storage',
    name: 'Storage',
    status: 'Limited',
    appsCount: 0,
    plainDescription: 'Scoped storage enabled. Apps can only access files you select.',
    flaggedApps: [],
  },
  {
    id: 'notifications',
    name: 'Notifications',
    status: 'Allowed',
    appsCount: 0,
    plainDescription: 'Security alerts and threat warnings are active.',
    flaggedApps: [],
  },
  {
    id: 'sms',
    name: 'SMS & Messages',
    status: 'Denied',
    appsCount: 0,
    plainDescription: 'SMS permission is restricted to prevent OTP and verification code interception.',
    flaggedApps: [],
  },
];
