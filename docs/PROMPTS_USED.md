# Prompts Used During Development

Records of prompts used with Claude Code (Opus 4.6) during app development. Responses and API keys are excluded.

---

## 1. Initial Project Setup

**Prompt:** Read the assignment requirements, job description, and personality profile, then plan a Tasks Generator web app using NES.css.

**Purpose:** Get an initial project plan and architecture based on the assignment constraints.

---

## 2. Tech Stack Decision

**Prompt:** Which tech stack should we use — React + Node.js, Next.js, or Vanilla HTML + Python?

**Purpose:** Decided on React (Vite) for the frontend based on the job description's tech stack requirements.

---

## 3. Template Engine Design

**Prompt:** Build a template-based task generator that creates user stories, engineering tasks, and risks for Web App, Mobile App, Internal Tool, and API Service project types. No AI API needed — use pre-built templates with string interpolation.

**Purpose:** Core generation logic without requiring LLM API keys.

---

## 4. Component Architecture

**Prompt:** Create React components for: SpecForm (form with goal/users/constraints/template), TaskList (edit/reorder/group tasks), ExportPanel (copy/download markdown), HistoryPanel (last 5 specs), RiskSection (editable risks).

**Purpose:** Build all the UI components required by the assignment.

---

## 5. NES.css Integration

**Prompt:** Style the app using NES.css — use nes-container, nes-btn, nes-textarea, nes-input, nes-select, nes-badge, nes-progress classes.

**Purpose:** Apply the retro 8-bit theme using NES.css components.

---

## 6. Input Validation

**Prompt:** Add basic validation — goal field required with minimum 10 characters, error messages shown inline, disabled button when invalid.

**Purpose:** Handle empty/wrong input as required by the assignment.

---

## 7. Home Page and Status Page

**Prompt:** Add a home page with clear step-by-step instructions and a status page showing health of frontend, localStorage, backend, database, and LLM connection.

**Purpose:** Assignment requirement for a home page with clear steps and a status page.

---

## 8. Documentation

**Prompt:** Create README.md, AI_NOTES.md, ABOUTME.md, and PROMPTS_USED.md as required by the assignment.

**Purpose:** Assignment documentation requirements.

---

## 9. Vercel Deployment Config

**Prompt:** Add vercel.json and .env.example for deployment.

**Purpose:** Hosting setup as required by the assignment.

---

## 10. Database Integration

**Prompt:** Add a proper SQLite database using Knex.js (like my miscrit_companion project) to persist generated specs instead of just localStorage.

**Purpose:** Proper database layer as required — saves all generated specs with full CRUD operations.

---

## 11. Docker Setup

**Prompt:** Create a multi-stage Dockerfile and docker-compose.yml so the app runs with one command. Reference my existing project's Dockerfile pattern.

**Purpose:** Assignment requires Docker support for hosting alternative.

---

## 12. VPS Deployment

**Prompt:** Set up nginx reverse proxy config and deployment steps for hosting on a VPS with a custom domain (yato.foo).

**Purpose:** Get the app live with HTTPS on a custom domain.

---

## 13. Code Review Feedback (Gemini 3 Pro)

**Feedback Received:** Gemini 3 Pro provided detailed code review highlighting security risks, input validation issues, and missing tests.

**Key Issues:**
- CORS wildcard (`*`) allows anyone to drain API credits
- No input length limits (potential token overflow & cost issues)
- Missing test coverage
- Import statements not organized
- JSON parse errors swallowed with HTTP 200 status

---

## 14. Security Improvements

**Prompt:** Fix CORS to restrict origin in production, add input sanitization to prevent token overflow, move all imports to top of files, and improve error logging.

**Changes Made:**
- Added `ALLOWED_ORIGIN` environment variable for production CORS
- Truncated inputs: goal (1000 chars), users/constraints (500 chars)
- Moved `fs` import to top in server.js
- Added detailed logging for JSON parsing failures

---

## 15. Test Suite Addition

**Prompt:** Add basic tests for input validation, JSON parsing, and template validation using Node's built-in test runner.

**Purpose:** Assignment requires "basic checks and testing" — added test file with 6 passing tests.

---

## 16. Project Reorganization

**Prompt:** Reorganize project structure - move documentation to docs/, backend code to server/, test scripts to scripts/.

**Purpose:** Clean up root directory clutter for better maintainability.

---

## 17. Ollama Integration

**Prompt:** Deploy Ollama on VPS for local LLM support, configure Docker networking, and update health checks.

**Purpose:** Add local LLM option (TinyLlama) alongside OpenRouter API models.
