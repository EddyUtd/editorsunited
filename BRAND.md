# EditorsUnited — Brand Guidelines ("Edit Bay" Design System)

> Source of truth for the EditorsUnited brand. The live tokens are in
> [`assets/styles.css`](assets/styles.css) (`:root` block) — if this document and the CSS ever
> disagree, fix whichever one is wrong and keep them in sync. The portal repo
> (`editorsunited-portal`) carries a copy of this file and of the tokens (`app/public/tokens.css`).

## 1. Brand essence

**Edit Bay, warm light.** The brand evokes a professional editing suite bathed in warm
daylight: warm paper surfaces, a single **amber "playhead"** accent, confident Montserrat
headlines, and a mono "timecode" detail language. It is calm, technical, and precise — never
loud. Dark surfaces exist, but they are *reserved*: video frames, the featured pricing card,
and the footer are the only dark zones on the site. One accent color, used sparingly, always
means "action or focus" — like a playhead on a timeline.

Company: **Editors United Ltd.** — bilingual (EN/FR) short-form video editing, Montréal QC.
Wordmark: **EditorsUnited** (one word, camel-cased in the mark; see §3).

## 2. Color tokens

| Token | Hex | Role / usage rules |
|---|---|---|
| `--paper` | `#FDFBF7` | Page background (warm paper). Default surface. |
| `--paper-2` | `#F6F1E7` | Alternate warm band for section rhythm. |
| `--paper-3` | `#EFE7D7` | Deepest warm band; use sparingly. |
| `--white` | `#FFFFFF` | Cards on paper surfaces. |
| `--ink` | `#262A33` | Body text and headings on light surfaces. |
| `--muted` | `#5D6472` | Secondary text on light surfaces. |
| `--bay` | `#23262E` | Dark surface — footer, featured pricing card, video frames, the brand mark tile, portal chrome. **Nowhere else.** |
| `--bay-2` / `--bay-3` | `#2C303A` / `#343945` | Raised layers on dark surfaces. |
| `--text-hi` / `--text-lo` | `#F7F7F5` / `#B9BEC9` | Primary / secondary text on dark surfaces. |
| `--signal` | `#FFC24B` | **The** accent. CTAs, playhead, focus rings, highlights. One accent per view; never body text. |
| `--signal-hover` | `#FFD166` | Hover state of `--signal`. |
| `--signal-deep` | `#7A5B00` | Accessible "amber" for text on light surfaces (e.g. the *United* in the wordmark, timecode accents). Use this — not `--signal` — whenever amber must be read as text on paper. |
| `--signal-glow` / `--signal-tint` | `rgba(255,194,75,.35)` / `rgba(255,194,75,.14)` | Glow/tint derivatives. Derive alphas from `255,194,75` only. |
| `--rec` | `#FF5C5C` | "REC" red — recording chip, destructive actions. |
| `--ok-dark` / `--ok-light` | `#7FD99A` / `#256B33` | Success on dark / on light. |
| `--err-dark` / `--err-light` | `#FF8B8B` / `#B3261E` | Error on dark / on light. |
| `--line-light` / `--line-dark` | `rgba(38,42,51,.14)` / `rgba(255,255,255,.16)` | Hairlines on light / dark. |

Hard rules:
- **One amber.** `#FFC24B` is the only accent hex. (`#FFC94A` was retired 2026-07 — if you see it anywhere, it's a bug.)
- **One dark.** The mark tile, footer, and dark cards all use `--bay #23262E` (retired: `#0B0D12`, `#141821`).
- Amber on dark = fine. Amber as text on light = use `--signal-deep`.

## 3. The mark & wordmark

- **Mark:** an amber **"EU" monogram** (Montserrat ExtraBold letterforms, converted to paths)
  on a `--bay` rounded tile, sitting above a faint **timeline ruler** (the frame-tick motif).
  Canonical files, all generated from the same geometry:
  - [`assets/logo.svg`](assets/logo.svg) — 128×128, master mark.
  - [`assets/mark.svg`](assets/mark.svg) — 34×34 header variant (hairline border). Referenced by every page header via `<img class="brand-mark">` — **never** inline-copy the SVG into pages.
  - [`assets/favicon.svg`](assets/favicon.svg) + `favicon-32.png` — 32×32 favicon.
  - `apple-touch-icon.png` — 180×180, flattened onto `#23262E` (no transparent corners).
- **Wordmark:** `EditorsUnited` set in Montserrat 800, tight (−0.01em): *Editors* in `--ink`,
  *United* in `--signal-deep`. In HTML: `<span class="brand-word">Editors<em>United</em></span>`.
- Letters in the mark are paths, not live text — regenerate from Montserrat 800 if the
  monogram ever changes; don't hand-edit the path data.

## 4. Typography

| Use | Font | Weights | Notes |
|---|---|---|---|
| Display & UI | **Montserrat** | 400 / 500 / 600 / 700 / 800 | Headings at 800. Body 400, line-height 1.65. |
| Timecode / labels | **JetBrains Mono** | 400 / 600 | Uppercase micro-labels, `letter-spacing ~0.12em`, size `0.75rem` (`--fs-mono-label`). |

Fluid scale (don't invent sizes): `--fs-hero clamp(2.3rem,4.6vw,3.8rem)`,
`--fs-h2 clamp(1.75rem,3.1vw,2.5rem)`, `--fs-h3 1.2rem`, `--fs-lead 1.1rem`, `--fs-body 1rem`,
`--fs-price clamp(1.9rem,2.8vw,2.4rem)`.
Load via Google Fonts: `Montserrat:wght@400;500;600;700;800` + `JetBrains+Mono:wght@400;600`.

## 5. Motifs (the detail language)

Use these — and only these — for decorative flavor. Each means something:

- **Timecode ruler** (`.tc-ruler`): frame-tick baseline; anchors sections and the mark.
- **Playhead** (`.playhead`): amber vertical bar; marks "you are here" / featured items.
- **Mono eyebrow** (`.tc-label`): `SC 01A ·`-style scene labels above headings.
- **In/out brackets** (`.io-brackets`): corner brackets framing key content.
- **Amber marker underline** (`.hl`): highlighter sweep on key phrases.
- **Waveform strips**: audio texture on dark bands.
- **REC chip**: red recording dot for "live/now" states.
- **Film grain**: footer only.

## 6. Geometry & motion

- Radii: `--radius-s 10px`, `--radius-m 16px`, `--radius-l 22px`. Friendly and soft; never square.
- Container: `1180px`. Card shadow: `0 1px 2px rgba(90,68,20,.05), 0 6px 22px rgba(90,68,20,.07)` (warm-tinted — never neutral gray shadows).
- Easing: out `cubic-bezier(0.22,1,0.36,1)`, in-out `cubic-bezier(0.65,0,0.35,1)`.
- Durations: fast 180ms, medium 320ms, reveal 550ms. Respect `prefers-reduced-motion`.

## 7. Voice & bilinguality

- Tone: direct, outcome-focused, technically confident. "Short-form video that fills your
  calendar — not just your feed." Talk bookings and clients, not vanity metrics.
- **EN/FR parity is mandatory** on the website: every `data-i18n` key exists in both languages
  (`assets/translations.js`). New site copy ships in both languages in the same commit.
- FR formatting: prices as `1 499 $ CAD` (non-breaking space, `$` after), « guillemets » for quotes.
- Transactional email (portal): sent in the recipient's language (`users.lang`).

## 8. Digital hygiene

- **Cache-busting:** one stamp per release (`?v=YYYYMMDD`) applied to *all* versioned assets
  (CSS, JS, SVG marks) across *all* pages in the same commit. Never bump one file alone.
- **Asset paths:** always absolute (`/assets/...`) so every page — including 404 at any
  depth — resolves them.
- **Emails:** no CSS variables — use the literal hexes from §2 (paper `#FDFBF7` background,
  white card, ink `#262A33` text, one amber `#FFC24B` button per email).
- **Dark chrome exception:** the client portal app uses dark `--bay` chrome (it *is* an edit
  bay); marketing surfaces stay warm-light.
- The `tools/` dev scripts are published by Cloudflare Pages with the site — they must never
  contain secrets.
