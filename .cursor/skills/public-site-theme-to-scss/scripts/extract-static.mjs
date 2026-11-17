#!/usr/bin/env node
/**
 * SSRF-safe static fetch + naive CSS custom-property extraction.
 * Usage: node extract-static.mjs <https-url> [--out theme.json] [--merge path]
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { URL } from "node:url";
import { isIP } from "node:net";

const MAX_HTML_BYTES = 2 * 1024 * 1024;
const MAX_CSS_BYTES = 1 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const FETCH_TIMEOUT_MS = 20_000;

const VAR_RE =
  /--([\w-]+)\s*:\s*([^;]+);/gi;
const THEME_COLOR_RE =
  /<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i;

function fail(msg) {
  console.error(`extract-static: ${msg}`);
  process.exit(1);
}

function isPrivateIp(host) {
  const ip = isIP(host);
  if (ip === 4) {
    const parts = host.split(".").map(Number);
    if (parts[0] === 10) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  }
  if (ip === 6) {
    const h = host.toLowerCase();
    if (h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80"))
      return true;
  }
  return false;
}

function assertPublicUrl(input) {
  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    fail("invalid URL");
  }
  if (parsed.protocol !== "https:") fail("only https URLs are allowed");
  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) fail("localhost blocked");
  if (isPrivateIp(host)) fail("private/reserved host blocked");
  return parsed;
}

async function safeFetch(url, redirectsLeft = MAX_REDIRECTS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": "partner-landing-theme-extract/1.0" },
    });
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.headers.get("location");
      if (!loc) fail(`redirect without location from ${url}`);
      if (redirectsLeft <= 0) fail("too many redirects");
      const next = new URL(loc, url);
      assertPublicUrl(next.href);
      return safeFetch(next.href, redirectsLeft - 1);
    }
    if (!res.ok) fail(`HTTP ${res.status} for ${url}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function readLimitedText(res, limit) {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) fail(`response exceeded ${limit} bytes`);
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function extractVars(css) {
  const vars = new Map();
  let m;
  while ((m = VAR_RE.exec(css)) !== null) {
    vars.set(m[1], m[2].trim());
  }
  return vars;
}

function pickColor(vars, names) {
  for (const n of names) {
    const v = vars.get(n);
    if (v && /#|rgb|hsl/i.test(v)) return v.replace(/\s+/g, " ");
  }
  return null;
}

function token(value, confidence = "medium", raw) {
  const t = { value, confidence };
  if (raw) t.raw = raw;
  return t;
}

function stylesheetUrls(html, base) {
  const urls = [];
  const re = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    const hrefM = /href=["']([^"']+)["']/i.exec(tag);
    if (hrefM) {
      try {
        urls.push(new URL(hrefM[1], base).href);
      } catch {
        /* skip */
      }
    }
  }
  return urls.slice(0, 8);
}

function mergeTheme(base, patch) {
  return {
    ...base,
    meta: { ...base.meta, ...patch.meta },
    shared: deepMerge(base.shared ?? {}, patch.shared ?? {}),
    modes: {
      light: {
        color: { ...base.modes?.light?.color, ...patch.modes?.light?.color },
      },
      dark: {
        color: { ...base.modes?.dark?.color, ...patch.modes?.dark?.color },
      },
    },
    candidates: patch.candidates ?? base.candidates,
  };
}

function deepMerge(a, b) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    if (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Object && "value" in v)) {
      out[k] = deepMerge(a[k] ?? {}, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function emptyTheme(sourceUrl) {
  return {
    meta: {
      sourceUrl,
      extractedAt: new Date().toISOString(),
      defaultMode: "light",
      darkDetection: "none",
      themeStrategy: "both",
    },
    shared: { font: { family: {}, size: {}, weight: {} }, space: {}, radius: {}, shadow: {} },
    modes: {
      light: {
        color: {
          background: token("#ffffff", "low"),
          text: token("#1a1a1a", "low"),
        },
      },
      dark: { color: {} },
    },
    candidates: { light: [], dark: [] },
  };
}

async function main() {
  const argv = process.argv.slice(2);
  const urlArg = argv.find((a) => a.startsWith("http"));
  if (!urlArg) fail("usage: extract-static.mjs <https-url> [--out theme.json] [--merge path]");
  let outPath = resolve(process.cwd(), "theme.json");
  let mergePath;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--out" && argv[i + 1]) outPath = resolve(process.cwd(), argv[++i]);
    if (argv[i] === "--merge" && argv[i + 1]) mergePath = resolve(process.cwd(), argv[++i]);
  }

  const startUrl = assertPublicUrl(urlArg).href;
  const htmlRes = await safeFetch(startUrl);
  const html = await readLimitedText(htmlRes, MAX_HTML_BYTES);

  let css = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "$1\n");
  const links = stylesheetUrls(html, startUrl);
  for (const sheetUrl of links) {
    assertPublicUrl(sheetUrl);
    const cssRes = await safeFetch(sheetUrl);
    css += "\n" + (await readLimitedText(cssRes, MAX_CSS_BYTES));
  }

  const vars = extractVars(css);
  const themeColor = THEME_COLOR_RE.exec(html)?.[1] ?? null;

  const bg = pickColor(vars, [
    "color-background",
    "background",
    "bg",
    "surface",
    "color-bg",
  ]);
  const text = pickColor(vars, ["color-text", "text", "foreground", "color-foreground"]);
  const primary =
    themeColor ||
    pickColor(vars, ["color-primary", "primary", "brand", "accent"]);

  let theme = emptyTheme(startUrl);
  if (mergePath) {
    theme = JSON.parse(readFileSync(mergePath, "utf8"));
    theme.meta.sourceUrl = startUrl;
    theme.meta.extractedAt = new Date().toISOString();
  }

  if (bg) theme.modes.light.color.background = token(bg, "medium", "css-var");
  if (text) theme.modes.light.color.text = token(text, "medium", "css-var");
  if (primary) theme.modes.light.color.primary = token(primary, "medium", "css-var/meta");

  if (/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)/i.test(css)) {
    theme.meta.darkDetection = "css-media";
  } else if (/\[data-theme\s*=\s*["']dark["']\]/i.test(css)) {
    theme.meta.darkDetection = "class-data-theme";
  }

  const darkSlice = css.match(
    /@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{([\s\S]*?)\n\}/i
  );
  if (darkSlice) {
    const darkVars = extractVars(darkSlice[1]);
    const dBg = pickColor(darkVars, ["color-background", "background", "bg"]);
    const dText = pickColor(darkVars, ["color-text", "text", "foreground"]);
  if (dBg) theme.modes.dark.color.background = token(dBg, "medium", "dark media");
    if (dText) theme.modes.dark.color.text = token(dText, "medium", "dark media");
  }

  writeFileSync(outPath, JSON.stringify(theme, null, 2) + "\n");
  console.log(`Wrote ${outPath} (${vars.size} CSS variables scanned)`);
}

main().catch((e) => fail(e.message ?? String(e)));