# ApplicationTracker

ApplicationTracker is a full-stack portfolio project for tracking job applications with a polished product-style frontend and a production-oriented Spring Boot backend.

It demonstrates:

- JWT authentication and route protection
- profile management and resume upload
- analytics dashboard and follow-up insights
- application list filtering, sorting, CSV export, and pagination
- activity timeline on detail pages
- Flyway migrations, Swagger docs, demo seed data, and Dockerized setup

## Product Overview

The app is structured like a real user workflow:

1. Public landing page for portfolio presentation
2. Animated login / sign-up experience
3. Dashboard with response and follow-up metrics
4. Application pipeline table with filters and export
5. Detail view with editable record, resume actions, and timeline history

## Tech Stack

### Backend

- Java 17
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- MySQL
- Flyway
- springdoc OpenAPI / Swagger

### Frontend

- React
- Vite
- React Router
- Custom CSS design system

## Portfolio Highlights

### UX / Product

- Public-facing landing page for first impression
- protected application routes
- professional auth transitions
- analytics-driven dashboard
- responsive application list and workflow detail views

### Engineering

- database migrations with Flyway
- local demo data seeding
- OpenAPI documentation
- Docker support for backend + MySQL
- environment-based configuration

## Demo Credentials

Local profile seeds a demo account automatically:

- email: `demo@applicationtracker.dev`
- password: `password123`

## Local Setup

### Backend

Create a local config from the example:

```bash
cp src/main/resources/application-local.example.properties src/main/resources/application-local.properties
```

Then update the local file with your own MySQL username, password, and JWT secret.

Run the backend with the local profile:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Local profile behavior:

- database: `applicationtracker`
- database auto-created if missing
- demo seed data enabled
- uploads stored in `uploads/`

### Frontend

```bash
cd frontend
npm run dev
```

Frontend default URL:

- `http://localhost:5173`

## API Docs

After the backend starts:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Docker

Run the backend and MySQL together:

```bash
docker compose up --build
```

Services:

- backend: `http://localhost:8080`
- mysql: `localhost:3306`

## Project Structure

### Backend

- `src/main/java/com/applicationtracker/auth` - auth controllers, DTOs, JWT services
- `src/main/java/com/applicationtracker/applications` - application entity, repository, controller, service
- `src/main/java/com/applicationtracker/user` - user/profile APIs and persistence
- `src/main/java/com/applicationtracker/config` - security, OpenAPI, seeding, SPA support

### Frontend

- `frontend/src/pages` - app screens
- `frontend/src/components` - route guards, navbar, toasts
- `frontend/src/Api` - API client and token handling

## Suggested Portfolio Screenshots

If you want to present this in GitHub or LinkedIn, the strongest screenshots are:

1. Public landing page
2. Animated auth screen
3. Dashboard analytics
4. Applications table with filters
5. Application detail timeline
6. Swagger UI

## Notes

- Flyway migrations live in `src/main/resources/db/migration`
- production config is driven by environment variables in `application-prod.properties`
- test profile uses H2 and keeps Flyway disabled
- backend compile verified with `./mvnw -DskipTests compile`
