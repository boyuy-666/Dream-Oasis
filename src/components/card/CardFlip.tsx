import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { CARD_RATIO } from './DreamCard';

interface Props {
  width: number;
  front: React.ReactNode;
  back: React.ReactNode;
  /** false = back visible, true = front visible. */
  flipped: boolean;
  duration?: number;
}

/** 3D card flip around the Y axis (native driver). */
export function CardFlip({ width, front, back, flipped, duration = 950 }: Props) {
  const [p] = useState(() => new Animated.Value(flipped ? 1 : 0));
  useEffect(() => {
    Animated.timing(p, { toValue: flipped ? 1 : 0, duration, easing: Easing.bezier(0.3, 0.7, 0.15, 1), useNativeDriver: true }).start();
  }, [flipped, duration, p]);

  const backRot = p.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const frontRot = p.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  return (
    <View style={{ width, height: width * CARD_RATIO }}>
      <Animated.View style={[styles.face, { transform: [{ perspective: 1400 }, { rotateY: backRot }] }]} pointerEvents={flipped ? 'none' : 'auto'}>{back}</Animated.View>
      <Animated.View style={[styles.face, { transform: [{ perspective: 1400 }, { rotateY: frontRot }] }]} pointerEvents={flipped ? 'auto' : 'none'}>{front}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({ face: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backfaceVisibility: 'hidden' } });
