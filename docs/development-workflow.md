# Development Workflow

## Repository Principles

- Keep the root focused on orchestration, policy, and discovery.
- Put application code in the owning workspace: `frontend/` or `backend/`.
- Treat `docs/` as living project memory.

## Commit Strategy

- Make narrow commits that each leave the repo in a coherent state.
- Typical sequence:
  - restructure
  - scaffold
  - schema
  - feature slice
  - validation and hardening

## Verification Strategy

- Run fast local verification before every commit.
- Prefer module-local commands before broader repo-wide checks.
- Promote repeatable verification commands into CI as soon as they stabilize.
