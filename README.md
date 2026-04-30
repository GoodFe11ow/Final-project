# Productivity App

Productivity App is a mobile-first productivity system for focused work, task planning, and healthier study or work routines. The project currently includes a Vue frontend and a TypeScript/Express backend with authentication and task management.

## Current Stack

### Frontend

- Vue 3
- TypeScript
- Pinia
- Vue Router
- Tailwind CSS
- Vite / PWA

### Backend

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL / Supabase
- JWT authentication

## What Works Right Now

### Backend

- Health endpoints for server and database
- User registration
- User login with JWT
- `GET /auth/me`
- Protected task routes
- Ownership checks so each user only sees their own data
- CRUD for tasks
- CRUD for subtasks
- Request validation with Zod

### Frontend

- Register page connected to backend
- Login page connected to backend
- Token storage in Pinia + `localStorage`
- Session restore on app startup through `/auth/me`
- Auth guards for guest-only and protected routes
- Logout from settings
- Dynamic current-user greeting on the home page

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

### 2. Start the backend

```bash
cd backend
npm install
```

Create `.env` in `backend/` with the required values:

```env
DATABASE_URL=...
DIRECT_URL=...
APP_JWT_SECRET=...
PORT=4000
```

Generate Prisma client if needed:

```bash
npm run prisma:generate
```

Run the backend:

```bash
npm run dev
```

Useful backend scripts:

```bash
npm run typecheck
npm run build
npm run prisma:migrate:dev
npm run prisma:studio
```

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create `.env.development` in `frontend/`:

```env
VITE_API_URL=http://localhost:3000
```

Run the frontend:

```bash
npm run dev
```

## Current API Areas

- `/health`
- `/health/db`
- `/auth/register`
- `/auth/login`
- `/auth/me`
- `/tasks`
- `/tasks/:id`
- `/tasks/:id/subtasks`
- `/tasks/:taskId/subtasks/:subtaskId`

## Project Links

- [Confluence: Project Documentation](https://mikhail-kucherenko.atlassian.net/wiki/spaces/~7120208debcf5ddca746299eb8d761cf0d5cef/overview)
- [Jira: Project Board](https://mikhail-kucherenko.atlassian.net/jira/software/projects/FP/boards/34)
- [Figma: Design Files](https://www.figma.com/design/KW9Qq2SbdHFWVG9GtSOozt/design?node-id=166-485&t=zEMhvssBqKT7Y4Db-1)

## Next Major Areas

- Frontend integration for real tasks API
- Focus session records
- Calendar planning
- Statistics
- Timer and notification settings
