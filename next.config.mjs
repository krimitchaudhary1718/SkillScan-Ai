/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from external sources (Google profile pics, etc.)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },

  // Webpack config for pdf-parse compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle pdf-parse on client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
      };
    }
    return config;
  },

  // Environment variables validation
  env: {
    CUSTOM_ENV_CHECK: 'loaded',
  },

  serverExternalPackages: ['pdf-parse', 'mongoose'],
  
  turbopack: {},

  // Move the Next.js dev indicator away from the sidebar
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },
};

export default nextConfig;
