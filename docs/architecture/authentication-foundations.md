# Authentication Foundations

This guide explains the PHP authentication slice.

## What Exists

- `POST /api/auth/login`
- `GET /api/auth/me`
- JWT bearer-token authentication
- role checks for admin-only API routes
- university ID format validation
- BCrypt password hashing through PHP `password_hash` and `password_verify`
- consistent JSON errors for validation failures and bad credentials

## The Moving Parts

### `Router`

`Router` is the HTTP coordinator. It reads the request method and path, then calls the matching service.

Current auth routes:

- `POST /api/auth/login`
- `GET /api/auth/me`

### `AuthService`

`AuthService` owns credential rules.

It:

- validates university ID format
- loads the user from MySQL by `university_id`
- verifies the submitted password against the stored hash
- returns the public user payload
- asks `JwtService` to issue tokens
- restores the current user from a bearer token

### `JwtService`

`JwtService` creates and verifies HMAC-SHA256 JWTs without external dependencies.

It:

- signs tokens with `SPACEH_JWT_SECRET`
- stores the university ID in `sub`
- adds `iat` and `exp` claims
- rejects malformed, tampered, or expired tokens

### `SeedData`

`SeedData` creates demo accounts only when `app_user` is empty.

Demo credentials:

- `24-0001-01` / `library-pass`
- `23-1024` / `compiler-pass`
- `22-7777-03` / `orbit-pass`

## University ID Rule

Allowed formats:

- old format: `XX-XXXX`
- new format: `XX-XXXX-XX`

All `X` characters must be digits.

Regex:

```text
^\d{2}-\d{4}(-\d{2})?$
```

## Security Notes

- the default JWT secret is for local development only
- production must set `SPACEH_JWT_SECRET`
- production must set `SPACEH_ALLOWED_ORIGIN`
- passwords are stored as BCrypt hashes
- admin-only JSON endpoints require a valid `ADMIN` bearer token
