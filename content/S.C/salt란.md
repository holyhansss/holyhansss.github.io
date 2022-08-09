---
emoji: 🧢
title: Salt란 무엇인가?
date: '2022-08-08 11:39:00'
author: 한성원
tags: Ethereum solidity salt
categories: solidity
---


# 👋 Salt란 무엇인가?

## Salt를 알아보는 이유
개인적으로 Smart Contract를 분석하다보면 `salt`라는 변수를 볼때가 많았다. 내가 처음 salt를 접한 것은 `Uniswap Factory Contract`였다. 이때는 하나하나의 변수에 집중하기보다는 Uniswap의 구조와 주요 함수 및 변수를 위주로 봤기 때문에 salt라는 변수는 별생각 없이 넘겼었다. 하지만 다른 Smart Contract에서도 salt 변수를 반복적으로 사용하는 것을 확인하였고, Salt에 대해 알아볼 필요성을 느꼈다.

## Salt
일반적으로 smart contract을 배포할때는 배포할때마다 증가하는 카운터(nonce)의 값을 사용하여 contract의 주소가 계산된다. 하지만 옵션으로 salt값을 주는 경우 카운터(nonce)를 사용하지 않고 다른 메커니즘을 사용해 contract의 주소를 계산한다. 

salt를 사용하여 주소를 계산하는 메커니즘은 contract의 주소를 예측할 수 있게 해준다. 

위키백과에는 salt를 다음과 같이 설명하고 있다.
```
In cryptography, a salt is random data that is used as an additional input to a one-way function that hashes data, a password or passphrase.[1][full citation needed] Salts are used to safeguard passwords in storage. Historically, only a cryptographic hash function of the password was stored on a system, but over time, additional safeguards were developed to protect against duplicate or common passwords being identifiable (as their hashes are identical).[2] Salting is one such protection.
```
해석하면 salt는 암호학에서 데이터나 암호를 해시하는 단방향 함수에 추가적으로 사용되는 임의의 데이터이다. salt는 저장소 안에 있는 암호를 보호하는데 사용된다. 과거에는 암호를 해시 함수에만 의존해 저장소에 저장했지만 시간이 지남에 따라 중복되거나 공통적인 암호에 대한 가능성이 생겼고 이를 보호하기 위한 추가 안전장치로써 salt가 개발되었다.

solidity에서 salt의 예시는 두가지 경우에서 찾아볼 수 있다.
1. create2
첫번째 경우는 solidity assembly의 create2이다. CREATE2 opcode를 사용하면 contract가 배포될 주소를 예측할 수 있고, 사용자 온보딩 및 확장성을 개선할 수 있는 많은 가능성이 열립니다.([openzeppelin](https://docs.openzeppelin.com/cli/2.8/deploying-with-create2))

--- 

### Example from solidity docs
```solidity
    // SPDX-License-Identifier: GPL-3.0
    pragma solidity >=0.7.0 <0.9.0;
    contract D {
        uint public x;
        constructor(uint a) {
            x = a;
        }
    }
    
    contract C {
        function createDSalted(bytes32 salt, uint arg) public {
            // This complicated expression just tells you how the address
            // can be pre-computed. It is just there for illustration.
            // You actually only need ``new D{salt: salt}(arg)``.
            address predictedAddress = address(uint160(uint(keccak256(abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(abi.encodePacked(
                    type(D).creationCode,
                    abi.encode(arg)
                ))
            )))));
    
            D d = new D{salt: salt}(arg);
            require(address(d) == predictedAddress);
        }
    }
```

예시를 보면 CREATE2 opcode와 salt를 사용해 주소를 예측하고, 실제로 배포함 contract와 주소를 비교하는 것을 볼 수 있다. 

2. 중복 보호

[Damn Vulnerable Defi](https://www.damnvulnerabledefi.xyz/challenges/12.html) 12본 Climber에 사용된 salt이다. 여기서 salt는 Id 중복을 보호하기 위해 사용된 것으로 보인다. 아래 코드를 보면 salt 값을 넣어 hash 값을 구함으로써 중복을 방지하고 있는 것을 알 수 있다.

``` solidity
   function getOperationId(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata dataElements,
        bytes32 salt
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(targets, values, dataElements, salt));
    }
```

## Ref
openzeppelin docs: https://docs.openzeppelin.com/cli/2.8/deploying-with-create2

solidity docs: https://docs.soliditylang.org/en/v0.8.16/control-structures.html?highlight=create2#salted-contract-creations-create2



```toc

```