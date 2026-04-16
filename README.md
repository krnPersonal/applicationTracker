# ApplicationTracker

[![Java](https://img.shields.io/badge/Java-17-1f4acc?style=flat-square)](#tech-stack)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6db33f?style=flat-square)](#tech-stack)
[![React](https://img.shields.io/badge/React-Vite-61dafb?style=flat-square)](#tech-stack)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479a1?style=flat-square)](#tech-stack)
[![Swagger](https://img.shields.io/badge/API-Swagger-85ea2d?style=flat-square)](#api-docs)

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
App is not online yet.

## Preview
<img width="1548" height="1124" alt="image" src="https://github.com/user-attachments/assets/f5738dcd-d19f-43d5-9c3c-6bb39225cddf" />
<img width="1502" height="1249" alt="image" src="https://github.com/user-attachments/assets/93d18b3d-04c8-4526-8613-f262c540e341" />
<img width="1604" height="1289" alt="image" src="https://github.com/user-attachments/assets/67b88de9-d066-4fee-9721-8e0b62907c15" />
<img width="1639" height="1292" alt="image" src="https://github.com/user-attachments/assets/d7aa8222-799d-478d-be31-7371748e0b65" />
<img width="1432" height="1028" alt="image" src="https://github.com/user-attachments/assets/b010f3ab-8ca7-4e32-822c-649eeef25aca" />
<img width="1490" height="1288" alt="image" src="https://github.com/user-attachments/assets/d5ab6c4a-fa11-43e2-8db1-1029ef4ac495" />
<img width="1333" height="1288" alt="image" src="https://github.com/user-attachments/assets/d7317220-7aa1-41dd-ac87-8233abe18c8b" />
<img width="1342" height="1290" alt="image" src="https://github.com/user-attachments/assets/dc9f6d56-b1ba-4e65-b040-a738a6a8631d" />
<img width="1859" height="1291" alt="image" src="https://github.com/user-attachments/assets/23f5d58c-9ba8-402d-8736-06ba9910f626" />


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

If you want the `Market` page to use live USAJOBS data instead of the built-in fallback snapshot, also add:

- `app.usajobs.user-agent`
- `app.usajobs.api-key`

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

## Test Coverage

Generate a JaCoCo coverage report with:

```bash
./mvnw -Pcoverage test
```

Coverage output:

- HTML report: `target/site/jacoco/index.html`
- XML report: `target/site/jacoco/jacoco.xml`

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

## Architecture

ApplicationTracker is organized as a single repository with a React frontend and a Spring Boot backend.

- frontend: React + Vite SPA with route guards, token-based auth flow, analytics views, and product-style UI
- backend: Spring Boot REST API with feature-first modules for auth, applications, user/profile, and config
- data: MySQL for local and containerized runs, with Flyway handling schema evolution
- docs: Swagger/OpenAPI for inspectable API contracts

## Project Structure

### Backend

- `src/main/java/com/applicationtracker/auth` - auth controllers, DTOs, JWT services
- `src/main/java/com/applicationtracker/applications` - application entity, repository, controller, service
- `src/main/java/com/applicationtracker/user` - user/profile APIs and persistence
- `src/main/java/com/applicationtracker/config` - security, OpenAPI, seeding, SPA support

### Frontend

- `frontend/src/pages` - landing page, auth, dashboard, applications, detail, profile, market
- `frontend/src/components` - navbar, route guards, toasts, shared UI pieces
- `frontend/src/Api` - API client and token handling



## Challenges Solved

- Moved from ad hoc schema updates to Flyway migrations for predictable local setup
- Fixed JWT/security flow issues so protected actions behave correctly across users
- Cleaned test infrastructure to work on newer JDKs and reduced noisy H2 setup warnings
- Refined the frontend from a plain scaffold into something that presents better in screenshots and demos

## Notes

- Flyway migrations live in `src/main/resources/db/migration`
- production config is driven by environment variables in `application-prod.properties`
- test profile uses H2 and keeps Flyway disabled
- verified with `./mvnw test`
