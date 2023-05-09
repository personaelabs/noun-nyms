/** @type {import('next').NextConfig} */
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-syntax-highlighter', 'swagger-client', 'swagger-ui-react'],
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    config.experiments = { asyncWebAssembly: true, layers: true };
    config.plugins.push(
      new FilterWarningsPlugin({
        exclude: [/Critical dependency: the request of a dependency is an expression/],
      }),
    );
    return config;
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
