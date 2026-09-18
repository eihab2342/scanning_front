import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The backend's package-lock.json one level up otherwise makes Next.js
  // (Turbopack) guess the workspace root incorrectly — this is a standalone
  // app, not part of a monorepo/workspace with the backend.
  turbopack: {
    root: path.join(__dirname),
  },
  // Production builds fall back to the deployed Railway API when
  // NEXT_PUBLIC_API_BASE_URL isn't set on the host (.env.local is gitignored,
  // so the deployed build otherwise defaulted to localhost:3000 — which then
  // resolves on each visitor's own machine). An explicit value from the
  // host/.env files always wins; local dev is unaffected.
  env:
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NODE_ENV !== "production"
      ? {}
      : { NEXT_PUBLIC_API_BASE_URL: "https://scanningback-production.up.railway.app/api" },
};

export default nextConfig;
