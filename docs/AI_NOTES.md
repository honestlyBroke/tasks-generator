# AI Notes

## What AI Was Used For

- **Project scaffolding** — Claude Code (Opus 4.6) helped set up the React + Vite project structure and NES.css integration
- **Template generation logic** — AI assisted in writing the task template engine (`taskTemplates.js`) including the user story/task/risk templates for each project type
- **Component structure** — AI helped create the initial component architecture (SpecForm, TaskList, ExportPanel, etc.)
- **Serverless API** — AI helped write the Vercel serverless function (`api/generate.js`) that proxies LLM calls
- **NES.css styling** — AI suggested appropriate NES.css class names and component patterns
- **Database layer** — AI helped set up Knex.js + SQLite with auto-migrations and CRUD functions
- **Docker setup** — AI assisted with multi-stage Dockerfile and docker-compose.yml
- **Deployment config** — AI helped configure nginx reverse proxy for VPS hosting

## What I Checked / Did Myself

- **Reviewed all generated code** — Read through every file to understand the logic and ensure correctness
- **Tested all features manually** — Form validation, spec generation (both template and LLM), editing, reordering, export, history
- **Adjusted templates** — Modified the pre-built templates to be realistic and useful for actual project planning
- **Fixed styling issues** — Tweaked responsive layout, font sizes, and NES.css component usage
- **Input validation logic** — Verified edge cases (empty inputs, short goals, missing optional fields)
- **API error handling** — Tested with invalid keys, malformed responses, and network failures
- **Model selection UX** — Chose which models to include and how to present the options
- **Database schema design** — Decided on table structure and what fields to persist
- **Docker testing** — Verified container builds and runs correctly
- **Deployment strategy** — Chose VPS + nginx + Certbot over Vercel-only approach

## LLM / Provider

- **Development tool:** Claude Code (Opus 4.6) by Anthropic — used as an AI-assisted coding tool via CLI
- **App runtime LLM:** OpenRouter (https://openrouter.ai) — a unified API gateway that routes to multiple LLM providers
  - **Default model:** Google Gemini 2.0 Flash — chosen for speed and free-tier availability
  - **Also available:** Gemini 2.5 Pro, Llama 3.3 8B, DeepSeek V3
  - **Local option:** Ollama (localhost:11434) for running models locally
- **Fallback:** Template-based generation (no LLM) — always available, instant, zero-cost

## Why OpenRouter

1. **Multi-model access** — one API key, many models (Gemini, Llama, DeepSeek, etc.)
2. **Free tier models** — several models available with no cost
3. **Simple API** — OpenAI-compatible chat completions format
4. **No vendor lock-in** — easy to switch models via dropdown
5. **Ollama support** — users can run models locally without any cloud dependency

## Architecture

```
Frontend (React/Vite) → Express API Server → OpenRouter API → LLM
                      → Template Engine (client-side fallback, no API needed)
                      → SQLite Database (persistent spec storage)
```

The API key is stored server-side (environment variable), never exposed to the browser.
Database is SQLite via Knex.js, stored in `data/tasks.db` (gitignored).
