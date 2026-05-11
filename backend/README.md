# Space.h PHP Backend

Plain PHP 8.3 micro-backend served by Apache with MySQL persistence.

## Routes

- `GET /api/public/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/resources`
- `GET /api/library-hours`
- `GET /api/reservations` (`STUDENT`, `FACULTY`, or `ADMIN` bearer token required)
- `GET /api/attendance-logs` (`STUDENT`, `FACULTY`, or `ADMIN` bearer token required)
- `GET /api/dashboard` (`ADMIN` bearer token required)
- `POST /api/reservations` (`STUDENT`, `FACULTY`, or `ADMIN` bearer token required)
- `POST /api/reservations/{id}/cancel` (`STUDENT`, `FACULTY`, or `ADMIN` bearer token required)
- `POST /api/reservations/{id}/check-in` (`STUDENT`, `FACULTY`, or `ADMIN` bearer token required)
- `POST /api/reservations/{id}/check-out` (`STUDENT`, `FACULTY`, or `ADMIN` bearer token required)
- `POST /api/resources` (`ADMIN` bearer token required)
- `PATCH /api/resources/{id}` (`ADMIN` bearer token required)
- `PATCH /api/resources/{id}/status` (`ADMIN` bearer token required)
- `PATCH /api/library-hours` (`ADMIN` bearer token required)
- `DELETE /api/resources/{id}` (`ADMIN` bearer token required)

## Apache Site

- `http://localhost:8080` serves the built React app.
- `/api/*` stays handled by PHP.

## Demo Users

- `24-0001-01` / `library-pass`
- `23-1024` / `compiler-pass`
- `22-7777-03` / `orbit-pass`
