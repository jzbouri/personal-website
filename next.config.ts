import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lastfm.freetls.fastly.net" },
      { protocol: "https", hostname: "lastfm-img2.akamaized.net" },
    ],
  },
};

export default nextConfig;
