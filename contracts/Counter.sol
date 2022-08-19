// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Counter{
    string public name;
    uint public counter;
    constructor (string memory _name,uint _counter){
        name = _name;
        counter = _counter;

    }
    function increment()public returns(uint newCount){
        counter++;
        return counter;
    }
    function decrement()public returns(uint newCount){
        counter--;
        return counter;
    }
    function getCounter()public view returns(uint){
        return counter;
    }
    function getName() public view returns( string memory ){
        return name;
    }
    function setName(string memory _newName) public returns(string memory newName){
        name = _newName;
        return name;
    }
}