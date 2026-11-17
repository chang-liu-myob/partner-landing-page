# Canva theme (`https://www.canva.com/en_au/`)

Generated: 2026-11-18

## Extraction summary

| Step | Result |
|------|--------|
| Static fetch (`extract-static.mjs`) | **0 CSS variables** — Canva returns an “Unsupported client” challenge for non-browser fetchers |
| Browser-equivalent fetch | Blocked / minimal HTML; **Open Sans** stylesheet link observed |
| `meta.darkDetection` | `none` (marketing page dark theme not machine-readable) |

## Sources used for tokens

1. **Typography**: `Open Sans` (300/400/600/700) from Google Fonts link in Canva HTML (`high`).
2. **Brand gradient**: [Canva newsroom — New logo](https://www.canva.com/newsroom/news/new-logo-canva/) — turquoise-to-purple gradient; tokens `#00C4CC` → `#7D2AE7` (`high` for primary/secondary).
3. **Light UI**: White background, near-black text `#0D1216` (`high` / marketing convention).
4. **Dark UI**: **Not extracted from site.** `modes.dark` values are **medium/low** placeholders for partner landing parity; review before production.
5. **Rights**: Align landing visuals with your partnership agreement; this file does not reproduce Canva CSS.

## Confidence highlights

### Light

| Role | Value | Confidence |
|------|-------|------------|
| `primary` | `#7D2AE7` | high |
| `secondary` | `#00C4CC` | high |
| `background` | `#FFFFFF` | high |
| `text` | `#0D1216` | high |
| `link` | `#8B3DFF` | medium |

### Dark

| Role | Value | Confidence |
|------|-------|------------|
| `background` | `#1B1F23` | medium |
| `primary` | `#9B66FF` | medium |
| `surface`, `text-muted`, `link`, `border` | see `theme.json` | low → listed in `candidates.dark` |

## Wiring (`layout.tsx`)

- `data-theme="light"` on `<html>` (override with a client toggle later).
- `import "@/styles/globals.scss"` for Canva CSS variables.
- `next/font/google` **Open Sans** → `--font-open-sans`.

Existing `globals.css` remains for Tailwind on scaffold pages until components migrate to SCSS modules.

## Regenerate

```bash
node .cursor/skills/public-site-theme-to-scss/scripts/validate-theme.mjs theme.json
node .cursor/skills/public-site-theme-to-scss/scripts/compile-theme.mjs theme.json
```

## Robots / ToS

Automated extraction hit bot protection. Tokens were curated from public brand statements and partial HTML. Do not bulk-scrape Canva.