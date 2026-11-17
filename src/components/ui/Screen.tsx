import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  /** Extra bottom padding, e.g. to clear a floating bar. */
  bottomInset?: number;
  /** Optional ambient decoration drawn behind the content (scrolls with it). */
  decor?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Moss-night screen shell with safe-area padding and a 24pt gutter. */
export function Screen({ children, scroll = true, bottomInset = 0, decor, contentStyle }: Props) {
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + spacing.sm, paddingBottom: spacing.xl + bottomInset };
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, pad, contentStyle]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
          {decor}
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex, pad, contentStyle]}>{decor}{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, gap: 28 },
});
