---
emoji: 🧢
title: Over & Under Flow controll?
date: '2021-12-21 18:31:00'
author: 한성원
tags: Overflow Underflow SafeMath openzeppline
categories: 취약점분석
---


# 👋 Over & UnderFlow

## 들어가기 전
Overflow와 Underflow는 solidity 0.8.0 버전부터 알아서 컨트롤 되게 바뀌었다.
0.8.0 이후 버전을 사용하시는 분은 아래로 내려가도 좋다.

- - -

## OverFlow와 UnderFlow란 
Overflow는 지정된 정수형(int)의 최댓값보다 커졌을 때 발생한다.   
Underflow는 지정된 정수형(uint)의 최솟값보다 작아졌을 때 발생한다. 
Solidity에서는 unsigned Integer(uint)를 자주 사용한다. uint256을 기준으로 했을때 최대값은 2<sup>256</sup>-1이고 최소값은 0이다. 즉 2<sup>256</sup>-1에 1을 더했을때 Overflow 0에서 1을 뺐을때 underflow가 일어날 것이다.

ExampleColde를 보면 보다 쉽게 이해 할 수 있을 것이다.

- - -

## Example Code
remix IDE에서 실습을 진행한다면 이해가 더욱 빠를것이다!
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0; // 0.8.0 이전 버전이어야함!

contract OverflowUnderFlow {
    int256 public zero = 0;
    uint256 public max = 2**256-1;
    
    // zero will end up at 2**256-1
    function underflow() public {
        zero -= 1;
    }
    // max will end up at 0
    function overflow() public payable{
        max += 1;
    }
}
```
<span style="color:grey">출처: https://medium.com/loom-network-korean/%EC%8A%A4%EB%A7%88%ED%8A%B8-%EC%BB%A8%ED%8A%B8%EB%9E%99%ED%8A%B8%EB%A5%BC-%EC%96%B4%EB%96%BB%EA%B2%8C-%EB%B3%B4%ED%98%B8%ED%95%A0-%EA%B2%83%EC%9D%B8%EA%B0%80-%EC%86%94%EB%A6%AC%EB%94%94%ED%8B%B0%EC%9D%98-6%EA%B0%80%EC%A7%80-%EC%B7%A8%EC%95%BD%EC%A0%90-%EB%B0%8F-%EB%8C%80%EB%B9%84%EC%B1%85-1%EB%B6%80-c21d4e37034a</span>  

위 코드는 0.8.0 이전 버전들에게는 위험한 코드이다. zero에서 underflow function을 실행기키면 -1로 바뀌는 것이 아닌 2<sup>256</sup>-1로 바뀌게 된다. 만약 이 코드가 erc20와 같은 토큰을 다루는 코드였다면 큰 손실을 입을수도 있다.
Overflow도 마찬가지로 max(2<sup>256</sup>-1) + 1을 하면 2<sup>256</sup>이 아닌 0으로 바뀌게 된다.

- - -

## 어떻게 overflow와 underflow를 예방할 수 있을까?
openzeppline의 SafeMath 같은 라이브러리를 사용하는 것이 가능 보편화되어있다.

- - -

## 0.8.0 이후 버전에서는 어떻게 다른가?
0.8.0 이후 버전에서는 위와 같은 코드를 작성해도 문제가 되지 않는다. 0.8.0 이후 버전은 underflow 또는 overflow가 일어나면 즉시 revert 해버리기 때문이다. 그래서 따로 safe math와 같은 라이브러리를 사용 할 필요가 없다. 

- - -

## 마무리
overflow와 underflow는 다른 언어를 배우면서 배웠던 것이라 개념 자체는 쉬웠다.
다음 포스트에서는 __짧은 주소 공격__ 에 대해서 다루어 볼 예정이다.


```toc

```