import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

interface Props {
  label: string;
  onPress: () => void;
  /** primary = Glow fill (main action only); secondary = outlined; quiet = text only. */
  variant?: 'primary' | 'secondary' | 'quiet';
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  accessibilityHint?: string;
}

export function Button({ label, onPress, variant = 'primary', icon, disabled, loading, loadingLabel, accessibilityHint }: Props) {
  const isPrimary = variant === 'primary';
  const inactive = disabled || loading;
  const textColor = disabled ? colors.disabledText : isPrimary ? colors.onAccent : variant === 'quiet' ? colors.textSecondary : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); onPress(); }}
      style={({ pressed }) => [
        styles.base,
        variant === 'quiet' ? styles.quiet : disabled ? styles.disabled : isPrimary ? styles.primary : styles.secondary,
        pressed && !inactive && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.row}>
        {loading ? <ActivityIndicator color={textColor} /> : icon ? <Icon name={icon} size={18} color={textColor} /> : null}
        <AppText variant="button" color={textColor}>{loading && loadingLabel ? loadingLabel : label}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, paddingHorizontal: spacing.lg, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  primary: {
    backgroundColor: colors.accent,
    shadowColor: colors.glow, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 8 },
  },
  secondary: { borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'transparent' },
  quiet: { minHeight: 44, paddingHorizontal: spacing.sm },
  disabled: { backgroundColor: colors.disabledBg, borderWidth: 1, borderColor: colors.border },
});
