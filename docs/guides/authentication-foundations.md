# Authentication Foundations

This guide explains the first real backend feature slice: authentication.

## What We Added

- `POST /api/auth/login`
- `GET /api/auth/me`
- JWT bearer-token authentication
- university ID format validation
- BCrypt password hashing
- consistent JSON error responses for validation failures and bad credentials

## The Moving Parts

### `AuthController`

The controller is the HTTP entry point.

It does two main jobs:

- accepts incoming requests
- delegates real logic to the service layer

In this slice, the controller stays intentionally thin so the business rules live in services.

### `AuthService`

The service coordinates the login flow.

It:

- passes credentials into Spring Security's `AuthenticationManager`
- converts the authenticated user into a token response
- maps the authenticated principal into the `/me` response

This is a good example of the "controller -> service -> framework infrastructure" flow.

### `JwtService`

This class is focused on tokens only.

It:

- creates a signed JWT
- extracts the university ID from a token
- checks whether the token is still valid for a user

Keeping token logic in one class makes later changes easier, like adding more claims or rotating secrets.

### `JwtAuthenticationFilter`

This filter runs on incoming requests before protected controllers.

If it finds a bearer token:

- it parses the token
- loads the user behind the token
- places an authenticated object into Spring Security's context

If there is no token, the request simply continues. Protected routes will then fail with `401 Unauthorized`.

## Why We Use JWT Here

For this project, JWT is a good fit because:

- the frontend and backend are separate applications
- we want stateless API requests
- it keeps the first auth slice small

Later, if you want logout invalidation, refresh tokens, or institution-wide SSO, we can evolve from this base.

## University ID Validation Rule

For now, the backend validates only the format:

- old format: `XX-XXXX`
- new format: `XX-XXXX-XX`

All `X` characters must be digits.

The current regex is:

- `^\d{2}-\d{4}(-\d{2})?$`

This does not verify whether the ID exists in a university system yet. It only ensures requests are shaped correctly.

## Security Notes

- The default JWT secret in `application.yml` is for development only.
- Production should always set `SPACEH_JWT_SECRET` through the environment.
- Passwords should only ever enter the database after BCrypt encoding.
- Access rules are currently authentication-based; finer role-based authorization comes next.
