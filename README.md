# SkillSwap Nexus

SkillSwap Nexus is a unique **campus time-bank platform** where students exchange mentoring hours instead of money. The app includes a React frontend, Spring Boot backend, smart skill recommendations, and complete deployment support for Render.

## What makes it unique
- **Time-bank model**: learners barter mentoring sessions peer-to-peer.
- **Skill matching engine**: recommends high-fit collaborations based on your learning/offering map.
- **Swap workflow**: create, accept, reject, and cancel skill exchange requests.
- **Demo-ready**: seeded users and skills so your minor project works instantly.

## Tech stack
- Frontend: React + Vite + Framer Motion + Lucide icons
- Backend: Spring Boot 3, Spring Data JPA, Validation, BCrypt password hashing
- Database: H2 by default (local/dev), PostgreSQL-ready via env vars
- Deployment: Docker + Render blueprint (`render.yaml`)

## Project structure
- `frontend/` React UI
- `backend/` Spring Boot API
- `Dockerfile` builds frontend + backend into one Render-ready container
- `render.yaml` Render Blueprint config

## Local run

### 1) Backend
```bash
cd backend
mvn spring-boot:run
```

### 2) Frontend
```bash
cd frontend
npm ci
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` to `http://localhost:8080`.

## Demo accounts
All seeded users share password: `pass1234`
- `anaya@campus.dev`
- `rehan@campus.dev`
- `mira@campus.dev`

## Core API routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users`
- `GET /api/skills/marketplace`
- `POST /api/skills/owner/{ownerId}`
- `GET /api/skills/recommendations/{userId}`
- `POST /api/requests`
- `GET /api/requests/inbox/{userId}`
- `GET /api/requests/outbox/{userId}`
- `PATCH /api/requests/{requestId}`
- `GET /api/dashboard/{userId}`
- `GET /api/health`

## Render deployment

### Option A: one-click with Blueprint
1. Push this repo to GitHub.
2. In Render, choose **New + -> Blueprint**.
3. Select this repo (Render reads `render.yaml`).
4. Deploy.

### Option B: direct Web Service
1. Create a new **Web Service** in Render from this repo.
2. Set environment to **Docker**.
3. Render uses `Dockerfile` automatically.
4. After deploy, open `/api/health` to verify status `UP`.

## Environment variables (optional)
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_JPA_HIBERNATE_DDL_AUTO` (default `update`)
- `FRONTEND_ORIGIN` (default `http://localhost:5173`)
