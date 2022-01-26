---
emoji: 🧢
title: EVM과 Transaction
date: '2021-12-13 02:26:00'
author: 한성원
tags: EVM Ethereum Virtual Machine EthereumVirtualMachine
categories: ethereum
---


# 👋 EVM(Ethereum Virtual Machine)? 그게 뭔데?
solidity로 smart contract를 작성하면서 __gas optimization__ 등에 대해 깊이 알기위해 EVM을 공부를 시작하였다! 

## 1. Virtual Machine?
먼저 Virtual Machine(가상 머신)이란 뭘까?   
가상머신이란 물리적으로 존재하는 컴퓨터는 아니지만 실제 컴퓨터처럼 작동하는 소프트웨어이다. 가상머신을 사용하게 되면 하나의 컴퓨터로 2가지 이상의 운영체제를 실행 할 수 있고, 상호간 충돌을 없앨 수 있다.   
나는 우분투를 사용했었는데, 역시 사용하면서 배우는게 최고인 것 같다. 

## 2. EVM(Ethereum Virtual Machine)
이더리움 노드들이 공유하는 하나의 가상 머신이다. 모두가 다 같이 사용하기에 "World Computer"이라고도 불린다. 그리고 스마트 컨트랙트의 배포와 실행을 처리하는 이더리움의 일부이다. EVM안에 배포된 코드는 다른 프로세스들과 완전히 격리되어있다.EVM의 역할은 데이터의 변화, 변경하는 데이터의 충돌과 보안을 담당한다. 

## 3. Accounts란?
두가지 종류의 계정(Accounts)가 존재한다. 두 계정에는 모두 ether를 보관할 수 있다. Account는 종류에 불문하고 4가지로 구성되어있다.
1. Nonce
2. Balance
3. storageRoot
4. CodeHash

- EOA(Externally Owned Accounts)   
EOA는 Private Key를 통해 관리된다. 그렇기 때문에 private key가 있다면 EOA를 언제나 다시 생성할 수 있고, 서명을 통해 transaction을 보낼 수 있다.

- CA(Contract Account)   
CA는 smart contract를 통해 관리된다. smart wallet이라고도 불리운다. smart contract로 관리되기 때문에 EOA 또는 다른 contract에서 보내는 transaction과 메세지를 통해 실행될 수 있다. 결국 모든 transaction은 EOA로부터 시작된다.  

두가지 계정이 존재하지만 EVM에서는 동일하게 취급한다.

## 4. Transaction이란?
이더리움에서 Transcation이란 서명된 __데이터 페키지이다.__ 데이터 페키지에는 nonce, to, signature, value, data(optional), gaslimit, gasprice에 대한 정보 등이 저장되어있다.   
ether를 계정들에게 보내거나, smart contract 배포하거나 함수를 호출할때 사용된다. 
contract creation의 transaction에서는 `To` field가 필요없고, `data` field에는 계약 상태를 설정하고 계약을 배포하기 위한 초기 코드가 들어간다.

## 5. Transaction의 구조
- Nonce: 해당 account의 transaction의 개수, 0부터 시작(이중지불 방지)
- Gas Price: transaction을 보낸 사람이 지불하는 gas의 가격(in wei)
- Gas Limit: transaction안에서 최대로 사용할 수 있는 gas의 양
- To: transaction을 보내는 address(주소)
- Value: 보내는 값(in wei)
- Data: address에 보내는 데이터
- v,r,s: 트랜잭션 서명의 구성 요소

## 6. Message란?
메세지는 Transaction과 __EOA가 아닌 contract가__ 생성한다는 것 외에 굉장히 비슷하다. 큰 차이점은 Gas Limit를 설정할 필요가 없다는 것이다. EOA가 처음 Transaction을 보낼때 이미 설정하기 때문이다. 결국 EOA가 Transaction을 보내지 않는다면 Message는 생성될 수 없다.

## 7. Gas란?
Gas는 정해져있는 연산 비용이다. 즉 많은 연산을 할 수록 많은 gas가 소모된다. 총 수수료는 __Gas Price * Gas의 총 양__ 으로 결정된다. 만약 해커카 DOS 공격을 시도한다면 transaction에 비례해 gas를 지불해야한다.
그렇기 때문에 Gas는 이더리움에 꼭 필요한 요소중 하나라고 생각한다. Gas limit과 gas price를 통해 anti-Dos모델을 유지시킬 수 있다. 


---
처음으로 내가 공부한 내용을 글로 담아보았다. 아마 설명이 부족한 부분이 많았으리라고 생각한다. 앞으로 많은 글을 쓰며 더 공부하고 공부한 것을 잘 설명하고 싶다.

```toc

```