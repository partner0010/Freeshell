/**
 * 투자 분석 API 클라이언트
 * 무료 주식/코인 API를 활용한 실시간 데이터 수집
 */

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

export interface InvestmentAnalysis {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  currentPrice: number;
  trend: 'up' | 'down' | 'neutral';
  hotScore: number; // 0-100, HOT 종목 점수
  topInvestorActivity: {
    top1Percent: {
      action: 'buy' | 'sell' | 'hold';
      confidence: number;
      reason: string;
    };
    top5Percent: {
      action: 'buy' | 'sell' | 'hold';
      confidence: number;
      reason: string;
    };
  };
  priceMovement: {
    reason: string; // 상승/하락 이유
    factors: string[]; // 영향 요인
    sentiment: 'positive' | 'negative' | 'neutral';
  };
  timing: {
    buyTiming?: {
      recommended: boolean;
      price: number;
      reason: string;
      expectedGain?: number;
      riskLevel: 'low' | 'medium' | 'high';
    };
    sellTiming?: {
      recommended: boolean;
      price: number;
      reason: string;
      expectedGain?: number;
      riskLevel: 'low' | 'medium' | 'high';
    };
  };
  strategy: {
    shortTerm: {
      recommended: boolean;
      entryPrice?: number;
      exitPrice?: number;
      expectedGain?: number;
      timeFrame: string;
      riskLevel: 'low' | 'medium' | 'high';
    };
    longTerm: {
      recommended: boolean;
      entryPrice?: number;
      exitPrice?: number;
      expectedGain?: number;
      timeFrame: string;
      riskLevel: 'low' | 'medium' | 'high';
    };
  };
}

export class InvestmentAPI {
  /**
   * 주식 데이터 가져오기 (Yahoo Finance 비공식 API)
   * 서버 사이드에서만 호출 가능 (CORS 이슈)
   */
  async getStockData(symbol: string): Promise<StockData | null> {
    try {
      // Yahoo Finance API 사용 (무료)
      // 서버 사이드에서만 작동하므로 직접 fetch 사용
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          },
          // 서버 사이드에서만 작동
          next: { revalidate: 60 }, // 1분 캐시
        } as any
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const result = data.chart?.result?.[0];
      if (!result) return null;

      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];
      const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
      const previousClose = meta.previousClose || currentPrice;
      const change = currentPrice - previousClose;
      const changePercent = previousClose ? (change / previousClose) * 100 : 0;

      return {
        symbol: meta.symbol,
        name: meta.longName || meta.shortName || symbol,
        price: currentPrice,
        change,
        changePercent,
        volume: meta.regularMarketVolume || 0,
        marketCap: meta.marketCap,
        high: meta.regularMarketDayHigh || currentPrice,
        low: meta.regularMarketDayLow || currentPrice,
        open: meta.regularMarketOpen || currentPrice,
        previousClose,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`[InvestmentAPI] 주식 데이터 가져오기 실패 (${symbol}):`, error);
      return null;
    }
  }

  /**
   * 암호화폐 데이터 가져오기 (CoinGecko API)
   */
  async getCryptoData(symbol: string): Promise<CryptoData | null> {
    try {
      // CoinGecko 무료 API 사용
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_24hr_high=true&include_24hr_low=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const coinData = data[symbol.toLowerCase()];
      if (!coinData) return null;

      return {
        id: symbol.toLowerCase(),
        symbol: symbol.toUpperCase(),
        name: symbol,
        currentPrice: coinData.usd || 0,
        priceChange24h: coinData.usd_24h_change || 0,
        priceChangePercent24h: coinData.usd_24h_change || 0,
        marketCap: coinData.usd_market_cap || 0,
        volume24h: coinData.usd_24h_vol || 0,
        high24h: coinData.usd_24h_high || coinData.usd || 0,
        low24h: coinData.usd_24h_low || coinData.usd || 0,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`[InvestmentAPI] 암호화폐 데이터 가져오기 실패 (${symbol}):`, error);
      return null;
    }
  }

  /**
   * HOT 종목 분석 (거래량, 변동률 기준)
   */
  async getHotStocks(limit: number = 5): Promise<StockData[]> {
    // 인기 주식 심볼 목록
    const popularStocks = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
      'AMD', 'INTC', 'BABA', 'TSM', 'V', 'JPM', 'WMT', 'MA', 'PG', 'DIS',
    ];

    const stockDataPromises = popularStocks.map(symbol => this.getStockData(symbol));
    const results = await Promise.all(stockDataPromises);
    const validStocks = results.filter((s): s is StockData => s !== null);

    // HOT 점수 계산 (변동률 + 거래량)
    const scoredStocks = validStocks.map(stock => ({
      ...stock,
      hotScore: Math.abs(stock.changePercent) * 0.7 + Math.log10(stock.volume || 1) * 0.3,
    }));

    // HOT 점수 순으로 정렬
    scoredStocks.sort((a, b) => b.hotScore - a.hotScore);

    return scoredStocks.slice(0, limit);
  }

  /**
   * HOT 암호화폐 분석
   */
  async getHotCryptos(limit: number = 5): Promise<CryptoData[]> {
    // 인기 암호화폐 목록
    const popularCryptos = [
      'bitcoin', 'ethereum', 'binancecoin', 'solana', 'cardano',
      'ripple', 'polkadot', 'dogecoin', 'avalanche-2', 'chainlink',
    ];

    const cryptoDataPromises = popularCryptos.map(symbol => this.getCryptoData(symbol));
    const results = await Promise.all(cryptoDataPromises);
    const validCryptos = results.filter((c): c is CryptoData => c !== null);

    // HOT 점수 계산 (변동률 + 거래량)
    const scoredCryptos = validCryptos.map(crypto => ({
      ...crypto,
      hotScore: Math.abs(crypto.priceChangePercent24h) * 0.7 + Math.log10(crypto.volume24h || 1) * 0.3,
    }));

    // HOT 점수 순으로 정렬
    scoredCryptos.sort((a, b) => b.hotScore - a.hotScore);

    return scoredCryptos.slice(0, limit);
  }

  /**
   * AI를 활용한 투자 분석
   */
  async analyzeInvestment(
    symbol: string,
    type: 'stock' | 'crypto'
  ): Promise<InvestmentAnalysis | null> {
    try {
      // 데이터 가져오기
      const stockData = type === 'stock' ? await this.getStockData(symbol) : null;
      const cryptoData = type === 'crypto' ? await this.getCryptoData(symbol) : null;
      const data = stockData || cryptoData;

      if (!data) return null;

      // AI를 활용한 분석
      const geminiKey = process.env.GOOGLE_API_KEY;
      if (geminiKey && geminiKey.trim() !== '') {
        try {
          const currentPrice = stockData ? stockData.price : (cryptoData ? cryptoData.currentPrice : 0);
          const changePercent = stockData ? stockData.changePercent : (cryptoData ? cryptoData.priceChangePercent24h : 0);
          const volume = stockData ? stockData.volume : (cryptoData ? cryptoData.volume24h : 0);

          const analysisPrompt = `${type === 'stock' ? '주식' : '암호화폐'} ${symbol}에 대한 투자 분석을 수행해주세요.

현재 가격: ${currentPrice}
변동률: ${changePercent}%
거래량: ${volume}

다음 형식의 JSON으로 응답해주세요:
{
  "trend": "up" | "down" | "neutral",
  "hotScore": 0-100,
  "topInvestorActivity": {
    "top1Percent": {
      "action": "buy" | "sell" | "hold",
      "confidence": 0-100,
      "reason": "이유"
    },
    "top5Percent": {
      "action": "buy" | "sell" | "hold",
      "confidence": 0-100,
      "reason": "이유"
    }
  },
  "priceMovement": {
    "reason": "상승/하락 이유",
    "factors": ["요인1", "요인2"],
    "sentiment": "positive" | "negative" | "neutral"
  },
  "timing": {
    "buyTiming": {
      "recommended": true/false,
      "price": 예상구매가,
      "reason": "이유",
      "expectedGain": 예상수익률,
      "riskLevel": "low" | "medium" | "high"
    },
    "sellTiming": {
      "recommended": true/false,
      "price": 예상판매가,
      "reason": "이유",
      "expectedGain": 예상수익률,
      "riskLevel": "low" | "medium" | "high"
    }
  },
  "strategy": {
    "shortTerm": {
      "recommended": true/false,
      "entryPrice": 진입가,
      "exitPrice": 청산가,
      "expectedGain": 예상수익률,
      "timeFrame": "시간",
      "riskLevel": "low" | "medium" | "high"
    },
    "longTerm": {
      "recommended": true/false,
      "entryPrice": 진입가,
      "exitPrice": 청산가,
      "expectedGain": 예상수익률,
      "timeFrame": "기간",
      "riskLevel": "low" | "medium" | "high"
    }
  }
}`;

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: analysisPrompt }] }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 4000,
                },
              }),
            }
          );

          if (response.ok) {
            const aiData = await response.json();
            const aiText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (aiText) {
              // JSON 추출 시도
              const jsonMatch = aiText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0]);
                return {
                  symbol,
                  name: stockData ? stockData.name : (cryptoData ? cryptoData.name : symbol),
                  type,
                  currentPrice: stockData ? stockData.price : (cryptoData ? cryptoData.currentPrice : 0),
                  ...analysis,
                };
              }
            }
          }
        } catch (error) {
          console.error('[InvestmentAPI] AI 분석 실패:', error);
        }
      }

      // AI 분석 실패 시 기본 분석
      return this.generateBasicAnalysis(symbol, data, type);
    } catch (error) {
      console.error(`[InvestmentAPI] 투자 분석 실패 (${symbol}):`, error);
      return null;
    }
  }

  /**
   * 기본 분석 생성 (AI 없을 때)
   */
  private generateBasicAnalysis(
    symbol: string,
    data: StockData | CryptoData,
    type: 'stock' | 'crypto'
  ): InvestmentAnalysis {
    const changePercent = type === 'stock' 
      ? (data as StockData).changePercent 
      : (data as CryptoData).priceChangePercent24h;
    
    const trend = changePercent > 2 ? 'up' : changePercent < -2 ? 'down' : 'neutral';
    const hotScore = Math.min(100, Math.abs(changePercent) * 10);

    return {
      symbol,
      name: type === 'stock' ? (data as StockData).name : (data as CryptoData).name,
      type,
      currentPrice: type === 'stock' ? (data as StockData).price : (data as CryptoData).currentPrice,
      trend,
      hotScore,
      topInvestorActivity: {
        top1Percent: {
          action: trend === 'up' ? 'buy' : trend === 'down' ? 'sell' : 'hold',
          confidence: Math.abs(changePercent) * 10,
          reason: `${changePercent > 0 ? '상승' : '하락'} 추세로 인한 ${trend === 'up' ? '매수' : trend === 'down' ? '매도' : '보유'} 추천`,
        },
        top5Percent: {
          action: trend === 'up' ? 'buy' : 'hold',
          confidence: Math.abs(changePercent) * 8,
          reason: `변동률 ${changePercent.toFixed(2)}%를 고려한 전략`,
        },
      },
      priceMovement: {
        reason: changePercent > 0 
          ? '시장 긍정적 반응 및 거래량 증가'
          : changePercent < 0
          ? '시장 부정적 반응 및 매도 압력'
          : '시장 안정 및 관망세',
        factors: [
          changePercent > 0 ? '긍정적 뉴스' : '부정적 뉴스',
          '거래량 변화',
          '시장 심리',
        ],
        sentiment: trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : 'neutral',
      },
      timing: {
        buyTiming: trend === 'up' ? {
          recommended: true,
          price: type === 'stock' ? (data as StockData).price * 0.98 : (data as CryptoData).currentPrice * 0.98,
          reason: '상승 추세 진입 시점',
          expectedGain: Math.abs(changePercent) * 1.5,
          riskLevel: 'medium' as const,
        } : undefined,
        sellTiming: trend === 'down' ? {
          recommended: true,
          price: type === 'stock' ? (data as StockData).price * 1.02 : (data as CryptoData).currentPrice * 1.02,
          reason: '하락 추세 대응',
          expectedGain: Math.abs(changePercent) * 0.5,
          riskLevel: 'high' as const,
        } : undefined,
      },
      strategy: {
        shortTerm: {
          recommended: Math.abs(changePercent) > 3,
          entryPrice: type === 'stock' ? (data as StockData).price : (data as CryptoData).currentPrice,
          exitPrice: type === 'stock' 
            ? (data as StockData).price * (1 + changePercent / 100 * 1.2)
            : (data as CryptoData).currentPrice * (1 + changePercent / 100 * 1.2),
          expectedGain: Math.abs(changePercent) * 1.2,
          timeFrame: '1-3일',
          riskLevel: 'high' as const,
        },
        longTerm: {
          recommended: trend === 'up',
          entryPrice: type === 'stock' ? (data as StockData).price : (data as CryptoData).currentPrice,
          exitPrice: type === 'stock'
            ? (data as StockData).price * (1 + Math.max(0, changePercent) / 100 * 2)
            : (data as CryptoData).currentPrice * (1 + Math.max(0, changePercent) / 100 * 2),
          expectedGain: Math.max(0, changePercent) * 2,
          timeFrame: '1-3개월',
          riskLevel: 'medium' as const,
        },
      },
    };
  }
}

export const investmentAPI = new InvestmentAPI();

