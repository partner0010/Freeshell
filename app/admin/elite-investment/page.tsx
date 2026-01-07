'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Target,
  BarChart3,
  Shield,
  Brain,
  Activity,
  Award,
  TrendingUp as TrendingUpIcon,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { EliteAnalysis } from '@/lib/elite-investment-system';
import { StockData, CryptoData } from '@/lib/investment-api';

export default function EliteInvestmentPage() {
  const [hotStocks, setHotStocks] = useState<StockData[]>([]);
  const [hotCryptos, setHotCryptos] = useState<CryptoData[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'stock' | 'crypto'>('stock');
  const [eliteAnalysis, setEliteAnalysis] = useState<EliteAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchHotItems = async () => {
    setLoading(true);
    try {
      const [stocksRes, cryptosRes] = await Promise.all([
        fetch('/api/investment/hot-stocks'),
        fetch('/api/investment/hot-cryptos'),
      ]);

      if (stocksRes.ok) {
        const stocksData = await stocksRes.json();
        setHotStocks(stocksData.stocks || []);
      }

      if (cryptosRes.ok) {
        const cryptosData = await cryptosRes.json();
        setHotCryptos(cryptosData.cryptos || []);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('HOT 종목 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotItems();
    const interval = setInterval(fetchHotItems, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleEliteAnalysis = async (symbol: string, type: 'stock' | 'crypto') => {
    setSelectedSymbol(symbol);
    setSelectedType(type);
    setAnalyzing(true);
    setEliteAnalysis(null);

    try {
      const response = await fetch('/api/investment/elite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, type }),
      });

      if (response.ok) {
        const data = await response.json();
        setEliteAnalysis(data.analysis);
      } else {
        const error = await response.json();
        alert(error.error || '분석 실패');
      }
    } catch (error) {
      console.error('엘리트 분석 실패:', error);
      alert('분석 중 오류가 발생했습니다.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getRecommendationColor = (rec: string) => {
    if (rec === 'strong_buy') return 'text-green-700 bg-green-100 border-green-300';
    if (rec === 'buy') return 'text-green-600 bg-green-50 border-green-200';
    if (rec === 'hold') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (rec === 'sell') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-red-700 bg-red-100 border-red-300';
  };

  const getRecommendationText = (rec: string) => {
    if (rec === 'strong_buy') return '강력 매수';
    if (rec === 'buy') return '매수';
    if (rec === 'hold') return '보유';
    if (rec === 'sell') return '매도';
    return '강력 매도';
  };

  const getActionColor = (action: string) => {
    if (action === 'accumulate') return 'text-green-700 bg-green-100';
    if (action === 'hold') return 'text-yellow-700 bg-yellow-100';
    if (action === 'reduce') return 'text-orange-700 bg-orange-100';
    return 'text-red-700 bg-red-100';
  };

  const getActionText = (action: string) => {
    if (action === 'accumulate') return '점진적 매수';
    if (action === 'hold') return '보유';
    if (action === 'reduce') return '포지션 축소';
    return '전량 매도';
  };

  const getSignalIcon = (signal: string) => {
    if (signal === 'strong_buy' || signal === 'buy') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (signal === 'strong_sell' || signal === 'sell') return <XCircle className="w-5 h-5 text-red-600" />;
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-6 shadow-lg">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              상위 1% 투자 프로그램
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-2">
              전문가급 심층 분석 시스템
            </p>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              기술적 분석 • 펀더멘털 분석 • 시장 심리 • 리스크 관리 • 최적 타이밍
            </p>
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                onClick={fetchHotItems}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>새로고침</span>
              </button>
              {lastUpdate && (
                <span className="text-sm text-gray-600">
                  마지막 업데이트: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* 경고 메시지 */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-2">⚠️ 투자 위험 고지</h3>
                <p className="text-sm text-yellow-800">
                  본 시스템은 정보 제공 목적으로만 사용됩니다. 실제 투자 결정은 본인의 판단과 책임 하에 이루어져야 하며, 
                  투자 손실에 대한 책임을 지지 않습니다. 투자 전 충분한 검토와 전문가 상담을 권장합니다.
                </p>
              </div>
            </div>
          </div>

          {/* HOT 주식 종목 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">🔥 HOT 주식 종목</h2>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
                <p className="text-gray-600">HOT 종목을 불러오는 중...</p>
              </div>
            ) : hotStocks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotStocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all cursor-pointer"
                    onClick={() => handleEliteAnalysis(stock.symbol, 'stock')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{stock.symbol}</h3>
                        <p className="text-sm text-gray-600">{stock.name}</p>
                      </div>
                      {stock.changePercent > 0 ? (
                        <ArrowUp className="w-5 h-5 text-green-600" />
                      ) : stock.changePercent < 0 ? (
                        <ArrowDown className="w-5 h-5 text-red-600" />
                      ) : (
                        <Minus className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">현재가:</span>
                        <span className="font-bold text-gray-900">${stock.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">변동률:</span>
                        <span className={`font-bold ${stock.changePercent > 0 ? 'text-green-600' : stock.changePercent < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliteAnalysis(stock.symbol, 'stock');
                      }}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-semibold"
                    >
                      🏆 상위 1% 분석
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                HOT 주식 종목을 불러올 수 없습니다.
              </div>
            )}
          </div>

          {/* HOT 암호화폐 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">🔥 HOT 암호화폐</h2>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
                <p className="text-gray-600">HOT 암호화폐를 불러오는 중...</p>
              </div>
            ) : hotCryptos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotCryptos.map((crypto) => (
                  <div
                    key={crypto.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all cursor-pointer"
                    onClick={() => handleEliteAnalysis(crypto.id, 'crypto')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{crypto.symbol.toUpperCase()}</h3>
                        <p className="text-sm text-gray-600">{crypto.name}</p>
                      </div>
                      {crypto.priceChangePercent24h > 0 ? (
                        <ArrowUp className="w-5 h-5 text-green-600" />
                      ) : crypto.priceChangePercent24h < 0 ? (
                        <ArrowDown className="w-5 h-5 text-red-600" />
                      ) : (
                        <Minus className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">현재가:</span>
                        <span className="font-bold text-gray-900">${crypto.currentPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">변동률:</span>
                        <span className={`font-bold ${crypto.priceChangePercent24h > 0 ? 'text-green-600' : crypto.priceChangePercent24h < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {crypto.priceChangePercent24h > 0 ? '+' : ''}{crypto.priceChangePercent24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliteAnalysis(crypto.id, 'crypto');
                      }}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-semibold"
                    >
                      🏆 상위 1% 분석
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                HOT 암호화폐를 불러올 수 없습니다.
              </div>
            )}
          </div>

          {/* 엘리트 분석 결과 */}
          {analyzing && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold">상위 1% 투자자 수준의 심층 분석을 수행하는 중...</p>
                <p className="text-sm text-gray-500 mt-2">기술적 분석 • 펀더멘털 분석 • 시장 심리 • 리스크 평가</p>
              </div>
            </div>
          )}

          {eliteAnalysis && (
            <div className="space-y-6">
              {/* 종합 요약 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg border-2 border-purple-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {eliteAnalysis.name} ({eliteAnalysis.symbol})
                    </h2>
                    <p className="text-sm text-gray-600">
                      {eliteAnalysis.type === 'stock' ? '주식' : '암호화폐'} • 현재가: ${eliteAnalysis.currentPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-6 py-3 rounded-xl border-2 font-bold text-lg ${getRecommendationColor(eliteAnalysis.recommendation)}`}>
                      {getRecommendationText(eliteAnalysis.recommendation)}
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold text-purple-600">
                        종합 점수: {eliteAnalysis.overallScore.toFixed(1)}점
                      </div>
                      <div className="text-sm text-gray-600">
                        신뢰도: {eliteAnalysis.confidence.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* 상위 1% 투자자 행동 */}
                <div className="bg-white rounded-xl p-6 border-2 border-purple-300 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-gray-900">상위 1% 투자자 행동 시뮬레이션</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className={`inline-block px-4 py-2 rounded-lg mb-3 ${getActionColor(eliteAnalysis.eliteInvestor.action)}`}>
                        <span className="font-bold">{getActionText(eliteAnalysis.eliteInvestor.action)}</span>
                        <span className="ml-2 text-sm">신뢰도: {eliteAnalysis.eliteInvestor.confidence.toFixed(0)}%</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{eliteAnalysis.eliteInvestor.reasoning}</p>
                      <div className="text-sm text-gray-600">
                        <div>포지션 크기: {eliteAnalysis.eliteInvestor.positionSize}%</div>
                        <div>타임라인: {eliteAnalysis.eliteInvestor.timeline}</div>
                        <div className="font-semibold text-purple-600 mt-2">
                          예상 결과: {eliteAnalysis.eliteInvestor.expectedOutcome}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 기술적 분석 */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900">기술적 분석</h3>
                  <span className="ml-auto px-4 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                    점수: {eliteAnalysis.technical.score.toFixed(1)}점
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-700">추세:</span>
                    <span className={`px-3 py-1 rounded-lg font-semibold ${
                      eliteAnalysis.technical.trend.includes('uptrend') 
                        ? 'bg-green-100 text-green-700'
                        : eliteAnalysis.technical.trend.includes('downtrend')
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {eliteAnalysis.technical.trend === 'strong_uptrend' ? '강한 상승 추세' :
                       eliteAnalysis.technical.trend === 'uptrend' ? '상승 추세' :
                       eliteAnalysis.technical.trend === 'sideways' ? '횡보' :
                       eliteAnalysis.technical.trend === 'downtrend' ? '하락 추세' : '강한 하락 추세'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">지지선:</span>
                      <span className="ml-2 font-semibold">${eliteAnalysis.technical.support[0].toFixed(2)}, ${eliteAnalysis.technical.support[1].toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">저항선:</span>
                      <span className="ml-2 font-semibold">${eliteAnalysis.technical.resistance[0].toFixed(2)}, ${eliteAnalysis.technical.resistance[1].toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {eliteAnalysis.technical.indicators.map((indicator, idx) => (
                    <div key={idx} className="border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">{indicator.name}</span>
                        {getSignalIcon(indicator.signal)}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{indicator.description}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">신호 강도:</span>
                        <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              indicator.signal.includes('buy') ? 'bg-green-600' :
                              indicator.signal.includes('sell') ? 'bg-red-600' : 'bg-yellow-600'
                            }`}
                            style={{ width: `${indicator.strength}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold">{indicator.strength.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 펀더멘털 분석 */}
              {eliteAnalysis.fundamental && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Brain className="w-6 h-6 text-green-600" />
                    <h3 className="text-2xl font-bold text-gray-900">펀더멘털 분석</h3>
                    <span className="ml-auto px-4 py-1 bg-green-100 text-green-700 rounded-lg font-semibold text-lg">
                      {eliteAnalysis.fundamental.grade}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {eliteAnalysis.fundamental.marketCap && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">시가총액</div>
                        <div className="font-bold text-gray-900">
                          ${(eliteAnalysis.fundamental.marketCap / 1000000000).toFixed(2)}B
                        </div>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">종합 점수</div>
                      <div className="font-bold text-gray-900">{eliteAnalysis.fundamental.score.toFixed(0)}점</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">등급</div>
                      <div className="font-bold text-gray-900">{eliteAnalysis.fundamental.grade}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">추천</div>
                      <div className={`font-bold ${
                        eliteAnalysis.fundamental.recommendation === 'strong_buy' || eliteAnalysis.fundamental.recommendation === 'buy'
                          ? 'text-green-600'
                          : eliteAnalysis.fundamental.recommendation === 'hold'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {getRecommendationText(eliteAnalysis.fundamental.recommendation)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 시장 심리 */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-6 h-6 text-orange-600" />
                  <h3 className="text-2xl font-bold text-gray-900">시장 심리 분석</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-gray-900">공포/탐욕 지수</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {eliteAnalysis.sentiment.fearGreedIndex.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <div
                        className={`h-4 rounded-full ${
                          eliteAnalysis.sentiment.fearGreedIndex > 70 ? 'bg-green-600' :
                          eliteAnalysis.sentiment.fearGreedIndex > 50 ? 'bg-yellow-600' :
                          eliteAnalysis.sentiment.fearGreedIndex > 30 ? 'bg-orange-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${eliteAnalysis.sentiment.fearGreedIndex}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-700">
                      {eliteAnalysis.sentiment.fearGreedIndex > 70 ? '매우 탐욕적 (과매수 가능)' :
                       eliteAnalysis.sentiment.fearGreedIndex > 50 ? '탐욕적' :
                       eliteAnalysis.sentiment.fearGreedIndex > 30 ? '공포적' : '매우 공포적 (과매도 가능)'}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-semibold">소셜 심리:</span>
                        <span className={`px-3 py-1 rounded-lg font-semibold ${
                          eliteAnalysis.sentiment.socialSentiment.includes('bullish')
                            ? 'bg-green-100 text-green-700'
                            : eliteAnalysis.sentiment.socialSentiment.includes('bearish')
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {eliteAnalysis.sentiment.socialSentiment === 'very_bullish' ? '매우 강세' :
                           eliteAnalysis.sentiment.socialSentiment === 'bullish' ? '강세' :
                           eliteAnalysis.sentiment.socialSentiment === 'neutral' ? '중립' :
                           eliteAnalysis.sentiment.socialSentiment === 'bearish' ? '약세' : '매우 약세'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-semibold">애널리스트 등급:</span>
                        <span className={`px-3 py-1 rounded-lg font-semibold ${getRecommendationColor(eliteAnalysis.sentiment.analystRating)}`}>
                          {getRecommendationText(eliteAnalysis.sentiment.analystRating)}
                        </span>
                      </div>
                    </div>
                    {eliteAnalysis.sentiment.priceTarget && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700 font-semibold">목표가:</span>
                          <span className="font-bold text-gray-900">${eliteAnalysis.sentiment.priceTarget.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{eliteAnalysis.sentiment.consensus}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 리스크 분석 */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-red-600" />
                  <h3 className="text-2xl font-bold text-gray-900">리스크 분석</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-700">변동성:</span>
                      <span className={`px-3 py-1 rounded-lg font-semibold ${
                        eliteAnalysis.risk.volatility > 70 ? 'bg-red-100 text-red-700' :
                        eliteAnalysis.risk.volatility > 50 ? 'bg-orange-100 text-orange-700' :
                        eliteAnalysis.risk.volatility > 30 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {eliteAnalysis.risk.volatility.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-700">최대 낙폭:</span>
                      <span className="font-bold text-red-600">{eliteAnalysis.risk.maxDrawdown.toFixed(2)}%</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-700">리스크 레벨:</span>
                      <span className={`px-3 py-1 rounded-lg font-semibold ${
                        eliteAnalysis.risk.riskLevel === 'very_high' ? 'bg-red-100 text-red-700' :
                        eliteAnalysis.risk.riskLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                        eliteAnalysis.risk.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        eliteAnalysis.risk.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {eliteAnalysis.risk.riskLevel === 'very_high' ? '매우 높음' :
                         eliteAnalysis.risk.riskLevel === 'high' ? '높음' :
                         eliteAnalysis.risk.riskLevel === 'medium' ? '중간' :
                         eliteAnalysis.risk.riskLevel === 'low' ? '낮음' : '매우 낮음'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-4">
                      <span className="font-semibold text-gray-700 mb-2 block">리스크 요인:</span>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {eliteAnalysis.risk.riskFactors.map((factor, idx) => (
                          <li key={idx}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 mb-2 block">완화 방안:</span>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {eliteAnalysis.risk.mitigation.map((mit, idx) => (
                          <li key={idx}>{mit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 최적 타이밍 */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl shadow-lg border-2 border-emerald-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-2xl font-bold text-gray-900">최적 타이밍 분석</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* 진입 타이밍 */}
                  <div className="bg-white rounded-xl p-6 border-2 border-emerald-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg text-emerald-700">진입 타이밍</h4>
                      {eliteAnalysis.timing.entry.recommended && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                          추천
                        </span>
                      )}
                    </div>
                    {eliteAnalysis.timing.entry.recommended ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">권장 가격:</span>
                          <span className="font-bold text-gray-900">${eliteAnalysis.timing.entry.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">신뢰도:</span>
                          <span className="font-bold text-emerald-600">{eliteAnalysis.timing.entry.confidence.toFixed(0)}%</span>
                        </div>
                        {eliteAnalysis.timing.entry.stopLoss && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">손절가:</span>
                            <span className="font-bold text-red-600">${eliteAnalysis.timing.entry.stopLoss.toFixed(2)}</span>
                          </div>
                        )}
                        {eliteAnalysis.timing.entry.takeProfit && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">익절가:</span>
                            <span className="font-bold text-green-600">${eliteAnalysis.timing.entry.takeProfit.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="bg-gray-50 rounded-lg p-3 mt-3">
                          <p className="text-sm text-gray-700">{eliteAnalysis.timing.entry.reason}</p>
                          <p className="text-xs text-gray-600 mt-1">타임프레임: {eliteAnalysis.timing.entry.timeframe}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">현재 진입 시점이 최적이 아닙니다.</p>
                    )}
                  </div>

                  {/* 청산 타이밍 */}
                  <div className="bg-white rounded-xl p-6 border-2 border-red-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg text-red-700">청산 타이밍</h4>
                      {eliteAnalysis.timing.exit.recommended && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                          추천
                        </span>
                      )}
                    </div>
                    {eliteAnalysis.timing.exit.recommended ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">권장 가격:</span>
                          <span className="font-bold text-gray-900">${eliteAnalysis.timing.exit.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">신뢰도:</span>
                          <span className="font-bold text-red-600">{eliteAnalysis.timing.exit.confidence.toFixed(0)}%</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 mt-3">
                          <p className="text-sm text-gray-700">{eliteAnalysis.timing.exit.reason}</p>
                          <p className="text-xs text-gray-600 mt-1">타임프레임: {eliteAnalysis.timing.exit.timeframe}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">현재 보유 유지가 적절합니다.</p>
                    )}
                  </div>
                </div>

                {/* 최적 전략 */}
                <div className="bg-white rounded-xl p-6 border-2 border-purple-300">
                  <h4 className="font-bold text-lg text-purple-700 mb-4">최적 투자 전략</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-600 text-sm">전략 유형:</span>
                      <div className="font-bold text-gray-900 mt-1">
                        {eliteAnalysis.timing.optimalStrategy.type === 'momentum' ? '모멘텀' :
                         eliteAnalysis.timing.optimalStrategy.type === 'value' ? '밸류' :
                         eliteAnalysis.timing.optimalStrategy.type === 'growth' ? '성장' :
                         eliteAnalysis.timing.optimalStrategy.type === 'dividend' ? '배당' :
                         eliteAnalysis.timing.optimalStrategy.type === 'swing' ? '스윙' : '스캘핑'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">보유 기간:</span>
                      <div className="font-bold text-gray-900 mt-1">{eliteAnalysis.timing.optimalStrategy.holdingPeriod}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">포지션 크기:</span>
                      <div className="font-bold text-gray-900 mt-1">{eliteAnalysis.timing.optimalStrategy.positionSize}%</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">리스크/수익 비율:</span>
                      <div className="font-bold text-gray-900 mt-1">{eliteAnalysis.timing.optimalStrategy.riskRewardRatio.toFixed(2)}:1</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">예상 수익률:</span>
                      <div className="font-bold text-green-600 mt-1">+{eliteAnalysis.timing.optimalStrategy.expectedReturn.toFixed(2)}%</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">최대 손실:</span>
                      <div className="font-bold text-red-600 mt-1">-{eliteAnalysis.timing.optimalStrategy.maxLoss.toFixed(2)}%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI 인사이트 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border-2 border-blue-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-6 h-6 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900">AI 인사이트</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      주요 요인
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {eliteAnalysis.aiInsights.keyFactors.map((factor, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUpIcon className="w-5 h-5 text-green-600" />
                      기회
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {eliteAnalysis.aiInsights.opportunities.length > 0 ? (
                        eliteAnalysis.aiInsights.opportunities.map((opp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span>{opp}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500">현재 특별한 기회가 없습니다.</li>
                      )}
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      위협
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {eliteAnalysis.aiInsights.threats.length > 0 ? (
                        eliteAnalysis.aiInsights.threats.map((threat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-600 mt-0.5">•</span>
                            <span>{threat}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500">현재 특별한 위협이 없습니다.</li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="mt-6 bg-white rounded-xl p-6 border-2 border-blue-300">
                  <h4 className="font-bold text-gray-900 mb-3">추천 전략</h4>
                  <p className="text-gray-700">{eliteAnalysis.aiInsights.strategy}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

