import type { NextConfig } from "next";

/**
 * GitHub project Pages: https://<owner>.github.io/<repo-name>/
 * Only applied during `npm run build:gh-pages` (NODE_ENV=production + GITHUB_PAGES=true).
 */
const isGhPagesBuild =
  process.env.GITHUB_PAGES === "true" &&
  process.env.NODE_ENV === "production";

const repoFromEnv =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ??
  process.env.NEXT_PUBLIC_GITHUB_REPO_NAME;

const REPO_NAME = repoFromEnv || "partner-landing-page";

const nextConfig: NextConfig = {
  output: isGhPagesBuild ? "export" : undefined,
  trailingSlash: isGhPagesBuild,
  basePath: isGhPagesBuild ? `/${REPO_NAME}` : "",
  assetPrefix: isGhPagesBuild ? `/${REPO_NAME}/` : "",
  images: { unoptimized: true },
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;