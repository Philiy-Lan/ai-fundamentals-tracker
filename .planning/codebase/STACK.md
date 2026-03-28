# Technology Stack

**Analysis Date:** 2026-03-28

## Languages

**Primary:**
- JavaScript (JSX) - All application code in `src/`
- CSS - Global styles in `src/index.css`

**Secondary:**
- HTML - Entry point `index.html`

## Runtime

**Environment:**
- Node.js v25.8.2 (local development)
- Browser runtime (production — no server-side execution)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present (lockfileVersion 3)

## Frameworks

**Core:**
- React 19.2.4 - UI component framework; entry at `src/main.jsx`
- React Router DOM 7.13.1 - Client-side routing; three routes (`/`, `/module/:id`, `/settings`)
- Tailwind CSS 4.2.2 - Utility-first CSS via `@tailwindcss/vite` Vite plugin; configured with custom design tokens in `src/index.css`

**Animation:**
- Framer Motion 12.38.0 - Page transition animations via `AnimatePresence` in `src/App.jsx`

**Notifications:**
- Sonner 2.0.7 - Toast notification system; configured in `src/App.jsx`

**Build/Dev:**
- Vite 8.0.1 - Build tool and dev server; config at `vite.config.js`
- `@vitejs/plugin-react` 6.0.1 - React fast refresh and JSX transform

**PWA:**
- vite-plugin-pwa 1.2.0 - Service worker and Web App Manifest; configured in `vite.config.js` with `autoUpdate` strategy and Workbox for asset precaching

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.99.3 - Cloud sync backend client; initialized conditionally in `src/utils/supabase.js` (app runs fully without it)
- `react-router-dom` 7.13.1 - All navigation depends on this; uses `BrowserRouter` wrapping in `src/main.jsx`

**UI / UX:**
- `lucide-react` 0.577.0 - Icon library used throughout components
- `canvas-confetti` 1.9.4 - Celebration animations; wrapped in `src/utils/confetti.js`
- `framer-motion` 12.38.0 - Animated page transitions

**Infrastructure:**
- `vite-plugin-pwa` 1.2.0 - Enables installable PWA with offline asset caching

## Configuration

**Environment:**
- Vite reads `VITE_` prefixed env vars at build time
- Required vars documented in `.env.example`:
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Supabase anon/public key
- Both vars are optional; the app falls back gracefully to local-only mode when absent

**Build:**
- `vite.config.js` - Primary build config (React plugin, Tailwind plugin, PWA plugin)
- `eslint.config.js` - ESLint flat config targeting `**/*.{js,jsx}`; enforces `no-unused-vars` with uppercase pattern exception

**Tailwind:**
- Tailwind v4 configured via CSS `@import "tailwindcss"` and `@theme` block in `src/index.css`
- Custom CSS custom properties used alongside Tailwind utilities for the design system

## Platform Requirements

**Development:**
- Node.js (v25 used locally)
- npm
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars (optional — sync feature disabled without them)

**Production:**
- Static file host (no server required)
- PWA-capable browser for installability
- HTTPS recommended (required for service workers and `crypto.subtle` used in passphrase hashing)

---

*Stack analysis: 2026-03-28*
