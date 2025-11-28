/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ANTD_DISABLE_REACT19_WARNING: "true",
  },
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:8088";
    return [
      { source: "/api/modbus/:path*", destination: `${backend}/api/modbus/:path*` },
      { source: "/ws/:path*", destination: `${backend}/ws/:path*` },
    ];
  },
};

export default nextConfig;
