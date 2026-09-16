# Discovery and offers update

## Before deploying

1. Back up the existing Supabase database. This update assumes the initial project schema already exists.
2. In the correct Supabase project's SQL Editor, run the **entire** file `supabase/migrations/20260915000000_discovery_offers_faq.sql`, including `begin`, `commit` and the schema-cache notification. Do not run only a selected fragment. This adds FAQ storage, map fields, campaign fields and the atomic offer-saving function. It does not replace resort base prices. Re-running the migration is supported.
3. Deploy the application only after that migration succeeds. Without it, the new queries can fail with a missing-table or missing-column error. Do not run the demo seed against production unless you intentionally want sample content there.
4. Keep the existing server environment variables from `.env.example`. `SITE_ORIGIN` must include `https://`, for example `https://vibe-stayz.vercel.app`. The service-role/secret key must remain server-only; never give it a `NEXT_PUBLIC_` prefix. Never copy the local QA credentials to Vercel.
5. The media uploader uses the existing Supabase bucket named by `SUPABASE_STORAGE_BUCKET` (normally `media`). Its images must be publicly readable because the app generates public image URLs. Keep upload/write access restricted to the server. This update does not require a second bucket or another database provider.
6. Smoke-test the deployed homepage, one property, admin sign-in, offer save and image upload. No production deployment or cloud database update was performed as part of this implementation.

## Managing content

- **Offers:** create or edit an existing campaign, choose its participating stays, then enter each stay's promotional price. The base price is read from the property and is never overwritten. Blank promotional prices do not discount a property. Prices must be positive and lower than the base price.
- **Destination campaigns:** choose a destination and select participating stays within it. A destination does not automatically enroll every property.
- **Scheduling:** start and end dates are inclusive, using the Asia/Kolkata calendar. An inactive campaign is disabled regardless of its dates. Scheduled and expired campaigns remain in admin history. Public pages calculate effective pricing on each request; refresh an already-open property page after a date boundary. The open homepage carousel rechecks its supplied slides periodically.
- **Conflicts:** resort-specific campaigns (no destination restriction) precede destination campaigns, then lower display order wins, then campaign ID breaks ties. Only one effective price is displayed.
- **Homepage:** enable Active and Feature on Homepage, set an image and optional mobile image, and configure the heading, subtitle and CTA. Active featured campaigns become slides; with none, the configured standard hero returns. Preview can show an inactive/scheduled campaign without publishing it.
- **Maps:** edit each resort's address, coordinate pair or valid Google Maps embed URL. Enable public address display only when appropriate. Otherwise visitors see a clearly labelled destination-area map, not private coordinates/address.
- **FAQs:** edit, publish/unpublish and reorder answers in Admin → FAQs.
- **Newest sorting:** new properties use their creation timestamp. Historical rows receive the migration timestamp because their original creation time was not stored.

## Previewing the site

- **Where:** Admin → Preview. Every list and editor screen also has a **Preview** button that opens this screen already pointed at the matching public page.
- **What it shows:** the real public pages in a frame, at mobile, tablet or full width, with the visibility filters relaxed — unpublished stays and destinations, inactive amenities, scheduled or disabled campaigns, and unpublished FAQs all appear. Everything else matches the live site: archived stays stay hidden, hidden addresses stay hidden, and the sample-content setting is respected.
- **How it works:** the Preview button calls `/api/admin/preview?path=…`, which turns on Next.js Draft Mode and hands the browser to that page. Links followed inside the frame stay in preview, so the whole site can be walked through. A banner on each previewed page confirms preview is on and offers a way out.
- **Who can see it:** only the signed-in editor's own browser. The draft cookie alone grants nothing — each request revalidates the admin session, so an expired or signed-out browser immediately drops back to the live view. Visitors, crawlers and the sitemap always get published content.
- **Turning it off:** "Exit preview" in the banner, "Turn preview off" on the preview screen, or signing out. After exiting, a page that is not published yet correctly shows the 404 a guest would get.

## Checks

```sh
npm run check
npm test
npm run build -- --webpack
```

`tests/offer-save.sql` is a transaction/rollback regression test for a **local test database** with at least one seeded property. It verifies atomic offer updates, invalid-price rejection, date validation and restricted function permissions. Do not use it as a production migration.

Completed during implementation: TypeScript, nine pricing/date/map/WhatsApp unit tests, local SQL transaction tests, and a Webpack production build. The default Turbopack build hit a sandbox port-binding restriction; the Webpack build passed without changing the project's default build command.

Browser checks covered public pages and the six demo property routes across 320, 375, 430, 768, 1024, 1280, 1440 and 1920 pixel targets, plus admin screens. These were overflow/content checks with selected screenshot reviews, not a pixel-by-pixel audit. Mobile navigation and destination filtering, FAQ expansion, admin sign-in and saving a locally priced homepage campaign were exercised. Two discovered mobile/badge layout problems were fixed and rechecked.

The remaining 48 admin route/width checks also passed. Disabling the local test campaign restored the default homepage hero and the property's ₹15,000 base price; re-enabling it succeeded. The property photo viewer opened and advanced from photo 1 to photo 2.

Still requiring release QA: real production media upload, multiple-slide timed/swipe interaction on physical devices, long-content/image-count fixtures and end-to-end WhatsApp handoff with the business's actual number. No messages were sent. The optional Endor dependency-risk check was unavailable; this is not a dependency security approval.
