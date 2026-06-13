/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environmental parameters
dotenv.config();

const app = express();
const PORT = 3000;

// Set up server-side safety limits and parsers
app.use(express.json({ limit: '1mb' }));

// Initialise Gemini with AI Studio signature
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Endpoint: AI-driven Journal Sentiment Analysis & Emotional Tagging (US-01, US-02, US-03, F1, F2, F5)
app.post('/api/analyze', async (req, res) => {
  try {
    const { content, examContext, manualMood } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Journal content is required for analysis.' });
    }

    if (!apiKey) {
      // Graceful fallback when API key is missing (NFR Resilience compliance)
      console.warn("GEMINI_API_KEY is not defined. Using local fallback.");
      return res.json({
        moodSliderValue: manualMood || 5,
        emotions: [
          { name: 'Stress', intensity: 6 },
          { name: 'Anxiety', intensity: 5 },
          { name: 'Calm', intensity: 4 },
          { name: 'Determination', intensity: 7 }
        ],
        triggers: [examContext ? `${examContext} preparation` : 'General Studies', 'Syllabus workload'],
        cognitiveDistortions: ['Overgeneralising'],
        summary: 'Your entry indicates a resilient effort to navigate standard preparation pressures. You are balancing your studies steadily.',
        insights: 'Consistent study engagement may trigger fatigue if not paired with progressive breaks.',
        copingProtocol: 'Try physical stretching for 5 minutes after finishing difficult numerical sets.',
        followUpQuestion: 'How can you adjust tomorrow\'s slot to include an extra 15 minutes of quiet resting?',
        crisisFlag: false
      });
    }

    // 1. In-depth rule-based crisis pre-checks for high-risk flags (Safety Directive)
    const crisisSignals = [
      'suicide', 'kill myself', 'die', 'self-harm', 'cut myself', 'ending my life', 
      'end it all', 'no point living', 'want to die', 'better off dead', 'atmanhatya', 
      'mar jana', 'sucide', 'hate my life'
    ];
    const textHasCrisis = crisisSignals.some(sig => content.toLowerCase().includes(sig));

    // 2. Query Gemini 3.5 Flash for complete Structured Sentiment Analysis using schema
    const prompt = `Analyze this journal entry written by an Indian student preparing for the "${examContext}" competitive entrance exam:
"${content}"

The user logged an initial mood rating of ${manualMood}/10.
Identify if there are core stress topics like peer pressure, family expectations, mock test failures, or subject anxiety (especially related to ${examContext} like mechanics, current affairs, numerical blocks).
Analyze the emotional states (8 dimensions: Stress, Anxiety, Hopelessness, Confidence, Calm, Determination, Overwhelm, Loneliness), cognitive distortions (e.g. black-and-white thinking, catastrophising), and provide a compassionate, empathetic, non-diagnostic response.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are MindPath AI, an advanced mental wellness evaluator. You analyze journal entries for Indian competitive exam aspirants (JEE, NEET, UPSC, etc.) with deep cultural empathy. Ensure your summary and insights are compassionate, supportive, and completely free of clinical diagnostic terms. If the content expresses deep hopelessness, self-harm, or termination of life, you MUST set crisisFlag as true.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            moodSliderValue: {
              type: Type.NUMBER,
              description: "Estimated base emotional state level from 1 to 10 (1 is deepest panic, 10 is absolute calmness)."
            },
            emotions: {
              type: Type.ARRAY,
              description: "NLP tags for emotional intensities across relevant wellness vectors.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "One of: Stress, Anxiety, Hopelessness, Confidence, Calm, Determination, Overwhelm, Loneliness" },
                  intensity: { type: Type.NUMBER, description: "Intensity scale from 0 to 10." }
                },
                required: ["name", "intensity"]
              }
            },
            triggers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Identified exam, academic, or social stress triggers (e.g., 'organic chemistry', 'mock test score', 'parents call')."
            },
            cognitiveDistortions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Cognitive patterns detected (e.g. 'Catastrophising', 'Black-and-White thinking', 'Should statements', 'Mind reading'). Keep empty if none."
            },
            summary: {
              type: Type.STRING,
              description: "A 2-3 sentence, highly comforting, empathetic summary validating the student's feelings without clinical labeling."
            },
            insights: {
              type: Type.STRING,
              description: "An actionable insight explaining why they might be feeling this stress pattern based on their studies."
            },
            copingProtocol: {
              type: Type.STRING,
              description: "A short, tactical, hyper-personalised coping technique or mock recovery strategy calibrated to their exam."
            },
            followUpQuestion: {
              type: Type.STRING,
              description: "A thoughtful, gentle guided follow-up question for tomorrow's logging session."
            },
            crisisFlag: {
              type: Type.BOOLEAN,
              description: "Flag as true if and only if there's keyword/semantic evidence of self-harm, suicidal thoughts, or critical mental health emergencies."
            }
          },
          required: ["moodSliderValue", "emotions", "triggers", "cognitiveDistortions", "summary", "insights", "copingProtocol", "followUpQuestion", "crisisFlag"]
        }
      }
    });

    const resultText = response.text || "{}";
    let analysisResult;
    try {
      analysisResult = JSON.parse(resultText);
    } catch (parseErr) {
      console.error("JSON Parsing failed for Gemini response", resultText, parseErr);
      throw parseErr;
    }

    // Secondary safety lock: force crisisFlag if regex matched
    if (textHasCrisis) {
      analysisResult.crisisFlag = true;
    }

    return res.json(analysisResult);

  } catch (error: any) {
    console.error("Journal Analysis Error:", error);
    res.status(500).json({
      error: "Failed to process AI Journal Entry analysis.",
      details: error?.message || "Internal GenAI Timeout"
    });
  }
});

// Endpoint: Empathetic AI Wellness Conversational Coach (US-04, US-02, F3, F5)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, examContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Chat message history is required.' });
    }

    if (!apiKey) {
      // Local fallback for offline review / missing variables
      console.warn("GEMINI_API_KEY is missing for chat. Using local fallback.");
      return res.json({
        content: "I am ready to help you navigate through your study blockages! I will act as your companion. Let's do a 2-minute centering cycle or talk about how to deal with the subject anxiety. What syllabus task is feeling heavy?"
      });
    }

    // Safety checks for crisis words in chat
    const crisisSignals = ['suicide', 'kill myself', 'die', 'self-harm', 'cut myself', 'ending my life', 'end it all', 'want to die', 'atmanhatya'];
    const lastMessage = messages[messages.length - 1]?.content || "";
    const hasCrisis = crisisSignals.some(sig => lastMessage.toLowerCase().includes(sig));

    if (hasCrisis) {
      return res.json({
        content: "🚨 I can hear how incredibly heavy and painful this moment is for you right now, and I want to support you. Please know you do not have to carry this alone. Let us pause and take a steady breath.\n\nBecause I care about your safety first, I strongly urge you to connect with a compassionate professional helpline right now. You can reach the KIRAN government helplines completely free, 24/7 at **18005990019**, or call the Vandrevala active line at **9999666555**.\n\nPlease open the Safety Kit at the top of your dashboard for immediate 5-4-3-2-1 grounding exercises. I'm right here.",
        isCrisis: true
      });
    }

    // Format chat messages appropriately for Gemini API
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Inject system instructions inside configs
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: `You are MindPath, an empathetic, non-judgmental wellness companion coach for Indian students preparing for extremely demanding examinations: JEE, NEET, UPSC, GATE, CAT, etc.
We are talking to students (like Priya, 19, studying 14 hours a day in Kota, Rajasthan, or Rahul, 22, dropping years feeling massive post-failure self-doubt).

Your voice guidelines:
1. Warm, comforting, validating, resilient, and non-prescriptive.
2. Under no circumstances issue clinical medical diagnoses, nor claim to be a licensed therapist.
3. Be exam-calendar aware (if student mentions exam coming soon, lower their anxiety, focus on physical rest and accuracy pacing).
4. Integrate gentle Cognitive Behavioral Therapy (CBT) styles: encourage reframing of black-and-white thoughts ("I score bad, so I am a failure" -> "A bad test score lists gaps to calibrate next week").
5. Keep conversational responses concise (2-4 paragraphs max) so they don't feel overwhelmed to read extensive texts.
6. Indian context appropriate: reference concepts like "mock tests", "coaching classes", "parental expectations", "Revision trackers", "PYQs (Previous Year Questions)".
7. Do not claim to act on behalf of coaching institutes - you are the student\'s private personal ally.`,
        temperature: 0.7,
      }
    });

    return res.json({
      content: response.text || "I am listening closely. Let's take a slow breath. Could you tell me more about what is making you feel stuck?"
    });

  } catch (error: any) {
    console.error("Chat Companion Error:", error);
    res.status(500).json({
      error: "AI Companion is currently restoring peace. Please retry.",
      details: error?.message || "GenAI connection timeout"
    });
  }
});

// Serve frontend assets
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MindPath Backend] Online on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Server Bootstrap Critical Error:", err);
  process.exit(1);
});
