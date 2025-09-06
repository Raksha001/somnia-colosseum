// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Somnia Colosseum Duel Contract
 * @dev Manages peer-to-peer trading duels with automatic resolution
 */
contract Duel is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct DuelInfo {
        uint256 id;
        address creator;
        address opponent;
        address tokenAddress;
        uint256 wagerAmount;
        uint256 duration;
        uint256 startTime;
        uint256 endTime;
        bool resolved;
        address winner;
        DuelStatus status;
    }

    enum DuelStatus {
        OPEN,       // Waiting for opponent
        ACTIVE,     // Both players joined, duel in progress
        RESOLVED,   // Duel completed and winner determined
        CANCELLED   // Duel cancelled
    }

    // Events
    event DuelCreated(
        uint256 indexed duelId,
        address indexed creator,
        address tokenAddress,
        uint256 wagerAmount,
        uint256 duration
    );

    event DuelJoined(
        uint256 indexed duelId,
        address indexed opponent,
        uint256 startTime,
        uint256 endTime
    );

    event DuelResolved(
        uint256 indexed duelId,
        address indexed winner,
        uint256 totalPayout
    );

    event DuelCancelled(uint256 indexed duelId, address indexed creator);

    // State variables
    mapping(uint256 => DuelInfo) public duels;
    mapping(address => bool) public authorizedResolvers;
    uint256 public nextDuelId = 1;
    uint256 public constant MIN_DURATION = 3 minutes;
    uint256 public constant MAX_DURATION = 7 days;
    uint256 public platformFeeRate = 250; // 2.5% in basis points
    address public feeRecipient;

    modifier onlyAuthorizedResolver() {
        require(authorizedResolvers[msg.sender] || msg.sender == owner(), "Not authorized resolver");
        _;
    }

    modifier validDuel(uint256 duelId) {
        require(duelId > 0 && duelId < nextDuelId, "Invalid duel ID");
        _;
    }

    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
        authorizedResolvers[msg.sender] = true;
    }

    /**
     * @dev Create a new duel
     */
    function createDuel(
        address tokenAddress,
        uint256 wagerAmount,
        uint256 duration
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(tokenAddress != address(0), "Invalid token address");
        require(wagerAmount > 0, "Wager amount must be positive");
        require(duration >= MIN_DURATION && duration <= MAX_DURATION, "Invalid duration");

        IERC20 token = IERC20(tokenAddress);


        require(token.balanceOf(msg.sender) >= wagerAmount, "Insufficient token balance");

        uint256 duelId = nextDuelId++;

        duels[duelId] = DuelInfo({
            id: duelId,
            creator: msg.sender,
            opponent: address(0),
            tokenAddress: tokenAddress,
            wagerAmount: wagerAmount,
            duration: duration,
            startTime: 0,
            endTime: 0,
            resolved: false,
            winner: address(0),
            status: DuelStatus.OPEN
        });

        // Transfer creator's wager to contract
        token.safeTransferFrom(msg.sender, address(this), wagerAmount);

        emit DuelCreated(duelId, msg.sender, tokenAddress, wagerAmount, duration);
        return duelId;
    }

    /**
     * @dev Join an existing duel
     */
    function joinDuel(uint256 duelId) external whenNotPaused nonReentrant validDuel(duelId) {
        DuelInfo storage duel = duels[duelId];
        
        require(duel.status == DuelStatus.OPEN, "Duel not open");
        require(duel.creator != msg.sender, "Cannot join own duel");
        require(duel.opponent == address(0), "Duel already has opponent");

        IERC20 token = IERC20(duel.tokenAddress);
        require(token.balanceOf(msg.sender) >= duel.wagerAmount, "Insufficient token balance");

        // Transfer opponent's wager to contract
        token.safeTransferFrom(msg.sender, address(this), duel.wagerAmount);

        // Update duel info
        duel.opponent = msg.sender;
        duel.startTime = block.timestamp;
        duel.endTime = block.timestamp + duel.duration;
        duel.status = DuelStatus.ACTIVE;

        emit DuelJoined(duelId, msg.sender, duel.startTime, duel.endTime);
    }

    /**
     * @dev Resolve a completed duel (callable by authorized resolver)
     */
    function resolveDuel(uint256 duelId, address winner) 
        external 
        onlyAuthorizedResolver 
        validDuel(duelId) 
        nonReentrant 
    {
        DuelInfo storage duel = duels[duelId];
        
        require(duel.status == DuelStatus.ACTIVE, "Duel not active");
        require(!duel.resolved, "Duel already resolved");
        require(block.timestamp >= duel.endTime, "Duel not yet expired");
        require(winner == duel.creator || winner == duel.opponent, "Invalid winner");

        duel.resolved = true;
        duel.winner = winner;
        duel.status = DuelStatus.RESOLVED;

        uint256 totalStake = duel.wagerAmount * 2;
        uint256 platformFee = (totalStake * platformFeeRate) / 10000;
        uint256 winnerPayout = totalStake - platformFee;

        IERC20 token = IERC20(duel.tokenAddress);
        
        // Transfer winnings to winner
        if (winnerPayout > 0) {
            token.safeTransfer(winner, winnerPayout);
        }
        
        // Transfer platform fee
        if (platformFee > 0) {
            token.safeTransfer(feeRecipient, platformFee);
        }

        emit DuelResolved(duelId, winner, winnerPayout);
    }

    /**
     * @dev Cancel an open duel (only creator can cancel)
     */
    function cancelDuel(uint256 duelId) external validDuel(duelId) nonReentrant {
        DuelInfo storage duel = duels[duelId];
        
        require(duel.creator == msg.sender, "Only creator can cancel");
        require(duel.status == DuelStatus.OPEN, "Can only cancel open duels");

        duel.status = DuelStatus.CANCELLED;

        // Refund creator's wager
        IERC20 token = IERC20(duel.tokenAddress);
        token.safeTransfer(duel.creator, duel.wagerAmount);

        emit DuelCancelled(duelId, duel.creator);
    }

    /**
     * @dev Get duel information
     */
    function getDuel(uint256 duelId) external view validDuel(duelId) returns (DuelInfo memory) {
        return duels[duelId];
    }

    /**
     * @dev Check if duel is expired
     */
    function isDuelExpired(uint256 duelId) external view validDuel(duelId) returns (bool) {
        DuelInfo memory duel = duels[duelId];
        return duel.status == DuelStatus.ACTIVE && block.timestamp >= duel.endTime;
    }

    // Admin functions
    function addAuthorizedResolver(address resolver) external onlyOwner {
        authorizedResolvers[resolver] = true;
    }

    function removeAuthorizedResolver(address resolver) external onlyOwner {
        authorizedResolvers[resolver] = false;
    }

    function setPlatformFeeRate(uint256 newRate) external onlyOwner {
        require(newRate <= 1000, "Fee rate too high"); // Max 10%
        platformFeeRate = newRate;
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdrawal function
     */
    function emergencyWithdraw(address tokenAddress, uint256 amount) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(owner(), amount);
    }
}