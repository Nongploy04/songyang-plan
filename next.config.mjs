import path from 'node:path';
import { fileURLToPath } from 'node:url';

const isDev = process.env.NODE_ENV !== 'production';
const root = path.dirname(fileURLToPath(import.meta.url));

const baseCsp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'self' https://songyang-portal.vercel.app https://songyang-portal-nextc2.vercel.app; form-action 'self'";
const csp = isDev
  ? baseCsp
      .replace("frame-ancestors 'self' https://songyang-portal.vercel.app https://songyang-portal-nextc2.vercel.app", "frame-ancestors 'self' *")
      .replace("script-src 'self' 'unsafe-inline'", "script-src 'self' 'unsafe-inline' 'unsafe-eval'")
  : baseCsp;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: root,
  typescript: {
    tsconfigPath: 'tsconfig.next.json',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          ...(isDev ? [] : [{ key: 'X-Frame-Options', value: 'DENY' }]),
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
