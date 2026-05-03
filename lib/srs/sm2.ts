import type { SRSRating } from "@/types";

export interface SRSCard {
  easeFactor: number;
  intervalDays: number;
  repetitionCount: number;
}

export interface SRSResult {
  newEaseFactor: number;
  newInterval: number;
  newRepetitionCount: number;
  nextDueDate: Date;
}

const RATING_SCORE: Record<SRSRating, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

export function calculateNextReview(card: SRSCard, rating: SRSRating): SRSResult {
  const score = RATING_SCORE[rating];
  let { easeFactor, intervalDays, repetitionCount } = card;

  if (score < 3) {
    repetitionCount = 0;
    intervalDays = 1;
  } else {
    if (repetitionCount === 0) {
      intervalDays = 1;
    } else if (repetitionCount === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitionCount += 1;
  }

  // Update ease factor (SM-2 formula)
  easeFactor = easeFactor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02));
  easeFactor = Math.max(1.3, Math.round(easeFactor * 100) / 100);

  // Add ±10% fuzz to avoid card clustering
  const fuzz = 0.9 + Math.random() * 0.2;
  intervalDays = Math.max(1, Math.round(intervalDays * fuzz));

  // Easy rating: extra boost
  if (rating === "easy" && repetitionCount > 1) {
    intervalDays = Math.round(intervalDays * 1.3);
  }

  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + intervalDays);
  nextDueDate.setHours(0, 0, 0, 0);

  return {
    newEaseFactor: easeFactor,
    newInterval: intervalDays,
    newRepetitionCount: repetitionCount,
    nextDueDate,
  };
}

export function getInitialCard(): SRSCard {
  return { easeFactor: 2.5, intervalDays: 0, repetitionCount: 0 };
}

export function isDue(dueDate: string): boolean {
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due <= today;
}
