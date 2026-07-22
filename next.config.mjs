/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "http",  hostname: "localhost" },
      { protocol: "http",  hostname: "backend" },
      { protocol: "https", hostname: "*.onrender.com" },
    ],
  },
};

export default nextConfig;
