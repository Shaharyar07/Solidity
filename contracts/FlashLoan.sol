// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IReceiver {
    function receiveTokens(address tokenAddress, uint256 amount) external;
}

contract FlashLoan is ReentrancyGuard {
    using SafeMath for uint256;

    Token public token;
    uint256 public poolBalance;

    constructor(address _tokenAddress) {
        token = Token(_tokenAddress);
    }

    function depositTokens(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        token.transferFrom(msg.sender, address(this), _amount);
        poolBalance += _amount;
    }

    function flashLoan(uint256 _borrowedMoney) external nonReentrant {
        require(_borrowedMoney > 0, "Amount must be greater than 0");

        uint256 balanceBefore = token.balanceOf(address(this));
        require(balanceBefore >= _borrowedMoney, "Not enough tokens");

        assert(poolBalance == balanceBefore);
        // send tokens to receiver
        token.transfer(msg.sender, _borrowedMoney);
        // get paid back
        IReceiver(msg.sender).receiveTokens(address(token), _borrowedMoney);

        uint256 balanceAfter = token.balanceOf(address(this));
        require(
            balanceAfter >= balanceBefore,
            "Flash loan has not been paid back"
        );
    }
}
