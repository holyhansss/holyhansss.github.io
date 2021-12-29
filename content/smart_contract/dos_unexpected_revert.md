---
emoji: 🧢
title: (취약점 시리즈 6) DOS Unexpected Revert
date: '2021-12-29 11:29:00'
author: 한성원
tags: DOS Unexpected Revert UnexpectedRevert 취약점 SmartContract
categories: 취약점분석
---


# 👋 Unexpected Revert

## Unexpected Revert란?
Unexpected Revert는 이름에서 알 수 있듯이, 트랜잭션을 고의적 revert시킴으로써 스마트 계약이 작동되지 않는 상태로 만드는 취약성입니다.

- - -

## Example code

```solidity
contract KingOfEther {
    address public king;
    uint public balance;

    function claimThrone() external payable {
        require(msg.value > balance, "Need to pay more to become the king");

        (bool sent, ) = king.call{value: balance}("");
        require(sent, "Failed to send Ether");

        balance = msg.value;
        king = msg.sender;
    }
}

contract Attack {
    KingOfEther kingOfEther;

    constructor(KingOfEther _kingOfEther) {
        kingOfEther = KingOfEther(_kingOfEther);
    }

    function attack() public payable {
        kingOfEther.claimThrone{value: msg.value}();
    }
}

```
<span style="color:grey">출처: https://solidity-by-example.org/hacks/denial-of-service/</span> 

시나리오는 이렇다.
1. KingOfEther of Ether Contract가 배포된다.
2. 처음으로 A가 1 Ether를 claimThrone()에 보냄으로써 King이 된다.
2. 다음으로 B가 2 Ether를 claimThrone()에 보냄으로써 B가 King으로 바뀐다. King이 바뀌기 전에 A에게 1 Ether를 refund 해준다.
3. C가 KingOfEther의 주소와 함께 Attack contract를 배포한다.
4. C는 Attack.attack을 3 Ether와 함꼐 호출한다. 
5. C는 C는 king이 되고 Attack contract는 ether를 받을 수 없기 때문에 다른 누구도 king이 될 수 없게 된다. 즉 KingOfEhter은 무의미한 contract가 된다.

EVM이 externally owned accounts와 contract accounts를 구분하지 않는다는 점을 악용한 것 같아보인다. 

- - -

## How to prevent?
#### __pull over push__
pull over push를 통해 문제를 해결 할 수 있다. pull over push는 contract를 분리함으로써 attacker의 공격을 attacker의 손실로만 처리 할 수 있다. 위의 코드를 pull over push로 바꾸어보았다.

```solidity
contract KingOfEther {
    address public king;
    uint public balance;
    mapping(address => uint) public balances;

    function claimThrone() external payable {
        require(msg.value > balance, "Need to pay more to become the king");

        balances[king] += balance;

        balance = msg.value;
        king = msg.sender;
    }

    function withdraw() public {
        require(msg.sender != king, "Current king cannot withdraw");

        uint amount = balances[msg.sender];
        balances[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }
}

이 코드는 Example 코드의 claimThrone() function이 2개의 function으로 나누어 진 것을 볼 수 있다. 위 코드의 claimThrone()는 king을 바꾸는 용도로만 사용된다. 그리고 king에서 쫒겨난 사람들은 withdraw 함수를 통해 ether를 다시 가져올 수 있다.

```
## 마무리
취약점들에 대해서 공부하면서 나는 EVM에 대해서 알아가야 할 부분이 많다는 생각이 든다. ~~잘안다고 생각했는데ㅋㅋ~~ 갈 길이 멀다!! 꾸준히 공부하자:)


```toc

```