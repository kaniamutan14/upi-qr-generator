# 🏗️ Implementation Plan v4 — Astro Migration & Execution

## Goal Description
Convert PayQR Studio from a monolithic vanilla HTML/CSS/JS architecture into a modular, high-performance **Astro** application powered by Vite, while preserving 100% of existing functionality from implementation plans v1 and v2 without regression.

## Design Decisions (Resolved via /grill-me)
1. **Unified Application Logic & Stylesheet:** Maintain our proven 1,592-line `app.js` and 2,237-line `styles.css` as global imports within the Astro structure to guarantee zero breakage of DOM event bindings and modal behaviors.
2. **Automated PWA Offline Pre-caching:** Equip `@vite-pwa/astro` in `astro.config.mjs` to automatically generate Workbox service workers that precache all content-hashed Javascript, CSS, HTML bundles, and icon resources.
3. **Safe Legacy Archival:** Once the migration into `src/` and `public/` is confirmed, move the original monolithic root files (`index.html`, `app.js`, `styles.css`, `sw.js`) into an `archive_vanilla/` backup folder without deleting any files from the system.

## Modular Architecture Breakdown
- `src/layouts/MainLayout.astro`: Encapsulates head SEO meta tags, fonts, stylesheets, View Transitions, and floating toast notifications.
- `src/components/Header.astro`: Brand logo, title with "Studio" pro badge, profile switching button, and navigation modal activation icons.
- `src/components/AccountBanner.astro`: Active merchant account card with dynamic logo avatar and UPI display.
- `src/components/QrForm.astro`: Amount & note inputs, expandable itemized billing table, smart autocomplete popup menu, and Generate button.
- `src/components/QrDisplay.astro`: Real-time styled QR card preview, step-by-step scanning instructions, WhatsApp sharing, and HD Retinal PNG download buttons.
- `src/components/Footer.astro`: Privacy guarantee and branding footer.
- `src/components/modals/OnboardingModal.astro`: Welcome wizard for first-time profile creation or backup restore.
- `src/components/modals/ProfileManagerModal.astro`: Two-tab management window for Profiles and Smart Autocomplete Item Catalog.
- `src/components/modals/LedgerModal.astro`: Recent invoices log with automated revenue analytics metrics and duplicate actions.
- `src/components/modals/BackupModal.astro`: JSON workspace backups and CSV accounting spreadsheet exporter.
- `src/pages/index.astro`: Assembles all UI modules cleanly and mounts client scripts.

## Verification Plan
1. Run `npm run build` to verify zero Vite syntax or bundling errors and validate that `dist/` builds correctly with an automated Service Worker (`dist/sw.js`).
2. Verify all UI components match exact DOM ID selectors expected by `src/scripts/app.js`.
