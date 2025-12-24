/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignorar erros de TypeScript durante build (temporário)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignorar erros de ESLint durante build (temporário)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Outras configurações
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
