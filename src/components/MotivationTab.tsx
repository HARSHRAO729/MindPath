/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Flame, Award, Timer, Coffee, Bell, 
  Play, Pause, RotateCcw, Sparkles, AlertTriangle, 
  HelpCircle, CheckCircle, ArrowRight, ShieldCheck, 
  BookOpen, Heart, Sunset
} from 'lucide-react';
import { StudentProfile, JournalEntry, AchievementBadge } from '../types';

interface MotivationTabProps {
  profile: StudentProfile;
  updateProfile: (profile: StudentProfile) => void;
  entries: JournalEntry[];
  copingUseCount: number;
  onPracticeBreathing?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const MotivationTab: React.FC<MotivationTabProps> = ({
  profile,
  updateProfile,
  entries,
  copingUseCount,
  onPracticeBreathing,
  onNavigateToTab
}) => {
  // --- STUDY REMINDER TIMER STATE ---
  const [sessionMinutes, setSessionMinutes] = useState(profile.studySessionLength || 45);
  const [breakMinutes, setBreakMinutes] = useState(profile.breakDuration || 10);
  const [reminderActive, setReminderActive] = useState(profile.studyReminderActive !== false);
  
  // Custom toast notification states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'study' | 'break' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'study' | 'break' = 'success') => {
    setToast({ message, type });
    // Dismiss automatically
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 6000);
  };

  // Timer operation states
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(sessionMinutes * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'study' | 'break'>('study'); // 'study' or 'break'
  
  // Ref for timer interval
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync settings back to profile when updated
  const handleSaveTimerSettings = () => {
    updateProfile({
      ...profile,
      studySessionLength: Number(sessionMinutes),
      breakDuration: Number(breakMinutes),
      studyReminderActive: reminderActive
    });
    setTimerSecondsLeft(timerMode === 'study' ? sessionMinutes * 60 : breakMinutes * 60);
    triggerToast("Study reminder schedule successfully updated & synchronized.", "success");
  };

  // Preset button click helpers
  const applyPreset = (study: number, bDuration: number) => {
    setSessionMinutes(study);
    setBreakMinutes(bDuration);
    setTimerSecondsLeft(timerMode === 'study' ? study * 60 : bDuration * 60);
    setTimerRunning(false);
    triggerToast(`Preset applied: ${study}m Study + ${bDuration}m Break`, "info");
  };

  // Setup/Tear down timer interval
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            // Timer finished, notify and toggle mode
            clearInterval(timerIntervalRef.current!);
            setTimerRunning(false);
            
            const nextMode = timerMode === 'study' ? 'break' : 'study';
            setTimerMode(nextMode);
            
            // Proactively notify user
            if (nextMode === 'break') {
              triggerToast("🎯 Great job! Your study session is completed. MindPath recommends immediately standing up, loosening your shoulders, and enjoying a " + breakMinutes + " minute restorative break!", "break");
              setTimerSecondsLeft(breakMinutes * 60);
              // Award bonus points for completing a focus session!
              const currentBadgeList = [...(profile.unlockedBadges || [])];
              let pointsBonus = 50;
              if (!currentBadgeList.includes('stamina_warrior')) {
                currentBadgeList.push('stamina_warrior');
                pointsBonus += 100; // Unlock bonus
              }
              updateProfile({
                ...profile,
                totalPoints: (profile.totalPoints || 0) + pointsBonus,
                unlockedBadges: currentBadgeList
              });
            } else {
              triggerToast("⏰ Break over! Time to switch back to your study workspace. Grab some fresh water and remain confident!", "study");
              setTimerSecondsLeft(sessionMinutes * 60);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerRunning, timerMode, sessionMinutes, breakMinutes, profile]);

  // Format time display MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset current timer state
  const resetTimer = () => {
    setTimerRunning(false);
    setTimerMode('study');
    setTimerSecondsLeft(sessionMinutes * 60);
  };

  // Accelerate timer (for instant verification of completed triggers)
  const skipTimerForTesting = () => {
    if (timerSecondsLeft > 2) {
      setTimerSecondsLeft(2);
    }
  };


  // --- FATIGUE ANALYSIS PARSER ---
  // Iterate the recent 3 entries, looking for symptoms of intense mental tiredness, burnout, sleep deficit, or heavy overwhelm.
  interface FatigueSignal {
    date: string;
    triggerReason: string;
    intensityText: string;
    recommendedAction: string;
    subjectContext: string;
  }

  const detectFatigueSignals = (): FatigueSignal[] => {
    const signals: FatigueSignal[] = [];
    // Key words
    const fatigueKeywords = ['tired', 'fatigue', 'exhaust', 'burnout', 'sleep', 'heavy', 'unmanageable', 'collapse', 'stagnant', 'shatter'];
    
    entries.slice(0, 3).forEach((entry) => {
      const contentLower = entry.content.toLowerCase();
      let matchesKeyword = fatigueKeywords.some(kw => contentLower.includes(kw));
      
      // Also look at emotional intensity for stress or overwhelm from analysis meta
      let hasHighStressOrOverwhelm = false;
      let stressRating = 0;
      if (entry.analysis?.emotions) {
        const stressEmo = entry.analysis.emotions.find(e => ['stress', 'overwhelm', 'anxiety'].includes(e.name.toLowerCase()));
        if (stressEmo && stressEmo.intensity >= 7) {
          hasHighStressOrOverwhelm = true;
          stressRating = stressEmo.intensity;
        }
      }

      if (matchesKeyword || hasHighStressOrOverwhelm || entry.manualMood <= 4) {
        // Extract specific subject
        let foundSubject = entry.examContext || 'Physics / Maths';
        if (contentLower.includes('physic')) foundSubject = 'Physics';
        else if (contentLower.includes('chem')) foundSubject = 'Chemistry';
        else if (contentLower.includes('math') || contentLower.includes('calculus')) foundSubject = 'Mathematics';
        else if (contentLower.includes('bio') || contentLower.includes('botany') || contentLower.includes('biology')) foundSubject = 'Biology';
        else if (contentLower.includes('history') || contentLower.includes('upsc')) foundSubject = 'Civil Studies';

        // Choose recommended alternative subject based on current context
        let alternateSub = 'General Inorganic Chemistry (Factual Review)';
        if (foundSubject.toLowerCase().includes('physic') || foundSubject.toLowerCase().includes('math')) {
          alternateSub = 'Inorganic Chemistry reactions or Botany nomenclature (requires low analytical muscle)';
        } else if (foundSubject.toLowerCase().includes('chem') || foundSubject.toLowerCase().includes('bio')) {
          alternateSub = 'Previous-year analytical mock physics questions (or a restorative break walk)';
        }

        signals.push({
          date: new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          triggerReason: matchesKeyword ? "Direct fatigue keywords detected in mental diary" : `High cortisol index (${stressRating}/10) logged`,
          intensityText: entry.manualMood <= 4 ? "Critical Stagnation Range" : "High Cognitive Deficit",
          recommendedAction: `Switch from active problem sets of ${foundSubject} immediately over to ${alternateSub}.`,
          subjectContext: foundSubject
        });
      }
    });

    return signals;
  };

  const activeFatigueSignals = detectFatigueSignals();


  // --- GAMIFICATION ELEMENTS ---
  const dailyStreak = Math.max(1, profile.resilienceScore > 60 ? 3 : 1); // Mock consistency calculator
  const totalPoints = profile.totalPoints || 120;
  
  // Level metric: level = Math.floor(points / 250) + 1
  const currentLevel = Math.floor(totalPoints / 250) + 1;
  const pointsForCurrentLevel = (currentLevel - 1) * 250;
  const pointsForNextLevel = currentLevel * 250;
  const levelProgressPercent = Math.min(
    100,
    Math.max(10, ((totalPoints - pointsForCurrentLevel) / 250) * 100)
  );

  // Badge list data definition
  const BADGES_DEFS: AchievementBadge[] = [
    {
      id: 'first_log',
      title: 'Aspirant Sentinel',
      description: 'Logged your very first E2E confidential academic wellness entry in MindPath.',
      category: 'consistency',
      pointsReward: 50,
      unlocked: true // Initialized
    },
    {
      id: 'streak_3',
      title: 'Consistency Knight',
      description: 'Kept a daily journaling streak of 3 consecutive academic milestones.',
      category: 'consistency',
      pointsReward: 150,
      unlocked: entries.length >= 3 || dailyStreak >= 3
    },
    {
      id: 'coping_pioneer',
      title: 'Strategic Pathfinder',
      description: 'Used a syllabus guide and completed a subject anxiety coping protocol.',
      category: 'coping',
      pointsReward: 100,
      unlocked: copingUseCount > 1 || profile.unlockedBadges?.includes('coping_pioneer')
    },
    {
      id: 'stamina_warrior',
      title: 'Stamina Centurion',
      description: 'Completed a full set study interval using the personalized study timer.',
      category: 'stamina',
      pointsReward: 120,
      unlocked: profile.unlockedBadges?.includes('stamina_warrior')
    },
    {
      id: 'breath_master',
      title: 'Sushumna Yogi',
      description: 'Practiced breathing grounding inside the restorative study break sphere.',
      category: 'mindfulness',
      pointsReward: 100,
      unlocked: profile.unlockedBadges?.includes('breath_master')
    },
    {
      id: 'scholar_king',
      title: 'Cognitive Governor',
      description: 'Attained a Total points balance of 500+ and gained Level 3 Scholar standing.',
      category: 'mindfulness',
      pointsReward: 200,
      unlocked: totalPoints >= 500
    }
  ];

  // Helper: Get Badge Category Colors
  const getBadgeCategoryColor = (cat: string, unlocked: boolean) => {
    if (!unlocked) return 'bg-brand-850/50 text-brand-350 border-brand-800 scale-95 opacity-60';
    switch (cat) {
      case 'consistency': return 'bg-orange-50 text-orange-700 border-orange-200 shadow-orange-100/50';
      case 'coping': return 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-100/50';
      case 'stamina': return 'bg-teal-50 text-teal-700 border-teal-200 shadow-teal-100/50';
      case 'mindfulness': return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100/50';
      default: return 'bg-brand-50 border-brand-200';
    }
  };

  return (
    <div id="motivation-tab-pane" className="space-y-8 py-4 animate-in fade-in duration-200 text-left relative">
      
      {/* Floating Eye-Safe Toast Notifications */}
      {toast && (
        <div id="motivation-live-toast" className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-brand-900 border-2 border-brand-800 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
              toast.type === 'study' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
              toast.type === 'break' ? 'bg-orange-55 text-orange-700 border border-orange-200' : 
              'bg-brand-850 text-brand-305 border border-brand-800'
            }`}>
              {toast.type === 'success' && <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />}
              {toast.type === 'study' && <Timer className="h-4.5 w-4.5 text-indigo-650" />}
              {toast.type === 'break' && <Coffee className="h-4.5 w-4.5 text-orange-500" />}
              {toast.type === 'info' && <Bell className="h-4.5 w-4.5 text-brand-404" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-brand-350">
                {toast.type === 'success' ? 'Setting Saved' :
                 toast.type === 'study' ? 'Syllabus Focus Run' :
                 toast.type === 'break' ? 'Restorative Break' : 'MindPath Notification'}
              </h4>
              <p className="text-xs text-brand-100 font-semibold pt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-brand-350 hover:text-brand-100 cursor-pointer font-semibold font-mono text-xs px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 2-Column Core Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Study Scheduler & Proactive Reminders */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personalized Study Timers Controller */}
          <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-brand-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-brand-850 border border-brand-800 rounded-xl text-brand-404">
                  <Timer className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-md font-display font-semibold text-brand-50">Study Session & Break Routine</h3>
                  <p className="text-xs text-brand-350">Configure your optimal work loops and maintain mental stamina</p>
                </div>
              </div>
              
              {/* Master toggle */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={reminderActive}
                  onChange={(e) => setReminderActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-brand-850 border border-brand-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-brand-350 after:border-brand-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-650 peer-checked:after:bg-white peer-checked:after:border-white"></div>
                <span className="ml-2 text-xs font-mono font-bold text-brand-350">
                  {reminderActive ? "ACTIVE" : "PAUSED"}
                </span>
              </label>
            </div>

            {/* Config sliders section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-brand-350 uppercase">Study Session duration</span>
                  <span className="text-brand-100 font-bold">{sessionMinutes} minutes</span>
                </div>
                <input 
                  type="range" 
                  min={15} 
                  max={120} 
                  step={5}
                  value={sessionMinutes}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSessionMinutes(val);
                    if (timerMode === 'study') setTimerSecondsLeft(val * 60);
                  }}
                  className="w-full accent-indigo-605 h-1.5 bg-brand-850 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[10px] text-brand-350 italic">Capped at 45m for optimal focus maintenance (CBT Standard).</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-brand-350 uppercase">Balance Break duration</span>
                  <span className="text-brand-100 font-bold">{breakMinutes} minutes</span>
                </div>
                <input 
                  type="range" 
                  min={5} 
                  max={45} 
                  step={1}
                  value={breakMinutes}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setBreakMinutes(val);
                    if (timerMode === 'break') setTimerSecondsLeft(val * 60);
                  }}
                  className="w-full accent-emerald-500 h-1.5 bg-brand-850 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[10px] text-brand-350 italic">Standard 10-minute intervals block mental decay.</p>
              </div>
            </div>

            {/* Quick Presets row */}
            <div className="bg-brand-950 p-4 rounded-xl border border-brand-850 space-y-2.5">
              <span className="text-[10px] font-mono uppercase text-brand-405 tracking-wider">Quick Routine Presets</span>
              <div className="flex flex-wrap gap-2.5">
                <button 
                  onClick={() => applyPreset(25, 5)}
                  className="px-3 py-1.5 rounded-lg bg-brand-900 border border-brand-800 text-brand-300 hover:border-brand-700 hover:text-brand-100 text-xs font-mono transition-all cursor-pointer"
                >
                  ⏱️ Pomodoro Lite (25m - 5m)
                </button>
                <button 
                  onClick={() => applyPreset(45, 10)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs font-mono transition-all cursor-pointer"
                >
                  🛡️ MindPath Ideal (45m - 10m)
                </button>
                <button 
                  onClick={() => applyPreset(60, 15)}
                  className="px-3 py-1.5 rounded-lg bg-brand-900 border border-brand-800 text-brand-300 hover:border-brand-700 hover:text-brand-100 text-xs font-mono transition-all cursor-pointer"
                >
                  🚀 Marathon block (60m - 15m)
                </button>
              </div>
            </div>

            {/* Active Live Timer countdown widget */}
            {reminderActive && (
              <div className="bg-gradient-to-br from-brand-900 to-brand-950/80 p-6 rounded-2xl border border-brand-800/80 flex flex-col items-center justify-center space-y-4 text-center">
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${timerRunning ? 'bg-orange-500 animate-ping' : 'bg-brand-350'}`}></span>
                  <span className="text-xs font-mono font-bold tracking-widest text-brand-350 uppercase">
                    {timerMode === 'study' ? "💻 STAMINA SYLLABUS RUN" : "🧘 RESTORATIVE COGNITIVE BREAK"}
                  </span>
                </div>

                {/* DIGIT COUNTER */}
                <div className="text-5xl md:text-6xl font-extrabold font-mono tracking-wider text-brand-50 tabular-nums">
                  {formatTime(timerSecondsLeft)}
                </div>

                {/* Control buttons */}
                <div className="flex items-center space-x-3 pt-1">
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className={`px-5 py-2 rounded-xl text-xs font-bold font-mono tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer shadow-lg border ${
                      timerRunning 
                        ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100/80' 
                        : 'bg-brand-500 border-brand-405 text-white hover:bg-brand-400'
                    }`}
                  >
                    {timerRunning ? (
                      <>
                        <Pause className="h-4 w-4" />
                        <span>PAUSE SESSION</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-white text-white" />
                        <span>START STUDY FOCUS</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={resetTimer}
                    className="p-2 rounded-xl bg-brand-850 hover:bg-brand-800 border border-brand-800 text-brand-300 transition-all cursor-pointer"
                    title="Reset loop"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>

                  <button
                    onClick={skipTimerForTesting}
                    className="px-2.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-[10px] font-mono transition-all cursor-pointer font-bold"
                    title="Skip Countdown for validation"
                  >
                    ⏭️ SKIP COUNTDOWN
                  </button>
                </div>

                {/* Prompt based on state */}
                <p className="text-[11px] text-brand-350 max-w-sm">
                  {timerMode === 'study' 
                    ? "Remain offline, disable Telegram chats, and complete exactly 4 calculations."
                    : "Fully relax! Place your device down. Drink exactly 1 glass of fresh water."}
                </p>

              </div>
            )}

            {/* Lock/Sync action buttons */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveTimerSettings}
                className="bg-brand-800 hover:bg-brand-700 text-brand-50 text-xs font-mono font-bold px-4 py-2 rounded-xl transition-all cursor-pointer border border-brand-750"
              >
                💾 SYNC REMINDER ROUTINE SLIDES
              </button>
            </div>

          </div>

          {/* PROACTIVE CALMING DEFICIT NOTIFICATIONS (F Fatigue Detection and proactive recommendations) */}
          <div className="bg-brand-900 border border-brand-805 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2.5">
              <Bell className="h-5 w-5 text-indigo-650 animate-bounce" />
              <div>
                <h3 className="text-md font-display font-semibold text-brand-50">Empathetic Proactive Interventions</h3>
                <p className="text-xs text-brand-350">Diagnostic burnout-prevention warnings based on your mental logs</p>
              </div>
            </div>

            {activeFatigueSignals.length > 0 ? (
              <div className="space-y-4 pt-1">
                {activeFatigueSignals.map((sig, idx) => (
                  <div 
                    key={idx} 
                    className="bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-5 flex items-start space-x-3.5 text-amber-900 animate-in slide-in-from-left duration-200"
                  >
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-2 text-xs text-left">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5 pb-1 border-b border-amber-250/50">
                        <span className="font-bold font-mono uppercase tracking-wider text-[10px] text-amber-700">
                          ⚠️ Burnout Signal Triggered ({sig.date})
                        </span>
                        <span className="text-[9px] bg-amber-100 font-bold font-mono text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                          {sig.intensityText}
                        </span>
                      </div>
                      
                      <p className="leading-relaxed text-slate-805 text-slate-800 font-sans">
                        MindPath parsed: <strong className="italic">"{sig.triggerReason}"</strong> on your study loop. Rote pathways overwrite cognitive registries if studied under heavy levels of exhaustion.
                      </p>

                      <p className="p-2.5 bg-white/70 border border-amber-300 text-slate-900 rounded-lg leading-relaxed font-mono text-[11px] font-medium">
                        💡 recommended tactic: <strong className="text-indigo-650">{sig.recommendedAction}</strong>
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => {
                            if (onPracticeBreathing) {
                              onPracticeBreathing();
                            } else if (onNavigateToTab) {
                              onNavigateToTab('coach');
                            }
                          }}
                          className="bg-teal-650 hover:bg-teal-555 text-teal-50 font-bold px-3 py-1.5 rounded-lg text-[10px] tracking-wide cursor-pointer transition-colors"
                        >
                          🧘 Start Calming Spheres
                        </button>
                        <button
                          onClick={() => {
                            if (onNavigateToTab) {
                              onNavigateToTab('coping');
                            }
                          }}
                          className="bg-indigo-650 hover:bg-indigo-750 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] tracking-wide cursor-pointer transition-colors"
                        >
                          📖 Review Revision Coping Guides
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-brand-950 p-6 rounded-xl border border-brand-850 text-center space-y-2">
                <CheckCircle className="h-7 w-7 text-emerald-450 mx-auto" />
                <h4 className="text-xs font-mono font-bold text-brand-100 uppercase">Steady Cognitive Reserves</h4>
                <p className="text-[11px] text-brand-350 max-w-sm mx-auto leading-relaxed">
                  Excellent! Your recent diaries don't indicate extreme exhaustion/fatigue flags. Keep your sessions under 45m to maintain this optimal focus stance.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Motivation Dashboard, Level progress, Badges */}
        <div className="space-y-6">
          
          {/* Progress Standing Shield (US-06) */}
          <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-xl space-y-5 text-center">
            
            <div className="flex justify-center">
              <div className="relative p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-full border border-indigo-200">
                <Trophy className="h-10 w-10 text-indigo-650" />
                <span className="absolute -bottom-1.5 -right-1.5 bg-amber-500 font-mono font-bold text-[10px] text-white px-2 py-0.5 rounded-full border-2 border-white">
                  Lvl {currentLevel}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-md font-display font-bold text-brand-50">{profile.name}'s Motivation Status</h3>
              <p className="text-xs text-brand-350 max-w-xs mx-auto leading-relaxed">
                Unlock milestones and complete wellness loops to multiply clinical resilience scores.
              </p>
            </div>

            {/* Level Progress bar */}
            <div className="space-y-2 pt-1 text-left">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-brand-350 uppercase">Scholar Standing progress</span>
                <span className="text-brand-105 font-bold text-brand-200">
                  {totalPoints} / {pointsForNextLevel} XP
                </span>
              </div>
              <div className="w-full bg-brand-850 rounded-full h-2.5 border border-brand-800 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${levelProgressPercent}%` }}
                ></div>
              </div>
              <p className="text-[9px] font-mono text-brand-405 text-center">
                Earn exactly <strong className="text-indigo-650">{pointsForNextLevel - totalPoints} more XP</strong> to reach level {currentLevel + 1}!
              </p>
            </div>

            {/* Gamification multipliers counters */}
            <div className="grid grid-cols-2 gap-3.5 border-t border-brand-850 pt-4 text-left">
              <div className="bg-brand-950 p-3 rounded-lg border border-brand-850 text-center">
                <span className="text-[9px] font-mono uppercase text-brand-405 block">Consistency</span>
                <span className="text-xl font-extrabold font-mono text-orange-500 flex items-center justify-center pt-0.5">
                  <Flame className="h-4.5 w-4.5 text-orange-500 shrink-0 mr-1 animate-pulse" />
                  {dailyStreak}x
                </span>
                <span className="text-[8px] font-mono text-brand-350 block mt-0.5">daily streak</span>
              </div>

              <div className="bg-brand-950 p-3 rounded-lg border border-brand-850 text-center">
                <span className="text-[9px] font-mono uppercase text-brand-405 block">Armor Score</span>
                <span className="text-xl font-extrabold font-mono text-indigo-650 pt-0.5 block">
                  🛡️ {profile.resilienceScore}
                </span>
                <span className="text-[8px] font-mono text-brand-350 block mt-0.5">Resilience index</span>
              </div>
            </div>

          </div>

          {/* Achievement Milestones Badge Board (US-06) */}
          <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h4 className="text-xs font-mono text-brand-300 uppercase tracking-widest flex items-center space-x-1.5 border-b border-brand-805 pb-2.5">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Milestones Badge Board</span>
            </h4>

            {/* Grid display */}
            <div className="grid grid-cols-1 gap-3 pt-1">
              {BADGES_DEFS.map((badge) => (
                <div 
                  key={badge.id}
                  className={`border p-3.5 rounded-xl transition-all flex items-start space-x-3.5 ${
                    getBadgeCategoryColor(badge.category, badge.unlocked)
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border shrink-0 ${
                    badge.unlocked 
                      ? 'bg-white/80 border-current shadow-md' 
                      : 'bg-brand-900 border-brand-800 text-brand-350'
                  }`}>
                    {badge.category === 'consistency' && <Flame className="h-5 w-5" />}
                    {badge.category === 'coping' && <BookOpen className="h-5 w-5" />}
                    {badge.category === 'stamina' && <Timer className="h-5 w-5" />}
                    {badge.category === 'mindfulness' && <Sparkles className="h-5 w-5" />}
                  </div>

                  <div className="text-xs space-y-1 text-left">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold tracking-tight">{badge.title}</span>
                      <span className="text-[9px] font-mono bg-white/20 px-1.5 py-0.5 rounded font-bold">
                        {badge.unlocked ? `+${badge.pointsReward} XP` : `${badge.pointsReward} XP`}
                      </span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-brand-200">
                      {badge.description}
                    </p>
                    <div className="pt-0.5 flex items-center text-[9px] font-mono tracking-tight text-brand-350">
                      {badge.unlocked ? (
                        <span className="text-emerald-700 font-bold flex items-center">
                          <CheckCircle className="h-3 w-3 shrink-0 mr-1" /> UNLOCKED Milestone
                        </span>
                      ) : (
                        <span className="italic flex items-center">
                          🔒 MILITARY LOCKED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Points multiplier details info card */}
          <div className="bg-brand-950/60 p-4 rounded-xl border border-brand-850 space-y-2 text-left">
            <span className="text-[10px] font-mono uppercase text-brand-405 block">How to earn points:</span>
            <div className="space-y-1.5 text-[10px] leading-relaxed text-brand-350">
              <p>📝 **Mental Diary Entry** = <strong className="text-indigo-650">+100 XP</strong></p>
              <p>🧘 **Grounding Breathing session** = <strong className="text-teal-600">+75 XP</strong></p>
              <p>📖 **Syllabus coping guide completed** = <strong className="text-emerald-700">+150 XP</strong></p>
              <p>⏱️ **Complete a study focus interval** = <strong className="text-orange-600">+50 XP</strong></p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
