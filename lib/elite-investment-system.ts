/**
 * 상위 1% 투자자 시스템
 * 전문가급 투자 분석 및 전략 시스템
 */

import { InvestmentAnalysis, StockData, CryptoData } from './investment-api';

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'hold' | 'strong_buy' | 'strong_sell';
  strength: number; // 0-100
  description: string;
}

export interface FundamentalAnalysis {
  peRatio?: number;
  marketCap?: number;
  revenue?: number;
  earnings?: number;
  debtToEquity?: number;
  roe?: number; // Return on Equity
  dividendYield?: number;
  growthRate?: number;
  score: number; // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
}

export interface MarketSentiment {
  fearGreedIndex: number; // 0-100
  socialSentiment: 'very_bullish' | 'bullish' | 'neutral' | 'bearish' | 'very_bearish';
  newsSentiment: number; // -100 to 100
  analystRating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  priceTarget?: number;
  consensus: string;
}

export interface RiskAnalysis {
  volatility: number; // 0-100
  beta?: number;
  maxDrawdown: number;
  sharpeRatio?: number;
  var95?: number; // Value at Risk 95%
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  riskFactors: string[];
  mitigation: string[];
}

export interface EliteTiming {
  entry: {
    recommended: boolean;
    price: number;
    confidence: number; // 0-100
    timeframe: string;
    reason: string;
    stopLoss?: number;
    takeProfit?: number;
  };
  exit: {
    recommended: boolean;
    price: number;
    confidence: number;
    timeframe: string;
    reason: string;
  };
  optimalStrategy: {
    type: 'momentum' | 'value' | 'growth' | 'dividend' | 'swing' | 'scalping';
    holdingPeriod: string;
    positionSize: number; // % of portfolio
    riskRewardRatio: number;
    expectedReturn: number;
    maxLoss: number;
  };
}

export interface EliteAnalysis {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  currentPrice: number;
  
  // 기술적 분석
  technical: {
    indicators: TechnicalIndicator[];
    trend: 'strong_uptrend' | 'uptrend' | 'sideways' | 'downtrend' | 'strong_downtrend';
    support: number[];
    resistance: number[];
    pattern?: string; // Chart pattern
    score: number; // 0-100
  };
  
  // 펀더멘털 분석
  fundamental: FundamentalAnalysis | null;
  
  // 시장 심리
  sentiment: MarketSentiment;
  
  // 리스크 분석
  risk: RiskAnalysis;
  
  // 타이밍 분석
  timing: EliteTiming;
  
  // 상위 1% 투자자 시뮬레이션
  eliteInvestor: {
    action: 'accumulate' | 'hold' | 'reduce' | 'exit';
    confidence: number;
    reasoning: string;
    positionSize: number; // % of portfolio
    timeline: string;
    expectedOutcome: string;
  };
  
  // 종합 점수
  overallScore: number; // 0-100
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number; // 0-100
  
  // AI 인사이트
  aiInsights: {
    keyFactors: string[];
    opportunities: string[];
    threats: string[];
    strategy: string;
  };
  
  timestamp: number;
}

export class EliteInvestmentSystem {
  /**
   * 기술적 지표 계산
   */
  async calculateTechnicalIndicators(
    symbol: string,
    type: 'stock' | 'crypto'
  ): Promise<TechnicalIndicator[]> {
    const indicators: TechnicalIndicator[] = [];
    
    try {
      // 현재 데이터 가져오기
      const { investmentAPI } = await import('./investment-api');
      const currentData = type === 'stock'
        ? await investmentAPI.getStockData(symbol)
        : await investmentAPI.getCryptoData(symbol);

      if (!currentData) return indicators;

      const price = type === 'stock' 
        ? (currentData as StockData).price 
        : (currentData as CryptoData).currentPrice;
      
      const changePercent = type === 'stock'
        ? (currentData as StockData).changePercent
        : (currentData as CryptoData).priceChangePercent24h;

      // RSI (Relative Strength Index) 시뮬레이션
      const rsi = this.calculateRSI(changePercent);
      indicators.push({
        name: 'RSI',
        value: rsi,
        signal: rsi > 70 ? 'sell' : rsi < 30 ? 'buy' : 'hold',
        strength: Math.abs(rsi - 50) * 2,
        description: rsi > 70 
          ? '과매수 구간 - 매도 고려' 
          : rsi < 30 
          ? '과매도 구간 - 매수 고려' 
          : '중립 구간',
      });

      // MACD 시뮬레이션
      const macd = this.calculateMACD(changePercent);
      indicators.push({
        name: 'MACD',
        value: macd,
        signal: macd > 0 ? 'buy' : 'sell',
        strength: Math.abs(macd) * 10,
        description: macd > 0 
          ? '상승 모멘텀 - 매수 신호' 
          : '하락 모멘텀 - 매도 신호',
      });

      // 볼린저 밴드 시뮬레이션
      const bb = this.calculateBollingerBands(changePercent);
      indicators.push({
        name: 'Bollinger Bands',
        value: bb,
        signal: bb > 0.8 ? 'sell' : bb < 0.2 ? 'buy' : 'hold',
        strength: Math.abs(bb - 0.5) * 200,
        description: bb > 0.8 
          ? '상단 밴드 돌파 - 매도 고려' 
          : bb < 0.2 
          ? '하단 밴드 접근 - 매수 고려' 
          : '중립',
      });

      // 이동평균 시뮬레이션
      const ma = this.calculateMovingAverage(changePercent);
      indicators.push({
        name: 'Moving Average',
        value: ma,
        signal: ma > 0 ? 'buy' : 'sell',
        strength: Math.abs(ma) * 5,
        description: ma > 0 
          ? '상승 추세 - 매수 신호' 
          : '하락 추세 - 매도 신호',
      });

      // 거래량 분석
      const volume = type === 'stock'
        ? (currentData as StockData).volume
        : (currentData as CryptoData).volume24h;
      
      const volumeSignal = this.analyzeVolume(volume, changePercent);
      indicators.push({
        name: 'Volume Analysis',
        value: volumeSignal.strength,
        signal: volumeSignal.signal,
        strength: volumeSignal.strength,
        description: volumeSignal.description,
      });

    } catch (error) {
      console.error('[EliteInvestmentSystem] 기술적 지표 계산 실패:', error);
    }

    return indicators;
  }

  /**
   * RSI 계산 (간소화)
   */
  private calculateRSI(changePercent: number): number {
    // 실제 RSI는 14일 데이터가 필요하지만, 변동률로 근사치 계산
    const normalized = Math.min(100, Math.max(0, 50 + changePercent * 2));
    return normalized;
  }

  /**
   * MACD 계산 (간소화)
   */
  private calculateMACD(changePercent: number): number {
    // MACD는 12일/26일 EMA 차이지만, 변동률로 근사치
    return changePercent * 0.5;
  }

  /**
   * 볼린저 밴드 계산 (간소화)
   */
  private calculateBollingerBands(changePercent: number): number {
    // 볼린저 밴드 위치 (0-1)
    const normalized = (changePercent + 10) / 20; // -10% ~ +10%를 0~1로 정규화
    return Math.min(1, Math.max(0, normalized));
  }

  /**
   * 이동평균 계산 (간소화)
   */
  private calculateMovingAverage(changePercent: number): number {
    return changePercent;
  }

  /**
   * 거래량 분석
   */
  private analyzeVolume(volume: number, changePercent: number): {
    signal: 'buy' | 'sell' | 'hold';
    strength: number;
    description: string;
  } {
    const volumeLog = Math.log10(volume || 1);
    const isHighVolume = volumeLog > 6; // 높은 거래량
    const isPositiveChange = changePercent > 0;

    if (isHighVolume && isPositiveChange) {
      return {
        signal: 'buy',
        strength: 80,
        description: '높은 거래량과 상승 - 강한 매수 신호',
      };
    } else if (isHighVolume && !isPositiveChange) {
      return {
        signal: 'sell',
        strength: 80,
        description: '높은 거래량과 하락 - 매도 신호',
      };
    } else {
      return {
        signal: 'hold',
        strength: 40,
        description: '거래량 보통 - 관망',
      };
    }
  }

  /**
   * 펀더멘털 분석
   */
  async calculateFundamentalAnalysis(
    symbol: string,
    type: 'stock' | 'crypto'
  ): Promise<FundamentalAnalysis | null> {
    if (type === 'crypto') {
      // 암호화폐는 펀더멘털 분석이 제한적
      return null;
    }

    try {
      // 실제로는 외부 API에서 펀더멘털 데이터를 가져와야 하지만,
      // 여기서는 시뮬레이션
      const { investmentAPI } = await import('./investment-api');
      const stockData = await investmentAPI.getStockData(symbol);
      
      if (!stockData) return null;

      // 시뮬레이션된 펀더멘털 점수
      const marketCap = stockData.marketCap || 0;
      const volume = stockData.volume || 0;
      
      // 시가총액과 거래량 기반 점수 계산
      let score = 50;
      if (marketCap > 100000000000) score += 20; // 대형주
      if (volume > 10000000) score += 15; // 높은 유동성
      if (stockData.changePercent > 0) score += 10; // 상승 추세
      if (stockData.changePercent > 5) score += 5; // 강한 상승

      const grade = score >= 90 ? 'A+' :
                   score >= 80 ? 'A' :
                   score >= 70 ? 'B+' :
                   score >= 60 ? 'B' :
                   score >= 50 ? 'C+' :
                   score >= 40 ? 'C' :
                   score >= 30 ? 'D' : 'F';

      const recommendation = score >= 80 ? 'strong_buy' :
                             score >= 70 ? 'buy' :
                             score >= 50 ? 'hold' :
                             score >= 40 ? 'sell' : 'strong_sell';

      return {
        marketCap,
        score,
        grade,
        recommendation,
      };
    } catch (error) {
      console.error('[EliteInvestmentSystem] 펀더멘털 분석 실패:', error);
      return null;
    }
  }

  /**
   * 시장 심리 분석
   */
  async analyzeMarketSentiment(
    symbol: string,
    type: 'stock' | 'crypto'
  ): Promise<MarketSentiment> {
    try {
      const { investmentAPI } = await import('./investment-api');
      const currentData = type === 'stock'
        ? await investmentAPI.getStockData(symbol)
        : await investmentAPI.getCryptoData(symbol);

      if (!currentData) {
        return this.getDefaultSentiment();
      }

      const changePercent = type === 'stock'
        ? (currentData as StockData).changePercent
        : (currentData as CryptoData).priceChangePercent24h;

      // Fear & Greed Index 시뮬레이션
      const fearGreedIndex = Math.min(100, Math.max(0, 50 + changePercent * 5));

      // 시장 심리 판단
      let socialSentiment: MarketSentiment['socialSentiment'] = 'neutral';
      if (changePercent > 5) socialSentiment = 'very_bullish';
      else if (changePercent > 2) socialSentiment = 'bullish';
      else if (changePercent < -5) socialSentiment = 'very_bearish';
      else if (changePercent < -2) socialSentiment = 'bearish';

      // 뉴스 심리 (변동률 기반)
      const newsSentiment = changePercent * 10; // -100 to 100

      // 애널리스트 등급
      const analystRating: MarketSentiment['analystRating'] = 
        changePercent > 5 ? 'strong_buy' :
        changePercent > 2 ? 'buy' :
        changePercent > -2 ? 'hold' :
        changePercent > -5 ? 'sell' : 'strong_sell';

      const price = type === 'stock'
        ? (currentData as StockData).price
        : (currentData as CryptoData).currentPrice;
      
      const priceTarget = price * (1 + changePercent / 100 * 1.2);

      return {
        fearGreedIndex,
        socialSentiment,
        newsSentiment,
        analystRating,
        priceTarget,
        consensus: changePercent > 0 
          ? '시장이 긍정적으로 반응하고 있으며, 상승 여력이 있습니다.'
          : '시장이 부정적으로 반응하고 있으며, 하락 압력이 있습니다.',
      };
    } catch (error) {
      console.error('[EliteInvestmentSystem] 시장 심리 분석 실패:', error);
      return this.getDefaultSentiment();
    }
  }

  private getDefaultSentiment(): MarketSentiment {
    return {
      fearGreedIndex: 50,
      socialSentiment: 'neutral',
      newsSentiment: 0,
      analystRating: 'hold',
      consensus: '데이터 부족으로 중립적 평가',
    };
  }

  /**
   * 리스크 분석
   */
  async analyzeRisk(
    symbol: string,
    type: 'stock' | 'crypto'
  ): Promise<RiskAnalysis> {
    try {
      const { investmentAPI } = await import('./investment-api');
      const currentData = type === 'stock'
        ? await investmentAPI.getStockData(symbol)
        : await investmentAPI.getCryptoData(symbol);

      if (!currentData) {
        return this.getDefaultRisk();
      }

      const changePercent = type === 'stock'
        ? (currentData as StockData).changePercent
        : (currentData as CryptoData).priceChangePercent24h;

      // 변동성 계산 (변동률의 절대값)
      const volatility = Math.min(100, Math.abs(changePercent) * 10);

      // 최대 낙폭 시뮬레이션
      const maxDrawdown = Math.abs(changePercent < 0 ? changePercent : changePercent * 0.3);

      // 리스크 레벨 판단
      let riskLevel: RiskAnalysis['riskLevel'] = 'medium';
      if (volatility > 70) riskLevel = 'very_high';
      else if (volatility > 50) riskLevel = 'high';
      else if (volatility > 30) riskLevel = 'medium';
      else if (volatility > 15) riskLevel = 'low';
      else riskLevel = 'very_low';

      const riskFactors: string[] = [];
      if (volatility > 50) riskFactors.push('높은 변동성');
      if (changePercent < -5) riskFactors.push('급격한 하락');
      if (changePercent > 10) riskFactors.push('급격한 상승 (조정 가능)');

      const mitigation: string[] = [];
      if (volatility > 50) mitigation.push('포지션 크기 축소 권장');
      if (changePercent < -5) mitigation.push('손절매 설정 필수');
      if (changePercent > 10) mitigation.push('부분 매도 고려');

      return {
        volatility,
        maxDrawdown,
        riskLevel,
        riskFactors,
        mitigation,
      };
    } catch (error) {
      console.error('[EliteInvestmentSystem] 리스크 분석 실패:', error);
      return this.getDefaultRisk();
    }
  }

  private getDefaultRisk(): RiskAnalysis {
    return {
      volatility: 50,
      maxDrawdown: 5,
      riskLevel: 'medium',
      riskFactors: ['데이터 부족'],
      mitigation: ['신중한 접근 권장'],
    };
  }

  /**
   * 상위 1% 타이밍 분석
   */
  async calculateEliteTiming(
    symbol: string,
    type: 'stock' | 'crypto',
    technical: TechnicalIndicator[],
    sentiment: MarketSentiment,
    risk: RiskAnalysis
  ): Promise<EliteTiming> {
    const currentPrice = await this.getCurrentPrice(symbol, type);
    if (!currentPrice) {
      return this.getDefaultTiming();
    }

    // 기술적 지표 종합
    const buySignals = technical.filter(i => i.signal === 'buy' || i.signal === 'strong_buy').length;
    const sellSignals = technical.filter(i => i.signal === 'sell' || i.signal === 'strong_sell').length;
    const avgStrength = technical.reduce((sum, i) => sum + i.strength, 0) / technical.length;

    // 진입 타이밍
    const entryRecommended = buySignals > sellSignals && avgStrength > 50;
    const entryConfidence = Math.min(100, avgStrength);
    const entryPrice = currentPrice * (entryRecommended ? 0.98 : 1.02); // 매수 시 약간 낮은 가격
    const stopLoss = entryRecommended ? currentPrice * 0.95 : undefined; // 5% 손절
    const takeProfit = entryRecommended ? currentPrice * 1.15 : undefined; // 15% 익절

    // 청산 타이밍
    const exitRecommended = sellSignals > buySignals && avgStrength > 60;
    const exitConfidence = Math.min(100, avgStrength);
    const exitPrice = currentPrice * (exitRecommended ? 1.02 : 0.98);

    // 최적 전략 결정
    let strategyType: EliteTiming['optimalStrategy']['type'] = 'swing';
    if (risk.volatility > 70) strategyType = 'scalping';
    else if (sentiment.fearGreedIndex > 70) strategyType = 'momentum';
    else if (sentiment.fearGreedIndex < 30) strategyType = 'value';

    const holdingPeriod = strategyType === 'scalping' ? '1-3일' :
                         strategyType === 'swing' ? '1-2주' :
                         strategyType === 'momentum' ? '2-4주' : '1-3개월';

    const positionSize = risk.riskLevel === 'very_high' ? 5 :
                        risk.riskLevel === 'high' ? 10 :
                        risk.riskLevel === 'medium' ? 15 :
                        risk.riskLevel === 'low' ? 20 : 25; // 포트폴리오 대비 %

    const riskRewardRatio = entryRecommended && stopLoss && takeProfit
      ? (takeProfit - entryPrice) / (entryPrice - stopLoss)
      : 2.0;

    const expectedReturn = entryRecommended ? 10 + avgStrength * 0.2 : -5;
    const maxLoss = risk.maxDrawdown;

    return {
      entry: {
        recommended: entryRecommended,
        price: entryPrice,
        confidence: entryConfidence,
        timeframe: '즉시 또는 다음 조정 시',
        reason: entryRecommended
          ? `기술적 지표가 매수 신호를 보이고 있으며, 시장 심리도 긍정적입니다.`
          : `현재 진입 시점이 최적이 아닙니다. 관망 권장.`,
        stopLoss,
        takeProfit,
      },
      exit: {
        recommended: exitRecommended,
        price: exitPrice,
        confidence: exitConfidence,
        timeframe: '1-2주 내',
        reason: exitRecommended
          ? `기술적 지표가 매도 신호를 보이고 있으며, 수익 실현을 고려해야 합니다.`
          : `현재 보유 유지가 적절합니다.`,
      },
      optimalStrategy: {
        type: strategyType,
        holdingPeriod,
        positionSize,
        riskRewardRatio,
        expectedReturn,
        maxLoss,
      },
    };
  }

  private async getCurrentPrice(symbol: string, type: 'stock' | 'crypto'): Promise<number | null> {
    try {
      const { investmentAPI } = await import('./investment-api');
      const data = type === 'stock'
        ? await investmentAPI.getStockData(symbol)
        : await investmentAPI.getCryptoData(symbol);
      
      if (!data) return null;
      
      return type === 'stock'
        ? (data as StockData).price
        : (data as CryptoData).currentPrice;
    } catch {
      return null;
    }
  }

  private getDefaultTiming(): EliteTiming {
    return {
      entry: {
        recommended: false,
        price: 0,
        confidence: 0,
        timeframe: 'N/A',
        reason: '데이터 부족',
      },
      exit: {
        recommended: false,
        price: 0,
        confidence: 0,
        timeframe: 'N/A',
        reason: '데이터 부족',
      },
      optimalStrategy: {
        type: 'swing',
        holdingPeriod: 'N/A',
        positionSize: 10,
        riskRewardRatio: 1.5,
        expectedReturn: 0,
        maxLoss: 5,
      },
    };
  }

  /**
   * 상위 1% 투자자 시뮬레이션
   */
  async simulateEliteInvestor(
    symbol: string,
    type: 'stock' | 'crypto',
    technical: TechnicalIndicator[],
    fundamental: FundamentalAnalysis | null,
    sentiment: MarketSentiment,
    risk: RiskAnalysis,
    timing: EliteTiming
  ): Promise<EliteAnalysis['eliteInvestor']> {
    // 종합 점수 계산
    const techScore = technical.reduce((sum, i) => {
      const signalValue = i.signal === 'strong_buy' ? 100 :
                         i.signal === 'buy' ? 75 :
                         i.signal === 'hold' ? 50 :
                         i.signal === 'sell' ? 25 : 0;
      return sum + signalValue * (i.strength / 100);
    }, 0) / technical.length;

    const fundScore = fundamental?.score || 50;
    const sentimentScore = sentiment.fearGreedIndex;
    const riskScore = 100 - risk.volatility; // 낮은 변동성 = 높은 점수

    const overallScore = (techScore * 0.3 + fundScore * 0.3 + sentimentScore * 0.2 + riskScore * 0.2);

    // 상위 1% 투자자 행동 결정
    let action: EliteAnalysis['eliteInvestor']['action'] = 'hold';
    let confidence = 50;
    let positionSize = 10;

    if (overallScore >= 80 && timing.entry.recommended) {
      action = 'accumulate';
      confidence = Math.min(100, overallScore);
      positionSize = Math.min(25, risk.riskLevel === 'low' ? 25 : 15);
    } else if (overallScore >= 70 && timing.entry.recommended) {
      action = 'accumulate';
      confidence = overallScore;
      positionSize = 10;
    } else if (overallScore < 40 || timing.exit.recommended) {
      action = 'exit';
      confidence = 100 - overallScore;
      positionSize = 0;
    } else if (overallScore < 50) {
      action = 'reduce';
      confidence = 60;
      positionSize = 5;
    }

    const reasoning = action === 'accumulate'
      ? `기술적 지표, 펀더멘털, 시장 심리가 모두 긍정적이며, 리스크 대비 수익 기회가 우수합니다.`
      : action === 'hold'
      ? `현재 보유 유지가 적절하며, 추가 신호를 기다리는 것이 좋습니다.`
      : action === 'reduce'
      ? `리스크가 증가하고 있으며, 포지션 축소를 고려해야 합니다.`
      : `기술적 지표와 시장 심리가 부정적이며, 수익 실현 또는 손절을 고려해야 합니다.`;

    const timeline = action === 'accumulate' ? '1-2주 내 점진적 매수' :
                    action === 'hold' ? '관망 및 신호 대기' :
                    action === 'reduce' ? '1주 내 부분 매도' : '즉시 또는 다음 반등 시 매도';

    const expectedOutcome = action === 'accumulate'
      ? `3-6개월 내 15-30% 수익 기대`
      : action === 'hold'
      ? `현재 수준 유지 또는 소폭 변동`
      : action === 'reduce'
      ? `리스크 감소 및 자금 보존`
      : `손실 최소화 및 자금 회수`;

    return {
      action,
      confidence,
      reasoning,
      positionSize,
      timeline,
      expectedOutcome,
    };
  }

  /**
   * 종합 엘리트 분석
   */
  async performEliteAnalysis(
    symbol: string,
    type: 'stock' | 'crypto'
  ): Promise<EliteAnalysis> {
    try {
      // 모든 분석 병렬 실행
      const [technical, fundamental, sentiment, risk] = await Promise.all([
        this.calculateTechnicalIndicators(symbol, type),
        this.calculateFundamentalAnalysis(symbol, type),
        this.analyzeMarketSentiment(symbol, type),
        this.analyzeRisk(symbol, type),
      ]);

      // 타이밍 분석
      const timing = await this.calculateEliteTiming(symbol, type, technical, sentiment, risk);

      // 상위 1% 투자자 시뮬레이션
      const eliteInvestor = await this.simulateEliteInvestor(
        symbol, type, technical, fundamental, sentiment, risk, timing
      );

      // 현재가
      const currentPrice = await this.getCurrentPrice(symbol, type) || 0;

      // 이름 가져오기
      let name = symbol;
      if (type === 'stock') {
        const { investmentAPI } = await import('./investment-api');
        const stockData = await investmentAPI.getStockData(symbol);
        name = stockData?.name || symbol;
      } else {
        const { investmentAPI } = await import('./investment-api');
        const cryptoData = await investmentAPI.getCryptoData(symbol);
        name = cryptoData?.name || symbol;
      }

      // 종합 점수 계산
      const techScore = technical.reduce((sum, i) => sum + i.strength, 0) / technical.length;
      const fundScore = fundamental?.score || 50;
      const sentimentScore = sentiment.fearGreedIndex;
      const riskScore = 100 - risk.volatility;
      const timingScore = timing.entry.recommended ? 80 : timing.exit.recommended ? 20 : 50;

      const overallScore = (
        techScore * 0.25 +
        fundScore * 0.25 +
        sentimentScore * 0.2 +
        riskScore * 0.15 +
        timingScore * 0.15
      );

      // 추천 결정
      const recommendation: EliteAnalysis['recommendation'] = 
        overallScore >= 80 ? 'strong_buy' :
        overallScore >= 70 ? 'buy' :
        overallScore >= 50 ? 'hold' :
        overallScore >= 30 ? 'sell' : 'strong_sell';

      const confidence = Math.min(100, overallScore);

      // AI 인사이트 생성
      const aiInsights = this.generateAIInsights(technical, fundamental, sentiment, risk, timing);

      // 트렌드 판단
      const trend = techScore > 70 ? 'strong_uptrend' :
                   techScore > 60 ? 'uptrend' :
                   techScore > 40 ? 'sideways' :
                   techScore > 30 ? 'downtrend' : 'strong_downtrend';

      // 지지선/저항선 (시뮬레이션)
      const support = [currentPrice * 0.95, currentPrice * 0.90];
      const resistance = [currentPrice * 1.05, currentPrice * 1.10];

      return {
        symbol,
        name,
        type,
        currentPrice,
        technical: {
          indicators: technical,
          trend,
          support,
          resistance,
          score: techScore,
        },
        fundamental,
        sentiment,
        risk,
        timing,
        eliteInvestor,
        overallScore,
        recommendation,
        confidence,
        aiInsights,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('[EliteInvestmentSystem] 엘리트 분석 실패:', error);
      throw error;
    }
  }

  private generateAIInsights(
    technical: TechnicalIndicator[],
    fundamental: FundamentalAnalysis | null,
    sentiment: MarketSentiment,
    risk: RiskAnalysis,
    timing: EliteTiming
  ): EliteAnalysis['aiInsights'] {
    const keyFactors: string[] = [];
    const opportunities: string[] = [];
    const threats: string[] = [];

    // 주요 요인
    if (technical.length > 0) {
      const strongSignals = technical.filter(i => i.strength > 70);
      if (strongSignals.length > 0) {
        keyFactors.push(`${strongSignals.length}개의 강한 기술적 신호 감지`);
      }
    }

    if (fundamental && fundamental.score > 70) {
      keyFactors.push(`우수한 펀더멘털 점수 (${fundamental.grade})`);
    }

    if (sentiment.fearGreedIndex > 70) {
      keyFactors.push('시장 심리 매우 긍정적');
    } else if (sentiment.fearGreedIndex < 30) {
      keyFactors.push('시장 심리 매우 부정적');
    }

    // 기회
    if (timing.entry.recommended && timing.entry.confidence > 70) {
      opportunities.push(`높은 신뢰도의 진입 기회 (${timing.entry.confidence.toFixed(0)}%)`);
    }

    if (risk.riskLevel === 'low' && sentiment.fearGreedIndex > 60) {
      opportunities.push('낮은 리스크와 긍정적 심리의 조합');
    }

    if (fundamental && fundamental.recommendation === 'strong_buy') {
      opportunities.push('펀더멘털 분석상 강력한 매수 추천');
    }

    // 위협
    if (risk.riskLevel === 'very_high') {
      threats.push('매우 높은 변동성 - 손실 위험 주의');
    }

    if (timing.exit.recommended) {
      threats.push('기술적 지표가 매도 신호 - 조정 가능성');
    }

    if (sentiment.fearGreedIndex < 30) {
      threats.push('시장 공포 심리 - 추가 하락 가능');
    }

    // 전략
    const strategy = timing.optimalStrategy.type === 'momentum'
      ? '모멘텀 전략: 상승 추세를 타고 단기 수익 실현'
      : timing.optimalStrategy.type === 'value'
      ? '밸류 전략: 저평가 구간에서 매수 후 장기 보유'
      : timing.optimalStrategy.type === 'swing'
      ? '스윙 전략: 중기 보유로 추세 이익 실현'
      : '스캘핑 전략: 단기 변동성 활용';

    return {
      keyFactors,
      opportunities,
      threats,
      strategy,
    };
  }
}

export const eliteInvestmentSystem = new EliteInvestmentSystem();

