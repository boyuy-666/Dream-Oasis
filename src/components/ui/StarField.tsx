import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';

import { colors } from '@/theme';

function Star({ x, y, size, delay, color }: { x: number; y: number; size: number; delay: number; color: string }) {
  const [opacity] = useState(() => new Animated.Value(0.2));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.15, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, opacity]);
  return (
    <Animated.View
      style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size, backgroundColor: color, opacity }}
    />
  );
}

/** Decorative twinkling stars. Pure RN Animated (native driver) – works in Expo Go. */
export function StarField({ count = 45 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const stars = useMemo(() => {
    // Pure index-based pseudo-random so the layout is stable between renders.
    const rnd = (i: number, k: number) => {
      const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rnd(i, 1) * width,
      y: rnd(i, 2) * height,
      size: 1 + rnd(i, 3) * 2.2,
      delay: rnd(i, 4) * 3000,
      color: rnd(i, 5) > 0.8 ? colors.gold : colors.lavenderSoft,
    }));
  }, [count, width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map(({ id, ...p }) => (
        <Star key={id} {...p} />
      ))}
    </View>
  );
}
