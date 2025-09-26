/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Fix for OneDrive symlink issues
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  images: {
    unoptimized: true,
    // Allow images from Google Maps and other trusted sources
    domains: [
      'maps.googleapis.com',
      'maps.gstatic.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'images.unsplash.com',
      'placehold.co'
    ],
  },
  // Additional OneDrive fixes
  output: 'standalone',
}

export default nextConfig