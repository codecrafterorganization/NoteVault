/**
 * Groq AI Utility
 * Uses Groq's OpenAI-compatible API for ultra-fast LLaMA inference.
 * Primarily used for Test Mode and Quiz generation.
 */

const axios = require('axios');

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile'; // Fast + smart
const FAST_MODEL    = 'llama-3.1-8b-instant';     // For simpler tasks

/**
 * Generate content using Groq
 * @param {string} prompt - The prompt to send
 * @param {Object} options - { model, maxTokens, temperature, json }
 * @returns {Promise<string>} - The response text
 */
async function generateContent(prompt, options = {}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error('[Groq] GROQ_API_KEY not set in environment.');
    throw new Error('Groq API key not configured.');
  }

  const model       = options.model       || DEFAULT_MODEL;
  const maxTokens   = options.maxTokens   || 2048;
  const temperature = options.temperature ?? 0.4;

  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    temperature,
  };

  // Ask Groq to return JSON if requested
  if (options.json) {
    body.response_format = { type: 'json_object' };
  }

  try {
    console.log(`[Groq] Calling ${model} (max_tokens: ${maxTokens})...`);
    const response = await axios.post(
      `${GROQ_API_BASE}/chat/completions`,
      body,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    const text = response.data.choices[0].message.content;
    console.log(`[Groq] Success ✓ (${text.length} chars)`);
    return text;
  } catch (error) {
    const status  = error.response?.status;
    const message = error.response?.data?.error?.message || error.message;
    console.error(`[Groq] API Error ${status}: ${message}`);
    throw new Error(`Groq API failed: ${message}`);
  }
}

/**
 * Parse JSON safely from Groq response (strips markdown fences)
 */
function parseJSON(text) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = match ? match[1] : text;
  return JSON.parse(jsonStr.trim());
}

module.exports = { generateContent, parseJSON, FAST_MODEL, DEFAULT_MODEL };
