import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput as RNTextInput,
  Modal as RNModal,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import {
  SecurityPalette,
  Spacing,
  Radius,
  getScoreVisualMeta,
} from '../theme/theme';
import {
  PlainLanguageExplanation,
  SecurityStatusLevel,
  ThreatAlertCategory,
} from '../types/security';

/* ============================================================================
 * 1. REUSABLE BUTTONS (Primary, Secondary, Ghost, Danger, IconButton)
 * ========================================================================== */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface AppButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: ButtonVariant;
  readonly disabled?: boolean;
  readonly fullWidth?: boolean;
  readonly icon?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  icon,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: SecurityPalette.surfaceVariant,
          border: SecurityPalette.border,
          text: SecurityPalette.textPrimary,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: SecurityPalette.primary,
        };
      case 'danger':
        return {
          bg: SecurityPalette.critical,
          border: SecurityPalette.critical,
          text: '#FFFFFF',
        };
      default:
        return {
          bg: SecurityPalette.primary,
          border: SecurityPalette.primary,
          text: '#FFFFFF',
        };
    }
  };

  const v = getVariantStyle();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.buttonBase,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
        },
        fullWidth && styles.fullWidth,
      ]}>
      {icon ? <View style={styles.buttonIconWrap}>{icon}</View> : null}
      <Text style={[styles.buttonText, { color: v.text }]}>{label}</Text>
    </Pressable>
  );
};

export interface IconButtonProps {
  readonly icon: React.ReactNode;
  readonly accessibilityLabel: string;
  readonly onPress: () => void;
}

export const AppIconButton: React.FC<IconButtonProps> = ({
  icon,
  accessibilityLabel,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    style={({ pressed }) => [
      styles.iconButton,
      { opacity: pressed ? 0.8 : 1 },
    ]}>
    {icon}
  </Pressable>
);

/* ============================================================================
 * 2. REUSABLE INPUTS (Text, Password, Search, URL, Dropdown, OTP)
 * ========================================================================== */

export interface AppInputProps {
  readonly label?: string;
  readonly placeholder?: string;
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly type?: 'text' | 'password' | 'search' | 'url' | 'email';
  readonly helperText?: string;
  readonly errorText?: string;
  readonly rightActionLabel?: string;
  readonly onRightActionPress?: () => void;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  type = 'text',
  helperText,
  errorText,
  rightActionLabel,
  onRightActionPress,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <View style={styles.inputGroup}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          errorText ? { borderColor: SecurityPalette.critical } : null,
        ]}>
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={SecurityPalette.textMuted}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize={
            type === 'url' || type === 'email' || isPassword
              ? 'none'
              : 'sentences'
          }
          keyboardType={
            type === 'url'
              ? 'url'
              : type === 'email'
                ? 'email-address'
                : 'default'
          }
          style={styles.textInput}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.inputActionBtn}>
            <Text style={styles.inputActionText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        ) : null}
        {!isPassword && rightActionLabel && onRightActionPress ? (
          <Pressable onPress={onRightActionPress} style={styles.inputActionBtn}>
            <Text style={styles.inputActionText}>{rightActionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {errorText ? (
        <Text style={styles.inputErrorText}>{errorText}</Text>
      ) : helperText ? (
        <Text style={styles.inputHelperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

export interface OtpInputProps {
  readonly code: string;
  readonly onChangeCode: (newCode: string) => void;
  readonly length?: number;
}

export const AppOtpInput: React.FC<OtpInputProps> = ({
  code,
  onChangeCode,
  length = 6,
}) => {
  const digits = code.padEnd(length, ' ').slice(0, length).split('');

  return (
    <View style={styles.otpContainer}>
      <View style={styles.otpBoxesRow}>
        {digits.map((digit, index) => {
          const isFilled = digit.trim().length > 0;
          return (
            <View
              key={index}
              style={[
                styles.otpBox,
                isFilled && { borderColor: SecurityPalette.primary },
              ]}>
              <Text style={styles.otpDigit}>{digit.trim()}</Text>
            </View>
          );
        })}
      </View>
      <RNTextInput
        value={code}
        onChangeText={(txt) =>
          onChangeCode(txt.replace(/[^0-9]/g, '').slice(0, length))
        }
        keyboardType="number-pad"
        maxLength={length}
        placeholder="Enter 6-digit verification code"
        placeholderTextColor={SecurityPalette.textMuted}
        style={styles.otpHiddenInput}
      />
    </View>
  );
};

export interface DropdownProps {
  readonly label: string;
  readonly selectedValue: string;
  readonly options: readonly string[];
  readonly onSelect: (value: string) => void;
}

export const AppDropdown: React.FC<DropdownProps> = ({
  label,
  selectedValue,
  options,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        style={styles.dropdownHeader}>
        <Text style={styles.dropdownSelectedText}>{selectedValue}</Text>
        <Text style={styles.dropdownChevron}>{open ? '▲' : '▼'}</Text>
      </Pressable>
      {open ? (
        <View style={styles.dropdownList}>
          {options.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
              style={[
                styles.dropdownItem,
                opt === selectedValue && styles.dropdownItemActive,
              ]}>
              <Text
                style={[
                  styles.dropdownItemText,
                  opt === selectedValue && { color: SecurityPalette.primary },
                ]}>
                {opt}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
};

/* ============================================================================
 * 3. BADGE, PROGRESS BAR & SECURITY METER
 * ========================================================================== */

export interface StatusBadgeProps {
  readonly status: SecurityStatusLevel;
  readonly customLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  customLabel,
}) => {
  const config =
    status === 'SAFE'
      ? {
          color: SecurityPalette.safe,
          bg: SecurityPalette.safeSoft,
          text: customLabel ?? '✓ Good',
        }
      : status === 'ATTENTION'
        ? {
            color: SecurityPalette.warning,
            bg: SecurityPalette.warningSoft,
            text: customLabel ?? '⚠ Needs attention',
          }
        : {
            color: SecurityPalette.critical,
            bg: SecurityPalette.criticalSoft,
            text: customLabel ?? '● Action required',
          };

  return (
    <View
      style={[
        styles.badgePill,
        { backgroundColor: config.bg, borderColor: config.color },
      ]}>
      <Text style={[styles.badgeText, { color: config.color }]}>
        {config.text}
      </Text>
    </View>
  );
};

export interface ProgressBarProps {
  readonly value: number; // 0 - 100
  readonly label?: string;
  readonly showValue?: boolean;
  readonly colorOverride?: string;
}

export const AppProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showValue = true,
  colorOverride,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const meta = getScoreVisualMeta(clamped);
  const barColor = colorOverride ?? meta.color;

  return (
    <View style={styles.progressWrap}>
      {label || showValue ? (
        <View style={styles.progressHeader}>
          {label ? <Text style={styles.progressLabel}>{label}</Text> : null}
          {showValue ? (
            <Text style={[styles.progressValue, { color: barColor }]}>
              {clamped}%
            </Text>
          ) : null}
        </View>
      ) : null}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${clamped}%`, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
  );
};

/* ============================================================================
 * 4. STATUS CARD, QUICK ACTION & ACTIVITY ITEM
 * ========================================================================== */

export interface StatusCardProps {
  readonly title: string;
  readonly subtitle: string;
  readonly status: SecurityStatusLevel;
  readonly statusLabel?: string;
  readonly onPress?: () => void;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  subtitle,
  status,
  statusLabel,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress}
    style={({ pressed }) => [
      styles.statusCard,
      pressed && onPress ? { opacity: 0.9 } : null,
    ]}>
    <View style={styles.statusCardLeft}>
      <Text style={styles.statusCardTitle}>{title}</Text>
      <Text style={styles.statusCardSubtitle}>{subtitle}</Text>
    </View>
    <StatusBadge status={status} customLabel={statusLabel} />
  </Pressable>
);

export interface QuickActionCardProps {
  readonly title: string;
  readonly subtitle: string;
  readonly icon: React.ReactNode;
  readonly onPress: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`${title}. ${subtitle}`}
    style={({ pressed }) => [
      styles.quickActionCard,
      { opacity: pressed ? 0.88 : 1 },
    ]}>
    <View style={styles.quickActionIconBox}>{icon}</View>
    <Text style={styles.quickActionTitle}>{title}</Text>
    <Text style={styles.quickActionSubtitle} numberOfLines={2}>
      {subtitle}
    </Text>
  </Pressable>
);

export interface ActivityItemProps {
  readonly title: string;
  readonly subtitle: string;
  readonly status: SecurityStatusLevel;
  readonly statusLabel: string;
  readonly timestamp: string;
  readonly onPress?: () => void;
}

export const ActivityItemRow: React.FC<ActivityItemProps> = ({
  title,
  subtitle,
  status,
  statusLabel,
  timestamp,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress}
    style={styles.activityItemRow}>
    <View style={styles.activityTextCol}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activitySub}>
        {subtitle} • {timestamp}
      </Text>
    </View>
    <StatusBadge status={status} customLabel={statusLabel} />
  </Pressable>
);

/* ============================================================================
 * 5. SCAN RESULT CARD (3 UX Writing Questions + Progressive Disclosure)
 * ========================================================================== */

export interface ScanResultCardProps {
  readonly status: SecurityStatusLevel;
  readonly headline: string;
  readonly targetLabel?: string;
  readonly explanation: PlainLanguageExplanation;
  readonly primaryActionLabel?: string;
  readonly onPrimaryAction?: () => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({
  status,
  headline,
  targetLabel,
  explanation,
  primaryActionLabel,
  onPrimaryAction,
}) => {
  const [showTechnical, setShowTechnical] = useState(false);

  const meta =
    status === 'SAFE'
      ? {
          color: SecurityPalette.safe,
          bg: SecurityPalette.safeSoft,
          badge: '✓ Safe',
        }
      : status === 'ATTENTION'
        ? {
            color: SecurityPalette.warning,
            bg: SecurityPalette.warningSoft,
            badge: '⚠ Needs Attention',
          }
        : {
            color: SecurityPalette.critical,
            bg: SecurityPalette.criticalSoft,
            badge: '● Dangerous',
          };

  return (
    <View style={[styles.scanResultCard, { borderColor: meta.color }]}>
      <View style={styles.scanResultHeader}>
        <View
          style={[
            styles.scanStatusPill,
            { backgroundColor: meta.bg, borderColor: meta.color },
          ]}>
          <Text style={[styles.scanStatusPillText, { color: meta.color }]}>
            {meta.badge}
          </Text>
        </View>
        {explanation.isSimulated ? (
          <Text style={styles.simulatedTag}>Simulated Check</Text>
        ) : null}
      </View>

      <Text style={styles.scanResultHeadline}>{headline}</Text>
      {targetLabel ? (
        <Text style={styles.scanTargetLabel}>{targetLabel}</Text>
      ) : null}

      {/* 3 Core UX Writing Questions */}
      <View style={styles.uxQuestionsStack}>
        <View style={styles.uxBlock}>
          <Text style={styles.uxLabel}>WHAT HAPPENED?</Text>
          <Text style={styles.uxBody}>{explanation.whatHappened}</Text>
        </View>

        <View style={styles.uxBlock}>
          <Text style={styles.uxLabel}>WHY DOES IT MATTER?</Text>
          <Text style={styles.uxBody}>{explanation.whyItMatters}</Text>
        </View>

        <View style={[styles.uxBlock, { borderLeftColor: meta.color }]}>
          <Text style={[styles.uxLabel, { color: meta.color }]}>
            WHAT SHOULD I DO?
          </Text>
          {explanation.whatShouldIDo.map((step, idx) => (
            <Text key={idx} style={styles.uxActionBullet}>
              • {step}
            </Text>
          ))}
        </View>
      </View>

      {primaryActionLabel && onPrimaryAction ? (
        <View style={{ marginTop: Spacing.md }}>
          <AppButton
            label={primaryActionLabel}
            onPress={onPrimaryAction}
            variant={status === 'DANGER' ? 'danger' : 'primary'}
            fullWidth
          />
        </View>
      ) : null}

      {/* Progressive Disclosure: Technical Details */}
      {explanation.technicalDetails ? (
        <View style={styles.techDisclosureWrap}>
          <Pressable
            onPress={() => setShowTechnical((prev) => !prev)}
            style={styles.techToggleBtn}>
            <Text style={styles.techToggleText}>
              {showTechnical
                ? 'Hide technical details ↑'
                : 'Technical details →'}
            </Text>
          </Pressable>

          {showTechnical ? (
            <View style={styles.techPanel}>
              <Text style={styles.techSummary}>
                {explanation.technicalDetails.summary}
              </Text>
              {explanation.technicalDetails.facts.map((fact, index) => (
                <View key={index} style={styles.techFactRow}>
                  <Text style={styles.techFactLabel}>{fact.label}</Text>
                  <Text style={styles.techFactValue}>{fact.value}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

/* ============================================================================
 * 6. THREAT CARD, LOADING, EMPTY & ERROR STATES, MODAL
 * ========================================================================== */

export interface ThreatCardProps {
  readonly title: string;
  readonly severity: ThreatAlertCategory;
  readonly date: string;
  readonly description: string;
  readonly recommendedAction: string;
  readonly onPress: () => void;
}

export const ThreatCard: React.FC<ThreatCardProps> = ({
  title,
  severity,
  date,
  description,
  recommendedAction,
  onPress,
}) => {
  const color =
    severity === 'Critical' || severity === 'High'
      ? SecurityPalette.critical
      : severity === 'Medium'
        ? SecurityPalette.warning
        : severity === 'Resolved'
          ? SecurityPalette.safe
          : SecurityPalette.primary;

  return (
    <Pressable onPress={onPress} style={styles.threatCard}>
      <View style={styles.threatHeaderRow}>
        <View style={[styles.badgePill, { borderColor: color }]}>
          <Text style={[styles.badgeText, { color }]}>{severity}</Text>
        </View>
        <Text style={styles.threatDate}>{date}</Text>
      </View>
      <Text style={styles.threatTitle}>{title}</Text>
      <Text style={styles.threatDesc}>{description}</Text>
      <View style={styles.threatActionBox}>
        <Text style={styles.threatActionLabel}>What to do: </Text>
        <Text style={styles.threatActionText}>{recommendedAction}</Text>
      </View>
    </Pressable>
  );
};

export interface LoadingStateProps {
  readonly message: string;
  readonly subtext?: string;
}

export const LoadingStateView: React.FC<LoadingStateProps> = ({
  message,
  subtext = 'This only takes a moment.',
}) => (
  <View style={styles.stateBox}>
    <ActivityIndicator size="large" color={SecurityPalette.primary} />
    <Text style={styles.stateTitle}>{message}</Text>
    <Text style={styles.stateSub}>{subtext}</Text>
  </View>
);

export interface EmptyStateProps {
  readonly title: string;
  readonly message: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}

export const EmptyStateView: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
}) => (
  <View style={styles.stateBox}>
    <Text style={styles.stateTitle}>{title}</Text>
    <Text style={styles.stateSub}>{message}</Text>
    {actionLabel && onAction ? (
      <View style={{ marginTop: Spacing.md }}>
        <AppButton label={actionLabel} onPress={onAction} />
      </View>
    ) : null}
  </View>
);

export interface ErrorStateProps {
  readonly whatHappened: string;
  readonly whyItHappened: string;
  readonly whatToDoNext: string;
  readonly onRetry?: () => void;
}

export const ErrorStateView: React.FC<ErrorStateProps> = ({
  whatHappened,
  whyItHappened,
  whatToDoNext,
  onRetry,
}) => (
  <View style={[styles.stateBox, { borderColor: SecurityPalette.warning }]}>
    <Text style={[styles.stateTitle, { color: SecurityPalette.warning }]}>
      ⚠ {whatHappened}
    </Text>
    <Text style={styles.stateSub}>{whyItHappened}</Text>
    <Text style={[styles.stateSub, { color: SecurityPalette.textPrimary, marginTop: 6 }]}>
      Next step: {whatToDoNext}
    </Text>
    {onRetry ? (
      <View style={{ marginTop: Spacing.md }}>
        <AppButton label="Try Again" onPress={onRetry} variant="secondary" />
      </View>
    ) : null}
  </View>
);

export interface ConfirmModalProps {
  readonly visible: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly cancelLabel?: string;
  readonly isDanger?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
}) => (
  <RNModal visible={visible} transparent animationType="fade">
    <View style={styles.modalBackdrop}>
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>
        <View style={styles.modalActions}>
          <AppButton
            label={cancelLabel}
            onPress={onCancel}
            variant="secondary"
          />
          <AppButton
            label={confirmLabel}
            onPress={onConfirm}
            variant={isDanger ? 'danger' : 'primary'}
          />
        </View>
      </View>
    </View>
  </RNModal>
);

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: Radius.md,
    borderWidth: 1,
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  buttonIconWrap: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: SecurityPalette.surface,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: Spacing.lg,
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: SecurityPalette.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    color: SecurityPalette.textPrimary,
    fontSize: 15,
    paddingVertical: 10,
  },
  inputActionBtn: {
    paddingLeft: 10,
    paddingVertical: 6,
  },
  inputActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.primary,
  },
  inputHelperText: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
    marginTop: 5,
  },
  inputErrorText: {
    fontSize: 12,
    color: SecurityPalette.critical,
    marginTop: 5,
    fontWeight: '600',
  },
  otpContainer: {
    marginBottom: Spacing.lg,
    width: '100%',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  otpBox: {
    flex: 1,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: SecurityPalette.surfaceVariant,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigit: {
    fontSize: 20,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
  },
  otpHiddenInput: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    color: SecurityPalette.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    textAlign: 'center',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  dropdownSelectedText: {
    fontSize: 15,
    color: SecurityPalette.textPrimary,
    fontWeight: '600',
  },
  dropdownChevron: {
    fontSize: 11,
    color: SecurityPalette.textSecondary,
  },
  dropdownList: {
    marginTop: 4,
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: SecurityPalette.border,
  },
  dropdownItemActive: {
    backgroundColor: SecurityPalette.primarySoft,
  },
  dropdownItemText: {
    fontSize: 14,
    color: SecurityPalette.textPrimary,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressWrap: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: SecurityPalette.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.sm,
  },
  statusCardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  statusCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 2,
  },
  statusCardSubtitle: {
    fontSize: 13,
    color: SecurityPalette.textSecondary,
  },
  quickActionCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    minHeight: 130,
    justifyContent: 'space-between',
  },
  quickActionIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: SecurityPalette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 3,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
    lineHeight: 17,
  },
  activityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: SecurityPalette.border,
  },
  activityTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SecurityPalette.textPrimary,
    marginBottom: 2,
  },
  activitySub: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
  },
  scanResultCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    marginVertical: Spacing.md,
  },
  scanResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  scanStatusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  scanStatusPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  simulatedTag: {
    fontSize: 11,
    color: SecurityPalette.textMuted,
    fontWeight: '600',
  },
  scanResultHeadline: {
    fontSize: 20,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
  },
  scanTargetLabel: {
    fontSize: 13,
    color: SecurityPalette.interactive,
    marginBottom: Spacing.md,
  },
  uxQuestionsStack: {
    gap: 10,
    marginTop: Spacing.sm,
  },
  uxBlock: {
    backgroundColor: SecurityPalette.surfaceVariant,
    borderRadius: Radius.md,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: SecurityPalette.primary,
  },
  uxLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: SecurityPalette.primary,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  uxBody: {
    fontSize: 14,
    color: SecurityPalette.textPrimary,
    lineHeight: 20,
  },
  uxActionBullet: {
    fontSize: 14,
    color: SecurityPalette.textPrimary,
    lineHeight: 21,
    fontWeight: '500',
  },
  techDisclosureWrap: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: SecurityPalette.border,
  },
  techToggleBtn: {
    paddingVertical: 6,
  },
  techToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.interactive,
  },
  techPanel: {
    marginTop: 8,
    backgroundColor: SecurityPalette.background,
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  techSummary: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  techFactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: SecurityPalette.surfaceVariant,
  },
  techFactLabel: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
  },
  techFactValue: {
    fontSize: 12,
    fontWeight: '600',
    color: SecurityPalette.textPrimary,
  },
  threatCard: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    marginBottom: Spacing.md,
  },
  threatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  threatDate: {
    fontSize: 12,
    color: SecurityPalette.textSecondary,
  },
  threatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginBottom: 4,
  },
  threatDesc: {
    fontSize: 14,
    color: SecurityPalette.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  threatActionBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: SecurityPalette.surfaceVariant,
    padding: 10,
    borderRadius: Radius.sm,
  },
  threatActionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: SecurityPalette.safe,
  },
  threatActionText: {
    fontSize: 13,
    color: SecurityPalette.textPrimary,
  },
  stateBox: {
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
    alignItems: 'center',
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: SecurityPalette.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: 4,
    textAlign: 'center',
  },
  stateSub: {
    fontSize: 14,
    color: SecurityPalette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 11, 22, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: SecurityPalette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: SecurityPalette.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: SecurityPalette.textPrimary,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: SecurityPalette.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
});
