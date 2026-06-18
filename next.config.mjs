/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 15: stable, top-level. Keep Mongoose/bcryptjs out of the bundle
  // (they pull optional native deps that must run in Node, not be bundled).
  serverExternalPackages: ["mongoose", "bcryptjs"],
  // Lint is run separately via `npm run lint`; don't block production builds on
  // style warnings. TypeScript type-checking still runs during the build.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
