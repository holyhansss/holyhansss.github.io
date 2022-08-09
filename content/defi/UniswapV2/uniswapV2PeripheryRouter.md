---
emoji: 🧢
title: Uniswap V2 Periphery Router Contract 분석
date: '2022-05-13 21:42:00'
author: 한성원
tags: blog Defi Uniswap decentralizedExchange Dao Blockchain
categories: Defi
---


# 👋 Uniswap V2 Periphery Router
Uniswap V2 Periphery Router에는 `UniswapV2Router01.sol`와 `UniswapV2Router02.sol`, 두가지 Router가 존재한다. Router01에서 문제가 발견되어 Router02를 만들었다고 한다. 그래서 이번 글에서는 Router02 contract를 다루려고한다.

우선 periphery contract는 Core contract의 함수들을 보다 쉽게 사용하기위해 만들어졌다. 우리가 지금 Uniswap 웹페이지에서 사용하는 contract가 바로 periphery contract이다.

이 글을 읽기 전 Core contract를 어느정도는 이해하여야 Uniswap의 전체적인 구조를 파악하는데 도움이 될 것이다. 

## Uniswap V2 Periphery Router 주요 functions
Router02에는 26개의 function이 존재한다. 26개의 function을 모두 글로 적기에는 양이 너무 많아 가장 중요한 몇가지 함수들만 다루려고 한다.

### addLiquidity

```solidity
    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) internal virtual returns (uint amountA, uint amountB) {
        // create the pair if it doesn't exist yet
        if (IUniswapV2Factory(factory).getPair(tokenA, tokenB) == address(0)) {
            IUniswapV2Factory(factory).createPair(tokenA, tokenB);
        }
        (uint reserveA, uint reserveB) = UniswapV2Library.getReserves(factory, tokenA, tokenB);
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint amountBOptimal = UniswapV2Library.quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, 'UniswapV2Router: INSUFFICIENT_B_AMOUNT');
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint amountAOptimal = UniswapV2Library.quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                require(amountAOptimal >= amountAMin, 'UniswapV2Router: INSUFFICIENT_A_AMOUNT');
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external virtual override ensure(deadline) returns (uint amountA, uint amountB, uint liquidity) {
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);
        TransferHelper.safeTransferFrom(tokenA, msg.sender, pair, amountA);
        TransferHelper.safeTransferFrom(tokenB, msg.sender, pair, amountB);
        liquidity = IUniswapV2Pair(pair).mint(to);
    }
```

<br>

addLiquidity는 `addLiquidity`와 `_addLiqiudity`로 나누어져 있다. 우선 `addLiquidity` 함수를 call 했을때 `_addLiquidity` 함수가 가장 먼저 실행되기 때문에, internal 함수인 `_addLiquidity` 함수를 살펴보자.

`_addLiquidity` 함수는 위에 말했듯이 Core Contract와 상호작용한다. line by line으로 한번 보도록 하자.

1. 처음 `_addLiquidity` 가 호출되면 pair pool이 생성되었는지 아닌지를 확인한다. 만약 pair가 없다면 factory contract의 `createPair`을 호출해 새로운 pair를 생성한다.
2. 그 후 토큰 pair의 reserve{0, 1} 값을 받아오고, 만약 reserve{0, 1} 값이 0이라면 pair가 생성되었지만 아무 token이 들어있지 않기 때문에 amount{A, B}Desired의 값을 Amount{0, 1} 값으로 지정해준다. 
3. 만약 reserve{0, 1}의 값이 0이 아니라면 else문이 실행된다.
4. else문에서는 amountBOptimal의 값 또는 amountAOptimal을 찾는다. 먼저 amountBOptimal의 값을 먼저 확인해보고 조건문에 불만족한다면 amountAOptimal를 계산해 적용한다.
변수 중 amount{A,B}Desired이라는 값이 존재하는데, 이는 pool에 넣고싶은 각 토큰의 양을 뜻한다. amount{A,B}Desired 값을 토대로 amount{A,B}Optimal의 값을 구한다. 글고 이때 `UniswapV2Library`의 `quote` 함수를 사용한다. 이 함수는 amountADesired을 사용해 동일한 가치의 Token B(amountBOptimal의)의 값을 구한다. 
5. 만약 구한 amount{A,B}Optimal의 값이 amount{A,B}Desired보다 작다면 assert를 활용해 transaction 을 revert시킨다.
6. 이후 amount{A,B}를 동일한 가치의 값으로 설정하여 return 한다.

그후 `addLiquidity` 함수로 돌아와 나머지 code를 실행한다.
1. `address pair`라는 변수에 token A와 B의 Pool address를 가져온다.
2. TansferHelper를 통해 pair contract에 각 토큰을 transfer한다.
3. 이후 제공한 liquidity만큼 LP 토큰을 mint 해준다.

<br>

### removeLiquidity
```
// **** REMOVE LIQUIDITY ****
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) public virtual override ensure(deadline) returns (uint amountA, uint amountB) {
        address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);
        IUniswapV2Pair(pair).transferFrom(msg.sender, pair, liquidity); // send liquidity to pair
        (uint amount0, uint amount1) = IUniswapV2Pair(pair).burn(to);
        (address token0,) = UniswapV2Library.sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        require(amountA >= amountAMin, 'UniswapV2Router: INSUFFICIENT_A_AMOUNT');
        require(amountB >= amountBMin, 'UniswapV2Router: INSUFFICIENT_B_AMOUNT');
    }
```

<br>

`removeLiquidity` 함수는 위에서 add 헸던 liquidity를 없앨 수 있다. line by line으로 알아보자!
1. 두 토큰의 pair address를 받아온다. 
2. msg.sender가 가지고 있던 lp 도큰을 pair contract에 반환한다.
3. 그리고 그 비율에 맞는 amount만큼 lp 토큰을 burn(소각)한다.
    이 함수에서 liquidity에 넣엏던 token을 반환 받는 코드가 없어 의아할 수 있지만 pair의 burn 함수에는 burn과 동시에 그 비율에 맞는 token의 msg.sender에게 송금해주는 기능이 있다. 
4. TokenA와 TokenB의 더 작은 주소 값을 token0에 할당한다.
5. 이후 tokenA와 tokenB를 정령해준다.
6. require문을 통해 amountA와 amountB의 값이 각 토큰의 최소값보다 작은지 확인한 후 Amount{A,B}가 return된다
    require문을 왜 뒤에 썼나 궁금할 수도 있다. 만약 함수 안에서 require문을 통과하지 못한다면 모든 진행 과정을 초기화 한다.

<br>

<!-- ### swap
```
// **** SWAP ****
    // requires the initial amount to have already been sent to the first pair
    function _swap(uint[] memory amounts, address[] memory path, address _to) internal virtual {
        for (uint i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = UniswapV2Library.sortTokens(input, output);
            uint amountOut = amounts[i + 1];
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
            address to = i < path.length - 2 ? UniswapV2Library.pairFor(factory, output, path[i + 2]) : _to;
            IUniswapV2Pair(UniswapV2Library.pairFor(factory, input, output)).swap(
                amount0Out, amount1Out, to, new bytes(0)
            );
        }
    }
```

<br/>

periphery contract는 너무 많은 swap관련 함수를 가지고 있기 때문에, swap에 공통적으로 쓰이는 `_swap`에 대해서 분석하도록 할 것이다.
uniswapV2에서는 token의 pair이 존재하지 않는다면 여러개의 pair들을 걸쳐 token을 swap할 수 있게 해준다. 
1. path는 token들의 주소를 뜻하며, path를 통해 token의 주소값을 받아온다. 
2. token을 library의 sortToken 함수를 통해 정렬한다.
3. amountOut
 -->

<!-- ## 마무리
Router contract에 중요하다고 생각하는 함수를 알아보았다. 사용자가 직접 interaction 하는 부분이기 때문에 잘 알아두어야 한다고 생각한다.
요즘은 분석보다 직접 smart contract를 구축해보는 것이 중요하다고 느낀다. Defi 이외에도 요즘 유행하는 Stepn과 같은 새로운 코드를 분석해보고 직접 운영해보고싶다 -->

## Ref
- https://ethereum.org/en/developers/tutorials/uniswap-v2-annotated-code/#pair-external
- https://docs.uniswap.org/protocol/V2/concepts/core-concepts/swaps
- https://boohyunsik.tistory.com/9?category=922110


```toc

``