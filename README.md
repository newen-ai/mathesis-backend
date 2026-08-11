# Mathesis Backend

Production-style Node.js + TypeScript backend starter with:

- Express server setup
- Security middlewares (`helmet`, `cors`, `compression`)
- Environment validation (`zod` + `dotenv`)
- Centralized error handling
- JWT auth service (`register`, `login`, `me`)
- Request validation middleware
- Structured JSON logging
- ESLint + Prettier + strict TypeScript
- Prisma ORM with PostgreSQL

## Quick Start

```bash
npm install
cp .env.example .env

# Set DATABASE_URL in .env (see Database Setup below)

# Generate Prisma client and run migrations
npx prisma migrate deploy

npm run dev
```

Server default URL: `http://localhost:4000`

## Database Setup

### Option 1: Local PostgreSQL (Docker)

```bash
# Update .env with:
DATABASE_URL="postgresql://user:password@localhost:5432/mathesis"
```

### Option 2: Cloud-Hosted (Recommended for Dev/Prod)

- **Supabase:** https://supabase.io (PostgreSQL-as-a-Service, free tier available)
- **Railway:** https://railway.app
- **Neon:** https://neon.tech (PostgreSQL Serverless)

Create a database and copy the connection string into `.env` as `DATABASE_URL`.

### Run Migrations

After setting `DATABASE_URL`, create the database schema:

```bash
npx prisma migrate deploy       # Run pending migrations
npx prisma studio              # GUI to browse/edit data
```

## Database Schema

**User** (auth)
- id, email (unique), passwordHash, role, createdAt, updatedAt

**Profile** (user info)
- id, firstName, lastName, dateOfBirth, nationality, currentJobTitle
- createdAt, updatedAt, deletedAt (soft delete support)
- Relation: one-to-one with User

**WorkExperience** (job history)
- id, company, jobTitle, startDate (YYYY-MM format), endDate (optional)
- createdAt, updatedAt, deletedAt (soft delete support)
- Relation: many-to-one with Profile

## API Endpoints

- `GET /` - Basic status
- `GET /api/v1/health` - Health check
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (Bearer token required)

## Scripts

- `npm run dev` - Start dev server with hot reload
- `npm run build` - Compile to `dist`
- `npm run start` - Run compiled server
- `npm run typecheck` - TypeScript type check
- `npm run lint` - Lint source code
- `npm run format` - Format project with Prettier

## Notes

- Auth uses Prisma + PostgreSQL for persistent user storage
- Profile and WorkExperience models are ready but routes not yet implemented
- Soft deletes with `deletedAt` column for data retention

## Live Spec Workflow

This workspace uses two live files to keep backend/frontend aligned with the HTML source of truth:

- `docs/ui-spec-live.md`: version-aware UI scope and implementation status.
- `docs/agent-live-context.md`: agent handoff and next-step context.

Before coding profile-related changes, read both files. After meaningful changes, update statuses and append a session log entry.

## Next Steps

1. Add Profile CRUD routes (`GET /api/v1/profiles/:id`, `PATCH`, etc.)
2. Add WorkExperience management routes
3. Add refresh token + logout flow
4. Add testing suite (vitest + supertest)
