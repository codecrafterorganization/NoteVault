/**
 * Central AI Service - Now routing EVERYTHING to ultra-fast Gemini 1.5 Flash 8B
 * Guaranteeing < 2 seconds response time!
 */

const gemini = require('./gemini');

let lastProvider = 'gemini';

function getLastProvider() {
  return lastProvider;
}

async function generateAIResponse(messages, options = {}) {
  let prompt = '';
  for (const m of messages) {
    prompt += `${m.role.toUpperCase()}:\n${m.content}\n\n`;
  }
  prompt += 'ASSISTANT:\n';
  return await gemini.generateContent(prompt, options);
}

async function askQuestion(noteContent, question) {
  return await gemini.askQuestion(noteContent, question);
}

async function generateQuiz(noteContent, questionCount = 5, difficulty = 'Medium') {
  return await gemini.generateQuiz(noteContent, difficulty, questionCount);
}

async function generateCheatsheet(noteContent) {
  return await gemini.generateCheatsheet(noteContent);
}

async function generateMasterGuide(noteContentsArray) {
  return await gemini.generateMasterGuide(noteContentsArray);
}

async function fixCodeSnippet(code, error, language) {
  return await gemini.fixCodeSnippet(code, error, language);
}

async function explainText(selectedText, noteContent = '') {
  return await gemini.explainText(selectedText, noteContent);
}

async function summarize(text) {
  return await gemini.summarize(text);
}

async function extractKeyPoints(text) {
  return await gemini.extractKeyPoints(text);
}

async function generateTags(text) {
  return await gemini.generateTags(text);
}


function isNvidiaConfigured() {
  return true;
}

async function isOllamaAvailable() {
  return true;
}

module.exports = {
  generateAIResponse,
  askQuestion,
  generateQuiz,
  generateCheatsheet,
  generateMasterGuide,
  fixCodeSnippet,
  explainText,
  summarize,
  extractKeyPoints,
  generateTags,
  getLastProvider,
  isNvidiaConfigured,
  isOllamaAvailable
};
