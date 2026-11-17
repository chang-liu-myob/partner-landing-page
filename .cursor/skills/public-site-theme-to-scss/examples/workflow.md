# Example workflow

```bash
# From repository root
node .cursor/skills/public-site-theme-to-scss/scripts/extract-static.mjs https://example.com --out theme.json
node .cursor/skills/public-site-theme-to-scss/scripts/validate-theme.mjs theme.json
# Raise confidence on roles you verified; move guesses to candidates.*
node .cursor/skills/public-site-theme-to-scss/scripts/compile-theme.mjs theme.json
```

Then add to `src/app/layout.tsx`:

```ts
import "@/styles/globals.scss";
```

Minimal `src/styles/globals.scss`:

```scss
@use "theme/css-vars";
```

Set `data-theme` on `<html>` when using the toggle pattern documented in `THEME.md`.