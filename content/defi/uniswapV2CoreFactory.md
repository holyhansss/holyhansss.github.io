---
emoji: 🧢
title: Uniswap V2 Core Factory Contract 분석
date: '2022-04-19 16:37:00'
author: 한성원
tags: blog Defi Uniswap decentralizedExchange Dao Blockchain
categories: Defi
---


# 👋 Uniswap V2 Core Factory

Uniswap V2는 Core와 Periphery로 나뉜다. Core은 Factory 와 Pair을 중심으로 이루어져 있으며 Core 말 그대로 Uniswap의 심장 역할을 한다. Periphery는 직역하면 주변부라는 뜻으로 실제 유저들이 상호작용을 하는 contract이다.

오늘은 Uniswap V2 Factory contract 하나에 대해서 분석을 해볼 것이다!

## Uniswap V2 Factory Interface
우선 UniswapV2 Factory Contract의 Interface를 보자.

```solidity
pragma solidity >=0.5.0;

interface IUniswapV2Factory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function feeTo() external view returns (address);
    function feeToSetter() external view returns (address);

    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint) external view returns (address pair);
    function allPairsLength() external view returns (uint);

    function createPair(address tokenA, address tokenB) external returns (address pair);

    function setFeeTo(address) external;
    function setFeeToSetter(address) external;
}
```
<br>

총 8개의 function과 1개의 event가 존재한다. 이름만 보며 각각의 기능들을 유추해보자!

- feeTo(): fee를 지불할 주소를 return한다.
- feeToSetter(): fee를 지불할 주소를 set한다.
- getPair(): tokenA와 tokenB의 pair 주소를 return한다.
- allPairs(): index를 받고 그에 해당하는 pair 주소를 return한다.
- allPairsLength(): pair 전체의 length를 return한다.
- createPair(): tokenA와 tokenB를 인자로 받아 pair을 생성한다. (가장 중요한 함수같다!) 
- setFeeTo: feeTo함수를 설장하는 함수
- setFeeToSetter: setFeeTo()를 설정하는 함수

간단하게는 감이 온것 같다! 이제 전체 코드를 보며 분석해보자!

## Uniswap V2 Factory 코드 분석

### 변수
우선 선언된 변수부터 살펴보자!
```solidity
    address public feeTo;
    address public feeToSetter;

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;
```
<br>

총 4개의 변수가 선언되었다.
- feeTo: fee를 받는 address이다.
- feeToSetter: feeTo의 address를 설정할 수 있는 address이다. 
- getPair: 모든 token pair가 저장되어있는 mapping이다. ex) getPair[tokenA][tokenB] = A와 B의 pair주소
- allPairs: 모든 pair의 주소를 저장해놓는 배열이다.

<br>

### 함수
```solidity
    constructor(address _feeToSetter) public {
        feeToSetter = _feeToSetter;
    }

    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }
```
<br>

우선 두가지의 함수를 보겠다. 첫번째로 constructor이다. constructor는 contract가 배포될 당시 딱 한번 실행되는 함수이다. constructor에서는 feeToSetter을 지정한다.
두번째로 allPairsLength 함수이다. 이 함수는 함수 이름 그대로 allPairs의 길이를 가져오는 함수이다.

<br>

```solidity
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        // Token A와 B의 address가 다른 것을 확인한다.
        require(tokenA != tokenB, 'UniswapV2: IDENTICAL_ADDRESSES');

        // 주소의 값이 더 작은 것을 token0으로 지정하고 큰 주소를 token1로 지정한다.
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        
        // token0의 address가 zero address가 아닌 것을 확인한다.
        require(token0 != address(0), 'UniswapV2: ZERO_ADDRESS');

        // token0과 token1의 pair가 이미 존재하는지의 여부를 확인하다.
        require(getPair[token0][token1] == address(0), 'UniswapV2: PAIR_EXISTS'); // single check is sufficient
        
        // contract creation bytecode를 불러온다.
        bytes memory bytecode = type(UniswapV2Pair).creationCode;
        
        // token0와 token1의 주소의 hash값을 salt라는 변수에 저장한다.
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        
        // opcode create2를 사용해 contract를 생성한다.
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        // 생성된 pair contract를 initialize한다.
        IUniswapV2Pair(pair).initialize(token0, token1);

        // getPair mapping에 pair의 주소 값을 대입한다.
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // populate mapping in the reverse direction
        
        // allPairs에 pair 주소를 추가한다.
        allPairs.push(pair);
        emit PairCreated(token0, token1, pair, allPairs.length);
    }
```

createPair은 Factory Contract의 가장 중요한 함수라고 생각한다!
간단한 분석은 코드 자체에 주석으로 남겨두었다.

여기서 나는 create2라는 opcode를 처음 접했다. create과 똑같이 contract를 생성하지만 create2는 nonce값이 빠져있다고 한다.
우선 `type(UniswapV2Pair).creationCode` 라는 부분에서 처음 막혔다. type이 뭔가~ 하고 [solidity docs](https://docs.soliditylang.org/en/v0.8.10/units-and-global-variables.html?highlight=type#type-information)를 찾아 보았다. 

> type(C).creationCode: Memory byte array that contains the creation bytecode of the contract. This can be used in inline assembly to build custom creation routines, especially by using the create2 opcode. This property can not be accessed in the contract itself or any derived contract. It causes the bytecode to be included in the bytecode of the call site and thus circular references like that are not possible.

간단하게 설명하면 assembly를 활용해 커스텀으로 contract를 생성할 수 있는 것이다. 그리고 특히 create2 opcode를 사용할 때 `type(C).creationCode`를 활용 할 수 있다.

create2라는 opcode를 활용하면 만들어진 contract의 주소값을 얻을 수 있고, 이를 바로 활용하여 `initialize` 할 수 있다. 


## 번외
그리고 create2를 찾아보던 중 신기한 것을 발견했다. create2는 create와 다르게 nonce 값이 빠져있기 떄문에 주소를 예측할 수 있다.
즉 createPair()에서 들어가는 token0와 token1의 주소를 안다면 contract의 주소를 예측 할 수 있는 것이다. 

그리고 만약 token0와 token1의 pair contarct에 selfdesturct 정의 되어있고, 이가 실행된다면 contract는 삭제될 것이다. 하지만 우리는 token0와 token1의 주소를 알기 때문에 삭제된 contract의 주소와 같은 주소로 contract를 배포할 수도 있다.

하지만 다행히 contract가 이미 존재하고 selfdesturct가 불리지 않는다면 contract 주소를 뺏어오는 것은 불가능하다.

create2는 몇가지 취약점을 가지고 있기 때문에 확실히 알고 쓰지 않는다면 위험 할수도 있다. ~(다음엔 create2 취약점에 대해서 다루어보자!)~

## 마무리
시험기간이라 그런지 학교 공부는 집중이 잘 안되서 분석을 해보았다!ㅋㅋㅋ assembly는 아직 익숙하지 않아서인지 완전히 이해하기까지 시간이 걸렸다. ~아직 갈길이 멀다는 것ㅜㅜ~ 다음 분석은 Pair contract를 해보도록 하겠다!


```toc

```