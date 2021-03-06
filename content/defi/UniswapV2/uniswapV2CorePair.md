---
emoji: ๐งข
title: Uniswap V2 Core Pair Contract ๋ถ์
date: '2022-04-27 21:42:00'
author: ํ์ฑ์
tags: blog Defi Uniswap decentralizedExchange Dao Blockchain
categories: Defi
---


# ๐ Uniswap V2 Core Pair
์ ๋ฒ์ฃผ์ [Uniswap Factory Contract](https://holyhansss.github.io/defi/uniswapV2CoreFactory/) ๋ถ์์ ํด๋ดค๋ค. Factory๋ ์๊ฐ๋ณด๋ค๋ ์ฝ๋๊ฐ ์ฌ์ ์ง๋ง Pair์ ์กฐ๊ธ ๋ ์ด๋ ค์ ๋ณด์ธ๋ค! 

Pair Contact๋ [์ฌ๊ธฐ์](https://github.com/Uniswap/v2-core/blob/master/contracts/UniswapV2Pair.sol) ํ์ธํ  ์ ์๊ณ  Pair ๋ถ์ ์  [Factory Contract ๋ถ์](https://holyhansss.github.io/defi/uniswapV2CoreFactory/)์ ๋ณด๊ณ ์ค๋ฉด ์ข์ ๊ฒ ๊ฐ๋ค.

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

์ด Interface์๋ UniswapERC20 token์ interface๋ ํฌํจ๋์ด ์๋ ๊ฒ์ผ๋ก ๋ณด์ธ๋ค. 
์ค์  repository๋ฅผ ํ์ธํด ๋ณด๋ฉด UniswapERC20 token์ Interface๋ ๋ฐ๋ก ์กด์ฌํ๋ค.
Pair contract๋ Factory contract๋ฅผ ํตํด pool ๋ณ๋ก ๋ฐฐํฌ๋๋ค. ๊ทธ๋ฆฌ๊ณ  ๊ทธ ์์์ swap์ด ์ผ์ด๋๋ ๊ฒ์ผ๋ก ๋ณด์ธ๋ค.
์ง์  ์ฝ๋๋ฅผ ๋ ๋ด์ผํ  ๊ฒ ๊ฐ์ง๋ง Uniswap์ด๋ผ๋ ์ด๋ฆ์์ ์ ์ ์๋ฏ์ด `swap` ์ด๋ผ๋ ํจ์๊ฐ ์ด contract์์ ๊ฐ์ฅ ์ค์ํด ๋ณด์ธ๋ค. `swap`์ ์ค์ฌ์ผ๋ก Pair ์ฝ๋๋ฅผ ๋ฏ์ด๋ณด๋ฉฐ ์์๋ณด์!

## Uniswap V2 Factory ์ฝ๋ ๋ถ์
github์์ ํ์ธํด๋ณด๋ฉด ์ฝ๋๋ 200 ์ค์ด ๋๊ธฐ ๋๋ฌธ์ ์ฃผ์์ ํตํด ๊ฐ๋จํ ํ์ฉ์ฑ์ ๋จ๊ธฐ๊ณ , ์ค์ํ ํจ์๋ ์ฝ๋ ๋ค์ ๋ฐ๋ก ๋ค๋ฃจ๋๋ก ํ  ๊ฒ์ด๋ค.

### ๋ณ์
์ฐ์  ์ ์ธ๋ ๋ณ์๋ถํฐ ์ดํด๋ณด์. ๋ณ์ ์ ์ธ๋ถํฐ ๋ฐฐ์ธ ๊ฒ์ด ์๋นํ๋ค!
<br>

```solidity
    // uint์ SafeMath ์ ์ฉ
    using SafeMath  for uint;
    // uint224์ UQ112x112 ์ ์ฉ (UQ112๋ ๋ถ์ ๊ณ์ฐ์ ํ ๋ ์ฐ์ธ๋ค. ๋์ค์ Library๋ฅผ ํ์ธํด ๋ณด์!)
    using UQ112x112 for uint224;
    
    // liquidity์ ์ต์๊ฐ์ 10**3์ผ๋ก ์ ์
    uint public constant MINIMUM_LIQUIDITY = 10**3;
    // transfer์ Method ID๋ฅผ SELECTOR ๋ณ์์ ์ค์ 
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes('transfer(address,uint256)')));

    // factory contract์ address
    address public factory;
    // token0์ address
    address public token0;
    // token1์ address
    address public token1;

    // reserve0, reserve1, blockTimestampLast๊ฐ ํ๋์ storage slot์ ์ ์ธ๋์ด์๋ค.
    uint112 private reserve0;           // uses single storage slot, accessible via getReserves
    uint112 private reserve1;           // uses single storage slot, accessible via getReserves
    uint32  private blockTimestampLast; // uses single storage slot, accessible via getReserves

    uint public price0CumulativeLast;
    uint public price1CumulativeLast;
    uint public kLast; // reserve0 * reserve1, as of immediately after the most recent liquidity event

    uint private unlocked = 1;
```
<br>

๋๋ฌด ๋ง์ ๋ณ์๊ฐ ์ ์ธ๋์ด ์๊ธฐ ๋๋ฌธ์ ์ค์ํ๊ฒ ์๊ฐ๋๋ ๋ถ๋ถ๋ง ์ค๋ช์ ํ  ๊ฒ์ด๋ค.
1. ์ฐ์  ๋์ ๋๋ ๊ฒ์ `using UQ112x112 for uint224` ์๋ค. library๋ฅผ ํ์ธํด๋ณด๋ overflow๋ฅผ ๋ฐฉ์ง ๋ฐ ๋ถ์ ๊ณ์ฐ์ ํ๊ธฐ ์ํด ๋ง๋ค์ด์ง library๋ก ๋ณด์ธ๋ค.
2. ๋๋ฒ์งธ๋ก `reserve0` `reserve1` `blockTimestampLast`๋ฅผ ํ๋์ storage slot์ ๋ฃ์ด๋ ๊ฒ์ด๋ค. 
    - ์ฌ๊ธฐ์ reserve0์ reserve1์ uint112, blockTimestampLast๋ uint32๋ก ์ ์ธ๋์ด์๋ค. storage๋ ํ slot๋น 256 bits(32 bytes)์์ผ๋ก ์ธ ๋ณ์๋ฅผ ๋ชจ๋ ํ๋์ slot์ ๋ฃ์ ์ ์๋ค. ์ด๊ฒ์ gas๋ฅผ saveํ๊ธฐ ์ํ ๊ฒ์ผ๋ก ๋ณด์ธ๋ค. 
    - ๋ํผ์์ด์ง๋ง storage๋ฅผ ๋ถ๋ฌ์ฌ๋ gas๊ฐ ์ฌ์ฉ๋๋๋ฐ, ์ฌ๋ฌ slot์ ๋๋์ด ์ ์ฅํ๋ฉด slot๋ง๋ค gas๋ฅผ ๋ ์ง๋ถํด์ผํ๋ค. ๊ทธ๋์ ํ๋์ slot์ ์ ์ฅํด ํ๋ฒ์ ๋ถ๋ฌ์ฌ ์ ์๊ฒ ํ ๊ฒ๋ gas๊ฐ๊ฒฉ์ ์ค์ด๊ธฐ ์ํ ํ๋์ ๋ฐฉ๋ฒ์ธ ๊ฒ ๊ฐ๋ค.
3. MINIMUM_LIQUIDITY: ์ ๋ 0์ผ๋ก division ๋๋ ๊ฒฝ์ฐ๋ฅผ ๋ง๊ธฐ์ํด ์ต์ Liquidity๋ฅผ ์ง์ ํ๋ค

๋๋จธ์ง ๋ณ์๋ ์ฃผ์ ์ฝ๋๋ฅผ ๋ถ์ํ๋ฉด์ ๋ณด๋๋กํ์! 

<br>

### ํจ์
์ฃผ์ ํจ์๋ฅผ ์ค๋ชํ๋ฉด์ ์ธ๋ถ์ ์ผ๋ก call๋๋ ํจ๊ป ์ค๋ชํ  ์์ ์ด๋ค.
์ฃผ์ ํจ์๋ `mint`, `burn`, `swap` ๊ทธ ์ธ ํจ์๋ ์ด ํจ์๋ค์ ์ํด ์กด์ฌํ๋ค๊ณ  ๋ณผ ์ ์๋ค.

#### mint

```solidity
function mint(address to) external lock returns (uint liquidity) {
    // getReserves()๋ฅผ ํตํด reserve0๊ณผ reserve1์ ๊ฐ์ ธ์จ๋ค.
    (uint112 _reserve0, uint112 _reserve1,) = getReserves(); // gas savings
    // contract์ ์๋ token์ balance๋ฅผ ๋ถ๋ฌ์จ๋ค.
    uint balance0 = IERC20(token0).balanceOf(address(this));
    uint balance1 = IERC20(token1).balanceOf(address(this));
    // amount ๊ฐ์ ๊ฐ token balance - reserve ๋ก ๊ณ์ฐํ๋ค.
    uint amount0 = balance0.sub(_reserve0);
    uint amount1 = balance1.sub(_reserve1);

    // feeOn์ ํตํด fee์ ์ฌ๋ถ๋ฅผ ๊ฐ์ ธ์จ๋ค.
    bool feeOn = _mintFee(_reserve0, _reserve1);
    uint _totalSupply = totalSupply; // gas savings, must be defined here since totalSupply can update in _mintFee
    // ์ฒซ๋ฒ์งธ ๋น์ totalSupply๊ฐ 0์ผ๋ ์ต์ totalsupply ๊ฐ์ 10**3์ผ๋ก ์ค์ ํ๋ค. -> ๋งจ ์ฒ์ ํ๋ฒ๋ฐ์ ์คํ ์๋จ
    if (_totalSupply == 0) {
        liquidity = Math.sqrt(amount0.mul(amount1)).sub(MINIMUM_LIQUIDITY);
        // lp token 10**3๊ฐ ๋งํผ mint
       _mint(address(0), MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens
    } else {
        // min ๊ฐ์ผ๋ก liquidity ์ค์ 
        liquidity = Math.min(amount0.mul(_totalSupply) / _reserve0, amount1.mul(_totalSupply) / _reserve1);
    }
    // liquidity๊ฐ์ด 0๋ณด๋ค ํฐ์ง ํ์ธ
    require(liquidity > 0, 'UniswapV2: INSUFFICIENT_LIQUIDITY_MINTED');
    // liquidity ๊ฐ ๋งํผ address to์ mint๋ฅผ ์งํํ๋ค.
    _mint(to, liquidity);

    // reserve ๊ฐ update
    _update(balance0, balance1, _reserve0, _reserve1);
    if (feeOn) kLast = uint(reserve0).mul(reserve1); // reserve0 and reserve1 are up-to-date
    emit Mint(msg.sender, amount0, amount1);
}
```
<br>

mint ํจ์๋ LP token์ mint ํด์ฃผ๋ ํจ์์ด๋ค. ์ฆ, periphery contract๋ฅผ ํตํด ์ ๋์ฑ ํ์ ์ ๋์ฑ์ ๊ณต๊ธํ ๋ ํธ์ถ๋๋ค. getRerserve()๋ฅผ ํตํด ๋ reserve๊ฐ์ ๋ฐ์์จ๋ค.

mint์๋ ๋๊ฐ์ง ๊ฒฝ์ฐ๊ฐ ์กด์ฌํ๋ค. 
1. `totalSupply`๊ฐ 0์๋
2. `totalSupply`๊ฐ 0์ด ์๋๋

`totalSupply`๊ฐ 0์ด๋ผ๋ฉด liquidity๊ฐ์ ์์๋ก ๊ตฌํ๊ณ , 1000๊ฐ์ ํ ํฐ์ zero address์ mintํ๋ค. ์ฐ์  ์์๋ก liquidity ๊ฐ์ ์์๋ก ๊ตฌํ๋ ์ด์ ๋ ์ฒ์์ ๋ ํ ํฐ์ ์๋์ ์ธ ๊ฐ์น๋ฅผ ์์ง ๋ชปํ๊ธฐ ๋๋ฌธ์ด๋ผ๊ณ  docs์ ์จ์์๋ค. 

1000๊ฐ์ token์ zero address์ mintํ๋ ์ด์ ๋ zero division์ ๋ง๊ธฐ ์ํด์์ด๋ค. zero address๊ฐ ์์ ํ๊ณ  ์๋ค๋ฉด token์ lockํ  ์ ์๋ค. 

`totalSupply`๊ฐ 0์ด ์๋๋ผ๋ฉด, ์ฆ ์ if ๋ฌธ์ด ์ด๋ฏธ ์คํ ๋์๋ค๋ฉด liquidity์ ๊ฐ์ ๋ค๋ฅธ ๋ฐฉ์์ผ๋ก ๊ณ์ฐํ๋ค. ์ด๋, ์ฐ๋ฆฌ๋ ํ ํฐ๊ฐ์ exchange rate์ ์๊ณ  ์๊ธฐ ๋๋ฌธ์, ์ ๋์ฑ ์ ๊ณต์๊ฐ ๋์ผํ ๊ฐ์น์ ํ ํฐ์ ์์นํ  ์ ์๋๋ก ํ๋ค. 

`liquidity`์ ๊ณ์ฐ ๊ฐ์ด 0๋ณด๋ค ํฌ๋ค๋ฉด `to`์๊ฒ LP ํ ํฐ์ ๋ฐํํ๋ค. ์ดํ `_update()`์ ํตํด reserve0๊ณผ reserve1์ ๊ฐ์ ์๋ฐ์ดํธํ๋ค.
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

`_update()`๋ ํ ํฐ์ด deposit ๋๊ฑฐ๋ withdraw ๋  ๋ ๋ถ๋ฆฌ๋ internal ํจ์์ด๋ค. require๋ฌธ์ ํตํด balance๋ค์ overflow๋ฅผ ์ฒดํฌํ๋ค. ๊ทธ๋ฆฌ๊ณ  `reserve`์ ๊ฐ๋ค๊ณผ `blockTimestampLast`๊ฐ์ ์๋ก์ด ๊ฐ์ผ๋ก update ํด์ค๋ค. 

์ฌ๊ธฐ์ ์๊ธฐ๋ ๊ถ๊ธ์ฆ์ด ์๋ค. `price0CumulativeLast` ๊ฐ์ ๋๋์ฒด ์ด๋์ ์ฐ์ด๋์ง ๋ชจ๋ฅด๊ฒ ๋ค. Defi Math๋ฅผ ๊ณต๋ถํ๋ฉด์ TWAP(Time weighted average price)์ ๋ํด์ ๋ฐฐ์ ๊ณ , `price0CumulativeLast`์ `price1CumulativeLast` ๊ฐ์ ์ ์ฉ๋ ๊ฒ๋ ํ์ธํ  ์ ์์๋ค. ํ์ง๋ง ์ฝ๋์์๋ `price0CumulativeLast`์ `price1CumulativeLast`๋ฅผ ์ฌ์ฉํ๋ ๊ณณ์ ์ฐพ์ ์ ์์ด ์์ํ๋ค. (Defi math๋ ๋ค๋ฅธ ํฌ์คํธ์์ ๋ค๋ฃฐ ์์ ์๋๋น)

์๋ง๋ ๋ค๋ฅธ ๊ณณ์์ uniswap pair์์ ํ ํฐ ๊ฐ๊ฒฉ์ Oracle๋ก ์ ๊ณตํ๊ธฐ ์ํด์ ์ธ๊ฒ ๊ฐ๋ค. ๋์ค์ ๋ค๋ฅธ ์ฝ๋๋ค์ ๋ณด๋ค๋ฉด ์ฌ์ฉ์ฑ์ ํ์ธ ํ  ์ ์์ ๊ฒ์ผ๋ก ๋ณด์ธ๋ค. ์๋ง front-end์์๋ ์ฌ์ฉ๋  ์๋ ์์ ๊ฒ ๊ฐ๋ค.
> [UniswapV2 docs](https://docs.uniswap.org/protocol/V2/concepts/core-concepts/oracles)๋ฅผ ์ฐพ์๋ณด๋ oracle์ ์ํด ๋ง๋ค์ด์ง ๊ฒ์ด ๋ง๋ค!ใใ Defi oracle ๊ด๋ จํด์ ๋ฌธ์ ๊ฐ ๋ง์์ง๋ง UniswapV2์์ ์ฝ๊ฐ์ด๋๋ง ํด๊ฒฐํ ๊ฒ์ผ๋ก ๋ณด์ธ๋ค. 

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

`burn()`์ liquidity๋ฅผ ํด์ง(withdraw) ํ ๋ ์ฌ์ฉ๋๋ function์ด๋ค. burn์ periphery contract์ ํตํด ํธ์ถ๋๋ค. ์ด๋, pro-rata distribution์ ์ฌ์ฉํด address์ ๋๋ ค์ค ๊ฐ์ ๊ตฌํ๋ค. (liquidity * balance / totalSupply๋ก ๊ณ์ฐํ๋ค.) ๋ง์ฝ amount์ ๊ฐ์ด ๋ชจ๋ 0๋ณด๋ค ํฌ๋ค๋ฉด amount๋งํผ์ token์ ์ด์ฒดํ๋ค. ์ดํ liquidity๋ burnํ๋ค. ๊ทธ๋ฆฌ๊ณ  reserve๊ฐ์ updateํด์ค๋ค. 

์ด๋ ๋ณด๋ฉด `// gas saving` ์ด๋ผ๋ ์ฃผ์์ ๋ง์ด ๋ณผ ์ ์์๋ค. ๊ณ์ฐ์ ํ ๋ storage val์ ์ฌ๋ฌ๋ฒ ์ฌ์ฉํด์ผ ํ๋๋ฐ ๋ง์ฝ ๊ณ์ storage val ์ฌ์ฉํ๋ฉด gas fee๊ฐ ์ฌ๋ผ๊ฐ๋ค. ๊ทธ๋์ storage val์ local val์ ์ ์ฅํด local val์ ๊ณ์ํด์ ์ฌ์ฉํ๋๋ก ํ๊ฒ์ด๋ค. 

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

`swap()`๋ periphery contract๋ฅผ ํตํด ํธ์ถ๋๋ค.
1. output์ ๊ฐ์ด 0๋ณด๋ค ํฐ์ง ํ์ธํ๋ค. 
2. reserve์ ๊ฐ๋ณด๋ค amountOut์ ๊ฐ์ด ์์์ง ํ์ธํ๋ค. < ๋น์ฐํ token ๋ณด์ ๋๋ณด๋ค amountOut์ ๊ฐ์ด ์ ์ด์ผํ๋ค.
3. to์ ๊ฐ์ด token0, ๋๋ token1์ ์ฃผ์ ๊ฐ์ด ์๋ ๊ฒ์ ํ์ธํ๋ค.
4. amountOut์ ๊ฐ๋งํผ to์๊ฒ ์ก๊ธํ๋ค.
5. ์ดํ ๋ค์ด์จ ํ ํฐ์ ๊ฐ์๋ฅผ ์ฌ์ฉํด amountIn์ ๊ฐ์ ๊ณ์ฐํ๋ค.
6. balance์ ๊ฐ์ ๋ค์ ๊ตฌํํ๋ค.
7. adjust๋ balance์ ๊ฐ๊ณผ reserve์ ๊ฐ์ ๊ฐ๊ณผ ๋น๊ตํ๋ค.
8. reserve์ ๊ฐ์ updateํ๋ค.

๋ด๊ฐ ์ฌ๊ธฐ์ ๊ถ๊ธํ๋ ์ ์ swap์ ํ๋์ ํ ํฐ์ ๋ค๋ฅธ ํ ํฐ์ผ๋ก ๊ตํํ๋ ๊ฒ์ธ๋ฐ, ๋ token์ `_safeTransfer`์ ์ฌ์ฉํ๋์ง ์๋ค. ๊ถ๊ธ์ฆ์ ํด์ํ๊ธฐ ์ํด ์ ์ periphery contract๋ฅผ ํ์ธํด ๋ณด์๋ค. periphery contract์์ `swap()`๋ฅผ callํ  ๋๋ ๋์ค์ ํ๋์ ๊ฐ์ด ๋ฌด์กฐ๊ป 0์ด ๋๊ฒ ๋ง๋ค์ด ๋์๋ค. ์ด ๋ถ๋ถ์ periphery contract์ ์ดํด๋ณผ๋ ๋ ์์ธํ ๋ค์ฌ๋ค๋ณด์!

amountIn์ ๊ฐ์ ๊ตฌํ ๋๋ ํ์ฌ token balance์ ์ค์ ๋ reserve๊ฐ + amountOut๊ฐ์ ๋น๊ตํด amountIn์ ๊ฐ์ ๊ตฌํ๋ค. 

## ๋ง๋ฌด๋ฆฌ
๋๋ฆ๋๋ก ๋ถ์์ ์งํํด๋ดค์ง๋ง ์์ง ๋ถ์กฑํ ์ ์ด ๋ง์ ๊ฒ ๊ฐ๋ค๊ณ  ๋๋๋ค. ๋ ๋ง์ defi contract๋ฅผ ๋ถ์ํ๋ค๋ณด๋ฉด ์ ์ฒด์ ์ธ ๊ตฌ์กฐ ๋ฐ ์ฝ๋๊ฐ ์์ฑ๋ ์ด์ ๋ฅผ ํ์ํ๋๋ฐ ๋์์ด ๋  ๊ฒ ๊ฐ๋ค. ๊ทธ๋ฆฌ๊ณ  ์ด๋ฒ๊ธ์ ๊ตฌ์กฐ์ ์ผ๋ก ์กฐ๊ธ ๋ถ์กฑํ ๊ฒ ๊ฐ์ ๋ ๊ตฌ์กฐ๊ฐ ์กํ์๋ ๊ธ์ ์ฐ๊ธฐ์ํด ๋ธ๋ ฅ ํ  ๊ฒ์ด๋ค. ๋ค์์ผ๋ก๋ periphery contract์ UniswapV2 Defi Math์ ๋ํด์ ๋ค๋ฃฐ ์์ ์ด๋ค. Defi๋ฅผ ๊ณต๋ถํ๋ ๋ชจ๋ ํ์ดํ! 

## Ref
- https://ethereum.org/en/developers/tutorials/uniswap-v2-annotated-code/#pair-external
- https://docs.uniswap.org/protocol/V2/concepts/core-concepts/swaps
- https://boohyunsik.tistory.com/9?category=922110


```toc

``