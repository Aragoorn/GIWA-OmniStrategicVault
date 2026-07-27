// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract GIWAOmniStrategicVault is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    address public tradingBot;
    struct Vesting { uint256 amount; uint256 releaseTime; }
    mapping(address => Vesting) public userVestings;

    event PaymentProcessed(address indexed to, uint256 amount);
    event TradeExecuted(address target, uint256 amount);

    function initialize() public initializer {
        __Ownable_init(msg.sender);
    
    }

    function processPayment(address payable recipient, uint256 amount) external onlyOwner {
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Payment failed");
        emit PaymentProcessed(recipient, amount);
    }

    function setTradingBot(address _bot) external onlyOwner {
        tradingBot = _bot;
    }

    function executeTrade(address target, bytes calldata data, uint256 value) external payable {
        require(msg.sender == tradingBot, "Only AI Bot authorized");
        (bool success, ) = target.call{value: value}(data);
        require(success, "Trade execution failed");
        emit TradeExecuted(target, value);
    }

    function setVesting(address beneficiary, uint256 amount, uint256 delay) external onlyOwner {
        userVestings[beneficiary] = Vesting(amount, block.timestamp + delay);
    }

    function claimVesting() external {
        Vesting memory v = userVestings[msg.sender];
        require(block.timestamp >= v.releaseTime, "Not released yet");
        delete userVestings[msg.sender];
        // جایگزین خط ۴۶
     (bool success, ) = payable(msg.sender).call{value: v.amount}("");
      require(success, "Transfer failed");
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    receive() external payable {}
}