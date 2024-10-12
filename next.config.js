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
    // Set the cache control for images
    minimumCacheTTL: 60, // Minimum time to cache images in seconds
  },
}

module.exports = nextConfig
