import {
  Client,
  AccountId,
  PrivateKey,
  ContractCreateFlow,
  ContractCallQuery,
  ContractExecuteTransaction,
  Hbar,
  ContractId,
  TransactionResponse,
  AccountBalanceQuery,
} from '@hashgraph/sdk';

export interface WalletInfo {
  accountId: string;
  balance: number;
  isConnected: boolean;
}

export interface BetData {
  id: string;
  amount: number;
  direction: 'up' | 'down';
  startPrice: number;
  endPrice?: number;
  timestamp: number;
  roundId: string;
  status: 'pending' | 'won' | 'lost' | 'settled';
}

export class HederaService {
  private client: Client | null = null;
  private walletAccountId: AccountId | null = null;
  private walletPrivateKey: PrivateKey | null = null;
  private contractId: ContractId | null = null;

  constructor() {
    // Initialize client for testnet
    this.client = Client.forTestnet();
  }

  async connectWallet(accountId: string, privateKey: string): Promise<WalletInfo> {
    try {
      this.walletAccountId = AccountId.fromString(accountId);
      this.walletPrivateKey = PrivateKey.fromString(privateKey);
      
      this.client!.setOperator(this.walletAccountId, this.walletPrivateKey);
      
      // Get account balance
      const balanceQuery = new AccountBalanceQuery()
        .setAccountId(this.walletAccountId);
      
      const balance = await balanceQuery.execute(this.client!);
      const hbarBalance = balance.hbars.toBigNumber().toNumber() / 100000000; // Convert tinybars to HBAR
      
      return {
        accountId,
        balance: hbarBalance,
        isConnected: true,
      };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async deployBettingContract(): Promise<string> {
    if (!this.client || !this.walletAccountId || !this.walletPrivateKey) {
      throw new Error('Wallet not connected');
    }

    try {
      // Solidity contract bytecode for betting contract
      const contractBytecode = `
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;
        
        contract HBARBetting {
            struct Bet {
                address player;
                uint256 amount;
                bool direction; // true for up, false for down
                uint256 startPrice;
                uint256 endPrice;
                uint256 timestamp;
                uint256 roundId;
                bool settled;
                bool won;
            }
            
            mapping(uint256 => Bet) public bets;
            mapping(uint256 => uint256) public roundPrices;
            uint256 public betCounter;
            uint256 public currentRound;
            uint256 public roundDuration = 60; // 60 seconds
            
            event BetPlaced(uint256 indexed betId, address indexed player, uint256 amount, bool direction, uint256 roundId);
            event RoundSettled(uint256 indexed roundId, uint256 endPrice);
            event BetSettled(uint256 indexed betId, bool won, uint256 payout);
            
            function placeBet(bool direction) external payable {
                require(msg.value > 0, "Bet amount must be greater than 0");
                
                betCounter++;
                bets[betCounter] = Bet({
                    player: msg.sender,
                    amount: msg.value,
                    direction: direction,
                    startPrice: roundPrices[currentRound],
                    endPrice: 0,
                    timestamp: block.timestamp,
                    roundId: currentRound,
                    settled: false,
                    won: false
                });
                
                emit BetPlaced(betCounter, msg.sender, msg.value, direction, currentRound);
            }
            
            function updatePrice(uint256 price) external {
                roundPrices[currentRound] = price;
            }
            
            function settleRound(uint256 endPrice) external {
                roundPrices[currentRound] = endPrice;
                emit RoundSettled(currentRound, endPrice);
                currentRound++;
            }
            
            function settleBet(uint256 betId) external {
                Bet storage bet = bets[betId];
                require(!bet.settled, "Bet already settled");
                
                bet.endPrice = roundPrices[bet.roundId];
                bet.settled = true;
                
                bool won = false;
                if (bet.direction && bet.endPrice > bet.startPrice) {
                    won = true;
                } else if (!bet.direction && bet.endPrice < bet.startPrice) {
                    won = true;
                }
                
                bet.won = won;
                
                if (won) {
                    uint256 payout = bet.amount * 2; // Double the bet amount
                    payable(bet.player).transfer(payout);
                    emit BetSettled(betId, true, payout);
                } else {
                    emit BetSettled(betId, false, 0);
                }
            }
            
            function getBet(uint256 betId) external view returns (Bet memory) {
                return bets[betId];
            }
            
            function getCurrentRound() external view returns (uint256) {
                return currentRound;
            }
            
            function getRoundPrice(uint256 roundId) external view returns (uint256) {
                return roundPrices[roundId];
            }
        }
      `;

      const contractCreateFlow = new ContractCreateFlow()
        .setBytecode(contractBytecode)
        .setGas(1000000)
        .setInitialBalance(new Hbar(0));

      const contractCreateResponse = await contractCreateFlow.execute(this.client);
      const contractId = contractCreateResponse.getReceipt(this.client).contractId;
      
      this.contractId = contractId;
      return contractId!.toString();
    } catch (error) {
      console.error('Failed to deploy contract:', error);
      throw error;
    }
  }

  async placeBet(direction: 'up' | 'down', amount: number): Promise<TransactionResponse> {
    if (!this.client || !this.contractId) {
      throw new Error('Contract not deployed or wallet not connected');
    }

    try {
      const contractExecuteTransaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(100000)
        .setPayableAmount(new Hbar(amount))
        .setFunction('placeBet', direction === 'up');

      const response = await contractExecuteTransaction.execute(this.client);
      return response;
    } catch (error) {
      console.error('Failed to place bet:', error);
      throw error;
    }
  }

  async updatePrice(price: number): Promise<TransactionResponse> {
    if (!this.client || !this.contractId) {
      throw new Error('Contract not deployed or wallet not connected');
    }

    try {
      const contractExecuteTransaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction('updatePrice', price);

      const response = await contractExecuteTransaction.execute(this.client);
      return response;
    } catch (error) {
      console.error('Failed to update price:', error);
      throw error;
    }
  }

  async settleRound(endPrice: number): Promise<TransactionResponse> {
    if (!this.client || !this.contractId) {
      throw new Error('Contract not deployed or wallet not connected');
    }

    try {
      const contractExecuteTransaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction('settleRound', endPrice);

      const response = await contractExecuteTransaction.execute(this.client);
      return response;
    } catch (error) {
      console.error('Failed to settle round:', error);
      throw error;
    }
  }

  async getBet(betId: number): Promise<BetData | null> {
    if (!this.client || !this.contractId) {
      throw new Error('Contract not deployed or wallet not connected');
    }

    try {
      const contractCallQuery = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction('getBet', betId);

      const response = await contractCallQuery.execute(this.client);
      const result = response.getUint256(0);
      
      // Parse the result and return BetData
      // This is a simplified implementation
      return {
        id: betId.toString(),
        amount: 0, // Parse from result
        direction: 'up', // Parse from result
        startPrice: 0, // Parse from result
        timestamp: Date.now(),
        roundId: '0',
        status: 'pending',
      };
    } catch (error) {
      console.error('Failed to get bet:', error);
      return null;
    }
  }

  async getCurrentRound(): Promise<number> {
    if (!this.client || !this.contractId) {
      throw new Error('Contract not deployed or wallet not connected');
    }

    try {
      const contractCallQuery = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction('getCurrentRound');

      const response = await contractCallQuery.execute(this.client);
      return response.getUint256(0).toNumber();
    } catch (error) {
      console.error('Failed to get current round:', error);
      return 0;
    }
  }

  disconnect(): void {
    this.client = null;
    this.walletAccountId = null;
    this.walletPrivateKey = null;
    this.contractId = null;
  }
}

// Singleton instance
export const hederaService = new HederaService();
