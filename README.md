# Mensa LinkedIn Backend

Production-style Node.js + TypeScript backend starter with:

- Express server setup
- Security middlewares (`helmet`, `cors`, `compression`)
- Environment validation (`zod` + `dotenv`)
- Centralized error handling
- JWT auth service (`register`, `login`, `me`)
- Registration email delivery through Resend
- Request validation middleware
- Structured JSON logging
- ESLint + Prettier + strict TypeScript
- Prisma ORM with PostgreSQL

## Quick Start

```bash
npm install
cp .env.example .env

# Set DATABASE_URL in .env (see Database Setup below)
# Set FRONTEND_BASE_URL and RESEND_API_KEY for registration emails

# Generate Prisma client and run migrations
npx prisma migrate deploy

npm run dev
```

Server default URL: `http://localhost:4000`

## Database Setup

### Option 1: Local PostgreSQL (Docker)

```bash
# Start PostgreSQL container
docker run --name postgres-mensa \
	-e POSTGRES_USER=user \
	-e POSTGRES_PASSWORD=password \
	-e POSTGRES_DB=mensa_linkedin \
	-p 5432:5432 \
	-d postgres:16

# Update .env with:
DATABASE_URL="postgresql://user:password@localhost:5432/mensa_linkedin"
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

The registration flow sends a confirmation email from `no-reply@mail.mathesis.social` to the user's registered email address and includes a link to `${FRONTEND_BASE_URL}/confirm`.

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

## Next Steps

1. Add Profile CRUD routes (`GET /api/v1/profiles/:id`, `PATCH`, etc.)
2. Add WorkExperience management routes
3. Add refresh token + logout flow
4. Add testing suite (vitest + supertest)
