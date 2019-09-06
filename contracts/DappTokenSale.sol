pragma solidity ^0.4.2;

import "./DappToken.sol";//토큰이를 상속

contract DappTokenSale {
    address admin;
    DappToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;
    uint256 public mul = 250000;

    //web3 연결!!!
    event Sell(address _buyer, uint256 _amount);

    function DappTokenSale(DappToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function buyTokens(uint256 price) public payable {
        // require(msg.value == multiply(_numberOfTokens, tokenPrice));
        // require(tokenContract.balanceOf(this) >= multiply(price, mul));
        // require(tokenContract.transfer(msg.sender, multiply(price, mul)));

        // tokensSold += multiply(price, mul);
        tokensSold += price;

        Sell(msg.sender, price);
    }

    function endSale() public {
        require(msg.sender == admin);
        // sender란 함수를 부르는 사람이고 여기서는, sender인 학생 사용자를 admin이라 정의함
        require(tokenContract.transfer(admin, tokenContract.balanceOf(this)));
        // 어드민에게, tokenContract의 잔액만큼 admin에게 보냄
        // tokenContract의 balanceOf(this)가 도대체 무얼 하는 걸까???

        // UPDATE: Let's not destroy the contract here
        // Just transfer the balance to the admin
        admin.transfer(address(this).balance);
    }
}
