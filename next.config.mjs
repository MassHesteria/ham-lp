/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/share/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, max-age=60, stale-while-revalidate=30',
          },
        ],
      },
    ]
  }
};

export default nextConfig;
