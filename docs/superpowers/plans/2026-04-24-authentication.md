# Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add university ID + password authentication backed by Spring Security and JWT tokens.

**Architecture:** Authentication will use `app_user` records as the identity source, `UserDetailsService` for Spring Security integration, and a stateless JWT filter for authenticated API requests. The first usable slice exposes `POST /api/auth/login` and `GET /api/auth/me`, with integration tests proving the full request path.

**Tech Stack:** Spring Boot, Spring Security, Spring Data JPA, Flyway, JUnit 5, MockMvc, JWT

---

### Task 1: Auth tests first

**Files:**
- Create: `backend/src/test/java/com/spaceh/auth/AuthIntegrationTest.java`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run the backend tests and verify auth compilation/runtime failures**
- [ ] **Step 3: Implement the minimal auth classes and config**
- [ ] **Step 4: Run the backend tests and verify login + me flow passes**
- [ ] **Step 5: Commit**

### Task 2: Auth runtime wiring

**Files:**
- Create: `backend/src/main/java/com/spaceh/auth/AuthController.java`
- Create: `backend/src/main/java/com/spaceh/auth/AuthService.java`
- Create: `backend/src/main/java/com/spaceh/auth/JwtService.java`
- Create: `backend/src/main/java/com/spaceh/auth/JwtAuthenticationFilter.java`
- Create: `backend/src/main/java/com/spaceh/auth/AppUserDetailsService.java`
- Create: `backend/src/main/java/com/spaceh/auth/AppUserPrincipal.java`
- Create: `backend/src/main/java/com/spaceh/auth/dto/LoginRequest.java`
- Create: `backend/src/main/java/com/spaceh/auth/dto/AuthResponse.java`
- Create: `backend/src/main/java/com/spaceh/auth/dto/CurrentUserResponse.java`
- Modify: `backend/src/main/java/com/spaceh/config/SecurityConfig.java`
- Modify: `backend/src/main/resources/application.yml`

- [ ] **Step 1: Add JWT and password support**
- [ ] **Step 2: Replace generated security behavior with stateless bearer auth**
- [ ] **Step 3: Expose login and current-user endpoints**
- [ ] **Step 4: Verify repository-backed login works with encoded passwords**
- [ ] **Step 5: Commit**

### Task 3: Documentation

**Files:**
- Modify: `docs/guides/backend-bootstrap.md`

- [ ] **Step 1: Document the new authentication flow and Spring concepts**
- [ ] **Step 2: Commit with the auth slice if changes are tightly coupled**
