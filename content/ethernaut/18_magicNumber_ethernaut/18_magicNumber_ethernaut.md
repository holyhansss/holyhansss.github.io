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

- whatIsTheMeaningOfLife의 response contract인 MagicNumber에 올바른 번호(42)를 제공해주는 Solver를 만들어주면 된다.
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
이 문제에서 우리의 목표는 10개 이하의 opcode를 사용하여 Solver를 제공해주면 주는 것이다. 위에 '들어가기 전'에 관련해서 공부할 수 있는 링크를 달아두었지만 다시 한번 집고 넘어가도록 하겠다.

### Contract Creation Process(계약 생성되는 과정)
1. 사용자가 또는 contract가 이더리움 네트워크에 transaction을https://holyhansss.github.io/EVM/evm/ 보낸다. 이때 transaction에는 `to` field 는 비어있다. (관련해서는 [이 글의 4번을]() 참조하자)
2. EVM은 Solidity로 작성된 코드를 bytecode로 컴파일하고, bytecode는 opcode로 변환된다. 이때 bytecode는 `초기화 코드`와 `런타임 코드`가 순차적으로 연결된다.
3. contract creation단계에서는 stop 또는 return 명령어를 만날때 까지 초기화 코드만이 실행된다. 이때는 constructor()가 실행되고 contract는 주소를 가지게 된다.
4. 초기화 코드가 다 실행된 후에는 런타임 코드만 스택에 남아있게되고, 런타임 코드는 copycode라는 opcode를 통해 EVM으로 반환하게 된다.
5. EVM은 반환된 opcode를 constructor에서 얻은 contract address의 state storage에 저장하게 된다. 그리고 이 opcode는 나중에 function이 호출 될 때마다 스택에 의해 실행될 런타임 opcode이다.


### 풀이
그렇다면 위 내용을 어떻게 사용 할 수 있을까?
우리는 초기화 코드와 10 opcode이내의 런타임 opcode를 찾아 transaction을 보내면 된다!

<br/>

#### runtime code(런타임 opcode)
우선 우리가 transaction에 보낼 런타임 opcode를 찾아보자!
승리 조건에서 말했듯이 힌트에서 주어진 42를 return하는 Solver contract를 만들면 된다. 
42를 return 하기 위해서는 return opcode을 사용하면 된다.
return은 2개의 argument(인수)을 필요로 한다. 
- `p`: 값이 메모리에 저장되는 위치 EX)0x0, 0x10, 0x20, 0x30...
- `s`: 저장되는 데이터의 크기이다. 데이터의 크기는 32 bytes이며, 16진수로는 0x20이다.

<br/>

여기서 우리가 알아야 할 점은 값이 저장되어있어야 return을 사용할 수 있다는 것이다. 우리는 값을 저장하기 위해서 `mstore`사용할 것이다.

mstore은 return 과 마찬가지로 2개의 argument(인수)를 필요로 한다.
- `p`: 값이 메모리에 저장되는 위치 EX)0x0, 0x10, 0x20, 0x30...
- `v`: 저장 할 값(42)

1. 먼저 mstore 부분을 bytecode로 나타내보겠다!
`60 = opcode push1`에 해당한다.
```
6042  // v: push1 0x2A(2A는 16진수로 42이다.)
6020  // p: push1 0x20(0x20 메모리 slot에 저장)
52    // mstore(mstore을 나타내는 opcode)
```

2. 다음으로 저장한 값을 return하면 된다.
```
6020  // s: push1 0x20(저장되는 데이터의 크기가 0x20이다. 0x20을 10진수로 나타내면 32 bytes에 해당한다)
6020  // p: push1 0x20(0x20 메모리 slot에서 데이터를 불러온다)
f3    // return(return을 나타내는 opcode)
```

opcode를 세어보면 총 10개의 opcode를 가지게 된다.
승리 조건 중 10개 이하의 opcode를 사용하는 부분을 만족시키며 42를 return 할 수 있다. 위 과정을 하나의 합치면 `604260205260206020f3`라는 bytecode를 얻을 수 있다. 우리는 런타임 부분의 bytecode를 만들었다.


#### Initialization code(초기화 opcode)
이제 transaction에 보낼 초기화 opcode를 찾아보자!
초기화 opcode에서 우리는 runtime opcodes를 memory에 카피해야한다. copy한 후 return 시키면된다. 다행히 evm에는 `codecopy`라는 opcode가 존재한다. `codecopy`는 mstore, return과 다르게 3개의 arguments(인수)를 가진다.
- `t`: 코드를 저장할 메모리의 위치(우리는 임의로 `0x00`을 사용 할 것이다)
- `f`: `runtime opcodes`의 위치
    - `runtime opcodes`는 `initialization opcodes`뒤에 오기 때문에 `initialization opcodes`가 다 나와야 알 수 있다.
- `s`: `runtime opcodes`의 사이즈
  - 우리의 runtime 코드는 `604260205260206020f3`로 10 bytes이다. 그리고 10 bytes는 16진수로 `0x0a`이다.

1. `copycode`에 대한 opcodes
```
600a  // s: push1 0x0a (10 bytes)
60??  // f: push1 0x?? (아직 우리는 runtime opcode가 어디에 있는지 알 수 없다)
6000  // t: push1 0x00 (memory index 0을 목적지로 지정한다)
39    // copycode opcode는 39이다.
```

2. 메모리에서 runtime opcodes를 EVM으로 반환하는 bytecodes
```
600a  // s: push1 0x0a (return할 runtime opcode의 길이)
6000  // p: push1 0x00 (메모리 0x00에서 접근)
f3    // return to EVM
```

위에 만들어 놓은 `initialization opcodes`를 합치면 `600a60??600039600a6000f3`가 된다. 이제 `runtime opcode`의 시작 위치를 찾을 수 있다!

`initialization opcodes`가 총 12 bytes이기 때문이 `runtime opcode`는 12 byte에서부터 시작한다. 그리고 12을 16진수로 변경하면 `0x0c`이다. `initialization opcodes`의 위치에 `0x0c`를 넣어주면 다음과 같이 `initialization opcodes`를 만들 수 있다. 

`600a600c600039600a6000f3`

이에 runtime까지 합친다면 `0x600a600c600039600a6000f3604260205260206020f3`가 된다! 이제 얻은 값을 사용해 문제를 풀면된다.

<br/>

아래 커맨드는 ethernaut console창에서 이루어진다
ctrl + shift + i를 눌러 console창을 활성화 시키자
```javascript
// 우리가 찾은 bytecode 저장
> var bytecode = "0x600a600c600039600a6000f3604260205260206020f3";
// sendTransaction을 사용해 EVM에 contract creation transaction을 보낸다.
> await web3.eth.sendTransaction({ from: player, data: bytecode }, function(err,res){console.log(res)});
```

<br/>

Etherscan에 들어가 내가 보낸 transaction을 확인하고 새로 만들어진 contract의 주소를 확인하여 magicNumber contract.setSolver에 보내주면 된다.

```javascript
// 만들어진 contract address를 parameter로 하여 보낸다.
> await contract.setSolver("contract address")
```

완료 후 ethernaut으로 돌아와 Submit instance를 누르고 조금 기다리면 block이 mine되고, 아래와 같이 뜨며 마무리된다.
```
٩(- ̮̮̃-̃)۶ Well done, You have completed this level!!!
```
- - -

## 마무리
ethernaut문제 중 가장 어려웠던 문제이다. 위에서도 말했지만 어려웠기에 많이 배울 수 있었다. 이 문제를 통해 bytcode 및 opcode에 대한 이해도가 높아졌을 뿐더러 EVM contract creation process등등 많은 것을 얻을 수 있었다. 아마 이제는 좀 더 자신있게 `assembly`key를 사용할 수 있을 것 같다. 끝!!



- - -
## REF
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org

```toc

```