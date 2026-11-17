import React, { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';

import { renderAura, renderCardBack } from '@/art/botanical';
import { Art } from '@/components/ui';
import { colors, elevation } from '@/theme';
import { CARD_RATIO } from './DreamCard';

/** Face-down card: botanical lattice, ring inscription, breathing night-bloom emblem. */
export function CardBack({ width, breathe = true }: { width: number; breathe?: boolean }) {
  const height = width * CARD_RATIO;
  const cq = width / 100;
  const xml = useMemo(() => renderCardBack(), []);
  const aura = useMemo(() => renderAura(colors.glow, 0.55), []);
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!breathe) return;
    let loop: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) return;
      loop = Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]));
      loop.start();
    }).catch(() => {});
    return () => loop?.stop();
  }, [breathe, pulse]);

  const auraSize = width * 0.42;
  return (
    <View style={[{ width, height, borderRadius: 5 * cq }, elevation.card]} accessible accessibilityLabel="Face-down dream card">
      <View style={[styles.frame, { borderRadius: 5 * cq, padding: 3 * cq }]}>
        <View style={[styles.inner, { borderRadius: 3.4 * cq }]}>
          <Art xml={xml} />
          {breathe && (
            <Animated.View pointerEvents="none" style={[styles.aura, { width: auraSize, height: auraSize, marginLeft: -auraSize / 2, marginTop: -auraSize / 2, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] }) }] }]}>
              <Art xml={aura} />
            </Animated.View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.mossNight, borderWidth: 1, borderColor: colors.fernStrong },
  inner: { flex: 1, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(169,179,167,0.18)' },
  aura: { position: 'absolute', left: '50%', top: '50%' },
});
