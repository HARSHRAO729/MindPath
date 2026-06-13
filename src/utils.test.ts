import { describe, it, expect } from 'vitest';
import {
  encryptContent,
  decryptContent,
  calculateResilienceScore,
  calculateStreak,
  formatDate,
  formatTime,
} from './utils';
import { JournalEntry, JournalAnalysis } from './types';

describe('MindPath Utility Functions', () => {
  describe('Privacy Masker Encryption/Decryption', () => {
    it('should return plain text when masking is disabled', () => {
      const original = 'Hello World of JEE Warrior';
      expect(encryptContent(original, false)).toBe(original);
      expect(decryptContent(original, false)).toBe(original);
    });

    it('should successfully encrypt and decrypt text when enabled', () => {
      const original = 'High tension before the organic chemistry session';
      const encrypted = encryptContent(original, true);
      
      expect(encrypted).not.toBe(original);
      expect(typeof encrypted).toBe('string');
      
      const decrypted = decryptContent(encrypted, true);
      expect(decrypted).toBe(original);
    });

    it('should gracefully return input text if decryption fails on non-base64', () => {
      const invalidEncrypted = '!!!not-base-64!!!';
      expect(decryptContent(invalidEncrypted, true)).toBe(invalidEncrypted);
    });
  });

  describe('Resilience Score Calculator', () => {
    const dummyAnalysis: JournalAnalysis = {
      moodSliderValue: 6,
      emotions: [{ name: 'Determination', intensity: 8 }],
      triggers: ['organic revision'],
      cognitiveDistortions: [],
      summary: 'Doing ok',
      insights: 'Pacing well',
      copingProtocol: 'Keep breathing',
      followUpQuestion: 'No issues',
      crisisFlag: false,
    };

    it('should return 0 when there are no journal entries', () => {
      expect(calculateResilienceScore([], 0, 0)).toBe(0);
    });

    it('should calculate custom score based on streak, coping use, and emotional logs', () => {
      const entries: JournalEntry[] = [
        {
          id: '1',
          date: new Date().toISOString(),
          content: 'Logged JEE study logs',
          manualMood: 6,
          analysis: dummyAnalysis,
          examContext: 'JEE',
        },
      ];

      // consistency component: min(40, streak * 8) = min(40, 3 * 8) = 24
      // active coping engagement: min(30, 2 * 10) = 20
      // emotional check-in: (1/1) * 30 = 30
      // Expect raw score close to 24 + 20 + 30 = 74
      const result = calculateResilienceScore(entries, 3, 2);
      expect(result).toBe(74);
    });

    it('should respect upper and lower bounds of resilience score (15 to 100)', () => {
      const entries: JournalEntry[] = [
        {
          id: '1',
          date: new Date().toISOString(),
          content: 'Feeling extremely tired',
          manualMood: 2,
          analysis: dummyAnalysis,
          examContext: 'NEET',
        },
      ];

      // Low parameters
      expect(calculateResilienceScore(entries, 0, 0)).toBe(30); // consistency: 0, coping: 0, analysis: 30

      // High parameters (should cap at 100)
      expect(calculateResilienceScore(entries, 10, 10)).toBe(100);
    });
  });

  describe('Streak Calculator', () => {
    it('should return 0 when entries are empty', () => {
      expect(calculateStreak([])).toBe(0);
    });

    it('should identify a single-day streak for today', () => {
      const entries: JournalEntry[] = [
        {
          id: '1',
          date: new Date().toISOString(),
          content: 'Today log',
          manualMood: 5,
          examContext: 'UPSC',
        },
      ];
      expect(calculateStreak(entries)).toBe(1);
    });

    it('should identify a multi-day streak for consecutive days', () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(today.getDate() - 2);

      const entries: JournalEntry[] = [
        { id: '1', date: today.toISOString(), content: 'Today', manualMood: 5, examContext: 'NEET' },
        { id: '2', date: yesterday.toISOString(), content: 'Yesterday', manualMood: 6, examContext: 'NEET' },
        { id: '3', date: twoDaysAgo.toISOString(), content: '2 days ago', manualMood: 7, examContext: 'NEET' },
      ];

      expect(calculateStreak(entries)).toBe(3);
    });

    it('should return 0 if the latest entry is older than yesterday', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const entries: JournalEntry[] = [
        { id: '1', date: threeDaysAgo.toISOString(), content: '3 days ago', manualMood: 5, examContext: 'GATE' },
      ];

      expect(calculateStreak(entries)).toBe(0);
    });
  });

  describe('Formatting Helpers', () => {
    it('should format date for human readability in Indian Locale format', () => {
      const dateString = '2026-06-13T08:00:00Z';
      const formatted = formatDate(dateString);
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Jun');
    });

    it('should format time correctly', () => {
      const dateString = '2026-06-13T14:30:00.000Z';
      const formatted = formatTime(dateString);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });
});
