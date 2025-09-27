'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PriceData } from '@/types';

interface PriceChartProps {
  data: PriceData[];
  currentPrice?: PriceData | null;
  height?: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({ 
  data, 
  currentPrice, 
  height = 300 
}) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(4)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{formatTime(label)}</p>
          <p className="text-green-400">
            Price: {formatPrice(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-gray-900 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">HBAR/USD Price Chart</h3>
        {currentPrice && (
          <div className="text-right">
            <p className="text-2xl font-bold text-green-400">
              {formatPrice(currentPrice.price)}
            </p>
            <p className="text-sm text-gray-400">
              Confidence: ±{formatPrice(currentPrice.confidence)}
            </p>
          </div>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatTime}
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            tickFormatter={formatPrice}
            stroke="#9CA3AF"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#10B981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
