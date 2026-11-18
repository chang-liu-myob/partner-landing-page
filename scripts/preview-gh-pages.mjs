#!/usr/bin/env node
/**
 * Preview static export the way GitHub project Pages routes URLs:
 * /partner-landing-page/* → files in out/*
 */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)), "out");
const repo =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ||
  process.env.NEXT_PUBLIC_GITHUB_REPO_NAME ||
  "partner-landing-page";
const base = `/${repo}`;
const port = Number(process.env.PORT || 8080);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

function send(res, status, body, type) {
  res.writeHead(status, { "Content-Type": type ?? "text/plain; charset=utf-8" });
  res.end(body);
}

function resolveFile(urlPath) {
  let rel = urlPath;
  if (rel.startsWith(base)) rel = rel.slice(base.length) || "/";
  if (rel.endsWith("/")) rel += "index.html";
  const file = join(root, rel);
  if (!file.startsWith(root)) return null;
  if (existsSync(file) && statSync(file).isFile()) return file;
  const htmlFallback = join(root, "404.html");
  if (existsSync(htmlFallback)) return htmlFallback;
  return null;
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
  if (url.pathname === "/") {
    res.writeHead(302, { Location: `${base}/` });
    res.end();
    return;
  }
  const file = resolveFile(url.pathname);
  if (!file) {
    send(res, 404, "Not found");
    return;
  }
  send(res, 200, readFileSync(file), mime[extname(file)] ?? "application/octet-stream");
}).listen(port, () => {
  console.log(`GitHub Pages preview: http://127.0.0.1:${port}${base}/`);
  console.log(`Serving: ${root}`);
});