# Job Matcher

![E2E Tests](https://github.com/Luluqz/job-matcher/actions/workflows/e2e.yml/badge.svg)

Searches for job offers via the [Adzuna](https://developer.adzuna.com/) API and has them scored by
the [Claude](https://console.anthropic.com/) API (Anthropic) against a free-text candidate
profile — each offer gets a relevance score out of 10 and a one-sentence justification.

Portfolio / learning project: experienced Angular developer, first time using NestJS.

## Stack

| | |
|---|---|
| Frontend | Angular 22 (standalone components), Angular Material 3, SCSS |
| Backend | NestJS 11, TypeScript strict |
| External APIs | Adzuna (job search), Anthropic Claude Haiku 4.5 (scoring) |
| Tests | Jest (backend/frontend unit tests), Playwright (e2e) |
| CI | GitHub Actions |
| Database | None — no auth, simple in-memory cache |

## Repo structure

```
job-matcher/
├── backend/                     NestJS
│   └── src/jobs/
│       ├── adzuna.service.ts        # calls the Adzuna API, one service = one responsibility
│       ├── ai-matching.service.ts   # builds the prompt, calls Claude, parses structured JSON
│       ├── cache.service.ts         # in-memory cache (Map + TTL)
│       └── jobs.controller.ts       # GET /jobs/search, POST /jobs/match
├── frontend/                    Angular
│   └── src/app/
│       ├── job-search/              # search form + results display
│       └── core/                    # HTTP services, config, models
├── e2e/                          Playwright end-to-end tests
└── .github/workflows/e2e.yml    CI
```

## Prerequisites

- Node.js 22+
- An Adzuna key (App ID + App Key) — [developer.adzuna.com](https://developer.adzuna.com/)
- An Anthropic API key — [console.anthropic.com](https://console.anthropic.com/)

## Installation

### Backend

```bash
cd backend
npm install
cp .env.example .env
# fill in ADZUNA_APP_ID, ADZUNA_APP_KEY, ANTHROPIC_API_KEY in .env
npm run start:dev
```

The backend listens on `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
npm run start
```

Open `http://localhost:4200` in the browser.

## Environment variables (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | NestJS server port | `3000` |
| `ADZUNA_APP_ID` | Adzuna application ID | — |
| `ADZUNA_APP_KEY` | Adzuna application key | — |
| `ADZUNA_COUNTRY` | Country code for the Adzuna API (e.g. `fr`) | `fr` |
| `ANTHROPIC_API_KEY` | Anthropic API key (Claude) | — |

`.env` is gitignored — see `backend/.env.example` for the template. Without
`ANTHROPIC_API_KEY`, the app still works: offers are displayed without a score (fallback).

## Tests

```bash
# Backend (unit)
cd backend && npm run test

# Frontend (unit)
cd frontend && npx ng test

# End-to-end (Playwright, against the real Adzuna/Claude APIs)
cd e2e
npm install
npx playwright install chromium   # one-time
npx playwright test
```

`e2e/playwright.config.ts` automatically starts the backend and frontend if they aren't already
running (`webServer`), so `npx playwright test` alone is enough after installation.

## CI

`.github/workflows/e2e.yml` runs the e2e suite on every push and pull request to `master`.
Requires the GitHub repo secrets `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `ADZUNA_COUNTRY` and
`ANTHROPIC_API_KEY` (*Settings → Secrets and variables → Actions*), otherwise the job fails on the
API calls. The workflow can also be triggered manually from the *Actions* tab
(`workflow_dispatch`).


