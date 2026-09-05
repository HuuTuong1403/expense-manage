import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["exceljs", "qrcode", "mongoose"],
};

export default nextConfig;
