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
  BarChart3
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { InvestmentAnalysis, StockData, CryptoData } from '@/lib/investment-api';
import { Portfolio, Trade, Holding } from '@/lib/virtual-trading';

export default function InvestmentPage() {
  const [hotStocks, setHotStocks] = useState<StockData[]>([]);
  const [hotCryptos, setHotCryptos] = useState<CryptoData[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'stock' | 'crypto'>('stock');
  const [analysis, setAnalysis] = useState<InvestmentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'trading' | 'portfolio'>('analysis');
  const [tradeQuantity, setTradeQuantity] = useState<string>('1');
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');

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
    fetchPortfolio();
    const interval = setInterval(fetchHotItems, 60000); // 1분마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const fetchPortfolio = async () => {
    setPortfolioLoading(true);
    try {
      const response = await fetch('/api/investment/portfolio');
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data.portfolio);
      }
    } catch (error) {
      console.error('포트폴리오 로드 실패:', error);
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handleTrade = async (symbol: string, name: string, type: 'stock' | 'crypto') => {
    if (!tradeQuantity || parseFloat(tradeQuantity) <= 0) {
      alert('수량을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/investment/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          type,
          action: tradeAction,
          quantity: parseFloat(tradeQuantity),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchPortfolio(); // 포트폴리오 새로고침
          setTradeQuantity('1'); // 수량 초기화
          alert(`${tradeAction === 'buy' ? '매수' : '매도'} 완료되었습니다.`);
        } else {
          alert(data.error || '거래에 실패했습니다.');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: '거래 실패' }));
        alert(errorData.error || '거래에 실패했습니다.');
      }
    } catch (error) {
      console.error('거래 실패:', error);
      alert('거래 중 오류가 발생했습니다.');
    }
  };

  const handleResetAccount = async () => {
    if (!confirm('정말로 계좌를 초기화하시겠습니까? 모든 거래 내역과 포트폴리오가 삭제됩니다.')) {
      return;
    }

    try {
      const response = await fetch('/api/investment/reset', {
        method: 'POST',
      });

      if (response.ok) {
        await fetchPortfolio(); // 포트폴리오 새로고침
        alert('계좌가 초기화되었습니다.');
      } else {
        const errorData = await response.json().catch(() => ({ error: '초기화 실패' }));
        alert(errorData.error || '계좌 초기화에 실패했습니다.');
      }
    } catch (error) {
      console.error('계좌 초기화 실패:', error);
      alert('계좌 초기화 중 오류가 발생했습니다.');
    }
  };

  const handleAnalyze = async (symbol: string, type: 'stock' | 'crypto') => {
    setSelectedSymbol(symbol);
    setSelectedType(type);
    setAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/investment/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, type }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('분석 실패:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUp className="w-5 h-5 text-green-600" />;
    if (trend === 'down') return <ArrowDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getActionColor = (action: string) => {
    if (action === 'buy') return 'text-green-600 bg-green-50';
    if (action === 'sell') return 'text-red-600 bg-red-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getActionText = (action: string) => {
    if (action === 'buy') return '매수';
    if (action === 'sell') return '매도';
    return '보유';
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              투자 분석 시스템
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              실시간 주식/코인 분석, HOT 종목, 상위 투자자 패턴 분석
            </p>
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                onClick={fetchHotItems}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
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

          {/* 탭 메뉴 */}
          <div className="flex gap-2 mb-8 bg-white rounded-xl p-2 shadow-lg border border-gray-200">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'analysis'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 종목 분석
            </button>
            <button
              onClick={() => setActiveTab('trading')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'trading'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💰 모의 투자
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📈 포트폴리오
            </button>
          </div>

          {/* 모의 투자 탭 */}
          {activeTab === 'trading' && (
            <div className="space-y-6 mb-8">
              {/* 계좌 현황 */}
              {portfolio && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl shadow-lg border-2 border-emerald-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">💰 가상 투자 계좌</h2>
                    <button
                      onClick={handleResetAccount}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      계좌 초기화
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">초기 자본</div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${portfolio.account.initialBalance.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">현금 잔액</div>
                      <div className="text-2xl font-bold text-blue-600">
                        ${portfolio.account.currentBalance.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">총 자산</div>
                      <div className="text-2xl font-bold text-emerald-600">
                        ${portfolio.account.totalValue.toLocaleString()}
                      </div>
                    </div>
                    <div className={`bg-white rounded-lg p-4 border-2 ${
                      portfolio.account.totalProfit >= 0 ? 'border-green-300' : 'border-red-300'
                    }`}>
                      <div className="text-sm text-gray-600 mb-1">수익/손실</div>
                      <div className={`text-2xl font-bold ${
                        portfolio.account.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {portfolio.account.totalProfit >= 0 ? '+' : ''}
                        ${portfolio.account.totalProfit.toLocaleString()}
                      </div>
                      <div className={`text-sm font-semibold ${
                        portfolio.account.totalProfitPercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ({portfolio.account.totalProfitPercent >= 0 ? '+' : ''}
                        {portfolio.account.totalProfitPercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 거래 설정 */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">거래 설정</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">거래 유형</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTradeAction('buy')}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                          tradeAction === 'buy'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        매수
                      </button>
                      <button
                        onClick={() => setTradeAction('sell')}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                          tradeAction === 'sell'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        매도
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">수량</label>
                    <input
                      type="number"
                      value={tradeQuantity}
                      onChange={(e) => setTradeQuantity(e.target.value)}
                      min="0.01"
                      step="0.01"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                      placeholder="수량 입력"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">종목 선택</label>
                    <p className="text-sm text-gray-600">아래 HOT 종목을 클릭하여 거래하세요</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 포트폴리오 탭 */}
          {activeTab === 'portfolio' && portfolio && (
            <div className="space-y-6 mb-8">
              {/* 보유 종목 */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">보유 종목</h3>
                {portfolio.holdings.length > 0 ? (
                  <div className="space-y-3">
                    {portfolio.holdings.map((holding) => (
                      <div
                        key={holding.id}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-lg text-gray-900">{holding.symbol}</h4>
                            <p className="text-sm text-gray-600">{holding.name}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              ${holding.currentValue.toLocaleString()}
                            </div>
                            <div className={`text-sm font-semibold ${
                              holding.profit >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {holding.profit >= 0 ? '+' : ''}
                              ${holding.profit.toLocaleString()} ({holding.profitPercent >= 0 ? '+' : ''}
                              {holding.profitPercent.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">수량:</span>
                            <span className="ml-2 font-semibold">{holding.quantity}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">평균가:</span>
                            <span className="ml-2 font-semibold">${holding.averagePrice.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">현재가:</span>
                            <span className="ml-2 font-semibold">${holding.currentPrice.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">총 매수:</span>
                            <span className="ml-2 font-semibold">${holding.totalCost.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => {
                              setTradeAction('sell');
                              setTradeQuantity(holding.quantity.toString());
                              setActiveTab('trading');
                            }}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                          >
                            전량 매도
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-600">
                    보유 종목이 없습니다. 모의 투자 탭에서 종목을 구매하세요.
                  </div>
                )}
              </div>

              {/* 거래 내역 */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">거래 내역</h3>
                {portfolio.trades.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {portfolio.trades.map((trade) => (
                      <div
                        key={trade.id}
                        className={`border-l-4 rounded p-3 ${
                          trade.action === 'buy'
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                trade.action === 'buy'
                                  ? 'bg-green-200 text-green-700'
                                  : 'bg-red-200 text-red-700'
                              }`}>
                                {trade.action === 'buy' ? '매수' : '매도'}
                              </span>
                              <span className="font-bold text-gray-900">{trade.symbol}</span>
                              <span className="text-sm text-gray-600">{trade.name}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {new Date(trade.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              {trade.quantity}주 × ${trade.price.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600">
                              총액: ${trade.totalAmount.toLocaleString()}
                            </div>
                            {trade.profit !== undefined && (
                              <div className={`text-sm font-semibold ${
                                trade.profit >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {trade.profit >= 0 ? '+' : ''}
                                ${trade.profit.toFixed(2)} ({trade.profitPercent && trade.profitPercent >= 0 ? '+' : ''}
                                {trade.profitPercent?.toFixed(2)}%)
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-600">
                    거래 내역이 없습니다.
                  </div>
                )}
              </div>

              {/* 통계 */}
              {portfolio.statistics.totalTrades > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">투자 통계</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-sm text-gray-600 mb-1">총 거래</div>
                      <div className="text-2xl font-bold text-blue-600">{portfolio.statistics.totalTrades}회</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-sm text-gray-600 mb-1">승리 거래</div>
                      <div className="text-2xl font-bold text-green-600">{portfolio.statistics.winningTrades}회</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="text-sm text-gray-600 mb-1">손실 거래</div>
                      <div className="text-2xl font-bold text-red-600">{portfolio.statistics.losingTrades}회</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="text-sm text-gray-600 mb-1">승률</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {portfolio.statistics.winRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  {portfolio.statistics.bestTrade && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm font-semibold text-green-700 mb-1">최고 거래</div>
                      <div className="text-gray-900">
                        {portfolio.statistics.bestTrade.symbol} 매도: +$
                        {portfolio.statistics.bestTrade.profit?.toFixed(2)} (
                        {portfolio.statistics.bestTrade.profitPercent?.toFixed(2)}%)
                      </div>
                    </div>
                  )}
                  {portfolio.statistics.worstTrade && (
                    <div className="mt-2 p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-sm font-semibold text-red-700 mb-1">최악 거래</div>
                      <div className="text-gray-900">
                        {portfolio.statistics.worstTrade.symbol} 매도: $
                        {portfolio.statistics.worstTrade.profit?.toFixed(2)} (
                        {portfolio.statistics.worstTrade.profitPercent?.toFixed(2)}%)
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 종목 분석 탭 (기존 내용) */}
          {activeTab === 'analysis' && (
            <>
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

              {/* HOT 주식 종목 Top 5 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">🔥 HOT 주식 종목 Top 5</h2>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
                <p className="text-gray-600">HOT 종목을 불러오는 중...</p>
              </div>
            ) : hotStocks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotStocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-all cursor-pointer"
                    onClick={() => handleAnalyze(stock.symbol, 'stock')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{stock.symbol}</h3>
                        <p className="text-sm text-gray-600">{stock.name}</p>
                      </div>
                      {getTrendIcon(stock.changePercent > 0 ? 'up' : stock.changePercent < 0 ? 'down' : 'neutral')}
                    </div>
                    <div className="space-y-2">
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
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">거래량:</span>
                        <span className="font-semibold text-gray-700">
                          {(stock.volume / 1000000).toFixed(2)}M
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnalyze(stock.symbol, 'stock');
                          }}
                          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold"
                        >
                          상세 분석
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('trading');
                            setSelectedSymbol(stock.symbol);
                            setSelectedType('stock');
                          }}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                        >
                          거래하기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                HOT 주식 종목을 불러올 수 없습니다.
              </div>
            )}
          </div>

              {/* HOT 암호화폐 Top 5 */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-orange-600" />
                    <h2 className="text-2xl font-bold text-gray-900">🔥 HOT 암호화폐 Top 5</h2>
                  </div>
                </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
                <p className="text-gray-600">HOT 암호화폐를 불러오는 중...</p>
              </div>
            ) : hotCryptos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hotCryptos.map((crypto) => (
                  <div
                    key={crypto.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-all cursor-pointer"
                    onClick={() => handleAnalyze(crypto.id, 'crypto')}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{crypto.symbol.toUpperCase()}</h3>
                        <p className="text-sm text-gray-600">{crypto.name}</p>
                      </div>
                      {getTrendIcon(crypto.priceChangePercent24h > 0 ? 'up' : crypto.priceChangePercent24h < 0 ? 'down' : 'neutral')}
                    </div>
                    <div className="space-y-2">
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
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">시가총액:</span>
                        <span className="font-semibold text-gray-700">
                          ${(crypto.marketCap / 1000000000).toFixed(2)}B
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnalyze(crypto.id, 'crypto');
                          }}
                          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold"
                        >
                          상세 분석
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('trading');
                            setSelectedSymbol(crypto.id);
                            setSelectedType('crypto');
                          }}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                        >
                          거래하기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                HOT 암호화폐를 불러올 수 없습니다.
              </div>
            )}
          </div>

              {/* 상세 분석 결과 */}
              {analyzing && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
                <p className="text-gray-600">AI 분석을 수행하는 중...</p>
              </div>
            </div>
          )}

              {analysis && (
                <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{analysis.name} ({analysis.symbol})</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {analysis.type === 'stock' ? '주식' : '암호화폐'} • HOT 점수: {analysis.hotScore.toFixed(1)}점
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      ${analysis.currentPrice.toFixed(2)}
                    </div>
                    <div className={`text-sm font-semibold ${analysis.trend === 'up' ? 'text-green-600' : analysis.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                      {analysis.trend === 'up' ? '상승 추세' : analysis.trend === 'down' ? '하락 추세' : '중립'}
                    </div>
                  </div>
                </div>

                {/* 상위 투자자 활동 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      상위 1% 투자자 활동
                    </h3>
                    <div className={`inline-block px-4 py-2 rounded-lg mb-3 ${getActionColor(analysis.topInvestorActivity.top1Percent.action)}`}>
                      <span className="font-bold">{getActionText(analysis.topInvestorActivity.top1Percent.action)}</span>
                      <span className="ml-2 text-sm">신뢰도: {analysis.topInvestorActivity.top1Percent.confidence.toFixed(0)}%</span>
                    </div>
                    <p className="text-sm text-gray-700">{analysis.topInvestorActivity.top1Percent.reason}</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      상위 5% 투자자 활동
                    </h3>
                    <div className={`inline-block px-4 py-2 rounded-lg mb-3 ${getActionColor(analysis.topInvestorActivity.top5Percent.action)}`}>
                      <span className="font-bold">{getActionText(analysis.topInvestorActivity.top5Percent.action)}</span>
                      <span className="ml-2 text-sm">신뢰도: {analysis.topInvestorActivity.top5Percent.confidence.toFixed(0)}%</span>
                    </div>
                    <p className="text-sm text-gray-700">{analysis.topInvestorActivity.top5Percent.reason}</p>
                  </div>
                </div>

                {/* 가격 변동 이유 */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">📊 가격 변동 이유</h3>
                  <p className="text-gray-700 mb-3">{analysis.priceMovement.reason}</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.priceMovement.factors.map((factor, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 지금투자? 버튼 및 타이밍 분석 */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200">
                  <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-emerald-600" />
                    지금투자? 타이밍 분석
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {analysis.timing.buyTiming && (
                      <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-green-700">매수 타이밍</h4>
                          {analysis.timing.buyTiming.recommended && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">추천</span>
                          )}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">권장 가격:</span>
                            <span className="font-bold text-gray-900">${analysis.timing.buyTiming.price.toFixed(2)}</span>
                          </div>
                          {analysis.timing.buyTiming.expectedGain && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">예상 수익률:</span>
                              <span className="font-bold text-green-600">+{analysis.timing.buyTiming.expectedGain.toFixed(2)}%</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">위험도:</span>
                            <span className={`font-semibold ${
                              analysis.timing.buyTiming.riskLevel === 'low' ? 'text-green-600' :
                              analysis.timing.buyTiming.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {analysis.timing.buyTiming.riskLevel === 'low' ? '낮음' :
                               analysis.timing.buyTiming.riskLevel === 'medium' ? '중간' : '높음'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">{analysis.timing.buyTiming.reason}</p>
                        </div>
                      </div>
                    )}

                    {analysis.timing.sellTiming && (
                      <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-red-700">매도 타이밍</h4>
                          {analysis.timing.sellTiming.recommended && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">추천</span>
                          )}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">권장 가격:</span>
                            <span className="font-bold text-gray-900">${analysis.timing.sellTiming.price.toFixed(2)}</span>
                          </div>
                          {analysis.timing.sellTiming.expectedGain && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">예상 수익률:</span>
                              <span className="font-bold text-green-600">+{analysis.timing.sellTiming.expectedGain.toFixed(2)}%</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">위험도:</span>
                            <span className={`font-semibold ${
                              analysis.timing.sellTiming.riskLevel === 'low' ? 'text-green-600' :
                              analysis.timing.sellTiming.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {analysis.timing.sellTiming.riskLevel === 'low' ? '낮음' :
                               analysis.timing.sellTiming.riskLevel === 'medium' ? '중간' : '높음'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">{analysis.timing.sellTiming.reason}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 단타/장타 전략 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-orange-700">⚡ 단타 전략 (1-3일)</h4>
                        {analysis.strategy.shortTerm.recommended && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">추천</span>
                        )}
                      </div>
                      {analysis.strategy.shortTerm.recommended ? (
                        <div className="space-y-2 text-sm">
                          {analysis.strategy.shortTerm.entryPrice && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">진입가:</span>
                              <span className="font-bold text-gray-900">${analysis.strategy.shortTerm.entryPrice.toFixed(2)}</span>
                            </div>
                          )}
                          {analysis.strategy.shortTerm.exitPrice && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">청산가:</span>
                              <span className="font-bold text-gray-900">${analysis.strategy.shortTerm.exitPrice.toFixed(2)}</span>
                            </div>
                          )}
                          {analysis.strategy.shortTerm.expectedGain && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">예상 수익:</span>
                              <span className="font-bold text-green-600">+{analysis.strategy.shortTerm.expectedGain.toFixed(2)}%</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">위험도:</span>
                            <span className={`font-semibold ${
                              analysis.strategy.shortTerm.riskLevel === 'low' ? 'text-green-600' :
                              analysis.strategy.shortTerm.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {analysis.strategy.shortTerm.riskLevel === 'low' ? '낮음' :
                               analysis.strategy.shortTerm.riskLevel === 'medium' ? '중간' : '높음'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">단타 전략 비추천</p>
                      )}
                    </div>

                    <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-blue-700">📈 장타 전략 (1-3개월)</h4>
                        {analysis.strategy.longTerm.recommended && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">추천</span>
                        )}
                      </div>
                      {analysis.strategy.longTerm.recommended ? (
                        <div className="space-y-2 text-sm">
                          {analysis.strategy.longTerm.entryPrice && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">진입가:</span>
                              <span className="font-bold text-gray-900">${analysis.strategy.longTerm.entryPrice.toFixed(2)}</span>
                            </div>
                          )}
                          {analysis.strategy.longTerm.exitPrice && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">청산가:</span>
                              <span className="font-bold text-gray-900">${analysis.strategy.longTerm.exitPrice.toFixed(2)}</span>
                            </div>
                          )}
                          {analysis.strategy.longTerm.expectedGain && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">예상 수익:</span>
                              <span className="font-bold text-green-600">+{analysis.strategy.longTerm.expectedGain.toFixed(2)}%</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">위험도:</span>
                            <span className={`font-semibold ${
                              analysis.strategy.longTerm.riskLevel === 'low' ? 'text-green-600' :
                              analysis.strategy.longTerm.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {analysis.strategy.longTerm.riskLevel === 'low' ? '낮음' :
                               analysis.strategy.longTerm.riskLevel === 'medium' ? '중간' : '높음'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">장타 전략 비추천</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

