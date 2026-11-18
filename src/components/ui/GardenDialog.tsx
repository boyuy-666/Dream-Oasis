import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

interface Props {
  visible: boolean;
  title: string;
  description: string;
  /** Backdrop tap and Android back: always the safe, non-destructive choice. */
  onDismiss: () => void;
  dismissLabel: string;
  children: React.ReactNode;
}

/**
 * Night Garden dialog shell (greenhouse panel on a moss scrim) shared by the Record draft dialogs.
 * The entrance animation is skipped when Reduce Motion is on.
 */
export function GardenDialog({ visible, title, description, onDismiss, dismissLabel, children }: Props) {
  const [enter] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!visible) return;
    enter.setValue(0);
    let anim: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        anim = Animated.timing(enter, { toValue: 1, duration: reduced ? 0 : 260, easing: Easing.out(Easing.cubic), useNativeDriver: true });
        anim.start();
      })
      .catch(() => enter.setValue(1));
    return () => anim?.stop();
  }, [visible, enter]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityLabel={dismissLabel} accessibilityRole="button" />
        <Animated.View
          accessibilityViewIsModal
          style={[styles.panel, {
            opacity: enter,
            transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }, { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }],
          }]}
        >
          <View style={styles.copy}>
            <AppText variant="title" accessibilityRole="header">{title}</AppText>
            <AppText variant="body" color={colors.textSecondary}>{description}</AppText>
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

/** Danger-styled text action used for discard choices. */
export function DangerAction({ label, hint, onPress, busy, busyLabel, disabled }: {
  label: string; hint: string; onPress: () => void; busy?: boolean; busyLabel?: string; disabled?: boolean;
}) {
  const off = disabled || busy;
  return (
    <Pressable
      onPress={() => { if (!off) onPress(); }}
      disabled={off}
      style={({ pressed }) => [styles.danger, (pressed || off) && { opacity: 0.6 }]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!off, busy: !!busy }}
    >
      <AppText style={styles.dangerText}>{busy && busyLabel ? busyLabel : label}</AppText>
    </Pressable>
  );
}

/** Inline, accessible error inside a dialog. */
export function DialogError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.errorRow} accessibilityRole="alert" accessibilityLiveRegion="assertive">
      <Icon name="alert" size={16} color={colors.danger} />
      <AppText variant="caption" color={colors.danger} style={{ flex: 1 }}>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, backgroundColor: colors.scrim },
  panel: {
    width: '100%',
    maxWidth: 380,
    padding: spacing.lg,
    gap: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
    elevation: 12,
  },
  copy: { gap: spacing.sm },
  danger: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  dangerText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.danger },
  errorRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
});
