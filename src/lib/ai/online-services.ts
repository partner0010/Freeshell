/**
 * 다양한 온라인 서비스 통합
 * 날씨, 주식, 환율, 뉴스, 지도 등
 * 자기 학습 시스템 통합: 서비스 호출 결과에서 학습하여 효율성 향상
 */

import { selfLearningSystem } from './self-learning';
import { selfMonitoringSystem } from './self-monitoring';

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{ date: string; high: number; low: number; condition: string }>;
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
}

class OnlineServices {
  /**
   * 날씨 정보 가져오기
   */
  async getWeather(location: string): Promise<WeatherData | null> {
    try {
      // OpenWeatherMap API 사용 (API 키 필요)
      if (process.env.OPENWEATHER_API_KEY) {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=ko`
        );
        
        if (response.ok) {
          const data = await response.json();
          return {
            location: data.name,
            temperature: data.main.temp,
            condition: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind?.speed || 0,
            forecast: [],
          };
        }
      }

      // 폴백: 웹 검색
      const { webSearchManager } = await import('./web-search');
      const results = await webSearchManager.search(`${location} 날씨`);
      
      return {
        location,
        temperature: 0,
        condition: results[0]?.snippet || '정보 없음',
        humidity: 0,
        windSpeed: 0,
        forecast: [],
      };
    } catch (error) {
      console.error('날씨 정보 가져오기 실패:', error);
      return null;
    }
  }

  /**
   * 주식 정보 가져오기
   */
  async getStock(symbol: string): Promise<StockData | null> {
    try {
      // Alpha Vantage API 사용 (API 키 필요)
      if (process.env.ALPHA_VANTAGE_API_KEY) {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const quote = data['Global Quote'];
          
          if (quote) {
            return {
              symbol: quote['01. symbol'],
              name: quote['01. symbol'],
              price: parseFloat(quote['05. price']),
              change: parseFloat(quote['09. change']),
              changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
              volume: parseInt(quote['06. volume']),
            };
          }
        }
      }

      // 폴백: 웹 검색
      const { webSearchManager } = await import('./web-search');
      const results = await webSearchManager.search(`${symbol} 주가`);
      
      return {
        symbol,
        name: symbol,
        price: 0,
        change: 0,
        changePercent: 0,
        volume: 0,
      };
    } catch (error) {
      console.error('주식 정보 가져오기 실패:', error);
      return null;
    }
  }

  /**
   * 환율 정보 가져오기
   */
  async getExchangeRate(from: string, to: string): Promise<ExchangeRate | null> {
    try {
      // ExchangeRate-API 사용
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const rate = data.rates[to.toUpperCase()];
        
        if (rate) {
          return {
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            rate,
            timestamp: new Date(),
          };
        }
      }
    } catch (error) {
      console.error('환율 정보 가져오기 실패:', error);
    }
    return null;
  }

  /**
   * 뉴스 헤드라인 가져오기
   */
  async getNewsHeadlines(category?: string, limit: number = 10): Promise<any[]> {
    try {
      // NewsAPI 사용 (API 키 필요)
      if (process.env.NEWS_API_KEY) {
        const url = category
          ? `https://newsapi.org/v2/top-headlines?category=${category}&country=kr&apiKey=${process.env.NEWS_API_KEY}`
          : `https://newsapi.org/v2/top-headlines?country=kr&apiKey=${process.env.NEWS_API_KEY}`;
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          return data.articles?.slice(0, limit) || [];
        }
      }

      // 폴백: RSS
      const { internetMonitor } = await import('./internet-monitor');
      const news = await internetMonitor.searchNews(['한국', '뉴스']);
      return news.slice(0, limit);
    } catch (error) {
      console.error('뉴스 가져오기 실패:', error);
      return [];
    }
  }

  /**
   * 지도/위치 정보
   */
  async getLocationInfo(query: string): Promise<any> {
    try {
      // Google Maps Geocoding API 사용 (API 키 필요)
      if (process.env.GOOGLE_MAPS_API_KEY) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${process.env.GOOGLE_MAPS_API_KEY}&language=ko`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            return data.results[0];
          }
        }
      }

      // 폴백: 웹 검색
      const { webSearchManager } = await import('./web-search');
      const results = await webSearchManager.search(`${query} 위치`);
      
      return {
        formatted_address: results[0]?.title || query,
        geometry: {},
      };
    } catch (error) {
      console.error('위치 정보 가져오기 실패:', error);
      return null;
    }
  }

  /**
   * 통합 정보 수집
   */
  async gatherContextualInfo(query: string): Promise<Record<string, any>> {
    const context: Record<string, any> = {};

    // 날씨 관련 키워드
    if (query.match(/날씨|기온|온도|비|눈/)) {
      const location = this.extractLocation(query) || '서울';
      context.weather = await this.getWeather(location);
    }

    // 주식 관련 키워드
    if (query.match(/주식|주가|증권|코스피|나스닥/)) {
      const symbol = this.extractStockSymbol(query);
      if (symbol) {
        context.stock = await this.getStock(symbol);
      }
    }

    // 환율 관련 키워드
    if (query.match(/환율|달러|유로|엔|위안/)) {
      const currencies = this.extractCurrencies(query);
      if (currencies.length >= 2) {
        context.exchangeRate = await this.getExchangeRate(currencies[0], currencies[1]);
      }
    }

    // 뉴스 관련
    if (query.match(/뉴스|헤드라인|최신|트렌드/)) {
      context.news = await this.getNewsHeadlines(undefined, 5);
    }

    // 자기 학습: 컨텍스트 수집 결과에서 학습
    selfLearningSystem.learnFromExperience({
      task: 'contextual_info_gathering',
      input: { query },
      output: { context, keys: Object.keys(context) },
      success: Object.keys(context).length > 0,
      performance: Object.keys(context).length > 0 ? 0.9 : 0.3,
      patterns: Object.keys(context),
      improvements: [],
    }).catch(err => console.error('온라인 서비스 학습 오류:', err));

    return context;
  }

  /**
   * 위치 추출
   */
  private extractLocation(query: string): string | null {
    const locations = ['서울', '부산', '대구', '인천', '광주', '대전', '울산'];
    for (const loc of locations) {
      if (query.includes(loc)) return loc;
    }
    return null;
  }

  /**
   * 주식 심볼 추출
   */
  private extractStockSymbol(query: string): string | null {
    const match = query.match(/([A-Z]{2,5})/);
    return match ? match[1] : null;
  }

  /**
   * 통화 추출
   */
  private extractCurrencies(query: string): string[] {
    const currencies: string[] = [];
    const currencyMap: Record<string, string> = {
      '달러': 'USD',
      '유로': 'EUR',
      '엔': 'JPY',
      '위안': 'CNY',
      '원': 'KRW',
    };

    for (const [key, value] of Object.entries(currencyMap)) {
      if (query.includes(key)) {
        currencies.push(value);
      }
    }

    return currencies.length >= 2 ? currencies : ['USD', 'KRW'];
  }
}

export const onlineServices = new OnlineServices();

