import type { NextConfig } from "next";

const emptyModule = "./src/lib/empty-module.js";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // Tailles adaptées aux cercles décoratifs (~96–288 CSS px)
    imageSizes: [96, 128, 160, 176, 192, 220, 256, 320, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    formats: ["image/avif", "image/webp"],
  },
  // Navigateurs modernes uniquement → réduit l'alerte PageSpeed « Ancien JavaScript »
  turbopack: {
    resolveAlias: {
      "next/dist/build/polyfills/polyfill-module": emptyModule,
      "next/dist/build/polyfills/polyfill-nomodule": emptyModule,
      "next/dist/esm/build/polyfills/polyfill-module": emptyModule,
      "next/dist/esm/build/polyfills/polyfill-nomodule": emptyModule,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "next/dist/build/polyfills/polyfill-module": emptyModule,
      "next/dist/build/polyfills/polyfill-nomodule": emptyModule,
      "next/dist/esm/build/polyfills/polyfill-module": emptyModule,
      "next/dist/esm/build/polyfills/polyfill-nomodule": emptyModule,
    };
    return config;
  },
};

export default nextConfig;
