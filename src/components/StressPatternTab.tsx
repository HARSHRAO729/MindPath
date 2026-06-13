/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, AlertCircle, BarChart3, Calendar, Activity, GraduationCap } from 'lucide-react';
import { JournalEntry } from '../types';

interface StressPatternProps {
  entries: JournalEntry[];
}

export const StressPatternTab: React.FC<StressPatternProps> = ({ entries }) => {
  
  // Calculate temporal stress patterns (F2 - Day of week stress tracker)
  const getDayStressAverages = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const stressCounts = Array(7).fill(0);
    const stressSums = Array(7).fill(0);

    entries.forEach(e => {
      const date = new Date(e.date);
      const dayIdx = date.getDay();
      
      // Determine stress levels. Use analyzed stress indicator if available, otherwise manual mood inverse
      let stressScore = 5;
      if (e.analysis) {
        const stressEmo = e.analysis.emotions.find(em => em.name.toLowerCase() === 'stress');
        const anxietyEmo = e.analysis.emotions.find(em => em.name.toLowerCase() === 'anxiety');
        stressScore = (stressEmo?.intensity || anxietyEmo?.intensity || (10 - e.analysis.moodSliderValue));
      } else {
        stressScore = 10 - e.manualMood;
      }

      stressCounts[dayIdx]++;
      stressSums[dayIdx] += stressScore;
    });

    return days.map((day, idx) => {
      const count = stressCounts[idx];
      const avg = count === 0 ? 0 : Number((stressSums[idx] / count).toFixed(1));
      return { day, avg, count };
    });
  };

  const dayStressDetails = getDayStressAverages();
  const maxStressDay = [...dayStressDetails].sort((a,b) => b.avg - a.avg)[0];

  // Subject-stress / Topic Cluster analysis (F2 topic mapping)
  const getSubjectStressClusters = () => {
    const subjectsMap: { [key: string]: { sum: number; count: number } } = {};
    
    // Scan entry triggers or content keywords for Indian study subjects
    const subjectKeywords = [
      { name: 'Physics Numericals', keywords: ['physics', 'mechanics', 'calculus', 'numerical', 'formula'] },
      { name: 'Organic Chemistry', keywords: ['chemistry', 'organic', 'inorganic', 'reaction', 'bond'] },
      { name: 'Biology Memorisation', keywords: ['biology', 'botany', 'zoology', 'ncert', 'diagram'] },
      { name: 'Current Affairs & GS', keywords: ['current affairs', 'gs', 'history', 'polity', 'mains', 'editorial'] },
      { name: 'Aptitude & LR', keywords: ['aptitude', 'math', 'lr', 'quants', 'data interpretation', 'logical'] }
    ];

    entries.forEach(e => {
      const contentLower = e.content.toLowerCase();
      let stressVal = e.analysis ? (10 - e.analysis.moodSliderValue) : (10 - e.manualMood);

      subjectKeywords.forEach(sub => {
        const matches = sub.keywords.some(kw => contentLower.includes(kw));
        if (matches) {
          if (!subjectsMap[sub.name]) {
            subjectsMap[sub.name] = { sum: 0, count: 0 };
          }
          subjectsMap[sub.name].sum += stressVal;
          subjectsMap[sub.name].count += 1;
        }
      });
    });

    return Object.entries(subjectsMap).map(([name, pack]) => ({
      subject: name,
      score: Number((pack.sum / pack.count).toFixed(1)),
      count: pack.count
    })).sort((a,b) => b.score - a.score);
  };

  const subjectClusters = getSubjectStressClusters();

  // Custom SVG line trend points calculation for safety and React 19 compatibility
  const renderSVGGUIDEtlines = () => {
    if (entries.length < 2) return null;

    // Filter entries that have analysis, or map all entries sorted by date ascending
    const sortedEntries = [...entries]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10); // Take last 10 logs

    const width = 600;
    const height = 150;
    const padding = 20;

    const points = sortedEntries.map((e, idx) => {
      const x = padding + (idx * (width - 2 * padding)) / Math.max(1, sortedEntries.length - 1);
      const moodVal = e.analysis?.moodSliderValue || e.manualMood;
      // Map 1-10 to height-padding and padding
      const y = height - padding - ((moodVal - 1) * (height - 2 * padding)) / 9;
      return { x, y, date: new Date(e.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), val: moodVal };
    });

    const pathData = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="bg-brand-900 border border-brand-800 rounded-xl p-5 shadow-inner">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-mono font-bold text-brand-50">📈 Emotional Trajectory (Last 10 Days)</span>
          <span className="text-[10px] text-brand-350 font-mono">X-Axis: Date • Y-Axis: Mood (1-10)</span>
        </div>
        
        <div className="relative overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[450px]">
            {/* Grid Lines */}
            {[1, 3.25, 5.5, 7.75, 10].map((val, idx) => {
              const y = height - padding - ((val - 1) * (height - 2 * padding)) / 9;
              return (
                <g key={idx}>
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#cfded3" strokeDasharray="3 3" />
                  <text x={padding - 10} y={y + 3} fill="#718276" fontSize="8" fontFamily="monospace" textAnchor="end">{Math.round(val)}</text>
                </g>
              );
            })}

            {/* SVG Path Curve */}
            <path d={pathData} fill="none" stroke="#2a633a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Individual Data Points */}
            {points.map((p, idx) => (
              <g key={idx} className="group">
                <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#2a633a" strokeWidth="2" />
                <circle cx={p.x} cy={p.y} r="8" fill="#2a633a" opacity="0" className="hover:opacity-20 cursor-crosshair" />
                {/* Visual date node labels */}
                {idx % 2 === 0 && (
                  <text x={p.x} y={height - 2} fill="#718276" fontSize="7" fontFamily="monospace" textAnchor="middle">{p.date}</text>
                )}
                {/* Tooltip hovering text decoration */}
                <text x={p.x} y={p.y - 10} fill="#1b261f" fontSize="8" fontFamily="monospace" textAnchor="middle" className="hidden group-hover:block font-bold">
                  {p.val}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div id="stress-patterns-tab-pane" className="space-y-6 py-4 animate-in fade-in duration-200">
      
      {/* Alert diagnostic card banner */}
      {entries.length < 3 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start space-x-3 text-amber-800">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-semibold">Insights require calibration</h4>
            <p className="leading-relaxed">
              Maintain consistent logs for 3 or more days to generate specific temporal study-routine correlations (e.g., detecting prep workload peaks or topic exhaustion factors). Currently reviewing {entries.length} entry.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Visualizing stress spikes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Curve Tray */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-2.5 mb-4">
              <Activity className="h-5 w-5 text-teal-400" />
              <div>
                <h2 className="text-md font-display font-bold text-brand-50">Visualized Emotional Flow</h2>
                <p className="text-xs text-brand-350">Historical mood line charts mapping your mental stamina index</p>
              </div>
            </div>

            {entries.length >= 2 ? (
              renderSVGGUIDEtlines()
            ) : (
              <div className="border border-brand-800 border-dashed rounded-xl py-14 text-center text-xs text-brand-405 font-mono">
                Line chart activates once 2 historical log dates exist. Keep write consistency!
              </div>
            )}
          </div>

          {/* Temporal Pattern Mapping (F2 Pre-exam tracking) */}
          <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-2.5 mb-4">
              <Calendar className="h-5 w-5 text-brand-405" />
              <div>
                <h2 className="text-md font-display font-bold text-brand-50">Temporal Stress Fingerprint</h2>
                <p className="text-xs text-brand-350">Averages are grouped by day value (10 represents highest recorded stress)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pb-3">
              {dayStressDetails.map((dayItem, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1 transition-colors ${
                    dayItem.count > 0 
                      ? 'bg-brand-950 border-brand-800' 
                      : 'bg-brand-950/20 border-brand-900 text-brand-405'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase text-brand-405">{dayItem.day.slice(0, 3)}</span>
                  <span className="text-sm font-extrabold font-mono">
                    {dayItem.count > 0 ? `${dayItem.avg}/10` : '—'}
                  </span>
                  <span className="text-[8px] font-mono text-brand-405">{dayItem.count} test logs</span>
                  
                  {dayItem.count > 0 && (
                    <div className="w-full bg-brand-900 h-1 rounded overflow-hidden mt-1 max-w-[32px]">
                      <div 
                        className={`h-full ${dayItem.avg >= 7 ? 'bg-rose-500' : 'bg-brand-400'}`} 
                        style={{ width: `${dayItem.avg * 10}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {maxStressDay && maxStressDay.avg > 0 && (
              <div className="bg-brand-950/50 p-3.5 border border-brand-850 rounded-lg text-xs leading-relaxed font-mono text-brand-200">
                ⭐ <strong>Analysis:</strong> Weekly stress peaks on <span className="text-brand-100 font-bold">{maxStressDay.day}s</span> with a rating of <span className="text-rose-450 font-bold">{maxStressDay.avg}/10</span>. If exams are approaching, practice lighter static test models on these specific days.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Subject Cluster Burnout analysis */}
        <div className="space-y-6">
          <div className="bg-brand-900 border border-brand-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-brand-405" />
              <h3 className="text-xs font-mono text-brand-300 uppercase tracking-widest">Syllabus Stress Clusters</h3>
            </div>
            
            <p className="text-[11px] text-brand-350 leading-relaxed">
              We extract subject context references (numericals, current affairs, formulas) and correlate them with logged distress. Higher scores mean higher subject fatigue.
            </p>

            <div className="space-y-3.5 pt-1">
              {subjectClusters.length === 0 ? (
                <div className="text-center py-10 text-brand-405 font-mono text-[11px] italic">
                  Complete entries describing specific study blockers (e.g. "Physics mechanics difficulty" or "Chemistry reactions") to draw subject clusters.
                </div>
              ) : (
                subjectClusters.map((cluster, idx) => (
                  <div key={idx} className="bg-brand-950 p-3.5 border border-brand-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-brand-100 flex items-center space-x-1">
                        <GraduationCap className="h-3.5 w-3.5 text-brand-404" />
                        <span>{cluster.subject}</span>
                      </span>
                      <span className="font-bold font-mono text-rose-600">{cluster.score}/10 Fatigue</span>
                    </div>

                    {/* Progress representation */}
                    <div className="w-full bg-brand-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${cluster.score >= 7 ? 'bg-rose-500' : cluster.score >= 5 ? 'bg-amber-500' : 'bg-teal-400'}`}
                        style={{ width: `${cluster.score * 10}%` }}
                      ></div>
                    </div>
                    <div className="text-[9px] font-mono text-brand-450 flex justify-between">
                      <span>Matches {cluster.count} session entries</span>
                      <span>{cluster.score >=7 ? 'Caution: Burnout Risk' : 'Healthy engagement'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-900/90 to-brand-950 border border-brand-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-mono text-amber-600 uppercase tracking-wider flex items-center space-x-1.5">
              <span>⚠️ Kota Syndrome Insight</span>
            </h4>
            <p className="text-[11px] text-brand-300 leading-relaxed">
              Competitive pressure induces Black-and-White cognitive spirals (e.g. "If my mock numerical drops below 80, I will never clear the NEET exam"). If you see high subject-fatigue indicators, immediately access our CBT wellness module for customized de-escalation workouts.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
