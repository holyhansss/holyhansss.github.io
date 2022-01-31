---
emoji: 🧢
title: (Ethernaut 취약점 18) MagicNumber
date: '2022-01-31 17:44:00'
author: 한성원
tags: ethernaut MagicNumber vulnerability 
categories: 취약점분석
---


# 👋 1. Recovery
__Difficulty 6/10__

- 승리 조건
- 코드 분석
- 풀이
순서로 진행 될 것이다.

- - -
## 들어가기 전
필자는 이 문제를 풀기까지 거의 일주일 이상 걸린 것 같다. 그만큼 어려웠고 어려웠던만큼 배우는 것이 많았다. 
이 문제를 푸는 여러분도 문제를 통해 EVM에 대해 배우는 것이 많기를 바란다.
이 문제는 [이 글](https://medium.com/coinmonks/ethernaut-lvl-19-magicnumber-walkthrough-how-to-deploy-contracts-using-raw-assembly-opcodes-c50edb0f71a2)을 기반으로 작성되었다. 
19번 문제를 풀때는 답을 찾아보고 왜 그 답이 올바른 답인지 찾는 과정으로 풀었다. 위 글은 19번의 답을 가장 잘 설명하고 있다고 생각하여 인용하였다.
또한 내가 공부할때 봤던 사이트, 유투브 영상들의 리스트를 공유하니, 잘 모른다면 아래 자료들을 보고 공부해도 좋을 것 같다.
- [Solidity Bytecode and Opcode Basics](https://medium.com/@blockchain101/solidity-bytecode-and-opcode-basics-672e9b1a88c2)
- [Openzeppelin Deconstructing a Solidity Contract](https://blog.openzeppelin.com/deconstructing-a-solidity-contract-part-i-introduction-832efd2d7737/)
- [EVM: From Solidity to byte code, memory and storage](https://www.youtube.com/watch?v=RxL_1AfV7N4)(Consensys 엔지니어분들이 나와 설명해주셨다!!)
- [EVM Bytecode ABI Gas and Gas Price](https://www.youtube.com/watch?v=HcOWNxL3Iy0)
- [Solidity Tutorial: Assembly](https://www.youtube.com/watch?v=r4yKide6jiU)(EatTheBlocks)
- 그리고 구글에서 Bytecode와 contract creation process등을 찾아보는 것을 추천한다!


- - -

## 승리 조건

- whatIsTheMeaningOfLife의 response contract인 MagicNumber에 올바른 번호를 제공해주는 Solver를 만들어주면 된다.
- 이번 문제에서는 10개 이하의 opcode를 사용해 해결해야 한다.

- - -

## 코드 분석
이번 문제는 분석할 것이 많이 없다.
내 생각에는 문제를 잘 이해하는 것이 더 중요하다.

```solidity
contract MagicNum {

  address public solver;

  constructor() public {}

  function setSolver(address _solver) public {
    solver = _solver;
  }

  /*
    ____________/\\\_______/\\\\\\\\\_____        
     __________/\\\\\_____/\\\///////\\\___       
      ________/\\\/\\\____\///______\//\\\__      
       ______/\\\/\/\\\______________/\\\/___     
        ____/\\\/__\/\\\___________/\\\//_____    
         __/\\\\\\\\\\\\\\\\_____/\\\//________   
          _\///////////\\\//____/\\\/___________  
           ___________\/\\\_____/\\\\\\\\\\\\\\\_ 
            ___________\///_____\///////////////__
  */
}

```
- - -
## 풀이
이 문제에서 우리의 목표는 10개 이하의 opcode를 사용하여 Solver를 제공해주면 된다. 





완료 후 ethernaut으로 돌아와 Submit instance를 누르고 조금 기다리면 block이 mine되고, 아래와 같이 뜨며 마무리된다.
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