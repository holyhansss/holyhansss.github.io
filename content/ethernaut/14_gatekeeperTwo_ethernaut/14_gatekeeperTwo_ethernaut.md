---
emoji: 🧢
title: (Ethernaut 취약점 15) GatekeeperTwo
date: '2022-01-21 10:57:00'
author: 한성원
tags: ethernaut GatekeeperTwo vulnerability
categories: 취약점분석
---


# 👋 Privacy
__Difficulty 6/10__

- 승리 조건
- 코드 분석
- 풀이
순서로 진행 될 것이다.

- - -

## 승리 조건
- Gatekeeper을 지나 entrant로 등록하기
- GatekeeperOne과 같다.

- - -

## 코드 분석
분석은 주석에!
더 자세한 설명은 코드 뒤에 나온다.

```solidity
contract GatekeeperTwo {

    address public entrant;

    // GatekeeperOne와 똑같은 gateOne
    // tx.origin과 msg.sender가 다르게하라!
    modifier gateOne() {
        require(msg.sender != tx.origin);
        _;
    }

    // gateTwo
    modifier gateTwo() {
        uint x;
        // extcodessize(caller())를 x에 저장
        assembly { x := extcodesize(caller()) }
        // x가 0과 같으면 진행
        require(x == 0);
        _;
    }

    modifier gateThree(bytes8 _gateKey) {
        // A xor B == C 이게 하라! (^ = XOR)
        require(uint64(bytes8(keccak256(abi.encodePacked(msg.sender)))) ^ uint64(_gateKey) == uint64(0) - 1);
        _;
    }

    // modifier를 다 통과하면 tx.origin이 entrant가 될 수 있다!
    function enter(bytes8 _gateKey) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
        entrant = tx.origin;
        return true;
    }
}
```
- - -


## 풀이
이 문제에서 우리의 목표는 etrant 를 얻는 것이다.

시작하기 전 Ethernaut에서 주는 힌트를 보고가자

- 첫번째 gate는 gatekeeperOne과 같다. gatekeeperOne의 gateOne을 기억해보자
- ```assembly``` 키워드는 Solidity의 vanilla Solidity에 있지않은 기능등에 접근할 수 있게 해준다. ```extcodesize```는 주어진 주소의 contract의 크기를 가져온다. 이더리움 Yellow Paper 7번 섹션에서 더 자세히 배울 수 있다.
- ```^```는 bitwise operation이며 XOR을 뜻한다. Coin Flip을 참조하며 이번 레벨을 시작해도 좋을 것이다.

우리는 entrant를 얻기 위해 3개의 modifier의 require문을 모두 만족시켜야 한다. 

첫번째로 gateOne은 msg.sender와 tx.origin을 다르게 만들면 통과할 수 있다. 이는 다른 contract를 만들어 call하면 통과할 수 있다. gateOne은 [지난 문제](https://holyhansss.github.io/ethernaut/13_gatekeeperOne_ethernaut/13_gatekepperOne_1_ethernaut/)에서 풀었고, [Telephone](https://holyhansss.github.io/ethernaut/4_telephone_ethernaut/4_telephone_ethernaut/)문제에도 나와있음으로 풀 수 있을 것이라고 생각하고 gateTwo로 넘어가도록 하겠다.

두번째로 gateTwo는 ```assembly```와 ```extcodesize```에 대해서 이해해야한다. 

우선 ```assembly```는 low level 연산을 수행 할 수 있도록 도와준다. 또한 힌트에서 알 수 있듯이 vanilla Solidity에 있지 않은 기능에 접근할 수 있게 해준다.  ```assembly```는 Uniswap V2 contract에서도 본적있다. 그렇기 때문에 contract를 분석하기 위해서는 ```assembly```에 대해 아는 것이 필수이다. 

그렇다면 ```extcodesize```는 무엇일까?
`extcodesize`는  주어진 주소의 contract의 크기를 반환한다. 그렇다면 우리가 entrant를 얻기위해 만드는 contract는 크기가 0이 될 수 있나?? 

있다! `extcodesize`는 contract initialization 단계에서는 0을 반환한다. contract creation이 완료되어야 코드가 저장되기 때문이다.
즉 constructor안에 코드를 넣는다면 extcodesize는 0을 반환 할 것이고 gateTwo를 통과할 수 있게된다.

[ethereum yellow paper](https://ethereum.github.io/yellowpaper/paper.pdf)는 이더리움의 기술 백서이다. 기술 백서의 7번(CONTRACT CREATION) section을 보면 extcodesize에 대한 자세히 알 수 있다고 한다. 나는 읽어보고 더 확실한 이해를 위해 구글에 검색했다!

<br/>
마지막으로 gateThree다. gateThree를 통과하기 위해서는 비트 연산자에 대한 개념이 필요하다. 다행히 나는 학교수업에서 배운 적 있어 이해하는데, 큰 어려움은 없었다.

비트연산자에 대해서 먼저 설명해보겠다.  
 - `&`: and; `1010 & 1111 == 1010`
 - `|`: or; `1010 | 1111 == 1111`
 - `^`: xor; `1010 ^ 1111 == 0101`
 - `~`: not; `~1010 == 0101`

위 표는 [이 게시물](https://medium.com/coinmonks/ethernaut-lvl-14-gatekeeper-2-walkthrough-how-contracts-initialize-and-how-to-do-bitwise-ddac8ad4f0fd)을 참조했다.

XOR의 특성을 생각해보면 `A xor B = C` == `A xor C = B`라는 것을 알 수 있다. 우리는 우리의 _gateKey 계산을 위해 gatekeeperTwo contract의 gateThree의 require문 안에있는 수식가져와 위 xor의 특성처럼 대입할 수 있다. require문 안에는 다음과 같은 수식이 들어있다.

```solidity
uint64(bytes8(keccak256(abi.encodePacked(msg.sender)))) ^ uint64(_gateKey) == uint64(0) - 1
```
이를 xor의 특성을 적용해 바꾼다면 다음과 같아진다. 그럼 우린 이 코드를 넣어 _gateKey값을 구해 call을 보내면 된다.
```solidity
uint64(bytes8(keccak256(abi.encodePacked(msg.sender)))) ^ uint64(0) - 1 == uint64(_gateKey)
```

getEtrant contract 코드를 함께 보자!
```solidity
contract GetEntrant {
    // gateTwo를 통과하기 위해 call을 constructor안에서 실행시켰다.
    constructor(address _gatekeeperTwo) public {
        // gateThree에 필요한 _gateKey를 위해 A^B=C를 A^C=B로 바꾸었다.
        // 바꿀때 key는 bytes8임으로 bytes8을 type conversion을 해주었다.
        bytes8 _key = bytes8(uint64(bytes8(keccak256(abi.encodePacked(address(this))))) ^ uint64(0) - 1);
        // _key를 사용해 call을 보낸다. 
        _gatekeeperTwo.call(abi.encodeWithSignature('enter(bytes8)',_key));
    }
}

```
gatekeeperTwo contract의 주소를 넣어 GetEntrant를 deploy시키면 완료된다!

이후 Submit instance를 누르고 조금 기다리면 block이 mine되고, 아래와 같이 뜨며 마무리된다.
```
٩(- ̮̮̃-̃)۶ Well done, You have completed this level!!!
```

- - -

## 마무리
GateKeeperOne과 마찬가지로 새로운 개념을 많이 배울 수 있는 문제 같았다. 문제를 그냥 푼다기 보다는 문제를 풀며 내가 어떤 것을 배우는지, 그리고 정확하게 이해하며 배우는 것에 집중해야할 것 같다. `assembly` 같은 경우 다른 contract에서도 사용하는 것을 봤고, 이해가 안됐었다. 하지만 문제를 풀며 직접 찾아보고 이해하려고 했을때는 더 잘 이해가 된 것 같다ㅎㅎ 앞으로도 열심히 하자:)


- - -
## 기타 정보
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
- 참고 자료: https://medium.com/coinmonks/ethernaut-lvl-14-gatekeeper-2-walkthrough-how-contracts-initialize-and-how-to-do-bitwise-ddac8ad4f0fd

```toc

```