# Tally Form Builder

A Tally-style form builder built with Next.js, React, JavaScript, Tailwind CSS, Prisma, and SQLite (local) / Cloudflare D1 (production).

## Getting Started

### Local Development

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

### Seed Data

```bash
npm run db:seed
```

## Architecture

- **Local development**: SQLite via Prisma (`prisma/dev.db`)
- **Production**: Cloudflare D1 via Prisma + `@prisma/adapter-d1`
- **Deployment**: Cloudflare Workers via `@opennextjs/cloudflare`

## Cloudflare Deployment

### Prerequisites

- Node.js 20+
- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- Wrangler CLI (installed as dev dependency)

### 1. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 2. Create D1 Database

```bash
npx wrangler d1 create tally-form-builder
```

This outputs a database ID. Copy it and paste into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "tally-form-builder"
database_id = "YOUR_D1_DATABASE_ID"  # ← replace this
```

### 3. Apply Migrations (Local)

```bash
npm run db:migrate
```

### 4. Apply Migrations (Remote/Production)

```bash
npm run db:migrate:remote
```

### 5. Build & Preview Locally

```bash
npm run preview
```

### 6. Deploy to Cloudflare

```bash
npm run deploy
```

### 7. Verify Deployment

After deployment, Wrangler outputs your Worker URL (e.g. `https://tally-form-builder.xxx.workers.dev`). Visit it to confirm the app is running.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Local only | SQLite file path (`file:./dev.db`) |
| `RESEND_API_KEY` | No | Resend API key for email notifications |
| `EMAIL_FROM` | No | Sender address for notification emails |

Cloudflare D1 binding is configured in `wrangler.toml`, not via environment variables.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start local dev server (port 3001) |
| `npm run build` | Build for production |
| `npm run start` | Start production server (local) |
| `npm run preview` | Build & preview as Cloudflare Worker locally |
| `npm run deploy` | Build & deploy to Cloudflare Workers |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:migrate` | Apply D1 migrations locally |
| `npm run db:migrate:remote` | Apply D1 migrations to production |

## D1 Migration Files

D1-compatible SQL migrations are in `d1-migrations/`. These mirror the Prisma schema but are written as raw SQL for D1 compatibility.

To create a new migration:

1. Add a new `.sql` file in `d1-migrations/`
2. Run `npm run db:migrate` (local) and `npm run db:migrate:remote` (production)

## Database Schema

### Form

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | CUID |
| `title` | TEXT | Form title |
| `slug` | TEXT (unique) | URL slug |
| `description` | TEXT | Form description |
| `schema` | TEXT | JSON form schema |
| `status` | TEXT | `draft` or `published` |
| `createdAt` | DATETIME | Creation timestamp |
| `updatedAt` | DATETIME | Last update timestamp |

### FormSubmission

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | CUID |
| `formId` | TEXT (FK) | References Form.id |
| `response` | TEXT | JSON response data |
| `createdAt` | DATETIME | Submission timestamp |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare)
- [Prisma with D1](https://developers.cloudflare.com/d1/tutorials/d1-and-prisma-orm)
