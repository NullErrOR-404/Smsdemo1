# SalonDesk — PRD-Lite (Portfolio Demo)

## 1. Product Summary
**SalonDesk** is a local-first Salon Queue, Dynamic QR Pass, and Connected ERP showcase for a modern unisex grooming studio (INR ₹, UPI/Cash/Card). It eliminates idle salon waiting by turning multi-barber queues into a live, self-recalculating departure board with a scannable Dynamic QR Pass and an automatic **15-minute "Leave Now" turn alert**.

## 2. Target Users & Core Surfaces
One unified React + Vite app with an edge-aligned top role switcher and live multi-tab synchronization (`BroadcastChannel` + `localStorage`):

1. **Customer Portal (`Book & Queue`)**
   - Full-width **Live Chair Departure Board** (3 chairs with real-time remaining minutes).
   - **Hybrid Booking:** `Join live queue` (today's active line) OR `Reserve hour` (future time slots feeding the same chair timeline).
   - **Multi-Barber & Multi-Service Selection:** Numbered service menu (`01`–`06`) with durations and ₹ prices; pick a specific stylist or `First available`.
   - **Dynamic QR Pass:** Real scannable QR (`qrcode.react`) whose payload and state bar evolve (`In queue` → `Leave now (≤15m)` → `Checked in` → `In chair` → `Completed`).
   - **15-Minute Turn Alert:** Fires automatically when a guest's ETA crosses ≤15 minutes (top architectural alert banner + simulated WhatsApp/SMS preview + optional Browser Notification API).

2. **Floor Desk (`Barber & Reception Operations`)**
   - Live 3-chair floor strip with elapsed progress, 1-click **Finish & POS Checkout**, and grace-window **No-Show Skip**.
   - **2-Tap Walk-In Entry:** Adds walk-in guests into the exact same queue so online ETAs never drift.
   - **QR Check-In:** Supports camera QR check-in or 1-click ticket code verification.
   - **POS Checkout Drawer:** Collects service total + optional retail product add-ons (auto-deducting inventory) + tip + payment method (`UPI`, `Cash`, `Card`).
   - **Subtle Demo Controls:** `+5m Clock`, `Finish Chair 01`, and `Reset Demo Data` so reviewers can trigger the 15-minute alert and multi-tab ripple in seconds.

3. **Owner ERP (`Intelligence & Ledgers`)**
   - **Overview & 4-Chart Salon Intelligence Suite:**
     1. Revenue vs. Expenses 7-day dual-area spline (Recharts, editorial styling).
     2. Peak-Hour Chair Occupancy interactive heatmap grid (Mon–Sun, 10:00–20:00).
     3. Service Mix & Revenue horizontal bar breakdown.
     4. ETA Accuracy trend (Predicted vs. Actual wait minutes).
   - **Sales & Expenses Ledger:** Live revenue from POS checkouts, quick expense logging (rent, supplies, utilities, payouts), and live Net Operating Profit + margin.
   - **Customer CRM:** Auto-updated guest directory (visit count, preferred stylist, history, total spend).
   - **Staff & Commissions:** Shift status (`Active`, `Break`, `Off`), cuts completed, revenue generated, and automatic commission split.
   - **Inventory & Low-Stock Ledger:** Retail and consumable items with auto-deduct on POS add-ons and reorder warnings.

## 3. Tech Stack & Motion Architecture
- **Core:** React 19 + TypeScript + Vite + Tailwind CSS v4 (`@tailwindcss/vite`).
- **State & Live Sync:** Zustand + `localStorage` persistence + `BroadcastChannel('salondesk-sync')` for instant two-tab live updates.
- **QR & Charts:** `qrcode.react` + `recharts` + `lucide-react` (single consistent line-icon set, zero emojis).
- **Motion (Purposeful Split):**
  - **Lenis (`lenis`)**: Scoped smooth scroll on the Customer Portal; inner ERP/Desk scroll containers opt out via `data-lenis-prevent`.
  - **Framer Motion (`motion/react`)**: Live queue row reordering (`layout`), active tab underline transitions (`layoutId`), POS drawer mount/unmount, and alert banner entrance.
  - **GSAP (`gsap`)**: Smooth KPI numeral roll-ups on Owner ERP, editorial departure-board reveals, and QR pass state transitions.
  - All motion respects `prefers-reduced-motion: reduce`.

## 4. Non-Goals (Portfolio Demo Scope)
- Real SMS/WhatsApp provider billing, production auth/JWT backend, multi-branch franchise DB.
