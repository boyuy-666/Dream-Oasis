import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { DreamDraft, draftPreview } from '@/utils/dreamDraft';
import { AppText } from './AppText';
import { Button } from './Button';
import { DangerAction, DialogError, GardenDialog } from './GardenDialog';

interface Props {
  draft: DreamDraft | null;
  discarding: boolean;
  error: string | null;
  onContinue: () => void;
  onNotNow: () => void;
  onDiscard: () => void;
}

/** Offers the stored unfinished dream when Record opens. Backdrop / Android back = Not Now. */
export function DraftRecoveryDialog({ draft, discarding, error, onContinue, onNotNow, onDiscard }: Props) {
  const preview = draft ? draftPreview(draft) : null;
  const notNow = () => { if (!discarding) onNotNow(); };
  return (
    <GardenDialog
      visible={!!draft}
      title="Your dream is still here"
      description="You have an unfinished dream waiting in your garden."
      onDismiss={notNow}
      dismissLabel="Not now"
    >
      {preview ? (
        <View style={styles.preview} accessible accessibilityLabel={`Unfinished dream: ${preview.heading}. Last saved ${preview.savedAt}. ${preview.modeLabel}.`}>
          <AppText variant={preview.isTitle ? 'heading' : 'quote'} color={preview.isTitle ? colors.text : colors.textSecondary} numberOfLines={3}>
            {preview.heading}
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>Last saved {preview.savedAt} · {preview.modeLabel}</AppText>
        </View>
      ) : null}
      <DialogError message={error} />
      <View style={{ gap: 10 }}>
        <Button label="Continue Dream" onPress={onContinue} disabled={discarding} accessibilityHint="Restores every field of your unfinished dream" />
        <Button label="Not Now" variant="secondary" onPress={notNow} disabled={discarding} />
        <DangerAction label="Discard Draft" hint="Permanently removes this unfinished dream" onPress={onDiscard} busy={discarding} busyLabel="Discarding…" />
      </View>
    </GardenDialog>
  );
}

const styles = StyleSheet.create({
  preview: { gap: 6, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceSunk, borderWidth: 1, borderColor: colors.border },
});
