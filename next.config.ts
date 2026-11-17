import type { NextConfig } from "next";
import { REMOTE_IMAGE_PATTERNS } from "./src/utils/remote-images";

const nextConfig: NextConfig = {
  images: {
    // Mesma lista que o schema de produto usa para validar capas e galeria.
    remotePatterns: [...REMOTE_IMAGE_PATTERNS],
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
