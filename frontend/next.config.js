/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Using pages directory (not app directory)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_APP_NAME: 'Barakah AI Agents',
    NEXT_PUBLIC_APP_DESCRIPTION: 'Enterprise AI Agents Platform'
  },
  async redirects() {
    return [
      {
        source: '/agents',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig