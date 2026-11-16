import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { AppText, Button, Chip, Screen } from '@/components/ui';
import { MOODS } from '@/data/moods';
import { Mood } from '@/data/types';
import { useDreams } from '@/store/DreamsContext';
import { colors, radius, spacing } from '@/theme';

const MIN_LENGTH = 3;

export default function RecordScreen() {
  const router = useRouter();
  const { addDream } = useDreams();
  const [text, setText] = useState('');
  const [mood, setMood] = useState<Mood>('peaceful');
  const [focused, setFocused] = useState(false);
  const canSave = text.trim().length >= MIN_LENGTH;

  const save = () => {
    const dream = addDream(text, mood);
    setText('');
    router.push(`/reveal/${dream.id}`);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="title">Record your dream</AppText>
          <AppText color={colors.textSecondary}>Describe it in your own words — fragments are welcome.</AppText>
        </View>

        <View style={{ gap: spacing.sm }}>
          <AppText variant="label" color={colors.textSecondary} nativeID="dreamLabel">Your dream</AppText>
          <TextInput
            value={text}
            onChangeText={setText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="I was standing at the edge of a glowing sea…"
            placeholderTextColor={colors.placeholder}
            multiline
            textAlignVertical="top"
            style={[styles.input, focused && styles.inputFocused]}
            selectionColor={colors.accent}
            cursorColor={colors.accent}
            keyboardAppearance="dark"
            accessibilityLabel="Dream description"
            accessibilityLabelledBy="dreamLabel"
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <AppText variant="label" color={colors.textSecondary}>How did it feel?</AppText>
          <View style={styles.moods}>
            {MOODS.map((m) => (
              <Chip key={m.key} label={`${m.glyph} ${m.label}`} selected={mood === m.key} onPress={() => setMood(m.key)} />
            ))}
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Button
            label="Unveil my Dream Card"
            onPress={save}
            disabled={!canSave}
            accessibilityHint="Saves your dream and reveals its Dream Card"
          />
          {!canSave && (
            <AppText variant="caption" color={colors.textSecondary} center>
              Write a few words to unveil your card.
            </AppText>
          )}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  input: {
    minHeight: 200,
    padding: spacing.md,
    color: colors.text,
    fontSize: 17,
    lineHeight: 26,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  inputFocused: { borderColor: colors.accentBorder },
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
