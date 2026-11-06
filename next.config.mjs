/** @type {import('next').NextConfig} */
export default {
  images: { formats: ["image/avif", "image/webp"], minimumCacheTTL: 31536000 },
  poweredByHeader: false,
  compress: true,
  experimental: { optimizePackageImports: ["framer-motion"] },
  async headers() {
    const long = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return ["/img/:path*", "/tex/:path*", "/audio/:path*", "/video/:path*"].map((source) => ({ source, headers: long }));
  },
};
