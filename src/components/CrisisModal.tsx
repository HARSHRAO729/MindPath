/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Phone, ShieldAlert, Heart, RefreshCw, Send, CheckCircle } from 'lucide-react';
import { INDIAN_HELPLINES } from '../data';
import { TrustedContact } from '../types';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  trustedContact?: TrustedContact;
  saveTrustedContact: (contact: TrustedContact) => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  isOpen,
  onClose,
  trustedContact,
  saveTrustedContact
}) => {
  // Grounding Step Controller (0: Introduction, 1: See, 2: Touch, 3: Hear, 4: Smell, 5: Taste, 6: Affirmation)
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingInputs, setGroundingInputs] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  // Trusted Contact State
  const [contactName, setContactName] = useState(trustedContact?.name || '');
  const [contactPhone, setContactPhone] = useState(trustedContact?.contact || '');
  const [contactRelation, setContactRelation] = useState(trustedContact?.relation || '');
  const [contactResultMsg, setContactResultMsg] = useState('');

  if (!isOpen) return null;

  // 5-4-3-2-1 Grounding steps config
  const STEPS_CONFIG = [
    {
      step: 1,
      heading: '5 things you can SEE',
      instructions: 'Look around you. Identify 5 objects in your visual space. Type each one or list them mentally to target your cognitive attention focal point.',
      targetCount: 5,
      placeholder: 'e.g., A blue notebook'
    },
    {
      step: 2,
      heading: '4 things you can TOUCH/FEEL',
      instructions: 'Pay attention to your body. Identify 4 tactile sensations (e.g., your cold table, your wooden chair, clothes on your shoulders, standard paper texture).',
      targetCount: 4,
      placeholder: 'e.g., My cold study table'
    },
    {
      step: 3,
      heading: '3 sounds you can HEAR',
      instructions: 'Close your eyes. Listen deeply to the ambient sounds. List 3 distinct auditory cues (e.g. humming fan, distant traffic, ticking alarm clock, wind leaves).',
      targetCount: 3,
      placeholder: 'e.g., Humming table fan'
    },
    {
      step: 4,
      heading: '2 things you can SMELL',
      instructions: 'Inhale slowly. Notice 2 subtle scents around (e.g., old books, tea capsule, ink, fresh pencil wood, wood floor).',
      targetCount: 2,
      placeholder: 'e.g., Smudge eraser rubber scent'
    },
    {
      step: 5,
      heading: '1 thing you can TASTE / AFFIRM',
      instructions: 'Acknowledge 1 taste on your tongue or assert 1 positive emotional affirmation. Inhale for 4 seconds, hold for 4, and exhale for 6.',
      targetCount: 1,
      placeholder: 'e.g., I am doing my absolute best right here.'
    }
  ];

  const handleAddInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;
    
    const config = STEPS_CONFIG[groundingStep - 1];
    setGroundingInputs([...groundingInputs, currentInput.trim()]);
    setCurrentInput('');

    // Advance if count achieved
    if (groundingInputs.length + 1 >= config.targetCount) {
      setTimeout(() => {
        setGroundingInputs([]);
        setGroundingStep(prev => prev + 1);
      }, 400);
    }
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) {
      setContactResultMsg('Please enter both name and contact details.');
      return;
    }
    saveTrustedContact({
      name: contactName,
      contact: contactPhone,
      relation: contactRelation
    });
    setContactResultMsg('Trusted contact locked successfully!');
    setTimeout(() => setContactResultMsg(''), 3000);
  };

  const resetGrounding = () => {
    setGroundingStep(1);
    setGroundingInputs([]);
    setCurrentInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="crisis-modal-container"
        className="bg-brand-900 border border-red-800 rounded-2xl max-w-3xl w-full mx-auto shadow-2xl overflow-hidden animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crisis-modal-title"
      >
        
        {/* Modal Header */}
        <div className="bg-rose-50 border-b border-rose-200 p-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <ShieldAlert className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h2 id="crisis-modal-title" className="text-xl font-display font-bold text-rose-800">Safety & Grounding Kit (SOS)</h2>
              <p className="text-xs text-rose-600">Empathetic relief, grounding mechanisms, and professional helpline networks</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-200 cursor-pointer"
            aria-label="Close safety and grounding kit"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-5 gap-8 max-h-[80vh] overflow-y-auto">
          
          {/* Left Column: Interactive 5-4-3-2-1 Grounding Box (F5 sensory technique) */}
          <div className="md:col-span-3 space-y-6">
            <div className="bg-brand-950/60 border border-brand-800 p-5 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-mono text-brand-300 uppercase tracking-widest flex items-center space-x-2">
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>5-4-3-2-1 Grounding</span>
                </h3>
                {groundingStep > 0 && (
                  <button 
                    onClick={resetGrounding}
                    className="text-[10px] text-brand-400 hover:text-brand-300 underline font-mono flex items-center space-x-1"
                  >
                    Restart Exercise
                  </button>
                )}
              </div>

              {/* Initial Intro State */}
              {groundingStep === 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-brand-100 leading-relaxed">
                    If study pressure feel crushing or anxiety is triggering physical chest-locking feelings, you can perform the **5-4-3-2-1 Sensory Grounding Technique**. This cognitive practice diverts your midbrain away from flight-or-fright stress triggers and anchors you back to the present room.
                  </p>
                  <button
                    onClick={() => {
                      setGroundingStep(1);
                      setGroundingInputs([]);
                    }}
                    className="w-full bg-brand-500 hover:bg-brand-400 text-brand-50 font-semibold py-2.5 px-4 rounded-lg text-sm cursor-pointer transition-all"
                  >
                    Start 5-4-3-2-1 Grounding
                  </button>
                </div>
              ) : groundingStep <= 5 ? (
                // Active Grounding Steps
                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-brand-400 font-mono">
                    <span>Step {groundingStep} of 5</span>
                    <span>Needs {STEPS_CONFIG[groundingStep - 1].targetCount} items</span>
                  </div>
                  <h4 className="text-lg font-display font-semibold text-brand-50 bg-brand-900/50 py-1.5 px-3 rounded border border-brand-800">
                    {STEPS_CONFIG[groundingStep - 1].heading}
                  </h4>
                  <p className="text-xs text-brand-300 leading-relaxed">
                    {STEPS_CONFIG[groundingStep - 1].instructions}
                  </p>

                  {/* Inputs List accumulator */}
                  <div className="space-y-1.5">
                    {groundingInputs.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs text-brand-100 font-mono bg-brand-900/60 px-2.5 py-1.5 rounded border border-brand-850">
                        <span className="text-teal-400 font-bold font-sans">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleAddInput} className="flex space-x-2">
                    <input
                      type="text"
                      aria-label={STEPS_CONFIG[groundingStep - 1].heading}
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder={STEPS_CONFIG[groundingStep - 1].placeholder}
                      maxLength={120}
                      className="flex-1 bg-brand-900 text-brand-50 border border-brand-750 px-3 py-2 rounded-lg text-xs focus:ring-1 focus:ring-brand-400 outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-brand-600 hover:bg-brand-500 text-white p-2 rounded-lg cursor-pointer transition-all"
                      aria-label="Add grounding exercise item"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              ) : (
                // Finished State
                <div className="text-center py-6 space-y-4">
                  <div className="inline-flex p-3 bg-teal-50 text-teal-600 rounded-full border border-teal-200 mb-2">
                    <Heart className="h-8 w-8 animate-pulse" />
                  </div>
                  <h4 className="text-lg font-display font-semibold text-teal-800">Center Completed</h4>
                  <p className="text-xs text-brand-200 leading-relaxed max-w-sm mx-auto">
                    Excellent work. You have successfully navigated back. Your physical breathing should be slower. Let your shoulders drop, release your jaw, and rest for the next 10 minutes.
                  </p>
                  <button
                    onClick={() => setGroundingStep(0)}
                    className="bg-brand-800 hover:bg-brand-700 text-brand-50 font-semibold py-2 px-4 rounded-lg text-xs cursor-pointer transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Trusted Contact Locker */}
            <div className="bg-brand-950/60 border border-brand-800 p-5 rounded-xl">
              <h3 className="text-xs font-mono text-brand-300 uppercase tracking-widest mb-3">Save Trusted Ally</h3>
              <form onSubmit={handleSaveContact} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="trusted-contact-name" className="block text-[10px] font-mono text-brand-400 uppercase mb-1">Ally Name</label>
                    <input
                      id="trusted-contact-name"
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g., Mom / Sister / Friend"
                      className="w-full bg-brand-905 text-brand-50 border border-brand-750 px-2.5 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-brand-400 outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="trusted-contact-relation" className="block text-[10px] font-mono text-brand-400 uppercase mb-1">Relationship</label>
                    <input
                      id="trusted-contact-relation"
                      type="text"
                      required
                      value={contactRelation}
                      onChange={(e) => setContactRelation(e.target.value)}
                      placeholder="e.g., Mother / Study Partner"
                      className="w-full bg-brand-905 text-brand-50 border border-brand-750 px-2.5 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-brand-400 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="trusted-contact-phone" className="block text-[10px] font-mono text-brand-400 uppercase mb-1">Phone Number / Email</label>
                  <input
                    id="trusted-contact-phone"
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g., +91 98765 43210"
                    className="w-full bg-brand-905 text-brand-50 border border-brand-750 px-2.5 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-brand-400 outline-none"
                  />
                </div>
                
                {contactResultMsg && (
                  <p className="text-xs text-emerald-400 font-mono flex items-center space-x-1">
                    <CheckCircle className="h-3.5 w-3.5 inline" />
                    <span>{contactResultMsg}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-brand-800 hover:bg-brand-700 text-brand-50 font-semibold py-2 px-3 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  Lock Trusted Contact Info
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Indian Professional Mental Health Helplines list (India compliance) */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-mono text-red-300 uppercase tracking-widest flex items-center space-x-1.5">
              <Phone className="h-3.5 w-3.5 text-red-400" />
              <span>Indian Helplines</span>
            </h3>
            
            <p className="text-[11px] text-brand-300 leading-relaxed">
              These are zero-stigma, free mental health telephone lifelines operating in India. Do not hesitate to call at any hour of the night. You will speak directly to an active counselor.
            </p>

            <div className="space-y-3.5">
              {INDIAN_HELPLINES.map((line, idx) => (
                <div key={idx} className="bg-brand-950/90 border border-brand-800 hover:border-red-900/60 p-4 rounded-xl transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-display font-semibold text-brand-100">{line.name}</span>
                  </div>
                  
                  {/* Urgent calling trigger */}
                  <a 
                    href={`tel:${line.phone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center space-x-1.5 bg-green-950 hover:bg-green-900 text-green-300 border border-green-800/60 px-2.5 py-1 rounded-lg text-xs font-bold font-mono my-2 cursor-pointer"
                  >
                    <Phone className="h-3 w-3" />
                    <span>Dial: {line.phone}</span>
                  </a>

                  <p className="text-[10px] text-brand-300 mb-1 leading-relaxed">{line.description}</p>
                  <div className="flex items-center justify-between text-[9px] font-mono text-brand-400 border-t border-brand-850 pt-2 mt-2">
                    <span>🕒 {line.timing}</span>
                    <a href={line.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-300">Website ↗</a>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-lg text-center text-[10px] leading-relaxed text-red-300">
              ⚠️ <strong>Disclaimer:</strong> MindPath is a wellness coaching assistant utilizing Generative AI models. It is not qualified to deliver clinical therapy, crisis diagnosis, or replacement for statutory emergency response lines.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
