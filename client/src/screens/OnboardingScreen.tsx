import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/security';
import { SecurityPalette, Spacing, Radius } from '../theme/theme';
import {
  ShieldCheckIcon,
  WifiSignalIcon,
  GlobeLinkIcon,
  QrMatrixIcon,
  LockSlidersIcon,
} from '../components/SecurityIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface SlideData {
  title: string;
  description: string;
  iconSet: React.ReactNode;
}

const { width } = Dimensions.get('window');

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: SlideData[] = [
    {
      title: 'Stay Safe Online',
      description:
        'Cyber Companion helps you understand digital risks and make safer decisions.',
      iconSet: (
        <View style={styles.illustrationBox}>
          <View style={styles.outerGlow}>
            <View style={styles.mainShieldCenter}>
              <ShieldCheckIcon size={64} color="#2563EB" />
            </View>
          </View>
          <View style={[styles.floatingBadge, { top: 10, left: 24, backgroundColor: '#EFF6FF' }]}>
            <LockSlidersIcon size={24} color="#3B82F6" />
          </View>
          <View style={[styles.floatingBadge, { bottom: 12, right: 28, backgroundColor: '#ECFDF5' }]}>
            <GlobeLinkIcon size={24} color="#10B981" />
          </View>
        </View>
      ),
    },
    {
      title: 'Know Before You Click',
      description:
        'We check URLs, QR codes, Wi-Fi networks and apps for potential threats.',
      iconSet: (
        <View style={styles.illustrationBox}>
          <View style={styles.outerGlow}>
            <View style={styles.mainShieldCenter}>
              <GlobeLinkIcon size={60} color="#2563EB" />
            </View>
          </View>
          <View style={[styles.floatingBadge, { top: 12, right: 24, backgroundColor: '#EFF6FF' }]}>
            <WifiSignalIcon size={24} color="#0284C7" />
          </View>
          <View style={[styles.floatingBadge, { bottom: 10, left: 26, backgroundColor: '#F0FDFA' }]}>
            <QrMatrixIcon size={24} color="#0D9488" />
          </View>
        </View>
      ),
    },
    {
      title: 'Your Security, Made Simple',
      description:
        'Complex security information is turned into clear, simple actions so you stay protected.',
      iconSet: (
        <View style={styles.illustrationBox}>
          <View style={styles.outerGlow}>
            <View style={styles.mainShieldCenter}>
              <ShieldCheckIcon size={64} color="#10B981" />
            </View>
          </View>
          <View style={[styles.floatingBadge, { top: 14, left: 30, backgroundColor: '#FEF3C7' }]}>
            <LockSlidersIcon size={24} color="#D97706" />
          </View>
          <View style={[styles.floatingBadge, { bottom: 14, right: 30, backgroundColor: '#EFF6FF' }]}>
            <GlobeLinkIcon size={24} color="#2563EB" />
          </View>
        </View>
      ),
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      navigation.replace('SignIn');
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const slide = slides[currentSlide];

  return (
    <View style={styles.screen}>
      {/* TOP SKIP BUTTON */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }} />
        {currentSlide < slides.length - 1 && (
          <Pressable
            onPress={() => navigation.replace('SignIn')}
            hitSlop={12}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      {/* ILLUSTRATION CONTAINER */}
      <View style={styles.illustrationSection}>{slide.iconSet}</View>

      {/* TEXT CONTENT */}
      <View style={styles.textSection}>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideDescription}>{slide.description}</Text>
      </View>

      {/* PAGINATION DOTS */}
      <View style={styles.paginationRow}>
        {slides.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              currentSlide === idx ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actionRow}>
        {currentSlide > 0 ? (
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={handleNext}
          style={[
            styles.primaryBtn,
            currentSlide === 0 && { width: '100%' },
          ]}>
          <Text style={styles.primaryBtnText}>
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    height: 36,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  illustrationSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: width * 0.72,
  },
  illustrationBox: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerGlow: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainShieldCenter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  floatingBadge: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  textSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  slideDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: Spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 28,
    backgroundColor: '#2563EB',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#E2E8F0',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  backBtn: {
    flex: 1,
    height: 52,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
  },
  primaryBtn: {
    flex: 2,
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
