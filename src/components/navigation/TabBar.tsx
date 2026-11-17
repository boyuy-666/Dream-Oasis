import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Icon, IconName } from '@/components/ui';
import { colors } from '@/theme';

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

const ITEMS: { name: string; label: string; icon: IconName; raised?: boolean }[] = [
  { name: 'index', label: 'Garden', icon: 'garden' },
  { name: 'record', label: 'Record', icon: 'pen', raised: true },
  { name: 'collection', label: 'Collection', icon: 'cards' },
];

/** Night Garden tab bar: Garden · raised Record · Collection. Hidden while recording. */
export function TabBar({ state, emitter, navigateToTab }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const current = state.routes[state.index]?.name;
  if (current === 'record') return null;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]} accessibilityRole="tablist">
      {ITEMS.map((item) => {
        const route = state.routes.find((r) => r.name === item.name);
        if (!route) return null;
        const focused = current === item.name;
        const color = item.raised ? colors.onAccent : focused ? colors.text : colors.textMuted;
        const onPress = () => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            Haptics.selectionAsync().catch(() => {});
            navigateToTab(route.key);
          }
        };
        return (
          <Pressable key={item.name} onPress={onPress} style={styles.item} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={item.label}>
            <View style={[styles.icon, item.raised ? styles.raised : focused && styles.iconActive]}>
              <Icon name={item.icon} size={item.raised ? 22 : 24} color={color} />
              {focused && !item.raised && <View style={styles.dot} />}
            </View>
            <AppText style={[styles.label, { color: focused ? colors.text : colors.textMuted }]}>{item.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', paddingTop: 8, paddingHorizontal: 18, backgroundColor: colors.mossNight, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  item: { flex: 1, alignItems: 'center', gap: 4, minHeight: 48 },
  icon: { width: 52, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: colors.paperA06 },
  raised: { width: 56, height: 40, marginTop: -8, borderRadius: 20, backgroundColor: colors.accent, shadowColor: colors.glow, shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  dot: { position: 'absolute', bottom: -3, width: 4, height: 4, borderRadius: 2, backgroundColor: colors.glow },
  label: { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 11, lineHeight: 13, letterSpacing: 0.2 },
});
