---
emoji: 🧢
title: Uniswap V2 Core Pair Contract 분석
date: '2022-04-27 21:42:00'
author: 한성원
tags: blog Defi Uniswap decentralizedExchange Dao Blockchain
categories: Defi
---


# 👋 Uniswap V2 Core Pair
저번주에 [Uniswap Factory Contact](https://holyhansss.github.io/defi/uniswapV2CoreFactory/) 분석을 해봤다. Factory는 생각보다는 코드가 쉬웠지만 Pair은 조금 더 어려워 보인다! 

Pair Contact는 [여기서](https://github.com/Uniswap/v2-core/blob/master/contracts/UniswapV2Pair.sol) 확인할 수 있고 Pair 분석 전 [Factory Contract 분석](https://holyhansss.github.io/defi/uniswapV2CoreFactory/)을 보고오면 좋을 것 같다.

## Uniswap V2 Pair Interface

```solidity
interface IUniswapV2Pair {
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external pure returns (string memory);
    function symbol() external pure returns (string memory);
    function decimals() external pure returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);

    function DOMAIN_SEPARATOR() external view returns (bytes32);
    function PERMIT_TYPEHASH() external pure returns (bytes32);
    function nonces(address owner) external view returns (uint);

    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external;

    event Mint(address indexed sender, uint amount0, uint amount1);
    event Burn(address indexed sender, uint amount0, uint amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint amount0In,
        uint amount1In,
        uint amount0Out,
        uint amount1Out,
        address indexed to
    );
    event Sync(uint112 reserve0, uint112 reserve1);

    function MINIMUM_LIQUIDITY() external pure returns (uint);
    function factory() external view returns (address);
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function price0CumulativeLast() external view returns (uint);
    function price1CumulativeLast() external view returns (uint);
    function kLast() external view returns (uint);

    function mint(address to) external returns (uint liquidity);
    function burn(address to) external returns (uint amount0, uint amount1);
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function skim(address to) external;
    function sync() external;

    function initialize(address, address) external;
}
```
<br>

이 Interface에는 UniswapERC20 token의 interface도 포함되어 있는 것으로 보인다. 
실제 repository를 확인해 보면 UniswapERC20 token의 Interface도 따로 존재한다.
Pair contract는 Factory contract를 통해 pool 별로 배포된다. 그리고 그 안에서 swap이 일어나는 것으로 보인다.
직접 코드를 더 봐야할 것 같지만 Uniswap이라는 이름에서 알 수 있듯이 `swap` 이라는 함수가 이 contract에서 가장 중요해 보인다. `swap`을 중심으로 Pair 코드를 뜯어보며 알아보자!

## Uniswap V2 Factory 코드 분석
github에서 확인해보면 코드는 200 줄이 넘기 때문에 주석을 통해 간단한 활용성을 남기고, 중요한 함수는 코드 뒤에 따로 다루도록 할 것이다.

### 변수
우선 선언된 변수부터 살펴보자. 변수 선언부터 배울 것이 상당하다!
<br>

```solidity
    // uint에 SafeMath 적용
    using SafeMath  for uint;
    // uint224에 UQ112x112 적용 (UQ112는 분수 계산을 할때 쓰인다. 나중에 Library를 확인해 보자!)
    using UQ112x112 for uint224;
    
    // liquidity의 최솟값을 10**3으로 정의
    uint public constant MINIMUM_LIQUIDITY = 10**3;
    // transfer의 Method ID를 SELECTOR 변수에 설정
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));

    // factory contract의 address
    address public factory;
    // token0의 address
    address public token0;
    // token1의 address
    address public token1;

    // reserve0, reserve1, blockTimestampLast가 하나의 storage slot에 선언되어있다.
    uint112 private reserve0;           // uses single storage slot, accessible via getReserves
    uint112 private reserve1;           // uses single storage slot, accessible via getReserves
    uint32  private blockTimestampLast; // uses single storage slot, accessible via getReserves

    uint public price0CumulativeLast;
    uint public price1CumulativeLast;
    uint public kLast; // reserve0 * reserve1, as of immediately after the most recent liquidity event

    uint private unlocked = 1;
```
<br>

너무 많은 변수가 선언되어 있기 때문에 중요하게 생각되는 부분만 설명을 할 것이다.
1. 우선 눈에 띄는 것은 `using UQ112x112 for uint224` 였다. library를 확인해보니 overflow를 방지 및 분수 계산을 하기 위해 만들어진 library로 보인다.
2. 두번째로 `reserve0` `reserve1` `blockTimestampLast`를 하나의 storage slot에 넣어둔 것이다. 
    - 여기서 reserve0와 reserve1은 uint112, blockTimestampLast는 uint32로 선언되어있다. storage는 한 slot당 256 bits(32 bytes)임으로 세 변수를 모두 하나의 slot에 넣을 수 있다. 이것은 gas를 save하기 위한 것으로 보인다. 
    - 뇌피셜이지만 storage를 불러올때 gas가 사용되는데, 여러 slot에 나누어 저장하면 slot마다 gas를 더 지불해야한다. 그래서 하나의 slot에 저장해 한번에 불러올 수 있게 한 것도 gas가격을 줄이기 위한 하나의 방법인 것 같다.
3. MINIMUM_LIQUIDITY: 절대 0으로 division 되는 경우를 막기위해 최소 Liquidity를 지정했다

나머지 변수는 주요 코드를 분석하면서 보도록하자! 

<br>

### 함수
주요 함수를 설명하면서 세부적으로 call되는 함께 설명할 예정이다.
주요 함수는 `mint`, `burn`, `swap` 그 외 함수는 이 함수들을 위해 존재한다고 볼 수 있다.

#### mint

```solidity
function mint(address to) external lock returns (uint liquidity) {
    // getReserves()를 통해 reserve0과 reserve1을 가져온다.
    (uint112 _reserve0, uint112 _reserve1,) = getReserves(); // gas savings
    // contract에 있는 token의 balance를 불러온다.
    uint balance0 = IERC20(token0).balanceOf(address(this));
    uint balance1 = IERC20(token1).balanceOf(address(this));
    // amount 값을 각 token balance - reserve 로 계산한다.
    uint amount0 = balance0.sub(_reserve0);
    uint amount1 = balance1.sub(_reserve1);

    // feeOn을 통해 fee의 여부를 가져온다.
    bool feeOn = _mintFee(_reserve0, _reserve1);
    uint _totalSupply = totalSupply; // gas savings, must be defined here since totalSupply can update in _mintFee
    // 첫번째 당시 totalSupply가 0일때 최소 totalsupply 값을 10**3으로 설정한다. -> 맨 처음 한번밖에 실행 안됨
    if (_totalSupply == 0) {
        liquidity = Math.sqrt(amount0.mul(amount1)).sub(MINIMUM_LIQUIDITY);
        // lp token 10**3개 만큼 mint
       _mint(address(0), MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens
    } else {
        // min 값으로 liquidity 설정
        liquidity = Math.min(amount0.mul(_totalSupply) / _reserve0, amount1.mul(_totalSupply) / _reserve1);
    }
    // liquidity값이 0보다 큰지 확인
    require(liquidity > 0, 'UniswapV2: INSUFFICIENT_LIQUIDITY_MINTED');
    // liquidity 값 만큼 address to에 mint를 진행한다.
    _mint(to, liquidity);

    // reserve 값 update
    _update(balance0, balance1, _reserve0, _reserve1);
    if (feeOn) kLast = uint(reserve0).mul(reserve1); // reserve0 and reserve1 are up-to-date
    emit Mint(msg.sender, amount0, amount1);
}
```
<br>

mint 함수는 LP token을 mint 해주는 함수이다. 즉, periphery contract를 통해 유동성 풀에 유동성을 공급할때 호출된다. getRerserve()를 통해 두 reserve값을 받아온다.

mint에는 두가지 경우가 존재한다. 
1. `totalSupply`가 0을때
2. `totalSupply`가 0이 아닐때

`totalSupply`가 0이라면 liquidity값을 임의로 구하고, 1000개의 토큰을 zero address에 mint한다. 우선 임의로 liquidity 값을 임의로 구하는 이유는 처음에 두 토큰의 상대적인 가치를 알지 못하기 때문이라고 docs에 써있었다. 

1000개의 token을 zero address에 mint하는 이유는 zero division을 막기 위해서이다. zero address가 소유하고 있다면 token을 lock할 수 있다. 

`totalSupply`가 0이 아니라면, 즉 위 if 문이 이미 실행 되었다면 liquidity의 값을 다른 방식으로 계산한다. 이때, 우리는 토큰간의 exchange rate을 알고 있기 때문에, 유동성 제공자가 동일한 가치의 토큰을 예치할 수 있도록 한다. 

`liquidity`의 계산 값이 0보다 크다면 `to`에게 LP 토큰을 발행한다. 이후 `_update()`을 통해 reserve0과 reserve1의 값을 업데이트한다.
<br>

```solidity
    // update reserves and, on the first call per block, price accumulators
    function _update(uint balance0, uint balance1, uint112 _reserve0, uint112 _reserve1) private {
        require(balance0 <= uint112(-1) && balance1 <= uint112(-1), 'UniswapV2: OVERFLOW');
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired
        if (timeElapsed > 0 && _reserve0 != 0 && _reserve1 != 0) {
            // * never overflows, and + overflow is desired
            price0CumulativeLast += uint(UQ112x112.encode(_reserve1).uqdiv(_reserve0)) * timeElapsed;
            price1CumulativeLast += uint(UQ112x112.encode(_reserve0).uqdiv(_reserve1)) * timeElapsed;
        }
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
        blockTimestampLast = blockTimestamp;
        emit Sync(reserve0, reserve1);
    }
```
<br>

`_update()`는 토큰이 deposit 되거나 withdraw 될 때 불리는 internal 함수이다. require문을 통해 balance들의 overflow를 체크한다. 그리고 `reserve`의 값들과 `blockTimestampLast`값을 새로운 값으로 update 해준다. 

여기서 생기는 궁금증이 있다. `price0CumulativeLast` 값은 도대체 어디에 쓰이는지 모르겠다. Defi Math를 공부하면서 TWAP(Time weighted average price)에 대해서 배웠고, `price0CumulativeLast`와 `price1CumulativeLast` 값에 적용된 것도 확인할 수 있었다. 하지만 코드에서는 `price0CumulativeLast`와 `price1CumulativeLast`를 사용하는 곳을 찾을 수 없어 의아했다. (Defi math도 다른 포스트에서 다룰 예정입니당)

아마도 다른 곳에서 uniswap pair안의 토큰 가격을 Oracle로 제공하기 위해서 인것 같다. 나중에 다른 코드들을 보다면 사용성을 확인 할 수 있을 것으로 보인다. 아마 front-end에서도 사용될 수도 있을 것 같다.
> [UniswapV2 docs](https://docs.uniswap.org/protocol/V2/concepts/core-concepts/oracles)를 찾아보니 oracle을 위해 만들어진 것이 맞다!ㅎㅎ Defi oracle 관련해서 문제가 많았지만 UniswapV2에서 약간이나마 해결한 것으로 보인다. 

#### burn

```solidity
    function burn(address to) external lock returns (uint amount0, uint amount1) {
        (uint112 _reserve0, uint112 _reserve1,) = getReserves(); // gas savings
        address _token0 = token0;                                // gas savings
        address _token1 = token1;                                // gas savings
        uint balance0 = IERC20(_token0).balanceOf(address(this));
        uint balance1 = IERC20(_token1).balanceOf(address(this));
        uint liquidity = balanceOf[address(this)];

        bool feeOn = _mintFee(_reserve0, _reserve1);
        uint _totalSupply = totalSupply; // gas savings, must be defined here since totalSupply can update in _mintFee
        amount0 = liquidity.mul(balance0) / _totalSupply; // using balances ensures pro-rata distribution
        amount1 = liquidity.mul(balance1) / _totalSupply; // using balances ensures pro-rata distribution
        require(amount0 > 0 && amount1 > 0, 'UniswapV2: INSUFFICIENT_LIQUIDITY_BURNED');
        _burn(address(this), liquidity);
        _safeTransfer(_token0, to, amount0);
        _safeTransfer(_token1, to, amount1);
        balance0 = IERC20(_token0).balanceOf(address(this));
        balance1 = IERC20(_token1).balanceOf(address(this));

        _update(balance0, balance1, _reserve0, _reserve1);
        if (feeOn) kLast = uint(reserve0).mul(reserve1); // reserve0 and reserve1 are up-to-date
        emit Burn(msg.sender, amount0, amount1, to);
    }
```

`burn()`은 liquidity를 해지(withdraw) 할때 사용되는 function이다. burn은 periphery contract을 통해 호출된다. 이때, pro-rata distribution을 사용해 address에 돌려줄 값을 구한다. (liquidity * balance / totalSupply로 계산한다.) 만약 amount의 값이 모두 0보다 크다면 amount만큼의 token을 이체한다. 이후 liquidity도 burn한다. 그리고 reserve값을 update해준다. 

이때 보면 `// gas saving` 이라는 주석을 많이 볼 수 있었다. 계산을 할때 storage val을 여러번 사용해야 하는데 만약 계속 storage val 사용하면 gas fee가 올라간다. 그래서 storage val을 local val에 저장해 local val을 계속해서 사용하도록 한것이다. 

#### swap
```solidity
    // this low-level function should be called from a contract which performs important safety checks
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external lock {
        require(amount0Out > 0 || amount1Out > 0, 'UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT');
        (uint112 _reserve0, uint112 _reserve1,) = getReserves(); // gas savings
        require(amount0Out < _reserve0 && amount1Out < _reserve1, 'UniswapV2: INSUFFICIENT_LIQUIDITY');

        uint balance0;
        uint balance1;
        { // scope for _token{0,1}, avoids stack too deep errors
        address _token0 = token0;
        address _token1 = token1;
        require(to != _token0 && to != _token1, 'UniswapV2: INVALID_TO');
        if (amount0Out > 0) _safeTransfer(_token0, to, amount0Out); // optimistically transfer tokens
        if (amount1Out > 0) _safeTransfer(_token1, to, amount1Out); // optimistically transfer tokens
        if (data.length > 0) IUniswapV2Callee(to).uniswapV2Call(msg.sender, amount0Out, amount1Out, data);
        balance0 = IERC20(_token0).balanceOf(address(this));
        balance1 = IERC20(_token1).balanceOf(address(this));
        }
        uint amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
        uint amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
        require(amount0In > 0 || amount1In > 0, 'UniswapV2: INSUFFICIENT_INPUT_AMOUNT');
        { // scope for reserve{0,1} Adjusted, avoids stack too deep errors
        uint balance0Adjusted = balance0.mul(1000).sub(amount0In.mul(3));
        uint balance1Adjusted = balance1.mul(1000).sub(amount1In.mul(3));
        require(balance0Adjusted.mul(balance1Adjusted) >= uint(_reserve0).mul(_reserve1).mul(1000**2), 'UniswapV2: K');
        }

        _update(balance0, balance1, _reserve0, _reserve1);
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }
```
<br>

`swap()`도 periphery contract를 통해 호출된다.
1. output의 값이 0보다 큰지 확인한다. 
2. reserve의 값보다 amountOut의 값이 작은지 확인한다. < 당연히 token 보유량보다 amountOut의 값이 적어야한다.
3. to의 값이 token0, 또는 token1의 주소 값이 아닌 것을 확인한다.
4. amountOut의 값만큼 to에게 송금한다.
5. 이후 들어온 토큰의 개수를 사용해 amountIn의 값을 계산한다.
6. balance의 값을 다시 구한한다.
7. adjust된 balance의 값과 reserve의 값의 값과 비교한다.
8. reserve의 값을 update한다.

내가 여기서 궁금했던 점은 swap은 하나의 토큰을 다른 토큰으로 교환하는 것인데, 두 token에 `_safeTransfer`을 사용하는지 였다. 궁금증을 해소하기 위해 잠시 periphery contract를 확인해 보았다. periphery contract에서 `swap()`를 call할 때는 둘중의 하나의 값이 무조껀 0이 되게 만들어 놓았다. 이 부분은 periphery contract을 살펴볼때 더 자세히 들여다보자!

amountIn의 값을 구할때는 현재 token balance와 설정된 reserve값 + amountOut값을 비교해 amountIn의 값을 구한다. 

## 마무리
나름대로 분석을 진행해봤지만 아직 부족한 점이 많은 것 같다고 느낀다. 더 많은 defi contract를 분석하다보면 전체적인 구조 및 코드가 작성된 이유를 파악하는데 도움이 될 것 같다. 그리고 이번글은 구조적으로 조금 부족한 것 같아 더 구조가 잡혀있는 글을 쓰기위해 노력 할 것이다. 다음으로는 periphery contract와 UniswapV2 Defi Math에 대해서 다룰 예정이다. Defi를 공부하는 모두 화이팅! 

## Ref
- https://ethereum.org/en/developers/tutorials/uniswap-v2-annotated-code/#pair-external
- https://docs.uniswap.org/protocol/V2/concepts/core-concepts/swaps
- https://boohyunsik.tistory.com/9?category=922110

```toc

``