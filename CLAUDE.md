# Job Matcher — CLAUDE.md

## Contexte du projet
App web qui recherche des offres d'emploi via l'API Adzuna et utilise l'API
Claude pour scorer/justifier la pertinence de chaque offre par rapport à un
profil utilisateur en texte libre.

Objectif : projet portfolio/apprentissage, réalisé en 7-10 jours.
Développeur expérimenté en Angular, débutant sur NestJS.

## Stack
- Frontend : Angular (standalone components, SCSS)
- Backend : NestJS
- Sources externes : API Adzuna (recherche d'offres), API Claude (matching/scoring)
- Pas de base de données en V1 (cache simple en mémoire si besoin)
- Pas d'authentification en V1

## Structure du repo
```
job-matcher/
├── backend/     (NestJS — voir backend/src/jobs/)
├── frontend/    (Angular)
└── README.md
```

## Commandes utiles
- Backend dev : `cd backend && npm run start:dev` (port 3000)
- Frontend dev : `cd frontend && ng serve` (port 4200)
- Tests backend : `cd backend && npm run test`
- Tests e2e (Playwright) : `cd e2e && npm install && npx playwright install chromium` (une fois), puis
  `npx playwright test` — démarre automatiquement backend + frontend (voir `webServer` dans
  `e2e/playwright.config.ts`), teste le parcours recherche → scoring IA contre les vraies API
  Adzuna/Claude configurées dans `backend/.env`
- Lint : `npm run lint` (à lancer après chaque modif de code backend)

## CI
- `.github/workflows/e2e.yml` : lance la suite e2e Playwright sur chaque push/PR vers `master`
  (runner Ubuntu, contre les vraies API). Nécessite les secrets repo GitHub `ADZUNA_APP_ID`,
  `ADZUNA_APP_KEY`, `ADZUNA_COUNTRY`, `ANTHROPIC_API_KEY` (Settings → Secrets and variables →
  Actions) — sans eux le job échoue sur les appels API

## Conventions de code
- TypeScript strict partout
- Services NestJS injectables avec interfaces typées pour les réponses Adzuna/Claude
- DTOs avec `class-validator` pour valider les entrées des controllers
- Jamais de clé API en dur dans le code — toujours via `@nestjs/config` / `.env`
- Un service = une responsabilité (ex: `adzuna.service.ts` ne fait QUE parler à
  Adzuna, `ai-matching.service.ts` ne fait QUE construire le prompt et appeler Claude)

## Règles importantes sur l'IA (Claude API)
- Le score de pertinence (0-10) et sa justification SONT le travail de Claude
  — c'est un jugement sémantique (profil vs offre), pas un calcul déterministe,
  donc pas question de le remplacer par des règles en dur
- En revanche, toute vraie opération numérique/mathématique exacte (moyenne de
  salaire, comptage, tri d'une liste selon un score déjà obtenu, pourcentages)
  reste faite en code, jamais "calculée" par le prompt — les LLM ne sont pas
  fiables sur de l'arithmétique précise
- Le prompt de matching doit toujours retourner du JSON structuré strict
  (score + justification), jamais du texte libre à parser
- Toujours prévoir un fallback propre si l'appel à l'API Claude échoue ou
  timeout (l'app ne doit pas planter, afficher les offres sans score plutôt)
- Ne jamais envoyer plus d'une dizaine d'offres par appel (limiter le volume
  de tokens)

## Sécurité
- `.env` dans `.gitignore`, jamais commité
- Clés Adzuna et Claude uniquement lues côté backend, jamais exposées au frontend
- Ne jamais afficher/logger une clé API, même en debug

## Où j'en suis / TODO
- [x] Setup initial backend (NestJS, structure `backend/src/jobs/`, config, lint, tests)
- [x] Setup initial frontend (Angular 22 standalone, SCSS, `frontend/src/app/`)
- [x] Service Adzuna (recherche par mot-clé + localisation) — `backend/src/jobs/adzuna.service.ts`
- [x] Endpoint GET /jobs/search — testé contre l'API Adzuna réelle (params `what`/`where`), OK
- [x] Frontend : formulaire de recherche + affichage liste brute — `frontend/src/app/job-search/`, service `frontend/src/app/core/services/jobs.service.ts`
- [x] Service ai-matching (prompt + appel Claude) — `backend/src/jobs/ai-matching.service.ts`, endpoint `POST /jobs/match`, testé de bout en bout (recherche Adzuna réelle → scoring Claude réel, scores cohérents)
- [x] Frontend : champ profil + affichage scores/justifications — inclus dans `job-search` (bouton "Analyser avec l'IA"), testé de bout en bout dans le navigateur
- [x] Tests e2e Playwright (`e2e/`) — parcours recherche + scoring IA, cas "aucune offre", bouton
  désactivé sans mot-clé ; tourne contre les vraies API (pas de mocks)
- [ ] Cache basique des résultats
- [ ] Gestion des erreurs / états de chargement UI — gestion basique déjà en place (spinners texte + messages d'erreur sur recherche/analyse), à revoir si besoin de plus fin
