import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { gradients, spacing } from '@/theme';
import { StarField } from './StarField';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  /** Extra bottom padding, e.g. to clear a tab bar. */
  bottomInset?: number;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Starry gradient screen shell used by every screen. */
export function Screen({ children, scroll = true, bottomInset = 0, contentStyle }: Props) {
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg + bottomInset };
  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.background} style={StyleSheet.absoluteFill} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} />
      <StarField />
      <StatusBar style="light" />
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, pad, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
  root: { flex: 1, backgroundColor: '#0B0720' },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, gap: spacing.lg },
});
