# Tasks Generator

A retro-styled (NES.css) mini planning tool. Describe a feature idea and get AI-generated user stories, engineering tasks, and a risk assessment. Supports multiple LLM providers or offline template-based generation.

**Live:** [https://tasks.yato.foo](https://tasks.yato.foo)

## What It Does

- **Fill a form** — describe your feature idea (goal, target users, constraints) and pick a project type
- **Choose a model** — use AI (Gemini, Llama, DeepSeek via OpenRouter, or Ollama locally) or instant templates
- **Generate specs** — get user stories, grouped engineering tasks, and risks
- **Edit, reorder, group** — inline-edit any task or story, reorder with arrows, toggle grouping by category
- **Export** — copy to clipboard or download as `.md` file
- **History** — specs saved in SQLite database + localStorage, click to reload
- **Status page** — real-time health check of frontend, backend, and LLM connection

### Generation Modes

| Mode | Provider | Speed | Quality | Cost |
|------|----------|-------|---------|------|
| **Gemini 2.0 Flash** ⭐ | OpenRouter | Fast | Excellent | Free tier |
| Gemini 2.5 Pro | OpenRouter | Medium | Best | Paid |
| DeepSeek Chat | OpenRouter | Fast | Very Good | Free |
| DeepSeek R1 | OpenRouter | Medium | Excellent | Free |
| Ollama: TinyLlama | Localhost | Depends | Basic* | Free |
| Template (No AI) | Client-side | Instant | Good | Free |

**Recommended:** Use **Gemini 2.0 Flash** for best balance of speed, quality, and cost.

\* **Ollama Note:** TinyLlama (1B params) is installed due to VPS RAM constraints. Output quality is basic and mainly for testing local LLM connectivity. For production-quality specs, use OpenRouter models (Gemini or DeepSeek). Larger Ollama models require 4-8GB+ RAM.

### Project Templates

| Template | Description |
|----------|-------------|
| Web App | Frontend + backend + auth + deployment tasks |
| Mobile App | React Native/Flutter + offline + push notifications |
| Internal Tool | Admin UI + RBAC + SSO + audit logging |
| API Service | REST design + rate limiting + docs + versioning |

## Tech Stack

- **React** (Vite) — frontend framework
- **NES.css** — retro 8-bit CSS framework
- **Node.js / Express** — API backend
- **SQLite** (via Knex.js + better-sqlite3) — persistent database
- **Vercel Serverless Functions** — cloud deployment backend
- **OpenRouter** — unified LLM gateway (Gemini, Llama, DeepSeek, etc.)
- **Ollama** — optional local LLM support
- **Docker** — containerized deployment

## Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and add your OpenRouter API key

# 3. Start both frontend and API
npm run dev        # Frontend on http://localhost:5173
npm run dev:api    # API on http://localhost:3001
```

Template mode works without an API key. LLM mode requires `OPENROUTER_API_KEY` in `.env`.

## Build for Production

```bash
npm run build
```

Output in `dist/`.

## Deployment Options

### Option 1: VPS with Docker (Recommended)

**Full features:** Database persistence, Ollama support, complete control.

```bash
# Build the image
docker build -t tasks-generator .

# Run the container
docker run -p 3001:3001 -e OPENROUTER_API_KEY=your-key-here -v tasks-data:/app/data tasks-generator
```

Open http://localhost:3001. The `-v tasks-data:/app/data` flag persists the SQLite database across container restarts.

**For production VPS deployment with domain + SSL:** See [DEPLOYMENT.md](DEPLOYMENT.md)

### Option 2: Vercel (Serverless)

**Limitations:** No database persistence (serverless filesystem is ephemeral), specs stored in browser localStorage only.

```bash
vercel
```

Or connect the GitHub repo to Vercel. Set `OPENROUTER_API_KEY` in Vercel's environment variables dashboard.

⚠️ **Note:** SQLite database won't persist on Vercel serverless. For full database support, use VPS/Docker deployment.

### Deployment Comparison

| Feature | VPS + Docker | Vercel Serverless |
|---------|--------------|-------------------|
| Database Persistence | ✅ SQLite on disk | ❌ Only localStorage |
| Ollama Support | ✅ Yes | ❌ No (local only) |
| Custom Domain | ✅ Your domain + nginx | ✅ Vercel domain |
| SSL/HTTPS | ✅ Let's Encrypt | ✅ Auto SSL |
| Cost | VPS hosting fee | Free tier available |
| Setup Complexity | Medium | Easy |
| Best For | Production use | Quick demos |

## What Is Done

- [x] Feature idea form with goal, users, constraints, and project type selector
- [x] AI-powered generation via OpenRouter (multiple models)
- [x] Template-based fallback generation (no API needed)
- [x] Model selector UI (Gemini, Llama, DeepSeek, Ollama, Template)
- [x] 4 project templates: Web App, Mobile App, Internal Tool, API Service
- [x] Inline editing of all stories, tasks, and risks
- [x] Reorder tasks with up/down arrows
- [x] Group tasks by category (Frontend, Backend, Testing, DevOps, etc.)
- [x] Priority badges (HIGH / MED / LOW) on every item
- [x] Export as Markdown (copy to clipboard or download .md file)
- [x] SQLite database for persistent spec storage (Knex.js + better-sqlite3)
- [x] Spec history from database + localStorage
- [x] Risk/Unknowns section with editable risks and mitigations
- [x] Home page with clear step-by-step instructions
- [x] Status page showing health of frontend, backend, and LLM connection
- [x] Input validation with error messages
- [x] Loading states and error handling for API calls
- [x] Responsive design (mobile + desktop)
- [x] NES.css retro 8-bit theme
- [x] .env.example file
- [x] Vercel serverless API (no API keys exposed to browser)
- [x] Basic test suite for validation and parsing
- [x] Input sanitization for security
- [x] CORS protection for production
- [x] Ollama local LLM support
- [x] Clean project structure (docs/, server/, scripts/)

## Security & Best Practices

- **Input sanitization**: All user inputs are truncated (goal: 1000 chars, users/constraints: 500 chars) to prevent token overflow and cost issues
- **CORS protection**: Set `ALLOWED_ORIGIN` environment variable in production to restrict API access to your frontend domain
- **Error logging**: JSON parsing failures are logged for debugging while maintaining user-friendly error messages
- **No secrets in code**: API keys must be set via environment variables (`.env` file or platform settings)

## Testing

Run basic validation tests:

```bash
npm test
```

Tests cover input validation, JSON parsing, and template validation.

## Project Structure

```
├── server/
│   ├── api/
│   │   ├── generate.js          # LLM generation endpoint
│   │   ├── health.js            # Health check endpoint
│   │   ├── specs.js             # Spec CRUD endpoint
│   │   └── generate.test.js     # Basic validation tests
│   ├── database.js              # Database migrations & CRUD
│   ├── db.js                    # Knex configuration
│   └── server.js                # Express API server
├── docs/
│   ├── ABOUTME.md               # Developer context
│   ├── AI_NOTES.md              # AI tool usage notes
│   ├── DEPLOYMENT.md            # VPS deployment guide
│   ├── OLLAMA_SETUP.md          # Ollama installation guide
│   └── PROMPTS_USED.md          # Development prompts log
├── scripts/
│   └── test-models.js           # Model testing script
├── src/
│   ├── App.jsx                  # Main app with page navigation
│   ├── components/
│   │   ├── HomePage.jsx         # Landing page with instructions
│   │   ├── SpecForm.jsx         # Form + model selector
│   │   ├── TaskList.jsx         # User stories + tasks (edit, reorder, group)
│   │   ├── ExportPanel.jsx      # Copy/download as markdown
│   │   ├── RiskSection.jsx      # Risks & mitigations
│   │   ├── HistoryPanel.jsx     # Spec history (DB + localStorage)
│   │   └── StatusPage.jsx       # System health status
│   ├── hooks/
│   │   └── useLocalStorage.js   # localStorage React hook
│   ├── utils/
│   │   └── taskTemplates.js     # Template engine + markdown export
│   └── index.css                # NES.css + custom styles
├── db.js                        # Knex.js database connection
├── database.js                  # Database migrations + CRUD
├── server.js                    # Express API server (dev + Docker)
├── data/                        # SQLite database (gitignored)
├── Dockerfile                   # Docker container setup
├── index.html
├── vercel.json
├── .env.example
├── ABOUTME.md
├── AI_NOTES.md
├── PROMPTS_USED.md
└── README.md
```
