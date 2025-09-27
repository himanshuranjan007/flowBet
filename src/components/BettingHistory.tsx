'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react';
import { BetData, BettingStats } from '@/types';

interface BettingHistoryProps {
  bets: BetData[];
  stats: BettingStats;
}

export const BettingHistory: React.FC<BettingHistoryProps> = ({ bets, stats }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(4)}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'lost':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'text-green-400';
      case 'lost':
        return 'text-red-400';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="w-full bg-gray-900 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">Betting History & Stats</h3>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Bets</p>
          <p className="text-2xl font-bold text-white">{stats.totalBets}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Win Rate</p>
          <p className="text-2xl font-bold text-green-400">{stats.winRate.toFixed(1)}%</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Wagered</p>
          <p className="text-2xl font-bold text-white">{stats.totalWagered.toFixed(2)} HBAR</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Won</p>
          <p className="text-2xl font-bold text-green-400">{stats.totalWon.toFixed(2)} HBAR</p>
        </div>
      </div>

      {/* Recent Bets */}
      <div>
        <h4 className="text-lg font-bold text-white mb-4">Recent Bets</h4>
        
        {bets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No bets placed yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bets.slice(0, 10).map((bet) => (
              <div key={bet.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {bet.direction === 'up' ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                    
                    <div>
                      <p className="text-white font-medium">
                        {bet.direction.toUpperCase()} - {bet.amount} HBAR
                      </p>
                      <p className="text-gray-400 text-sm">
                        Round #{bet.roundId.slice(-6)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(bet.status)}
                      <span className={`font-medium ${getStatusColor(bet.status)}`}>
                        {bet.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      <p>Start: {formatPrice(bet.startPrice)}</p>
                      {bet.endPrice && (
                        <p>End: {formatPrice(bet.endPrice)}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{formatTime(bet.timestamp)}</span>
                    {bet.status === 'won' && (
                      <span className="text-green-400 font-medium">
                        +{bet.amount} HBAR profit
                      </span>
                    )}
                    {bet.status === 'lost' && (
                      <span className="text-red-400 font-medium">
                        -{bet.amount} HBAR loss
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
