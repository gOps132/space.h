# CI and Security Automation

This repository uses GitHub Actions for delivery confidence and baseline security checks.

## Workflows

### `ci.yml`

Purpose:

- verify the frontend still builds
- verify the PHP backend still lints and passes tests

Current jobs:

- `Frontend Build`
  - installs `frontend/` dependencies
  - runs the production build
- `Backend PHP Test`
  - sets up PHP 8.3 with `pdo_mysql`
  - lints every PHP file with `php -l`
  - runs `php tests/run.php`

### `security.yml`

Purpose:

- run lightweight recurring security checks on code changes and on schedule

Current jobs:

- `Secret Scan`
  - scans repository history and contents for leaked credentials
- `Dependency Vulnerability Scan`
  - scans manifests and lockfiles for known vulnerable packages
- `Frontend npm audit`
  - checks the frontend dependency tree for high-severity advisories

### `codeql.yml`

Purpose:

- run GitHub's deeper static analysis for both frontend and backend code

Current languages:

- JavaScript / TypeScript
- PHP

## Why Split CI and Security

Build confidence and security confidence are related but not identical.

- `CI` tells us whether the project still works
- `Security` tells us whether new risk may have been introduced

Keeping them separate makes failures easier to triage.
