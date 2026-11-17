import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

interface Props {
  visible: boolean;
  /** True while the deletion is being persisted: both choices are disabled. */
  deleting?: boolean;
  /** Shown inside the dialog when the last attempt failed; the dream is still intact. */
  error?: string | null;
  onKeep: () => void;
  onDelete: () => void;
}

/**
 * Night Garden confirmation for permanently deleting a dream.
 * Keep Dream is the safe default; backdrop tap and Android back also keep the dream.
 */
export function DeleteDreamDialog({ visible, deleting, error, onKeep, onDelete }: Props) {
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

  const keep = () => { if (!deleting) onKeep(); };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={keep}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={keep} accessibilityLabel="Keep dream" accessibilityRole="button" />
        <Animated.View
          accessibilityViewIsModal
          style={[styles.panel, {
            opacity: enter,
            transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }, { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }],
          }]}
        >
          <View style={styles.copy}>
            <AppText variant="title" accessibilityRole="header">Delete this dream?</AppText>
            <AppText variant="body" color={colors.textSecondary}>
              This dream and its card will be permanently deleted. This action cannot be undone.
            </AppText>
          </View>

          {error ? (
            <View style={styles.errorRow} accessibilityLiveRegion="assertive">
              <Icon name="alert" size={16} color={colors.danger} />
              <AppText variant="caption" color={colors.danger} style={{ flex: 1 }}>{error}</AppText>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              onPress={keep}
              disabled={deleting}
              style={({ pressed }) => [styles.keep, (pressed || deleting) && { opacity: 0.75 }]}
              accessibilityRole="button"
              accessibilityLabel="Keep Dream"
              accessibilityState={{ disabled: !!deleting }}
            >
              <AppText style={styles.keepText}>Keep Dream</AppText>
            </Pressable>
            <Pressable
              onPress={() => { if (!deleting) onDelete(); }}
              disabled={deleting}
              style={({ pressed }) => [styles.delete, pressed && !deleting && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}
              accessibilityRole="button"
              accessibilityLabel="Delete Permanently"
              accessibilityHint="Permanently deletes this dream and its card"
              accessibilityState={{ disabled: !!deleting, busy: !!deleting }}
            >
              {deleting ? <ActivityIndicator color={colors.danger} /> : <Icon name="trash" size={18} color={colors.danger} />}
              <AppText style={styles.deleteText}>{deleting ? 'Deleting…' : 'Delete Permanently'}</AppText>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
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
  errorRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  actions: { gap: 10 },
  keep: { minHeight: 52, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.borderStrong },
  keepText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text },
  delete: { minHeight: 52, borderRadius: radius.pill, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.dangerA45, backgroundColor: colors.dangerA08 },
  deleteText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.danger },
});
