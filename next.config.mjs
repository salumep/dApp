import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.moralis.io', 'coin-images.coingecko.com'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      'pino-pretty': false,
      '@react-native-async-storage/async-storage': false,
      lokijs: false,
    };

    return config;
  },
};

// Export the configuration with PWA support
export default withPWA({
  dest: 'public', // Destination directory for the PWA files
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development mode
  register: true, // Register the service worker
  skipWaiting: true, // Skip waiting for the service worker activation
})(nextConfig);
