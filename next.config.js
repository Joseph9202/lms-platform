/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración optimizada para Docker
  output: 'standalone',
  
  // Optimizaciones de imagen
  images: {
    domains: [
      "utfs.io",
      "images.unsplash.com"
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
    // Optimización para contenedores
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
  },

  // Configuración experimental para mejor performance
  experimental: {
    // Optimización de bundle
    optimizeCss: true,
    // Compresión gzip
    gzipSize: true,
  },

  // Configuración de headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        // Cache estático para assets
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache para API health check
        source: '/api/health',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // Configuración de rewrites para API
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
      ],
    };
  },

  // Configuración de redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/teacher/courses',
        permanent: false,
      },
    ];
  },

  // Configuración de webpack para optimización
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimizaciones para producción
    if (!dev && !isServer) {
      // Análisis de bundle en CI/CD
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: './analyze/client.html',
          })
        );
      }

      // Optimización de chunks
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          enforce: true,
        },
        common: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
          enforce: true,
        },
      };
    }

    // Configuración para Docker
    if (process.env.DOCKER === 'true') {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    return config;
  },

  // Variables de entorno públicas
  env: {
    CUSTOM_BUILD_TIME: new Date().toISOString(),
    CUSTOM_BUILD_ID: process.env.GITHUB_SHA || 'local',
  },

  // Configuración de compilación
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Configuración de tipos TypeScript
  typescript: {
    // Ignorar errores de tipo en build de producción (solo para emergencias)
    ignoreBuildErrors: true,
  },

  // Configuración de ESLint
  eslint: {
    // Ignorar errores de ESLint en build de producción (solo para emergencias)
    ignoreDuringBuilds: false,
  },

  // Configuración de transpilación
  transpilePackages: [
    // Agregar paquetes que necesiten transpilación
  ],


};

module.exports = nextConfig;
