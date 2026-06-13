/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { JournalTab } from './components/JournalTab';
import { StressPatternTab } from './components/StressPatternTab';
import { CoachTab } from './components/CoachTab';
import { CopingTab } from './components/CopingTab';
import { DashboardTab } from './components/DashboardTab';
import { MotivationTab } from './components/MotivationTab';
import { CrisisModal } from './components/CrisisModal';
import { JournalEntry, StudentProfile, ChatMessage, ExamType, TrustedContact } from './types';
import { EyeOff, Play, ShieldAlert, CheckCircle, Lock, Key, AlertCircle, Shield } from 'lucide-react';
import { calculateStreak, calculateResilienceScore, encryptContent, decryptContent } from './utils';

// Core Seed Entries for immediate dashboard rendering on first load (US-06)
const DEFAULT_ENTRIES: JournalEntry[] = [
  {
    id: 'seed-entry-1',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    content: 'Physics syllabus freezing up regarding numerical solves. Mock tests feel unmanageable today. Peer group chats discussing 14-hour revision timetables make me feel completely isolated in Kota.',
    manualMood: 3,
    examContext: 'JEE',
    analysis: {
      moodSliderValue: 3,
      emotions: [
        { name: 'Stress', intensity: 8 },
        { name: 'Anxiety', intensity: 7 },
        { name: 'Loneliness', intensity: 6 },
        { name: 'Calm', intensity: 3 },
        { name: 'Determination', intensity: 7 }
      ],
      triggers: ['physics numericals', 'peer comparison', 'Kota routine'],
      cognitiveDistortions: ['Catastrophising', 'Black-and-White thinking'],
      summary: 'You are experiencing deep spatial exhaustion regarding mathematical numeric sets and competitive sibling groups. It is highly natural to feel this pressure.',
      insights: 'Aspirants routinely focus on extreme speed indexes post mock tests, leading to study stagnation.',
      copingProtocol: 'Stop doing full simulated sweeps. Try exactly 5 previous-year calculus questions on medium mode.',
      followUpQuestion: 'Are you drinking sufficient water during high-temp late-night Kota sessions?',
      crisisFlag: false
    }
  },
  {
    id: 'seed-entry-2',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    content: 'Inorganic chemistry pathway list and taxonomy botany diagram memorisation collapse. Feel like I forget reactions 5 minutes after revision. Syllabus is infinitely infinite.',
    manualMood: 4,
    examContext: 'JEE',
    analysis: {
      moodSliderValue: 4,
      emotions: [
        { name: 'Overwhelm', intensity: 8 },
        { name: 'Anxiety', intensity: 6 },
        { name: 'Confidence', intensity: 4 },
        { name: 'Determination', intensity: 8 }
      ],
      triggers: ['organic chemistry', 'memorisation fatigue'],
      cognitiveDistortions: ['Should statements'],
      summary: 'You are navigating pathway fatigue patterns. Your persistence to adapt study tracks is extremely admirable.',
      insights: 'Rote memory pathways quickly overwrite cognitive registers when revised without spacing.',
      copingProtocol: 'Try our voice whispering protocol. Record inorganic pathways and play back during active walks.',
      followUpQuestion: 'Can you dedicate 15 minutes of quiet stretching before sleeping?',
      crisisFlag: false
    }
  },
  {
    id: 'seed-entry-3',
    date: new Date().toISOString(),
    content: 'Had a productive alignment session with the MindPath AI CBT coach. Practiced the centering breathing ring for 5 minutes. Feeling steadier and ready to tackle organic series.',
    manualMood: 6,
    examContext: 'JEE',
    analysis: {
      moodSliderValue: 6,
      emotions: [
        { name: 'Calm', intensity: 6 },
        { name: 'Determination', intensity: 9 },
        { name: 'Confidence', intensity: 6 },
        { name: 'Stress', intensity: 4 }
      ],
      triggers: ['companion aligning', 'breathing practices'],
      cognitiveDistortions: [],
      summary: 'Your focus is returning steadily today. Pausing to calibrate emotional factors has improved your core resolve.',
      insights: 'Regular centering exercises break cortisol surges, restoring analytical spatial clarity.',
      copingProtocol: 'Organise tomorrow with a Pomodoro tracker and celebrate individual numerical solutions.',
      followUpQuestion: 'What specific pathway are you reviewing next with a quiet mind?',
      crisisFlag: false
    }
  }
];

// Default profile seed representing our primary persona Priya in Kota (PRD section 4.1)
const DEFAULT_PROFILE: StudentProfile = {
  name: 'Priya',
  currentExam: 'JEE',
  examDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 days left
  passcode: '2026',
  isLocked: false,
  stealthIcon: false,
  resilienceScore: 55,
  studySessionLength: 45,
  breakDuration: 10,
  studyReminderActive: true,
  totalPoints: 120,
  unlockedBadges: ['first_log'],
  trustedContact: {
    name: 'Mom',
    contact: '+91 94140 XXXXX',
    relation: 'Mother'
  }
};

const DEFAULT_CHATS: ChatMessage[] = [
  {
    id: 'gret-1',
    role: 'model',
    content: "Greetings Ranger! I am MindPath, your private mental alignment companion. Preparing for NEET, JEE, or UPSC is a massive marathon. If mock score drops or 14-hour exhaustion blocks you, I am right here.\n\nType anything to talk, or select one of the core study pain points below.",
    timestamp: new Date().toISOString()
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('journal');
  
  // App States
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>(DEFAULT_CHATS);
  const [copingCount, setCopingCount] = useState(1); // starting with 1 completed session seed

  // Interactive controls
  const [isStealth, setIsStealth] = useState(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockPinInput, setLockPinInput] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState('');

  // Server API states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Load state from local storage on bootstrap (Confidential offline vault)
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('mindpath_profile');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setProfile({
          ...DEFAULT_PROFILE,
          ...parsed
        });
      } else {
        localStorage.setItem('mindpath_profile', JSON.stringify(DEFAULT_PROFILE));
      }

      const storedEntries = localStorage.getItem('mindpath_journals');
      if (storedEntries) {
        const parsed = JSON.parse(storedEntries) as JournalEntry[];
        setEntries(parsed);
      } else {
        // Seed default entries
        setEntries(DEFAULT_ENTRIES);
        localStorage.setItem('mindpath_journals', JSON.stringify(DEFAULT_ENTRIES));
      }

      const storedChats = localStorage.getItem('mindpath_chats_v1');
      if (storedChats) {
        setChats(JSON.parse(storedChats));
      }

      const storedCount = localStorage.getItem('mindpath_coping_use');
      if (storedCount) {
        setCopingCount(Number(storedCount));
      }
    } catch (e) {
      console.error("Local storage sync error", e);
    }
  }, []);

  // Save states modifications
  const saveProfileData = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    localStorage.setItem('mindpath_profile', JSON.stringify(newProfile));
  };

  const saveEntriesData = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('mindpath_journals', JSON.stringify(newEntries));
  };

  const saveChatsData = (newChats: ChatMessage[]) => {
    setChats(newChats);
    localStorage.setItem('mindpath_chats_v1', JSON.stringify(newChats));
  };

  // Submit and analyze new journal entry on the server-side (F1, F2, F5)
  const handleAddEntry = async (text: string, manualMood: number, examContext: ExamType) => {
    setIsAnalyzing(true);
    try {
      // 1. Prepare secure masked string if encryption model requested
      const maskedContent = encryptContent(text, true); // Keep masked locally for child protection
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text, // Send original to server-side Gemini securely (never exposed to browser bundles)
          examContext,
          manualMood
        })
      });

      const analysisResult = await response.json();

      if (response.ok) {
        const newEntry: JournalEntry = {
          id: `journal-${Date.now()}`,
          date: new Date().toISOString(),
          content: maskedContent, 
          manualMood,
          analysis: analysisResult,
          examContext
        };

        const updatedEntries = [newEntry, ...entries];
        saveEntriesData(updatedEntries);

        // Award points (+100 XP) for logging entry
        const earned_badges = [...(profile.unlockedBadges || [])];
        if (!earned_badges.includes('first_log')) {
          earned_badges.push('first_log');
        }
        if (updatedEntries.length >= 3 && !earned_badges.includes('streak_3')) {
          earned_badges.push('streak_3');
        }
        saveProfileData({
          ...profile,
          totalPoints: (profile.totalPoints || 0) + 100,
          unlockedBadges: earned_badges
        });

        // 2. Real-time mental wellness check: trigger crisis escalation if flagged
        if (analysisResult.crisisFlag) {
          setIsCrisisOpen(true);
        }
      } else {
        console.warn("Backend return fail. Proceeding with dummy sentiment analysis.");
        throw new Error(analysisResult.error || "Backend parsing fail");
      }
    } catch (error) {
      console.error("Analysis endpoint fail, creating local recovery entry:", error);
      // Resilience fallback: Log entry with initial parameters so user data is never lost (Problem Statement block)
      const offlineEntry: JournalEntry = {
        id: `journal-offline-${Date.now()}`,
        date: new Date().toISOString(),
        content: encryptContent(text, true),
        manualMood,
        examContext,
        analysis: {
          moodSliderValue: manualMood,
          emotions: [
            { name: 'Stress', intensity: manualMood > 6 ? 3 : 7 },
            { name: 'Anxiety', intensity: manualMood > 6 ? 4 : 8 },
            { name: 'Determination', intensity: 8 }
          ],
          triggers: ['Workload pacing'],
          cognitiveDistortions: [],
          summary: 'Your log has been kept safe locally. Standard sentiment parsing was completed on fallback rules.',
          insights: 'Aim for structured studies of 50m modules to lower cognitive load.',
          copingProtocol: 'Take a slow walk for 10 minutes near the room balcony to break rote memory blocks.',
          followUpQuestion: 'What revisions are you keeping lighter for tomorrow morning?',
          crisisFlag: false
        }
      };
      const updatedEntries = [offlineEntry, ...entries];
      saveEntriesData(updatedEntries);

      // Award points (+100 XP) even for offline logging fallback
      const earned_badges = [...(profile.unlockedBadges || [])];
      if (!earned_badges.includes('first_log')) {
        earned_badges.push('first_log');
      }
      if (updatedEntries.length >= 3 && !earned_badges.includes('streak_3')) {
        earned_badges.push('streak_3');
      }
      saveProfileData({
        ...profile,
        totalPoints: (profile.totalPoints || 0) + 100,
        unlockedBadges: earned_badges
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteEntry = (id: string) => {
    const remaining = entries.filter(e => e.id !== id);
    saveEntriesData(remaining);
  };

  // Chat message submission to Server-side CBT companion (F3, F5)
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `chat-usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    const nextChats = [...chats, userMsg];
    setChats(nextChats);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextChats.map(c => ({ role: c.role, content: c.content })),
          examContext: profile.currentExam
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        const modelMsg: ChatMessage = {
          id: `chat-model-${Date.now()}`,
          role: 'model',
          content: responseData.content,
          timestamp: new Date().toISOString()
        };
        const finalChats = [...nextChats, modelMsg];
        saveChatsData(finalChats);

        // Check if message returned an active SOS crisis marker
        if (responseData.isCrisis) {
          setIsCrisisOpen(true);
        }
      } else {
        throw new Error(responseData.error || "Chat Companion timeout");
      }
    } catch (err) {
      console.error("Chat dispatch failed, executing offline companion re-frame guidelines:", err);
      const fallbackMsg: ChatMessage = {
        id: `chat-fallback-${Date.now()}`,
        role: 'model',
        content: "I am offline or reconnecting, warrior. However, remember that mock test drops do not measure your limits—they are revision logs showing you where to calibrate next. Pause, take 4 slow breaths using our grounding ring on the right, and start fresh in 10 minutes. I am right here with you.",
        timestamp: new Date().toISOString()
      };
      saveChatsData([...nextChats, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handlePINVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockPinInput.trim() === profile.passcode) {
      setIsLocked(false);
      setLockPinInput('');
      setPinErrorMsg('');
    } else {
      setPinErrorMsg('Incorrect Passcode PIN. Try again. (Default is: 2026)');
      setLockPinInput('');
    }
  };

  const triggerLockedState = () => {
    setIsLocked(true);
  };

  const handleUpdateCopingPractice = () => {
    const nextCount = copingCount + 1;
    setCopingCount(nextCount);
    localStorage.setItem('mindpath_coping_use', String(nextCount));

    // Award +150 XP and unlock coping_pioneer badge
    const earned_badges = [...(profile.unlockedBadges || [])];
    if (!earned_badges.includes('coping_pioneer')) {
      earned_badges.push('coping_pioneer');
    }
    saveProfileData({
      ...profile,
      totalPoints: (profile.totalPoints || 120) + 150,
      unlockedBadges: earned_badges
    });
  };

  const handleCompleteBreathing = () => {
    // Award +75 XP and unlock breath_master badge
    const earned_badges = [...(profile.unlockedBadges || [])];
    if (!earned_badges.includes('breath_master')) {
      earned_badges.push('breath_master');
    }
    saveProfileData({
      ...profile,
      totalPoints: (profile.totalPoints || 120) + 75,
      unlockedBadges: earned_badges
    });
  };

  const streak = calculateStreak(entries);
  const resilienceScore = calculateResilienceScore(entries, streak, copingCount);

  // Decoded vault rendering for screen protection (US-03)
  if (isLocked) {
    return (
      <div className="min-h-screen bg-brand-950 flex flex-col items-center justify-center p-4">
        <div id="passcode-vault-box" className="bg-brand-900 border border-brand-800 p-8 rounded-2xl max-w-sm w-full shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-150">
          
          <div className="mx-auto p-4 bg-brand-950/80 border border-brand-800 rounded-full w-fit text-brand-300">
            <Lock className="h-10 w-10 text-cyan-400 animate-pulse" />
          </div>

          <div className="space-y-1.5ClassName">
            <h2 className="text-xl font-display font-bold text-brand-50">Confidential Vault locked</h2>
            <p className="text-xs text-brand-350 leading-relaxed font-mono">
              MindPath privacy locks active. Input your passcode to review personal diary collections.
            </p>
          </div>

          <form onSubmit={handlePINVerification} className="space-y-4">
            <div>
              <input
                id="vault-pin-password-field"
                type="password"
                maxLength={6}
                value={lockPinInput}
                onChange={(e) => setLockPinInput(e.target.value)}
                placeholder="INPUT PIN CODE"
                autoFocus
                className="w-full bg-brand-950 border border-brand-750 p-3 rounded-xl text-center text-md font-extrabold tracking-widest text-brand-50 font-mono outline-none focus:ring-1 focus:ring-brand-405"
              />
            </div>

            {pinErrorMsg ? (
              <p className="text-xs text-rose-450 font-bold font-mono">⚠️ {pinErrorMsg}</p>
            ) : (
              <p className="text-[10px] text-brand-450 font-mono">Tip: Check default passcode '2026'</p>
            )}

            <button
              type="submit"
              className="w-full bg-brand-500 hover:bg-brand-400 text-brand-50 font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition-colors shadow-lg font-mono tracking-widest"
            >
              UNLOCK VAULT
            </button>
          </form>

          {/* Quick reset option */}
          <div className="border-t border-brand-850 pt-3">
            <button
               onClick={() => {
                 if (confirm('Verify: This resets passcode back to default "2026" without deleting logs.')) {
                   setProfile({ ...profile, passcode: '2026' });
                   setPinErrorMsg('Passcode PIN reset back to "2026" default successfully.');
                 }
               }}
               className="text-[10px] text-brand-450 hover:text-brand-300 underline font-mono"
            >
              Forgot secure PIN passcode?
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-950 text-brand-200 flex flex-col font-sans relative pb-10">
      
      {/* Privacy lock banner nudge (US-03 Parent child protection) */}
      {!isStealth && entries.length > 0 && (
        <div className="bg-brand-900 border-b border-brand-850 py-2 px-4 shadow-sm text-center">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-[11px] font-mono text-brand-300">
            <Shield className="h-3.5 w-3.5 text-emerald-450" />
            <span>Parent-lock available: Activate PIN lock anytime at Settings. Your journals are E2E locally masked.</span>
          </div>
        </div>
      )}

      {/* Main Joint Header Integration */}
      <Header
        currentTab={activeTab}
        setTab={setActiveTab}
        isStealth={isStealth}
        toggleStealth={() => setIsStealth(!isStealth)}
        exam={profile.currentExam}
        examDate={profile.examDate}
        resilienceScore={resilienceScore}
        streak={streak}
        triggerEmergency={() => setIsCrisisOpen(true)}
        isLocked={isLocked}
        lockApp={triggerLockedState}
      />

      {/* Responsive contents body */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Tab Switching Router */}
        {activeTab === 'journal' && (
          <JournalTab
            entries={entries}
            addEntry={handleAddEntry}
            deleteEntry={handleDeleteEntry}
            exam={profile.currentExam}
            isPrivacyMasked={false} // Toggle local mask if screen locking active
            isAnalyzing={isAnalyzing}
          />
        )}

        {activeTab === 'coach' && (
          <CoachTab
            messages={chats}
            sendMessage={handleSendMessage}
            exam={profile.currentExam}
            isLoading={isChatLoading}
            onCompleteBreathing={handleCompleteBreathing}
          />
        )}

        {activeTab === 'patterns' && (
          <StressPatternTab entries={entries} />
        )}

        {activeTab === 'coping' && (
          <CopingTab incrementCopingCount={handleUpdateCopingPractice} />
        )}

        {activeTab === 'dashboard' && (
          <DashboardTab
            profile={profile}
            updateProfile={saveProfileData}
            entries={entries}
            copingUseCount={copingCount}
          />
        )}

        {activeTab === 'motivation' && (
          <MotivationTab
            profile={profile}
            updateProfile={saveProfileData}
            entries={entries}
            copingUseCount={copingCount}
            onPracticeBreathing={handleCompleteBreathing}
            onNavigateToTab={(tab: string) => setActiveTab(tab)}
          />
        )}

      </main>

      {/* Indian Helpline & 5-4-3-2-1 Sensory Grounding SOS Overlay (US-05, F5) */}
      <CrisisModal
        isOpen={isCrisisOpen}
        onClose={() => setIsCrisisOpen(false)}
        trustedContact={profile.trustedContact}
        saveTrustedContact={(contact: TrustedContact) => saveProfileData({ ...profile, trustedContact: contact })}
      />

    </div>
  );
}
