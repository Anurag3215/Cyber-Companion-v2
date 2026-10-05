import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import {
  AppButton,
  AppInput,
  AppOtpInput,
} from '../design-system/components';
import { ShieldCheckIcon } from '../components/SecurityIcons';
import { useSecurityStore } from '../store/useSecurityStore';

/* ============================================================================
 * 1. SPLASH SCREEN (/splash) — Screen 1 in Design System
 * ========================================================================== */
type SplashProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<SplashProps> = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.splashScreen}>
      <View style={styles.splashContentCenter}>
        <View style={styles.splashShieldOuter}>
          <View style={styles.splashShieldInner}>
            <ShieldCheckIcon size={64} color="#38BDF8" />
          </View>
        </View>
        <Text style={styles.splashTitle}>Cyber Companion</Text>
        <Text style={styles.splashSubtitle}>
          Your Personal Cybersecurity{'\n'}Awareness & Protection Assistant
        </Text>
      </View>

      <View style={styles.splashBottomBar}>
        <View style={styles.splashLoadingLine} />
      </View>
    </View>
  );
};

/* ============================================================================
 * 2. WELCOME SCREEN (/welcome)
 * ========================================================================== */
type WelcomeProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<WelcomeProps> = ({ navigation }) => {
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.authScroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeCard}>
          <View style={styles.logoCircleLarge}>
            <ShieldCheckIcon size={38} color={SecurityPalette.primary} />
          </View>
          <Text style={styles.brandTitle}>Cyber Companion</Text>
          <Text style={styles.brandTagline}>Stay Safe. Simply.</Text>
          <Text style={styles.welcomeDescription}>
            Your calm, everyday cybersecurity assistant. Check websites, QR
            codes, Wi-Fi networks, and app privacy in plain, human language.
          </Text>

          <View style={styles.pillarList}>
            <View style={styles.pillarItem}>
              <Text style={styles.pillarCheck}>✓</Text>
              <Text style={styles.pillarText}>
                Check unfamiliar links and QR codes before opening them
              </Text>
            </View>
            <View style={styles.pillarItem}>
              <Text style={styles.pillarCheck}>✓</Text>
              <Text style={styles.pillarText}>
                Understand your Wi-Fi and device privacy without technical jargon
              </Text>
            </View>
            <View style={styles.pillarItem}>
              <Text style={styles.pillarCheck}>✓</Text>
              <Text style={styles.pillarText}>
                Ask Cyber Assistant any digital safety question anytime
              </Text>
            </View>
          </View>

          <View style={styles.buttonStack}>
            <AppButton
              label="Sign In"
              onPress={() => navigation.navigate('SignIn')}
              variant="primary"
              fullWidth
            />
            <AppButton
              label="Onboarding Tour"
              onPress={() => navigation.navigate('Onboarding')}
              variant="secondary"
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/* ============================================================================
 * 3. SIGN IN SCREEN (/signin) — Screen 5 in Design System
 * ========================================================================== */
type SignInProps = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export const SignInScreen: React.FC<SignInProps> = ({ navigation }) => {
  const signIn = useSecurityStore((state) => state.signIn);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('user@cybercompanion.app');
  const [password, setPassword] = useState('SafeUser#2026');
  const [error, setError] = useState('');

  const handleSignIn = () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }
    setError('');
    signIn(email);
  };

  const handleSocialSignIn = (provider: string) => {
    signIn(`${provider.toLowerCase()}@cybercompanion.app`);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.authScroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.authCard}>
          <View style={styles.logoCircleMedium}>
            <ShieldCheckIcon size={36} color="#2563EB" />
          </View>
          <Text style={styles.authBrandTitle}>Cyber Companion</Text>
          <Text style={styles.authTitle}>Welcome Back</Text>
          <Text style={styles.authSubtitle}>
            Sign in to continue to your secure space.
          </Text>

          {/* SOCIAL SSO BUTTONS (Screen 5) */}
          <View style={styles.ssoStack}>
            <Pressable
              onPress={() => handleSocialSignIn('Google')}
              style={styles.ssoButton}>
              <Text style={styles.ssoIconGoogle}>G</Text>
              <Text style={styles.ssoButtonText}>Continue with Google</Text>
            </Pressable>

            <Pressable
              onPress={() => handleSocialSignIn('Apple')}
              style={styles.ssoButton}>
              <Text style={styles.ssoIconApple}></Text>
              <Text style={styles.ssoButtonText}>Continue with Apple</Text>
            </Pressable>
          </View>

          <View style={styles.orDividerRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          {!showEmailForm ? (
            <Pressable
              onPress={() => setShowEmailForm(true)}
              style={styles.continueEmailBtn}>
              <Text style={styles.continueEmailIcon}>✉</Text>
              <Text style={styles.continueEmailText}>Continue with Email</Text>
            </Pressable>
          ) : (
            <View style={styles.emailFormContainer}>
              <AppInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
              />

              <AppInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                errorText={error || undefined}
              />

              <Pressable
                onPress={() => navigation.navigate('ForgotPassword')}
                style={{ alignSelf: 'flex-end', marginBottom: Spacing.md }}>
                <Text style={styles.linkText}>Forgot password?</Text>
              </Pressable>

              <AppButton
                label="Sign In"
                onPress={handleSignIn}
                variant="primary"
                fullWidth
              />
            </View>
          )}

          <Pressable
            onPress={() => signIn('guest@cybercompanion.app')}
            style={styles.guestLink}>
            <Text style={styles.guestLinkText}>Continue as Guest →</Text>
          </Pressable>

          <View style={styles.authFooterNotice}>
            <Text style={styles.authFooterText}>
              Your security and privacy are our priority
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/* ============================================================================
 * 4. SIGN UP SCREEN (/signup)
 * ========================================================================== */
type SignUpProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC<SignUpProps> = ({ navigation }) => {
  const signUp = useSecurityStore((state) => state.signUp);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [error, setError] = useState('');

  const handleCreateAccount = () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in your name, email address, and password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }
    if (!acceptedTerms) {
      setError('Please accept the Terms & Privacy Promise to continue.');
      return;
    }
    setError('');
    signUp(fullName, email);
    navigation.navigate('Verify', { email });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.authScroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Create your account</Text>
          <Text style={styles.authSubtitle}>
            Start protecting your digital life in plain language.
          </Text>

          <AppInput
            label="Full name"
            placeholder="Anurag Sharma"
            value={fullName}
            onChangeText={setFullName}
          />

          <AppInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
          />

          <AppInput
            label="Password"
            type="password"
            placeholder="At least 12 characters recommended"
            value={password}
            onChangeText={setPassword}
          />

          <AppInput
            label="Confirm password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            errorText={error || undefined}
          />

          <Pressable
            onPress={() => setAcceptedTerms((prev) => !prev)}
            style={[styles.checkboxRow, { marginBottom: Spacing.lg }]}>
            <View
              style={[
                styles.checkbox,
                acceptedTerms && styles.checkboxChecked,
              ]}>
              {acceptedTerms ? (
                <Text style={styles.checkboxTick}>✓</Text>
              ) : null}
            </View>
            <Text style={styles.checkboxLabel}>
              I agree to the Terms of Service and Privacy Promise
            </Text>
          </Pressable>

          <AppButton
            label="Create Account"
            onPress={handleCreateAccount}
            variant="primary"
            fullWidth
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.linkText}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/* ============================================================================
 * 5. FORGOT PASSWORD SCREEN (/forgot-password)
 * ========================================================================== */
type ForgotProps = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<ForgotProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.authScroll}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Reset your password</Text>
          <Text style={styles.authSubtitle}>
            Enter your email address and we will send you a safe link to choose a
            new password.
          </Text>

          <AppInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
          />

          {sent ? (
            <View style={styles.sentBanner}>
              <Text style={styles.sentBannerText}>
                ✓ Reset link sent! Check your inbox or continue to verification.
              </Text>
            </View>
          ) : null}

          <View style={styles.buttonStack}>
            <AppButton
              label="Send reset link"
              onPress={() => setSent(true)}
              variant="primary"
              fullWidth
            />
            <AppButton
              label="Back to Sign In"
              onPress={() => navigation.navigate('SignIn')}
              variant="ghost"
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/* ============================================================================
 * 6. VERIFICATION (OTP) SCREEN (/verify)
 * ========================================================================== */
type VerifyProps = NativeStackScreenProps<RootStackParamList, 'Verify'>;

export const VerifyScreen: React.FC<VerifyProps> = ({ route }) => {
  const verifyOtpAndSignIn = useSecurityStore(
    (state) => state.verifyOtpAndSignIn,
  );
  const pendingEmail = useSecurityStore(
    (state) => state.pendingVerificationEmail,
  );
  const targetEmail = route.params?.email || pendingEmail;

  const [code, setCode] = useState('482910');
  const [resentMessage, setResentMessage] = useState('');

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.authScroll}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Verify your email</Text>
          <Text style={styles.authSubtitle}>
            We sent a 6-digit verification code to {targetEmail}.
          </Text>

          <AppOtpInput code={code} onChangeCode={setCode} />

          {resentMessage ? (
            <Text style={styles.resentText}>{resentMessage}</Text>
          ) : null}

          <View style={styles.buttonStack}>
            <AppButton
              label="Continue"
              onPress={verifyOtpAndSignIn}
              variant="primary"
              fullWidth
            />
            <AppButton
              label="Resend code"
              onPress={() =>
                setResentMessage('✓ A fresh 6-digit code has been sent.')
              }
              variant="secondary"
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SecurityPalette.background,
  },
  centerScreen: {
    flex: 1,
    backgroundColor: SecurityPalette.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  welcomeCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    alignItems: 'center',
  },
  authCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  logoCircleLarge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: SecurityPalette.primarySoft,
    borderWidth: 1,
    borderColor: SecurityPalette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoCircleSmall: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: SecurityPalette.primarySoft,
    borderWidth: 1,
    borderColor: SecurityPalette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 16,
    fontWeight: '600',
    color: SecurityPalette.interactive,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 15,
    color: SecurityPalette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  pillarList: {
    width: '100%',
    gap: 10,
    marginBottom: Spacing.xl,
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: SecurityPalette.surfaceVariant,
    padding: 12,
    borderRadius: Radius.md,
    gap: 10,
  },
  pillarCheck: {
    fontSize: 15,
    fontWeight: '800',
    color: SecurityPalette.safe,
  },
  pillarText: {
    flex: 1,
    fontSize: 13.5,
    color: SecurityPalette.textPrimary,
    lineHeight: 19,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 6,
  },
  authSubtitle: {
    fontSize: 14,
    color: SecurityPalette.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: SecurityPalette.border,
    backgroundColor: SecurityPalette.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: SecurityPalette.primary,
    backgroundColor: SecurityPalette.primary,
  },
  checkboxTick: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  checkboxLabel: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    flexShrink: 1,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.primary,
  },
  buttonStack: {
    width: '100%',
    gap: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerPrompt: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
  },
  sentBanner: {
    backgroundColor: SecurityPalette.safeSoft,
    borderColor: SecurityPalette.safe,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: Spacing.md,
  },
  sentBannerText: {
    fontSize: 13,
    color: SecurityPalette.safe,
    fontWeight: '600',
  },
  resentText: {
    fontSize: 13,
    color: SecurityPalette.safe,
    marginBottom: Spacing.md,
    textAlign: 'center',
    fontWeight: '600',
  },
  /* Screen 1: Splash Screen Styles */
  splashScreen: {
    flex: 1,
    backgroundColor: '#07101E',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  splashContentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashShieldOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  splashShieldInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.5)',
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  splashSubtitle: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
  },
  splashBottomBar: {
    width: 180,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  splashLoadingLine: {
    width: '65%',
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 2,
  },
  /* Screen 5: Login & SSO Styles */
  logoCircleMedium: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  authBrandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 4,
  },
  ssoStack: {
    width: '100%',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  ssoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  ssoIconGoogle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EA4335',
  },
  ssoIconApple: {
    fontSize: 20,
    color: '#0F172A',
  },
  ssoButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  continueEmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    gap: 10,
    marginBottom: Spacing.md,
  },
  continueEmailIcon: {
    fontSize: 18,
    color: '#475569',
  },
  continueEmailText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  emailFormContainer: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  guestLink: {
    alignSelf: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  guestLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  authFooterNotice: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  authFooterText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
