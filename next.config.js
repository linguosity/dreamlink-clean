/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
  // Use a more compatible output mode for Vercel
  output: 'standalone',
  reactStrictMode: true,
}

module.exports = nextConfig
