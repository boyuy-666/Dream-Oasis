import React, { memo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

/** Renders a pre-built SVG string. Memoized so artwork is not re-parsed on every render. */
export const Art = memo(function Art({ xml, width = '100%', height = '100%', color, style }: {
  xml: string; width?: number | `${number}%`; height?: number | `${number}%`; color?: string; style?: StyleProp<ViewStyle>;
}) {
  return <SvgXml xml={xml} width={width} height={height} color={color} style={style} />;
});
