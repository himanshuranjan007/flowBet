export interface PriceData {
  price: number;
  confidence: number;
  timestamp: number;
  symbol: string;
}

export interface BetData {
  id: string;
  amount: number;
  direction: 'up' | 'down';
  startPrice: number;
  endPrice?: number;
  timestamp: number;
  roundId: string;
  status: 'pending' | 'won' | 'lost' | 'settled';
}

export interface WalletInfo {
  accountId: string;
  balance: number;
  isConnected: boolean;
}

export interface RoundData {
  id: string;
  startTime: number;
  endTime: number;
  startPrice: number;
  endPrice?: number;
  status: 'active' | 'settled';
  bets: BetData[];
}

export interface BettingStats {
  totalBets: number;
  wonBets: number;
  lostBets: number;
  totalWagered: number;
  totalWon: number;
  winRate: number;
}

export type BetDirection = 'up' | 'down';

export interface ChartData {
  timestamp: number;
  price: number;
  volume?: number;
}

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}
