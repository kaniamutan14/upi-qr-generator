# 📲 PayQR Studio — Offline-First Payment Suite & Merchant Placard Generator

A state-of-the-art, 100% client-side **Progressive Web App (PWA) and Merchant Studio** designed to generate branded UPI payment QR codes, manage multi-profile checkouts, itemize billing invoices, and track revenue analytics offline. Built with Astro, Vite, Workbox, and pure vanilla CSS/JS—no backends, no databases, and zero external tracking.

---

## 🌟 Key Features

- **🎨 Multi-Profile Merchant Studio & Custom Branding:** Create and effortlessly switch between multiple business or checkout profiles. Customize each profile with curated theme color swatches (UPI Green, PhonePe Purple, GPay Blue, Luxury Gold, Elegant Slate, or custom hex) and upload central brand logos with automatic HTML5 Canvas compression and embedding.
- **📝 Expandable Itemized Billing & Smart Autocomplete:** Generate itemized bill breakdown tables on the fly with automatic grand total calculation and amount locking. Features an intuitive responsive card grid layout for mobile screens and an intelligent autocomplete catalog memory bank that stores and recalls frequently billed items.
- **📊 Invoice Analytics Ledger & Quick Reissue:** Maintains a capped, quota-optimized local transaction ledger with real-time cumulative daily and all-time revenue metrics. Easily re-open and duplicate past invoices with a single click for fast re-billing.
- **🛡️ Enterprise Data Security & Portability:** Complete workspace backup import/export capabilities via JSON. Hardened with comprehensive runtime type normalization, DOM XSS escaping, and industrial-grade accounting spreadsheet CSV export protected against CSV formula injection (DDE attacks).
- **⚡ 100% Offline-First Architecture:** Powered by `@vite-pwa/astro` and Workbox with local bundling of the QR styling engine (no external CDN network dependency). Installable directly onto Android and iOS home screens, loading instantaneously anywhere without internet connectivity.
- **📤 Native WhatsApp & 2x Retina Placards:** Leverages the modern **Web Share API** and Canvas API to construct and export **2x HD resolution** composite PNG placards complete with payee details, verified branding dots, and step-by-step scanning guides for one-tap sharing via WhatsApp or Email.
- **✨ Premium Glassmorphic UI:** Built with a high-performance custom vanilla CSS design system featuring touch-scrolling modals, smooth animations, safe-area adaptation, and immersive deep dark mode ergonomics (`#0a0a0f`).
---

## 🛠️ Technology Stack

- **Application framework:** Astro and Vite, compiled to a static site
- **Styling & Layout:** Vanilla CSS3 (custom tokens, Flexbox, safe-area padding support)
- **Logic & Rendering:** Vanilla JavaScript (ES6+) and HTML5 Canvas API
- **QR Engine:** [`qr-code-styling`](https://github.com/kozakdenys/qr-code-styling), bundled with the app for offline QR generation
- **PWA Infrastructure:** `@vite-pwa/astro` generated manifest and Workbox service worker

---

## 🚀 Quick Start & Local Development

Node.js 20.19+ is required for Astro.

1. **Clone the repository:**

   ```
   git clone https://github.com/kaniamutan14/upi-qr-generator && cd "upi-qr-generator"

   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Create a production build:**

   ```bash
   npm run build
   npm run preview
   ```

5. **Open in your browser:**
   Navigate to the URL printed by Astro (normally `http://localhost:4321` while developing). Production hosting should serve the generated `dist/` directory from the site root so the PWA routes resolve correctly.

---

## 📜 Disclaimer & Privacy

PayQR is a local utility tool designed solely to format standard Indian UPI protocols (`upi://pay?pa=...`) into scannable QR code images and graphic placards. **PayQR is not a financial payment gateway or processor.** No funds, payment credentials, or personal identification metrics pass through any server or database.

---
