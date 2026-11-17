#!/usr/bin/env node
/**
 * Minimal structural validation for theme.json (no external ajv dependency).
 * Usage: node validate-theme.mjs [path/to/theme.json]
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const CONFIDENCE = new Set(["high", "medium", "low"]);
const DARK_DETECTION = new Set([
  "css-media",
  "class-data-theme",
  "browser-toggle",
  "manual-only",
  "none",
]);
const STRATEGIES = new Set(["data-theme", "prefers-color-scheme", "both"]);

function fail(msg) {
  console.error(`validate-theme: ${msg}`);
  process.exit(1);
}

function assertToken(obj, path) {
  if (!obj || typeof obj !== "object") fail(`${path}: expected token object`);
  if (!CONFIDENCE.has(obj.confidence)) fail(`${path}: invalid confidence`);
  if (!("value" in obj)) fail(`${path}: missing value`);
}

function main() {
  const path = resolve(process.cwd(), process.argv[2] ?? "theme.json");
  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    fail(`cannot parse JSON: ${e.message}`);
  }

  const { meta, shared, modes, candidates } = data;
  if (!meta) fail("missing meta");
  if (!meta.sourceUrl) fail("meta.sourceUrl required");
  if (!meta.extractedAt) fail("meta.extractedAt required");
  if (!["light", "dark"].includes(meta.defaultMode)) fail("meta.defaultMode must be light|dark");
  if (!DARK_DETECTION.has(meta.darkDetection)) fail("meta.darkDetection invalid");
  if (meta.themeStrategy && !STRATEGIES.has(meta.themeStrategy)) fail("meta.themeStrategy invalid");

  if (!modes?.light?.color) fail("modes.light.color required");
  assertToken(modes.light.color.background, "modes.light.color.background");
  assertToken(modes.light.color.text, "modes.light.color.text");

  if (!modes.dark) fail("modes.dark required (object)");
  if (!candidates?.light || !candidates?.dark) fail("candidates.light and candidates.dark required");

  for (const [role, tok] of Object.entries(modes.light.color)) {
    assertToken(tok, `modes.light.color.${role}`);
  }
  for (const [role, tok] of Object.entries(modes.dark.color ?? {})) {
    assertToken(tok, `modes.dark.color.${role}`);
  }

  const sans = shared?.font?.family?.sans;
  if (sans) assertToken(sans, "shared.font.family.sans");

  console.log(`OK: ${path}`);
}

main();