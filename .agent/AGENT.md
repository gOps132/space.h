# Space.h Agent Contract

This file defines the repository-wide operating rules for human and agent contributors.

## Working Model

- The repository is a monorepo with `frontend/`, `backend/`, and `docs/`.
- The top-level `README.md` is intentionally stable and should only describe the project at a high level.
- Ongoing implementation notes, setup instructions, architecture decisions, and change-oriented documentation belong in `docs/`.
- Work happens on a single worktree, so contributors must keep changes small, explain transitions clearly, and commit in narrow slices.

## Commit Discipline

- Commit each meaningful milestone separately.
- Examples of milestone commits:
  - repository restructure
  - backend scaffold
  - schema introduction
  - security rules or CI updates
  - new feature slice
- Prefer commit messages that describe the repository state change, not just the tool used.
- Before each commit:
  - run the narrowest relevant tests first
  - run the broader verification pass required by the affected area
  - update docs when the change affects structure, workflows, or behavior

## CI Rules

- Every pull request and main branch push must run automated verification.
- Frontend CI must include:
  - dependency install
  - build
  - lint when available
  - tests when available
- Backend CI must include:
  - Java setup
  - Maven wrapper or Maven build
  - unit and integration test execution
  - packaging or compile verification
- CI must fail fast on:
  - compilation errors
  - failing tests
  - dependency vulnerability checks
  - secret scanning findings

## Security Baseline

- Never commit secrets, tokens, passwords, or private keys.
- Use `.env.example` or documented environment variable names for local setup.
- Keep `.env` and runtime secrets out of version control.
- Validate input at API boundaries.
- Enforce authorization in the backend, never only in the frontend.
- Prefer least-privilege defaults for containers, credentials, and service accounts.

## Continuous Security Audits

- Continuous security checks must run in CI on a recurring basis and on code changes when possible.
- Baseline recurring checks should include:
  - dependency vulnerability scan
  - secret scan
  - static analysis where available
- Security findings must be triaged like normal defects.
- High-severity findings block merge until fixed or explicitly documented with risk acceptance.

## Deep Security Audits

- In addition to lightweight continuous checks, the project should schedule an occasional large security review.
- This deeper review should use the strongest available reasoning model and focus on:
  - authentication and authorization gaps
  - insecure direct object references
  - injection risks
  - data exposure
  - container hardening
  - supply chain risk
  - unsafe dependency upgrades
- The output of deep audits belongs in `docs/security/` once that area exists.

## Documentation Rules

- Keep `README.md` as the stable front page only.
- Put living docs in `docs/`.
- Update docs whenever one of these changes:
  - repository structure
  - local setup steps
  - service boundaries
  - schema or domain model
  - CI or security policy

## Verification Expectations

- Do not claim a change is complete without fresh command evidence.
- Verify the touched surface area first, then the broader integration path if the change crosses module boundaries.
- Prefer simple, reproducible commands that can later be automated in CI.
