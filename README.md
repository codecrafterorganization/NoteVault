# NoteVault 🧠

**NoteVault** is an intelligent, AI-powered study companion and workspace designed to transform raw notes into interactive, adaptive learning experiences. Built with a premium "Neural Vault Dark" glassmorphism aesthetic, it leverages the power of Google's Gemini LLM to generate custom exams, evaluate complex answers, and synthesize multiple knowledge sources into cohesive study guides.

---

## 🚀 Key Features

*   **Intelligent Test Mode:** 
    *   Dynamic generation of assessments (MCQs, Short Answers, Long Answers) based directly on the user's uploaded notes.
    *   **Three Difficulty Tiers:** Beginner, Intermediate, and Advanced (featuring a strict 60-minute countdown timer with visual alerts).
    *   **Smart Evaluation:** Uses the Gemini AI to grade subjective, long-form written answers, providing a score out of 100, specific feedback, and actionable improvement tips.
*   **Handwritten Answer Support (OCR):** Students can write their answers on paper, upload a photo, and NoteVault uses `tesseract.js` to extract the text and submit it for AI evaluation.
*   **Performance Analytics:** A comprehensive dashboard tracking test history, MCQ accuracy vs. Written average, and dynamic score progression without relying on dummy data.
*   **Group Brain (Knowledge Fusion):** Select multiple notes from different subjects and use AI to synthesize them into a single, comprehensive Master Study Guide.
*   **Offline AI Mode (Ollama):** Users can run a local model (`gemma:2b`) securely on their device to interact with notes with zero internet dependency and maximum privacy.
*   **Premium UI/UX:** A highly polished, distraction-free environment utilizing Tailwind CSS, custom scrollbars, and fluid animations.

---

## 🛠️ Technology Stack & Dependencies

NoteVault is built using a modern JavaScript/TypeScript full-stack architecture.

### **Frontend (Client)**
*   **Framework:** React 18 (via Vite for lightning-fast HMR and building)
*   **Routing:** React Router v6 (`react-router-dom`)
*   **Styling:** Tailwind CSS (configured with custom "Neural Vault" design tokens)
*   **Icons:** `lucide-react` for clean, consistent iconography
*   **Animations:** GSAP (GreenSock Animation Platform) for smooth, premium micro-interactions.

### **Backend (Server)**
*   **Runtime:** Node.js
*   **Framework:** Express.js (RESTful API architecture)
*   **Database:** Supabase (PostgreSQL) for secure, scalable storage of user sessions, notes, and performance history.
*   **OCR Engine:** `tesseract.js` (Optical Character Recognition) for processing image uploads into text.
*   **File Handling:** `multer` for handling multipart/form-data (image uploads).
*   **CORS & Environment:** `cors`, `dotenv` for configuration management.

---

## 🧠 LLM Architecture: Dual-Engine AI (Gemini + Groq)

NoteVault employs a robust, highly resilient **Dual-Engine AI architecture** combining Google's Gemini and Groq's ultra-fast LLaMA inference to ensure 100% uptime, zero rate-limit blocks, and instantaneous processing.

### 1. Primary Engine: Google Gemini 2.0
The core "brain" uses **Google Gemini 2.0 Flash** (with fallback to `gemini-2.0-flash-lite`) via the `@google/generative-ai` SDK. It excels at complex, high-context reasoning tasks like Knowledge Fusion and deep answer analysis.

### 2. High-Speed Inference & Fallback: Groq (LLaMA 3.3 70B)
NoteVault integrates **Groq** to harness LLaMA 3.3 70B for tasks requiring ultra-low latency. 
*   **Test Generation Engine:** The `testService` utilizes Groq's API to instantly generate structured MCQs and written questions.
*   **Intelligent Failover:** If the Gemini API hits a rate limit or goes down, NoteVault seamlessly fails over to Groq (`llama-3.3-70b-versatile`) so the user experiences zero interruption.

### How the AI powers NoteVault:
1.  **Instant Test Generation (`/api/test/generate`):**
    *   Powered primarily by **Groq**. The raw text of a user's note is processed instantly, returning highly structured JSON containing MCQs, short answer questions, and analytical long-answer questions.
2.  **LLM-as-a-Judge Evaluation (`/api/test/submit`):**
    *   When a user submits subjective written answers, traditional regex grading fails. The AI acts as an **LLM-as-a-Judge**, evaluating the answer against the original note's context, assigning a score (0-100), providing constructive feedback, and generating specific improvement tips.
3.  **Note Synthesis / Group Brain:**
    *   **Gemini 2.0** consumes multiple disparate notes and organizes their overlapping concepts into a structured, unified Master Study Guide.

*(Note: The server requires valid `GEMINI_API_KEY` and `GROQ_API_KEY` variables in the `.env` file for the dual-engine system to function correctly).*

---

## 📂 Project Architecture

```text
notevault-main/
├── frontend/                # React Vite Application
│   ├── src/
│   │   ├── components/      # Reusable UI elements (Background, Modals)
│   │   ├── pages/           # Route views (Dashboard, TestMode, Performance)
│   │   ├── index.css        # Global Tailwind configurations & glassmorphism
│   │   └── App.jsx          # Route definitions
│   └── package.json
└── backend/                 # Node/Express Server
    ├── src/
    │   ├── routes/          # API endpoints (test.js, notes.js, etc.)
    │   ├── services/        # Business logic (Gemini API interactions, OCR)
    │   └── index.js         # Server entry point
    └── package.json
```

## ⚙️ Running Locally

1. **Clone and Install:**
   Navigate to both `frontend` and `backend` directories and run `npm install`.
2. **Environment Variables:**
   Create a `.env` file in the `backend` directory containing your Supabase credentials, `GEMINI_API_KEY`, and `GROQ_API_KEY`.
3. **Start Development Servers:**
   *   Frontend: `npm run dev` (usually runs on port 5173)
   *   Backend: `npm run dev` (runs on port 5000)
