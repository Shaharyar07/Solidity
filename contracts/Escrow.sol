// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
interface IERC721{
    function transferFrom(address _from, address _to, uint256 _tokenId) external;
}

contract Escrow{
    address public nftAddress;
    uint256 public nftID;
    uint256 public purchasePrice;
    uint256 public escrowAmount;
    address  payable public seller;
    address payable public buyer;
    address public inspector;
    address public lender;

    receive() external payable{}

     modifier onlyBuyer(){
         require(msg.sender == buyer,'Only the buyer can execute this function');
            _;
    }
     modifier onlyInspector(){
         require(msg.sender == inspector,'Only the inspector can execute this function');
            _;
    }
    bool public inspectionPassed = false;
    mapping(address => bool) public approval;
    constructor(address _nftAddress, uint256 _nftID, uint256 _purchasePrice, uint256 _escrowAmount, address payable _seller, address payable _buyer, address _inspector, address _lender){
        nftAddress = _nftAddress;
        nftID = _nftID;
        seller = _seller;
        buyer = _buyer;
        inspector = _inspector;
        lender = _lender;
        purchasePrice = _purchasePrice;
        escrowAmount = _escrowAmount;

    }
   

    function depositEarnest() public payable onlyBuyer{
        require(msg.value >= escrowAmount);
       

    }
    function getBalance() public view returns (uint256){
        return address(this).balance;
    }
    function approveSale() public {
        approval[msg.sender] = true;
    }
    function finalizeSale() public{
        require(inspectionPassed,'Inspection has not been passed before finalizing the sale');
        require(approval[buyer],'Buyer has not approved the sale');
        require(approval[seller],'Seller has not approved the sale');
        require(approval[lender],'Lender has not approved the sale');
        require(address(this).balance >= purchasePrice,'Not enough balance to purchase');

        (bool success,) = payable(seller).call{value:address(this).balance}("");
        require(success,'Seller failed to receive the funds');


        IERC721(nftAddress).transferFrom(seller,buyer, nftID);

    }
    function updateInspectionStatus(bool _passed) public{
        inspectionPassed = _passed;
    }
    
}