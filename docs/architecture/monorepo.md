# Monorepo Structure

## Layout

- `frontend/`
  - React application
  - UI state, routing, and browser-facing concerns
- `backend/`
  - plain PHP application served by Apache
  - API gateway, MySQL persistence, and production-style Apache site host
- `docs/`
  - architecture notes
  - human-facing product, API, and domain documentation
- `.agents/`
  - local agent rules, workflow notes, CI policy, security audit policy, and context

## Why This Shape

- It keeps frontend and backend dependencies isolated.
- It gives the root a clear operational role instead of becoming a second application.
- It makes CI easier to split by workspace.
- It supports small, auditable commits while the product is still evolving quickly.
