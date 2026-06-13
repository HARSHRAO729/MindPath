/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CopingGuide, ExamType } from './types';

// Supported Exam Options
export const EXAM_OPTIONS: { value: ExamType; label: string; description: string }[] = [
  { value: 'JEE', label: 'JEE (Main/Advanced)', description: 'For engineering aspirants (IITs, NITs)' },
  { value: 'NEET', label: 'NEET (UG)', description: 'For medical aspirants (AIIMS, Government Colleges)' },
  { value: 'UPSC', label: 'UPSC Civil Services', description: 'For administrative posts (IAS, IPS, IFS)' },
  { value: 'CAT', label: 'CAT / IIMs', description: 'For postgraduate management entrance' },
  { value: 'GATE', label: 'GATE', description: 'For engineering postgrad & PSU recruitment' },
  { value: 'CUET', label: 'CUET (UG/PG)', description: 'For Central Universities admissions' },
  { value: 'OTHER', label: 'Other Competitive Exam', description: 'High-stakes regional/national examinations' }
];

// Exam-specific coping protocols responding to US-02 and F4
export const COPING_GUIDES: CopingGuide[] = [
  {
    id: 'guide-jee-math',
    title: 'Numerics & Syllabus Freeze Protocol',
    subjectContext: 'JEE Physics & Mathematics',
    description: 'When numerical solve percentage dips or calculus/mechanics blocks progress, study-paralysis occurs. Use this system.',
    steps: [
      'Stop attempting high-difficulty numerical mocks immediately. High stress compromises spatial reasoning.',
      'Solve exactly 5 standard previous-year questions (PYQs) representing average-difficulty topics to regain cognitive flow.',
      'Shift study layout: outline formula lists with physical scratchpad sketching instead of staring at screens.',
      'Perform a 3-minute focus breathing cycle: inhale for 4 seconds, hold for 2, exhale fully for 6 seconds.'
    ]
  },
  {
    id: 'guide-neet-bio',
    title: 'Anatomy Overwhelm & Memorisation Collapse',
    subjectContext: 'NEET Biology & Inorganic Chemistry',
    description: 'When biological naming classifications, pathway charts, or chemical reactions cause short-term memory fatigue.',
    steps: [
      'Close text references. Get up and walk for exactly 5 minutes without checking notifications.',
      'Sketch a handwritten flow chart or biology process flow completely from raw memory, ignoring orthographic perfection.',
      'Record your own voice whispering the pathways, then play it back on 1.5x speed. Auditory shifts break revision blocks.',
      'Remember: mock-test score fluctuations are revision calibration metrics, not diagnostic predictors of NEET rank.'
    ]
  },
  {
    id: 'guide-upsc-current',
    title: 'Syllabus Infinite Exhaustion Recovery',
    subjectContext: 'UPSC General Studies & Current Affairs',
    description: 'Under severe imposter syndrome during dropping years with 10+ hours of static/dynamic syllabus analysis.',
    steps: [
      'De-escalate current affairs peer-comparison anxiety: mute general discussion forums for the next 24 hours.',
      'Time-box study modules into strict 50-minute blocks, punctuated by active 10-minute floor stretching.',
      'Draft a single "Confidence Paragraph" on your optional subject - asserting three advanced theories you fully master.',
      'Access our CBT coach mode to reframe "I am falling behind my peers" into "I am building a customized, precise answer-drafting rhythm."'
    ]
  },
  {
    id: 'guide-cat-quants',
    title: 'Speed & DI-LR Stress Breakthrough',
    subjectContext: 'CAT Analytical & Quants Blocks',
    description: 'When mock test and CAT percentile calculations induce stress about administrative cutoff rates.',
    steps: [
      'Acknowledge that CAT is an accuracy and selection examination, not a volume examination. Stress damages logical elimination.',
      'Spend 10 minutes performing the Progressive Muscle Relaxation sequence: tense hands for 5 seconds, release, then tense shoulders and release.',
      'Write a 200-word freeform stream of consciousness describing the speed anxieties, then submit to our Journal for cognitive tagging.',
      'Re-engage using sectional tests rather than full-length simulator mocks to lower threat indicators.'
    ]
  }
];

// Crisis Helpline contacts responding to US-05 and F5
export interface HelplineContact {
  name: string;
  phone: string;
  timing: string;
  description: string;
  website: string;
}

export const INDIAN_HELPLINES: HelplineContact[] = [
  {
    name: 'iCall (TISS - Tata Institute of Social Sciences)',
    phone: '9152987820',
    timing: 'Monday to Saturday, 10:00 AM - 8:00 PM',
    description: 'Professional, free tele-counseling service run by experienced mental health professionals at TISS, Mumbai.',
    website: 'https://icallhelpline.org/'
  },
  {
    name: 'Vandrevala Foundation Helpline',
    phone: '9999666555',
    timing: '24 Hours | 7 Days a week (Always Available)',
    description: 'Provides active psychological first-aid, compassionate talk, and professional assessment support across India.',
    website: 'https://www.vandrevalafoundation.com/'
  },
  {
    name: 'KIRAN Helpline (Govt of India)',
    phone: '18005990019',
    timing: '24 Hours | 7 Days a week (Always Available)',
    description: 'National Mental Health Helpline launched by the Ministry of Social Justice and Empowerment, India.',
    website: 'https://socialjustice.gov.in/'
  }
];

// Guided journaling daily triggers
export const GUIDED_JOURNAL_PROMPTS = [
  "How did your study sessions go today? What subjects felt manageable, and which triggered self-doubt?",
  "Reflect on today's peer interaction or mock results. Did any competitive comparison make you feel isolated?",
  "What physical symptoms did you experience today (e.g., tight chest, neck cramp, sleepiness) while studying?",
  "Imagine you are speaking to your future self entering the exam hall. What words of reassurance would you offer?",
  "Describe a small achievement today—even if it is solving a single tough numerical or completing a planned revision chapter."
];
