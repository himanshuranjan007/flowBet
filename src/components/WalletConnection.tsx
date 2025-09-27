'use client';

import React, { useState } from 'react';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';

interface WalletConnectionProps {
  walletInfo: any;
  onConnect: (accountId: string, privateKey: string) => void;
  onDisconnect: () => void;
  isLoading: boolean;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({
  walletInfo,
  onConnect,
  onDisconnect,
  isLoading,
}) => {
  const [accountId, setAccountId] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = () => {
    if (accountId && privateKey) {
      onConnect(accountId, privateKey);
      setAccountId('');
      setPrivateKey('');
      setShowConnectForm(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAccountId = (id: string) => {
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  if (walletInfo?.isConnected) {
    return (
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Connected</p>
              <p className="text-gray-400 text-sm">
                {formatAccountId(walletInfo.accountId)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white font-bold">
                {walletInfo.balance.toFixed(2)} HBAR
              </p>
              <p className="text-gray-400 text-sm">Balance</p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(walletInfo.accountId)}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                title="Copy Account ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              <button
                onClick={onDisconnect}
                className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                title="Disconnect"
              >
                <LogOut className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      {!showConnectForm ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-gray-400 mb-6">
            Connect your Hedera wallet to start betting on HBAR price movements
          </p>
          <button
            onClick={() => setShowConnectForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Enter Wallet Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Account ID
              </label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="0.0.123456"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Private Key
              </label>
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter your private key"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleConnect}
              disabled={!accountId || !privateKey || isLoading}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                accountId && privateKey && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
            
            <button
              onClick={() => setShowConnectForm(false)}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ This is for demonstration purposes. In production, use proper wallet integration like HashPack.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
