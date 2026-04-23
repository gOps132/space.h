# CI and Security Automation

This repository uses GitHub Actions for both delivery confidence and baseline security checks.

## Workflows

### `ci.yml`

Purpose:

- verify the frontend still builds
- verify the backend test suite still passes

Current jobs:

- `Frontend Build`
  - installs `frontend/` dependencies
  - runs the production build
- `Backend Test`
  - sets up Java 17
  - runs `mvn test` inside `backend/`

### `security.yml`

Purpose:

- run lightweight recurring security checks on code changes and on schedule

Current jobs:

- `Secret Scan`
  - scans the repository history and contents for leaked credentials
- `Dependency Vulnerability Scan`
  - scans manifests and lockfiles for known vulnerable packages
- `Frontend npm audit`
  - checks the frontend dependency tree for high-severity advisories

### `codeql.yml`

Purpose:

- run GitHub's deeper static analysis for both the frontend and backend codebases

This is the best fit for the "continuous security audits plus occasional larger review" direction right now because it provides scheduled, language-aware analysis for:

- Java / Spring Boot
- JavaScript / TypeScript

## Why Split CI and Security

Build confidence and security confidence are related but not identical.

- `CI` tells us whether the project still works
- `Security` tells us whether new risk may have been introduced

Keeping them separate makes failures easier to understand and triage.
