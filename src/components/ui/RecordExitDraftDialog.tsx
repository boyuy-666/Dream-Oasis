import React from 'react';
import { View } from 'react-native';

import { Button } from './Button';
import { DangerAction, DialogError, GardenDialog } from './GardenDialog';

interface Props {
  visible: boolean;
  /** Which choice is being written to storage; the others are disabled meanwhile. */
  busy: 'keeping' | 'discarding' | null;
  error: string | null;
  onKeepDraft: () => void;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

/** Shown when leaving Record with an unfinished dream. Backdrop / Android back = Keep Editing. */
export function RecordExitDraftDialog({ visible, busy, error, onKeepDraft, onKeepEditing, onDiscard }: Props) {
  const keepEditing = () => { if (!busy) onKeepEditing(); };
  return (
    <GardenDialog
      visible={visible}
      title="Leave this dream?"
      description="Your unfinished dream can be saved as a draft so you can continue it later."
      onDismiss={keepEditing}
      dismissLabel="Keep editing"
    >
      <DialogError message={error} />
      <View style={{ gap: 10 }}>
        <Button label="Keep Draft & Exit" onPress={onKeepDraft} loading={busy === 'keeping'} loadingLabel="Saving draft…" disabled={busy === 'discarding'} accessibilityHint="Saves your unfinished dream on this device, then returns to the garden" />
        <Button label="Keep Editing" variant="secondary" onPress={keepEditing} disabled={!!busy} />
        <DangerAction label="Discard Draft" hint="Permanently removes this unfinished dream" onPress={onDiscard} busy={busy === 'discarding'} busyLabel="Discarding…" disabled={busy === 'keeping'} />
      </View>
    </GardenDialog>
  );
}
