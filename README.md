# LUNAE — Glow from sun-up to moonlight

Website & e-commerce storefront for **LUNAE**, a Malaysian halal makeup & skincare brand designed for tropical heat and humidity. Built from the *LUNAE Full Business Proposal* (Part D — E-Commerce System) and the *LUNAE Luxe* 3D mock-ups.

> **Status:** pre-launch preview. Wave 1 launches with Merdeka (August 2027). Checkout runs in **demo mode** — no payment is taken and nothing ships. Reviews open to verified buyers after launch; performance claims marked `*` are targets pending independent testing (NPRA cosmetic-claims scope).

## Stack (proposal D4)

| Layer | Used here |
| --- | --- |
| Framework | Next.js 16 (App Router, React Server Components, Cache Components / PPR) · React 19 · TypeScript strict |
| Styling | Tailwind CSS v4 + design tokens (CSS variables) for **Day "Sun-up"** and **Midnight "Moonlight"** palettes |
| Type | Cormorant Garamond (display) · Lora (product names) · Inter (UI) — self-hosted via Fontsource |
| State | Zustand (cart, wishlist, shade profile, account) persisted to the device |
| Validation | Zod — the same schemas on client and server |
| AR & AI | MediaPipe Face Landmarker (WASM + WebGL, on-device) · CIELAB / ΔE2000 shade matching |
| Astronomy | SunCalc — local sunset switches the theme; moon phase drives Full Moon Drops |
| Weather | Open-Meteo (client-side, 30-min cache) for Weather Glow |
| PWA | Web manifest + service worker (offline catalogue & images) |

## What's built

**Storefront (EN `/en` · BM `/ms`, hreflang):** home (Day & Midnight editions), shop + 4 categories with URL-synced filters & "best match for me" sort, 6 concern pages (FAQ schema), instant search with typo tolerance & BM/EN synonyms, 16 product pages (Product JSON-LD, gallery/zoom/360° preview, shade selector + AI match, skin-tone preview, Ingredient Explorer with halal status, Sweat-Test slider, Q&A, complete-the-routine), sets & gift mode, journal, ingredient glossary (71 INCI), Sweat-Test Lab, about, halal promise, stockists, help centre, contact, policies (shipping, returns, PDPA privacy, terms, cookies), live, waiting room, maintenance, branded 404.

**Signature features (D6):** Sun-up → Moonlight auto theme · Weather Glow · AI Shade Finder (guided selfie with light meter, or 6-question quiz) · live AR lip & cheek try-on with 4-shade compare · Routine Builder (drag & drop, live bundle price, share link) · Lunae Advisor (rule-based RAG over catalogue/INCI/policies with guardrails; uses the Claude API when `ANTHROPIC_API_KEY` is set) · Full Moon Drops (moon-phase countdown, waitlist, fair virtual queue) · Batch & halal trace (QR) · Shade-Match Guarantee swap flow · Refill Radar · passkey & OTP sign-in.

**Buy:** cart drawer & page (free-shipping meter, save for later, vouchers), one-page checkout (express methods, MY phone & postcode → state validation, dated delivery, East Malaysia rates, gift mode, Lunae Circle points slider, 15-min reservation timer). Prices are **recalculated on the server** (`/api/checkout`) and the order is marked PAID only after an **HMAC-signed webhook** is verified (`/api/webhooks/payments`).

**Account:** overview with live order timeline & rider map, orders & 3-tap shade swap, refills, skin & shade profile, Lunae Circle ledger & rewards, wishlist, addresses, passkeys & security, PDPA privacy centre (consents, data download, delete).

**Partners & admin:** partner portal & application (KYC), admin command centre (KPIs, revenue chart, channel mix, FEFO watch) and module views — sample data, `noindex`.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Environment variables (all optional)

Copy `.env.example` to `.env.local`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for sitemap, OG & JSON-LD (Vercel's production URL is used automatically) |
| `ANTHROPIC_API_KEY`, `ADVISOR_MODEL` | Lunae Advisor answers with Claude (falls back to the built-in rule engine) |
| `PAYMENT_WEBHOOK_SECRET` | HMAC secret for signed payment sessions/webhooks — **set this in production** |
| `CONTACT_WEBHOOK_URL`, `WAITLIST_WEBHOOK_URL`, `PARTNER_WEBHOOK_URL`, `ADVERSE_EVENT_WEBHOOK_URL` | Forward forms to your helpdesk / CRM (e.g. Slack, Zapier, Make) |

## Before going live

- Replace placeholder contact details in `src/lib/site.ts` (WhatsApp number) and emails (`hello@`, `dpo@`, `press@lunae.my`).
- Connect a licensed Malaysian payment gateway (FPX, cards 3DS2, DuitNow QR, e-wallets, BNPL) to `/api/webhooks/payments`.
- Move accounts, orders and the points ledger from device storage to the commerce engine (Medusa + PostgreSQL per proposal D4/D11).
- Publish NPRA notification numbers, JAKIM halal certificates and lab reports, then remove the `*` from claims that passed.

## Project structure

```
src/
  app/[lang]/(store)/…      storefront & account
  app/[lang]/(checkout)/…   checkout & payment
  app/[lang]/partners, admin
  app/api/…                 advisor, checkout, payment webhook, forms
  components/…              UI, chrome, PDP, shade finder, try-on, account
  data/                     catalogue (16 products, 62 shades), formulas (INCI), journal, policies, batches
  lib/                      i18n, pricing, colour science, astronomy, weather, store
```

© 2026 Mohamad Amirul Asyraf. All rights reserved. Source shared for portfolio viewing only; not licensed for reuse. See [LICENSE](LICENSE). The LUNAE name, brand assets and business material are also proprietary.
