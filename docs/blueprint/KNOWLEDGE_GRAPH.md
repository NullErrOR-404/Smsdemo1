# SalonDesk — Living Knowledge Graph

> Updated on every architectural, store, route, or component change.

## 1. Architecture Overview
- **Runtime:** Vite + React 19 + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`).
- **Deployment:** Cloudflare Workers Static Assets (`cloudflare.config.ts`, Worker name `smsdemo1`, live at `https://smsdemo1.mhdbuilds-ai.workers.dev`) + public GitHub repo `NullErrOR-404/Smsdemo1`.
- **Branding:** Editorial SVG brand mark (`public/logo.svg`) integrated in `Masthead.tsx`, `index.html`, and `README.md`.
- **Single Source of Truth:** `src/store/useSalonStore.ts` (Zustand store persisted to `localStorage` under `salondesk-state-v1` and mirrored live across browser tabs via `BroadcastChannel('salondesk-sync')`).

## 2. Planned Module Map
```
src/
├── main.tsx                     # React root + CSS tokens import
├── index.css                    # @import "tailwindcss" + :root tokens + font setup
├── App.tsx                      # Editorial masthead, role switcher, Lenis scope, Alert banner
├── types/
│   └── salon.ts                 # Service, Stylist, Chair, QueueTicket, Sale, Expense, Customer, InventoryItem
├── data/
│   └── seed.ts                  # Realistic Indian unisex salon seed data (INR ₹)
├── store/
│   └── useSalonStore.ts         # Reactive queue ETA engine, 15m alert trigger, POS checkout, ERP mutations, BroadcastChannel sync
├── hooks/
│   └── useLenis.ts              # Scoped Lenis smooth scrolling for Customer Portal
├── components/
│   ├── Masthead.tsx             # Double-rule header, role nav, live clock, demo controls
│   ├── DepartureBoard.tsx       # Signature full-width 3-chair live departure board
│   ├── AlertBanner.tsx          # Architectural 15-min turn alert + WhatsApp/SMS preview
│   ├── customer/
│   │   ├── CustomerPortal.tsx   # Hybrid live queue + future slot booking flow
│   │   └── DynamicQRPass.tsx    # Physical-style QR stub (qrcode.react) + live countdown
│   ├── desk/
│   │   ├── FloorDesk.tsx        # 3 live chairs, unified queue ledger, 2-tap walk-in, QR verify
│   │   └── PosCheckoutDrawer.tsx# 1-click checkout (services + retail add-ons + tip + UPI/Cash/Card)
│   └── erp/
│       ├── OwnerERP.tsx         # Tabbed ERP workspace (Analytics, Sales & Expenses, CRM, Staff, Inventory)
│       ├── AnalyticsSuite.tsx   # 4 editorial charts (Rev vs Exp, Peak Heatmap, Service Mix, ETA Accuracy)
│       └── AnimatedNumber.tsx   # GSAP smooth KPI counter roll-up
```

## 3. Core Data Flow (Live Ripple)
1. **Booking / Walk-In** → `addTicket()` computes live chair ETA from active chair remaining mins + queued durations → writes ticket → broadcasts across tabs.
2. **Clock Tick / Chair Finish** → `advanceClock(mins)` or `finishChair(chairId)` shifts all downstream tickets for that stylist → any ticket crossing `<= 15m` transitions `In queue → Leave now`, fires `AlertBanner` + browser Notification.
3. **POS Checkout** → `completeCheckout()` logs `Sale`, increments `Stylist` cuts/revenue/commission, updates/creates `Customer` CRM profile, deducts `InventoryItem` stock for retail add-ons, and updates `OwnerERP` charts immediately.
