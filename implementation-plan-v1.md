# 🏗️ Implementation Plan — UPI QR Code Generator PWA

## File Structure
```
upi/
├── index.html          # Main app page
├── styles.css          # Mobile-first CSS
├── app.js              # Core logic (QR generation, sharing, profile saving)
├── manifest.json       # PWA manifest
├── sw.js               # Service worker for offline support
└── icons/
    ├── icon-192.png    # PWA icon
    └── icon-512.png    # PWA icon
```

## Tech Stack
- **HTML5** + **CSS3** + **Vanilla JS**
- **QR Library**: `qr-code-styling` via CDN (supports branded/styled QR)
- **No backend** — everything client-side
- **localStorage** — for saving UPI profile

## Build Phases
1. Create `index.html` with mobile-first layout
2. Create `styles.css` with premium dark theme + UPI green accent
3. Create `app.js` with QR generation, download, WhatsApp share
4. Create `manifest.json` + `sw.js` for PWA
5. Generate PWA icons
6. Test on mobile

## Design Decisions
- Dark theme with UPI green (#00B86B) accent
- Single-page, no scroll needed on mobile
- Large input fields and buttons (thumb-friendly)
- QR appears with animation after generation
- Google Font: Inter or Outfit
