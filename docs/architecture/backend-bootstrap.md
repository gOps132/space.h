# Backend Bootstrap Notes

Space.h now uses a plain PHP backend under `backend/`, served by Apache and backed by MySQL.

## What Exists Right Now

- `public/index.php`
  - the HTTP entry point for Apache
  - forwards all requests into `Router`
- `app/Router.php`
  - maps API and browser routes
  - returns JSON for API requests
- `app/AuthService.php`
  - validates university IDs
  - verifies BCrypt passwords
  - returns current-user payloads
- `app/JwtService.php`
  - creates and verifies HMAC-SHA256 JWT bearer tokens
- `app/Database.php`
  - opens a PDO connection to MySQL
- `app/LibraryHoursService.php`
  - reads and updates library hours
  - validates reservation windows against local time, 30-minute slots, and the 30-day advance limit
- `app/ReservationService.php`
  - creates, cancels, checks in, checks out, and releases expired reservations
- `app/SeedData.php`
  - inserts demo users, resources, and one reservation when the database is empty
- `schema/mysql.sql`
  - creates the MySQL tables and indexes used by the app
- `tests/run.php`
  - validates JWT behavior and university ID format rules

## Local Runtime

Run the stack with Docker Compose:

```bash
docker compose up --build
```

Useful URLs:

- frontend: `http://localhost:5173`
- Apache site: `http://localhost:8080`
- backend health: `http://localhost:8080/api/public/health`
- phpMyAdmin: `http://localhost:8081`

phpMyAdmin uses the local MySQL service:

- server: `mysql`
- username: `spaceh`
- password: `spaceh`
- database: `spaceh`

## Current Limitations

- the backend is intentionally framework-light
- there is no refresh-token flow yet
- there is no university-side ID verification yet, only format validation
- issue report write routes are not implemented yet
