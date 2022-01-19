---
emoji: 🧢
title: (Ethernaut 취약점 13) Gatekeeper One - 2
date: '2022-01-19 10:36:00'
author: 한성원
tags: ethernaut GatekeeperOne vulnerability typeconversion
categories: 취약점분석
---


# 👋 Gatekeeper One
__Difficulty 5/10__

[GatekeeperOne - 1](https://holyhansss.github.io/ethernaut/13_gatekeeperOne_ethernaut/13_gatekepperOne_1_ethernaut/)에서 이어지는 글이다 !

- - -

## 코드 분석
GatekeeperOne contract에서스 3개의 gate가 존재한다. gate는 모두 modifier로 되어있다. 즉 3개의 modifier의 조건을 만족시키면 된다.   
분석은 주석에!

```solidity
contract GatekeeperOne {

    using SafeMath for uint256;
    address public entrant;

    // msg.sender과 tx.origin이 다르면 진행
    modifier gateOne() {
        require(msg.sender != tx.origin);
        _;
    }

    // gasleft()의 8191의 배수이면 진행
    modifier gateTwo() {
        require(gasleft().mod(8191) == 0);
        _;
    }

    // _gateKey가 type casting관련 3가지 조건에 만족하면 진행
    modifier gateThree(bytes8 _gateKey) { 
        require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)), "GatekeeperOne: invalid gateThree part one");
        require(uint32(uint64(_gateKey)) != uint64(_gateKey), "GatekeeperOne: invalid gateThree part two");
        require(uint32(uint64(_gateKey)) == uint16(tx.origin), "GatekeeperOne: invalid gateThree part three");
        _;
    }

    // modifier를 포함한 함수: 이 함수를 통해 내가 entrant가 될 수 있다.
    function enter(bytes8 _gateKey) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
        entrant = tx.origin;
        return true;
    }
}

```
- - -


## 풀이
우리가 풀어야할 문제는 gate3 밖에 남지 않았다! Gate3는 [Type Conversion](https://www.tutorialspoint.com/solidity/solidity_conversions.htm)를 잘 알아야 풀 수 있다.

3가지 조건에 만족해야하기 때문에 하나하나 확인해 보자!

```solidity
require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)), "GatekeeperOne: invalid gateThree part one");
require(uint32(uint64(_gateKey)) != uint64(_gateKey), "GatekeeperOne: invalid gateThree part two");
require(uint32(uint64(_gateKey)) == uint16(tx.origin), "GatekeeperOne: invalid gateThree part three");
_;
```
<br/>
우선 마지막 조건을 보면 type conversion한 tx.origin과 _gateKey가 같아야 하는 것을 볼 수 있다. gateKey는 각자의 EOA에서 파생된다.   
나의 EOA: 0x0d3D56806fe6eeDe410Ea9722da9a6f65FD24799

이제 첫번째 조건을 보자. 첫번째 조건은 다음과 같다.
```solidity
require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey))
``` 
<br/>
우선 8 bytes인 _gateKey를 uint64로 바꾸면 어떻게 될까??
나의 주소는 20 bytes로 구성되어있고 이를 8 bytes로 줄이게되면 뒤에 16자리만 남게된다.

- 0x2da9a6f65FD24799

<br/>
나는 편의성을 위해 bytes로만 계산 할 것이다.   

- uint32 = bytes4
- uint16 = bytes2

우선 bytes8 를 bytes2로 바꾸면 아래 4자리만 보존된다.
그리고 bytes8 를 bytes4로 바꾸면 아래 8자리만 보존된다.

bytes2와 bytes4가 같으려면 다음과 같이 bytes4에 0000이 붙어있으면 된다.   
- 0x1234 = 0x00001234
나의 account가 0x2da9a6f600004799와 같다면 첫번째 조건을 만족시킬 수 있다.

<br/>
두번째 조건은 아래와 같다.
```solidity
require(uint32(uint64(_gateKey)) != uint64(_gateKey))
``` 
첫번째 조건을 완벽하게 이해했다면 두번째 조건은 계산없이도 통과하는 것을 알 수 있다.
0x2da9a6f000024799를 bytes4로 바꾸게 되면 0x00004799로 아래 8자리만 보존된다. 
보존된 bytes4와 bytes8이 같으려면 bytes8은 다음과 같아야한다. 
- 0x0000000000004799

그렇다면 우리는 1번에서 구한 값 그대로 넣는다면 2번 조건은 해결된다!


<br/>
마지막 조건은 아래와 같다. 
```solidity
require(uint32(uint64(_gateKey)) == uint16(tx.origin))
```
위 계산처럼 한번 계산해보자!
uint32(uint64(_gateKey)는 bytes4가 되고 uint16은 bytes2가 된다. 위에서 말했듯이 tx.origin은 나의 account이다. 나의 account를 bytes2로 바꾸면 1번처럼 아래 4자리만 남게된다.  

- 0x4799
이와 bytes4가 같으려면 bytes4의 값은 0x00004799 이면된다. 
우리는 위에서 우리의 account를 적용해 풀었음으로 이미 푼 것과 다름 없다ㅎㅎ!

<br/>
나는 remix에 다음과 같은 코드를 작성하여 배포하고 위에서 찾은 _gateKey를 적용해 gatekeeperOne contract에 call을 보냈다.

```solidity
contract GetEntrant {
       
    GatekeeperOne gatekeeperOne;

    constructor(address _gatekeeperOne) public {
        gatekeeperOne = GatekeeperOne(_gatekeeperOne);
    }
    function enter(bytes8 _gateKey) public {
        gatekeeperOne.enter{gas: 40955+254}(_gateKey);
    }
  
}
```

이후 Submit instance를 누르고 조금 기다리면 block이 mine되고, 아래와 같이 뜨며 마무리된다.
```
٩(- ̮̮̃-̃)۶ Well done, You have completed this level!!!
```

- - -

## 마무리
지금까지 공부한 것 중 가장 어려웠으며 가장 공부를 많이 한 것 같다. 이 문제를 풀고나니 gatekeeper2가 기대된다ㅋㅋ
gatekeeperOne을 통해 좀 더 깊은 곧을 들여다볼 수 있었다. 평소에 잘 하지않는 debugging과 type conversion에 따른 data 보존 및 손실을 더 잘 다룰 수 있게 된 것 같다. 또한 gas fee가 opcode마다 얼마나 생성되는지도 눈으로 확인해보았기 때문에 EVM에 대한 이해력이 좀 더 상승한 것 같다! gatekeeperTwo도 화이팅 해보자 :)

- - -
## 기타 정보
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
- Storage & Casting: https://medium.com/coinmonks/solidity-variables-storage-type-conversions-and-accessing-private-variables-c59b4484c183


```