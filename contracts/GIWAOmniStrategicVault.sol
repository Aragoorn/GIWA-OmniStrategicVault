// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title GIWAOmniStrategicVault
 * @notice Enterprise-grade UUPS upgradeable vault for the GIWA ecosystem
 * @dev Supports AI trading bot execution, time-locked vesting and secure payments
 */
contract GIWAOmniStrategicVault is 
    Initializable, 
    UUPSUpgradeable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable 
{
    address public tradingBot;

    struct Vesting {
        uint256 amount;
        uint256 releaseTime;
    }

    mapping(address => Vesting) public userVestings;

    event PaymentProcessed(address indexed to, uint256 amount);
    event TradeExecuted(address indexed target, uint256 amount);
    event TradingBotUpdated(address indexed previousBot, address indexed newBot);
    event VestingSet(address indexed beneficiary, uint256 amount, uint256 releaseTime);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
    }

    /**
     * @notice Owner can send ETH to any recipient
     */
    function processPayment(address payable recipient, uint256 amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");
        require(address(this).balance >= amount, "Insufficient balance");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Payment failed");
        
        emit PaymentProcessed(recipient, amount);
    }

    /**
     * @notice Set the authorized AI / trading bot address
     */
    function setTradingBot(address _bot) external onlyOwner {
        require(_bot != address(0), "Invalid bot address");
        address previous = tradingBot;
        tradingBot = _bot;
        emit TradingBotUpdated(previous, _bot);
    }

    /**
     * @notice Authorized trading bot can execute arbitrary calls (AI strategies)
     */
    function executeTrade(address target, bytes calldata data, uint256 value) 
        external 
        payable 
        nonReentrant 
    {
        require(msg.sender == tradingBot, "Only AI Bot authorized");
        require(target != address(0), "Invalid target");

        (bool success, ) = target.call{value: value}(data);
        require(success, "Trade execution failed");
        
        emit TradeExecuted(target, value);
    }

    /**
     * @notice Owner sets a simple time-locked vesting for a beneficiary
     */
    function setVesting(address beneficiary, uint256 amount, uint256 delay) 
        external 
        onlyOwner 
    {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be > 0");
        
        uint256 releaseTime = block.timestamp + delay;
        userVestings[beneficiary] = Vesting(amount, releaseTime);
        
        emit VestingSet(beneficiary, amount, releaseTime);
    }

    /**
     * @notice Beneficiary claims vested amount after releaseTime
     */
    function claimVesting() external nonReentrant {
        Vesting memory v = userVestings[msg.sender];
        require(v.amount > 0, "No vesting found");
        require(block.timestamp >= v.releaseTime, "Not released yet");
        require(address(this).balance >= v.amount, "Insufficient vault balance");

        delete userVestings[msg.sender];

        (bool success, ) = payable(msg.sender).call{value: v.amount}("");
        require(success, "Transfer failed");
    }

    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyOwner 
    {}

    receive() external payable {}
}
