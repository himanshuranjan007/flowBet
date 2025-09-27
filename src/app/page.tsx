'use client';

import React, { useState, useEffect } from 'react';
import { WalletConnection } from '@/components/WalletConnection';
import { PriceChart } from '@/components/PriceChart';
import { BettingInterface } from '@/components/BettingInterface';
import { BettingHistory } from '@/components/BettingHistory';
import { useBetting } from '@/hooks/useBetting';
import { useHashConnect } from '@/hooks/useHashConnect';
import { pythService } from '@/services/pythService';

export default function Home() {
  const {
    currentPrice,
    currentRound,
    userBets,
    bettingStats,
    isLoading,
    error,
    placeBet,
  } = useBetting();

  const { walletInfo, isConnected } = useHashConnect();

  const [chartData, setChartData] = useState<any[]>([]);

  // Load chart data
  useEffect(() => {
    const loadChartData = async () => {
      try {
        const data = await pythService.getPriceHistory('HBAR/USD', '1m');
        setChartData(data);
      } catch (err) {
        console.error('Failed to load chart data:', err);
      }
    };

    loadChartData();
  }, []);

  // Update chart data with current price
  useEffect(() => {
    if (currentPrice) {
      setChartData(prev => {
        const newData = [...prev, currentPrice];
        // Keep only last 60 data points
        return newData.slice(-60);
      });
    }
  }, [currentPrice]);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">HBet</h1>
              <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                HBAR/USD Betting
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentPrice && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Current Price</p>
                  <p className="text-lg font-bold text-green-400">
                    ${currentPrice.price.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Chart */}
          <div className="lg:col-span-2">
            <PriceChart 
              data={chartData} 
              currentPrice={currentPrice}
              height={400}
            />
          </div>

          {/* Right Column - Wallet & Betting */}
          <div className="space-y-6">
            <WalletConnection />

            {isConnected && walletInfo && (
              <BettingInterface
                currentRound={currentRound}
                walletInfo={walletInfo}
                onPlaceBet={placeBet}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>

        {/* Betting History */}
        {isConnected && walletInfo && (
          <div className="mt-8">
            <BettingHistory
              bets={userBets}
              stats={bettingStats}
            />
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Connect Wallet</h3>
              <p className="text-gray-400">
                Connect your Hedera wallet to start betting on HBAR price movements
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Place Your Bet</h3>
              <p className="text-gray-400">
                Choose UP or DOWN and bet on whether HBAR price will increase or decrease in 60 seconds
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Win or Lose</h3>
              <p className="text-gray-400">
                Bets are automatically settled on-chain. Win 2x your bet amount if you're correct!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>Powered by Hedera Hashgraph & Pyth Network</p>
            <p className="text-sm mt-2">
              Real-time HBAR/USD price data provided by Pyth Hermes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
