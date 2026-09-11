# Vibe Stayz

Astro 7, TypeScript and Tailwind 4 resort discovery site with a server-rendered administration CMS. Uses the hosting platform's Cloudflare D1 relational database and R2 image storage. No customer accounts, booking engine, live availability or payments.

## Run locally

1. `npm ci`
2. Copy `.env.example` to `.dev.vars` and configure the server-only admin values. Use `DEMO_MODE=true` only for sample content.
3. `npm run db:local`
4. `npm run dev`

`npm run check` checks Astro and strict TypeScript. `npm run build` generates a Workers-compatible server and static assets, then stages the hosting manifest and migrations. The site does not need React.

## Admin credentials

There is no registration or password reset page. The administrator username and password hash are controlled by server environment configuration. The initial deployment has an individually generated credential; it is never included in source or browser JavaScript. Generate a replacement hash using Node's `crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256')`, where the salt is a random hexadecimal string. Set `ADMIN_PASSWORD_HASH` to `salt:hex`. Revoke existing sessions by clearing `admin_sessions` when rotating credentials. Production cookies require HTTPS; sign-in sessions expire after eight hours. Writes require an authenticated session, a CSRF token and a matching Origin header.

## Content management

- `/admin`: summaries and recent updates.
- Resorts: create/edit, publish/unpublish, feature, archive/restore, order, capacities, pricing notes, address visibility, SEO, WhatsApp overrides, highlights, rules, reusable amenities and gallery ordering.
- Locations: publish/unpublish, feature, order and SEO.
- Amenities, offers, testimonials and nearby attractions: create/edit/remove. Offers have inclusive UTC display dates and linked resorts, without discount calculations.
- Site content: edit the existing named sections for Home, About, Contact, Resorts, Locations and Offers. Section keys identify the layout slots; retain existing keys.
- Settings: branding, contact details, enquiry templates, social links, default SEO and sample-content visibility.
- Media: upload JPEG, PNG or WebP. Browser processing resizes to a maximum 1920px long edge and encodes WebP; the server checks size and file signatures. Gallery removal does not delete an uploaded original, so another record cannot be broken by removing a gallery image.

## Before public launch

1. Add the real WhatsApp number (country code + number, digits only), phone, email, address and business hours in Settings. No fabricated contact information ships. Until configured, WhatsApp buttons lead to Contact and the enquiry form explains that enquiries are not open.
2. Replace sample stays, guest stories, pricing and property photos with approved client content. Sample records are flagged `is_demo`. Turn off “Show sample collection” in Settings to hide them. Demo mode emits `noindex` and disallows crawling. The mode does not automatically turn off after editing one record.
3. Review and replace default page copy and generated hero/story imagery if appropriate. Provided brand assets are preserved. Real destination photographs and their licenses are listed at `/image-credits`; WebP adaptations retain the corresponding license.
4. Set `SITE_ORIGIN` to the final custom domain for canonical, sharing and property enquiry URLs.
5. Complete visual/device QA at 360, 390, 430, 768, 1024, 1280 and 1440px. Do not treat the target Lighthouse scores as measured results.

## Architecture

`src/services/data.ts` contains prepared D1 queries and public visibility filtering; `src/lib/seed.ts` isolates optional samples. Schema lives in `db/schema.ts`, with generated schema-only migrations in `drizzle/`. Admin edits write directly to persistent storage and appear on the next request. Gallery and amenity associations use relational tables and transactional batches. Private property addresses and maps are stripped from public view models when visibility is off.

All public routes render on the server. JavaScript is limited to menu/dialog interactions, sorting, sharing, contact handoff and admin forms. Native `<dialog>` provides modal focus handling. No third-party analytics or cookie banner is needed for the present feature set.

## Deployment

`.openai/hosting.json` records this Site's identity and logical `DB`/`MEDIA` bindings. Keep it with this project; do not reuse its ID for a new client project. The platform applies `drizzle/` migrations before uploading the Worker. For an independent Cloudflare deployment, configure your D1/R2 resources in `wrangler.jsonc` and deploy the Astro output. Back up production D1 and R2 data before destructive operational changes.
