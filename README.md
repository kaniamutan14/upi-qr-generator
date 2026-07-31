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

- **Structure & Markup:** Semantic HTML5
- **Styling & Layout:** Vanilla CSS3 (Custom Tokens, Flexbox, Safe-area padding support)
- **Logic & Rendering:** Vanilla JavaScript (ES6+) & HTML5 2D Canvas API
- **QR Engine:** [`qr-code-styling`](https://github.com/kozakdenys/qr-code-styling) for extra-rounded, customized brand QR rendering.
- **PWA Infrastructure:** Native Service Workers & Web Application Manifest

---

## 🚀 Quick Start & Local Development

No Node.js dependencies, complex bundlers, or compilation steps are required!

1. **Clone the repository:**

   ```
   git clone https://github.com/kaniamutan14/upi-qr-generator && cd "upi-qr-generator"

   ```

2. **Serve locally:**  
   Because Service Workers and the Web Share API require a trusted origin or localhost, run a simple local server (for example, using `npx serve`):
   ```bash
   npx serve -l 3000 .
   ```
3. **Open in your browser:**  
   Navigate to `http://localhost:3000` on your desktop or mobile connected to the same local WiFi network!

---

## 📜 Disclaimer & Privacy

PayQR is a local utility tool designed solely to format standard Indian UPI protocols (`upi://pay?pa=...`) into scannable QR code images and graphic placards. **PayQR is not a financial payment gateway or processor.** No funds, payment credentials, or personal identification metrics pass through any server or database.

---
