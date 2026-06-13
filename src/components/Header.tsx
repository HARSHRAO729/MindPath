/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, EyeOff, Eye, AlertTriangle, GraduationCap, Calendar, Lock } from 'lucide-react';
import { ExamType } from '../types';
import { formatDate } from '../utils';

interface HeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
  isStealth: boolean;
  toggleStealth: () => void;
  exam: ExamType;
  examDate?: string;
  resilienceScore: number;
  streak: number;
  triggerEmergency: () => void;
  isLocked: boolean;
  lockApp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setTab,
  isStealth,
  toggleStealth,
  exam,
  examDate,
  resilienceScore,
  streak,
  triggerEmergency,
  isLocked,
  lockApp
}) => {
  // Compute remaining days to exam if defined
  const getDaysRemaining = () => {
    if (!examDate) return null;
    const now = new Date();
    const target = new Date(examDate);
    const diffTime = target.getTime() - now.getTime();
    if (diffTime <= 0) return 'D-Day!';
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days left`;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <header className="border-b border-brand-800 bg-brand-900/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Stealth Title branding */}
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl transition-all duration-300 ${
              isStealth ? 'bg-slate-800 text-slate-300' : 'bg-brand-600 text-rose-100 shadow-[0_0_15px_rgba(79,105,142,0.3)]'
            }`}>
              {isStealth ? <GraduationCap className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-display font-bold tracking-tight text-brand-50">
                  {isStealth ? 'Daily Study Log' : 'MindPath'}
                </h1>
                {isStealth ? (
                  <span className="text-[10px] uppercase tracking-widest font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                    V12.4
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-widest font-mono bg-brand-800/80 text-brand-300 px-1.5 py-0.5 rounded border border-brand-700">
                    Wellness Hub
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-300 font-mono">
                {isStealth ? 'Academic Practice Tracker (India)' : 'AI Mental Wellness for Exam Warriors'}
              </p>
            </div>
          </div>

          {/* Core Analytics Badges & Stealth Widgets */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Exam Countdown banner */}
            <div className="flex items-center space-x-2 bg-brand-950/60 border border-brand-800/80 px-3 py-1.5 rounded-lg">
              <Calendar className="h-4 w-4 text-brand-400" />
              <div>
                <p className="text-[10px] uppercase font-mono text-brand-400 tracking-wider">Exam Timeline</p>
                <p className="text-xs font-semibold text-brand-100">
                  {exam} {daysRemaining ? `• ${daysRemaining}` : ''}
                </p>
              </div>
            </div>

            {/* Gamified Resilience and Streak Score Widget */}
            <div className="flex items-center space-x-4 bg-brand-950/60 border border-brand-800/80 px-4 py-1.5 rounded-lg">
              <div>
                <p className="text-[10px] uppercase font-mono text-brand-400 tracking-wider">Consistency Streak</p>
                <p className="text-xs font-bold text-emerald-400">🔥 {streak} {streak === 1 ? 'day' : 'days'}</p>
              </div>
              <div className="border-l border-brand-800 h-8"></div>
              <div>
                <p className="text-[10px] uppercase font-mono text-brand-400 tracking-wider">Resilience Rating</p>
                <p className="text-xs font-bold text-amber-400">🛡️ {resilienceScore}/100</p>
              </div>
            </div>

          </div>

          {/* Interactive Utility Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Quick emergency safe-grounding button */}
            <button
              id="emergency-grounding-btn"
              onClick={triggerEmergency}
              className="flex items-center space-x-1.5 bg-red-950/80 text-red-300 hover:bg-red-900 hover:text-red-100 border border-red-800 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200"
              title="Activate immediate grounding / helpline panel"
            >
              <AlertTriangle className="h-4 w-4 animate-pulse text-red-400" />
              <span className="hidden sm:inline">Grounding Kit (SOS)</span>
            </button>

            {/* Stealth Mode toggle */}
            <button
              id="stealth-mode-btn"
              onClick={toggleStealth}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isStealth 
                  ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700' 
                  : 'bg-brand-950/80 text-brand-300 border-brand-800 hover:bg-brand-800/80'
              }`}
              title={isStealth ? 'Disable Study Log mask (Back to Wellness view)' : 'Activate Stealth Mode (Mask App as Practice log)'}
            >
              {isStealth ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>

            {/* Lock App / Vault activation */}
            <button
              id="privacy-lock-btn"
              onClick={lockApp}
              className="p-2 rounded-lg bg-brand-950/80 hover:bg-brand-800/80 text-brand-300 border border-brand-800 cursor-pointer transition-all"
              title="Lock confidential vault"
            >
              <Lock className="h-4 w-4" />
            </button>

          </div>

        </div>

        {/* Desktop Tab Switching Menu (Stealth Adaptive Labels) */}
        {!isLocked && (
          <nav className="flex space-x-1 border-t border-brand-805 py-2 overflow-x-auto select-none scrollbar-none">
            {[
              { id: 'journal', label: 'AI Journaling', stealthLabel: 'Daily Practice Log' },
              { id: 'coach', label: 'Wellness Companion', stealthLabel: 'Study Coping Bot' },
              { id: 'patterns', label: 'Stress Patterns', stealthLabel: 'Performance Analytics' },
              { id: 'coping', label: 'Syllabus Guides', stealthLabel: 'Study Revision Protocols' },
              { id: 'motivation', label: 'Motivation Hub', stealthLabel: 'Focus Pacing Hub' },
              { id: 'dashboard', label: 'Warrior Dashboard', stealthLabel: 'Student Progress Sheet' }
            ].map(tab => (
              <button
                key={tab.id}
                id={`tab-link-${tab.id}`}
                onClick={() => setTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  currentTab === tab.id
                    ? isStealth 
                      ? 'bg-slate-800 text-brand-50 border border-slate-700'
                      : 'bg-brand-500 text-white border border-brand-600 shadow-sm shadow-brand-500/20'
                    : isStealth
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      : 'text-brand-300 hover:text-brand-50 hover:bg-brand-800/80 border border-transparent'
                }`}
              >
                {isStealth ? tab.stealthLabel : tab.label}
              </button>
            ))}
          </nav>
        )}

      </div>
    </header>
  );
};
