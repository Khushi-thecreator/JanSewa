import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini API to prevent crash if key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set. Please set it in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// AI Categorization Endpoint
app.post('/api/categorize', async (req, res) => {
  const { description } = req.body;

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    const ai = getGeminiClient();
    
    const prompt = `Analyze the following description of a municipal/civic issue anywhere in India and categorize it into exactly one of these options: "Water Supply", "Sanitation", or "Roads". If it is none of these, return "Something Else".
    
    Issue description:
    "${description}"`;
 
     const response = await ai.models.generateContent({
       model: 'gemini-3.5-flash',
       contents: prompt,
       config: {
         systemInstruction: 'You are an expert AI municipal router for Indian Municipal Administrations. Analyze civic grievances and classify them correctly. Choose ONLY one of the valid options: "Water Supply", "Sanitation", "Roads", or "Something Else".',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'The classified category: must be exactly "Water Supply", "Sanitation", "Roads", or "Something Else".',
            },
            reason: {
              type: Type.STRING,
              description: 'A brief, 1-sentence reason for this classification.',
            }
          },
          required: ['category', 'reason'],
        },
      },
    });

    const resultText = response.text?.trim() || '{}';
    const classification = JSON.parse(resultText);
    
    return res.json(classification);
  } catch (error: any) {
    console.error('AI Categorization Error:', error);
    
    // Provide a smart rule-based fallback if Gemini is not configured or fails
    const descLower = description.toLowerCase();
    let fallbackCategory = 'Something Else';
    let fallbackReason = 'Rule-based fallback used because of server/API limitations.';

    if (descLower.includes('water') || descLower.includes('leak') || descLower.includes('pipeline') || descLower.includes('contamination') || descLower.includes('supply')) {
      fallbackCategory = 'Water Supply';
      fallbackReason = 'Detected water-related terms in your description.';
    } else if (descLower.includes('garbage') || descLower.includes('clean') || descLower.includes('sanitation') || descLower.includes('waste') || descLower.includes('dump') || descLower.includes('litter') || descLower.includes('sweep') || descLower.includes('dirt')) {
      fallbackCategory = 'Sanitation';
      fallbackReason = 'Detected sanitation or garbage-related terms in your description.';
    } else if (descLower.includes('road') || descLower.includes('pothole') || descLower.includes('street') || descLower.includes('bridge') || descLower.includes('asphalt') || descLower.includes('tar') || descLower.includes('flyover')) {
      fallbackCategory = 'Roads';
      fallbackReason = 'Detected road or pothole-related terms in your description.';
    }

    return res.json({
      category: fallbackCategory,
      reason: fallbackReason,
      isFallback: true,
      errorMessage: error.message || 'Unknown error'
    });
  }
});

// AI Audio Speech-to-Text Transcription Endpoint
app.post('/api/transcribe', async (req, res) => {
  const { audioBase64, mimeType } = req.body;

  if (!audioBase64) {
    return res.status(400).json({ error: 'Audio data is required for transcription' });
  }

  // If the API key is not configured, return a friendly demo transcription so the feature can still be fully previewed
  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      transcript: "गड्ढा ठीक करवाएं - There are several potholes on Amin Marg, near Kalavad Road. Please repair them urgently.",
      isDemo: true,
      note: "Note: Real-time speech-to-text requires a GEMINI_API_KEY. Set it in Settings > Secrets to enable live AI transcription."
    });
  }

  try {
    const ai = getGeminiClient();
    const actualMimeType = mimeType || 'audio/webm';

    const audioPart = {
      inlineData: {
        mimeType: actualMimeType,
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        audioPart,
        {
          text: 'You are an accurate multilingual speech-to-text transcriber for the JanSewa India Civic Portal. Please transcribe the provided audio voice note. It may be spoken in English, Hindi, or a mix of both (Hinglish). Transcribe what is said exactly and clearly, maintaining the language and words used. Do not translate Hindi to English; transcribe it in the Devanagari script for Hindi, and Latin script for English/Hinglish. Provide only the clean text transcript. Do not include any introductory comments, formatting, or explanations.',
        }
      ],
    });

    const transcript = response.text?.trim() || '';
    return res.json({ transcript });
  } catch (error: any) {
    console.error('Audio Transcription Error:', error);
    return res.status(500).json({ 
      error: 'Failed to transcribe audio note', 
      message: error.message || 'Unknown error',
      transcript: "There are severe potholes on Amin Marg, near Kalavad Road. Please repair them urgently. (Fallback transcription used because of API failure)"
    });
  }
});

// Serve static assets or boot Vite dev server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
