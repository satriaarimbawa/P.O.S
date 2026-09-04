/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ["@kopipos/shared-types", "@kopipos/shared-utils"],
};

export default nextConfig;
