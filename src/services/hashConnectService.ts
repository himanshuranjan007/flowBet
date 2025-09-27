import { HashConnect, HashConnectTypes } from 'hashconnect';

export interface WalletInfo {
  accountId: string;
  balance: number;
  isConnected: boolean;
  publicKey?: string;
}

export interface HashConnectState {
  accountIds: string[];
  topic: string;
  pairingString: string;
  pairingData?: HashConnectTypes.SavedPairingData;
}

export class HashConnectService {
  private hashConnect: HashConnect;
  private appMetadata: HashConnectTypes.AppMetadata;
  private isInitialized: boolean = false;
  private walletInfo: WalletInfo | null = null;
  private listeners: ((walletInfo: WalletInfo | null) => void)[] = [];

  constructor() {
    this.appMetadata = {
      name: 'HBet - HBAR/USD Betting',
      description: 'Real-time HBAR/USD betting platform on Hedera',
      icon: '/favicon.ico',
      url: typeof window !== 'undefined' ? window.location.origin : '',
    };

    this.hashConnect = new HashConnect();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.hashConnect.foundExtensionEvent.on((walletMetadata) => {
      console.log('Found HashPack wallet:', walletMetadata);
    });

    this.hashConnect.pairingEvent.on((pairingData) => {
      console.log('Wallet paired:', pairingData);
      this.handleWalletConnected(pairingData);
    });

    this.hashConnect.connectionStatusChangeEvent.on((connectionStatus) => {
      console.log('Connection status changed:', connectionStatus);
      if (!connectionStatus) {
        this.handleWalletDisconnected();
      }
    });

    this.hashConnect.transactionEvent.on((transactionResponse) => {
      console.log('Transaction response:', transactionResponse);
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing HashConnect...');
      
      const initData = await this.hashConnect.init(this.appMetadata, 'testnet', false);
      console.log('HashConnect initialized:', initData);
      
      this.isInitialized = true;
      
      // Check if there's a saved pairing
      const savedPairings = this.hashConnect.getPairings();
      if (savedPairings.length > 0) {
        console.log('Found saved pairing, attempting to reconnect...');
        await this.reconnectToWallet(savedPairings[0]);
      }
    } catch (error) {
      console.error('Failed to initialize HashConnect:', error);
      throw error;
    }
  }

  async connectWallet(): Promise<WalletInfo> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('Attempting to connect to HashPack wallet...');
      
      // Open the pairing modal
      this.hashConnect.openPairingModal();
      
      // Wait for pairing to complete
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout - please try again'));
        }, 60000); // 60 second timeout

        const onPairing = (pairingData: HashConnectTypes.SavedPairingData) => {
          clearTimeout(timeout);
          this.hashConnect.pairingEvent.off(onPairing);
          
          this.handleWalletConnected(pairingData);
          if (this.walletInfo) {
            resolve(this.walletInfo);
          } else {
            reject(new Error('Failed to get wallet information'));
          }
        };

        this.hashConnect.pairingEvent.on(onPairing);
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async reconnectToWallet(pairingData: HashConnectTypes.SavedPairingData): Promise<void> {
    try {
      console.log('Reconnecting to wallet...');
      
      const state = await this.hashConnect.connect(
        pairingData.topic,
        pairingData.metadata
      );
      
      console.log('Reconnected to wallet:', state);
      this.handleWalletConnected(pairingData);
    } catch (error) {
      console.error('Failed to reconnect to wallet:', error);
      // Clear invalid pairing
      this.hashConnect.clearConnectionsAndData();
    }
  }

  private async handleWalletConnected(pairingData: HashConnectTypes.SavedPairingData): Promise<void> {
    try {
      const state = this.hashConnect.getConnectionState();
      
      if (state && state.accountIds.length > 0) {
        const accountId = state.accountIds[0];
        
        // Get account balance
        const balance = await this.getAccountBalance(accountId);
        
        this.walletInfo = {
          accountId,
          balance,
          isConnected: true,
          publicKey: pairingData.metadata.publicKey,
        };

        console.log('Wallet connected:', this.walletInfo);
        this.notifyListeners(this.walletInfo);
      }
    } catch (error) {
      console.error('Error handling wallet connection:', error);
    }
  }

  private handleWalletDisconnected(): void {
    this.walletInfo = null;
    console.log('Wallet disconnected');
    this.notifyListeners(null);
  }

  async disconnectWallet(): Promise<void> {
    try {
      this.hashConnect.disconnect();
      this.hashConnect.clearConnectionsAndData();
      this.handleWalletDisconnected();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }

  async getAccountBalance(accountId: string): Promise<number> {
    try {
      // This would typically use Hedera SDK to get balance
      // For now, we'll return a mock balance
      // In production, you'd use: new AccountBalanceQuery().setAccountId(accountId).execute(client)
      return Math.random() * 1000; // Mock balance
    } catch (error) {
      console.error('Failed to get account balance:', error);
      return 0;
    }
  }

  async sendTransaction(transaction: any): Promise<any> {
    if (!this.walletInfo?.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const response = await this.hashConnect.sendTransaction(
        this.hashConnect.getConnectionState()?.topic || '',
        transaction
      );
      
      return response;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }

  getWalletInfo(): WalletInfo | null {
    return this.walletInfo;
  }

  isWalletConnected(): boolean {
    return this.walletInfo?.isConnected || false;
  }

  addWalletListener(listener: (walletInfo: WalletInfo | null) => void): void {
    this.listeners.push(listener);
  }

  removeWalletListener(listener: (walletInfo: WalletInfo | null) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(walletInfo: WalletInfo | null): void {
    this.listeners.forEach(listener => listener(walletInfo));
  }

  // Get the current connection state
  getConnectionState(): HashConnectState | null {
    const state = this.hashConnect.getConnectionState();
    if (!state) return null;

    return {
      accountIds: state.accountIds,
      topic: state.topic,
      pairingString: state.pairingString,
    };
  }

  // Check if HashPack extension is available
  async checkExtensionAvailable(): Promise<boolean> {
    try {
      await this.hashConnect.findLocalWallets();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
export const hashConnectService = new HashConnectService();
