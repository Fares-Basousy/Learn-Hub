# Learn Hub

A bilingual (Arabic/English) operations hub for a tutoring/distribution center: a public landing page with a class timetable, partner-organization directory, and news feed, plus an authenticated back office for managing students, partner organizations, book/code inventory, sales, and news.

> 📸 _Screenshots coming soon._
>
> | Landing page | Timetable (public) | Dashboard |
> | :---: | :---: | :---: |
> | `![Landing page](docs/screenshots/landing.png)` | `![Timetable](docs/screenshots/timetable.png)` | `![Dashboard](docs/screenshots/dashboard.png)` |
>
> | Organizations | Students | Sales |
> | :---: | :---: | :---: |
> | `![Organizations](docs/screenshots/organizations.png)` | `![Students](docs/screenshots/students.png)` | `![Sales](docs/screenshots/sales.png)` |
>
> Drop image files into `docs/screenshots/` with the names above and the placeholders will render.

## Features

**Public site**

- Landing page with a browsable-by-grade class timetable, a partner-organizations showcase (admin-ordered), and a news feed
- Contact page with an embedded map and click-to-call/WhatsApp links
- Full Arabic/English localization with automatic RTL layout, defaulting to Arabic

**Back office** (behind login)

- **Dashboard** — at-a-glance counts, recent sales, and recent news
- **Organizations** — CRUD for partner schools, image upload, drag-free up/down reordering that controls landing-page display order, and a per-organization inventory view
- **Inventory & restocking** — track access-code and book counts per organization/grade, scoped to the editions that organization actually carries, with support for creating brand-new book editions inline
- **Students** — CRUD with paginated search/filtering by organization or grade; a student can belong to zero, one, or many organizations
- **Sales** — record multi-item sales (codes and/or books, across multiple organizations in one transaction) with automatic inventory deduction and low-stock guards; optionally register a new student in the same flow
- **Timetable editor** — per-classroom, per-day scheduling with overlap detection and configurable session length (minimum 1.5 hours)
- **News editor** — publish/edit/delete news posts with image upload and optional external links
- Organization deletion is non-destructive to history: students and sale records are preserved even after their organization is removed

## Technologies used

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack) + [React 19](https://react.dev/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) primitives + [lucide-react](https://lucide.dev/) icons
- **Database**: PostgreSQL via [Prisma ORM 7](https://www.prisma.io/) (`@prisma/adapter-pg`), hosted on [Neon](https://neon.tech/) in this deployment
- **Auth**: [NextAuth.js v5](https://authjs.dev/) (credentials provider, JWT sessions)
- **File storage**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for uploaded images
- **Validation**: [Zod](https://zod.dev/)
- **Hosting**: [Vercel](https://vercel.com/)

## Environment variables

Copy [`.env.example`](./.env.example) to `.env` and fill in real values. All four are required:

| Variable | Purpose |
| --- | --- |
| `postgresql` | Postgres connection string, read by the Prisma CLI (`prisma.config.ts`) for migrations/build |
| `DATABASE_URL` | Postgres connection string, read by the app's runtime client (`src/lib/prisma.ts`) |
| `NEXTAUTH_SECRET` | Signs/encrypts NextAuth session JWTs — generate with `openssl rand -base64 64` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for uploaded organization/news images |

> `postgresql` and `DATABASE_URL` must point at the **same** database — this repo reads the connection string under two different variable names in two different places, so both need to be set.

## Setup guide

### Prerequisites

- Node.js 20+ and a package manager (`pnpm`, `npm`, or `yarn`)
- A PostgreSQL database (e.g. a free [Neon](https://neon.tech/) project)
- A [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) store (only needed for image uploads)

### Local development

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment variables
cp .env.example .env
# then edit .env with real values

# 3. Apply database migrations
npx prisma migrate deploy

# 4. Seed fake data (users, organizations, students, sales, news, timetable)
pnpm seed

# 5. Start the dev server
pnpm dev
```

The app runs at `http://localhost:3000`. The seed script creates three login users, all with the password `password123`:

- `admin@school.local`
- `sales@school.local`
- `desk@school.local`

To create additional users without a public sign-up flow:

```bash
pnpm create-user "Full Name" email@example.com "01000000000" "a-strong-password"
```

### Deploying to production

1. Push the repo to GitHub and import it into [Vercel](https://vercel.com/new).
2. Add the four environment variables above under **Project Settings → Environment Variables** (Production + Preview).
3. Run `npx prisma migrate deploy` against the production database (locally with production `DATABASE_URL`/`postgresql`, or as a Vercel deploy step) before or after the first deploy — migrations are not run automatically on build.
4. Deploy. Vercel builds with `next build` and serves via `next start` automatically.

## Project structure

```
prisma/                  Schema, migrations, seed script
src/app/                 Next.js App Router pages
  (authenticated)/       Back-office pages (behind login)
  page.tsx               Public landing page
  login/, contact/       Other public pages
src/components/          Shared UI components
src/lib/actions/api/     Server actions (data layer, grouped by domain)
src/lib/                 Types, i18n strings, shared utilities
src/generated/prisma/    Generated Prisma Client (checked in)
```
