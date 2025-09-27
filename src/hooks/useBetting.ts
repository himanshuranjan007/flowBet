'use client';

import { useState, useEffect, useCallback } from 'react';
import { BetData, RoundData, PriceData, BettingStats } from '@/types';
import { pythService } from '@/services/pythService';

export const useBetting = () => {
  const [currentPrice, setCurrentPrice] = useState<PriceData | null>(null);
  const [currentRound, setCurrentRound] = useState<RoundData | null>(null);
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

  const placeBet = useCallback(async (direction: 'up' | 'down', amount: number) => {
    if (!currentRound || !currentPrice) {
      setError('No active round or price data');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create bet data (in production, this would be sent to smart contract)
      const bet: BetData = {
        id: Date.now().toString(),
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

      setError(null);
    } catch (err) {
      setError('Failed to place bet');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentRound, currentPrice]);

  const settleRound = useCallback(async (endTime: number) => {
    if (!currentRound || !currentPrice) return;

    try {
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

  return {
    currentPrice,
    currentRound,
    userBets,
    bettingStats,
    isLoading,
    error,
    placeBet,
  };
};
