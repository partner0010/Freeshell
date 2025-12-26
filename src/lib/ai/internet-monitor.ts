/**
 * 실시간 인터넷 모니터링 및 자동 정보 수집
 * 자기 학습 시스템 통합: 모니터링 패턴 학습 및 최적화
 */

import { selfLearningSystem } from './self-learning';
import { selfMonitoringSystem } from './self-monitoring';
import { crossFeatureLearning } from './cross-feature-learning';

export interface MonitorConfig {
  keywords: string[];
  sources: string[];
  frequency: 'realtime' | 'hourly' | 'daily';
  callback?: (data: any) => void;
}

export interface NewsItem {
  title: string;
  url: string;
  summary: string;
  publishedAt: Date;
  source: string;
  relevance: number;
}

class InternetMonitor {
  private monitors: Map<string, MonitorConfig> = new Map();
  private newsCache: Map<string, NewsItem[]> = new Map();
  private rssFeeds: string[] = [];

  /**
   * 키워드 모니터링 시작
   */
  startMonitoring(id: string, config: MonitorConfig): void {
    this.monitors.set(id, config);
    
    // 실시간 모니터링
    if (config.frequency === 'realtime') {
      this.monitorRealtime(id, config);
    } else {
      this.scheduleMonitoring(id, config);
    }
  }

  /**
   * 실시간 모니터링
   */
  private async monitorRealtime(id: string, config: MonitorConfig): Promise<void> {
    setInterval(async () => {
      const news = await this.searchNews(config.keywords);
      const newItems = this.filterNewItems(news, id);
      
      if (newItems.length > 0 && config.callback) {
        config.callback(newItems);
      }
    }, 60000); // 1분마다 체크
  }

  /**
   * 스케줄 모니터링
   */
  private scheduleMonitoring(id: string, config: MonitorConfig): void {
    const interval = config.frequency === 'hourly' ? 3600000 : 86400000;
    
    setInterval(async () => {
      const news = await this.searchNews(config.keywords);
      if (config.callback) {
        config.callback(news);
      }
    }, interval);
  }

  /**
   * 뉴스 검색
   */
  async searchNews(keywords: string[]): Promise<NewsItem[]> {
    const query = keywords.join(' OR ');
    const cacheKey = query;
    
    // 캐시 확인
    if (this.newsCache.has(cacheKey)) {
      const cached = this.newsCache.get(cacheKey)!;
      if (cached.length > 0 && Date.now() - cached[0].publishedAt.getTime() < 300000) {
        return cached;
      }
    }

    try {
      // Google News RSS
      const news = await this.fetchGoogleNews(query);
      this.newsCache.set(cacheKey, news);

      // 자기 학습: 검색 성능 추적
      const performance = news.length > 0 ? Math.min(1.0, news.length / 20) : 0.3;
      selfLearningSystem.learnFromExperience({
        task: 'internet_monitoring',
        input: { keywords: keywords, query },
        output: { newsCount: news.length, avgRelevance: news.reduce((sum, item) => sum + item.relevance, 0) / news.length || 0 },
        success: news.length > 0,
        performance,
        patterns: ['news_search', `keywords_${keywords.length}`],
        improvements: [],
      }).catch(err => console.error('인터넷 모니터링 학습 오류:', err));

      return news;
    } catch (error) {
      console.error('뉴스 검색 실패:', error);
      
      // 실패 경험도 학습
      selfLearningSystem.learnFromExperience({
        task: 'internet_monitoring',
        input: { keywords: keywords, query },
        output: { error: (error as Error).message },
        success: false,
        performance: 0,
        patterns: ['news_search', 'failed'],
        improvements: [(error as Error).message],
      }).catch(err => console.error('인터넷 모니터링 학습 오류:', err));

      return [];
    }
  }

  /**
   * Google News RSS 가져오기
   */
  private async fetchGoogleNews(query: string): Promise<NewsItem[]> {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
      const response = await fetch(url);
      const xml = await response.text();
      
      return this.parseRSS(xml);
    } catch (error) {
      console.error('Google News 가져오기 실패:', error);
      return [];
    }
  }

  /**
   * RSS 파싱
   */
  private parseRSS(xml: string): NewsItem[] {
    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const title = this.extractTag(itemXml, 'title');
      const link = this.extractTag(itemXml, 'link');
      const description = this.extractTag(itemXml, 'description');
      const pubDate = this.extractTag(itemXml, 'pubDate');

      if (title && link) {
        items.push({
          title: this.cleanText(title),
          url: link,
          summary: this.cleanText(description || ''),
          publishedAt: new Date(pubDate || Date.now()),
          source: 'Google News',
          relevance: 1.0,
        });
      }
    }

    return items.slice(0, 20);
  }

  /**
   * XML 태그 추출
   */
  private extractTag(xml: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
  }

  /**
   * 텍스트 정리
   */
  private cleanText(text: string): string {
    return text
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .trim();
  }

  /**
   * 새로운 아이템 필터링
   */
  private filterNewItems(items: NewsItem[], monitorId: string): NewsItem[] {
    const cached = this.newsCache.get(monitorId) || [];
    const cachedUrls = new Set(cached.map(item => item.url));
    
    return items.filter(item => !cachedUrls.has(item.url));
  }

  /**
   * 트렌드 분석
   */
  async analyzeTrends(keywords: string[], days: number = 7): Promise<any> {
    const allNews: NewsItem[] = [];
    
    for (const keyword of keywords) {
      const news = await this.searchNews([keyword]);
      allNews.push(...news.filter(item => {
        const daysAgo = Date.now() - days * 24 * 60 * 60 * 1000;
        return item.publishedAt.getTime() > daysAgo;
      }));
    }

    // 키워드별 빈도 분석
    const keywordFrequency: Record<string, number> = {};
    allNews.forEach(item => {
      keywords.forEach(keyword => {
        if (item.title.toLowerCase().includes(keyword.toLowerCase()) ||
            item.summary.toLowerCase().includes(keyword.toLowerCase())) {
          keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1;
        }
      });
    });

    const result = {
      totalItems: allNews.length,
      keywordFrequency,
      topItems: allNews
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
        .slice(0, 10),
    };

    // 자기 학습: 트렌드 분석 성능 추적
    const performance = allNews.length > 0 ? Math.min(1.0, allNews.length / 100) : 0.3;
    selfLearningSystem.learnFromExperience({
      task: 'trend_analysis',
      input: { keywords, days },
      output: result,
      success: allNews.length > 0,
      performance,
      patterns: ['trend_analysis', `keywords_${keywords.length}`, `days_${days}`],
      improvements: [],
    }).catch(err => console.error('트렌드 분석 학습 오류:', err));

    // 크로스 기능 학습: 트렌드 분석 패턴 전파
    crossFeatureLearning.shareExperience('internet-monitor', {
      task: 'trend_analysis',
      output: result,
      success: allNews.length > 0,
      performance,
    }).catch(err => console.error('크로스 기능 학습 오류:', err));

    return result;
  }

  /**
   * 모니터링 중지
   */
  stopMonitoring(id: string): void {
    this.monitors.delete(id);
  }
}

export const internetMonitor = new InternetMonitor();

