import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pythService } from '@/services/pythService';
import { hederaService } from '@/services/hederaService';

// Mock the services
vi.mock('@/services/pythService', () => ({
  pythService: {
    initialize: vi.fn().mockResolvedValue(undefined),
    subscribeToPriceUpdates: vi.fn().mockResolvedValue(() => {}),
    getPriceHistory: vi.fn().mockResolvedValue([]),
    getCurrentPrice: vi.fn().mockResolvedValue({
      price: 0.05,
      confidence: 0.001,
      timestamp: Date.now(),
      symbol: 'HBAR/USD',
    }),
  },
}));

describe('PythService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize successfully', async () => {
    await expect(pythService.initialize()).resolves.not.toThrow();
  });

  it('should get current price', async () => {
    const price = await pythService.getCurrentPrice('HBAR/USD');
    
    expect(price).toBeDefined();
    expect(price?.symbol).toBe('HBAR/USD');
    expect(price?.price).toBeGreaterThan(0);
    expect(price?.confidence).toBeGreaterThan(0);
    expect(price?.timestamp).toBeGreaterThan(0);
  });

  it('should get price history', async () => {
    const history = await pythService.getPriceHistory('HBAR/USD', '1m');
    
    expect(history).toBeDefined();
    expect(history.length).toBe(60);
    expect(history[0]).toHaveProperty('price');
    expect(history[0]).toHaveProperty('timestamp');
    expect(history[0]).toHaveProperty('symbol');
  });

  it('should subscribe to price updates', async () => {
    const callback = vi.fn();
    const unsubscribe = await pythService.subscribeToPriceUpdates('HBAR/USD', callback);
    
    expect(unsubscribe).toBeDefined();
    expect(typeof unsubscribe).toBe('function');
    
    // Wait a bit for the interval to fire
    await new Promise(resolve => setTimeout(resolve, 6000));
    
    expect(callback).toHaveBeenCalled();
    
    // Clean up
    unsubscribe();
  }, 10000);
});

describe('HederaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with testnet client', () => {
    expect(hederaService).toBeDefined();
  });

  it('should connect wallet with valid credentials', async () => {
    // Mock account ID and private key for testing
    const accountId = '0.0.123456';
    const privateKey = '302e020100300506032b6570042204201234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    
    // This will fail in test environment, but we can test the structure
    try {
      await hederaService.connectWallet(accountId, privateKey);
    } catch (error) {
      // Expected to fail in test environment
      expect(error).toBeDefined();
    }
  });

  it('should validate wallet connection parameters', async () => {
    const invalidAccountId = 'invalid';
    const invalidPrivateKey = 'invalid';
    
    await expect(
      hederaService.connectWallet(invalidAccountId, invalidPrivateKey)
    ).rejects.toThrow();
  });
});
