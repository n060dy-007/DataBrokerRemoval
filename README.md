# Antigravity — Data Broker Removal Agent

Privacy-first tool to help individuals request deletion of their personal data from 180+ data brokers under CCPA, GDPR, and U.S. state privacy laws.

**Built for speed and privacy on Cloudflare's global edge.**

## Features
- Track opt-out progress across hundreds of brokers
- One-click professional email template generation (CCPA/GDPR language)
- Reliable clipboard + mailto: flow (no tracking, no backend required)
- Local-only storage (your data never leaves your browser)
- Beautiful glassmorphism interface that works great offline after first load

## Cloudflare Optimization Highlights
- Code-split broker dataset (~180 entries) → smaller initial JS chunks
- Aggressive immutable caching via `_headers` for Cloudflare Pages
- Security headers (CSP, X-Frame-Options, Referrer-Policy, etc.)
- Preconnected Google Fonts + critical CSS
- Vite manual chunks for React / Framer Motion / Icons (better edge caching)
- Fixed the previous non-functional "Gmail draft" hack (now reliable client-side only)
- Zero external API calls in the normal user flow

## Local Development
```bash
npm install
npm run dev
```

## Deploy to Cloudflare Pages (Recommended)

### Option 1: Dashboard (Recommended & Most Reliable)
This is the best way to deploy when connecting via GitHub.

1. Push this repo to GitHub.
2. In Cloudflare Dashboard → Pages → Create a project and connect the repo.
3. **Set these build settings** (very important):
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Save the settings.
5. Trigger a deployment.

Cloudflare Pages will automatically use the `_headers` and `_redirects` files from the `public/` folder.

### Option 2: Manual CLI Deploy
```bash
npm run build
npx wrangler pages deploy dist
```

First time it will ask you to create/link a Pages project.

After deploy you get a `*.pages.dev` URL instantly, with global caching + DDoS protection.

## Environment Notes
- 100% client-side. No server, no database, no cookies.
- Works fully offline after the initial load (great for threat modeling).
- The only "network" activity is when you click email links (your mail client).

## Tech Stack
- React 18 + Vite 5
- Tailwind + custom glassmorphism design system
- Framer Motion (kept minimal)
- Lucide icons
- Deployed on **Cloudflare Pages**

## Privacy Philosophy
Everything runs in your browser. No telemetry. No accounts. Your personal details used for template generation stay in localStorage only.

---

Made for people who want their data back.
