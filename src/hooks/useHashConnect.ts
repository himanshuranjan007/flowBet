'use client';

import { useState, useEffect, useCallback } from 'react';
import { hashConnectService, WalletInfo } from '@/services/hashConnectService';

export const useHashConnect = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExtensionAvailable, setIsExtensionAvailable] = useState(false);

  // Initialize HashConnect on mount
  useEffect(() => {
    const initializeHashConnect = async () => {
      try {
        await hashConnectService.initialize();
        
        // Check if extension is available
        const available = await hashConnectService.checkExtensionAvailable();
        setIsExtensionAvailable(available);
        
        // Set up wallet listener
        hashConnectService.addWalletListener((info) => {
          setWalletInfo(info);
        });
        
        // Check if already connected
        const currentWalletInfo = hashConnectService.getWalletInfo();
        if (currentWalletInfo) {
          setWalletInfo(currentWalletInfo);
        }
      } catch (err) {
        console.error('Failed to initialize HashConnect:', err);
        setError('Failed to initialize wallet connection');
      }
    };

    initializeHashConnect();

    // Cleanup on unmount
    return () => {
      hashConnectService.removeWalletListener(setWalletInfo);
    };
  }, []);

  const connectWallet = useCallback(async () => {
    if (!isExtensionAvailable) {
      setError('HashPack wallet extension not found. Please install HashPack wallet.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const wallet = await hashConnectService.connectWallet();
      setWalletInfo(wallet);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  }, [isExtensionAvailable]);

  const disconnectWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await hashConnectService.disconnectWallet();
      setWalletInfo(null);
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
      setError('Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendTransaction = useCallback(async (transaction: any) => {
    if (!walletInfo?.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await hashConnectService.sendTransaction(transaction);
      return response;
    } catch (err) {
      console.error('Failed to send transaction:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [walletInfo]);

  const refreshBalance = useCallback(async () => {
    if (!walletInfo?.accountId) return;

    try {
      const balance = await hashConnectService.getAccountBalance(walletInfo.accountId);
      setWalletInfo(prev => prev ? { ...prev, balance } : null);
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  }, [walletInfo?.accountId]);

  return {
    walletInfo,
    isLoading,
    error,
    isExtensionAvailable,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    refreshBalance,
    isConnected: walletInfo?.isConnected || false,
  };
};
