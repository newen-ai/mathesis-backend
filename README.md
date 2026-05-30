# Mensa LinkedIn Backend

Production-style Node.js + TypeScript backend starter with:

- Express server setup
- Security middlewares (`helmet`, `cors`, `compression`)
- Environment validation (`zod` + `dotenv`)
- Centralized error handling
- JWT auth service (`register`, `login`, `me`)
- Request validation middleware
- Structured JSON logging
- ESLint + Prettier + strict TypeScript

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Server default URL: `http://localhost:4000`

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

- Current auth user store is in-memory for fast bootstrap.
- Replace it with a persistent DB repository (Prisma/Postgres, Mongo, etc.) for production.
