// SEO 유틸리티 함수

export function generateStructuredData(type: 'WebApplication' | 'Organization' | 'Article', data: any) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  switch (type) {
    case 'WebApplication':
      return {
        ...baseSchema,
        name: data.name || 'Shell',
        description: data.description || '통합 AI 솔루션',
        url: data.url || 'https://freeshell.co.kr',
        applicationCategory: 'SearchApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: data.price || '0',
          priceCurrency: 'USD',
        },
      };
    case 'Organization':
      return {
        ...baseSchema,
        name: data.name || 'Shell',
        url: data.url || 'https://freeshell.co.kr',
        logo: data.logo || 'https://freeshell.co.kr/logo.png',
        sameAs: data.socialLinks || [],
      };
    case 'Article':
      return {
        ...baseSchema,
        headline: data.headline,
        author: {
          '@type': 'Person',
          name: data.author || 'Shell Team',
        },
        datePublished: data.datePublished,
        dateModified: data.dateModified || data.datePublished,
      };
    default:
      return baseSchema;
  }
}

export function generateMetaTags(data: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}) {
  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      url: data.url,
      siteName: 'Shell',
      images: data.image ? [{ url: data.image }] : [],
      locale: 'ko_KR',
      type: data.type || 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      images: data.image ? [data.image] : [],
    },
  };
}

