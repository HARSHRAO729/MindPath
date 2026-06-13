/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Shuffle, LayoutDashboard, Shield, AlertCircle, Save, Download, FileText, Settings, Key, UserCheck } from 'lucide-react';
import { StudentProfile, ExamType, JournalEntry } from '../types';
import { EXAM_OPTIONS } from '../data';
import { calculateResilienceScore, calculateStreak } from '../utils';

interface DashboardProps {
  profile: StudentProfile;
  updateProfile: (profile: StudentProfile) => void;
  entries: JournalEntry[];
  copingUseCount: number;
}

export const DashboardTab: React.FC<DashboardProps> = ({
  profile,
  updateProfile,
  entries,
  copingUseCount
}) => {
  // Local profile variables
  const [name, setName] = useState(profile.name);
  const [exam, setExam] = useState<ExamType>(profile.currentExam);
  const [examDate, setExamDate] = useState(profile.examDate || '');
  const [passcode, setPasscode] = useState(profile.passcode);
  const [resultMsg, setResultMsg] = useState('');

  const streak = calculateStreak(entries);
  const resilienceScore = calculateResilienceScore(entries, streak, copingUseCount);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode || passcode.length < 4) {
      setResultMsg('Passcode must be at least 4 digits for secure vaulting.');
      return;
    }
    updateProfile({
      ...profile,
      name: name.trim(),
      currentExam: exam,
      examDate: examDate || undefined,
      passcode: passcode.trim()
    });
    setResultMsg('Profile locked and secured successfully!');
    setTimeout(() => setResultMsg(''), 3000);
  };

  // Export raw text summary (F6 compliance "well-being summary email/whatsapp export equivalent")
  const handleExportDataByPrint = () => {
    try {
      const summaryHeader = `========================================\nMINDPATH WELLNESS SUMMARY REPORT\nDate of Export: ${new Date().toLocaleDateString('en-IN')}\n========================================\n\n`;
      const profileSection = `Aspirant Name: ${profile.name || 'Anonymous'}\nTarget Exam: ${profile.currentExam}\nResilience Rating: ${resilienceScore}/100\nConsistency Streak: ${streak} days\nCoping Guides Utilized: ${copingUseCount} sessions\n\n`;
      
      let journalSection = `HISTORICAL ACADEMIC STATUS LOGS:\n----------------------------------------\n`;
      if (entries.length === 0) journalSection += 'No study logs saved offline.\n';
      else {
        entries.forEach((e, idx) => {
          journalSection += `\n[Log #${idx + 1}] Date: ${new Date(e.date).toDateString()}\n`;
          journalSection += `Explicit User Mood: ${e.manualMood}/10\n`;
          if (e.analysis) {
            journalSection += `AI Analyzed Mood Rating: ${e.analysis.moodSliderValue}/10\n`;
            journalSection += `Triggers: ${e.analysis.triggers.join(', ')}\n`;
            journalSection += `Compassionate Summary: ${e.analysis.summary}\n`;
            journalSection += `Coping Action Recommended: ${e.analysis.copingProtocol}\n`;
          }
          journalSection += `----------------------------------------\n`;
        });
      }

      const fullString = summaryHeader + profileSection + journalSection;

      // Create blob download URL
      const blob = new Blob([fullString], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mindpath_wellness_export_${profile.currentExam.toLowerCase()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export text failed", e);
    }
  };

  const getGaugeColor = (val: number) => {
    if (val >= 80) return 'text-emerald-600';
    if (val >= 50) return 'text-teal-600';
    if (val >= 30) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getGaugeBg = (val: number) => {
    if (val >= 80) return 'bg-emerald-50 border-emerald-250';
    if (val >= 50) return 'bg-teal-50 border-teal-205';
    if (val >= 30) return 'bg-amber-50 border-amber-205';
    return 'bg-rose-50 border-rose-205';
  };

  return (
    <div id="dashboard-tab-pane" className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-4 animate-in fade-in duration-200">
      
      {/* Column 1 & 2: Gamified resilience score and visual summaries list */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Resilience Widget panel (F6, US-06) */}
        <div className={`border rounded-2xl p-6 shadow-xl transition-all ${getGaugeBg(resilienceScore)}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="space-y-3 md:max-w-md text-left">
              <span className="text-[10px] font-mono tracking-widest uppercase bg-brand-950 border border-brand-800 px-2.5 py-1 rounded text-brand-350">
                ⭐ Resilience & Stamina Score
              </span>
              <h2 className="text-xl font-display font-bold text-brand-50">Warrior Resilience Index</h2>
              <p className="text-xs text-brand-200 leading-relaxed">
                Your **Resilience Score** evaluates study-consistency patterns, active coping engagement, and emotional pacing. Unlike clinical audits, this metric is gamified to represent internal mental armor against competitive stress.
              </p>
              
              <div className="flex items-center space-x-4 pt-1.5 font-mono text-[11px] text-brand-300">
                <div>🔥 Streak multiplier: <strong className="text-emerald-400">{streak}x</strong></div>
                <div>🛡️ Active copings: <strong className="text-teal-400">{copingUseCount} logged</strong></div>
              </div>
            </div>

            {/* Circular Gauge visual card */}
            <div className="relative flex items-center justify-center h-36 w-36 mb-2 shrink-0">
              <svg className="h-full w-full transform -rotate-90">
                <circle cx="72" cy="72" r="54" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="72" 
                  cy="72" 
                  r="54" 
                  stroke={resilienceScore >= 80 ? '#26b894' : resilienceScore >= 50 ? '#2dd4bf' : resilienceScore >= 30 ? '#fbbf24' : '#f43f5e'} 
                  strokeWidth="8" 
                  strokeDasharray="339.2"
                  strokeDashoffset={339.2 - (339.2 * resilienceScore) / 100}
                  strokeLinecap="round" 
                  fill="transparent" 
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-3xl font-extrabold font-mono ${getGaugeColor(resilienceScore)}`}>{resilienceScore}</span>
                <span className="text-[9px] font-mono text-brand-405 uppercase tracking-wide">out of 100</span>
              </div>
            </div>

          </div>
        </div>

        {/* Dashboard stats bento boxes (US-06) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-brand-900 border border-brand-800 rounded-xl p-5 shadow-lg space-y-1.5 text-center">
            <span className="text-[10px] font-mono uppercase text-brand-405 tracking-wider block">Consistency Streak</span>
            <span className="text-4xl font-extrabold font-mono text-emerald-400 block p-1">🔥 {streak}</span>
            <span className="text-[10px] font-mono text-brand-300 block">consecutive logged days</span>
          </div>

          <div className="bg-brand-900 border border-brand-800 rounded-xl p-5 shadow-lg space-y-1.5 text-center">
            <span className="text-[10px] font-mono uppercase text-brand-405 tracking-wider block">Coping Interventions</span>
            <span className="text-4xl font-extrabold font-mono text-teal-40 block p-1">🧘 {copingUseCount}</span>
            <span className="text-[10px] font-mono text-brand-300 block">active practices recorded</span>
          </div>

          <div className="bg-brand-900 border border-brand-800 rounded-xl p-5 shadow-lg space-y-1.5 text-center">
            <span className="text-[10px] font-mono uppercase text-brand-405 tracking-wider block">Total Logged Entries</span>
            <span className="text-4xl font-extrabold font-mono text-brand-200 block p-1">📝 {entries.length}</span>
            <span className="text-[10px] font-mono text-brand-300 block">secured locally</span>
          </div>

        </div>

        {/* Export and data recovery tools for student confidentiality (US-03, F6) */}
        <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2.5">
            <Download className="h-5 w-5 text-brand-404" />
            <div>
              <h3 className="text-md font-display font-semibold text-brand-50">Confidential Backup</h3>
              <p className="text-xs text-brand-350">Download your study logs and AI summaries into a readable text file block</p>
            </div>
          </div>
          <p className="text-xs text-brand-200 leading-relaxed">
            MindPath utilizes immediate local browser-vault systems so your data remains entirely on this device (secured from siblings or parents). If you want to share findings with an external clinical professional, counselor, or study buddy, click down below:
          </p>
          <div className="pt-2">
            <button
              id="export-data-btn"
              onClick={handleExportDataByPrint}
              className="inline-flex items-center space-x-2 bg-brand-800 hover:bg-brand-700 text-brand-50 border border-brand-750 font-bold py-2 px-4 rounded-xl text-xs cursor-pointer transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Export Well-being report (.TXT)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Column 3: Profile Settings, exam timelines, passcode PIN configuration */}
      <div className="space-y-6">
        
        {/* Secure Settings card */}
        <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center space-x-2 border-b border-brand-800 pb-3">
            <Settings className="h-4 w-4 text-brand-405" />
            <h3 className="text-xs font-mono text-brand-300 uppercase tracking-widest">Aspirant Profile Settings</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
            <div>
              <label htmlFor="aspirant-name" className="block text-[10px] font-mono text-brand-405 uppercase tracking-wider mb-1">Aspirant Name</label>
              <input
                id="aspirant-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Priya"
                className="w-full bg-brand-950 text-brand-50 border border-brand-750 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-brand-405 focus:border-brand-405 outline-none font-sans"
              />
            </div>

            <div>
              <label htmlFor="exam-selector" className="block text-[10px] font-mono text-brand-405 uppercase tracking-wider mb-1">Target Examination (India)</label>
              <select
                id="exam-selector"
                value={exam}
                onChange={(e) => setExam(e.target.value as ExamType)}
                className="w-full bg-brand-950 text-brand-50 border border-brand-750 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-brand-405 outline-none cursor-pointer"
              >
                {EXAM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="exam-date-picker" className="block text-[10px] font-mono text-brand-405 uppercase tracking-wider mb-1">Scheduled Exam Date (Timeline tracker)</label>
              <input
                id="exam-date-picker"
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-brand-950 text-brand-50 border border-brand-750 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-brand-405 outline-none cursor-pointer font-mono"
              />
            </div>

            {/* Passcode lock configuration (Confidentiality) */}
            <div className="bg-brand-950 p-4 border border-brand-850 rounded-xl space-y-3">
              <div className="flex items-center space-x-1.5 text-xs text-brand-200">
                <Key className="h-4 w-4 text-cyan-400" />
                <span className="font-bold">Confidential Pin Box (US-03)</span>
              </div>
              <p className="text-[10px] text-brand-350 leading-relaxed font-mono">
                Set a 4-digit numeric passcode to secure your data from home exposure.
              </p>
              <div>
                <input
                  id="vault-passcode-input"
                  type="password"
                  maxLength={6}
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="e.g., 2026"
                  className="w-full bg-brand-900 text-brand-50 border border-brand-750 px-3 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-brand-405 outline-none tracking-widest text-center font-mono font-bold"
                />
              </div>
            </div>

            {resultMsg && (
              <p className="text-xs text-emerald-400 font-mono flex items-center space-x-1">
                <UserCheck className="h-4 w-4 shrink-0" />
                <span>{resultMsg}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-brand-610 hover:bg-brand-555 text-white font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition-colors shadow-lg"
            >
              Lock Configuration Changes
            </button>
          </form>
        </div>

        {/* Safety Note */}
        <div className="bg-brand-950/60 p-5 rounded-xl border border-brand-850">
          <h4 className="text-xs font-mono text-red-300 uppercase flex items-center space-x-1 mb-2">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>DPDP Act Compliance</span>
          </h4>
          <p className="text-[10px] text-brand-350 leading-relaxed">
            In compliance with the **Digital Personal Data Protection (DPDP) Act 2023 (India)**, your MindPath journals are heavily locked on device. No storage endpoints are persistent on remote servers, and you own 100% of your diary content.
          </p>
        </div>

      </div>

    </div>
  );
};
