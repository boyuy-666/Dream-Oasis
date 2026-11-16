import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

interface Props {
  label: string;
  onPress: () => void;
  /** `primary` = Moonlight Blue fill; `secondary` = navy surface with silver border. */
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
}

export function Button({ label, onPress, variant = 'primary', disabled, loading, accessibilityHint }: Props) {
  const isPrimary = variant === 'primary';
  const inactive = disabled || loading;

  const handle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  const textColor = disabled ? colors.disabledText : isPrimary ? colors.onAccent : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={handle}
      style={({ pressed }) => [
        styles.base,
        disabled ? styles.disabled : isPrimary ? styles.primary : styles.secondary,
        pressed && !inactive && { opacity: 0.88, transform: [{ scale: 0.985 }] },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <AppText variant="body" color={textColor} style={styles.label}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primary: { backgroundColor: colors.accent, borderColor: colors.accent },
  secondary: { backgroundColor: colors.surfaceGlass, borderColor: colors.border },
  disabled: { backgroundColor: colors.disabledBg, borderColor: colors.border },
  label: { fontWeight: '600', letterSpacing: 0.3 },
});
