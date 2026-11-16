import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, gradients, spacing } from '@/theme';
import { StarField } from './StarField';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  /** Extra bottom padding, e.g. to clear a tab bar. */
  bottomInset?: number;
  /** Show a faint moon halo in the top corner (use sparingly, e.g. Home). */
  moon?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Midnight-blue gradient screen shell with restrained stars and safe-area padding. */
export function Screen({ children, scroll = true, bottomInset = 0, moon, contentStyle }: Props) {
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg + bottomInset };
  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.background} style={StyleSheet.absoluteFill} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }} />
      {moon && (
        <View pointerEvents="none" style={[styles.moonWrap, { top: insets.top - 70 }]}>
          <View style={[styles.halo, styles.haloOuter]} />
          <View style={[styles.halo, styles.haloInner]} />
        </View>
      )}
      <StarField />
      <StatusBar style="light" />
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, pad, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex, pad, contentStyle]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  moonWrap: { position: 'absolute', right: -90, width: 260, height: 260, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', borderRadius: 999, backgroundColor: colors.highlight },
  haloOuter: { width: 260, height: 260, opacity: 0.035 },
  haloInner: { width: 150, height: 150, opacity: 0.06 },
});
