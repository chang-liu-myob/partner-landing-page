---
name: public-site-theme-to-scss
description: >-
  Analyzes a public website URL and extracts brand/design tokens into
  theme.json, then compiles SCSS theme partials for Next.js TypeScript
  (shared, light/dark tokens, CSS variables, typography mixins).
  Use when aligning a landing page to a partner site, generating
  src/styles/theme from a reference URL, or when the user asks to extract
  theme, colors, or typography from a public website. Does not generate
  Tailwind, @theme, or utility-class frameworks.
---

# Public site theme → SCSS (Next.js + TypeScript)

## Quick start

1. Validate the target URL (see [Security](#security)).
2. Run static extraction: `node .cursor/skills/public-site-theme-to-scss/scripts/extract-static.mjs <url> --out theme.json` (merge into hand-edited JSON if needed).
3. Validate: `node .cursor/skills/public-site-theme-to-scss/scripts/validate-theme.mjs theme.json`
4. Compile: `node .cursor/skills/public-site-theme-to-scss/scripts/compile-theme.mjs theme.json`
5. Wire `src/styles/globals.scss` and `layout.tsx`; write `THEME.md` with confidence notes.

Copy `scripts/compile-theme.mjs` into `scripts/theme/compile-theme.mjs` if the project should own the compiler long-term.

## Non-goals

- No Tailwind config, `@theme`, or utility-first CSS output.
- No vendoring full third-party stylesheets into the app.
- Do not copy light colors into `modes.dark` when dark was not detected (`fallbackDarkFromLight` is always false unless the user explicitly requests it).

## Project outputs (paths)

| Path | Role |
|------|------|
| `theme.json` | Source of truth |
| `theme.schema.json` | Copy from skill `reference/theme.schema.json` if missing |
| `src/styles/theme/_shared.scss` | Fonts, spacing, radius, shadows (no colors) |
| `src/styles/theme/_tokens-light.scss` | Light mode colors |
| `src/styles/theme/_tokens-dark.scss` | Dark mode colors |
| `src/styles/theme/_css-vars.scss` | `:root`, `[data-theme]`, optional `prefers-color-scheme` |
| `src/styles/theme/_typography.scss` | Mixins; use `var(--color-*)` for text colors |
| `src/styles/theme/_index.scss` | `@forward` |
| `src/styles/theme/tokens.ts` | Optional; same compile pass |
| `THEME.md` | Source, timestamps, low-confidence tokens, layout wiring |

**Wiring:** `layout.tsx` → `import '@/styles/globals.scss'`; components use `*.module.scss` with `@use` for spacing/type; **colors via `var(--color-*)`**.

## `theme.json` contract

See [reference/theme.schema.json](reference/theme.schema.json). Structure:

- `meta`: `sourceUrl`, `extractedAt`, `defaultMode`, `darkDetection`, optional `themeStrategy` (`data-theme` | `prefers-color-scheme` | `both`, default `both`)
- `shared`: mode-agnostic tokens (prefer fonts, space, radius, shadow here—not colors)
- `modes.light` / `modes.dark`: each has `color` roles at minimum `background` and `text` for light
- `candidates`: low-confidence extractions per mode

Token shape: `{ "value": "...", "confidence": "high"|"medium"|"low", "raw": "optional" }`

Only `high` and allowlisted `medium` colors compile into `_tokens-*.scss`; `low` stays in `candidates` only.

**Merge (compile):** `shared` → overlay `modes.<mode>` (mode wins). Never auto-fill empty dark from light.

## Extraction workflow

1. **Static:** HTML, linked CSS (size cap), `:root` / `[data-theme]` custom properties, `theme-color`, font provider links.
2. **Dark:** `@media (prefers-color-scheme: dark)`, `.dark`, `[data-theme="dark"]`; set `meta.darkDetection`.
3. **Browser (if needed):** Playwright toggle dark; sample computed styles on `button`, `a`, `header`, `main`.
4. **Normalize:** hex/rgba; optional 4px spacing snap.
5. Validate JSON, compile SCSS, document gaps in `THEME.md`.

## CSS variables strategy

Honor `meta.themeStrategy`:

- `data-theme`: `[data-theme='light']` / `[data-theme='dark']`
- `prefers-color-scheme`: media query defaults
- `both`: attribute wins; `:root:not([data-theme='light'])` uses dark in media block

## Security

- HTTPS only; reject localhost, private IPs (10/8, 172.16–31, 192.168/16, 127.x, ::1, 169.254.x), and non-http(s) schemes.
- Redirect limit (≤5); response size limits on HTML/CSS fetches.
- Note robots/ToS in `THEME.md`; user must have rights to reference the brand.

## Failure handling

| Condition | Action |
|-----------|--------|
| 403 / bot wall | Ask for CSS snippet or manual `theme.json` |
| No dark theme | Leave `modes.dark` sparse; mark `_tokens-dark.scss` header as incomplete |
| Ambiguous primary | Keep one `high` or ask user; rest in `candidates` |

## Checklist

- [ ] URL validated
- [ ] `theme.json` validates
- [ ] `compile-theme.mjs` run
- [ ] `THEME.md` updated
- [ ] No Tailwind artifacts
- [ ] `sass` package present if project uses SCSS

## Examples

**User:** “Extract theme from https://partner.example for our Next landing page.”

**Agent:** Extract → `theme.json` → validate → compile → summarize light/dark primary and background with confidence → link `THEME.md` for `layout.tsx` / `data-theme`.