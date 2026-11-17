#!/usr/bin/env node
/**
 * Compile theme.json → SCSS + optional tokens.ts
 * Usage: node compile-theme.mjs [path/to/theme.json] [--out-dir src/styles/theme]
 */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MEDIUM_COLOR_ALLOWLIST = new Set([
  "primary-contrast",
  "link",
  "text-muted",
  "secondary",
  "border",
  "focus-ring",
]);

const HEADER = "/* Generated from theme.json — do not edit; re-run compile-theme.mjs */\n";

function parseArgs(argv) {
  const args = argv.slice(2);
  let themePath = "theme.json";
  let outDir = "src/styles/theme";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--out-dir" && args[i + 1]) {
      outDir = args[++i];
    } else if (!args[i].startsWith("-")) {
      themePath = args[i];
    }
  }
  return { themePath: resolve(process.cwd(), themePath), outDir: resolve(process.cwd(), outDir) };
}

function unwrap(token) {
  if (token == null) return null;
  if (typeof token === "string" || typeof token === "number") return token;
  return token.value ?? null;
}

function colorAllowed(token, role) {
  if (!token || typeof token !== "object") return false;
  const c = token.confidence;
  if (c === "high") return true;
  if (c === "medium" && MEDIUM_COLOR_ALLOWLIST.has(role)) return true;
  return false;
}

function scssString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function fontFamilyValue(token) {
  const list = unwrap(token);
  if (!Array.isArray(list)) return null;
  return list.map((f) => (/\s/.test(f) ? `'${scssString(f)}'` : f)).join(", ");
}

function emitSharedScss(shared) {
  const lines = [HEADER, "@use 'sass:map';\n"];
  const vars = [];
  const maps = { space: [], radius: [], shadow: [] };

  const font = shared.font ?? {};
  for (const [key, tok] of Object.entries(font.family ?? {})) {
    const v = fontFamilyValue(tok);
    if (v) vars.push(`$font-family-${key}: ${v} !default;`);
  }
  for (const [key, tok] of Object.entries(font.size ?? {})) {
    const v = unwrap(tok);
    if (v) vars.push(`$font-size-${key}: ${v} !default;`);
  }
  for (const [key, tok] of Object.entries(font.weight ?? {})) {
    const v = unwrap(tok);
    if (v != null) vars.push(`$font-weight-${key}: ${v} !default;`);
  }

  for (const group of ["space", "radius", "shadow"]) {
    for (const [key, tok] of Object.entries(shared[group] ?? {})) {
      const v = unwrap(tok);
      if (v) {
        vars.push(`$${group}-${key}: ${v} !default;`);
        maps[group].push(`  '${key}': $${group}-${key}`);
      }
    }
  }

  lines.push(vars.join("\n"), "\n");
  if (maps.space.length) {
    lines.push(`$space-scale: (\n${maps.space.join(",\n")}\n);\n`);
  }
  if (maps.radius.length) {
    lines.push(`$radius-scale: (\n${maps.radius.join(",\n")}\n);\n`);
  }
  return lines.join("\n");
}

function emitModeTokensScss(modeName, modeData) {
  if (!modeData?.color || Object.keys(modeData.color).length === 0) {
    return (
      HEADER +
      `// Mode "${modeName}" has no compiled colors — complete theme.json and recompile.\n`
    );
  }
  const varLines = [];
  const entries = [];
  for (const [role, tok] of Object.entries(modeData.color)) {
    if (!colorAllowed(tok, role)) continue;
    const v = unwrap(tok);
    if (v) {
      const varName = `$color-${role}`;
      varLines.push(`${varName}: ${v} !default;`);
      entries.push(`  '${role}': ${varName}`);
    }
  }
  const mapBlock =
    entries.length > 0 ? `\n$colors: (\n${entries.join(",\n")}\n);\n` : "";
  return HEADER + varLines.join("\n") + mapBlock;
}

function kebabVar(role) {
  return `--color-${role}`;
}

function emitCssVars(meta, light, dark) {
  const strategy = meta.themeStrategy ?? "both";
  const lines = [
    HEADER,
    "@use 'tokens-light' as light;",
    "@use 'tokens-dark' as dark;",
    "",
  ];

  function block(selector, prefix) {
    const out = [`${selector} {`];
    const colors = prefix === "light" ? light?.color : dark?.color;
    if (!colors) return [];
    for (const [role, tok] of Object.entries(colors)) {
      if (!colorAllowed(tok, role)) continue;
      const v = unwrap(tok);
      if (v) out.push(`  ${kebabVar(role)}: #{${prefix}.$color-${role}};`);
    }
    out.push("}");
    return out;
  }

  if (strategy === "data-theme" || strategy === "both") {
    lines.push(...block(":root, [data-theme='light']", "light"));
    lines.push("");
    lines.push(...block("[data-theme='dark']", "dark"));
  }

  if (strategy === "prefers-color-scheme" || strategy === "both") {
    lines.push("");
    lines.push("@media (prefers-color-scheme: dark) {");
    if (strategy === "both") {
      lines.push("  :root:not([data-theme='light']) {");
    } else {
      lines.push("  :root {");
    }
    const colors = dark?.color ?? {};
    for (const [role, tok] of Object.entries(colors)) {
      if (!colorAllowed(tok, role)) continue;
      const v = unwrap(tok);
      if (v) lines.push(`    ${kebabVar(role)}: #{dark.$color-${role}};`);
    }
    lines.push("  }");
    lines.push("}");
  }

  if (strategy === "prefers-color-scheme") {
    const rootBlock = block(":root", "light");
    lines.push(...rootBlock);
  }

  return lines.join("\n");
}

function emitTypographyScss() {
  return `${HEADER}@use 'shared' as s;

@mixin text-body {
  font-family: s.$font-family-sans, system-ui, sans-serif;
  font-size: s.$font-size-body;
  font-weight: s.$font-weight-regular;
  color: var(--color-text);
  line-height: 1.5;
}

@mixin heading-1 {
  font-size: s.$font-size-h1;
  font-weight: s.$font-weight-bold;
  color: var(--color-text);
  line-height: 1.2;
}
`;
}

function emitIndexScss() {
  return `${HEADER}@forward 'shared';
@forward 'tokens-light';
@forward 'tokens-dark';
@forward 'css-vars';
@forward 'typography';
`;
}

function emitTokensTs(theme) {
  function flattenColors(mode) {
    const out = {};
    for (const [role, tok] of Object.entries(theme.modes[mode]?.color ?? {})) {
      if (!colorAllowed(tok, role)) continue;
      const v = unwrap(tok);
      if (v) out[role] = v;
    }
    return out;
  }
  return `${HEADER}export type ThemeMode = 'light' | 'dark';
export const themeModes = ['light', 'dark'] as const;

export const colors = {
  light: ${JSON.stringify(flattenColors("light"), null, 2)},
  dark: ${JSON.stringify(flattenColors("dark"), null, 2)},
} as const;

export const meta = ${JSON.stringify(theme.meta, null, 2)} as const;
`;
}

function main() {
  const { themePath, outDir } = parseArgs(process.argv);
  const theme = JSON.parse(readFileSync(themePath, "utf8"));

  mkdirSync(outDir, { recursive: true });

  writeFileSync(join(outDir, "_shared.scss"), emitSharedScss(theme.shared ?? {}));
  writeFileSync(
    join(outDir, "_tokens-light.scss"),
    emitModeTokensScss("light", theme.modes?.light)
  );
  writeFileSync(
    join(outDir, "_tokens-dark.scss"),
    emitModeTokensScss("dark", theme.modes?.dark)
  );
  writeFileSync(
    join(outDir, "_css-vars.scss"),
    emitCssVars(theme.meta ?? {}, theme.modes?.light, theme.modes?.dark)
  );
  writeFileSync(join(outDir, "_typography.scss"), emitTypographyScss());
  writeFileSync(join(outDir, "_index.scss"), emitIndexScss());
  writeFileSync(join(outDir, "tokens.ts"), emitTokensTs(theme));

  console.log(`Wrote SCSS theme to ${outDir}`);
}

main();