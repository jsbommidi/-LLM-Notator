/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
      env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9847',
    },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
                  destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9847'}/:path*`,
      },
    ];
  },
}

module.exports = nextConfig 