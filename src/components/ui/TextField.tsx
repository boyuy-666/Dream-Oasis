import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';
import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

interface Props extends Omit<TextInputProps, 'style'> {
  label: string;
  hint?: string;
  error?: string | null;
  /** Large serif writing surface for the dream itself. */
  hero?: boolean;
  icon?: IconName;
  footer?: React.ReactNode;
}

export function TextField({ label, hint, error, hero, icon, footer, multiline, onFocus, onBlur, ...input }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <AppText variant="label" color={colors.textSecondary}>{label}</AppText>
        {hint ? <AppText variant="caption" color={colors.textMuted}>{hint}</AppText> : null}
      </View>
      <View style={[styles.box, multiline && (hero ? styles.boxHero : styles.boxMulti), focused && styles.focused, !!error && styles.error]}>
        {icon ? <Icon name={icon} size={18} color={colors.textMuted} /> : null}
        <TextInput
          {...input}
          accessibilityLabel={label}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.glow}
          cursorColor={colors.glow}
          keyboardAppearance="dark"
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          style={[styles.input, multiline && styles.inputMulti, hero && styles.inputHero]}
        />
      </View>
      {error ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite">
          <Icon name="alert" size={16} color={colors.danger} />
          <AppText variant="caption" color={colors.danger} style={{ flex: 1 }}>{error}</AppText>
        </View>
      ) : null}
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  box: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 50, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.surfaceSunk, borderWidth: 1, borderColor: colors.border },
  boxMulti: { alignItems: 'flex-start', minHeight: 168, paddingVertical: 14 },
  boxHero: { alignItems: 'flex-start', minHeight: 220, paddingVertical: 16 },
  focused: { borderColor: colors.glow, backgroundColor: '#141D19' },
  error: { borderColor: colors.danger },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 16, color: colors.text, paddingVertical: 12 },
  inputMulti: { minHeight: 140, lineHeight: 26, fontSize: 17, paddingVertical: 0 },
  inputHero: { minHeight: 190, fontFamily: fonts.display, fontSize: 21, lineHeight: 30 },
  errorRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
});
