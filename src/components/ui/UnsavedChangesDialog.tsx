import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';

interface Props {
  visible: boolean;
  /** True while Save Changes is persisting: other choices are disabled. */
  saving?: boolean;
  onSave: () => void;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

/**
 * Night Garden confirmation shown when leaving Edit Dream with unsaved edits.
 * Tapping the backdrop or Android back = Keep Editing (never discards).
 */
export function UnsavedChangesDialog({ visible, saving, onSave, onKeepEditing, onDiscard }: Props) {
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

  const keepEditing = () => { if (!saving) onKeepEditing(); };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={keepEditing}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={keepEditing} accessibilityLabel="Keep editing" accessibilityRole="button" />
        <Animated.View
          accessibilityViewIsModal
          style={[styles.panel, {
            opacity: enter,
            transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }, { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }],
          }]}
        >
          <View style={styles.copy}>
            <AppText variant="title" accessibilityRole="header">Unsaved changes</AppText>
            <AppText variant="body" color={colors.textSecondary}>
              Your dream has been edited. Would you like to save your changes before leaving?
            </AppText>
          </View>
          <View style={styles.actions}>
            <Button label="Save Changes" onPress={onSave} loading={saving} loadingLabel="Saving changes…" />
            <Button label="Keep Editing" variant="secondary" onPress={keepEditing} disabled={saving} />
            <Pressable
              onPress={() => { if (!saving) onDiscard(); }}
              disabled={saving}
              style={({ pressed }) => [styles.discard, (pressed || saving) && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel="Discard Changes"
              accessibilityHint="Leaves without saving your edits"
              accessibilityState={{ disabled: !!saving }}
            >
              <AppText style={styles.discardText}>Discard Changes</AppText>
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
  actions: { gap: 10 },
  discard: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  discardText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.danger },
});
