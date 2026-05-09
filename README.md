# Space.h

Space.h is a full-stack library seat and room reservation system for university students, faculty, guests, and library staff.

## Repository Layout

- `frontend/` React + Vite client
- `backend/` PHP + Apache API with MySQL persistence
- `docs/` living project documentation, architecture notes, and development workflow
- `.agent/` agent operating rules for CI, security, and commit discipline

## Product Overview

The platform is designed around four roles:

- `Guest` can view public occupancy and availability information
- `Student` can reserve seats, check in, check out, and manage bookings
- `Faculty` can reserve priority rooms for consultations and meetings
- `Admin` can manage resources, monitor activity, and review reports

## Development

Project setup, workflows, architecture notes, and implementation decisions live under `docs/`.

## Local Services

- Frontend dev server: `http://localhost:5173`
- Apache app/API: `http://localhost:8080`
- phpMyAdmin: `http://localhost:8081`
  
