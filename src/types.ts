/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Core Exam Types
export type ExamType = 'JEE' | 'NEET' | 'UPSC' | 'CAT' | 'GATE' | 'CUET' | 'OTHER';

// Emotion Tag
export interface EmotionScore {
  name: string;      // e.g., 'Anxiety', 'Overwhelm', 'Calm', 'Determination', 'Confidence', 'Loneliness'
  intensity: number; // 0 to 10
}

// AI Analysis Result for a Journal Entry
export interface JournalAnalysis {
  moodSliderValue: number;        // Estimated mood score (1-10)
  emotions: EmotionScore[];       // NLP tag across core emotions
  triggers: string[];             // Specific triggers parsed (e.g., 'physics mock-test', 'family guilt')
  cognitiveDistortions: string[]; // e.g., 'Catastrophising', 'Black-and-White thinking'
  summary: string;                // Warm, empathetic summary of how they are feeling
  insights: string;               // Key insight about what caused their current state
  copingProtocol: string;         // Personalised exam-centric tip
  followUpQuestion: string;       // Smart guided next question for prompting
  crisisFlag: boolean;            // Real-time mental crisis flag
}

// Single Journal Entry model stored on client
export interface JournalEntry {
  id: string;
  date: string;                   // ISO date string
  content: string;
  manualMood: number;             // Explicit user slider mood (1-10)
  analysis?: JournalAnalysis;     // Populated by server-side AI
  examContext: ExamType;          // What exam they are preparing for
}

// Chat Messages
export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
}

// Subject-Specific Anxiety Protocol Guide structure
export interface CopingGuide {
  id: string;
  title: string;
  subjectContext: string;         // Exam/Subject e.g. "Physics / Chemistry numericals"
  description: string;
  steps: string[];
}

// Trusted Contact details
export interface TrustedContact {
  name: string;
  contact: string;
  relation: string;
}

// Student User Profile
export interface StudentProfile {
  name: string;
  currentExam: ExamType;
  examDate?: string;              // Exam date to track calendar proximity
  passcode: string;               // Confidential secure vault passcode
  isLocked: boolean;              // Stealth mode privacy setting
  stealthIcon: boolean;           // Discrete stealth visual icon choice
  trustedContact?: TrustedContact;
  resilienceScore: number;        // Gamified score based on streaks and usage
  
  // New Study Reminders & Gamification parameters
  studySessionLength: number;     // in minutes
  breakDuration: number;          // in minutes
  studyReminderActive: boolean;   // master toggle
  totalPoints: number;            // accumulated gamified score
  unlockedBadges: string[];       // lists unlocked badges IDs (e.g., 'first_log', 'streak_3', etc.)
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: 'consistency' | 'coping' | 'mindfulness' | 'stamina';
  pointsReward: number;
  unlocked: boolean;
}
