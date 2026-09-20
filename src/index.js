import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DEFAULT_MODEL = process.env.GROQ_DEFAULT_MODEL || 'groq/compound-mini';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Groq client dynamically to avoid crash if env is set later
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set.');
  }
  return new Groq({ apiKey });
}

// Health Check / Root Endpoint
app.get(['/', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'Groq AI Server',
    version: '1.0.0',
    defaultModel: DEFAULT_MODEL,
    hasApiKey: Boolean(process.env.GROQ_API_KEY)
  });
});

// Primary Endpoint for Groq AI generation
const handleGenerate = async (req, res) => {
  try {
    const {
      prompt,
      messages,
      systemPrompt,
      model = DEFAULT_MODEL,
      temperature = 0.7,
      maxTokens,
      max_tokens
    } = req.body;

    // Build standard messages array
    let groqMessages = [];

    if (Array.isArray(messages) && messages.length > 0) {
      groqMessages = [...messages];
      if (systemPrompt) {
        groqMessages.unshift({ role: 'system', content: systemPrompt });
      }
    } else if (prompt && typeof prompt === 'string') {
      if (systemPrompt) {
        groqMessages.push({ role: 'system', content: systemPrompt });
      }
      groqMessages.push({ role: 'user', content: prompt });
    } else {
      return res.status(400).json({
        success: false,
        error: "Missing required input. Provide either a 'prompt' string or a 'messages' array in the request body."
      });
    }

    const groq = getGroqClient();

    const completionOptions = {
      messages: groqMessages,
      model: model,
      temperature: Number(temperature)
    };

    const tokenLimit = maxTokens || max_tokens;
    if (tokenLimit) {
      completionOptions.max_tokens = Number(tokenLimit);
    }

    const chatCompletion = await groq.chat.completions.create(completionOptions);

    const responseText = chatCompletion.choices[0]?.message?.content || '';

    // If request asks for detailed output (e.g. ?details=true), include model and usage
    if (req.query.details === 'true' || req.body.includeDetails) {
      return res.json({
        response: responseText,
        model: chatCompletion.model,
        usage: chatCompletion.usage || null
      });
    }

    // Default simplified clean response
    return res.json({
      response: responseText
    });

  } catch (error) {
    console.error('Groq API Error:', error.message || error);
    const statusCode = error.status || (error.message?.includes('GROQ_API_KEY') ? 401 : 500);

    return res.status(statusCode).json({
      success: false,
      error: error.message || 'An error occurred while calling the Groq AI service.'
    });
  }
};

// Endpoints mapping
app.post('/api/generate', handleGenerate);
app.post('/api/chat', handleGenerate);
app.post('/', handleGenerate);

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found.`
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Groq AI Server running on http://0.0.0.0:${PORT}`);
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️  WARNING: GROQ_API_KEY environment variable is missing. Set it in .env or Render dashboard.');
  }
});
