/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/pomodoragon' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/pomodoragon/' : '',
  trailingSlash: true,
}

module.exports = nextConfig 