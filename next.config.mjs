/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      { source: "/sign-in", destination: "/login" },
      { source: "/b/:businessSlug/book", destination: "/b/:businessSlug" },
      { source: "/app/calendar", destination: "/dashboard/jobs" },
      { source: "/app/services", destination: "/dashboard/catalogue" },
      { source: "/app/staff", destination: "/dashboard/settings" },
      { source: "/app/subscription", destination: "/dashboard/settings" },
      { source: "/app/assets", destination: "/dashboard/customers" },
      { source: "/app/payments", destination: "/dashboard/invoices" },
      { source: "/app/maintenance", destination: "/dashboard/complaints" },
      { source: "/app", destination: "/dashboard" },
      { source: "/app/:path*", destination: "/dashboard/:path*" },
    ];
  },
};

export default nextConfig;
