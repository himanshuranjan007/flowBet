import {
  Client,
  AccountId,
  PrivateKey,
  ContractCreateFlow,
  ContractCallQuery,
  ContractExecuteTransaction,
  Hbar,
  ContractId,
  FileCreateTransaction,
  FileAppendTransaction,
  ContractBytecodeQuery,
} from '@hashgraph/sdk';

export class ContractDeployer {
  private client: Client;
  private contractId: ContractId | null = null;

  constructor(accountId: string, privateKey: string) {
    this.client = Client.forTestnet();
    this.client.setOperator(AccountId.fromString(accountId), PrivateKey.fromString(privateKey));
  }

  async deployContract(): Promise<string> {
    try {
      // Solidity contract bytecode (compiled from HBARBetting.sol)
      // This is a simplified version - in production, you'd compile the Solidity contract
      const contractBytecode = `
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;
        
        contract HBARBetting {
            struct Bet {
                address player;
                uint256 amount;
                bool direction;
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
            uint256 public roundDuration = 60;
            uint256 public minBetAmount = 0.01 ether;
            uint256 public maxBetAmount = 100 ether;
            address public owner;
            
            event BetPlaced(uint256 indexed betId, address indexed player, uint256 amount, bool direction, uint256 roundId);
            event RoundSettled(uint256 indexed roundId, uint256 endPrice);
            event BetSettled(uint256 indexed betId, bool won, uint256 payout);
            event PriceUpdated(uint256 indexed roundId, uint256 price);
            
            modifier onlyOwner() {
                require(msg.sender == owner, "Only owner can call this function");
                _;
            }
            
            modifier validBetAmount(uint256 amount) {
                require(amount >= minBetAmount, "Bet amount too small");
                require(amount <= maxBetAmount, "Bet amount too large");
                _;
            }
            
            constructor() {
                owner = msg.sender;
                betCounter = 0;
                currentRound = 1;
            }
            
            function placeBet(bool direction) external payable validBetAmount(msg.value) {
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
            
            function updatePrice(uint256 price) external onlyOwner {
                require(price > 0, "Price must be greater than 0");
                roundPrices[currentRound] = price;
                emit PriceUpdated(currentRound, price);
            }
            
            function settleRound(uint256 endPrice) external onlyOwner {
                require(endPrice > 0, "End price must be greater than 0");
                roundPrices[currentRound] = endPrice;
                emit RoundSettled(currentRound, endPrice);
                currentRound++;
            }
            
            function settleBet(uint256 betId) external {
                require(betId > 0 && betId <= betCounter, "Invalid bet ID");
                
                Bet storage bet = bets[betId];
                require(!bet.settled, "Bet already settled");
                require(bet.endPrice > 0, "Round not settled yet");
                
                bet.settled = true;
                
                bool won = false;
                if (bet.direction && bet.endPrice > bet.startPrice) {
                    won = true;
                } else if (!bet.direction && bet.endPrice < bet.startPrice) {
                    won = true;
                }
                
                bet.won = won;
                
                if (won) {
                    uint256 payout = bet.amount * 2;
                    payable(bet.player).transfer(payout);
                    emit BetSettled(betId, true, payout);
                } else {
                    emit BetSettled(betId, false, 0);
                }
            }
            
            function getBet(uint256 betId) external view returns (Bet memory) {
                require(betId > 0 && betId <= betCounter, "Invalid bet ID");
                return bets[betId];
            }
            
            function getCurrentRound() external view returns (uint256) {
                return currentRound;
            }
            
            function getRoundPrice(uint256 roundId) external view returns (uint256) {
                return roundPrices[roundId];
            }
            
            function getTotalBets() external view returns (uint256) {
                return betCounter;
            }
            
            function getContractBalance() external view returns (uint256) {
                return address(this).balance;
            }
            
            function setMinBetAmount(uint256 amount) external onlyOwner {
                require(amount > 0, "Amount must be greater than 0");
                minBetAmount = amount;
            }
            
            function setMaxBetAmount(uint256 amount) external onlyOwner {
                require(amount > minBetAmount, "Max amount must be greater than min amount");
                maxBetAmount = amount;
            }
            
            function emergencyWithdraw(uint256 amount) external onlyOwner {
                require(amount <= address(this).balance, "Insufficient balance");
                payable(owner).transfer(amount);
            }
            
            receive() external payable {}
        }
      `;

      const contractCreateFlow = new ContractCreateFlow()
        .setBytecode(contractBytecode)
        .setGas(1000000)
        .setInitialBalance(new Hbar(0));

      const contractCreateResponse = await contractCreateFlow.execute(this.client);
      const contractId = contractCreateResponse.getReceipt(this.client).contractId;
      
      this.contractId = contractId;
      console.log('Contract deployed successfully:', contractId.toString());
      
      return contractId.toString();
    } catch (error) {
      console.error('Failed to deploy contract:', error);
      throw error;
    }
  }

  async getContractId(): Promise<ContractId | null> {
    return this.contractId;
  }

  async testContract(): Promise<void> {
    if (!this.contractId) {
      throw new Error('Contract not deployed');
    }

    try {
      // Test getting current round
      const currentRoundQuery = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction('getCurrentRound');

      const currentRoundResponse = await currentRoundQuery.execute(this.client);
      const currentRound = currentRoundResponse.getUint256(0).toNumber();
      
      console.log('Current round:', currentRound);

      // Test getting total bets
      const totalBetsQuery = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction('getTotalBets');

      const totalBetsResponse = await totalBetsQuery.execute(this.client);
      const totalBets = totalBetsResponse.getUint256(0).toNumber();
      
      console.log('Total bets:', totalBets);

    } catch (error) {
      console.error('Failed to test contract:', error);
      throw error;
    }
  }
}

export default ContractDeployer;
