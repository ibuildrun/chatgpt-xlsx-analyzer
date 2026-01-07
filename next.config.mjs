/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable static export for GitHub Pages
  ...(isStaticExport && {
    output: 'export',
    basePath: '/chatgpt-xlsx-analyzer',
    assetPrefix: '/chatgpt-xlsx-analyzer/',
    trailingSlash: true,
    // Exclude API routes from static export
    experimental: {
      // This tells Next.js to skip API routes during static export
    },
  }),
  // Server packages only needed in non-static mode
  ...(!isStaticExport && {
    serverExternalPackages: ['xlsx', 'better-sqlite3'],
  }),
};

export default nextConfig;
