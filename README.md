# Vibe Stayz

Next.js 16 App Router, TypeScript, Tailwind CSS 4 and Supabase resort-discovery site with a server-rendered administration CMS. The existing visual design, routes, content model and browser interactions are retained. There are no customer accounts, booking engine, live availability or payments.

## Supabase setup

1. Create a Supabase project.
2. In the project dashboard, open **SQL Editor**, paste `supabase/migrations/20260911000000_initial_schema.sql`, and run it once. This creates the content tables, enables Row Level Security, and creates the public `media` Storage bucket.
3. Open **Project Settings → Data API** and copy the Project URL and server secret/service-role key.
4. Copy `.env.example` to `.env.local` and fill in the values below.

The app only accesses Supabase from Next.js Server Components and Route Handlers. `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS, so it must remain a server-only Vercel environment variable and must never be named with a `NEXT_PUBLIC_` prefix.

If you use the Supabase CLI instead of the SQL Editor, authenticate and link the project, then run `npm run db:push`.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | Yes | Supabase project URL, such as `https://project-ref.supabase.co`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only Supabase secret/service-role key used for database and Storage access. |
| `SUPABASE_STORAGE_BUCKET` | No | Storage bucket name. Defaults to `media`; the migration creates this bucket. |
| `ADMIN_USERNAME` | No | CMS login username. Defaults to `admin`. |
| `ADMIN_PASSWORD_HASH` | Yes for `/admin` | PBKDF2-SHA256 password hash in `salt:hex` format. The plaintext password is never stored. |
| `DEMO_MODE` | No | Set to `true` only when initially loading the included sample locations, stays, offers and testimonial. Use `false` for a clean production collection. |
| `SITE_ORIGIN` | Yes in production | Canonical site origin. Locally use `http://localhost:3000`; in Vercel use the final `https://…` domain without a trailing slash. |

Generate an admin password hash without saving the plaintext password in the repository:

```bash
read -s "ADMIN_PASSWORD?Admin password: "
export ADMIN_PASSWORD
node -e "const c=require('node:crypto');const s=c.randomBytes(16).toString('hex');console.log(s+':'+c.pbkdf2Sync(process.env.ADMIN_PASSWORD,s,100000,32,'sha256').toString('hex'))"
unset ADMIN_PASSWORD
```

Copy the printed value into `ADMIN_PASSWORD_HASH`. If credentials are rotated, delete rows from `admin_sessions` in Supabase to revoke existing logins.

## Run locally

```bash
npm ci
cp .env.example .env.local
# Fill in the real Supabase and admin values in .env.local
npm run dev
```

Open `http://localhost:3000`. The CMS is at `http://localhost:3000/admin`.

Useful checks:

```bash
npm run check
npm run build
npm start
```

## Deploy to Vercel

Import the GitHub repository in Vercel and add the same environment variables under **Project Settings → Environment Variables** for Production and Preview. Change `SITE_ORIGIN` to the production custom domain. Vercel detects Next.js automatically and runs `npm run build`.

The Vercel CLI is not installed globally on this machine. Installing it with `npm i -g vercel` enables `vercel env pull`, `vercel deploy`, and `vercel logs`; the dashboard workflow works without it.

## Content and launch notes

- `/admin` manages resorts, locations, amenities, offers, guest stories, attractions, navigation, site sections, settings and Supabase-hosted media.
- Browser-side uploads are resized to a maximum 1920px long edge and encoded as WebP before the server validates and uploads them to Supabase Storage.
- `DEMO_MODE=true` controls whether sample records are inserted on the first empty database initialization. The **Show sample collection** setting controls whether those rows are publicly visible later.
- Before launch, add the real WhatsApp number, phone, email, address and hours; replace or remove sample content; turn off **Show sample collection**; and set the final `SITE_ORIGIN`.
- Filtered resort pages and sample/detail previews are `noindex`. The dynamic `robots.txt` and `sitemap.xml` reflect the launch state.

## Architecture

- `src/app/` contains the Next.js App Router pages, protected admin routes and Route Handlers.
- `src/services/data.ts` reads and assembles the public/admin view models through the server-only Supabase client.
- `src/lib/seed.ts` inserts the base page/navigation content and optional sample collection into an empty Supabase project.
- `supabase/migrations/` contains the cloud database and Storage schema.
- `src/styles/` contains the original site, property and admin CSS. The migration does not redesign those styles.

Admin sessions use an HTTP-only, Secure-in-production, SameSite=Strict cookie and expire after eight hours. Mutating admin requests require a matching Origin and CSRF token.
