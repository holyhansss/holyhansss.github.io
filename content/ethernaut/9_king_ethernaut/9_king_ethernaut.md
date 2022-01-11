---
emoji: 🧢
title: (Ethernaut 취약점 9) King
date: '2022-01-10 19:18:00'
author: 한성원
tags: ethernaut King vulnerability
categories: 취약점분석
---


# 👋 Force
__Difficulty 6/10__

- 승리 조건
- 코드 분석
- 풀이
순서로 진행 될 것이다.

- - -

## 승리 조건
- 게임을 break 하기
- 즉 내가 왕이되고 누구도 왕이 될 수 없게 만들기

- - -

## 코드 분석
분석은 주석에!

```solidity
contract King {
    // address of king
    address payable king;
    // 
    uint public prize;
    // contract의 owner
    address payable public owner;

    // contructor
    constructor() public payable {
        // set deployer as owner
        owner = msg.sender;  
        // set deployer as king
        king = msg.sender;
        // set prize as msg.value <- deployer's value
        prize = msg.value;
    }

    // receive function to get Ether
    receive() external payable {
        // msg.value가 현재 prize 보다 크거나, msg.sender가 owner이면 진행
        require(msg.value >= prize || msg.sender == owner);
        // king에게 msg.value를 보낸다.
        king.transfer(msg.value);
        // king을 msg.sender로 변경
        king = msg.sender;
        // prize를 msg.value로 변경
        prize = msg.value;
    }

    // 누가 king인지 볼 수 있는 함수
    function _king() public view returns (address payable) {
        return king;
    }
}
```
- - -

## 풀이
이 문제에서 우리의 목표는 이 게임을 break하는 것이다. 즉 누구도 게임을 할 수 없게 만들면 된다.

위 코드는 내가 전에 공부했던 King of Ether이라는 contract와 비슷하다. 그렇기 때문에 조금 쉽게 해결 할 수 있었다. unexpected revert가 무엇인지 궁금하다면 아래 post를 클릭해 먼저 보고오자!
- [DOS with Unexpected Revert](https://holyhansss.github.io/vulnerability/dos_with_unexpected_revert/dos_unexpected_revert/)

이 문제에서 중요하게 봐야할 점은 .transfer이다. 우리는 transfer을 사용해 Ether를 보낼 수 있다. 근데 만약 EOA가 아닌 CA에게 Ether를 보내는 것이라면 어떨까? 

CA는 receive함수를 설정하여 Ether를 받지 않고 revert 시킬 수 있다. 즉 만약 CA가 king이 되고 Ether를 받지 못하게 설정한다면 이제 누구도 게임을 진행 할 수 없게된다.

attack contract를 한번 보며 더 이해해보자!


- - -
## 기타 정보
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
- selfdestruct 취약점: https://holyhansss.github.io/vulnerability/selfdestruct/selfdestruct/

```toc

```