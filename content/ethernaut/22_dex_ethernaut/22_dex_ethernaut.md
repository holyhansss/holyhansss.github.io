---
emoji: 🧢
title: (Ethernaut 취약점 22) Dex
date: '2022-02-07 13:43:00'
author: 한성원
tags: ethernaut Dex vulnerability 22
categories: 취약점분석
---


# 👋 1. Dex
__Difficulty 3/10__

- 승리 조건
- 코드 분석
- 풀이
순서로 진행 될 것이다.

- - -

## 승리 조건
- Dex Contract 해킹 후 토큰 중 하나를 모두 소진(0으로 만들기)하는 것이다. 


- - -

## 코드 분석
분석은 주석에 있습니다!

```solidity

```
- - -

## 풀이
### 들어가기 전

<br/>

### 풀이



위와 같은 시나리오로 isSold가 true가 되었고 price가 0이 된 것을 확인했다면 ethernaut으로 돌아와 Submit instance를 누르고 조금 기다리면 block이 mine되고, 아래와 같이 뜨며 마무리된다.
```
٩(- ̮̮̃-̃)۶ Well done, You have completed this level!!!
```
- - -

## 마무리

- - -
## REF
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org


```toc

```