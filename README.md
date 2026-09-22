# FormCraft — Tally-Style Form Builder

A Tally-style form builder built with Next.js, React, and Cloudflare. Create and customize forms with a visual editor, publish them to a public share link, and view responses — all persisted through Cloudflare D1.

**Live Demo:** [https://tally-form-builder.minifydigital.workers.dev](https://tally-form-builder.minifydigital.workers.dev)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Form Schema Design](#form-schema-design)
- [Supported Field Types](#supported-field-types)
- [Routes](#routes)
- [Form Lifecycle](#form-lifecycle)
- [Persistence](#persistence)
- [Authentication & Security](#authentication--security)
- [Email Notifications](#email-notifications)
- [Cloudflare Deployment](#cloudflare-deployment)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Available Scripts](#available-scripts)
- [Database Schema](#database-schema)
- [Localization](#localization)
- [Responsive Design](#responsive-design)
- [Validation](#validation)
- [Error Handling](#error-handling)
- [Performance](#performance)
- [Design Decisions](#design-decisions)

---

## Features

### Builder Experience

- **Visual Form Editor** — drag-and-drop field reordering, inline editing, real-time preview
- **15 Field Types** — text, email, number, textarea, select, multiselect, radio, checkbox, date, time, datetime, file, phone, URL, rating
- **Form Templates** — 5 pre-built templates: Appointment, Inquiry, Contact Us, Feedback, Registration
- **Field Management** — add, edit, duplicate, reorder (drag-and-drop or up/down buttons), and remove fields
- **Form Settings** — customizable submit button text, success message, progress bar, response limits, redirect URL, close-on-date, close-on-limit, shuffle field order
- **Theme Customization** — right-side drawer with font picker and 9 color pickers for live theme editing (page background, card background, text, muted text, input background, input border, button background, button text, accent)
- **Banner Uploads** — upload form header banners via Cloudflare R2
- **Form Preview** — instant in-editor preview with live theme application
- **Publish/Unpublish** — toggle form visibility with one click
- **Auto-Save** — debounced save to server, never lose progress

### Respondent Experience

- **Public Form Pages** — clean, centered card layout at `/f/{id}`
- **Client-Side Validation** — instant feedback with localized error messages
- **File Uploads** — drag-and-drop file fields backed by Cloudflare R2
- **Rating Fields** — interactive star rating
- **Progress Bar** — optional visual progress indicator
- **Success State** — customizable confirmation message after submission

### Submission Management

- **Response Dashboard** — view all submissions at `/forms/{id}/responses`
- **Submission Detail** — expand individual responses to see full field-by-field breakdown
- **Delete Submissions** — remove individual responses with confirmation
- **Export-Ready** — submission data stored as structured JSON keyed by field IDs

### Additional

- **Form-Level I18N** — English and Hindi validation/placeholder text per form
- **Email Notifications** — admin alerts and respondent confirmations via Resend
- **Toast Notifications** — non-intrusive success/error/warning feedback
- **Responsive Design** — works on mobile, tablet, and desktop
- **Accessibility** — proper labels, ARIA attributes, keyboard navigation

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, JavaScript (JSX) |
| Styling | Tailwind CSS v4 |
| ORM | Prisma + `@prisma/adapter-d1` |
| Local DB | SQLite (`prisma/dev.db`) |
| Production DB | Cloudflare D1 |
| File Storage | Cloudflare R2 (bucket `form-builder-uploads`) |
| Deployment | Cloudflare Workers via `@opennextjs/cloudflare` |
| Email | Resend |
| Icons | lucide-react |
| Password Hashing | PBKDF2 (SHA-256, 100k iterations) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Next.js App Router (Cloudflare Workers)                        │
│                                                                  │
│  Public Routes (no auth)        Builder Routes (auth required)  │
│  ┌────────────────────┐         ┌────────────────────────────┐  │
│  │ /f/[id]            │         │ / (landing page)           │  │
│  │   FormRenderer     │         │ /login, /signup            │  │
│  │   FieldRenderer    │         │ /forms                     │  │
│  │   FormThemeProvider│         │ /forms/new                 │  │
│  └────────────────────┘         │ /forms/[id]/edit           │  │
│                                 │ /forms/[id]/preview        │  │
│  API Routes                     │ /forms/[id]/responses      │  │
│  ┌────────────────────┐         └────────────────────────────┘  │
│  │ POST /api/forms           (create form)                     │
│  │ GET  /api/forms/[id]      (public, published only)          │
│  │ PUT  /api/forms/[id]      (update form - auth required)     │
│  │ DELETE /api/forms/[id]    (delete form - auth required)     │
│  │ POST /api/forms/[id]/submissions (submit response)          │
│  │ GET  /api/forms/[id]/submissions (list submissions)         │
│  │ DELETE /api/forms/[id]/submissions/[submissionId]           │
│  │ POST /api/forms/[id]/upload (file upload to R2)             │
│  │ GET  /api/forms/[id]/files/[key] (serve uploaded files)     │
│  │ POST /api/upload/banner   (banner upload to R2)             │
│  │ POST /api/auth/login                                      │
│  │ POST /api/auth/signup                                     │
│  │ POST /api/auth/logout                                     │
│  │ GET  /api/auth/me                                         │
│  └────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘

Data Flow:
  Browser → Next.js API Routes → Prisma → D1/SQLite
  File Uploads → Cloudflare R2 (FORM_UPLOADS binding)
  Emails → Resend API (non-blocking)
```

---

## Project Structure

```
form-builder/
├── prisma/
│   ├── schema.prisma          # Prisma schema (User, Session, Form, FormSubmission)
│   ├── dev.db                 # Local SQLite database
│   └── seed.js                # Database seeder
├── d1-migrations/             # D1 SQL migration files
│   └── 001_init.sql
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── layout.js          # Root layout with Providers
│   │   ├── page.js            # Homepage (HeroSection)
│   │   ├── globals.css        # Global styles, theme keyframes
│   │   ├── login/page.js      # Login page
│   │   ├── signup/page.js     # Signup page
│   │   ├── f/
│   │   │   └── [id]/page.js   # Public form page
│   │   ├── forms/
│   │   │   ├── page.js        # Forms list
│   │   │   ├── new/page.js    # New form wizard
│   │   │   └── [id]/
│   │   │       ├── edit/page.js       # Form editor
│   │   │       ├── preview/page.js    # Form preview
│   │   │       └── responses/page.js  # Submission responses
│   │   └── api/
│   │       ├── forms/
│   │       │   ├── route.js           # GET (list) + POST (create)
│   │       │   ├── [id]/
│   │       │   │   ├── route.js       # GET/PUT/DELETE single form
│   │       │   │   ├── submissions/
│   │       │   │   │   ├── route.js   # POST (submit) + GET (list)
│   │       │   │   │   └── [submissionId]/route.js  # DELETE
│   │       │   │   ├── upload/route.js     # File upload to R2
│   │       │   │   └── files/[key]/route.js # Serve files from R2
│   │       │   └── slug/[slug]/route.js    # Legacy slug lookup
│   │       ├── upload/banner/route.js  # Banner upload to R2
│   │       └── auth/
│   │           ├── login/route.js
│   │           ├── signup/route.js
│   │           ├── logout/route.js
│   │           └── me/route.js
│   ├── components/
│   │   ├── Providers.jsx           # Client wrapper (ToastProvider)
│   │   ├── home/
│   │   │   └── HeroSection.jsx     # Homepage hero with dot pattern
│   │   ├── ui/
│   │   │   ├── Toast.jsx           # Toast notification system
│   │   │   ├── Icon.jsx            # Icon system (lucide-react mapper)
│   │   │   └── Navbar.js           # Navigation bar
│   │   ├── form-builder/
│   │   │   ├── FormBuilder.jsx     # Main form builder component
│   │   │   ├── FormCanvas.jsx      # Field canvas with drag-and-drop
│   │   │   ├── FormPreview.jsx     # In-builder preview
│   │   │   ├── FormSettingsModal.jsx # Settings modal
│   │   │   ├── ThemeDrawer.jsx     # Right-side theme customization
│   │   │   ├── FieldCard.jsx       # Individual field card
│   │   │   ├── FieldTypeModal.jsx  # Field type picker
│   │   │   ├── NewFormWizard.jsx   # New form creation wizard
│   │   │   └── EditFormClient.jsx  # Edit form client wrapper
│   │   ├── form-renderer/
│   │   │   ├── FormRenderer.jsx    # Public form renderer
│   │   │   ├── FieldRenderer.jsx   # Individual field renderer
│   │   │   └── FormThemeProvider.jsx # Theme CSS variable provider
│   │   ├── submissions/
│   │   │   ├── SubmissionList.jsx   # Submission list view
│   │   │   └── SubmissionDetail.jsx # Submission detail view
│   │   └── FormsListClient.jsx     # Forms list with management
│   ├── lib/
│   │   ├── db.js               # Prisma + D1 client
│   │   ├── auth.js             # Password hashing (PBKDF2)
│   │   ├── session.js          # Session management
│   │   ├── email.js            # Resend email service
│   │   ├── form-schema.js      # Schema definitions, themes, field types
│   │   ├── form-validation.js  # Server-side validation
│   │   ├── form-templates.js   # 5 form templates
│   │   ├── slug.js             # Slug generation
│   │   └── i18n/
│   │       ├── form-translations.js  # Translation dictionary
│   │       └── form-locales.js       # Locale configuration
│   └── config/
│       └── index.js            # App config
├── wrangler.toml               # Cloudflare Workers config (D1, R2)
├── open-next.config.ts         # OpenNext Cloudflare adapter config
├── next.config.mjs             # Next.js config
├── tailwind.config.js          # Tailwind CSS config
└── package.json                # Dependencies and scripts
```

---

## Form Schema Design

Every form's complete design is stored as a **single JSON blob** in the `Form.schema` column. This makes forms fully portable and re-renderable from stored data alone.

```jsonc
{
  "version": 1,
  "settings": {
    "locale": "en-IN",                    // Form language (en-IN | hi-IN)
    "theme": {
      "font": "Inter",                    // Font family
      "pageBackground": "#F8F8FC",        // Page background color
      "cardBackground": "#FFFFFF",        // Card background color
      "text": "#171717",                  // Primary text color
      "mutedText": "#6B7280",             // Secondary text color
      "inputBackground": "#FFFFFF",       // Input field background
      "inputBorder": "#E5E7EB",           // Input field border
      "buttonBackground": "#7957FF",      // Submit button background
      "buttonText": "#FFFFFF",            // Submit button text
      "accent": "#7957FF"                 // Accent color (radio/checkbox)
    },
    "submitButtonText": "Submit",
    "successMessage": "Thank you for your response.",
    "redirectUrl": "",
    "redirectOnSubmit": false,
    "allowMultipleSubmissions": true,
    "shuffleFields": false,
    "showProgressBar": false,
    "closeFormOnDate": false,
    "closeFormDate": "",
    "closeFormOnLimit": false,
    "responseLimit": null,
    "closedFormMessage": "This form is no longer accepting responses.",
    "respondentConfirmation": {
      "enabled": false,
      "emailFieldId": null,
      "subject": "We received your response",
      "message": "Thank you for your submission."
    }
  },
  "banner": null,                         // Banner image key or null
  "fields": [
    {
      "id": "lorem-cuid-123",            // Stable unique field ID
      "type": "text",                     // Field type
      "label": "What is your name?",      // Field label
      "description": "Optional helper text",
      "placeholder": "Enter your name",
      "required": true,
      "defaultValue": "",
      // ... type-specific properties (options, min, max, etc.)
    }
  ]
}
```

Because layout is stored as data (not code), any saved form design can be re-rendered identically at any time.

---

## Supported Field Types

| Type | Description | Key Properties |
|------|-------------|----------------|
| `text` | Short text input | `minLength`, `maxLength`, `placeholder` |
| `email` | Email input with validation | `placeholder` |
| `number` | Numeric input | `min`, `max`, `step` |
| `textarea` | Multi-line text | `rows`, `minLength`, `maxLength` |
| `select` | Dropdown single-select | `options[]` |
| `multiselect` | Dropdown multi-select | `options[]`, `maxSelections` |
| `radio` | Radio button group | `options[]` |
| `checkbox` | Single checkbox | `defaultValue` |
| `date` | Date picker | `minDate`, `maxDate` |
| `time` | Time picker | — |
| `datetime` | Date & time picker | `minDateTime`, `maxDateTime` |
| `file` | File upload (R2) | `accept`, `maxSizeMB`, `maxFiles` |
| `phone` | Phone number input | `placeholder` |
| `url` | URL input with validation | `placeholder` |
| `rating` | Star rating | `maxRating` (default: 5) |

---

## Routes

### Public Routes (no authentication)

| Route | Description |
|-------|-------------|
| `/f/[id]` | Public form page — renders FormRenderer with FieldRenderer |

### Builder Routes (authentication required)

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero section |
| `/login` | Login page |
| `/signup` | Signup page |
| `/forms` | Forms list — manage all your forms |
| `/forms/new` | New form wizard — choose template or start blank |
| `/forms/[id]/edit` | Form editor — FormBuilder with live preview |
| `/forms/[id]/preview` | Form preview — full-screen preview |
| `/forms/[id]/responses` | Submission responses — list and detail views |

### API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/forms` | Yes | Create a new form |
| `GET` | `/api/forms/[id]` | No | Get published form (public) |
| `PUT` | `/api/forms/[id]` | Yes | Update form schema/settings |
| `DELETE` | `/api/forms/[id]` | Yes | Delete form and all submissions |
| `POST` | `/api/forms/[id]/submissions` | No | Submit a form response |
| `GET` | `/api/forms/[id]/submissions` | Yes | List all submissions |
| `DELETE` | `/api/forms/[id]/submissions/[submissionId]` | Yes | Delete a submission |
| `POST` | `/api/forms/[id]/upload` | No | Upload file to R2 |
| `DELETE` | `/api/forms/[id]/upload` | No | Delete file from R2 |
| `GET` | `/api/forms/[id]/files/[key]` | No | Serve file from R2 |
| `POST` | `/api/upload/banner` | Yes | Upload banner to R2 |
| `POST` | `/api/auth/login` | No | Login |
| `POST` | `/api/auth/signup` | No | Signup |
| `POST` | `/api/auth/logout` | Yes | Logout |
| `GET` | `/api/auth/me` | Yes | Get current user |

---

## Form Lifecycle

```
1. Create (Wizard)
   POST /api/forms → form row created with status: "draft"
   → redirect to /forms/[id]/edit

2. Build (Editor)
   FormBuilder loads form from DB
   → add/edit/reorder/duplicate/remove fields
   → auto-saves to PUT /api/forms/[id] (debounced)
   → live preview via FormPreview

3. Customize Theme
   ThemeDrawer opens → font + color pickers
   → theme stored in settings.theme
   → applied via FormThemeProvider (CSS variables)

4. Configure Settings
   FormSettingsModal → submit text, success message, progress bar,
   response limit, close conditions, email notifications, locale

5. Publish
   PUT /api/forms/[id] { status: "published" }
   → slug auto-generated if missing
   → public URL active at /f/[id]

6. Collect Responses
   Respondent visits /f/[id] → FormRenderer renders form
   → client validation → POST /api/forms/[id]/submissions
   → server validation → store in FormSubmission table
   → email notifications sent (non-blocking)

7. View Responses
   Owner visits /forms/[id]/responses
   → SubmissionList shows all responses
   → SubmissionDetail shows field-by-field breakdown
   → individual submissions can be deleted

8. Unpublish (optional)
   PUT /api/forms/[id] { status: "draft" }
   → public URL returns 404
```

---

## Persistence

### Local Development

- **Database**: SQLite via Prisma (`prisma/dev.db`)
- **Connection**: `DATABASE_URL=file:./dev.db` in `.env`
- **Client**: `src/lib/db.js` detects `DATABASE_URL` and uses standard Prisma SQLite adapter

### Production (Cloudflare)

- **Database**: Cloudflare D1 (serverless SQLite)
- **Adapter**: `@prisma/adapter-d1` with `PrismaD1(env.DB)` binding
- **Client**: `src/lib/db.js` uses `getCloudflareContext()` + `PrismaD1` adapter
- **Bucket**: Cloudflare R2 (`FORM_UPLOADS` binding) for file uploads

### Data Flow

1. Form created → row in `Form` table with `schema` as JSON string
2. Editor auto-saves → `PUT /api/forms/[id]` updates `schema`, `title`, `description`
3. Form published → `status` set to `"published"`, `slug` auto-generated
4. Response submitted → row in `FormSubmission` table with `response` as JSON string
5. Editor reloads → reads `Form` row, parses `schema` JSON, renders FormBuilder

---

## Authentication & Security

### Session Management

- **Token**: Random session token stored in `Session` table
- **Cookie**: `auth_session` (httpOnly, secure, sameSite: lax)
- **Duration**: 30 days
- **Cleanup**: Expired sessions pruned on authentication checks

### Password Hashing

- **Algorithm**: PBKDF2 with SHA-256
- **Iterations**: 100,000
- **Salt**: 16-byte random salt per password
- **Format**: `{iterations}:{salt}:{hash}` stored in `passwordHash`

### Route Protection

- `src/middleware.js` protects `/forms/*` routes
- Public paths: `/f/*`, `/api/forms/[id]/submissions` (POST), `/api/forms/[id]/files/*`
- API routes check session token via `getUserFromRequest()`
- Form operations verify ownership before allow

### File Upload Security

- Server-side file type validation (accept list)
- Server-side file size limit (25MB max, configurable per field)
- Filenames sanitized (alphanumeric, dots, hyphens, underscores only)
- Upload keys scoped to form ID (`uploads/{formId}/{uuid}.{ext}`)

---

## Email Notifications

### Setup

- **Provider**: Resend
- **Env vars**: `RESEND_API_KEY`, `EMAIL_FROM`
- **Graceful degradation**: If `RESEND_API_KEY` is empty, submissions still save; emails are skipped

### Types

1. **Admin Notification** — sent to configured `notificationEmails` addresses
   - Subject: `New submission: {formSubject}`
   - Contains: form title, field labels and values, submission time

2. **Respondent Confirmation** — sent to the email field value in the response
   - Configurable in Form Settings → Respondent Confirmation
   - Requires: enable toggle + select which email field to use
   - Subject and message customizable

### Implementation

- `src/lib/email.js` — `sendAdminNotification()` and `sendRespondentConfirmation()`
- Emails sent non-blocking (`.catch(() => {})`) — never blocks the submission response

---

## Cloudflare Deployment

### Prerequisites

- Cloudflare account
- Wrangler CLI authenticated (`npx wrangler login`)

### Setup Steps

1. **Create D1 database:**
   ```bash
   npx wrangler d1 create tally-form-builder
   ```

2. **Update `wrangler.toml`** with returned `database_id`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "tally-form-builder"
   database_id = "YOUR_D1_DATABASE_ID"
   ```

3. **Create R2 bucket:**
   ```bash
   npx wrangler r2 bucket create form-builder-uploads
   ```

4. **Apply migrations:**
   ```bash
   npm run db:migrate:remote
   ```

5. **Deploy:**
   ```bash
   npm run deploy
   ```

### Windows Deployment Note

The `opennextjs-cloudflare build` command may fail on Windows with `EPERM: Permission denied` due to symlinks in `.open-next/`. Fix:

```powershell
taskkill /F /IM node.exe 2>$null; Start-Sleep -Seconds 3
cmd /c "rmdir /s /q D:\web\form-builder\.open-next" 2>$null
npm run deploy
```

Or run `npm run deploy` from an **admin PowerShell**.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Local only | SQLite file path (`file:./dev.db`) — used by Prisma CLI |
| `RESEND_API_KEY` | No | Resend API key for email notifications |
| `EMAIL_FROM` | No | Sender address for notification emails |
| `NEXT_PUBLIC_BASE_URL` | Recommended | Public base URL (defaults to `http://localhost:3000`) |

**Cloudflare bindings** (configured in `wrangler.toml`, not env vars):

| Binding | Type | Description |
|---------|------|-------------|
| `DB` | D1 Database | Form and submission data |
| `FORM_UPLOADS` | R2 Bucket | File and banner uploads |

---

## Local Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed demo data
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start local dev server (port 3001) |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run deploy` | Build & deploy to Cloudflare Workers |
| `npm run preview` | Build & preview as Cloudflare Worker locally |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:migrate` | Apply D1 migrations locally |
| `npm run db:migrate:remote` | Apply D1 migrations to production |
| `npm run db:inspect` | Inspect D1 database contents |

---

## Database Schema

### User

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | CUID |
| `email` | TEXT (unique) | Login email |
| `name` | TEXT | Display name |
| `passwordHash` | TEXT | Hashed password (PBKDF2) |
| `createdAt` | DATETIME | Creation timestamp |
| `updatedAt` | DATETIME | Last update timestamp |

### Session

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | CUID |
| `userId` | TEXT (FK) | References User.id (cascade delete) |
| `token` | TEXT | Session token |
| `expiresAt` | DATETIME | Expiry (30 days) |
| `createdAt` | DATETIME | Creation timestamp |

### Form

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | CUID |
| `title` | TEXT | Form title |
| `slug` | TEXT (unique) | Auto-generated on first publish |
| `description` | TEXT | Form description |
| `schema` | TEXT | JSON form schema (see [Form Schema](#form-schema-design)) |
| `status` | TEXT | `draft` or `published` |
| `userId` | TEXT (FK) | Owner (cascade delete) |
| `createdAt` | DATETIME | Creation timestamp |
| `updatedAt` | DATETIME | Last update timestamp |

### FormSubmission

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | CUID |
| `formId` | TEXT (FK) | References Form.id (cascade delete) |
| `response` | TEXT | JSON response keyed by field ID |
| `createdAt` | DATETIME | Submission timestamp |

---

## Localization

- Forms carry a `settings.locale` (default `en-IN`), selectable in the editor's form settings
- System-generated UI text (validation errors, submit button, success messages, placeholders) is resolved through `src/lib/i18n/form-translations.js`
- Translation helper: `t(key, locale, params)` with `{param}` interpolation
- **User-authored content is never translated** — field labels, descriptions, and option labels render exactly as written
- Current locales: `en-IN` (English), `hi-IN` (Hindi)
- Adding a locale = adding a dictionary block; no structural changes needed

---

## Responsive Design

- Built with Tailwind responsive utilities (`sm:`, `md:`, `lg:`)
- Dedicated compact navigation for small screens in `Navbar.js`
- Builder, settings modal, preview, public form, and responses all use fluid containers
- Touch device support: row actions are `opacity-100` below `md` breakpoint
- Public form rendered in centered `max-w-lg` card for mobile readability
- ThemeDrawer is a right-side slide-out panel (320px) — preview stays visible for live editing

---

## Validation

### Client-Side (FormRenderer)

- Instant feedback on blur/submit
- Localized error messages via form locale
- Validates: required, email format, URL format, number range, min/max length, option membership, max selections, rating value, file size/type

### Server-Side (form-validation.js)

- `validateFormResponse(schema, response)` — validates all fields against schema
- Checks: required fields, type correctness, option membership, min/max values, length constraints
- Returns `{ valid: boolean, errors: { [fieldId]: string } }`
- Called before creating FormSubmission row

### Schema Validation (form-schema.js)

- `validateFormSchema(schema)` — validates form structure before save/submit
- Checks: version exists, fields array, unique field IDs, valid field types, option labels/values

---

## Error Handling

- **API Routes**: All endpoints return `{ success: boolean, error?: string }` structure
- **HTTP Status Codes**: 400 (validation), 401 (unauthorized), 403 (forbidden/closed), 404 (not found), 413 (file too large), 415 (unsupported type), 500 (server error), 503 (service unavailable)
- **Toast Notifications**: Non-intrusive success/error/warning feedback for all user actions
- **Graceful Degradation**: Email failures don't block submissions; R2 unavailable returns 503 for uploads; local dev without wrangler still works for core features
- **Form Closed States**: Server-side checks for close-on-date and close-on-limit return 403 with custom message

---

## Performance

- **Turbopack**: Next.js 16 with Turbopack for fast dev builds
- **Debounced Auto-Save**: Editor saves are debounced to avoid excessive API calls
- **Non-Blocking Emails**: Email notifications sent with `.catch(() => {})` — never blocks response
- **Lazy Loading**: FormRenderer/FieldRenderer use client-side rendering for interactivity
- **CSS Variables**: Theme applied via CSS custom properties — no re-render on theme change
- **Compact Bundle**: Only lucide-react icons actually used are bundled (tree-shaking)
- **D1 Edge**: Production database runs at Cloudflare edge for low latency globally

---

## Design Decisions

1. **ID-based public URLs** (`/f/{id}`) — slugs are for uniqueness/URL compatibility but public routes use IDs for simplicity
2. **Single JSON blob schema** — entire form design stored in one column; portable, re-renderable, no join queries needed
3. **Form row created upfront** — wizard creates a real DB row immediately; no orphaned local drafts
4. **Published-only public access** — drafts return 404 on public routes
5. **Non-blocking emails** — Resend calls never block submission responses
6. **Theme as CSS variables** — FormThemeProvider maps theme tokens to CSS custom properties; no component re-renders needed
7. **Right-side ThemeDrawer** — no backdrop, preview stays visible for live editing
8. **Field IDs are stable** — generated once, never change; submissions reference them permanently
9. **Cascade deletes** — deleting a user deletes their sessions and forms; deleting a form deletes its submissions
10. **Cookie-based auth** — simple httpOnly cookie with server-side session validation; no JWT complexity

---

## License

Private project. All rights reserved.
