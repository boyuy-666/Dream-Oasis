import { DRAFT_BACKUP_KEY, DRAFT_KEY, DraftLoad, DreamDraft, parseDraft, serializeDraft } from '@/utils/dreamDraft';

/** The subset of AsyncStorage the draft store needs (injectable for tests). */
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/**
 * - `saved`: storage accepted this draft.
 * - `superseded`: skipped because a newer save was requested after it (that one carries newer data).
 * - `cancelled`: skipped because the draft was discarded or finalized after it was requested.
 */
export type SaveResult = 'saved' | 'superseded' | 'cancelled';

/**
 * Ordered persistence for the single new-dream draft. Every operation runs one after another in
 * the order requested, so a write can never land after (and overwrite) a later write or removal:
 * - each `save` is skipped if a newer `save` was requested in the meantime;
 * - `removeIfOwned` / `cancelPending` drop every save requested before them, so a delayed
 *   auto-save can never recreate a discarded or already-saved draft.
 */
export function createDraftStore(storage: KeyValueStorage, key = DRAFT_KEY, backupKey = DRAFT_BACKUP_KEY) {
  let chain: Promise<unknown> = Promise.resolve();
  let epoch = 0; // bumped by removals/cancellation: saves from an older epoch are dropped
  let seq = 0; // bumped by every save: only the newest queued save writes

  const enqueue = <T,>(op: () => Promise<T>): Promise<T> => {
    const run = chain.catch(() => {}).then(op);
    chain = run;
    return run;
  };

  return {
    /** Reads the stored draft (after any queued writes). Rejects only if storage cannot be read. */
    load(): Promise<DraftLoad> {
      return enqueue(async () => parseDraft(await storage.getItem(key)));
    },

    save(draft: DreamDraft): Promise<SaveResult> {
      const myEpoch = epoch;
      const mySeq = ++seq;
      const value = serializeDraft(draft); // captured now: later form changes cannot leak in
      return enqueue(async () => {
        if (myEpoch !== epoch) return 'cancelled';
        if (mySeq !== seq) return 'superseded';
        await storage.setItem(key, value);
        return 'saved';
      });
    },

    /**
     * Cancels every queued save, then removes the stored draft only if it is this draft.
     * A different or unreadable stored draft is left untouched (`kept`).
     */
    removeIfOwned(draftId: string): Promise<'removed' | 'kept'> {
      epoch += 1;
      return enqueue(async () => {
        const stored = parseDraft(await storage.getItem(key));
        if (stored.kind === 'none') return 'removed';
        if (stored.kind === 'ok' && stored.draft.draftId === draftId) {
          await storage.removeItem(key);
          return 'removed';
        }
        return 'kept';
      });
    },

    /** Drops every save requested so far (without touching storage). */
    cancelPending(): void {
      epoch += 1;
    },

    /** Copies an unreadable draft aside so reusing the slot never destroys it. */
    backupInvalid(raw: string): Promise<void> {
      return enqueue(() => storage.setItem(backupKey, raw));
    },
  };
}

export type DraftStore = ReturnType<typeof createDraftStore>;
