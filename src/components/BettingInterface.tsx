'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';
import { BetDirection, RoundData, WalletInfo } from '@/types';

interface BettingInterfaceProps {
  currentRound: RoundData | null;
  walletInfo: WalletInfo | null;
  onPlaceBet: (direction: BetDirection, amount: number) => void;
  isLoading: boolean;
}

export const BettingInterface: React.FC<BettingInterfaceProps> = ({
  currentRound,
  walletInfo,
  onPlaceBet,
  isLoading,
}) => {
  const [betAmount, setBetAmount] = useState<number>(0.1);
  const [selectedDirection, setSelectedDirection] = useState<BetDirection | null>(null);

  const handlePlaceBet = () => {
    if (!selectedDirection || betAmount <= 0 || !walletInfo || betAmount > walletInfo.balance) {
      return;
    }
    onPlaceBet(selectedDirection, betAmount);
  };

  const getTimeRemaining = () => {
    if (!currentRound) return 0;
    const now = Date.now();
    const remaining = Math.max(0, currentRound.endTime - now);
    return Math.ceil(remaining / 1000);
  };

  const timeRemaining = getTimeRemaining();
  const canPlaceBet = walletInfo?.isConnected && timeRemaining > 0 && selectedDirection && betAmount > 0;

  return (
    <div className="w-full bg-gray-900 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Place Your Bet</h3>
        <div className="flex items-center space-x-2 text-gray-400">
          <Clock className="w-4 h-4" />
          <span className="text-lg font-mono">
            {timeRemaining}s
          </span>
        </div>
      </div>

      {/* Current Round Info */}
      {currentRound && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Round #{currentRound.id.slice(-6)}</p>
              <p className="text-lg font-bold text-white">
                Start Price: ${currentRound.startPrice.toFixed(4)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Status</p>
              <p className={`text-lg font-bold ${
                currentRound.status === 'active' ? 'text-green-400' : 'text-gray-400'
              }`}>
                {currentRound.status === 'active' ? 'Active' : 'Settled'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Direction Selection */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-3">Choose Direction</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedDirection('up')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedDirection === 'up'
                ? 'border-green-500 bg-green-500/20 text-green-400'
                : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-green-500'
            }`}
          >
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <p className="font-bold">UP</p>
            <p className="text-sm">Price will increase</p>
          </button>
          
          <button
            onClick={() => setSelectedDirection('down')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedDirection === 'down'
                ? 'border-red-500 bg-red-500/20 text-red-400'
                : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-red-500'
            }`}
          >
            <TrendingDown className="w-6 h-6 mx-auto mb-2" />
            <p className="font-bold">DOWN</p>
            <p className="text-sm">Price will decrease</p>
          </button>
        </div>
      </div>

      {/* Bet Amount */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-3">Bet Amount (HBAR)</p>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
            min="0.01"
            max={walletInfo?.balance || 0}
            step="0.01"
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            placeholder="0.00"
          />
        </div>
        {walletInfo && (
          <p className="text-sm text-gray-400 mt-2">
            Balance: {walletInfo.balance.toFixed(2)} HBAR
          </p>
        )}
      </div>

      {/* Quick Amount Buttons */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-3">Quick Amounts</p>
        <div className="grid grid-cols-4 gap-2">
          {[0.1, 0.5, 1, 5].map((amount) => (
            <button
              key={amount}
              onClick={() => setBetAmount(amount)}
              className="p-2 bg-gray-800 border border-gray-600 rounded text-white hover:border-blue-500 transition-colors"
            >
              {amount} HBAR
            </button>
          ))}
        </div>
      </div>

      {/* Place Bet Button */}
      <button
        onClick={handlePlaceBet}
        disabled={!canPlaceBet || isLoading}
        className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
          canPlaceBet && !isLoading
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isLoading ? 'Placing Bet...' : 'Place Bet'}
      </button>

      {/* Bet Info */}
      {selectedDirection && betAmount > 0 && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Potential Payout</p>
              <p className="text-lg font-bold text-green-400">
                {betAmount * 2} HBAR
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Profit</p>
              <p className="text-lg font-bold text-green-400">
                +{betAmount} HBAR
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
