/**
 * 웹 스크래핑 도구
 * Web Scraping Tool
 */

export interface ScrapingOptions {
  url: string;
  selectors?: {
    title?: string;
    content?: string;
    images?: string;
    links?: string;
  };
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ScrapingResult {
  url: string;
  title?: string;
  content?: string;
  images?: string[];
  links?: string[];
  metadata?: Record<string, string>;
  error?: string;
}

// 웹 스크래핑 도구
export class WebScraper {
  // URL에서 데이터 추출
  async scrape(options: ScrapingOptions): Promise<ScrapingResult> {
    try {
      // CORS 문제로 인해 프록시나 백엔드 API 필요
      // 여기서는 시뮬레이션
      const response = await fetch(options.url, {
        headers: options.headers || {},
        signal: AbortSignal.timeout(options.timeout || 10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 응답 크기 제한 (10MB)
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
        throw new Error('Response too large (max 10MB)');
      }

      const html = await response.text();
      
      // 실제 크기 검증
      if (html.length > 10 * 1024 * 1024) {
        throw new Error('Response content too large (max 10MB)');
      }
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const result: ScrapingResult = {
        url: options.url,
      };

      // 제목 추출
      if (options.selectors?.title) {
        const titleEl = doc.querySelector(options.selectors.title);
        result.title = titleEl?.textContent?.trim();
      } else {
        result.title = doc.querySelector('title')?.textContent?.trim();
      }

      // 콘텐츠 추출
      if (options.selectors?.content) {
        const contentEl = doc.querySelector(options.selectors.content);
        result.content = contentEl?.textContent?.trim();
      }

      // 이미지 추출
      if (options.selectors?.images) {
        const images = Array.from(doc.querySelectorAll(options.selectors.images));
        result.images = images
          .map((img) => (img as HTMLImageElement).src)
          .filter((src) => src);
      } else {
        const images = Array.from(doc.querySelectorAll('img'));
        result.images = images
          .map((img) => img.src)
          .filter((src) => src)
          .slice(0, 10);
      }

      // 링크 추출
      if (options.selectors?.links) {
        const links = Array.from(doc.querySelectorAll(options.selectors.links));
        result.links = links
          .map((link) => (link as HTMLAnchorElement).href)
          .filter((href) => href);
      }

      // 메타데이터 추출
      const metaTags = Array.from(doc.querySelectorAll('meta'));
      const metadata: Record<string, string> = {};
      metaTags.forEach((meta) => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) {
          metadata[name] = content;
        }
      });
      result.metadata = metadata;

      return result;
    } catch (error) {
      return {
        url: options.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 여러 URL 일괄 처리
  async scrapeMultiple(urls: string[]): Promise<ScrapingResult[]> {
    const results = await Promise.all(
      urls.map((url) => this.scrape({ url }))
    );
    return results;
  }

  // SEO 데이터 추출
  async extractSEO(url: string): Promise<{
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
  }> {
    const result = await this.scrape({ url });
    return {
      title: result.title,
      description: result.metadata?.['description'],
      keywords: result.metadata?.['keywords'],
      ogImage: result.metadata?.['og:image'],
    };
  }
}

export const webScraper = new WebScraper();

