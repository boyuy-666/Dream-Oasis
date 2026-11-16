import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { AppText, Button, Chip, GlassCard, Screen } from '@/components/ui';
import { MOODS } from '@/data/moods';
import { Mood } from '@/data/types';
import { useDreams } from '@/store/DreamsContext';
import { colors, radius, spacing } from '@/theme';

export default function RecordScreen() {
  const router = useRouter();
  const { addDream } = useDreams();
  const [text, setText] = useState('');
  const [mood, setMood] = useState<Mood>('peaceful');
  const canSave = text.trim().length >= 3;

  const save = () => {
    const dream = addDream(text, mood);
    setText('');
    router.push(`/reveal/${dream.id}`);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="title">Record your dream</AppText>
          <AppText color={colors.textMuted}>Describe it in your own words — fragments are welcome.</AppText>
        </View>

        <GlassCard>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="I was standing at the edge of a glowing sea…"
            placeholderTextColor={colors.textDim}
            multiline
            textAlignVertical="top"
            style={styles.input}
            selectionColor={colors.gold}
            accessibilityLabel="Dream description"
          />
        </GlassCard>

        <View style={{ gap: spacing.sm }}>
          <AppText variant="label" color={colors.lavender}>How did it feel?</AppText>
          <View style={styles.moods}>
            {MOODS.map((m) => (
              <Chip key={m.key} label={`${m.glyph} ${m.label}`} selected={mood === m.key} onPress={() => setMood(m.key)} />
            ))}
          </View>
        </View>

        <Button label="Unveil my Dream Card" onPress={save} disabled={!canSave} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 180, color: colors.text, fontSize: 17, lineHeight: 26, borderRadius: radius.md },
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
