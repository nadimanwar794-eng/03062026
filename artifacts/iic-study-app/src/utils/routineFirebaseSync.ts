/**
 * routineFirebaseSync.ts
 * Firebase backup + restore for Routine configuration, coins, and claims.
 *
 * Firestore path: users/{userId}/routine_backup/config  (single document)
 *
 * What is synced:
 *   routineMode, selectedBoard, selectedClass, selectedBook, selectedBooks,
 *   routineCategories, coins, enabled, unlockedTierSlot,
 *   dailyClaims, revisionUnlockedLessons
 *
 * What is NOT synced (large / ephemeral / already covered by routineFirebase.ts):
 *   lessonProgress, dailyTasks, trackingHistory, subjects, routineSlots
 */

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, sanitizeForFirestore } from '../firebase';
import { loadRoutineData, saveRoutineData, type RoutineData } from './routineStorage';

const ROUTINE_DOC = (userId: string) =>
  doc(db, `users/${userId}/routine_backup/config`);

// Debounce handle — we don't spam Firebase on every keystroke
let _debounceTimer: ReturnType<typeof setTimeout> | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Payload helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Strip large/ephemeral fields before sending to Firebase */
function toSyncPayload(data: RoutineData) {
  return {
    routineMode:              data.routineMode,
    selectedBoard:            data.selectedBoard ?? null,
    selectedClass:            data.selectedClass ?? null,
    selectedBook:             data.selectedBook ?? null,
    selectedBooks:            data.selectedBooks ?? [],
    routineCategories:        data.routineCategories ?? [],
    coins:                    data.coins ?? 0,
    enabled:                  data.enabled ?? false,
    unlockedTierSlot:         data.unlockedTierSlot ?? false,
    dailyClaims:              data.dailyClaims ?? {},
    revisionUnlockedLessons:  data.revisionUnlockedLessons ?? {},
    _syncedAt:                Date.now(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Write
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Debounced save — batches rapid changes (e.g. coin animations) into one write.
 * Fires 12 s after the last call.
 */
export function scheduleRoutineSync(userId: string, data: RoutineData): void {
  if (!userId) return;
  if (_debounceTimer) clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    _debounceTimer = null;
    setDoc(ROUTINE_DOC(userId), sanitizeForFirestore(toSyncPayload(data)), {
      merge: false,
    }).catch(() => {});
  }, 12_000);
}

/**
 * Immediate save — use for important config changes (setup save, unlock, etc.).
 */
export function syncRoutineNow(userId: string, data: RoutineData): void {
  if (!userId) return;
  if (_debounceTimer) { clearTimeout(_debounceTimer); _debounceTimer = null; }
  setDoc(ROUTINE_DOC(userId), sanitizeForFirestore(toSyncPayload(data)), {
    merge: false,
  }).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// Read + Merge
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Restore routine data from Firebase on login / device change.
 *
 * Merge rules:
 *   • Config (mode/board/class/books/categories): cloud wins only when local is
 *     blank (fresh device / after cache clear). Local always beats cloud when
 *     local data exists — avoids overwriting user changes made offline.
 *   • Coins: Math.max — user never loses coins due to a stale backup.
 *   • dailyClaims / revisionUnlockedLessons: union — more data is better.
 *   • enabled / unlockedTierSlot: OR — if ever unlocked, stays unlocked.
 *
 * Fires 'iic-routine-hydrated' when done so MyRoutine.tsx can reload state.
 */
export async function hydrateRoutineData(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const snap = await getDoc(ROUTINE_DOC(userId));
    const local = loadRoutineData(userId);

    if (!snap.exists()) {
      // No cloud data yet — upload current local state so next device has it
      syncRoutineNow(userId, local);
      return;
    }

    const cloud = snap.data() as ReturnType<typeof toSyncPayload>;

    // Is this a fresh/reset device? (local has no routine config at all)
    const localIsFresh = !local.routineMode;

    const merged: RoutineData = {
      ...local,

      // ── Config ──────────────────────────────────────────────────────────
      routineMode:
        localIsFresh ? cloud.routineMode : (local.routineMode ?? cloud.routineMode),
      selectedBoard:
        localIsFresh ? cloud.selectedBoard : (local.selectedBoard ?? cloud.selectedBoard ?? null),
      selectedClass:
        localIsFresh ? cloud.selectedClass : (local.selectedClass ?? cloud.selectedClass ?? null),
      selectedBook:
        localIsFresh ? cloud.selectedBook : (local.selectedBook ?? cloud.selectedBook ?? null),
      selectedBooks:
        localIsFresh
          ? (cloud.selectedBooks ?? [])
          : (local.selectedBooks?.length ? local.selectedBooks : (cloud.selectedBooks ?? [])),
      routineCategories:
        localIsFresh
          ? (cloud.routineCategories ?? [])
          : (local.routineCategories?.length
              ? local.routineCategories
              : (cloud.routineCategories ?? [])),

      // ── Flags ────────────────────────────────────────────────────────────
      enabled:         local.enabled || cloud.enabled,
      unlockedTierSlot: local.unlockedTierSlot || cloud.unlockedTierSlot,

      // ── Coins — never let the user lose coins ────────────────────────────
      coins: Math.max(local.coins ?? 0, cloud.coins ?? 0),

      // ── Claims & unlocks — union ──────────────────────────────────────────
      dailyClaims: { ...(cloud.dailyClaims ?? {}), ...(local.dailyClaims ?? {}) },
      revisionUnlockedLessons: {
        ...(cloud.revisionUnlockedLessons ?? {}),
        ...(local.revisionUnlockedLessons ?? {}),
      },
    };

    saveRoutineData(userId, merged);

    window.dispatchEvent(
      new CustomEvent('iic-routine-hydrated', { detail: { userId } }),
    );
  } catch (err) {
    console.warn('[IIC] Routine hydration skipped:', err);
  }
}
