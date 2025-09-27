// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title HBARBetting
 * @dev Smart contract for betting on HBAR/USD price movements
 * @notice This contract handles bet placement, price updates, and automatic settlement
 */
contract HBARBetting {
    // Struct to represent a bet
    struct Bet {
        address player;        // Address of the bettor
        uint256 amount;        // Amount of HBAR bet
        bool direction;        // true for UP, false for DOWN
        uint256 startPrice;    // Price when bet was placed
        uint256 endPrice;      // Price when round ended
        uint256 timestamp;     // When bet was placed
        uint256 roundId;       // Round identifier
        bool settled;          // Whether bet has been settled
        bool won;              // Whether bet won
    }

    // Mapping to store bets by ID
    mapping(uint256 => Bet) public bets;
    
    // Mapping to store round prices
    mapping(uint256 => uint256) public roundPrices;
    
    // Contract state variables
    uint256 public betCounter;        // Counter for bet IDs
    uint256 public currentRound;      // Current round number
    uint256 public roundDuration = 60; // Round duration in seconds
    uint256 public minBetAmount = 0.01 ether; // Minimum bet amount
    uint256 public maxBetAmount = 100 ether;  // Maximum bet amount
    
    // Contract owner
    address public owner;
    
    // Events
    event BetPlaced(
        uint256 indexed betId, 
        address indexed player, 
        uint256 amount, 
        bool direction, 
        uint256 roundId
    );
    
    event RoundSettled(
        uint256 indexed roundId, 
        uint256 endPrice
    );
    
    event BetSettled(
        uint256 indexed betId, 
        bool won, 
        uint256 payout
    );
    
    event PriceUpdated(
        uint256 indexed roundId, 
        uint256 price
    );

    // Modifiers
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

    /**
     * @dev Place a bet on price direction
     * @param direction true for UP, false for DOWN
     */
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

    /**
     * @dev Update the current price for the active round
     * @param price The current HBAR/USD price
     */
    function updatePrice(uint256 price) external onlyOwner {
        require(price > 0, "Price must be greater than 0");
        roundPrices[currentRound] = price;
        emit PriceUpdated(currentRound, price);
    }

    /**
     * @dev Settle the current round with the final price
     * @param endPrice The final price for the round
     */
    function settleRound(uint256 endPrice) external onlyOwner {
        require(endPrice > 0, "End price must be greater than 0");
        roundPrices[currentRound] = endPrice;
        emit RoundSettled(currentRound, endPrice);
        currentRound++;
    }

    /**
     * @dev Settle a specific bet
     * @param betId The ID of the bet to settle
     */
    function settleBet(uint256 betId) external {
        require(betId > 0 && betId <= betCounter, "Invalid bet ID");
        
        Bet storage bet = bets[betId];
        require(!bet.settled, "Bet already settled");
        require(bet.endPrice > 0, "Round not settled yet");
        
        bet.settled = true;
        
        // Determine if bet won
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

    /**
     * @dev Settle all bets for a specific round
     * @param roundId The round ID to settle
     */
    function settleAllBetsForRound(uint256 roundId) external onlyOwner {
        require(roundPrices[roundId] > 0, "Round not settled yet");
        
        for (uint256 i = 1; i <= betCounter; i++) {
            Bet storage bet = bets[i];
            if (bet.roundId == roundId && !bet.settled) {
                bet.endPrice = roundPrices[roundId];
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
                    emit BetSettled(i, true, payout);
                } else {
                    emit BetSettled(i, false, 0);
                }
            }
        }
    }

    /**
     * @dev Get bet information
     * @param betId The bet ID
     * @return Bet struct
     */
    function getBet(uint256 betId) external view returns (Bet memory) {
        require(betId > 0 && betId <= betCounter, "Invalid bet ID");
        return bets[betId];
    }

    /**
     * @dev Get current round number
     * @return Current round number
     */
    function getCurrentRound() external view returns (uint256) {
        return currentRound;
    }

    /**
     * @dev Get round price
     * @param roundId The round ID
     * @return Round price
     */
    function getRoundPrice(uint256 roundId) external view returns (uint256) {
        return roundPrices[roundId];
    }

    /**
     * @dev Get total number of bets placed
     * @return Total bet count
     */
    function getTotalBets() external view returns (uint256) {
        return betCounter;
    }

    /**
     * @dev Get contract balance
     * @return Contract balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Set minimum bet amount (only owner)
     * @param amount New minimum bet amount
     */
    function setMinBetAmount(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        minBetAmount = amount;
    }

    /**
     * @dev Set maximum bet amount (only owner)
     * @param amount New maximum bet amount
     */
    function setMaxBetAmount(uint256 amount) external onlyOwner {
        require(amount > minBetAmount, "Max amount must be greater than min amount");
        maxBetAmount = amount;
    }

    /**
     * @dev Emergency withdrawal (only owner)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner).transfer(amount);
    }

    /**
     * @dev Fallback function to receive HBAR
     */
    receive() external payable {}
}
