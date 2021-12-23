---
emoji: 🧢
title: (취약점 시리즈 3) block.timestamp
date: '2021-12-23 18:31:00'
author: 한성원
tags: block.timestamp 취약점 SmartContract
categories: 취약점분석
---


# 👋 block.timestamp

## block.timestamp란?
block.timestamp는 msg.sender처럼 블록체인에서 제공해주는 global 변수 중 하나이다. 이는 블록 생성 시간을 나타낸다. 
블록체인의 timestamp는 생성 시점에 데이터가 존재했다는 사실을 증명해주기 때문에 블록체인 자체에 매우 중요하다. 

- - - 

## 왜 취약점 시리즈에 들어갔을까?
바로 block.timestamp는 채굴자(miner)들에게 영향을 받을 수 있기 때문이다. 즉 block.timestamp를 통해 random을 생성하거나 block.timestamp와 관련해서 접근할 수 있는 함수가 있다면 smart contract에게 좋지 않은 영향을 끼칠 수 있다.

- - -

## Example code

```solidity
contract Roulette {
    uint public pastBlockTime;

    constructor() payable {}

    function spin() external payable {
        require(msg.value == 10 ether); // must send 10 ether to play
        require(block.timestamp != pastBlockTime); // only 1 transaction per block

        pastBlockTime = block.timestamp;

        if (block.timestamp % 15 == 0) {
            (bool sent, ) = msg.sender.call{value: address(this).balance}("");
            require(sent, "Failed to send Ether");
        }
    }
}
```
<span style="color:grey">출처: https://solidity-by-example.org/hacks/block-timestamp-manipulation/</span> 

위 코드를 실행시켜 볼 수는 있지만 실제 해킹 실습까지 해보는 것은 어려울 것이라고 생각한다. 우리가 miner가 될 수 없기 때문에ㅠㅠ

위 코드는 룰랫을 통해 ether를 얻을 수 있는 게임이다.
10 ether를 contract account에 보내고 만약 timestamp가 15의 배수라면 CA에 있는 모든 ether를 가져올 수 있다.

예를 들어, CA에 300 ether가 쌓여있다고 생각해보자! 2021/12/23 시세로 300 ehter는 14억이 넘는 돈이다. 만약 miner가 timestamp를 조작하는데 드는 비용이 14억보다 적게든다면 조작을 시도해볼만 하다.

- - -

## 어떻게하면 예방할 수 있을까?
block.timstamp는 블록생성 시간이 필요할 때만 사용하면 된다. random이나 block.timestamp가 들어가 조건에 의해서 ether가 또는 데이터가 보내져서는 안된다. 

block.timestamp와 마찬가지로 __now__, __block.hash__ 의 사용도 되도록 피하는 것이 좋다.

```toc

```