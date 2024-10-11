/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', ''),
        port: '',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
}

module.exports = nextConfig

// Enable source maps in development
if (process.env.NODE_ENV === 'development') {
  module.exports.webpack = (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = 'source-map'
    }
    return config
  }
}
