---
emoji: 🧢
title: (취약점 시리즈 4) Delegate Call
date: '2021-12-23 22:34:00'
author: 한성원
tags: DelegateCall 취약점 SmartContract
categories: 취약점분석
---

# 👋 DelegateCall
## 들어가기전 Call 과 Delegate Call의 차이점
#### Call이란?
Call은 다른 contract와 상호작용하기 위한 low level function이다.

컨트랙트 A를 통해 컨트랙트 B의 함수 호출시 B의 Storage를 변경시키며 msg.sender(호출자)는 컨트랙트A의 주소가 됩니다.
#### Delegate Call이란?
delegate call은 call과 매우 유사하다. delegate은 '위임하다' 라는 뜻으로 call에 대한 권한을 위임한다고 볼 수 있다. Contract A에서 B


## DelegateCall이란?
컨트랙트 A를 통해 컨트랙트 B 호출시 B의 Storage를 변경시키지 않고, B의 코드를 A에서 실행합니다.

msg.sender와 msg.value가 컨트랙트 A 호출시와 같고, 변동되지 않습니다.
```toc

```