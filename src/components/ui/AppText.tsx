import React from 'react';
import { Text, TextProps } from 'react-native';

import { colors, type } from '@/theme';

type Variant = keyof typeof type;

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  center?: boolean;
}

export function AppText({ variant = 'body', color = colors.text, center, style, ...rest }: Props) {
  return <Text {...rest} style={[type[variant], { color }, center && { textAlign: 'center' }, style]} />;
}
