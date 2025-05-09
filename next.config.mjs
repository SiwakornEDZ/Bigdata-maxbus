/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com', 'randomuser.me'],
  },
  // ลบ swcMinify ออกเนื่องจากมีคำเตือนว่าไม่รองรับ
  // swcMinify: true,
  
  // เพิ่ม experimental เพื่อรองรับ serverComponentsExternalPackages
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs"],
  },
  
  // Ensure SWC is used for compilation
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true
  },
  webpack: (config) => {
    // Add support for importing .node files
    config.resolve.extensions.push('.node');
    
    // Fix module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    return config;
  },
};

export default nextConfig;

