# FormCraft — Tally Form Builder

A Tally-style form builder: create and customize forms with a visual editor, publish them to a public share link, and view responses — all persisted through Cloudflare D1 so nothing is lost on refresh.

Built with Next.js, React, JavaScript, Tailwind CSS, Prisma, SQLite (local) and Cloudflare D1 + Workers (production).

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Form Schema / Design Storage](#form-schema--design-storage)
- [D1 Persistence Approach](#d1-persistence-approach)
- [Re-rendering Saved Forms](#re-rendering-saved-forms)
- [Submission Flow](#submission-flow)
- [Localization (L10N / I18N)](#localization-l10n--i18n)
- [Responsive Design](#responsive-design)
- [Assumptions & Design Decisions](#assumptions--design-decisions)
- [Local Development](#local-development)
- [Production / Deployment](#production--deployment)
- [Environment Variables](#environment-variables)
- [D1 Migration Files](#d1-migration-files)
- [Database Schema](#database-schema)
- [Available Scripts](#available-scripts)
- [Learn More](#learn-more)

## Project Overview

The app is split into two experiences:

1. **Builder (authenticated)** — a Tally-style editor where you can:
   - Create a new form from a wizard (the form row is created immediately and you go straight to the editor).
   - Add, edit, reorder (drag & drop or up/down), duplicate, and remove fields.
   - Preview the form in the editor, configure settings (labels, submit button, success message, progress bar, response limit, language, shuffle order, email notifications, etc.), and publish/unpublish.
2. **Respondent (public)** — visitors fill out the public form at `/f/{id}` and their answers are stored as submissions the owner can view, search, and delete.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router), React 19, JavaScript (JSX) |
| Styling | Tailwind CSS (utility-first, responsive breakpoints) |
| ORM / Data | Prisma + `@prisma/adapter-d1` |
| Local DB | SQLite (`prisma/dev.db`) |
| Production DB | Cloudflare D1 |
| Deployment | Cloudflare Workers via `@opennextjs/cloudflare` |
| Email | Resend (form submission notifications) |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js App Router                                          │
│                                                              │
│  Public (no auth)          Builder (session required)        │
│  ┌──────────────┐          ┌──────────────────────────┐      │
│  │ /f/[id]      │          │ / (landing)              │      │
│  │  FormRenderer│          │ /login, /signup          │      │
│  │  FieldRenderer│         │ /forms                   │      │
│  └──────────────┘          │ /forms/new               │      │
│                            │ /forms/[id]/edit         │      │
│                            │ /forms/[id]/preview      │      │
│                            │ /forms/[id]/responses    │      │
│                            └──────────────────────────┘      │
│                                                              │
│  API Routes                                                   │
│  /api/forms                  POST  create (+list)            │
│  /api/forms/[id]             GET/PUT/DELETE (GET is public,  │
│                              published-only)                 │
│  /api/forms/[id]/submissions POST  submit                    │
│  /api/auth/*                 login/signup/logout/me          │
└─────────────────────────────────────────────────────────────┘
```

- **Local development**: Prisma + SQLite (`DATABASE_URL=file:./dev.db`).
- **Production**: the same Prisma client is bound to Cloudflare D1 through `@prisma/adapter-d1` using the `DB` binding from `wrangler.toml`.
- **Deployment**: Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`).

## Form Schema / Design Storage

A form's entire design is stored as a **single JSON blob** in the `schema` column of the `Form` table:

```jsonc
{
  "title": "Customer Feedback",
  "description": "Tell us how we did",
  "fields": [
    {
      "id": "lorem-cuid-123",      // stable per field
      "type": "text",              // text | email | number | textarea | select | radio |
                                   // checkbox | multiselect | date | time | datetime | file | rating
      "label": "What is your name?",
      "description": "…",
      "placeholder": "…",
      "required": true,
      "options": [ { "label": "Yes", "value": "yes" } ],  // select/radio/multiselect
      "min/max/step/minLength/maxLength/…": …             // per-type constraints
    }
  ],
  "settings": {
    "locale": "en-IN",             // L10N (en-IN | hi-IN)
    "submitButtonText": "Send",
    "successMessage": "Thanks!",
    "showProgressBar": true,
    "shuffleFields": false,
    "responseLimit": 100,
    "closedFormMessage": "…",
    "redirectUrl": "…",
    "notifications": { "enabled": true, "emails": [], "subject": "…" }
  }
}
```

Because the layout is stored data (not code), any saved design can be re-rendered verbatim later.

## D1 Persistence Approach

- `src/lib/db.js` returns a Prisma client configured per environment:
  - **Local** (`DATABASE_URL` set): normal Prisma → SQLite.
  - **Worker** (`env.DB` binding): `new PrismaD1(env.DB)` adapter.
- The `Form.schema` and `FormSubmission.response` columns are JSON strings; the API layer parses/stringifies them (`JSON.parse`/`JSON.stringify`) at the boundaries.
- **Survives refresh**: a form is created in D1 the moment you continue from the wizard (you get a real `id`), and the editor auto-saves schema/title/description changes to `/api/forms/[id]` (PUT, debounced). Publishing is a single PUT with `status: "published"`. Reloading the editor re-reads the row and re-renders from the stored JSON — nothing is ever kept only in the browser.

## Re-rendering Saved Forms

1. The editor loads the form by `id` (server-side `getDb().form.findUnique`) and passes the parsed schema to `FormBuilder`.
2. `FormBuilder` renders the builder canvas from `schema.fields` and re-parses stored JSON at mount — so the saved design is exactly what you edit.
3. The public page `/f/[id]` fetches `/api/forms/{id}` (published-only) and hands the schema to `FormRenderer`.
4. `FormRenderer` (client) maps `schema.fields` to `FieldRenderer` by `field.type`, keying every input by its stable `field.id`.
5. **Submission values map to field IDs**: the public form submits `{ response: { [fieldId]: value, … } }`; the server validates against the same field IDs and stores the response keyed by `field.id`. The responses screen renders stored values back through those IDs, so answers always line up with the design.

## Submission Flow

1. Respondent fills the public form; `FormRenderer` validates on the client (localized messages) then POSTs to `/api/forms/[id]/submissions`.
2. Server-side, the route:
   - 404s if the form does not exist or is not published.
   - Checks the form is not closed (close date / response limit via `checkFormClosed`).
   - Validates the response against `schema.fields` (required, type, min/max, option membership, etc.) using `form-validation.js`.
   - Stores the JSON response in a `FormSubmission` row.
   - Sends optional email notifications (Resend) to configured owners and/or a confirmation to the respondent.
3. Owners view responses at `/forms/[id]/responses` (`SubmissionList` summary + `SubmissionDetail` full breakdown) and can delete individual submissions.

## Localization (L10N / I18N)

- Forms carry a `settings.locale` (default `en-IN`), selectable in the editor's form settings.
- System-generated UI text — validation errors, submit/submitting buttons, success/recorded messages, "form closed", placeholders like "Select an option…" — is resolved through `src/lib/i18n/form-translations.js` (a small dictionary + `t(key, locale, params)` helper with `{param}` interpolation).
- `FieldRenderer`/`FormRenderer` pass the form's `locale` down so every system message keys off the form's language.
- **User-authored content is never translated**: field labels, descriptions, placeholder text, and option labels typed by the form owner render exactly as written; only built-in strings are localized.
- Current scope: `en-IN` and `hi-IN`. Adding a locale = adding a dictionary block; no structural changes needed.

## Responsive Design

- Everything is built with Tailwind responsive utilities (`sm:`, `md:`, etc.); there is a dedicated compact navigation for small screens in `Navbar.js`.
- Builder, settings modal, preview tab, public form, and responses pages all use fluid containers (`max-w-*`, `p-4 sm:p-6`, `px-4 py-10`) that collapse to a single column on mobile.
- Touch device fix: row actions (Edit/Responses/View/Delete, field configure/move/duplicate/remove) are `opacity-100` below `md` and only hidden until hover on `md+` — hover-only affordances never appear on touch screens.
- The public form is rendered in a centered `max-w-lg` card so it reads well on phones.

## Assumptions & Design Decisions

- Slugs: the `Form.slug` column is kept for uniqueness/URL compatibility, but the public URL is **ID-based** (`/f/{id}`). Slugs are auto-generated on first publish if missing and never changed on re-publish.
- The public GET endpoint returns **published forms only**; drafts/unpublished forms are not viewable via the public link.
- A form row is created upfront in the wizard so the editor always operates on a real, persistent record (no orphaned local drafts).
- File (upload) fields upload attachments to **Cloudflare R2** via `POST /api/forms/[id]/upload`, store per-file metadata (`key`, `name`, `size`, `type`, `url`) in the submission `response`, and serve the bytes back through `GET /api/forms/[id]/files/[key]`. The R2 binding is `FORM_UPLOADS` (bucket `form-builder-uploads`).
- Email notifications degrade gracefully: if `RESEND_API_KEY` is empty, form submissions still save; emails are skipped.
- The legacy `/api/forms/slug/[slug]` route is retained but unused — the public route is `/f/{id}`.

## Local Development

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

Optional seed data:

```bash
npm run db:seed
```

## Production / Deployment

1. Authenticate with Cloudflare: `npx wrangler login`
2. Create the D1 database: `npx wrangler d1 create tally-form-builder`
3. Paste the returned `database_id` into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "tally-form-builder"
database_id = "YOUR_D1_DATABASE_ID"
```

4. Apply migrations: `npm run db:migrate` (local) and `npm run db:migrate:remote` (production)
5. Create the R2 bucket for file uploads: `npx wrangler r2 bucket create form-builder-uploads`
6. Preview locally: `npm run preview`
7. Deploy: `npm run deploy`

Wrangler outputs your Worker URL after deploy (e.g. `https://tally-form-builder.xxx.workers.dev`).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Local only | SQLite file path (`file:./dev.db`) — used by Prisma CLI; the app uses the `DB` D1 binding in production |
| `RESEND_API_KEY` | No | Resend API key for email notifications (blank = submissions still save, emails skipped) |
| `EMAIL_FROM` | No | Sender address for notification emails |
| `NEXT_PUBLIC_BASE_URL` | Recommended | Public base URL of the app (used by the public page to call its own API; defaults to `http://localhost:3000`) |

Cloudflare D1 binding is configured in `wrangler.toml`, not via environment variables.

## D1 Migration Files

D1-compatible SQL migrations live in `d1-migrations/` (raw SQL mirroring the Prisma schema). To add a migration: create a `.sql` file there, then run `npm run db:migrate` (local) and `npm run db:migrate:remote` (production).

## Database Schema

### User

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | CUID |
| `email` | TEXT (unique) | Login email |
| `name` | TEXT | Display name |
| `passwordHash` | TEXT | Hashed password |
| `createdAt` | DATETIME | Creation timestamp |

### Session

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | CUID |
| `userId` | TEXT (FK) | References User.id |
| `token` | TEXT | Session token |
| `expiresAt` | DATETIME | Expiry |
| `createdAt` | DATETIME | Creation timestamp |

### Form

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | CUID |
| `title` | TEXT | Form title |
| `slug` | TEXT (unique) | Auto-generated on first publish |
| `description` | TEXT | Form description |
| `schema` | TEXT | JSON form schema (see [Form Schema](#form-schema--design-storage)) |
| `status` | TEXT | `draft` or `published` |
| `userId` | TEXT (FK) | Owner |
| `createdAt` | DATETIME | Creation timestamp |
| `updatedAt` | DATETIME | Last update timestamp |

### FormSubmission

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | CUID |
| `formId` | TEXT (FK) | References Form.id |
| `response` | TEXT | JSON response keyed by field ID |
| `createdAt` | DATETIME | Submission timestamp |

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

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [OpenNext Cloudflare Adapter](https://opennext.js.org/cloudflare)
- [Prisma with D1](https://developers.cloudflare.com/d1/tutorials/d1-and-prisma-orm)