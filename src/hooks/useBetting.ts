'use client';

import { useState, useEffect, useCallback } from 'react';
import { BetData, RoundData, PriceData, WalletInfo, BettingStats } from '@/types';
import { pythService } from '@/services/pythService';
import { hederaService } from '@/services/hederaService';

export const useBetting = () => {
  const [currentPrice, setCurrentPrice] = useState<PriceData | null>(null);
  const [currentRound, setCurrentRound] = useState<RoundData | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [userBets, setUserBets] = useState<BetData[]>([]);
  const [bettingStats, setBettingStats] = useState<BettingStats>({
    totalBets: 0,
    wonBets: 0,
    lostBets: 0,
    totalWagered: 0,
    totalWon: 0,
    winRate: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Pyth service and start price updates
  useEffect(() => {
    const initializeServices = async () => {
      try {
        setIsLoading(true);
        await pythService.initialize();
        
        // Start price updates
        const unsubscribe = await pythService.subscribeToPriceUpdates('HBAR/USD', (priceData) => {
          setCurrentPrice(priceData);
        });
        
        return unsubscribe;
      } catch (err) {
        setError('Failed to initialize price service');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeServices();
  }, []);

  // Start new betting round every 60 seconds
  useEffect(() => {
    const startNewRound = () => {
      const roundId = Date.now().toString();
      const startTime = Date.now();
      const endTime = startTime + 60000; // 60 seconds

      const newRound: RoundData = {
        id: roundId,
        startTime,
        endTime,
        startPrice: currentPrice?.price || 0,
        status: 'active',
        bets: [],
      };

      setCurrentRound(newRound);

      // Set timeout to settle the round
      setTimeout(() => {
        settleRound(endTime);
      }, 60000);
    };

    if (currentPrice) {
      startNewRound();
    }

    const interval = setInterval(startNewRound, 60000);
    return () => clearInterval(interval);
  }, [currentPrice]);

  const connectWallet = useCallback(async (accountId: string, privateKey: string) => {
    try {
      setIsLoading(true);
      const wallet = await hederaService.connectWallet(accountId, privateKey);
      setWalletInfo(wallet);
      setError(null);
    } catch (err) {
      setError('Failed to connect wallet');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const placeBet = useCallback(async (direction: 'up' | 'down', amount: number) => {
    if (!walletInfo || !currentRound || !currentPrice) {
      setError('Wallet not connected or no active round');
      return;
    }

    try {
      setIsLoading(true);
      
      // Place bet on blockchain
      const response = await hederaService.placeBet(direction, amount);
      
      // Create bet data
      const bet: BetData = {
        id: response.transactionId.toString(),
        amount,
        direction,
        startPrice: currentPrice.price,
        timestamp: Date.now(),
        roundId: currentRound.id,
        status: 'pending',
      };

      // Update local state
      setUserBets(prev => [...prev, bet]);
      setCurrentRound(prev => prev ? {
        ...prev,
        bets: [...prev.bets, bet]
      } : null);

      // Update wallet balance
      setWalletInfo(prev => prev ? {
        ...prev,
        balance: prev.balance - amount
      } : null);

      setError(null);
    } catch (err) {
      setError('Failed to place bet');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [walletInfo, currentRound, currentPrice]);

  const settleRound = useCallback(async (endTime: number) => {
    if (!currentRound || !currentPrice) return;

    try {
      // Update price on blockchain
      await hederaService.updatePrice(currentPrice.price);
      
      // Settle the round
      await hederaService.settleRound(currentPrice.price);

      // Update round status
      setCurrentRound(prev => prev ? {
        ...prev,
        endPrice: currentPrice.price,
        status: 'settled'
      } : null);

      // Settle user bets
      const settledBets = userBets.map(bet => {
        if (bet.roundId === currentRound.id && bet.status === 'pending') {
          const won = bet.direction === 'up' 
            ? currentPrice.price > bet.startPrice 
            : currentPrice.price < bet.startPrice;
          
          const payout = won ? bet.amount * 2 : 0;
          
          // Update wallet balance if bet won
          if (won) {
            setWalletInfo(prev => prev ? {
              ...prev,
              balance: prev.balance + payout
            } : null);
          }

          return {
            ...bet,
            endPrice: currentPrice.price,
            status: won ? 'won' : 'lost'
          };
        }
        return bet;
      });

      setUserBets(settledBets);

      // Update betting stats
      updateBettingStats(settledBets);
    } catch (err) {
      setError('Failed to settle round');
      console.error(err);
    }
  }, [currentRound, currentPrice, userBets]);

  const updateBettingStats = useCallback((bets: BetData[]) => {
    const stats = bets.reduce((acc, bet) => {
      acc.totalBets++;
      acc.totalWagered += bet.amount;
      
      if (bet.status === 'won') {
        acc.wonBets++;
        acc.totalWon += bet.amount * 2;
      } else if (bet.status === 'lost') {
        acc.lostBets++;
      }
      
      return acc;
    }, {
      totalBets: 0,
      wonBets: 0,
      lostBets: 0,
      totalWagered: 0,
      totalWon: 0,
      winRate: 0,
    });

    stats.winRate = stats.totalBets > 0 ? (stats.wonBets / stats.totalBets) * 100 : 0;
    setBettingStats(stats);
  }, []);

  const disconnectWallet = useCallback(() => {
    hederaService.disconnect();
    setWalletInfo(null);
    setUserBets([]);
    setBettingStats({
      totalBets: 0,
      wonBets: 0,
      lostBets: 0,
      totalWagered: 0,
      totalWon: 0,
      winRate: 0,
    });
  }, []);

  return {
    currentPrice,
    currentRound,
    walletInfo,
    userBets,
    bettingStats,
    isLoading,
    error,
    connectWallet,
    placeBet,
    disconnectWallet,
  };
};
