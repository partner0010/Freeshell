/**
 * 가상 투자 시스템
 * 실제 돈 없이 모의 투자를 통해 실전 경험
 */

export interface VirtualAccount {
  id: string;
  userId: string;
  initialBalance: number;
  currentBalance: number;
  totalInvested: number;
  totalValue: number; // 현재 보유 종목 가치 + 현금
  totalProfit: number;
  totalProfitPercent: number;
  createdAt: number;
  lastUpdated: number;
}

export interface Holding {
  id: string;
  accountId: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  quantity: number;
  averagePrice: number; // 평균 매수 가격
  currentPrice: number;
  totalCost: number; // 총 매수 금액
  currentValue: number; // 현재 가치
  profit: number; // 수익/손실
  profitPercent: number; // 수익률
  purchasedAt: number;
  lastUpdated: number;
}

export interface Trade {
  id: string;
  accountId: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
  totalAmount: number;
  fee: number; // 거래 수수료 (0.1%)
  timestamp: number;
  profit?: number; // 매도 시 수익/손실
  profitPercent?: number; // 매도 시 수익률
}

export interface Portfolio {
  account: VirtualAccount;
  holdings: Holding[];
  trades: Trade[];
  statistics: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    averageProfit: number;
    bestTrade: Trade | null;
    worstTrade: Trade | null;
  };
}

// 전역 가상 계좌 저장소
declare global {
  var __virtualAccounts: Map<string, VirtualAccount>;
  var __holdings: Map<string, Holding>;
  var __trades: Map<string, Trade>;
}

if (!global.__virtualAccounts) {
  global.__virtualAccounts = new Map<string, VirtualAccount>();
}

if (!global.__holdings) {
  global.__holdings = new Map<string, Holding>();
}

if (!global.__trades) {
  global.__trades = new Map<string, Trade>();
}

export class VirtualTrading {
  private readonly TRADING_FEE = 0.001; // 0.1% 거래 수수료

  /**
   * 가상 계좌 생성 또는 가져오기
   */
  getOrCreateAccount(userId: string = 'default', initialBalance: number = 100000): VirtualAccount {
    const accountId = `account-${userId}`;
    let account = global.__virtualAccounts.get(accountId);

    if (!account) {
      account = {
        id: accountId,
        userId,
        initialBalance,
        currentBalance: initialBalance,
        totalInvested: 0,
        totalValue: initialBalance,
        totalProfit: 0,
        totalProfitPercent: 0,
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      };
      global.__virtualAccounts.set(accountId, account);
      console.log('[VirtualTrading] 새 가상 계좌 생성:', accountId, initialBalance);
    }

    // 보유 종목 가치 업데이트
    this.updateAccountValue(accountId);
    return global.__virtualAccounts.get(accountId)!;
  }

  /**
   * 계좌 가치 업데이트 (보유 종목 현재가 반영)
   */
  async updateAccountValue(accountId: string): Promise<void> {
    const account = global.__virtualAccounts.get(accountId);
    if (!account) return;

    // 보유 종목 가져오기
    const holdings = Array.from(global.__holdings.values()).filter(h => h.accountId === accountId);
    
    let totalValue = account.currentBalance;
    let totalCost = 0;

    // 각 보유 종목의 현재가 업데이트
    const { investmentAPI } = await import('./investment-api');
    
    for (const holding of holdings) {
      try {
        const stockData = holding.type === 'stock'
          ? await investmentAPI.getStockData(holding.symbol)
          : null;
        const cryptoData = holding.type === 'crypto'
          ? await investmentAPI.getCryptoData(holding.symbol)
          : null;
        const currentData = stockData || cryptoData;

        if (currentData) {
          const currentPrice = stockData
            ? stockData.price
            : (cryptoData ? cryptoData.currentPrice : 0);

          holding.currentPrice = currentPrice;
          holding.currentValue = holding.quantity * currentPrice;
          holding.profit = holding.currentValue - holding.totalCost;
          holding.profitPercent = holding.totalCost > 0
            ? (holding.profit / holding.totalCost) * 100
            : 0;
          holding.lastUpdated = Date.now();

          totalValue += holding.currentValue;
          totalCost += holding.totalCost;
        }
      } catch (error) {
        console.error(`[VirtualTrading] ${holding.symbol} 가격 업데이트 실패:`, error);
      }
    }

    // 계좌 정보 업데이트
    account.totalInvested = totalCost;
    account.totalValue = totalValue;
    account.totalProfit = totalValue - account.initialBalance;
    account.totalProfitPercent = account.initialBalance > 0
      ? (account.totalProfit / account.initialBalance) * 100
      : 0;
    account.lastUpdated = Date.now();

    global.__virtualAccounts.set(accountId, account);
  }

  /**
   * 주식/코인 구매
   */
  async buy(
    accountId: string,
    symbol: string,
    name: string,
    type: 'stock' | 'crypto',
    quantity: number
  ): Promise<{ success: boolean; trade?: Trade; error?: string }> {
    try {
      const account = global.__virtualAccounts.get(accountId);
      if (!account) {
        return { success: false, error: '계좌를 찾을 수 없습니다.' };
      }

      // 현재가 가져오기
      const { investmentAPI } = await import('./investment-api');
      const stockData = type === 'stock'
        ? await investmentAPI.getStockData(symbol)
        : null;
      const cryptoData = type === 'crypto'
        ? await investmentAPI.getCryptoData(symbol)
        : null;
      const currentData = stockData || cryptoData;

      if (!currentData) {
        return { success: false, error: '종목 데이터를 가져올 수 없습니다.' };
      }

      const currentPrice = stockData
        ? stockData.price
        : (cryptoData ? cryptoData.currentPrice : 0);

      const totalAmount = currentPrice * quantity;
      const fee = totalAmount * this.TRADING_FEE;
      const totalCost = totalAmount + fee;

      // 잔액 확인
      if (account.currentBalance < totalCost) {
        return { success: false, error: `잔액이 부족합니다. 필요: $${totalCost.toFixed(2)}, 보유: $${account.currentBalance.toFixed(2)}` };
      }

      // 거래 생성
      const trade: Trade = {
        id: `trade-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        accountId,
        symbol,
        name,
        type,
        action: 'buy',
        quantity,
        price: currentPrice,
        totalAmount,
        fee,
        timestamp: Date.now(),
      };

      // 보유 종목 업데이트 또는 생성
      const holdingId = `${accountId}-${symbol}-${type}`;
      let holding = global.__holdings.get(holdingId);

      if (holding) {
        // 기존 보유 종목에 추가
        const newTotalCost = holding.totalCost + totalAmount;
        const newQuantity = holding.quantity + quantity;
        holding.averagePrice = newTotalCost / newQuantity;
        holding.quantity = newQuantity;
        holding.totalCost = newTotalCost;
        holding.currentPrice = currentPrice;
        holding.currentValue = newQuantity * currentPrice;
        holding.lastUpdated = Date.now();
      } else {
        // 새 보유 종목 생성
        holding = {
          id: holdingId,
          accountId,
          symbol,
          name,
          type,
          quantity,
          averagePrice: currentPrice,
          currentPrice,
          totalCost: totalAmount,
          currentValue: totalAmount,
          profit: 0,
          profitPercent: 0,
          purchasedAt: Date.now(),
          lastUpdated: Date.now(),
        };
      }

      // 계좌 업데이트
      account.currentBalance -= totalCost;
      account.totalInvested += totalAmount;
      account.lastUpdated = Date.now();

      // 저장
      global.__trades.set(trade.id, trade);
      global.__holdings.set(holdingId, holding);
      global.__virtualAccounts.set(accountId, account);

      // 계좌 가치 업데이트
      await this.updateAccountValue(accountId);

      console.log('[VirtualTrading] 구매 완료:', { symbol, quantity, price: currentPrice, totalCost });

      return { success: true, trade };
    } catch (error: any) {
      console.error('[VirtualTrading] 구매 실패:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 주식/코인 판매
   */
  async sell(
    accountId: string,
    symbol: string,
    type: 'stock' | 'crypto',
    quantity: number
  ): Promise<{ success: boolean; trade?: Trade; error?: string }> {
    try {
      const account = global.__virtualAccounts.get(accountId);
      if (!account) {
        return { success: false, error: '계좌를 찾을 수 없습니다.' };
      }

      const holdingId = `${accountId}-${symbol}-${type}`;
      const holding = global.__holdings.get(holdingId);

      if (!holding) {
        return { success: false, error: '보유 종목을 찾을 수 없습니다.' };
      }

      if (holding.quantity < quantity) {
        return { success: false, error: `보유 수량이 부족합니다. 보유: ${holding.quantity}, 요청: ${quantity}` };
      }

      // 현재가 가져오기
      const { investmentAPI } = await import('./investment-api');
      const stockData = type === 'stock'
        ? await investmentAPI.getStockData(symbol)
        : null;
      const cryptoData = type === 'crypto'
        ? await investmentAPI.getCryptoData(symbol)
        : null;
      const currentData = stockData || cryptoData;

      if (!currentData) {
        return { success: false, error: '종목 데이터를 가져올 수 없습니다.' };
      }

      const currentPrice = stockData
        ? stockData.price
        : (cryptoData ? cryptoData.currentPrice : 0);

      const totalAmount = currentPrice * quantity;
      const fee = totalAmount * this.TRADING_FEE;
      const netAmount = totalAmount - fee;

      // 수익/손실 계산
      const averageCost = holding.averagePrice * quantity;
      const profit = totalAmount - averageCost - fee;
      const profitPercent = averageCost > 0 ? (profit / averageCost) * 100 : 0;

      // 거래 생성
      const trade: Trade = {
        id: `trade-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        accountId,
        symbol,
        name: holding.name,
        type,
        action: 'sell',
        quantity,
        price: currentPrice,
        totalAmount,
        fee,
        timestamp: Date.now(),
        profit,
        profitPercent,
      };

      // 보유 종목 업데이트
      holding.quantity -= quantity;
      if (holding.quantity === 0) {
        // 전량 매도 시 보유 종목 삭제
        global.__holdings.delete(holdingId);
      } else {
        // 부분 매도 시 업데이트
        holding.totalCost = holding.averagePrice * holding.quantity;
        holding.currentPrice = currentPrice;
        holding.currentValue = holding.quantity * currentPrice;
        holding.profit = holding.currentValue - holding.totalCost;
        holding.profitPercent = holding.totalCost > 0
          ? (holding.profit / holding.totalCost) * 100
          : 0;
        holding.lastUpdated = Date.now();
        global.__holdings.set(holdingId, holding);
      }

      // 계좌 업데이트
      account.currentBalance += netAmount;
      account.lastUpdated = Date.now();

      // 저장
      global.__trades.set(trade.id, trade);
      global.__virtualAccounts.set(accountId, account);

      // 계좌 가치 업데이트
      await this.updateAccountValue(accountId);

      console.log('[VirtualTrading] 판매 완료:', { symbol, quantity, price: currentPrice, profit });

      return { success: true, trade };
    } catch (error: any) {
      console.error('[VirtualTrading] 판매 실패:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 포트폴리오 가져오기
   */
  async getPortfolio(accountId: string): Promise<Portfolio | null> {
    const account = global.__virtualAccounts.get(accountId);
    if (!account) return null;

    // 계좌 가치 업데이트
    await this.updateAccountValue(accountId);
    const updatedAccount = global.__virtualAccounts.get(accountId)!;

    // 보유 종목 가져오기
    const holdings = Array.from(global.__holdings.values())
      .filter(h => h.accountId === accountId)
      .sort((a, b) => b.currentValue - a.currentValue);

    // 거래 내역 가져오기
    const trades = Array.from(global.__trades.values())
      .filter(t => t.accountId === accountId)
      .sort((a, b) => b.timestamp - a.timestamp);

    // 통계 계산
    const sellTrades = trades.filter(t => t.action === 'sell' && t.profit !== undefined);
    const winningTrades = sellTrades.filter(t => (t.profit || 0) > 0);
    const losingTrades = sellTrades.filter(t => (t.profit || 0) < 0);
    const winRate = sellTrades.length > 0 ? (winningTrades.length / sellTrades.length) * 100 : 0;
    const averageProfit = sellTrades.length > 0
      ? sellTrades.reduce((sum, t) => sum + (t.profit || 0), 0) / sellTrades.length
      : 0;

    const bestTrade = sellTrades.length > 0
      ? sellTrades.reduce((best, t) => (t.profit || 0) > (best.profit || 0) ? t : best, sellTrades[0])
      : null;

    const worstTrade = sellTrades.length > 0
      ? sellTrades.reduce((worst, t) => (t.profit || 0) < (worst.profit || 0) ? t : worst, sellTrades[0])
      : null;

    return {
      account: updatedAccount,
      holdings,
      trades,
      statistics: {
        totalTrades: trades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate,
        averageProfit,
        bestTrade,
        worstTrade,
      },
    };
  }

  /**
   * 거래 내역 가져오기
   */
  getTrades(accountId: string, limit: number = 50): Trade[] {
    return Array.from(global.__trades.values())
      .filter(t => t.accountId === accountId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * 계좌 초기화 (테스트용)
   */
  resetAccount(accountId: string, initialBalance: number = 100000): VirtualAccount {
    // 보유 종목 삭제
    const holdings = Array.from(global.__holdings.values())
      .filter(h => h.accountId === accountId);
    holdings.forEach(h => global.__holdings.delete(h.id));

    // 거래 내역 삭제
    const trades = Array.from(global.__trades.values())
      .filter(t => t.accountId === accountId);
    trades.forEach(t => global.__trades.delete(t.id));

    // 계좌 재생성
    const account = this.getOrCreateAccount(accountId.replace('account-', ''), initialBalance);
    return account;
  }
}

export const virtualTrading = new VirtualTrading();

