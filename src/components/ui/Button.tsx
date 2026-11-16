import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { colors, gradients, radius, spacing } from '@/theme';
import { AppText } from './AppText';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ label, onPress, variant = 'primary', disabled, loading }: Props) {
  const handle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled || loading}
      onPress={handle}
      style={({ pressed }) => [styles.wrap, { opacity: disabled ? 0.45 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
    >
      {isPrimary ? (
        <LinearGradient colors={gradients.gold} style={styles.inner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {loading ? <ActivityIndicator color={colors.midnight} /> : <AppText variant="body" color={colors.midnight} style={styles.label}>{label}</AppText>}
        </LinearGradient>
      ) : (
        <View style={[styles.inner, styles.ghost]}>
          <AppText variant="body" color={colors.lavenderSoft} style={styles.label}>{label}</AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.pill, overflow: 'hidden' },
  inner: { paddingVertical: 15, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  ghost: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass },
  label: { fontWeight: '600', letterSpacing: 0.4 },
});
