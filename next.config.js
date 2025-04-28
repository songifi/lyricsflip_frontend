const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_TORII_URL: process.env.NEXT_PUBLIC_TORII_URL,
    NEXT_PUBLIC_RELAY_URL: process.env.NEXT_PUBLIC_RELAY_URL,
    NEXT_PUBLIC_PLAYER_ADDRESS: process.env.NEXT_PUBLIC_PLAYER_ADDRESS,
    NEXT_PUBLIC_PLAYER_PRIVATE_KEY: process.env.NEXT_PUBLIC_PLAYER_PRIVATE_KEY,
    NEXT_PUBLIC_MASTER_ADDRESS: process.env.NEXT_PUBLIC_MASTER_ADDRESS,
    NEXT_PUBLIC_MASTER_PRIVATE_KEY: process.env.NEXT_PUBLIC_MASTER_PRIVATE_KEY,
    NEXT_PUBLIC_ACCOUNT_CLASS_HASH: process.env.NEXT_PUBLIC_ACCOUNT_CLASS_HASH,
    NEXT_PUBLIC_FEE_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_FEE_TOKEN_ADDRESS,
  },
  webpack: (config, { isServer }) => {
    // Configure WASM handling
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    // Add rule for WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      use: [
        {
          loader: 'wasm-loader',
          options: {
            sync: true,
          },
        },
      ],
    });

    // Add polyfills for Node.js modules in client environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }

    return config;
  },
  // Enable source maps in development
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
};

module.exports = nextConfig; 