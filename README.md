# ApplicationTracker

ApplicationTracker is a full-stack portfolio project for managing job applications through a polished, product-style workflow. It combines a React frontend with a Spring Boot backend and focuses on the parts that make a portfolio project feel credible: authentication, analytics, file handling, route protection, migrations, API docs, and a cleaner UX than a basic CRUD app.

## What It Shows

- JWT authentication with protected frontend and backend routes
- profile management with resume upload/download
- analytics dashboard with follow-up and pipeline insights
- searchable application table with filters, sorting, CSV export, and pagination
- application detail timeline with editable workflow data
- Flyway migrations, Swagger docs, seeded demo data, and Docker support

## Feature Walkthrough

1. Public landing page designed for portfolio presentation
2. Animated login and sign-up flow
3. Dashboard with response rate, offer rate, and follow-up visibility
4. Applications table with search, filters, sort, export, and empty states
5. Detail page with timeline, insights, resume actions, and editing flow
6. Swagger UI for backend API inspection

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
- Custom CSS

## Why This Is Portfolio-Worthy

### Product / UX

- clearer visual design than a default scaffold
- protected route flow and public marketing-style landing page
- dashboard metrics that communicate next actions, not just raw counts
- polished auth and detail experiences that feel closer to a real product

### Engineering

- feature-first backend package structure
- database migrations instead of schema drift through auto-update
- OpenAPI documentation for inspectable APIs
- environment-specific configuration and local demo seeding
- Dockerized backend and MySQL setup

## Live Demo

- App: add your deployed frontend URL here
- API docs: add your deployed Swagger URL here

## Demo Credentials

The local profile seeds a demo account automatically:

- email: `demo@applicationtracker.dev`
- password: `password123`

## Quick Start

### 1. Backend config

Create a local config from the example:

```bash
cp src/main/resources/application-local.example.properties src/main/resources/application-local.properties
```

Then update the local file with your own MySQL username, password, and JWT secret.

### 2. Start the backend

```bash
./mvnw spring-boot:run
```

The project defaults to the `local` profile, so it will use:

- database: `applicationtracker`
- demo seed data: enabled
- uploads directory: `uploads/`

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://localhost:5173`

Backend URL:

- `http://localhost:8080`

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

- `frontend/src/pages` - landing page, auth, dashboard, applications, detail, profile, playground
- `frontend/src/components` - navbar, route guards, toasts, shared UI pieces
- `frontend/src/Api` - API client and token handling

## Recommended Screenshots

For GitHub, LinkedIn, or a portfolio site, these are the strongest screenshots:

1. Landing page
2. Login / sign-up flow
3. Dashboard analytics
4. Applications table with filters
5. Application detail timeline
6. Swagger UI

## Notes

- Flyway migrations live in `src/main/resources/db/migration`
- production config is driven by environment variables in `application-prod.properties`
- test profile uses H2 and keeps Flyway disabled
- verified with `./mvnw test`
