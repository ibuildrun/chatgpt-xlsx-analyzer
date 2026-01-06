const isGitHubPages = process.env.GITHUB_PAGES === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isGitHubPages ? {
    output: 'export',
    basePath: '/chatgpt-xlsx-analyzer',
    assetPrefix: '/chatgpt-xlsx-analyzer/',
  } : {}),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['xlsx'],
};

export default nextConfig;
