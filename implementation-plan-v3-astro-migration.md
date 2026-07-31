# Astro Migration Implementation Plan — PayQR Studio

## Goal Description
PayQR Studio is currently a 100% client-side Progressive Web App (PWA) constructed with vanilla HTML, CSS, and JavaScript. The current architecture places all codebase assets into three large monolithic files (`index.html` ~509 lines, `app.js` ~58KB, and `styles.css` ~42KB) without build steps or bundlers. 

This implementation plan outlines the structural migration of PayQR Studio into the **Astro** web framework utilizing Vite and the `@vite-pwa/astro` plugin. The goal is to modernize project maintainability by breaking the application into cohesive, reusable UI components (`.astro`), automating script and stylesheet minification/bundling, providing bulletproof automated Service Worker caching, and enabling future scalability (such as adding content pages, documentation, or embedding React/Svelte reactive islands).

## User Review Required
> [!WARNING]
> **Introduction of Build Steps & Node.js Requirement:**
> Currently, PayQR advertises zero Node.js dependencies and zero compilation steps in its README. Migrating to Astro will require developers and hosting environments to have **Node.js** installed, maintain `node_modules`, and run `npm run build` to output static release bundles into a `dist/` directory before hosting or deploying to GitHub Pages/static servers.

> [!IMPORTANT]
> **PWA Service Worker Transition:**
> We will replace the manually curated `sw.js` file with `@vite-pwa/astro`. This automated plugin inspects all asset hashes during production build time and dynamically generates an optimized service worker with pre-caching lists, guaranteeing flawless offline capabilities without cache expiration bugs.

## Open Questions
> [!NOTE]
> 1. **Component State vs. Global Script:** Should we initially import the current `app.js` into our core layout as a unified script module for maximum zero-regression backward compatibility, or would you prefer a deeper, phase-by-phase refactor breaking `app.js` logic into isolated component-level scripts using standard custom event emitters or lightweight state libraries like `nanostores`? *(Recommendation: Start with importing `app.js` globally during Phase 1 migration to guarantee identical runtime behavior, then systematically modularize scripts in Phase 2).*
> 2. **Tailwind CSS Inclusion:** Since Astro pairs beautifully with modern styling engines, do you want to keep our existing custom design tokens and pure Vanilla CSS, or eventually adopt Tailwind CSS? *(Default: Maintain our elegant high-performance custom Vanilla CSS design system without external CSS frameworks).*

---

## Proposed Changes

We will restructure the flat workspace repository into an industry-standard Astro project organization:

```
D:\kaniamutan\Desktop\antigravity folder\upi\
├── public\                     # Static unbundled assets
│   ├── icons\                  # PWA Apple/Android icon PNGs
│   ├── manifest.json           # App Web Manifest (or managed via vite-pwa)
│   └── favicon.ico
├── src\
│   ├── components\             # Modular Astro UI building blocks
│   │   ├── Header.astro        # Navigation bar, branding logo, catalog triggers
│   │   ├── AccountBanner.astro # Merchant Profile switcher & account details card
│   │   ├── QrForm.astro        # Amount, Notes, and QR action inputs
│   │   ├── QrDisplay.astro     # Live QR Canvas container, share buttons & placards
│   │   └── modals\
│   │       ├── CatalogModal.astro  # Smart Item Catalog menu
│   │       ├── LedgerModal.astro   # Recent Invoices history ledger
│   │       └── BackupModal.astro   # JSON backup & accounting exporter
│   ├── layouts\
│   │   └── MainLayout.astro    # Global SEO meta tags, fonts, PWA headers & wrapper
│   ├── scripts\
│   │   ├── app.js              # Client interactivity, QR Canvas styling logic
│   │   └── qr-code-styling.js  # Vendor code (or installed via npm package)
│   ├── styles\
│   │   └── global.css          # Design system CSS variables, base styles, responsive layouts
│   └── pages\
│       └── index.astro         # Main application composition page
├── astro.config.mjs            # Astro build & PWA plugin configuration
├── package.json                # Project dependencies (astro, @vite-pwa/astro)
└── tsconfig.json               # Modern ES module tooling support
```

---

### Component Architecture & Configuration

#### [NEW] `package.json`
Initializes the Astro runtime, Vite build scripts, and official PWA integrations.
```json
{
  "name": "payqr-studio-astro",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^4.16.0",
    "qr-code-styling": "^1.8.0"
  },
  "devDependencies": {
    "@vite-pwa/astro": "^0.4.0",
    "workbox-window": "^7.1.0"
  }
}
```

#### [NEW] `astro.config.mjs`
Configures Astro for zero-JS server HTML compiling and equips `@vite-pwa/astro` for automatic Service Worker pre-caching of all static and generated build assets.
```js
import { defineConfig } from 'astro/config';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  output: 'static',
  build: {
    format: 'file'
  },
  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PayQR Studio',
        short_name: 'PayQR',
        description: 'Generate UPI payment QR codes instantly. No signup needed. Free and works offline.',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}']
      }
    })
  ]
});
```

---

### UI Decomposition (Layouts & Components)

#### [NEW] `src/layouts/MainLayout.astro`
Provides global meta tag encapsulation, Google Inter typography pre-connecting, View Transitions capabilities, and imports standard global styling.
```astro
---
import '../styles/global.css';
import { ViewTransitions } from 'astro:transitions';

interface Props {
  title?: string;
  description?: string;
}

const { 
  title = "PayQR — Instant UPI QR Code Generator", 
  description = "Generate UPI payment QR codes instantly. Enter amount, generate QR, share via WhatsApp. No signup needed. Free and works offline." 
} = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  
  <!-- SEO & PWA Title/Meta -->
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="theme-color" content="#0a0a0f" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <link rel="icon" type="image/png" href="/icons/icon-192.png" />
  <link rel="apple-touch-icon" href="/icons/icon-192.png" />

  <!-- Google Font: Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  
  <ViewTransitions />
</head>
<body>
  <div class="app-container">
    <slot />
  </div>
</body>
</html>
```

#### [NEW] `src/components/Header.astro`
Extracts top branding logo, active merchant profile pill switcher, and navigation modal activation icons into a clean modular component.
```astro
---
// Component-specific JavaScript can be enclosed in frontmatter or script tags
---

<header class="app-header">
  <div class="header-brand">
    <div class="app-logo">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="var(--accent)" fill-opacity="0.2"/>
        <rect x="6" y="6" width="8" height="8" rx="2" fill="var(--accent)"/>
        <rect x="18" y="6" width="8" height="8" rx="2" fill="var(--accent)"/>
        <rect x="6" y="18" width="8" height="8" rx="2" fill="var(--accent)"/>
        <rect x="18" y="18" width="4" height="4" rx="1" fill="var(--accent)"/>
        <rect x="24" y="18" width="2" height="8" rx="1" fill="var(--accent)"/>
        <rect x="18" y="24" width="8" height="2" rx="1" fill="var(--accent)"/>
      </svg>
    </div>
    <h1 class="app-title">PayQR <span class="badge-pro">Studio</span></h1>
  </div>

  <div class="header-controls">
    <button type="button" id="activeProfileBtn" class="btn-profile-switcher" title="Switch Profile or Manage Catalog">
      <span class="profile-dot"></span>
      <span id="activeProfileLabel">Store Checkout</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
    </button>
    <div class="nav-icons">
      <button type="button" id="btnOpenCatalogNav" class="nav-btn nav-btn-catalog" title="Smart Item Catalog & Menu" aria-label="Smart Catalog">📦</button>
      <button type="button" id="btnOpenLedger" class="nav-btn" title="Recent Invoices Ledger" aria-label="Recent Invoices">📜</button>
      <button type="button" id="btnOpenProfileManager" class="nav-btn" title="Manage Profiles & Catalog" aria-label="Profiles and Catalog">⚙️</button>
      <button type="button" id="btnOpenBackup" class="nav-btn" title="Data Backup & Accounting Export" aria-label="Data Backup">📤</button>
    </div>
  </div>
</header>
```

#### [NEW] `src/pages/index.astro`
Composes the unified UI cleanly from subcomponents without massive HTML clutter, while securely mounting client-side interactivity scripts and offline service workers.
```astro
---
import MainLayout from '../layouts/MainLayout.astro';
import Header from '../components/Header.astro';
import AccountBanner from '../components/AccountBanner.astro';
import QrForm from '../components/QrForm.astro';
import QrDisplay from '../components/QrDisplay.astro';
import CatalogModal from '../components/modals/CatalogModal.astro';
import LedgerModal from '../components/modals/LedgerModal.astro';
import BackupModal from '../components/modals/BackupModal.astro';
---

<MainLayout>
  <Header />
  
  <main class="main-content">
    <div class="form-section">
      <AccountBanner />
      <QrForm />
    </div>
    <div class="display-section">
      <QrDisplay />
    </div>
  </main>

  <!-- Interactive Overlaid Modals -->
  <CatalogModal />
  <LedgerModal />
  <BackupModal />

  <!-- Mount unified application client logic and PWA registration -->
  <script>
    import '../scripts/app.js';
  </script>
</MainLayout>
```

---

## Verification Plan

### Automated Tests
1. **Build & Asset verification:** Run local static compiling using PowerShell to verify zero syntax errors and validate that Vite successfully creates static assets and an automated service worker inside `dist/`.
   ```powershell
   npm install
   npm run build
   ```
2. **Bundle Integrity Verification:** Check that `dist/index.html` and `dist/sw.js` are properly emitted with minified JavaScript codes and precache manifest arrays.

### Manual Verification
1. **Local Dev Server Execution:**
   Launch Astro's high-speed local dev server:
   ```powershell
   npm run dev
   ```
2. **Interactive UI Walkthrough:**
   - Open `http://localhost:4321` in your web browser or connected mobile device.
   - **QR Code Generation:** Enter test amount (e.g., `₹500`) and ensure the QR Canvas live-renders seamlessly with rounded styles and green UPI accents.
   - **Placard Sharing:** Tap the WhatsApp/Share button on mobile to verify Web Share API composite image exporting operates without canvas CORS or bundle issues.
   - **Modal Functionality:** Open the Smart Item Catalog, Invoices Ledger, and Backup menu buttons to verify state preservation in `localStorage`.
3. **Offline Service Worker test (PWA):**
   - In Chrome DevTools -> Application tab -> Service Workers, check that `@vite-pwa/astro` registers successfully. 
   - Check "Offline", reload the page, and verify the app opens instantly and generates QR codes without an active network connection.
