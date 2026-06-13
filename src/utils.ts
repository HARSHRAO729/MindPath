/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JournalEntry } from './types';

// Simple privacy masker for client-side storage to protect from local exposure (US-03)
export const encryptContent = (text: string, enabled: boolean): string => {
  if (!enabled) return text;
  try {
    return btoa(encodeURIComponent(text));
  } catch (e) {
    return text;
  }
};

export const decryptContent = (maskedText: string, enabled: boolean): string => {
  if (!enabled) return maskedText;
  try {
    return decodeURIComponent(atob(maskedText));
  } catch (e) {
    return maskedText;
  }
};

// Resilience Score Calculator (F6)
// Based on: consistency, active coping, stability, and completion rates
export const calculateResilienceScore = (
  entries: JournalEntry[],
  streak: number,
  copingUseCount: number
): number => {
  if (entries.length === 0) return 0;

  // 1. Consistency component (max 40 pts)
  // Streak score: 1 day = 10pts, 3 days = 25pts, 5+ days = 40pts
  const consistencyScore = Math.min(40, streak * 8);

  // 2. Active coping engagement (max 30 pts)
  // Each practice session adds points
  const copingScore = Math.min(30, copingUseCount * 10);

  // 3. Emotional check-in rate (max 30 pts)
  // Average mood level and variance stability
  const totalCheckedMoods = entries.filter(e => e.analysis).length;
  const analysisScore = Math.min(30, (totalCheckedMoods / Math.max(1, entries.length)) * 30);

  const rawScore = Math.round(consistencyScore + copingScore + analysisScore);
  return Math.max(15, Math.min(100, rawScore)); // Base floor of 15 for returning warriors
};

// Streak Calculator
export const calculateStreak = (entries: JournalEntry[]): number => {
  if (entries.length === 0) return 0;

  const startOfLocalDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Sort dates descending
  const sortedDates = entries
    .map(e => new Date(e.date).toDateString())
    .filter((value, index, self) => self.indexOf(value) === index) // Unique days
    .map(d => startOfLocalDay(new Date(d)))
    .sort((a, b) => b.getTime() - a.getTime());

  if (sortedDates.length === 0) return 0;

  const today = startOfLocalDay(new Date());
  const yesterday = startOfLocalDay(new Date());
  yesterday.setDate(today.getDate() - 1);

  const newestDate = sortedDates[0];
  const diffDays = Math.round(Math.abs(today.getTime() - newestDate.getTime()) / (1000 * 60 * 60 * 24));

  // If the last entry is older than yesterday, streak has reset
  if (diffDays > 1 && newestDate.toDateString() !== today.toDateString()) {
    return 0;
  }

  let streak = 0;
  let expectedDate = newestDate;

  for (let i = 0; i < sortedDates.length; i++) {
    const current = sortedDates[i];
    const daysDiff = Math.round(Math.abs(expectedDate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      streak++;
      // Set expected to previous day
      expectedDate = new Date(expectedDate);
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

// Help helper for Indian currency stats formats or dates
export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
