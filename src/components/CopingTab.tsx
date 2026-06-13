/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, ChevronRight, GraduationCap, Moon, Sparkles, UserX, Lightbulb, CheckSquare } from 'lucide-react';
import { COPING_GUIDES } from '../data';
import { CopingGuide } from '../types';

interface CopingTabProps {
  incrementCopingCount: () => void;
}

export const CopingTab: React.FC<CopingTabProps> = ({ incrementCopingCount }) => {
  const [activeGuide, setActiveGuide] = useState<CopingGuide | null>(COPING_GUIDES[0]);
  const [practicedGuides, setPracticedGuides] = useState<{ [key: string]: boolean }>({});

  const handleMarkPracticed = (id: string) => {
    if (!practicedGuides[id]) {
      setPracticedGuides(prev => ({ ...prev, [id]: true }));
      incrementCopingCount();
    }
  };

  return (
    <div id="coping-tab-pane" className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-4 animate-in fade-in duration-200">
      
      {/* Column 1: Directory selection of exam-centric protocols (F4) */}
      <div className="space-y-4">
        <div className="bg-brand-900 border border-brand-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h2 className="text-sm font-display font-bold text-brand-50 flex items-center space-x-1.5">
            <GraduationCap className="h-4.5 w-4.5 text-brand-404" />
            <span>Subject-Specific Protocols</span>
          </h2>
          <p className="text-xs text-brand-350 leading-relaxed">
            Choose a custom clinical-empathy script specifically designed for the particular curriculum bottleneck causing study blockages:
          </p>
        </div>

        <div className="space-y-3">
          {COPING_GUIDES.map((guide) => (
            <button
              key={guide.id}
              id={`coping-guide-selector-${guide.id}`}
              onClick={() => setActiveGuide(guide)}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                activeGuide?.id === guide.id
                  ? 'bg-brand-700 border-brand-500 text-brand-50 shadow-md font-medium'
                  : 'bg-brand-900/60 border-brand-800 text-brand-305 hover:border-brand-700 hover:bg-brand-900'
              }`}
            >
              <div>
                <p className="text-xs font-bold">{guide.title}</p>
                <p className="text-[10px] font-mono text-brand-403 pt-1">🎯 {guide.subjectContext}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-brand-400 shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Column 2: Detailed protocol workspace steps (US-02, F4) */}
      <div className="lg:col-span-2 space-y-6">
        
        {activeGuide ? (
          <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex justify-between items-start border-b border-brand-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  Tactical Study Protocol
                </span>
                <h3 className="text-md md:text-lg font-display font-bold text-brand-50 pt-1.5">{activeGuide.title}</h3>
                <span className="text-xs font-mono text-brand-404">Target Subject: {activeGuide.subjectContext}</span>
              </div>
              
              <button
                id={`coping-practice-btn-${activeGuide.id}`}
                disabled={!!practicedGuides[activeGuide.id]}
                onClick={() => handleMarkPracticed(activeGuide.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer border ${
                  practicedGuides[activeGuide.id]
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                    : 'bg-brand-500 hover:bg-brand-400 text-white border-brand-405 shadow-inner'
                }`}
              >
                {practicedGuides[activeGuide.id] ? '✓ PRACTICE RECORDED' : '🧘 LOG AS COMPLETED'}
              </button>
            </div>

            <p className="text-xs text-brand-200 leading-relaxed italic bg-brand-850 p-3.5 rounded-xl border border-brand-850">
              "{activeGuide.description}"
            </p>

            {/* Steps display list */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-brand-405 uppercase tracking-wider">Step-by-step Execution Steps</h4>
              {activeGuide.steps.map((step, idx) => (
                <div key={idx} className="flex space-x-3 items-start bg-brand-900 p-3 rounded-lg border border-brand-800">
                  <div className="h-5 w-5 rounded-full bg-brand-850 text-brand-300 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5 border border-brand-800">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-brand-200 leading-relaxed font-sans">{step}</p>
                </div>
              ))}
            </div>

            {practicedGuides[activeGuide.id] && (
              <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3.5 rounded-lg text-[10px] leading-relaxed font-mono">
                🎉 Excellent! Logged this active COPING session. Your gamified **Resilience Score** has been updated under the dashboard metrics.
              </div>
            )}
          </div>
        ) : (
          <div className="border border-brand-800 border-dashed rounded-2xl py-16 text-center text-xs font-mono text-brand-405">
            Select a subject protocol on the left to review dynamic coping guidelines.
          </div>
        )}

        {/* Secondary section: Peer comparison de-escalation scripts and Sleep parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Peer Comparison De-escalation scripts (F4) */}
          <div className="bg-brand-900 border border-brand-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-mono text-amber-400 uppercase tracking-widest flex items-center space-x-1.5">
              <UserX className="h-4 w-4" />
              <span>De-compare peer scripts</span>
            </h3>
            <p className="text-xs text-brand-350 leading-relaxed">
              When study group chats start discussing 14-hour revision timetables or high Mock scores:
            </p>
            <div className="bg-brand-950/60 p-3 rounded-lg text-[11px] font-mono leading-relaxed text-brand-200 space-y-2 border border-brand-850">
              <p className="text-brand-401 font-bold">Inner Dialogue Anchor:</p>
              <p className="italic">
                "Their ranking points are not a baseline indicator of my potential. Exams assess accuracy pacing on my own selected syllabus, not social speed benchmarks. I am stepping out of the comparison game."
              </p>
              <p className="text-[10px] text-brand-450 border-t border-brand-850/60 pt-1.5 mt-1.5">
                💡 Practice action: Close Telegram channels/mock chats for 4 hours.
              </p>
            </div>
          </div>

          {/* Sleep Hygiene Guidelines calibrating to study schedule (F4) */}
          <div className="bg-brand-900 border border-brand-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-mono text-blue-405 uppercase tracking-widest flex items-center space-x-1.5">
              <Moon className="h-4 w-4" />
              <span>Sleep Hygiene Calibration</span>
            </h3>
            <p className="text-xs text-brand-350 leading-relaxed">
              For 12 AM to 2 AM study warriors keeping stressful drop years active:
            </p>
            <div className="space-y-2 text-[11px] text-brand-200">
              <div className="flex space-x-2 items-center">
                <span className="text-blue-400 font-bold shrink-0">😴 30-min block:</span>
                <span>Avoid doing intense simulated practice test reviews right before bed.</span>
              </div>
              <div className="flex space-x-2 items-center">
                <span className="text-blue-400 font-bold shrink-0">👓 Optic check:</span>
                <span>Set device filters to maximum high-density night warm light filters.</span>
              </div>
              <div className="flex space-x-2 items-center">
                <span className="text-blue-400 font-bold shrink-0">📝 Reset thoughts:</span>
                <span>Write a 2-min free dump of remaining study items to feel structured.</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
