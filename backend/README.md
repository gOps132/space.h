# Space.h PHP Backend

Plain PHP 8.3 micro-backend served by Apache with MySQL persistence.

## Routes

- `GET /api/public/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/resources`
- `GET /api/reservations` (`ADMIN` bearer token required)
- `GET /api/attendance-logs` (`ADMIN` bearer token required)
- `GET /api/dashboard` (`ADMIN` bearer token required)

## Apache Site

- `http://localhost:8080` serves the built React app.
- `/api/*` stays handled by PHP.

## Demo Users

- `24-0001-01` / `library-pass`
- `23-1024` / `compiler-pass`
- `22-7777-03` / `orbit-pass`
