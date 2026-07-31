# 📲 PayQR — Instant Mobile-First UPI QR & Merchant Placard Generator

A state-of-the-art, 100% client-side **Progressive Web App (PWA)** designed to generate styled UPI payment QR codes and comprehensive merchant payment placards instantly. Built entirely with vanilla web technologies—no backends, no databases, and zero tracking.

---

## 🌟 Key Features

- **🎨 Merchant Payment Placards:** Dynamically generates a clean, professional payment card that places your **Name** and **UPI ID** at the top of the QR code and embeds **numbered scanning steps & WhatsApp instructions** directly at the bottom.
- **⚡ 100% Offline & Client-Side:** Operates entirely inside your browser. No KYC, no external payment server processing, and zero third-party data tracking—your information stays entirely on your device.
- **📱 Progressive Web App (PWA):** Equipped with a customized `manifest.json` and offline Service Worker (`sw.js`). Can be installed directly onto Android and iOS home screens, functioning completely offline without an active internet connection.
- **📤 Native WhatsApp & Image Sharing:** Leverages the modern **Web Share API** and HTML5 Canvas API to construct and export **2x HD resolution (Retina-ready)** composite PNG images that users can share directly to WhatsApp, Telegram, or email with a single tap.
- **💾 Local Storage Profile Saving:** Optionally remembers your name and UPI ID in browser local storage, making repeated QR generation effortless.
- **✨ Premium Dark Mode Aesthetics:** Crafted with a modern dark mode design system (`#0a0a0f` deep canvas, `#00B86B` vibrant UPI green accents), sleek micro-animations, and touch-optimized input targets.

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
