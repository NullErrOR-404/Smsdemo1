# SalonDesk — Design System (`A + C Hybrid`: Swiss Broadsheet Ledger)

## 1. Visual Direction
Fuses **Direction A (Swiss Studio Ledger)** structural precision with **Direction C (Broadsheet Paper)** editorial warmth:
- **Character:** exact, tactile, editorial, unhurried.
- **World:** a studio broadsheet service menu paired with a Swiss station departure board and a printed queue stub.
- **Signature Moment:** Full-width **Live Chair Departure Board** across the top (`CHAIR 01 / 10m`, `CHAIR 02 / 14m`, `CHAIR 03 / 18m`) + numbered printed service index (`01`–`06`) + physical-style **Dynamic QR Stub** whose top ink bar shifts to vermilion `#C83E2B` the moment the 15-minute turn window opens.

## 2. Hard Anti-Slop Rules (Non-Negotiable)
- **ZERO** pill badges (`rounded-full` status chips), rounded tag clusters, decorative status dots, or pulsing rings (`animate-pulse`).
- **ZERO** middle-dot meta strings (`A · B · C`), glued `→` link arrows, eyebrows/tracked uppercase labels, glassmorphism, or nested cards.
- **ZERO** emojis in UI (use `lucide-react` 1.5px stroke icons sparingly and only where functional).
- State is communicated strictly via **typography, tabular numerals, hairline rules, color-coded plain text, and the QR stub top rule**.

## 3. Design Tokens (`:root`)
```css
:root {
  /* Surfaces */
  --sd-paper: #F4EFE6;          /* Broadsheet warm newsprint canvas */
  --sd-surface: #FFFFFF;        /* Crisp ledger & QR ticket stock */
  --sd-tint: #EBE4D8;           /* Subtle selected-row & secondary fill */

  /* Ink & Rules */
  --sd-ink: #1A1714;            /* Deep espresso-black primary ink */
  --sd-muted: #665E56;          /* Secondary ink (>= 4.5:1 on paper/white) */
  --sd-line: #D4CBBD;           /* Hairline ledger border */
  --sd-line-strong: #1A1714;    /* Masthead & table header rules */

  /* Accents (Strict Role Separation) */
  --sd-brand: #1F4D3A;          /* Deep botanical green — primary actions, positive profit, checked-in */
  --sd-brand-hover: #173B2C;
  --sd-alert: #C83E2B;          /* Swiss vermilion — <=15m Leave Now alert & low-stock reorder only */
  --sd-alert-tint: #F9E6E3;

  /* Geometry */
  --sd-radius: 2px;             /* Crisp Swiss architectural corners */
}
```

## 4. Typography
- **Display / Masthead / Big Wait Figures:** `Instrument Serif` (fallback: `Georgia, serif`) — tight `-0.02em` tracking, weight `400`.
- **UI / Tables / Body:** `Inter` (fallback: system sans) — weights `400`, `500`, `600` (never `800`/`900`), sentence case everywhere.
- **Ticket Codes & Chair Indices:** `JetBrains Mono` (fallback: monospace) — `font-variant-numeric: tabular-nums` on all prices (₹), minutes, and KPIs.

## 5. Layout & Responsive Floor
- Full-width `max-w-[1440px]` desktop shell with double-ruled editorial masthead.
- Verified across `375px` mobile, `1440px` laptop, and `1920px` desktop in **Brave** with `0` failed asset requests and `overflow-x: clip`.
