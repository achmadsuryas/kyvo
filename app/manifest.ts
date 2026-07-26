import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kyvo — One Link. Everywhere.',
    short_name: 'Kyvo',
    description: 'Create your personal page, share all your social media, portfolio, videos, stores and more in one beautiful place.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F9FA',
    theme_color: '#FFD43B',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
