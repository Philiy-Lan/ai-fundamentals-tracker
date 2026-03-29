# Phase 4: Teach-Back - Research

**Researched:** 2026-03-29
**Domain:** Web Speech API, Vercel serverless functions, Anthropic Claude API, React component patterns
**Confidence:** HIGH

## Summary

Phase 4 adds the only network-dependent activity in the app. The technical scope spans three distinct areas: (1) browser voice capture via Web Speech API with a text fallback, (2) a Vercel serverless function that proxies Claude API calls to keep the API key off the client, and (3) a React component (TeachBackViewer) that orchestrates the full flow — prompt display, input, loading, feedback, pass/fail branching — using the same component interface established in earlier phases.

All three areas have HIGH-confidence solutions. The Web Speech API is well-documented for Chrome/Edge; Firefox support does not exist and the text fallback is the correct answer. Vercel's `api/` directory approach is already the deployment target and requires no new infrastructure. The Claude Messages API is stable and well-documented; `@anthropic-ai/sdk@0.80.0` is the current npm package.

The primary planning risk is the interaction between voice recording state and component re-renders. The secondary risk is prompt engineering — the Claude system prompt must produce consistently parseable JSON or the feedback display breaks. Both are solvable with the patterns documented below.

**Primary recommendation:** Build TeachBackViewer as a state-machine-style component with explicit phases (`idle | recording | reviewing | evaluating | feedback | offline`). This eliminates conditional rendering bugs and makes testing straightforward.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**API Key Strategy (TEACH-08)**
- D-01: Vercel API route at `api/evaluate.js` — receives user explanation, calls Claude API server-side, returns evaluation
- D-02: `ANTHROPIC_API_KEY` stored as Vercel environment variable — never in client bundle, never in repo
- D-03: App is already deployed on Vercel — no new infrastructure needed, same domain, no CORS issues
- D-04: API route receives `{ moduleId, conceptArea, explanation }` and returns structured evaluation JSON

**Voice Input UX (TEACH-02, TEACH-04)**
- D-05: Tap-to-start / tap-to-stop recording — not hold-to-talk
- D-06: Transcript displayed after recording completes (not live word-by-word)
- D-07: After recording stops, show transcript in an editable textarea with a "Submit" button — user can review and fix speech recognition errors before submitting
- D-08: Pulsing mic icon while recording is active
- D-09: No minimum character length required before Submit is enabled
- D-10: To retry, user taps the mic button again — replaces previous transcript

**Text Input Fallback (TEACH-03)**
- D-11: Simple textarea with "Submit" button when SpeechRecognition is unavailable (Firefox, etc.)
- D-12: Same submission flow as voice — textarea + Submit, identical from the submit step onward

**AI Feedback Display (TEACH-05, TEACH-06)**
- D-13: Structured feedback format: numeric score (e.g., 4/5) + bullet points for what was correct + bullet points for what was missed or incorrect
- D-14: Visual numeric score displayed alongside the structured bullet points
- D-15: Claude decides pass/fail — evaluation includes a numeric score (1-5) and a pass boolean
- D-16: Auto-complete activity ONLY when evaluation passes ("good enough") — does NOT auto-complete on fail
- D-17: "Try Again" button on failed attempts — returns user to the prompt/input screen to re-record or re-type

**Prompt Display (TEACH-01)**
- D-18: Module-specific concept prompt shown at the top of the Teach-Back panel (from `src/data/content/teachback.js`)
- D-19: Populate teach-back prompts for modules 2-8 (module 1 already has 2 prompts from Phase 1 scaffold)
- D-20: Random prompt selected from the module's prompt array each time the panel opens

**Offline Fallback (TEACH-07)**
- D-21: Check `navigator.onLine` when Teach-Back panel opens — if offline, show "Needs internet connection" message instead of the input UI
- D-22: No broken UI or silent failure — clear messaging that this activity requires connectivity

**ActivityPanel Integration**
- D-23: Add `case "teachback"` to the existing `renderContent` switch in ActivityPanel.jsx
- D-24: TeachBackViewer receives `moduleId` and `onComplete` props (same interface as all other content components)

### Claude's Discretion
- Claude API prompt engineering (system prompt, evaluation rubric)
- Exact pulsing animation for mic icon
- Layout of feedback screen (score placement, bullet point styling)
- Error handling for API failures (timeout, rate limit, 500)
- Whether to show the concept area label alongside the prompt

### Deferred Ideas (OUT OF SCOPE)
- Multi-turn follow-up questions (TEACH-V2-01) — v2 requirement
- Teach-Back session history (TEACH-V2-02) — v2 requirement
- Celebration on activity completion (POLISH-V2-01) — v2 requirement
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TEACH-01 | Module-specific concept prompt displayed to user | TEACHBACK_PROMPTS data scaffold exists; modules 2-8 need populating; random selection on panel open (D-20) |
| TEACH-02 | Voice input via Web Speech API (SpeechRecognition) | Web Speech API is stable on Chrome/Edge; `window.SpeechRecognition \|\| window.webkitSpeechRecognition` detection pattern confirmed |
| TEACH-03 | Text input fallback when SpeechRecognition is unavailable | Firefox has no SpeechRecognition — text fallback is the required path; same textarea+Submit flow as post-voice (D-12) |
| TEACH-04 | Transcript display showing what was captured | Post-recording: editable textarea pre-filled with transcript (D-07); user reviews before submitting |
| TEACH-05 | Claude API call to evaluate user's explanation and provide feedback | `POST /v1/messages` with system prompt returning structured JSON; routed through `api/evaluate.js` Vercel function |
| TEACH-06 | AI feedback display with correctness assessment and guidance | Score (1-5) + pass boolean + correct/missed bullet arrays returned from API; rendered in structured feedback screen |
| TEACH-07 | Graceful offline fallback — "needs connection" message when navigator.onLine is false | `navigator.onLine` checked on mount; false renders offline message; window online/offline events can update dynamically |
| TEACH-08 | Claude API proxy to keep API key server-side | `api/evaluate.js` Vercel serverless function; `ANTHROPIC_API_KEY` env var; same-domain so no CORS config needed |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@anthropic-ai/sdk` | 0.80.0 (current) | Server-side Claude API calls from Vercel function | Official SDK handles auth headers, retries, error types |
| Web Speech API | Browser native | Voice capture — no install | Only browser-native option; Chrome/Edge support confirmed |
| Framer Motion | 12.38.0 (already installed) | Pulsing mic animation | Already a project dependency; `animate` keyframes pattern works |
| React + useState/useRef | 19.2.4 (already installed) | Component state machine | Established project pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | 0.577.0 (already installed) | Mic icon, feedback icons | Already in all other components |
| `canvas-confetti` via `confetti.js` | 1.9.4 (already installed) | Pass celebration | Only if decided to add (currently deferred) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@anthropic-ai/sdk` in Vercel function | Raw `fetch` to `https://api.anthropic.com/v1/messages` | SDK handles retries and typed errors; fetch works but more boilerplate |
| `navigator.onLine` | Fetch-based ping test | Ping test is more accurate but adds latency; `navigator.onLine` false is reliable for offline detection per project decision (D-21) |
| Web Speech API | AssemblyAI / Deepgram | Third-party STT adds cost and another API key; Web Speech is free and sufficient for Chrome/Edge |

**Installation (Vercel function only — client has no new dependencies):**
```bash
npm install @anthropic-ai/sdk
```

**Version verification:** `npm view @anthropic-ai/sdk version` returned `0.80.0` on 2026-03-29.

---

## Architecture Patterns

### Recommended Project Structure
```
api/
└── evaluate.js          # Vercel serverless function — Claude API proxy

src/
├── components/
│   └── TeachBackViewer.jsx   # New component — full teach-back flow
├── data/
│   └── content/
│       └── teachback.js      # Existing — populate modules 2-8 prompts
└── __tests__/
    └── TeachBackViewer.test.jsx  # New — component tests
```

No new directories needed. `api/` is created fresh (it does not currently exist).

### Pattern 1: Explicit UI Phase State Machine

**What:** TeachBackViewer uses a single `phase` state string that drives all conditional rendering. No nested boolean flags.

**When to use:** Any component with 4+ distinct UI states. Prevents impossible state combinations (e.g., `isRecording && isEvaluating` both true).

```jsx
// Source: established project pattern; state machine approach
const PHASES = {
  OFFLINE: "offline",
  IDLE: "idle",          // showing prompt, mic button, or text fallback
  RECORDING: "recording", // mic active, pulsing animation
  REVIEWING: "reviewing", // transcript in editable textarea, Submit visible
  EVALUATING: "evaluating", // spinner, API call in flight
  FEEDBACK: "feedback",   // score + bullets + pass/fail actions
}

export function TeachBackViewer({ moduleId, onComplete }) {
  const [phase, setPhase] = useState(
    navigator.onLine ? PHASES.IDLE : PHASES.OFFLINE
  )
  const [transcript, setTranscript] = useState("")
  const [evaluation, setEvaluation] = useState(null)
  const completedRef = useRef(false)
  // ...
}
```

### Pattern 2: Web Speech API — Tap to Start / Stop

**What:** `SpeechRecognition` instance created on mount (or on first tap). `start()` / `stop()` called on tap. Final transcript assembled from `onresult` events (only `isFinal` results per D-06 — no live interim display).

**When to use:** Any voice capture interaction; always guard with `window.SpeechRecognition || window.webkitSpeechRecognition` check.

```jsx
// Source: MDN Web Speech API docs + VideoSDK 2025 guide
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition

const hasSpeech = Boolean(SpeechRecognition)

function useSpeechRecognition(onFinal) {
  const recognitionRef = useRef(null)

  const startRecording = useCallback(() => {
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ")
      onFinal(text)
    }
    recognition.start()
    recognitionRef.current = recognition
  }, [onFinal])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  return { startRecording, stopRecording, hasSpeech }
}
```

Note: `recognition.stop()` triggers `onresult` with the accumulated transcript before stopping. Setting `continuous: false` means the browser auto-stops after a natural pause — tapping stop before that works but may cut off the transcript early. Calling `stop()` (not `abort()`) ensures the last results are delivered.

### Pattern 3: Vercel API Route — `api/evaluate.js`

**What:** Standalone serverless function in the `api/` directory. Receives POST with `{ moduleId, conceptArea, explanation }`, calls Claude with a structured evaluation prompt, returns `{ score, pass, correct, missed }`.

**When to use:** Any time client needs server-side key access. Same-domain deployment means no CORS config needed (client fetches `/api/evaluate`).

```js
// Source: Vercel Node.js runtime docs + Anthropic SDK docs
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic() // reads ANTHROPIC_API_KEY from env

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { moduleId, conceptArea, explanation } = req.body

  if (!explanation || explanation.trim().length === 0) {
    return res.status(400).json({ error: "explanation required" })
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",  // fast and cheap for evaluation
      max_tokens: 512,
      system: EVALUATION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Concept area: ${conceptArea}\n\nExplanation: ${explanation}`,
        },
      ],
    })

    const raw = message.content[0].text
    const evaluation = JSON.parse(raw)

    return res.status(200).json(evaluation)
  } catch (err) {
    return res.status(500).json({ error: "Evaluation failed" })
  }
}
```

**Choosing the right Claude model:** For evaluation feedback, `claude-haiku-4-5` (fast, low cost) is appropriate. The system prompt must instruct Claude to return ONLY valid JSON with no surrounding text — otherwise `JSON.parse` throws.

### Pattern 4: System Prompt for Structured JSON Evaluation

**What:** System prompt that reliably produces a parseable JSON object. The key constraint is `"Respond with ONLY valid JSON, no other text."` Claude haiku follows this reliably when the schema is explicit.

```
You are an encouraging AI tutor evaluating an explanation from an ADHD learner.

Evaluate the explanation against the concept area. Be warm and specific. Return ONLY valid JSON matching this schema exactly:

{
  "score": <integer 1-5>,
  "pass": <boolean — true if score >= 3>,
  "correct": [<string bullet — what was right>],
  "missed": [<string bullet — what to add or clarify>]
}

Rules:
- score 1: major misconceptions present
- score 2: partially correct but key ideas missing
- score 3: core concept correct, some gaps
- score 4: strong with minor gaps
- score 5: complete and accurate
- correct and missed arrays: 1-4 bullets each, plain English, no markdown
- tone: encouraging, specific, never punitive
- Do not output anything outside the JSON object
```

### Pattern 5: Pulsing Mic Animation with Framer Motion

**What:** `motion.div` wrapping a mic icon with keyframe animation on `scale` and `opacity` while `phase === PHASES.RECORDING`.

```jsx
// Source: Framer Motion docs (motion.dev) — keyframe arrays
<motion.div
  animate={
    phase === "recording"
      ? {
          scale: [1, 1.15, 1],
          opacity: [1, 0.7, 1],
        }
      : { scale: 1, opacity: 1 }
  }
  transition={
    phase === "recording"
      ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
      : { duration: 0.2 }
  }
>
  <Mic size={32} />
</motion.div>
```

Note: The project uses `framer-motion@12.38.0`. Framer Motion was rebranded as `motion` with a new `motion/react` import path for v11+, but the `framer-motion` package still works. All existing project code imports from `framer-motion` — do not change the import.

### Anti-Patterns to Avoid

- **Multiple boolean flags instead of phase enum:** `isRecording && isTranscriptReady && isEvaluating` creates impossible states. Use one `phase` string.
- **Calling `JSON.parse` without try/catch on Claude response:** Claude rarely but occasionally includes explanatory text before JSON even with explicit instructions. Always wrap in try/catch and return a 500 if parsing fails.
- **Creating a new `SpeechRecognition` instance on every render:** Create once per session (on tap or in a ref) — do not call `new SpeechRecognition()` inside render.
- **Not resetting `completedRef` on retry:** The `completedRef` guard prevents double `onComplete` calls. On a "Try Again" reset, the ref stays true. This is correct — `onComplete` should fire at most once per session regardless of retries.
- **Exposing `ANTHROPIC_API_KEY` in any `VITE_` env var:** Vite bundles all `VITE_` vars into the client. The key must only exist in Vercel environment variables, read server-side by the function.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Claude API auth + retries | Custom fetch wrapper | `@anthropic-ai/sdk` | SDK handles exponential backoff, API versioning, error types |
| Voice capture | MediaRecorder + Whisper pipeline | Web Speech API | Native browser API; free; no audio file storage; sufficient for this use case |
| JSON output from LLM | Regex parsing | Explicit JSON schema in system prompt + `JSON.parse` | Regex on LLM output is fragile; structured prompting is reliable |
| Request body parsing in Vercel function | `req.on('data')` stream assembly | Vercel's built-in `req.body` (auto-parsed for `application/json`) | Vercel parses JSON body automatically when Content-Type is set |

**Key insight:** The Vercel `req.body` helper eliminates the need for body-parser middleware. The function only needs `req.body.explanation` etc., not stream assembly.

---

## Common Pitfalls

### Pitfall 1: SpeechRecognition Stops Itself Before User Taps Stop

**What goes wrong:** `continuous: false` (the correct setting for a single explanation) causes the browser to auto-stop after a natural pause (~2-3 seconds of silence). User is still speaking; recognition ends early.

**Why it happens:** Chrome's default silence detection ends recognition even with `continuous: false`.

**How to avoid:** Set `recognition.continuous = true` to prevent auto-stop. The user then controls stop explicitly via their second tap. On `stop()`, Chrome delivers a final `onresult` event.

**Warning signs:** Transcript cuts off mid-sentence. Test with a 4-second pause in the middle of speaking.

### Pitfall 2: Claude Returns Non-JSON Despite Instructions

**What goes wrong:** Very rarely, Claude haiku prepends a phrase like "Here is the evaluation:" before the JSON object. `JSON.parse` throws. User sees a broken feedback screen or silent failure.

**Why it happens:** Instruction following is probabilistic, not guaranteed.

**How to avoid:** In the API route error handler, return `{ error: "Evaluation failed, please try again" }` as a 500. On the client, when the API returns an error status, show an error message with a retry button rather than crashing the UI. Optionally: strip everything before the first `{` character as a defensive fallback before parsing.

### Pitfall 3: `navigator.onLine` is True But API Fails

**What goes wrong:** User is on a captive Wi-Fi portal (airplane mode, hotel) — `navigator.onLine` is true, but actual internet access fails. Claude API call times out or returns network error.

**Why it happens:** `navigator.onLine: true` means "connected to a network", not "connected to the internet."

**How to avoid:** The offline check (D-21) prevents the worst case (fully offline). For the edge case, handle the API error on the client and show: "Couldn't reach the server — check your connection and try again." This is covered by the "error handling for API failures" item in Claude's Discretion.

### Pitfall 4: `webkitSpeechRecognition` Prefix Not Checked

**What goes wrong:** Chrome ships `webkitSpeechRecognition`, not `SpeechRecognition`. Without the prefix fallback, detection incorrectly reports no support on Chrome.

**Why it happens:** Chrome never implemented the unprefixed version despite being the primary supporter.

**How to avoid:** Always use `window.SpeechRecognition || window.webkitSpeechRecognition` for both detection and instantiation.

### Pitfall 5: `api/evaluate.js` Not Deployed Because No `vercel.json`

**What goes wrong:** The project currently has no `vercel.json`. Vercel auto-detects the `api/` directory convention for non-framework projects, but the current project is a Vite app. Vercel may or may not auto-detect the `api/` directory alongside a Vite build.

**Why it happens:** Vite projects without a framework preset may need explicit configuration to serve both the Vite build output and the `api/` functions.

**How to avoid:** After creating `api/evaluate.js`, verify in Vercel dashboard that the function appears under "Functions." If not, add a minimal `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "api/**/*.js": { "runtime": "@vercel/node" }
  }
}
```
This is a potential Wave 0 task: test the deployed function before building the client UI against it.

### Pitfall 6: TEACH-01 Data Gap — Modules 2-8 Have Empty Prompt Arrays

**What goes wrong:** `TEACHBACK_PROMPTS["2"]` through `["8"]` are empty arrays. If TeachBackViewer tries to randomly select a prompt from an empty array, it returns `undefined`. The UI breaks.

**Why it happens:** Phase 1 scaffold only populated module 1.

**How to avoid:** This is a required data task in Phase 4 (D-19). Must be completed in Wave 0 / first plan. TeachBackViewer should also guard: `if (!prompts || prompts.length === 0)` render a "No prompts available" fallback. The existing `content.teachback.test.js` test asserts modules 2-8 are empty arrays — that test will fail (correctly) after prompts are populated, and must be updated to assert `length >= 1`.

---

## Code Examples

### Full `api/evaluate.js` Handler

```js
// Source: Vercel Node.js docs (vercel.com/docs/functions/runtimes/node-js)
//         Anthropic SDK docs (platform.claude.com/docs/en/api/overview)
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

const SYSTEM_PROMPT = `You are an encouraging AI tutor evaluating a learner's explanation.
Evaluate the explanation against the concept area. Be warm and specific.
Return ONLY valid JSON matching this schema exactly — no other text, no markdown:

{
  "score": <integer 1-5>,
  "pass": <boolean, true if score >= 3>,
  "correct": [<string bullet, what was right>],
  "missed": [<string bullet, what to improve>]
}

Score guide: 1=major errors, 2=partial, 3=core correct with gaps, 4=strong, 5=complete.
Tone: encouraging, never punitive. Bullets: plain English, 1-4 items each.`

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { moduleId, conceptArea, explanation } = req.body ?? {}

  if (!explanation?.trim()) {
    return res.status(400).json({ error: "explanation required" })
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Concept area: ${conceptArea ?? "General"}\n\nExplanation: ${explanation}`,
        },
      ],
    })

    const raw = message.content[0].text
    // Defensive: strip any text before first `{`
    const jsonStart = raw.indexOf("{")
    const parsed = JSON.parse(jsonStart >= 0 ? raw.slice(jsonStart) : raw)

    return res.status(200).json(parsed)
  } catch (_) {
    return res.status(500).json({ error: "Evaluation failed" })
  }
}
```

### Client `fetch` to API Route

```jsx
// Source: standard Fetch API + project conventions (no semicolons, double quotes)
async function evaluate({ moduleId, conceptArea, explanation }) {
  const res = await fetch("/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moduleId, conceptArea, explanation }),
  })
  if (!res.ok) {
    throw new Error(`Evaluation API error: ${res.status}`)
  }
  return res.json() // { score, pass, correct, missed }
}
```

### ActivityPanel — Adding Teachback Case

```jsx
// Source: existing ActivityPanel.jsx pattern
case "teachback":
  return <TeachBackViewer moduleId={moduleId} onComplete={onComplete} />
```

### TeachBackViewer — Offline Check on Mount

```jsx
// Source: MDN navigator.onLine docs
const [phase, setPhase] = useState(
  () => (navigator.onLine ? "idle" : "offline")
)

useEffect(() => {
  const goOnline = () => setPhase((p) => (p === "offline" ? "idle" : p))
  const goOffline = () => setPhase("offline")
  window.addEventListener("online", goOnline)
  window.addEventListener("offline", goOffline)
  return () => {
    window.removeEventListener("online", goOnline)
    window.removeEventListener("offline", goOffline)
  }
}, [])
```

### Random Prompt Selection

```jsx
// Source: project pattern; TEACHBACK_PROMPTS keyed by string module ID
import { TEACHBACK_PROMPTS } from "../data/content/teachback"

// Select once on mount using useState initializer (not on every render)
const [promptItem] = useState(() => {
  const prompts = TEACHBACK_PROMPTS[moduleId] ?? []
  if (prompts.length === 0) return null
  return prompts[Math.floor(Math.random() * prompts.length)]
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `module.exports = (req, res) =>` in Vercel functions | `export default { fetch(request) {} }` Web Standard export OR named HTTP exports | 2024 (Vercel runtime v3+) | Either style works; the `req/res` helper style still works and is simpler for this use case |
| `window.webkitSpeechRecognition` only | `window.SpeechRecognition \|\| window.webkitSpeechRecognition` | Stable | Always check both; unprefixed spec version still not universally shipped |
| `framer-motion` package name | `motion` package + `motion/react` imports | v11 (2024) | Project uses `framer-motion@12.38.0` which still works via the old import path |

**Deprecated/outdated:**
- `@anthropic-ai/sdk` versions below 0.20 used a different API (`client.complete()`). Current 0.80.0 uses `client.messages.create()`.
- The `VercelRequest/VercelResponse` typed helpers from `@vercel/node` are optional — they add types but the function works without them. For `.js` (not `.ts`) no install needed.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 |
| Config file | `vite.config.js` (test block with `environment: "jsdom"`, `globals: true`) |
| Quick run command | `npx vitest run src/__tests__/TeachBackViewer.test.jsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TEACH-01 | Prompt from TEACHBACK_PROMPTS renders for moduleId | unit | `npx vitest run src/__tests__/TeachBackViewer.test.jsx` | Wave 0 |
| TEACH-01 | Modules 2-8 have populated prompts | unit | `npx vitest run src/__tests__/content.teachback.test.js` | Exists (asserts empty — will need updating) |
| TEACH-02 | Mic button renders when SpeechRecognition available; starts/stops recording | unit | `npx vitest run src/__tests__/TeachBackViewer.test.jsx` | Wave 0 |
| TEACH-03 | Textarea renders when SpeechRecognition unavailable | unit | `npx vitest run src/__tests__/TeachBackViewer.test.jsx` | Wave 0 |
| TEACH-04 | After recording, transcript appears in editable textarea | unit | `npx vitest run src/__tests__/TeachBackViewer.test.jsx` | Wave 0 |
| TEACH-05 | Submit calls `/api/evaluate` with correct payload | unit (fetch mock) | `npx vitest run src/__tests__/TeachBackViewer.test.jsx` | Wave 0 |
| TEACH-06 | Feedback screen shows score and bullet lists from API response | unit | `npx vitest run src/__tests__/TeachBackViewer.test.jsx` | Wave 0 |
| TEACH-06 | Pass: onComplete called; Try Again not shown | unit | `npx vitest run src/__tests__/TeachBackViewer.test.jsx` | Wave 0 |
| TEACH-06 | Fail: Try Again button shown; onComplete not called | unit | `npx vitest run src/__tests__/TeachBackViewer.test.jsx` | Wave 0 |
| TEACH-07 | Offline: "needs connection" message shown instead of input | unit | `npx vitest run src/__tests__/TeachBackViewer.test.jsx` | Wave 0 |
| TEACH-08 | ActivityPanel routes "teachback" to TeachBackViewer | unit | `npx vitest run src/__tests__/ActivityPanel.test.jsx` | Exists (needs new case test) |

**Testing strategy note:** Web Speech API is not available in jsdom. `window.SpeechRecognition` must be mocked in tests. Set `window.SpeechRecognition = undefined` to test the text fallback path; set it to a mock constructor to test the voice path. Same approach used by the project for `window.__audioPlayerProps` in AudioPlayer tests.

Vercel API route (`api/evaluate.js`) is Node.js server-side code — no Vitest test needed. Test behavior via mocked `fetch` in TeachBackViewer tests.

### Sampling Rate
- **Per task commit:** `npx vitest run src/__tests__/TeachBackViewer.test.jsx`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/TeachBackViewer.test.jsx` — covers TEACH-01 through TEACH-07; needs `window.SpeechRecognition` mock setup
- [ ] Update `src/__tests__/content.teachback.test.js` — after prompts populated, the "modules 2-8 are empty arrays" test must be revised to assert `length >= 1`
- [ ] Add `case "teachback"` test to `src/__tests__/ActivityPanel.test.jsx` — mock TeachBackViewer via `vi.mock`

---

## Open Questions

1. **Vercel `api/` auto-detection for Vite projects without `vercel.json`**
   - What we know: Vercel auto-detects `api/` for many frameworks. Current project has no `vercel.json`.
   - What's unclear: Whether Vercel's Vite preset also auto-detects `api/`. Could not verify without a live deployment test.
   - Recommendation: Wave 0 task — create `api/evaluate.js` with a stub response and deploy to verify function appears in Vercel dashboard. If not detected, add a `vercel.json`. Do not block other plans on this; it is the first implementation item.

2. **`recognition.continuous` setting and auto-stop behavior**
   - What we know: `continuous: false` auto-stops on silence. `continuous: true` requires explicit `stop()`.
   - What's unclear: Project decision D-05/D-06 implies tap-to-stop — `continuous: true` is the correct choice, but MDN warns that `continuous: true` can lead to very long recordings if the user forgets to stop.
   - Recommendation: Use `continuous: true` to honor the tap-to-stop UX. Add a 60-second timeout as a safety valve: `setTimeout(() => recognition.stop(), 60000)` after `start()`.

3. **Claude model selection for evaluation**
   - What we know: `claude-haiku-4-5` is fast and cheap; suitable for short evaluation tasks.
   - What's unclear: Whether the latest model identifier is `claude-haiku-4-5` or a newer variant by the time this is implemented.
   - Recommendation: Use `claude-haiku-4-5` as specified. The Anthropic Models API (`GET /v1/models`) can list current models if validation is needed.

---

## Sources

### Primary (HIGH confidence)
- [platform.claude.com/docs/en/api/overview](https://platform.claude.com/docs/en/api/overview) — Claude API endpoint, auth headers, request/response format, model identifiers
- [vercel.com/docs/functions/runtimes/node-js](https://vercel.com/docs/functions/runtimes/node-js) — Vercel Node.js function format, `req.body` helpers, `response.json()`
- [developer.mozilla.org — SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) — API surface, browser support, event model
- `npm view @anthropic-ai/sdk version` — verified 0.80.0 on 2026-03-29
- Project source: `ActivityPanel.jsx`, `QuizViewer.jsx`, `FlashcardViewer.jsx`, `content.teachback.test.js` — established patterns

### Secondary (MEDIUM confidence)
- [caniuse.com/speech-recognition](https://caniuse.com/speech-recognition) — browser support tables (Chrome/Edge yes, Firefox no, confirmed 2025)
- [VideoSDK 2025 Web Speech guide](https://www.videosdk.live/developer-hub/stt/javascript-speech-recognition) — `continuous` and `interimResults` usage patterns

### Tertiary (LOW confidence)
- navigator.onLine reliability discussion (dev.to) — "only trust false" guidance; not from official spec

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — SDK version npm-verified; all other dependencies already in project
- Architecture: HIGH — patterns directly derived from existing project code + official docs
- Pitfalls: HIGH for browser API pitfalls (MDN-sourced); MEDIUM for Vercel auto-detection (requires live deployment test)
- Test approach: HIGH — follows established project vitest/jsdom patterns exactly

**Research date:** 2026-03-29
**Valid until:** 2026-04-29 (stable APIs; Claude model names may update sooner)
