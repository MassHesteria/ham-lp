/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/share/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=7200, max-age=7200, stale-while-revalidate=30',
            //value: 'public, s-maxage=31536000, max-age=31536000, immutable',
          },
        ],
      }
    ]
  }
};

export default nextConfig;
