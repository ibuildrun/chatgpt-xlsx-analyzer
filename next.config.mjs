/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['xlsx', 'better-sqlite3'],
  // GitHub Pages requires static export
  ...(isGitHubPages && {
    output: 'export',
    basePath: '/chatgpt-xlsx-analyzer',
    trailingSlash: true,
  }),
};

export default nextConfig;
