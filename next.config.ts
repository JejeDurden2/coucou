import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

import { agentRewrites, legacyRedirects, varyAcceptHeaders } from "./lib/site-routes";

// Assemblage seul : les tables de routage et leurs raisons vivent dans
// lib/site-routes.ts, qui se lit et se teste sans charger Sentry.
const nextConfig: NextConfig = {
  redirects: async () => legacyRedirects,
  rewrites: async () => agentRewrites,
  headers: async () => varyAcceptHeaders,
};

export default withSentryConfig(nextConfig, {
  silent: true,
  // ponytail: no SENTRY_AUTH_TOKEN yet; enable uploads when it lands in Vercel env
  sourcemaps: { disable: true },
});
