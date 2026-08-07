import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.*"],
  transpilePackages: ["@mep-agency/next-iubenda"],
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  async headers() {
    if (process.env.NODE_ENV !== "development") return []

    return [
      {
        source: "/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ]
  },
}

export default nextConfig
