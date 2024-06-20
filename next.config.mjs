/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/share/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=1200, max-age=1200, stale-while-revalidate=30',
            //value: 'public, s-maxage=31536000, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/token/:id*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=1200, max-age=1200, stale-while-revalidate=30',
            //value: 'public, s-maxage=31536000, max-age=31536000, immutable',
          },
        ],
      },
    ]
  }
};

export default nextConfig;
