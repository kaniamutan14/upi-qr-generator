# Implementation Plan v7: Mobile Optimization, WhatsApp Toggle, & Client-Side URL Routing

## Executive Summary
This document defines the technical execution plan to upgrade the **UPI QR Generator** app across three key areas:
1. **Client-Side URL Hash Routing**: Transforming modal overlays into bookmarkable, navigation-friendly URL states (`#/profiles`, `#/ledger`, etc.) that natively support the mobile Back-button gesture without kicking users out of the application.
2. **WhatsApp Sharing Instructions Toggle**: Adding a persistent switch (saved in `localStorage`) to optionally include an upgraded, detailed multi-method payment instruction guide when sharing bills via WhatsApp.
3. **Mobile Font Size Scaling & Horizontal Scroll Elimination**: Converting rigid typography and layout constraints into flexible, wrapped containers that gracefully handle zoomed fonts and eliminate horizontal scroll on mobile devices (particularly on the Profile Manager & Smart Catalog page).

---

## Phase 1: Client-Side URL Routing Architecture

### Objectives
- Enable device Back-button support on mobile devices when viewing modals (Profile Manager, Ledger, Backup, Onboarding).
- Support deep linking and bookmarking for direct navigation (e.g. `https://domain.com/#/profiles`).
- Preserve current QR form inputs and bill state without triggering page reloads.

### Implementation Details in `src/scripts/app.js`
1. **Hash Mapping**:
   - `#/profiles` $\rightarrow$ Open Profile Manager Modal (Profiles Tab)
   - `#/catalog` $\rightarrow$ Open Profile Manager Modal (Smart Catalog Tab)
   - `#/ledger` $\rightarrow$ Open Bill Ledger Modal
   - `#/backup` $\rightarrow$ Open Workspace Backup Modal
   - `#/onboarding` $\rightarrow$ Open Onboarding Modal
   - Empty hash (`""` or `"#"`) $\rightarrow$ All modals closed; view main QR Dashboard.

2. **Router Listener & Controller**:
   - Add a central `window.addEventListener('hashchange', handleHashChange)` function.
   - Replace direct `.classList.remove('hidden')` and `.classList.add('hidden')` calls on modal triggers with location hash modifications (e.g. `window.location.hash = '#/profiles'`).
   - When a user clicks any modal close button (`✕`) or clicks outside on the modal backdrop, execute `history.back()` (if a history entry exists from opening) or set `window.location.hash = ''`.
   - Run `handleHashChange()` on DOMContentLoaded to automatically open targeted views on initial load if a hash is present in the URL.

---

## Phase 2: WhatsApp Sharing Toggle & Detailed Instructions

### Objectives
- Add a clean user interface switch controlling whether scanning instructions are attached to shared WhatsApp messages.
- Persist toggle choice across user sessions using `localStorage` (`upi_wa_include_instructions`).
- Upgrade instruction text to cover both direct share and photo gallery uploading methods.

### Implementation Details
1. **UI Component (`src/components/QrDisplay.astro`)**:
   - Above or alongside `#whatsappBtn`, inject a modern toggle switch component:
     ```html
     <div class="wa-toggle-wrapper">
       <label class="switch-pill-label" for="toggleWaInstructions">
         <input type="checkbox" id="toggleWaInstructions" class="switch-input" checked>
         <span class="switch-slider"></span>
         <span class="switch-text">Include payment instructions in message</span>
       </label>
     </div>
     ```
2. **Logic & Persistence (`src/scripts/app.js`)**:
   - On load, read `localStorage.getItem('upi_wa_include_instructions')`. If null, default to `true`. Set checkbox checked property accordingly.
   - Listen for `change` events on `#toggleWaInstructions` and store boolean status in `localStorage`.
   - In `shareWhatsApp()`, conditionally append the instruction guide based on toggle state.
   - **New Detailed Instruction Guide**:
     ```text
     📲 *How to Pay from This Phone:*
     
     *Method 1: Direct Share (Fastest)* ⚡
     1️⃣ Tap the photo above to view full screen.
     2️⃣ Tap the Share icon (or three dots ⠇ at the top right).
     3️⃣ Select GPay, PhonePe, Paytm, or your UPI app from the list to pay immediately!
     
     *Method 2: Scan via Gallery* 🖼️
     1️⃣ Save/download this picture to your Gallery.
     2️⃣ Open your preferred UPI app (GPay / PhonePe / Paytm / BHIM).
     3️⃣ Tap 'Scan QR' on the app home screen.
     4️⃣ Tap the 'Gallery' / 'Upload from Photos' icon and select this saved picture!
     ```

---

## Phase 3: Mobile Font Scaling & Profile Horizontal Scroll Fix

### Objectives
- Prevent text clipping and horizontal screen blowout when device font size is magnified or scaled up on mobile.
- Completely eliminate horizontal scrolling on the Profile Manager modal and Smart Catalog tab.

### Implementation Details (`src/styles/styles.css`)
1. **Intelligent Text Wrapping (Replacing Rigid `nowrap`)**:
   - Audit and override rigid `white-space: nowrap;` rules on mobile screens (`@media (max-width: 640px)`).
   - Apply flexible wrapping to list item names, tab labels, headers, and catalog entries:
     ```css
     .cat-item-name, .pli-label, .tab-btn {
       white-space: normal !important;
       overflow-wrap: anywhere;
       word-break: break-word;
     }
     ```
2. **Profile Manager & Logo Upload Mobile Optimization**:
   - Restrict file inputs and upload wrappers from exceeding container widths:
     ```css
     .logo-upload-wrapper {
       max-width: 100%;
       box-sizing: border-box;
       overflow: hidden;
     }
     .file-input-custom {
       max-width: 100%;
       text-overflow: ellipsis;
       overflow: hidden;
     }
     ```
   - Inside `@media (max-width: 640px)`:
     - Convert `.logo-upload-wrapper` to vertical flex stacking (`flex-direction: column; align-items: stretch;`).
     - Convert `.modal-form-actions` to stack Save and Delete buttons vertically (`flex-direction: column; gap: 10px;`).
     - Ensure `.profiles-split-view`, `.profile-edit-pane`, and `.profiles-sidebar` enforce `min-width: 0; max-width: 100%;` on all grid/flex children.
3. **Global Overflow Shielding**:
   - Ensure `html`, `body`, and main wrapper containers maintain clean horizontal boundaries without unintended X-scrollbars while keeping vertical scroll smooth and native.

---

## Verification & Testing Strategy
1. **Responsive Testing**: Verify mobile viewport rendering with varied text zoom levels, ensuring zero horizontal scrollbars on the Profile and Catalog tabs.
2. **Routing Verification**: Test navigation between modal views using browser Forward/Back navigation and direct URL hash loading (`#/profiles`).
3. **Persistence Verification**: Confirm that toggling the WhatsApp instruction setting correctly updates `localStorage` and dynamically alters the shared text payload.
