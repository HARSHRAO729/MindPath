/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, SendHorizontal, AlertCircle, Play, Pause, Heart, MessageSquare } from 'lucide-react';
import { ChatMessage, ChatRole, ExamType } from '../types';

interface CoachTabProps {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  exam: ExamType;
  isLoading: boolean;
  onCompleteBreathing?: () => void;
}

export const CoachTab: React.FC<CoachTabProps> = ({
  messages,
  sendMessage,
  exam,
  isLoading,
  onCompleteBreathing
}) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Guided Breathing Animation States (F3/F4 breathing exercises)
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingText, setBreathingText] = useState('Ready');
  const [breathingTimer, setBreathingTimer] = useState(0);
  const breathStateRef = useRef<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const breatheInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Auto Scroll to Chat bottoms
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle guided breathing cycle (4-4-6 timing)
  useEffect(() => {
    if (isBreathing) {
      setBreathingTimer(4);
      breathStateRef.current = 'inhale';
      setBreathingText('Inhale Slowly...');

      breatheInterval.current = setInterval(() => {
        setBreathingTimer(prev => {
          if (prev <= 1) {
            // State machine switches
            if (breathStateRef.current === 'inhale') {
              breathStateRef.current = 'hold';
              setBreathingText('Hold Your Breath...');
              return 4; // hold 4 sec
            } else if (breathStateRef.current === 'hold') {
              breathStateRef.current = 'exhale';
              setBreathingText('Exhale Fully...');
              return 6; // exhale 6 sec
            } else {
              breathStateRef.current = 'inhale';
              setBreathingText('Inhale Slowly...');
              return 4; // restart inhale 4 sec
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breatheInterval.current) {
        clearInterval(breatheInterval.current);
      }
      setBreathingText('Ready');
      setBreathingTimer(0);
      breathStateRef.current = 'idle';
    }

    return () => {
      if (breatheInterval.current) clearInterval(breatheInterval.current);
    };
  }, [isBreathing]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    await sendMessage(text);
  };

  const cbtNudges = [
    "I just prepared for a Chemistry mock and my score dropped. I feel hopeless.",
    "My study timezone is out of sync. I study late at night and feel alone.",
    "My parents expect a 99th percentile JEE Advanced rank. It creates major guilt."
  ];

  return (
    <div id="coach-tab-pane" className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-4 animate-in fade-in duration-200">
      
      {/* Column 1 & 2: Chat panel */}
      <div className="lg:col-span-2 flex flex-col h-[650px] bg-brand-900 border border-brand-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Chat Banner Info */}
        <div className="bg-brand-950 p-4 border-b border-brand-800 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <div>
              <h2 className="text-sm font-display font-bold text-brand-50">MindPath Companion Coach</h2>
              <span className="text-[9px] font-mono text-brand-404">Empathetic CBT Specialist & Peer Reassurer</span>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase bg-brand-800 text-brand-300 px-2 py-0.5 rounded border border-brand-750">
            {exam} Assistant Mode
          </span>
        </div>

        {/* Message Flows */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-brand-950/20">
          
          {messages.length === 0 && (
            <div className="text-center py-12 max-w-md mx-auto space-y-4">
              <div className="inline-flex p-3 bg-brand-800/60 rounded-full border border-brand-700 text-emerald-300">
                <Heart className="h-8 w-8 animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-brand-100">Welcome to your secure companion space.</p>
              <p className="text-xs text-brand-350 leading-relaxed">
                I am your private counselor, non-judgmental coach, and study supporter. Feel free to talk about numerical failures, syllabus paralysis, competitive isolation, or midnight exhaustion.
              </p>
              
              {/* Preset CBT user story triggers */}
              <div className="space-y-2 pt-3 text-left">
                <span className="text-[9px] font-mono text-brand-450 uppercase block tracking-wider text-center">Frequently Queried Pain Points</span>
                {cbtNudges.map((nudge, idx) => (
                  <button
                    key={idx}
                    id={`chat-preset-nudge-${idx}`}
                    onClick={() => {
                      setInputText(nudge);
                    }}
                    className="w-full text-left bg-brand-950 hover:bg-brand-900 text-brand-200 p-3 rounded-lg border border-brand-850 hover:border-brand-750 text-xs leading-relaxed transition-all cursor-pointer block"
                  >
                    💬 {nudge}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render individual chats */}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-md border ${
                  m.role === 'user'
                    ? 'bg-brand-500 text-white border-brand-405 rounded-br-none font-medium'
                    : 'bg-brand-900 text-brand-100 border-brand-800 rounded-bl-none'
                }`}
              >
                {/* Format markdown simple bullet segments elegantly */}
                <div className="whitespace-pre-wrap font-sans">
                  {m.content}
                </div>
                <div className="text-[8px] font-mono text-brand-403 text-right mt-1.5 opacity-60">
                  {new Date(m.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-brand-900 border border-brand-800 rounded-2xl rounded-bl-none px-4 py-3 text-xs text-brand-300 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <span className="h-1.5 w-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-1.5 w-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-1.5 w-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="font-mono text-[10px]">Companion is reflecting on your situation...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Form Input Control */}
        <form onSubmit={handleSend} className="p-4 bg-brand-950 border-t border-brand-800 flex items-center space-x-3">
          <input
            id="chat-user-message-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Tell your Companion what is weighing you down tonight..."
            className="flex-1 bg-brand-900 text-brand-50 border border-brand-750 px-4 py-3 rounded-xl text-xs outline-none focus:ring-1 focus:ring-brand-405 focus:border-brand-405 transition-colors disabled:opacity-50 font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-brand-500 text-white rounded-xl hover:bg-brand-400 disabled:opacity-50 transition-colors cursor-pointer shrink-0 shadow-lg flex items-center justify-center"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </form>

      </div>

      {/* Column 3: Guided breathing therapy ring */}
      <div className="space-y-6">
        
        {/* Breathing card widget */}
        <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 shadow-xl text-center flex flex-col items-center justify-center space-y-6">
          <div className="text-left w-full">
            <h3 className="text-xs font-mono text-brand-300 uppercase tracking-widest flex items-center space-x-1.5">
              <Sparkles className="h-3.5 w-3.5 text-teal-650" />
              <span>Study Break Grounding Circle</span>
            </h3>
            <p className="text-[11px] text-brand-350 leading-relaxed mt-1">
              F4 micro-intervention. Match this 16-second cyclic count to recover your focus when formulas feel overwhelming.
            </p>
          </div>

          {/* Visual dynamic breathing sphere (pulses dynamically on class trigger) */}
          <div className="relative flex items-center justify-center h-52 w-52 my-3">
            <div className={`absolute inset-0 rounded-full bg-teal-500/10 border border-teal-500/20 ${isBreathing ? 'breathing-ring' : ''}`}></div>
            <div className={`absolute inset-6 rounded-full bg-brand-850/90 border border-brand-750 flex flex-col items-center justify-center space-y-1 transition-all ${
              isBreathing && breathStateRef.current === 'inhale' ? 'scale-110 !border-brand-400' :
              isBreathing && breathStateRef.current === 'hold' ? 'scale-120 !border-amber-500' :
              isBreathing && breathStateRef.current === 'exhale' ? 'scale-95 !border-brand-500' : 'scale-100'
            }`}>
              <span className={`text-[11px] tracking-wide font-bold transition-all duration-300 ${
                breathStateRef.current === 'inhale' ? 'text-brand-404 font-bold' :
                breathStateRef.current === 'hold' ? 'text-amber-600 font-bold' :
                breathStateRef.current === 'exhale' ? 'text-brand-500 font-bold' : 'text-brand-300'
              }`}>
                {breathingText}
              </span>
              
              {isBreathing && (
                <span className="text-3xl font-extrabold font-mono text-brand-50">
                  {breathingTimer}s
                </span>
              )}
            </div>
          </div>

          <div className="w-full space-y-3 pt-2">
            <button
              id="breathing-trigger-btn"
              onClick={() => {
                const nextState = !isBreathing;
                setIsBreathing(nextState);
                if (nextState && onCompleteBreathing) {
                  onCompleteBreathing();
                }
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold font-mono tracking-widest transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                isBreathing 
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                  : 'bg-teal-650 hover:bg-teal-555 text-teal-50 border border-teal-600 shadow-lg'
              }`}
            >
              {isBreathing ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>HALT DEEP BREATHS</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white text-white" />
                  <span>START PRACTICE BREATHS</span>
                </>
              )}
            </button>

            {/* Breathing instructions footer block */}
            <div className="text-[10px] text-brand-405 font-mono flex justify-around border-t border-brand-850/60 pt-3">
              <div>💨 Inhale 4s</div>
              <div>🧘 Hold 4s</div>
              <div>🌬️ Exhale 6s</div>
            </div>
          </div>
        </div>

        {/* Empathy Guidance Nudge */}
        <div className="bg-brand-950/60 border border-brand-800 p-5 rounded-xl space-y-3">
          <h4 className="text-xs font-mono uppercase text-brand-300">CBT Advice: Self-Soothe</h4>
          <p className="text-[11px] text-brand-350 leading-relaxed">
            Kota drops or prolonged UPSC drops create severe "tunnel vision" where you see only your upcoming mock test and forget your broader physical existence. Deep diaphragmatic breathing decreases cortisol within 90 seconds, breaking study panic. Access it anytime.
          </p>
        </div>

      </div>

    </div>
  );
};
