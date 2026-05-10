# Productivity App

Productivity App is a mobile-first productivity system for focused work, lightweight planning, and weekly progress tracking. The project consists of a Vue frontend and a TypeScript/Express backend backed by PostgreSQL through Supabase.

## Stack

### Frontend

- Vue 3
- TypeScript
- Pinia
- Vue Router
- Tailwind CSS
- Vite
- `vite-plugin-pwa`
- Unovis charts
- Reka UI

### Backend

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL / Supabase
- JWT authentication
- Zod validation

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: Supabase

## Current Features

### Authentication

- Register and login connected to the backend
- JWT-based authentication
- Session restore through `/auth/me`
- Guest-only and protected route guards
- Logout from settings

### Tasks

- Real CRUD for tasks
- Real CRUD for subtasks
- Per-user task isolation
- Persistent task state across devices through the hosted database

### Calendar

- Calendar page powered by real task data from the backend
- Month and week views
- Day indicators for scheduled tasks
- Day detail list for planned tasks

### Focus

- Focus and short break timer flows
- Completed focus sessions saved to the backend
- Focus sessions tied to the currently selected task title
- Real streak values loaded from backend statistics

### Statistics

- Weekly completed task count from backend
- Weekly focus minutes from backend
- Current streak from backend
- Weekly chart data from backend

## Project Structure

```text
productivityApp/
├── frontend/
└── backend/
```

## Local Development

### 1. Clone the repository

```bash
git clone <repository-url>
cd productivityApp
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
APP_JWT_SECRET=your-long-random-secret
PORT=3000
```

Notes:

- `DATABASE_URL` is used by the running backend.
- `DIRECT_URL` is used by Prisma CLI through `prisma.config.ts`.
- `APP_JWT_SECRET` must stay private and only belong on the backend.

Useful backend commands:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:studio
npm run typecheck
npm run build
npm run dev
```

### 3. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.development`:

```env
VITE_API_URL=http://localhost:3000
```

Run the frontend:

```bash
npm run dev
```

## Deployment Notes

### Backend on Render

Recommended settings:

- Root Directory: `backend`
- Install Command: `npm install --include=dev`
- Build Command: `npm run prisma:generate && npm run build`
- Start Command: `npm run start`

Backend environment variables on Render:

```env
DATABASE_URL=...
DIRECT_URL=...
APP_JWT_SECRET=...
```

For a fresh production database, apply migrations with:

```bash
npx prisma migrate deploy
```

### Frontend on Vercel

Set:

```env
VITE_API_URL=https://your-backend.onrender.com
```

Important:

- Do not place `DATABASE_URL` or `APP_JWT_SECRET` on Vercel.
- After changing `VITE_API_URL`, redeploy the frontend so Vite rebuilds with the new value.

## API Overview

### Health

- `GET /health`
- `GET /health/db`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Tasks

- `GET /tasks`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `POST /tasks/:id/subtasks`
- `PATCH /tasks/:taskId/subtasks/:subtaskId`
- `DELETE /tasks/:taskId/subtasks/:subtaskId`

### Focus Sessions

- `GET /focus-sessions`
- `POST /focus-sessions`

### Stats

- `GET /stats/summary`

## Security Notes

- JWT secrets are stored only on the backend host.
- Frontend receives only the public API base URL.
- Protected backend routes rely on JWT verification and ownership checks.
- CORS is currently enabled in a permissive mode for MVP deployment and can be restricted further in a later hardening step.

## Current Known Limitations

- Focus sessions currently store the selected task title as a string, not a task ID snapshot pair.
- Some production hardening steps are still pending, such as stricter CORS origin allowlisting.
- The frontend PWA may require refresh/reinstall after major deploy changes.

## Project Links

- [Confluence: Project Documentation](https://mikhail-kucherenko.atlassian.net/wiki/spaces/~7120208debcf5ddca746299eb8d761cf0d5cef/overview)
- [Jira: Project Board](https://mikhail-kucherenko.atlassian.net/jira/software/projects/FP/boards/34)
- [Figma: Design Files](https://www.figma.com/design/KW9Qq2SbdHFWVG9GtSOozt/design?node-id=166-485&t=zEMhvssBqKT7Y4Db-1)
