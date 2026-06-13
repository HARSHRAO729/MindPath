/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PenTool, ChevronRight, HelpCircle, Save, Loader2, Sparkles, Smile, Trash2 } from 'lucide-react';
import { JournalEntry, ExamType } from '../types';
import { GUIDED_JOURNAL_PROMPTS } from '../data';
import { decryptContent, formatDate } from '../utils';

interface JournalTabProps {
  entries: JournalEntry[];
  addEntry: (content: string, manualMood: number, examContext: ExamType) => Promise<void>;
  deleteEntry: (id: string) => void;
  exam: ExamType;
  isPrivacyMasked: boolean;
  isAnalyzing: boolean;
}

export const JournalTab: React.FC<JournalTabProps> = ({
  entries,
  addEntry,
  deleteEntry,
  exam,
  isPrivacyMasked,
  isAnalyzing
}) => {
  const [content, setContent] = useState('');
  const [manualMood, setManualMood] = useState(5);
  const [activePromptIdx, setActivePromptIdx] = useState(0);
  const [showPromptGuidance, setShowPromptGuidance] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Change prompt suggestion helper
  const handleNextPrompt = () => {
    setActivePromptIdx(prev => (prev + 1) % GUIDED_JOURNAL_PROMPTS.length);
  };

  const handleApplyPrompt = () => {
    setContent(prev => (prev ? prev + '\n' : '') + `[Reflecting on Prompt: ${GUIDED_JOURNAL_PROMPTS[activePromptIdx]}]\n`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await addEntry(content, manualMood, exam);
    setContent('');
    setManualMood(5);
  };

  // Color mapping variables for aesthetic emotion tagging (F1 NLP mapping)
  const getIntensityBg = (name: string, val: number) => {
    const isNegative = ['stress', 'anxiety', 'hopelessness', 'overwhelm', 'loneliness'].includes(name.toLowerCase());
    if (isNegative) {
      if (val >= 7) return 'bg-rose-50 text-rose-700 border-rose-200';
      if (val >= 4) return 'bg-amber-50 text-amber-700 border-amber-200';
      return 'bg-brand-850 text-brand-300 border-brand-800';
    } else {
      // Positive/Calming vectors
      if (val >= 6) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      return 'bg-teal-50 text-teal-850 border-teal-200';
    }
  };

  // Compile weekly aggregates for Insight Cards (F1/F2 weekly review card)
  const compileInsightsSum = () => {
    const totalEntries = entries.length;
    if (totalEntries === 0) return "Begin writing standard entries to activate your AI stress fingerprint trends.";

    const triggersMap: { [key: string]: number } = {};
    let highStressDays = 0;

    entries.forEach(e => {
      if (e.analysis) {
        if (e.analysis.moodSliderValue <= 4) highStressDays++;
        e.analysis.triggers.forEach(t => {
          triggersMap[t] = (triggersMap[t] || 0) + 1;
        });
      }
    });

    const topTriggers = Object.entries(triggersMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([name]) => `"${name}"`);

    let reportStr = `Reviewed ${totalEntries} preparation log entries. `;
    if (topTriggers.length > 0) {
      reportStr += `AI models detected ${topTriggers.join(' and ')} as recurrent study-stress triggers. `;
    }
    if (highStressDays > 1) {
      reportStr += `Work fatigue peaked ${highStressDays} times. Remember to pace critical numerical revisions.`;
    } else {
      reportStr += `Emotional resilience factors are stable across India-wide comparison cohorts.`;
    }
    return reportStr;
  };

  return (
    <div id="journal-tab-pane" className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-4 animate-in fade-in duration-200">
      
      {/* Column 1 & 2: Active Journal Entry Compositor */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Smart Guided Prompts Nudge (US-01, F1) */}
        {showPromptGuidance && (
          <div className="bg-brand-900/80 border border-brand-800/85 p-5 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 flex space-x-2">
              <button 
                onClick={handleNextPrompt}
                className="text-xs text-brand-300 hover:text-brand-100 font-mono flex items-center space-x-1 cursor-pointer"
                title="Circulate another suggestion prompt"
                aria-label="Show another guided journal prompt"
              >
                <span>Cycle prompt ↻</span>
              </button>
            </div>
            <div className="flex items-start space-x-3.5 pr-20">
              <div className="p-2 bg-brand-800 rounded-lg text-amber-400 mt-1 shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase bg-brand-800 text-amber-300 px-2 py-0.5 rounded border border-brand-750">
                  AI Guided Prompt suggestion
                </span>
                <p className="text-sm font-medium text-brand-100 italic leading-relaxed pt-1.5">
                  "{GUIDED_JOURNAL_PROMPTS[activePromptIdx]}"
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center space-x-3 border-t border-brand-800/60 pt-3">
              <button
                onClick={handleApplyPrompt}
                className="text-xs bg-brand-800 hover:bg-brand-700 text-brand-50 font-semibold py-1.5 px-3 rounded-lg border border-brand-750 cursor-pointer"
              >
                Insert Prompt into log
              </button>
              <button
                onClick={() => setShowPromptGuidance(false)}
                className="text-xs text-brand-300 hover:text-brand-100 cursor-pointer"
              >
                Hide prompts
              </button>
            </div>
          </div>
        )}

        {/* Free-form Writing Pad */}
        <form onSubmit={handleSubmit} className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PenTool className="h-5 w-5 text-brand-405" />
              <h2 className="text-md font-display font-bold text-brand-50">Write Your Daily Wellness Log</h2>
            </div>
            <span className="text-[11px] font-mono text-brand-450 uppercase">Exam Target: <strong className="text-brand-200">{exam}</strong></span>
          </div>

          <div>
            <textarea
              id="journal-input-textarea"
              aria-label="Daily wellness journal entry"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Study logs, anxiety points, details about numerical performance or mock-test peer distress..."
              required
              rows={8}
              className="w-full bg-brand-950 text-brand-50 border border-brand-750 rounded-xl p-4 text-sm focus:ring-1 focus:ring-brand-405 focus:border-brand-405 outline-none font-sans leading-relaxed"
            />
          </div>

          {/* Interactive Mood Slider Input */}
          <div className="bg-brand-950/60 border border-brand-800 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="mood-slider" className="text-xs font-mono text-brand-300 uppercase tracking-widest flex items-center space-x-2">
                <Smile className="h-4 w-4 text-brand-400" />
                <span>Rate Your Emotional state (1-10)</span>
              </label>
              <span className="text-lg font-semibold font-mono text-brand-500">
                {manualMood === 1 ? '😭 1 - Severe Panic' :
                 manualMood === 3 ? '🥺 3 - High Anxiety' :
                 manualMood === 5 ? '😐 5 - Neutral / Static' :
                 manualMood === 7 ? '🙂 7 - Balanced' :
                 manualMood === 9 ? '😄 9 - Focused & Dynamic' :
                 manualMood === 10 ? '✨ 10 - Calm Clarity' : `${manualMood}/10`}
              </span>
            </div>
            <input
              id="mood-slider"
              type="range"
              min="1"
              max="10"
              step="1"
              value={manualMood}
              onChange={(e) => setManualMood(Number(e.target.value))}
              className="w-full accent-brand-500 h-1.5 bg-brand-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-brand-405">
              <span>Severe Panic</span>
              <span>Work Exhaustion</span>
              <span>Steady Calmness</span>
            </div>
          </div>

          {/* Submit action */}
          <div className="flex justify-between items-center pt-2">
            <p className="text-[10px] text-brand-400 flex items-center space-x-1 max-w-xs sm:max-w-md leading-relaxed">
              <HelpCircle className="h-3 w-3 shrink-0" />
              <span>Submit to transmit this study report to our secure, server-side AI evaluation system.</span>
            </p>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-555 text-white font-bold py-2.5 px-6 rounded-xl text-xs cursor-pointer transition-all disabled:opacity-50 disabled:cursor-wait shrink-0 shadow-lg border border-brand-555/20"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>AI Sentiment Parsing...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Log Journal & Analyze</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Selected Journal Analysis Detail Panel */}
        {selectedEntry && (
          <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-brand-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-brand-404 bg-brand-950 px-2 py-0.5 rounded border border-brand-850">
                  Analyzed Entry Report
                </span>
                <h3 className="text-md font-display font-semibold text-brand-50 pt-1">
                  Report for {formatDate(selectedEntry.date)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-xs text-brand-300 hover:text-brand-100 bg-brand-800 border border-brand-750 px-2 py-1 rounded"
                aria-label="Close analyzed journal report"
              >
                Close Report
              </button>
            </div>

            {/* Displaying AI Analysis parameters */}
            {selectedEntry.analysis ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Sentiment & District blocks */}
                <div className="space-y-4">
                  {/* Summary Block */}
                  <div>
                    <h4 className="text-xs font-mono uppercase text-teal-650 mb-1.5">Compassionate Summary</h4>
                    <p className="text-xs text-brand-100 bg-teal-50 border border-teal-250 p-3 rounded-lg leading-relaxed shadow-inner">
                      {selectedEntry.analysis.summary}
                    </p>
                  </div>

                  {/* Insights card */}
                  <div>
                    <h4 className="text-xs font-mono uppercase text-amber-500 mb-1.5">AI Pinpoint Insight</h4>
                    <p className="text-xs text-brand-200 bg-amber-50 border border-amber-250 p-3 rounded-lg leading-relaxed shadow-inner">
                      {selectedEntry.analysis.insights}
                    </p>
                  </div>
                </div>

                {/* Coping Strategy & Distortions */}
                <div className="space-y-4">
                  {/* NLP Emotion tagging (F1) */}
                  <div>
                    <h4 className="text-xs font-mono uppercase text-brand-300 mb-2">Detected Emotions ({selectedEntry.analysis.emotions.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.analysis.emotions.map((emotion, idx) => (
                        <span
                          key={idx}
                          className={`text-[10px] font-mono px-2 py-1 rounded-full border ${getIntensityBg(emotion.name, emotion.intensity)}`}
                        >
                          {emotion.name} ({emotion.intensity}/10)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Triggers and Distortions */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <h4 className="text-xs font-mono uppercase text-brand-300 mb-1.5">Triggers</h4>
                      <div className="space-y-1">
                        {selectedEntry.analysis.triggers.map((trig, idx) => (
                          <span key={idx} className="block text-[10px] bg-brand-950 text-brand-300 px-2 py-1 rounded border border-brand-800 font-mono">
                            📍 {trig}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-mono uppercase text-brand-300 mb-1.5">Distortions</h4>
                      <div className="space-y-1">
                        {selectedEntry.analysis.cognitiveDistortions.length === 0 ? (
                          <span className="text-[10px] text-brand-405 font-mono italic">None Detected</span>
                        ) : (
                          selectedEntry.analysis.cognitiveDistortions.map((dist, idx) => (
                             <span key={idx} className="block text-[10px] bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200/60 font-mono">
                               ⚠️ {dist}
                             </span>
                           ))
                         )}
                       </div>
                     </div>
                   </div>
 
                   {/* Subject action */}
                   <div>
                     <h4 className="text-xs font-mono uppercase text-emerald-600 mb-1">Coping Action Recommended</h4>
                     <p className="text-xs text-brand-100 bg-emerald-50 border border-emerald-200/60 p-3 rounded-lg leading-relaxed font-sans shadow-inner">
                       💡 {selectedEntry.analysis.copingProtocol}
                     </p>
                   </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-6 text-brand-400 font-mono text-xs">
                No advanced AI diagnostics compiled for this offline entry.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Column 3: Weekly summary trends and historical logs */}
      <div className="space-y-6">
        
        {/* Weekly Insights Cards (F1) */}
        <div className="bg-gradient-to-br from-brand-900 to-brand-950 border border-brand-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-mono text-brand-300 uppercase tracking-widest mb-3 flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>AI Weekly insights (F1)</span>
          </h3>
          <p className="text-xs text-brand-155 leading-relaxed bg-brand-950/50 p-3.5 rounded-lg border border-brand-800 font-medium">
            {compileInsightsSum()}
          </p>
        </div>

        {/* Saved Daily Logs list */}
        <div className="bg-brand-900 border border-brand-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-mono text-brand-300 uppercase tracking-widest">Historical Logs ({entries.length})</h3>
          
          {entries.length === 0 ? (
            <div className="text-center py-8 text-brand-405 font-mono text-xs italic">
              No journal entries recorded. Begin typing to create your wellness log.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              {entries.map((entry) => {
                const plaintext = isPrivacyMasked 
                  ? decryptContent(entry.content, true)
                  : entry.content;

                return (
                  <div
                    key={entry.id}
                    className={`p-3.5 rounded-xl border transition-all text-left space-y-2 cursor-pointer ${
                      selectedEntry?.id === entry.id
                        ? 'bg-brand-950 border-brand-500 shadow-inner'
                        : 'bg-brand-950/40 border-brand-800 hover:border-brand-700 hover:bg-brand-950'
                    }`}
                    onClick={() => setSelectedEntry(entry)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedEntry(entry);
                      }
                    }}
                    aria-label={`Open journal analysis report for ${formatDate(entry.date)}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-brand-100">{formatDate(entry.date)}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-brand-405 bg-brand-900 border border-brand-800 rounded px-1.5 py-0.5">
                          Mood: {entry.analysis?.moodSliderValue || entry.manualMood}/10
                        </span>
                        
                        {/* Delete entry icon */}
                        <button
                          id={`delete-entry-btn-${entry.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this log? Its AI metrics will be forgotten.')) {
                              deleteEntry(entry.id);
                              if (selectedEntry?.id === entry.id) setSelectedEntry(null);
                            }
                          }}
                          className="p-1 rounded bg-red-950/20 hover:bg-red-950 text-red-405 hover:text-red-300 border border-red-900/20 cursor-pointer"
                          title="Purge Entry"
                          aria-label={`Delete journal entry from ${formatDate(entry.date)}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-brand-200 line-clamp-2 leading-relaxed">
                      {isPrivacyMasked ? '•••••••• Locked Safe Content ••••••••' : plaintext}
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-brand-400 font-mono pt-1">
                      <span>🎯 {entry.examContext} Prep</span>
                      {entry.analysis && (
                        <span className="text-teal-400 flex items-center space-x-0.5">
                          <span>Report Ready</span>
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
