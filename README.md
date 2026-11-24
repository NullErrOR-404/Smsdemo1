<p align="left">
  <img src="./public/logo.svg" alt="SalonDesk" height="44" />
</p>

# SalonDesk — Live Queue, Dynamic QR Pass & Salon ERP

A local-first grooming studio queue system and connected salon ERP designed to eliminate blind salon wait times. Customers join today's live chair queue or reserve a later hour, receive a scannable **Dynamic QR Pass** with a self-recalculating countdown, and get an automatic **15-minute turn alert** when it is time to head to the salon.

**Live Demo:** `https://smsdemo1.mhdbuilds-ai.workers.dev` *(Cloudflare Workers)*

---

## Core Capabilities

### 1. Customer Portal (`Book and Queue`)
- **Live Chair Departure Board:** Real-time remaining minutes across all active stylist chairs.
- **Hybrid Queue + Slot Booking:** Join today's live line or reserve a later hour; select multiple services with automatic duration and INR (₹) pricing.
- **Scannable Dynamic QR Pass:** Real QR pass (`qrcode.react`) whose state rule and color shift automatically across `In queue` → `Leave now (<=15m)` → `Checked in`.
- **Automatic 15-Minute Turn Alert:** Fires an architectural alert banner (and browser Notification when permitted) the moment a guest's recalculated ETA crosses 15 minutes.

### 2. Floor Desk (`Barber & Reception Operations`)
- **Live Chair Controls:** Track elapsed cut time per chair and trigger 1-click **Finish and POS Checkout**.
- **2-Tap Walk-In Parity:** Add walk-in guests into the exact same queue so online ETAs stay accurate.
- **QR Check-In & No-Show Skip:** Verify ticket codes at reception or skip no-shows to keep chairs moving.
- **Integrated POS Checkout Drawer:** Collect service total, retail product add-ons (auto-deducting inventory), stylist tip, and payment method (`UPI`, `Cash`, `Card`).

### 3. Owner ERP (`Intelligence & Ledgers`)
- **4-Chart Salon Intelligence Suite:**
  1. Revenue vs. Operating Expenses (7-day dual-area spline)
  2. Peak-Hour Chair Occupancy (interactive Mon–Sun heatmap)
  3. Service Mix Revenue Breakdown (horizontal bar chart)
  4. ETA Accuracy Trend (Predicted vs. Actual wait minutes)
- **Connected Ledgers:** Sales & Expenses ledger with live Net Operating Profit, auto-updated Customer CRM, Staff Shift & Commission tracker, and Inventory with low-stock reorder alerts.
- **Multi-Tab Live Sync:** Open the app in two browser tabs (`Customer Portal` + `Floor Desk`) — actions sync instantly via `BroadcastChannel` and persist in `localStorage`.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`) |
| State & Sync | Zustand, `localStorage`, `BroadcastChannel` |
| Motion | Scoped Lenis (Customer Portal), Framer Motion (`motion/react`), GSAP |
| Visualization & QR | Recharts, `qrcode.react`, Lucide React |
| Deployment | Cloudflare Workers (Static Assets SPA) |

---

## Local Development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173` in two browser tabs to test live Customer ↔ Floor Desk synchronization. Use **+5 min**, **Finish Chair 01**, and **Reset** in the masthead to trigger the 15-minute turn alert on demand.

## Production Build

```bash
npm run build
npm run preview
```
