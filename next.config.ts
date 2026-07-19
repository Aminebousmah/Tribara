import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // pdfjs-dist déclare une dépendance optionnelle vers `canvas`, utile
    // uniquement pour un rendu côté Node. Ici les PDF sont lus dans le
    // navigateur : on neutralise l'import pour éviter ce module natif.
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    return config;
  },
};

export default nextConfig;
