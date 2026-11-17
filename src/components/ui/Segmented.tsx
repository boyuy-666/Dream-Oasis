import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';
import { AppText } from './AppText';

interface Props<T extends string> {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  accessibilityLabel?: string;
}

/** Two-or-more option segmented control with a sliding thumb. */
export function Segmented<T extends string>({ options, value, onChange, accessibilityLabel }: Props<T>) {
  const [width, setWidth] = useState(0);
  const [x] = useState(() => new Animated.Value(0));
  const index = Math.max(0, options.findIndex((o) => o.key === value));
  const seg = width ? (width - 8) / options.length : 0;

  useEffect(() => {
    Animated.timing(x, { toValue: index * seg, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [index, seg, x]);

  return (
    <View style={styles.track} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} accessibilityRole="tablist" accessibilityLabel={accessibilityLabel}>
      {seg > 0 && <Animated.View style={[styles.thumb, { width: seg, transform: [{ translateX: x }] }]} />}
      {options.map((o) => {
        const selected = o.key === value;
        return (
          <Pressable key={o.key} style={styles.option} accessibilityRole="tab" accessibilityState={{ selected }}
            onPress={() => { if (!selected) { Haptics.selectionAsync().catch(() => {}); onChange(o.key); } }}>
            <AppText variant="small" color={selected ? colors.text : colors.textSecondary} style={styles.label}>{o.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 4, borderRadius: radius.pill, backgroundColor: colors.surfaceSunk, borderWidth: 1, borderColor: colors.border },
  thumb: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: radius.pill, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.borderStrong },
  option: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: 'InstrumentSans_600SemiBold' },
});
