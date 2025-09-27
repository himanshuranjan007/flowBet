'use client';

import React from 'react';
import { Wallet, LogOut, Copy, Check, Download } from 'lucide-react';
import { useHashConnect } from '@/hooks/useHashConnect';

export const WalletConnection: React.FC = () => {
  const {
    walletInfo,
    isLoading,
    error,
    isExtensionAvailable,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  } = useHashConnect();

  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAccountId = (id: string) => {
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
  };

  const handleRefreshBalance = async () => {
    await refreshBalance();
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
              <p className="text-white font-medium">HashPack Connected</p>
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
                onClick={handleRefreshBalance}
                disabled={isLoading}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Refresh Balance"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
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
                onClick={handleDisconnect}
                disabled={isLoading}
                className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                title="Disconnect"
              >
                <LogOut className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-3 p-2 bg-red-900/20 border border-red-600 rounded text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      {!isExtensionAvailable ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Install HashPack Wallet</h3>
          <p className="text-gray-400 mb-6">
            HashPack wallet extension is required to connect your Hedera account
          </p>
          <a
            href="https://hashpack.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Install HashPack</span>
          </a>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Connect HashPack Wallet</h3>
          <p className="text-gray-400 mb-6">
            Connect your HashPack wallet to start betting on HBAR price movements
          </p>
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connecting...' : 'Connect HashPack'}
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-600 rounded text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
            <p className="text-blue-400 text-sm">
              💡 Make sure you have HashPack wallet installed and unlocked
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
