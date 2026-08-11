/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Les images du prototype sont servies en local depuis /public/images.
    // Autoriser quelques hôtes distants au cas où on branche un CDN plus tard.
    remotePatterns: [],
  },
};

export default nextConfig;
