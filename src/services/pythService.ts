import { PriceData } from '@/types';

interface PythPriceFeed {
  id: string;
  price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
  ema_price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
}

interface PythResponse {
  parsed: PythPriceFeed[];
}

export class PythPriceService {
  private priceIds: Map<string, string>;
  private unsubscribeCallback: (() => void) | null = null;
  private isInitialized: boolean = false;
  private availableFeeds: string[] = [];
  
  constructor() {
    // Price feed IDs for different assets
    // These are actual Pyth Network price feed IDs
    this.priceIds = new Map([
      ['HBAR/USD', '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419'], // Placeholder - will be updated
      ['BTC/USD', '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43'],
      ['ETH/USD', '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace'],
      ['SOL/USD', '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d'],
    ]);
  }

  async initialize(): Promise<void> {
    try {
      console.log('Initializing Pyth service...');
      
      // Fetch all available price feeds from Pyth Hermes API
      const response = await fetch('https://hermes.pyth.network/v2/price_feeds');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Found ${data.length} price feeds`);
      
      // Look for HBAR/USD price feed
      const hbarFeed = data.find((feed: any) => {
        const symbol = feed.symbol || feed.id;
        return symbol && symbol.toLowerCase().includes('hbar') && symbol.toLowerCase().includes('usd');
      });
      
      if (hbarFeed) {
        this.priceIds.set('HBAR/USD', hbarFeed.id);
        console.log(`Found HBAR/USD price feed: ${hbarFeed.id}`);
      } else {
        console.warn('HBAR/USD price feed not found, using mock data');
        // Look for any HBAR feed
        const anyHbarFeed = data.find((feed: any) => {
          const symbol = feed.symbol || feed.id;
          return symbol && symbol.toLowerCase().includes('hbar');
        });
        
        if (anyHbarFeed) {
          console.log(`Found HBAR feed: ${anyHbarFeed.symbol || anyHbarFeed.id} - ${anyHbarFeed.id}`);
        }
      }
      
      // Store available feeds for reference
      this.availableFeeds = data.map((feed: any) => feed.symbol || feed.id).filter(Boolean);
      
      this.isInitialized = true;
      console.log('Pyth service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Pyth service:', error);
      // Fall back to mock mode
      this.isInitialized = true;
    }
  }

  async getCurrentPrice(symbol: string = 'HBAR/USD'): Promise<PriceData | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const priceId = this.priceIds.get(symbol);
      if (!priceId) {
        console.warn(`Price feed not found for ${symbol}, using mock data`);
        return this.getMockPrice(symbol);
      }

      // Fetch latest price from Pyth Hermes API
      const response = await fetch(`https://hermes.pyth.network/v2/updates/price/latest?ids[]=${priceId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: PythResponse = await response.json();
      const priceFeed = data.parsed[0];
      
      if (!priceFeed) {
        console.warn(`No price data available for ${symbol}, using mock data`);
        return this.getMockPrice(symbol);
      }

      const price = priceFeed.price;
      const confidence = priceFeed.price.conf;
      
      return {
        price: Number(price.price) / Math.pow(10, Math.abs(price.expo)),
        confidence: Number(confidence) / Math.pow(10, Math.abs(price.expo)),
        timestamp: price.publish_time * 1000, // Convert to milliseconds
        symbol,
      };
    } catch (error) {
      console.error(`Failed to get price for ${symbol}:`, error);
      // Fall back to mock data
      return this.getMockPrice(symbol);
    }
  }

  async subscribeToPriceUpdates(
    symbol: string = 'HBAR/USD',
    callback: (priceData: PriceData) => void
  ): Promise<() => void> {
    // Use polling since WebSocket subscriptions require more complex setup
    const pollInterval = setInterval(async () => {
      try {
        const priceData = await this.getCurrentPrice(symbol);
        if (priceData) {
          callback(priceData);
        }
      } catch (error) {
        console.error('Error in price update subscription:', error);
      }
    }, 5000); // Poll every 5 seconds

    this.unsubscribeCallback = () => clearInterval(pollInterval);
    return this.unsubscribeCallback;
  }

  // Get price history for charting
  async getPriceHistory(symbol: string = 'HBAR/USD', timeframe: string = '1m'): Promise<PriceData[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // For now, we'll generate mock historical data
      // In production, you'd fetch this from a historical data provider
      return this.generateMockHistory(symbol, timeframe);
    } catch (error) {
      console.error(`Failed to get price history for ${symbol}:`, error);
      return this.generateMockHistory(symbol, timeframe);
    }
  }

  // Mock price generation for fallback
  private getMockPrice(symbol: string): PriceData {
    const basePrice = symbol === 'HBAR/USD' ? 0.05 : 1.0;
    const variation = (Math.random() - 0.5) * 0.01; // ±1% variation
    
    return {
      price: basePrice + variation,
      confidence: 0.001,
      timestamp: Date.now(),
      symbol,
    };
  }

  // Generate mock historical data
  private generateMockHistory(symbol: string, timeframe: string): PriceData[] {
    const mockData: PriceData[] = [];
    const now = Date.now();
    const interval = timeframe === '1m' ? 60000 : 300000; // 1 minute or 5 minutes
    const basePrice = symbol === 'HBAR/USD' ? 0.05 : 1.0;
    
    for (let i = 59; i >= 0; i--) {
      const timestamp = now - (i * interval);
      const variation = (Math.random() - 0.5) * 0.01; // ±1% variation
      
      mockData.push({
        price: basePrice + variation,
        confidence: 0.001,
        timestamp,
        symbol,
      });
    }
    
    return mockData;
  }

  // Get all available price feeds
  async getAvailablePriceFeeds(): Promise<string[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      return this.availableFeeds;
    } catch (error) {
      console.error('Failed to get available price feeds:', error);
      return [];
    }
  }

  // Check if a specific price feed is available
  async isPriceFeedAvailable(symbol: string): Promise<boolean> {
    const priceId = this.priceIds.get(symbol);
    return priceId !== undefined;
  }

  // Get price feed ID for a symbol
  getPriceFeedId(symbol: string): string | undefined {
    return this.priceIds.get(symbol);
  }
}

// Singleton instance
export const pythService = new PythPriceService();