/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  async rewrites() {
    return [
      {
        // ทุก request ที่ frontend เรียก /api/... จะถูก proxy ไป backend
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*", // ถ้า backend path เป็น /api/auth/login
        // ถ้า backend path เป็น /auth/login (ไม่มี /api/) ให้เปลี่ยนเป็น:
        // destination: "http://localhost:3001/auth/:path*",
      },
    ];
  },
};

export default nextConfig;