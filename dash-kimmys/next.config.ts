import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN,
  },
  /* config options here */
};

export default nextConfig;
