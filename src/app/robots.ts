import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/account/', '/login', '/register'],
      },
    ],
    sitemap: 'https://jobboard.ke/sitemap.xml',
  };
}