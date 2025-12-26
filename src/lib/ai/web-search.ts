/**
 * 웹 검색 및 실시간 정보 수집
 * 자기 학습 시스템 통합: 검색 결과에서 학습하여 검색 품질 향상
 */

import { selfLearningSystem } from './self-learning';
import { selfMonitoringSystem } from './self-monitoring';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  date?: string;
  relevance?: number;
}

export interface WebSearchConfig {
  maxResults?: number;
  language?: string;
  region?: string;
  timeRange?: 'day' | 'week' | 'month' | 'year';
}

class WebSearchManager {
  /**
   * Google Custom Search API를 통한 웹 검색
   */
  async searchGoogle(query: string, config: WebSearchConfig = {}): Promise<SearchResult[]> {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      console.warn('Google Search API 키가 설정되지 않았습니다. 시뮬레이션 모드로 동작합니다.');
      return this.simulateSearch(query, config);
    }

    try {
      const url = new URL('https://www.googleapis.com/customsearch/v1');
      url.searchParams.set('key', apiKey);
      url.searchParams.set('cx', searchEngineId);
      url.searchParams.set('q', query);
      url.searchParams.set('num', String(config.maxResults || 10));

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.items) {
        return data.items.map((item: any) => ({
          title: item.title,
          url: item.link,
          snippet: item.snippet,
          relevance: 1.0,
        }));
      }

      return [];
    } catch (error) {
      console.error('Google 검색 실패:', error);
      return this.simulateSearch(query, config);
    }
  }

  /**
   * DuckDuckGo 검색 (API 키 불필요)
   */
  async searchDuckDuckGo(query: string, config: WebSearchConfig = {}): Promise<SearchResult[]> {
    try {
      // DuckDuckGo Instant Answer API
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const response = await fetch(url);
      const data = await response.json();

      const results: SearchResult[] = [];

      if (data.AbstractText) {
        results.push({
          title: data.Heading || query,
          url: data.AbstractURL || '',
          snippet: data.AbstractText,
          relevance: 1.0,
        });
      }

      if (data.RelatedTopics) {
        data.RelatedTopics.slice(0, config.maxResults || 5).forEach((topic: any) => {
          if (topic.Text) {
            results.push({
              title: topic.Text.split(' - ')[0],
              url: topic.FirstURL || '',
              snippet: topic.Text,
              relevance: 0.8,
            });
          }
        });
      }

      return results;
    } catch (error) {
      console.error('DuckDuckGo 검색 실패:', error);
      return this.simulateSearch(query, config);
    }
  }

  /**
   * 통합 검색 (여러 소스에서 검색)
   */
  async search(query: string, config: WebSearchConfig = {}): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    // Google 검색 시도
    try {
      const googleResults = await this.searchGoogle(query, config);
      results.push(...googleResults);
    } catch (error) {
      console.warn('Google 검색 실패:', error);
    }

    // DuckDuckGo 검색 시도
    try {
      const ddgResults = await this.searchDuckDuckGo(query, config);
      results.push(...ddgResults);
    } catch (error) {
      console.warn('DuckDuckGo 검색 실패:', error);
    }

    // 중복 제거 및 정렬
    const uniqueResults = this.deduplicateResults(results);
    const finalResults = uniqueResults.slice(0, config.maxResults || 10);

    // 자기 학습: 검색 결과에서 학습
    selfLearningSystem.learnFromExperience({
      task: 'web_search',
      input: { query, config },
      output: { results: finalResults, count: finalResults.length },
      success: finalResults.length > 0,
      performance: finalResults.length > 0 ? 0.9 : 0.3,
      patterns: ['web_search', 'information_retrieval'],
      improvements: finalResults.length === 0 ? ['검색 결과가 없습니다. 다른 키워드나 검색 전략을 시도하세요.'] : [],
    }).catch(err => console.error('웹 검색 학습 오류:', err));

    // 자기 모니터링: 성능 추적
    selfMonitoringSystem.recordPerformance({
      task: 'web_search',
      performance: finalResults.length > 0 ? 0.9 : 0.3,
      timestamp: new Date(),
    }).catch(err => console.error('성능 모니터링 오류:', err));

    return finalResults;
  }

  /**
   * 검색 결과 중복 제거
   */
  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      const key = result.url.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    }).sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
  }

  /**
   * 시뮬레이션 검색 (API 키 없을 때)
   */
  private simulateSearch(query: string, config: WebSearchConfig): SearchResult[] {
    return [
      {
        title: `${query} 관련 정보`,
        url: `https://example.com/search?q=${encodeURIComponent(query)}`,
        snippet: `${query}에 대한 최신 정보를 찾았습니다. 실제 검색을 위해서는 Google Search API 키를 설정하세요.`,
        relevance: 0.5,
      },
    ];
  }

  /**
   * 웹 페이지 내용 추출
   */
  async extractContent(url: string): Promise<string> {
    try {
      // 서버 사이드에서만 동작 (CORS 이슈)
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI Agent/1.0)',
        },
      });
      const html = await response.text();
      
      // 간단한 HTML 파싱 (실제로는 cheerio 등 사용 권장)
      const textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return textContent.substring(0, 5000); // 최대 5000자
    } catch (error) {
      console.error('웹 페이지 추출 실패:', error);
      return '';
    }
  }
}

export const webSearchManager = new WebSearchManager();

