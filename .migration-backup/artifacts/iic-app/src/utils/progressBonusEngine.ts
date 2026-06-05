/**
 * Progress Bonus Engine
 *
 * Two systems, applied at midnight (when the app is opened on a new day):
 *
 * L4–L8: Progress Bonus — based on what % of the daily score limit was earned yesterday.
 *         The highest bracket reached determines the bonus %.
 *         Bonus = dailyEarned × bonusPct / 100
 *
 * L9+:  Limit-Touch Multiplier — ONLY if 100% of daily limit was reached yesterday.
 *        Bonus = dailyEarned × (multiplier − 1)
 *
 * Both systems add to Firebase totalScore and send an inbox message.
 */

export interface ProgressBonusBracket {
  progressPct: number;  // % of daily limit that must be reached
  bonusPct: number;     // bonus = dailyEarned × bonusPct / 100
}

/** Bonus brackets per level (L4–L8). Each row is cumulative — highest reached wins. */
export const PROGRESS_BONUS_TABLE: Record<number, ProgressBonusBracket[]> = {
  4: [
    { progressPct: 10,  bonusPct: 1  },
    { progressPct: 20,  bonusPct: 4  },
    { progressPct: 30,  bonusPct: 5  },
    { progressPct: 40,  bonusPct: 6  },
    { progressPct: 50,  bonusPct: 9  },
    { progressPct: 60,  bonusPct: 10 },
    { progressPct: 70,  bonusPct: 14 },
    { progressPct: 80,  bonusPct: 15 },
    { progressPct: 90,  bonusPct: 19 },
    { progressPct: 100, bonusPct: 40 },
  ],
  5: [
    { progressPct: 10,  bonusPct: 2  },
    { progressPct: 20,  bonusPct: 6  },
    { progressPct: 30,  bonusPct: 8  },
    { progressPct: 40,  bonusPct: 10 },
    { progressPct: 50,  bonusPct: 14 },
    { progressPct: 60,  bonusPct: 16 },
    { progressPct: 70,  bonusPct: 22 },
    { progressPct: 80,  bonusPct: 24 },
    { progressPct: 90,  bonusPct: 30 },
    { progressPct: 100, bonusPct: 50 },
  ],
  6: [
    { progressPct: 10,  bonusPct: 3  },
    { progressPct: 20,  bonusPct: 9  },
    { progressPct: 30,  bonusPct: 12 },
    { progressPct: 40,  bonusPct: 15 },
    { progressPct: 50,  bonusPct: 21 },
    { progressPct: 60,  bonusPct: 24 },
    { progressPct: 70,  bonusPct: 33 },
    { progressPct: 80,  bonusPct: 36 },
    { progressPct: 90,  bonusPct: 45 },
    { progressPct: 100, bonusPct: 65 },
  ],
  7: [
    { progressPct: 10,  bonusPct: 4  },
    { progressPct: 20,  bonusPct: 12 },
    { progressPct: 30,  bonusPct: 16 },
    { progressPct: 40,  bonusPct: 20 },
    { progressPct: 50,  bonusPct: 28 },
    { progressPct: 60,  bonusPct: 32 },
    { progressPct: 70,  bonusPct: 44 },
    { progressPct: 80,  bonusPct: 48 },
    { progressPct: 90,  bonusPct: 60 },
    { progressPct: 100, bonusPct: 80 },
  ],
  8: [
    { progressPct: 10,  bonusPct: 5  },
    { progressPct: 20,  bonusPct: 15 },
    { progressPct: 30,  bonusPct: 20 },
    { progressPct: 40,  bonusPct: 25 },
    { progressPct: 50,  bonusPct: 35 },
    { progressPct: 60,  bonusPct: 40 },
    { progressPct: 70,  bonusPct: 55 },
    { progressPct: 80,  bonusPct: 60 },
    { progressPct: 90,  bonusPct: 75 },
    { progressPct: 100, bonusPct: 100 },
  ],
};

/** Multiplier for L9+: only when 100% of daily limit was reached.
 *  Bonus = floor(dailyEarned × (multiplier − 1)) */
export const LIMIT_TOUCH_MULTIPLIERS: Record<number, number> = {
  9:  1.5,
  10: 2.0,
  11: 2.5,
  12: 3.2,
  13: 4.0,
  14: 5.0,
};

/** Local-timezone YYYY-MM-DD for an offset of `offsetDays` from today */
export const getLocalDateStr = (offsetDays = 0): string => {
  const d = new Date();
  if (offsetDays) d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** How much daily score was earned for a given date */
export const getDailyEarnedForDate = (userId: string, dateStr: string): number => {
  try { return Number(localStorage.getItem(`nst_daily_score_${userId}_${dateStr}`) || '0'); } catch { return 0; }
};

export interface MidnightBonusResult {
  bonusScore: number;
  bonusPct: number;       // for progress bonus (L4–L8); 0 for multiplier levels
  multiplier: number;     // for limit-touch (L9+); 1 for progress levels
  progressPct: number;    // what % of daily limit was reached
  bracketLabel: string;   // e.g. "90% Progress → +19% Bonus"
  inboxText: string;
}

/** Calculate the midnight bonus for a user based on yesterday's activity.
 *  Returns bonusScore = 0 if no bonus qualifies. */
export const calculateMidnightBonus = (
  level: number,
  yesterdayEarned: number,
  dailyLimit: number,
): MidnightBonusResult => {
  const progressPct = dailyLimit > 0 ? Math.min(100, Math.floor((yesterdayEarned / dailyLimit) * 100)) : 0;

  // L4–L8: Progress Bonus System
  const brackets = PROGRESS_BONUS_TABLE[level];
  if (brackets) {
    let best: ProgressBonusBracket | null = null;
    for (const b of brackets) {
      if (progressPct >= b.progressPct) best = b;
    }
    if (!best) {
      return { bonusScore: 0, bonusPct: 0, multiplier: 1, progressPct, bracketLabel: 'No bracket reached', inboxText: '' };
    }
    const bonusScore = Math.max(1, Math.ceil(yesterdayEarned * best.bonusPct / 100));
    const bracketLabel = `${best.progressPct}% Progress → +${best.bonusPct}% Bonus`;
    const inboxText = buildProgressBonusInboxText(level, yesterdayEarned, bonusScore, best.bonusPct, progressPct, best.progressPct);
    return { bonusScore, bonusPct: best.bonusPct, multiplier: 1, progressPct, bracketLabel, inboxText };
  }

  // L9+: Limit-Touch Multiplier (only at 100%)
  const mult = LIMIT_TOUCH_MULTIPLIERS[level] ?? (level >= 14 ? LIMIT_TOUCH_MULTIPLIERS[14] : null);
  if (mult && progressPct >= 100) {
    const bonusScore = Math.max(1, Math.floor(yesterdayEarned * (mult - 1)));
    const totalAfter = yesterdayEarned + bonusScore;
    const bracketLabel = `100% Limit Touch → ${mult}×`;
    const inboxText = buildMultiplierBonusInboxText(level, yesterdayEarned, bonusScore, mult, totalAfter);
    return { bonusScore, bonusPct: 0, multiplier: mult, progressPct, bracketLabel, inboxText };
  }

  return { bonusScore: 0, bonusPct: 0, multiplier: 1, progressPct, bracketLabel: 'Limit not reached (L9+)', inboxText: '' };
};

const buildProgressBonusInboxText = (
  level: number,
  earned: number,
  bonus: number,
  bonusPct: number,
  progressPct: number,
  bracketPct: number,
): string =>
  `🌟 Level ${level} Progress Bonus — Raat 12 Baje ka Reward!\n\n` +
  `Kal aapne ${progressPct}% daily limit complete ki (${bracketPct}% bracket unlock).\n\n` +
  `📊 Kal ka Score:  ${earned.toLocaleString()} pts\n` +
  `🎁 Bonus (+${bonusPct}%): +${bonus.toLocaleString()} pts\n\n` +
  `✅ Ye score aapke total mein add ho gaya hai!\n\n` +
  `Aaj bhi padhai karte raho aur bada bonus pao! 🚀`;

const buildMultiplierBonusInboxText = (
  level: number,
  earned: number,
  bonus: number,
  mult: number,
  total: number,
): string =>
  `🔥 Level ${level} Limit-Touch Bonus — Raat 12 Baje ka Reward!\n\n` +
  `Kal aapne 100% daily limit complete ki!\n\n` +
  `📊 Kal ka Score:   ${earned.toLocaleString()} pts\n` +
  `✖️ Multiplier:     ${mult}×\n` +
  `🎁 Bonus Score:    +${bonus.toLocaleString()} pts\n` +
  `📈 Effective Total: ${total.toLocaleString()} pts\n\n` +
  `✅ Ye score aapke total mein add ho gaya hai!\n\n` +
  `Aaj bhi 100% limit complete karo aur reward pao! 👑`;

// ── UI helpers ────────────────────────────────────────────────────────────────

/** Returns the current expected bonus for today (live preview while user is studying) */
export const getTodayBonusPreview = (
  level: number,
  todayEarned: number,
  dailyLimit: number,
): {
  currentBonusPct: number;
  currentBonusScore: number;
  nextBracketPct: number | null;
  nextBonusPct: number | null;
  scoreToNextBracket: number | null;
  isMultiplierLevel: boolean;
  multiplier: number;
  progressPct: number;
} => {
  const progressPct = dailyLimit > 0 ? Math.min(100, Math.floor((todayEarned / dailyLimit) * 100)) : 0;

  const brackets = PROGRESS_BONUS_TABLE[level];
  if (brackets) {
    let current: ProgressBonusBracket | null = null;
    let next: ProgressBonusBracket | null = null;
    for (const b of brackets) {
      if (progressPct >= b.progressPct) current = b;
      else if (!next) next = b;
    }
    const currentBonusPct = current?.bonusPct ?? 0;
    const currentBonusScore = current ? Math.max(1, Math.ceil(todayEarned * currentBonusPct / 100)) : 0;
    const nextBracketPct = next?.progressPct ?? null;
    const nextBonusPct = next?.bonusPct ?? null;
    const scoreToNextBracket = next ? Math.max(0, Math.ceil(next.progressPct / 100 * dailyLimit) - todayEarned) : null;
    return { currentBonusPct, currentBonusScore, nextBracketPct, nextBonusPct, scoreToNextBracket, isMultiplierLevel: false, multiplier: 1, progressPct };
  }

  const mult = LIMIT_TOUCH_MULTIPLIERS[level] ?? (level >= 14 ? LIMIT_TOUCH_MULTIPLIERS[14] : 1);
  const hitLimit = progressPct >= 100;
  const currentBonusScore = hitLimit ? Math.max(1, Math.floor(todayEarned * (mult - 1))) : 0;
  const scoreToNextBracket = hitLimit ? null : Math.max(0, dailyLimit - todayEarned);
  return {
    currentBonusPct: 0,
    currentBonusScore,
    nextBracketPct: hitLimit ? null : 100,
    nextBonusPct: null,
    scoreToNextBracket,
    isMultiplierLevel: true,
    multiplier: mult,
    progressPct,
  };
};

/** Brief label for what bonus a level gives at 100% (for "next level unlock" display) */
export const getLevel100BonusLabel = (level: number): string => {
  const brackets = PROGRESS_BONUS_TABLE[level];
  if (brackets) {
    const full = brackets.find(b => b.progressPct === 100);
    if (full) return `+${full.bonusPct}% at 100%`;
  }
  const mult = LIMIT_TOUCH_MULTIPLIERS[level];
  if (mult) return `${mult}× on 100% limit`;
  return '';
};
