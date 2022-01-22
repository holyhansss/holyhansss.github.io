---
emoji: 🧢
title: (Ethernaut 취약점 15) Naught Coin
date: '2022-01-21 10:57:00'
author: 한성원
tags: ethernaut NaughtCoin Naught Coin vulnerability 
categories: 취약점분석
---


# 👋 Privacy
__Difficulty 5/10__

- 승리 조건
- 코드 분석
- 풀이
순서로 진행 될 것이다.

- - -

## 승리 조건
- 내가 가지고 있는 Naught Coin의 잔액을 0으로 만들기

- - -

## 코드 분석
분석은 주석에!
주석중 영어로 쓰여있는 것은 기존 코드에 포함되어있던 것이다:)!
더 자세한 설명은 코드 뒤에 나온다.

```solidity
 contract NaughtCoin is ERC20 {

    // string public constant name = 'NaughtCoin';
    // string public constant symbol = '0x0';
    // uint public constant decimals = 18;
    uint public timeLock = now + 10 * 365 days;
    uint256 public INITIAL_SUPPLY;
    address public player;

    // constructor: NaughtCoin이라는 토큰을 만든다.
    constructor(address _player) 
    ERC20('NaughtCoin', '0x0')
    public {
        player = _player;
        // 총 공급량 설정
        INITIAL_SUPPLY = 1000000 * (10**uint256(decimals()));
        // _totalSupply = INITIAL_SUPPLY;
        // _balances[player] = INITIAL_SUPPLY;
        // 총 공급량만큼 player에게 공급
        _mint(player, INITIAL_SUPPLY);
        emit Transfer(address(0), player, INITIAL_SUPPLY);
    }
    

    // openzeppline의 ERC20.transfer()을 override한 function
    function transfer(address _to, uint256 _value) override public lockTokens returns(bool) {
        super.transfer(_to, _value);
    }

    // 10년간 timelock이 걸려있다. 그래서 player는 10년간 token을 transfer하지 못한다.
    // Prevent the initial owner from transferring tokens until the timelock has passed
    modifier lockTokens() {
        if (msg.sender == player) {
        require(now > timeLock);
        _;
        } else {
        _;
        }
    } 
} 


```
- - -


## 풀이

NaughtCoin은 ERC20 토큰이며 당신은 이미 모든 토큰을 보유하고 있습니다. 중요한 건 10년의 폐쇄 기간이 지나야만 양도할 수 있다는 겁니다. 어떻게 하면 자유롭게 보낼 수 있는지 알아봐 주실 수 있나요? 토큰 잔액을 0으로 설정하여 이 수준을 완료하십시오.


이 문제에서 우리의 목표는 우리가 가지고 있는 token의 개수를 0으로 만드는 것이다. 하지만 위 코드를 보면 알 수 있다시피 transfer은 10년간 사용할 수 없다. 그렇다면 어떻게 풀어야 할까?

ERC20 token을 deploy 해봤다면 transfer이외에 토큰을 주고받을 수 있는 방법이 있다는 것을 알 것이다.

ERC20에 관해서 잘 모른다면 이 문제를 풀 수 없다! [여기서](https://eips.ethereum.org/EIPS/eip-20) ERC20에 관해 배우고 오자.

- [openzeppline ERC20 contract](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/9b3710465583284b8c4c5d2245749246bb2e0094/contracts/token/ERC20/ERC20.sol)

ERC20은 transfer이 외에 transferFrom이라는 함수가 존재한다. transferFrom 함수는 다른 address에게 approve 받은 만큼의 토큰을 보낼 수 있게된다. 즉 A가 B에게 원하는 양만큼 approve, B가 자신에게 approve된 만큼 누구에게든 token을 보낼 수 있게된다. 

우리가 이 문제를 풀 수 있는 시나리오는 이렇다.
1. player account이외의 account를 하나 더 생성한다. 생성한 account를 B라고 칭하겠다.
2. player인 우리가 우리 자신에게 전체 token의 양만큼을 approve 해준다.
3. 우리는 approve받은 양만큼 transferFrom함수를 사용해 B에 이체한다. 
4. player의 token balance는 0이 된다.

그렇다면 푸는 방법을 보며 좀 더 이해해보자
풀기 전 metamask를 통해 account를 하나 더 생성한다.

우선 console 창에서 실행시킨다
ctrl + shift + i를 눌러 console창을 활성화 시키자
```javascript
// 먼저 우리가 이채해야할 token의 양을 파악해야한다.
let playerBalance = await contract.balanceOf(player)
playerBalance.toString(); // "1000000000000000000000000"

// player 자신에게 토큰 이체 권한을 부여한다.
await contract.approve(player,"1000000000000000000000000")

// B account에게 모든 token을 이체한다.
await contract.transferFrom(player, "0x690A732BA98fcfe72bDedE2085816BCF6498058d", "1000000000000000000000000")

```

이후 Submit instance를 누르고 조금 기다리면 block이 mine되고, 아래와 같이 뜨며 마무리된다.
```
٩(- ̮̮̃-̃)۶ Well done, You have completed this level!!!
```

- - -

## 마무리
이번 문제에서는 ERC20 토큰에 대한 개념을 다루는 것 같다. ERC20에 대해서 잘 이해하고 있다면 쉽게 풀 수 있는 문제였다고 생각한다. 문제를 풀면 나오는 설명에서도 contract를 만든 사람은 ERC20에 대해 잘 모르는 사람일 것이라고 말했다. ERC20은 Defi와 여러 서비스에서 사용하고 있는 __표쥰__ 이기 때문에 필수 적으로 자세히 알아야한다고 생각한다. 앞으로 여러 contract를 분석해보면서 더 깊은 이해를 해보자^^! 

- - -
## 기타 정보
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
- 참고 자료: https://medium.com/coinmonks/ethernaut-lvl-14-gatekeeper-2-walkthrough-how-contracts-initialize-and-how-to-do-bitwise-ddac8ad4f0fd

```toc

```