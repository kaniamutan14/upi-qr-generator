# Implementation Plan v6: Final UI/UX, Typography Scaling & Theme Architecture

## 1. Aligned Design Specifications (from /grill-me Interview)
1. **Header Navigation De-duplication:** 
   - Remove the redundant Profile switcher pill (`#activeProfileBtn`) and Gear Icon (`#btnOpenProfileManager`) from `Header.astro`. 
   - Retain only core utility actions: Smart Catalog 📦, Recent Invoices 📜, and Backup/Export 📤.
2. **Account Banner as Interactive Hub:**
   - Upgrade `AccountBanner.astro` to be the sole trigger for switching and managing profiles.
   - Embed interactive **Theme Toggle** (`[☀️ Light / 🌙 Dark]`) and **Font Size Adjuster** (`[ A- | A+ ]`) controls directly within the bottom toolbar of the banner card.
3. **Emerald Slate Default Light Theme:**
   - Set `:root` custom properties in `styles.css` to a high-contrast modern light theme (Background: `#f8fafc`, Surface Cards: `#ffffff` with soft elevation shadow `0 10px 25px -5px rgba(0,0,0,0.05)`, Border: `#e2e8f0`, Accent: `#059669`).
   - Define `[data-theme="dark"]` preserving the original premium dark colors.
   - Persist active theme and font size preferences in `localStorage`.
4. **Safe Dynamic Font Scaling:**
   - Define a root font scaling variable and class/style mechanism supporting 4 safe presets: Small (`14px`), Default (`16px`), Large (`18px`), XL (`20px`).
   - Convert hardcoded `height` rules on inputs/buttons to `min-height` and add flex/grid wrapping (`flex-wrap: wrap`) across card containers to guarantee layout stability without clipping at larger font sizes.
5. **Mobile Form & Keyboard Ergonomics:**
   - Replace standard `type="number"` with `type="text" inputmode="numeric"` for quantity and `inputmode="decimal"` for prices in both `QrForm.astro` and itemized row generation (`renderItemRows` in `app.js`).
   - Add auto-selection on focus (`input.select()`) so tapping default values instantly selects the text for seamless typing without manual backspacing.
   - Preserve empty string (`""`) during active inputs, falling back to minimum default values only on `blur`.
   - On mobile breakpoints, enhance `.item-row` styling to show prominent inline prefix label badges (`[Qty]` and `[Price ₹]`).
   - Implement `enterkeyhint="next"` for seamless field-to-field keyboard navigation.
6. **Ledger Modal Scrolling, Sorting & Filtering:**
   - In `LedgerModal.astro`, lock the modal top header, analytics ribbon, and filter tools in a non-scrollable sticky header (`flex-shrink: 0`).
   - Restructure `.revenue-analytics-bar` into a sleek horizontal strip on mobile (< 70px height) to prevent viewport blocking.
   - Make `.ledger-list-wrapper` a dedicated scroll container (`flex: 1; overflow-y: auto`).
   - Add Sorting Controls (*Newest*, *Oldest*, *Amount: High to Low*, *Amount: Low to High*) and Quick Filter Pills (*All*, *Today*, *This Month*, *High Value*).
7. **Clean Modal Separation:**
   - Remove the Profile Settings tab when opening the Smart Catalog modal so inventory management stays decoupled from account settings.
8. **Print Contrast Safety:**
   - Enhance `@media print` rules to force custom property overrides (`--bg: #ffffff; --surface: #ffffff; --text-primary: #000000;`) ensuring crisp white output in both light and dark modes.

---

## 2. Execution Sequence
- [ ] **Step 1:** Update `AccountBanner.astro` to embed Theme and Font Size controls and streamline profile switching UI.
- [ ] **Step 2:** Update `Header.astro` to remove redundant profile pill and gear icon.
- [ ] **Step 3:** Update `QrForm.astro`, `LedgerModal.astro`, and `ProfileManagerModal.astro` for modernized inputs and layout fixes.
- [ ] **Step 4:** Replace styles in `styles.css` with default Light Theme tokens, dark theme overrides, dynamic font-scale rules, mobile input badges, and ledger layout enhancements.
- [ ] **Step 5:** Update `app.js` to handle theme/font persistence, input selection on touch (`.select()`), mobile keypad support (`inputmode`), ledger sorting/filtering, and de-duplicated modal routing.
