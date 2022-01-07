---
emoji: 🧢
title: (Ethernaut 취약점 2) Fallout  
date: '2022-01-02 11:10:00'
author: 한성원
tags: ethernaut Fallout vulnerability
categories: 취약점분석
---


# 👋 1. Fallout
__Difficulty 2/10__

- 승리 조건
- 코드 분석
- 풀이
순서로 진행 될 것이다.

- - -

## 승리 조건
- contract의 ownership을 뺐어오기

- - -

## 코드 분석
사실 fallout에서는 코드를 분석 할 필요가 없다.
한번 코드를 읽어보고 밑으로!!
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import '@openzeppelin/contracts/math/SafeMath.sol';

contract Fallout {
  
  using SafeMath for uint256;
  mapping (address => uint) allocations;
  address payable public owner;


  /* constructor */
  function Fal1out() public payable {
    owner = msg.sender;
    allocations[owner] = msg.value;
  }

  modifier onlyOwner {
	        require(
	            msg.sender == owner,
	            "caller is not the owner"
	        );
	        _;
	    }

  function allocate() public payable {
    allocations[msg.sender] = allocations[msg.sender].add(msg.value);
  }

  function sendAllocation(address payable allocator) public {
    require(allocations[allocator] > 0);
    allocator.transfer(allocations[allocator]);
  }

  function collectAllocations() public onlyOwner {
    msg.sender.transfer(address(this).balance);
  }

  function allocatorBalance(address allocator) public view returns (uint) {
    return allocations[allocator];
  }
}
```
- - -

## 풀이
우리의 문제는 __"contract의 ownership을 뺐어오기"__ 이다.

Contract를 자세히 보면 constructor에 오타가 있는 것으로 보인다.
그렇게되면 우리는 Fal1out()을 call함으로써 ownership을 가져올 수 있다

모든 코드는 console창에서 이루어진다. 
ctrl + shift + i를 눌러 console창을 활성화 시키자
```javascript
//오타가 있는 Fal1out()을 call한다.
await contract.Fal1out()
//contract의 owner address를 확인한다.
await contract.owner()
//나의 address를 확인한다.
player
//play(나)이 owner가 된 것을 확인 할 수 있다.
```
완료 후 Submit instance를 누르고 조금 기다리면 block이 mine되고,
```
٩(- ̮̮̃-̃)۶ Well done, You have completed this level!!!
```

## 부가설명
원래 constructor는 아래와 같이 contract의 이름과 동일하게 사용했다.
```solidity
contract A {
  function A() public  {
  }
```
하지만 Solidity v0.5.0에서 constructor는 'constructor' 키워드를 사용해야하는 것으로 바뀌었다. 

- - -
## 마무리
나는 처음에 Fal1out()에서 오타를 발견하고 사람이니깐 실수 할 수 있지... 하며 넘겼다. ~~constructor라고도 친절히 써주셔서 당연히 오타인줄^^~~` 그래서 다른 function들을 분석해보며 어떻게 ownership을 가져올 수 있을까하며 10분 이상을 보낸 것 같다ㅋㅋ 그러다 문득 설마 저게 오타가 아닐까?하고 바로 console창에 Fal1out()을 call 했다. 근데 아니나다를까 바로 해결 되버렸다ㅠㅠ
아마 이번 문제에서는 오타 하나가 smart contract를 불안전하게 만들 수 있다는 교훈을 주는 것 같다. 문제를 풀면 실제 오타로 인해 일어났던 사고의 예시를 보여주니 확인해자! 그리고 절대 오타를 만들지 말자!!


- - -
## 기타 정보
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- Solidity v0.5.0 Breaking Changes: https://docs.soliditylang.org/en/v0.8.10/050-breaking-changes.html#deprecated-elements
```toc

```