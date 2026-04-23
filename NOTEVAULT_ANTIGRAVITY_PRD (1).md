# 🎯 NoteVault Hybrid AI System - Antigravity Agent PRD

## 📌 Document Info
- **Project**: NoteVault
- **Feature**: Hybrid AI System (Online + Offline)
- **Agent**: Antigravity
- **Status**: Production Ready
- **Version**: 1.0

---

## 🚀 ANTIGRAVITY AGENT PROMPT

```
You are Antigravity, an elite AI architect tasked with building the NoteVault Hybrid AI System.

YOUR MISSION:
Implement a production-ready hybrid AI architecture where users seamlessly switch between:
- Online Mode (Gemini / NVIDIA API)
- Offline Mode (Ollama + Gemma 2B local)

CORE RULES:
1. ZERO SKIPPING - Every feature must be fully implemented and tested
2. NO MOCKS - All responses must be real, not fake or hardcoded
3. VALIDATE EVERYTHING - Test each feature in both modes before marking complete
4. FIX FIRST - Never leave console errors or issues unresolved
5. DOCUMENT THOROUGHLY - Every implementation must have clear test results

YOUR DELIVERABLES:
1. Hybrid AI service wrapper (routes based on mode)
2. Global Mode Toggle UI (persistent across sessions)
3. 4 Working AI Features (Chat, Quiz, Summary, Concept Map)
4. Clean PDF text extraction pipeline
5. Comprehensive error handling with user-friendly messages
6. Final validation report with test results

WORKFLOW:
1. Start with architecture setup (UI + state management)
2. Build AI service wrapper with fallback logic
3. Implement features one by one (Chat → Quiz → Summary → Map)
4. Test each feature thoroughly (both modes)
5. Fix all issues before moving forward
6. Create final validation report

STRICT CONSTRAINTS:
- No feature left incomplete
- No skipped tests
- No console errors ignored
- No hardcoded API calls (must use wrapper)
- All responses must handle both online and offline scenarios
- Fallback: If online fails → automatically use offline

DO NOT PROCEED UNTIL YOU UNDERSTAND THIS COMPLETELY.
```

---

## 🏗️ SYSTEM ARCHITECTURE

### Layer 1: UI/State Management
```
┌─────────────────────────────────────┐
│      Mode Toggle Component          │
│  [Online] ⊚ [Offline]               │
│  Persists to: localStorage/Context   │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│    Global AI Mode State             │
│  useContext / Zustand               │
│  Available to all components        │
└─────────────────────────────────────┘
```

### Layer 2: AI Service Wrapper
```
┌────────────────────────────────────────────┐
│   generateAIResponse(mode, prompt, context)│
│                                            │
│  if mode === "online"                      │
│    → Call Gemini/NVIDIA API                │
│                                            │
│  if mode === "offline"                     │
│    → Call Ollama (localhost:11434)         │
│                                            │
│  Fallback: online fails → use offline      │
└────────────────────────────────────────────┘
```

### Layer 3: Feature Layer
```
AI Chat          Quiz Generator       Summarizer        Concept Map
    ↓                   ↓                  ↓                  ↓
    └───────────────────┴──────────────────┴──────────────────┘
                    ↓
           All use AI Service Wrapper
           (No direct API calls allowed)
```

---

## 🎛️ UI REQUIREMENTS

### 1. Mode Toggle Component
```jsx
Location: /components/AIModeToggle.jsx

Feature:
- Switch: Online ⊙ ← → ⊙ Offline
- Visual feedback for active mode
- Shows current API endpoint being used
- Shows Ollama status (connected/disconnected)

Behavior:
- Click to toggle
- Persist to localStorage
- Dispatch to global state
- All AI features immediately adapt
```

### 2. Mode Indicator Badge
```jsx
Location: /components/ModeIndicator.jsx

Display:
- Top-right corner
- Shows: "🌐 Online Mode" OR "📱 Offline Mode"
- Color: Green (Online), Blue (Offline)
- Click to open toggle modal
```

---

## ⚙️ BACKEND REQUIREMENTS

### Endpoint 1: Unified AI Generation
```
POST /api/ai/generate

Request Body:
{
  "mode": "online" | "offline",
  "prompt": "string",
  "context": "string (optional - note content)",
  "noteId": "string (optional)",
  "model": "gemini" | "nvidia" | "gemma"
}

Response:
{
  "success": true,
  "response": "Generated text",
  "mode": "online" | "offline",
  "tokensUsed": 150,
  "timestamp": "2025-04-23T10:30:00Z"
}

Error Response:
{
  "success": false,
  "error": "Ollama not running. Switch to Online mode.",
  "fallbackMode": "online"
}
```

### Endpoint 2: Ollama Health Check
```
GET /api/ollama/health

Response (if running):
{
  "status": "connected",
  "model": "gemma:2b",
  "isRunning": true
}

Response (if not running):
{
  "status": "disconnected",
  "error": "Ollama not accessible at localhost:11434"
}
```

### Endpoint 3: Mode Configuration
```
GET /api/config/mode
POST /api/config/mode

GET Response:
{
  "currentMode": "online" | "offline",
  "availableModes": ["online", "offline"],
  "ollamaStatus": "connected" | "disconnected"
}

POST Request:
{
  "mode": "online" | "offline"
}
```

---

## 🔌 API INTEGRATIONS

### Online Mode
```
Provider 1: Gemini API
- Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
- Key: process.env.GEMINI_API_KEY
- Model: gemini-1.5-flash
- Max tokens: 8000

Provider 2: NVIDIA API (Alternative)
- Endpoint: https://integrate.api.nvidia.com/v1/chat/completions
- Key: process.env.NVIDIA_API_KEY
- Model: meta/llama-2-70b-chat
```

### Offline Mode
```
Provider: Ollama
- Endpoint: http://localhost:11434
- Model: gemma:2b
- Max tokens: 2048
- Timeout: 30 seconds
```

---

## 🚀 FEATURES TO IMPLEMENT

### Feature 1: AI Chat
```
Location: /features/AIChat.jsx

Requirements:
- RAG-style prompt: "Answer ONLY from the following notes:\n{notes}\n\nQuestion: {question}"
- Read current mode before making request
- Display response with citations (if available)
- Show "Loading..." with spinner
- Show error message if both modes fail

Test Cases:
1. Online mode → Ask question → Get response
2. Offline mode → Same question → Get response
3. Compare response quality
4. Test with empty notes
5. Test with missing noteId
6. Test timeout handling
7. Test when Ollama is not running
```

### Feature 2: Quiz Generator
```
Location: /features/QuizGenerator.jsx

Requirements:
- Generate 5 MCQs from note content
- Format: 
  {
    "questions": [
      {
        "id": 1,
        "question": "What is...?",
        "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
        "correctAnswer": 2,
        "explanation": "..."
      }
    ]
  }
- Prompt: "Generate 5 multiple choice questions from these notes: {notes}"
- Read current mode
- Display quiz with interactive options
- Show correct answer on submission

Test Cases:
1. Generate quiz in online mode
2. Generate quiz in offline mode
3. Verify JSON structure is valid
4. Check all 4 options are present
5. Verify correct answer is valid index
6. Test with short notes
7. Test with long notes
```

### Feature 3: Note Summarization
```
Location: /features/NoteSummarizer.jsx

Requirements:
- Prompt: "Create a structured cheat sheet summary:\n- Key concepts\n- Important definitions\n- Key formulas\n- Practice tips\n\nNotes:\n{notes}"
- Output format (structured, not raw):
  # Key Concepts
  - Concept 1
  - Concept 2
  
  # Important Definitions
  - Definition 1
  
  # Key Formulas
  - Formula 1
  
  # Practice Tips
  - Tip 1
  
- Read current mode
- Display with markdown formatting
- Allow copy-to-clipboard

Test Cases:
1. Summarize in online mode
2. Summarize in offline mode
3. Verify markdown structure
4. Check no raw copy-paste from input
5. Verify all sections present
6. Test with technical content
7. Test with large content
```

### Feature 4: Concept Map
```
Location: /features/ConceptMap.jsx

Requirements:
- Prompt: "Create a hierarchical concept breakdown of these notes. Format as nested JSON:\n{\n  \"topic\": \"...\",\n  \"children\": [...]\n}\n\nNotes:\n{notes}"
- Output format:
  {
    "topic": "Main Topic",
    "definition": "...",
    "children": [
      {
        "topic": "Subtopic 1",
        "definition": "...",
        "children": [...]
      }
    ]
  }
- Read current mode
- Display as interactive tree diagram
- Click to expand/collapse

Test Cases:
1. Generate map in online mode
2. Generate map in offline mode
3. Verify JSON structure
4. Check nesting is logical
5. Verify no circular references
6. Test with different subject matters
7. Test rendering with deep nesting
```

---

## 📄 PDF TEXT EXTRACTION FIX

### Problem
```
Current: Raw, unclean text with encoding issues
Issues:
- Special characters appearing as garbage
- Multiple spaces/newlines
- Broken encoding (UTF-8 problems)
- Lost paragraph structure
```

### Solution
```js
function cleanPDFText(rawText) {
  return rawText
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    
    // Fix common encoding issues
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€"/g, '—')
    .replace(/â€˜/g, "'")
    
    // Normalize whitespace
    .replace(/[ \t]+/g, ' ')           // Multiple spaces to single
    .replace(/\n\s*\n/g, '\n\n')       // Preserve paragraph breaks
    .replace(/([.!?])\s+/g, '$1 ')     // Fix spacing after punctuation
    
    // Trim
    .trim()
    
  return cleanedText
}
```

### Testing
```
Input: "Theâ€˜s  a  problem  with  spaces"
Output: "There's a problem with spaces"

Input: "Line1\n\n\n\nLine2"
Output: "Line1\n\nLine2"
```

---

## 🧪 COMPREHENSIVE TESTING PLAN

### Test Suite 1: Mode Toggle
```
Test 1.1: Toggle persistence
- Step 1: Click toggle to "Offline"
- Step 2: Refresh page
- Expected: Mode remains "Offline"
- Result: ____

Test 1.2: State update
- Step 1: Toggle to "Online"
- Step 2: Open DevTools → Check localStorage
- Expected: localStorage.aiMode = "online"
- Result: ____

Test 1.3: UI feedback
- Step 1: Toggle mode
- Expected: Badge color changes, indicator updates
- Result: ____
```

### Test Suite 2: AI Chat
```
Test 2.1: Online chat
- Setup: Add note with content "React is a JavaScript library"
- Action: Chat → Ask "What is React?"
- Expected: Response mentions JavaScript library
- Result: ____
- Response time: ____ ms

Test 2.2: Offline chat
- Setup: Same note
- Action: Toggle to Offline → Ask same question
- Expected: Response present (may differ from online)
- Result: ____
- Response time: ____ ms

Test 2.3: Chat with empty context
- Action: Ask question without selecting note
- Expected: Error message or graceful handling
- Result: ____

Test 2.4: Ollama failure handling
- Setup: Stop Ollama service
- Action: Toggle to Offline → Ask question
- Expected: Error: "Ollama not running. Use Online mode"
- Result: ____

Test 2.5: API timeout
- Setup: Slow network simulation
- Action: Ask question in Online mode
- Expected: Timeout after 30s, show error
- Result: ____
```

### Test Suite 3: Quiz Generator
```
Test 3.1: Online quiz generation
- Setup: Add math notes
- Action: Click "Generate Quiz" (Online mode)
- Expected: 5 MCQs with 4 options each
- Result: ____
- Structure valid: YES / NO

Test 3.2: Offline quiz generation
- Setup: Same notes
- Action: Toggle to Offline → Generate Quiz
- Expected: 5 MCQs generated
- Result: ____

Test 3.3: Quiz structure validation
- Check: All 5 questions present
- Check: Each has 4 options
- Check: Correct answer is valid index (0-3)
- Result: ____

Test 3.4: Quiz interactivity
- Action: Click option → Submit
- Expected: Show correct/incorrect feedback
- Result: ____
```

### Test Suite 4: Summarization
```
Test 4.1: Online summarization
- Setup: Add detailed notes
- Action: Click "Summarize" (Online mode)
- Expected: Structured summary with sections
- Result: ____

Test 4.2: Offline summarization
- Setup: Same notes
- Action: Toggle to Offline → Summarize
- Expected: Summary generated
- Result: ____

Test 4.3: Structure validation
- Check: Markdown formatting present
- Check: Sections (Key Concepts, Definitions, etc.)
- Check: No raw copy-paste from input
- Result: ____

Test 4.4: Copy functionality
- Action: Click "Copy to Clipboard"
- Expected: Summary copied, toast notification
- Result: ____
```

### Test Suite 5: Concept Map
```
Test 5.1: Online concept map
- Setup: Add biology notes
- Action: Click "Concept Map" (Online mode)
- Expected: Hierarchical tree generated
- Result: ____

Test 5.2: Offline concept map
- Setup: Same notes
- Action: Toggle to Offline → Concept Map
- Expected: Tree generated
- Result: ____

Test 5.3: Map structure
- Check: Valid JSON
- Check: Logical hierarchy
- Check: No circular references
- Result: ____

Test 5.4: Interactivity
- Action: Click node to expand/collapse
- Expected: Children toggle visibility
- Result: ____
```

### Test Suite 6: PDF Processing
```
Test 6.1: Encoding fix
- Input: PDF with special characters
- Expected: Text cleaned, no garbage
- Result: ____

Test 6.2: Whitespace normalization
- Input: PDF with irregular spacing
- Expected: Single spaces, preserved paragraphs
- Result: ____

Test 6.3: AI-ready output
- Input: Extracted PDF text
- Action: Use in chat
- Expected: AI understands content correctly
- Result: ____
```

### Test Suite 7: Error Handling
```
Test 7.1: Missing API key
- Action: Remove GEMINI_API_KEY env var
- Expected: Clear error message
- Result: ____

Test 7.2: Network failure
- Action: Disconnect internet (Online mode)
- Expected: Fallback to Offline OR show error
- Result: ____

Test 7.3: Invalid noteId
- Action: Request with non-existent noteId
- Expected: Error: "Note not found"
- Result: ____

Test 7.4: Ollama timeout
- Setup: Slow Ollama response
- Action: Request in Offline mode
- Expected: Timeout after 30s, error shown
- Result: ____
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Architecture
- [ ] Create `/services/aiService.js` (wrapper)
- [ ] Create `/services/ollamaService.js`
- [ ] Create `/context/AIContext.js` (or Zustand store)
- [ ] Create `/components/AIModeToggle.jsx`
- [ ] Create `/components/ModeIndicator.jsx`
- [ ] Setup localStorage persistence

### Phase 2: Backend
- [ ] Create POST `/api/ai/generate`
- [ ] Create GET `/api/ollama/health`
- [ ] Create GET/POST `/api/config/mode`
- [ ] Implement fallback logic
- [ ] Add error handling & logging

### Phase 3: Features
- [ ] Build `/features/AIChat.jsx`
- [ ] Build `/features/QuizGenerator.jsx`
- [ ] Build `/features/NoteSummarizer.jsx`
- [ ] Build `/features/ConceptMap.jsx`

### Phase 4: Quality
- [ ] Fix PDF text extraction
- [ ] Run all test suites
- [ ] Fix console errors
- [ ] Performance optimization

### Phase 5: Validation
- [ ] Final test run (all features, both modes)
- [ ] User acceptance testing
- [ ] Generate validation report
- [ ] Create deployment guide

---

## 🚨 CRITICAL SUCCESS CRITERIA

```
✅ MUST HAVE:
1. Mode toggle works and persists
2. All 4 features work in BOTH modes
3. NO console errors or warnings
4. Fallback logic prevents crashes
5. User-friendly error messages
6. PDF text extraction is clean
7. All tests pass
8. Zero skipped or incomplete features

❌ NOT ALLOWED:
- Hardcoded API calls
- Mock/fake responses
- Skipped features
- Unresolved errors
- Incomplete testing
- No error handling
- Poor user experience
```

---

## 📊 VALIDATION REPORT TEMPLATE

```
# NoteVault Hybrid AI System - Final Validation Report

## Summary
- Status: ✅ PRODUCTION READY / ⚠️ NEEDS FIXES
- Total Features: 4
- Features Working: __ / 4
- Test Coverage: __ %

## Feature Status
- [ ] AI Chat (Online: ✅ / Offline: ✅)
- [ ] Quiz Generator (Online: ✅ / Offline: ✅)
- [ ] Summarization (Online: ✅ / Offline: ✅)
- [ ] Concept Map (Online: ✅ / Offline: ✅)

## Issues Found & Fixed
1. Issue: ____
   Fix: ____
   Status: ✅ RESOLVED

## Test Results
- Mode Toggle: ✅ PASS
- Online APIs: ✅ PASS
- Ollama Integration: ✅ PASS
- Error Handling: ✅ PASS
- PDF Processing: ✅ PASS

## Performance Metrics
- Avg Response Time (Online): ____ ms
- Avg Response Time (Offline): ____ ms
- API Error Rate: ____ %

## Deployment Ready
Status: ✅ YES / ⚠️ PENDING

Sign-off: Antigravity Agent
Date: ____
```

---

## 🎯 FINAL INSTRUCTIONS TO ANTIGRAVITY

1. **Start Fresh**: Create all files in `/home/claude` with clear structure
2. **Test Aggressively**: Don't move to next feature until current is 100% working
3. **Log Everything**: Document all test results, issues, and fixes
4. **No Shortcuts**: Implement real functionality, not mocks
5. **Report Thoroughly**: Provide complete validation report at the end
6. **Fix Completely**: Leave system in production-ready state

**Your success metric**: All 4 features working perfectly in both modes with zero errors.

Good luck! 🚀
