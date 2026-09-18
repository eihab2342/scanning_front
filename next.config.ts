import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The backend's package-lock.json one level up otherwise makes Next.js
  // (Turbopack) guess the workspace root incorrectly — this is a standalone
  // app, not part of a monorepo/workspace with the backend.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
