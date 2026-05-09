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
  - setup guides
  - domain and process documentation
- `.agent/`
  - repository rules for agentic workflows, CI, and security audits

## Why This Shape

- It keeps frontend and backend dependencies isolated.
- It gives the root a clear operational role instead of becoming a second application.
- It makes CI easier to split by workspace.
- It supports small, auditable commits while the product is still evolving quickly.
