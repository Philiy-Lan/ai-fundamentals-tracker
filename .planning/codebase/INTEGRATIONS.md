# External Integrations

**Analysis Date:** 2026-03-28

## APIs & External Services

**Cloud Sync:**
- Supabase - Stores and syncs user progress across devices
  - SDK/Client: `@supabase/supabase-js` 2.99.3
  - Client initialized: `src/utils/supabase.js`
  - Auth: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (both read via `import.meta.env`)
  - Integration is fully optional — client is `null` when env vars are absent, and all callers guard with `if (!supabase) return`

## Data Storage

**Databases:**
- Supabase (PostgreSQL) — remote progress persistence
  - Table: `progress`
  - Schema: `{ id: string (sha256 hash), data: jsonb, updated_at: timestamptz }`
  - Operations: upsert by `id` on push, select single row by `id` on pull
  - Connection: `VITE_SUPABASE_URL` env var
  - Client: `@supabase/supabase-js` via `src/utils/supabase.js`

**Local Storage:**
- Browser `localStorage` — primary offline-first data store
  - Key: `ai-tracker-progress` — full progress state as JSON
  - Key: `ai-tracker-sync-phrase` — user's plaintext sync passphrase
  - Key: `ai-tracker-sync-key` — SHA-256 hash of passphrase (used as Supabase row ID)
  - Implementation: `src/utils/storage.js`

**File Storage:**
- None — no file uploads or blob storage used

**Caching:**
- Workbox (via vite-plugin-pwa) — precaches all `*.{js,css,html,ico,png,svg,woff2}` assets at build time
- Service worker uses `autoUpdate` registration strategy

## Authentication & Identity

**Auth Provider:**
- None — no user accounts or session-based auth
- Identity is passphrase-based: user supplies a phrase, it is SHA-256 hashed client-side via `crypto.subtle.digest`, and the hash becomes the Supabase row key
- Implementation: `hashPhrase()` in `src/utils/supabase.js`
- Risk: anyone who knows the passphrase can read/overwrite progress. No server-side ownership enforcement.

## Monitoring & Observability

**Error Tracking:**
- None — no third-party error reporting (Sentry, Datadog, etc.)

**Logs:**
- Console only — errors from sync operations are caught and surfaced as `syncStatus` state values (`"error"`, `"offline"`)

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured — app is a static Vite build suitable for GitHub Pages, Netlify, Vercel, or any static host
- PWA manifest `start_url: "/"` and `scope: "/"` assume deployment at domain root

**CI Pipeline:**
- None detected — no GitHub Actions workflows or CI config files present

## Environment Configuration

**Required env vars:**
- None strictly required (app runs in local-only mode without any vars)

**Optional env vars (enable cloud sync):**
- `VITE_SUPABASE_URL` — Supabase project REST endpoint URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key (public, safe to expose in client)

**Secrets location:**
- `.env` file at project root (not committed; `.env.example` documents expected shape)
- Supabase anon key is intentionally public-safe; no private/service-role key is used

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Browser APIs Used

**crypto.subtle:**
- Used in `src/utils/supabase.js` `hashPhrase()` to generate deterministic SHA-256 keys from passphrases
- Requires HTTPS in production (not available on plain HTTP)

**localStorage:**
- Used throughout `src/utils/storage.js` and `src/hooks/useSync.js` for persistence and sync key storage

**Service Worker:**
- Registered automatically via vite-plugin-pwa for PWA offline support

---

*Integration audit: 2026-03-28*
