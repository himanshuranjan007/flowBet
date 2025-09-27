import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBetting } from '@/hooks/useBetting';

// Mock the services
vi.mock('@/services/pythService', () => ({
  pythService: {
    initialize: vi.fn().mockResolvedValue(undefined),
    subscribeToPriceUpdates: vi.fn().mockResolvedValue(() => {}),
    getPriceHistory: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/services/hederaService', () => ({
  hederaService: {
    connectWallet: vi.fn(),
    disconnect: vi.fn(),
  },
}));

describe('useBetting Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', async () => {
    const { result } = renderHook(() => useBetting());
    
    // Wait for initial effects to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.currentPrice).toBeNull();
    expect(result.current.currentRound).toBeNull();
    expect(result.current.walletInfo).toBeNull();
    expect(result.current.userBets).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should have betting stats initialized', () => {
    const { result } = renderHook(() => useBetting());
    
    expect(result.current.bettingStats).toEqual({
      totalBets: 0,
      wonBets: 0,
      lostBets: 0,
      totalWagered: 0,
      totalWon: 0,
      winRate: 0,
    });
  });

  it('should provide connectWallet function', () => {
    const { result } = renderHook(() => useBetting());
    
    expect(typeof result.current.connectWallet).toBe('function');
  });

  it('should provide placeBet function', () => {
    const { result } = renderHook(() => useBetting());
    
    expect(typeof result.current.placeBet).toBe('function');
  });

  it('should provide disconnectWallet function', () => {
    const { result } = renderHook(() => useBetting());
    
    expect(typeof result.current.disconnectWallet).toBe('function');
  });
});
