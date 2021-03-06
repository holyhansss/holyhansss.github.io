---
emoji: ๐งข
title: (Ethernaut ์ทจ์ฝ์  22) Dex
date: '2022-02-10 11:17:00'
author: ํ์ฑ์
tags: ethernaut Dex vulnerability 22
categories: ์ทจ์ฝ์ ๋ถ์
---


# ๐ 1. Dex
__Difficulty 3/10__

- ์น๋ฆฌ ์กฐ๊ฑด
- ์ฝ๋ ๋ถ์
- ํ์ด
์์๋ก ์งํ ๋  ๊ฒ์ด๋ค.

- - -

## ์น๋ฆฌ ์กฐ๊ฑด
- Dex Contract ํดํน ํ ํ ํฐ ์ค ํ๋๋ฅผ ๋ชจ๋ ์์ง(0์ผ๋ก ๋ง๋ค๊ธฐ)ํ๋ ๊ฒ์ด๋ค. 


- - -
## ๋ค์ด๊ฐ๊ธฐ ์ 
์ด๋ฒ ๋ฌธ์ ๋ DEX์ ERC20์ ๋ํ ์ง์์ด ์๋ค๋ฉด ํ์ ์๋ ๋ฌธ์ ์ด๋ค.
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

//  importing openzeppelin ERC20 contracts and safe math
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@openzeppelin/contracts/math/SafeMath.sol';

contract Dex  {
    using SafeMath for uint;
    // token 1์ address
    address public token1;
    // token 2์ address
    address public token2;
    
    // token1๊ณผ token2์ address๋ฅผ ์ง์ ํ๋ค.
    constructor(address _token1, address _token2) public {
        token1 = _token1;
        token2 = _token2;
    }

    // ๊ฐ์ฅ ์ค์ํ swap function
    function swap(address from, address to, uint amount) public {
        // token1๊ณผ token2์ด์ธ์ ๋ค๋ฅธ address๊ฐ from ๋๋ to๊ฐ ๋๋ฉด revertํ๋ค.
        require((from == token1 && to == token2) || (from == token2 && to == token1), "Invalid tokens");
        // ๋ฐ๊พธ๋ ค๋(from) token์ balance๊ฐ amount์ด์ ์์ด์ผํ๋ค.
        require(IERC20(from).balanceOf(msg.sender) >= amount, "Not enough to swap");
        // token a์ token b์ ๊ตํ ๋น์จ์ get_swap_price()๋ฅผ ์ฌ์ฉํด ๊ณ์ฐํ๋ค
        uint swap_amount = get_swap_price(from, to, amount);
        // ๋ด ํ ํฐ์ Dex contract์ ๋ณด๋ธ๋ค.
        IERC20(from).transferFrom(msg.sender, address(this), amount);
        // Dex contract๊ฐ ERC20 token์ ๋ณด๋ผ ์ ์๋๋ก approveํ๋ค.
        IERC20(to).approve(address(this), swap_amount);
        // approveํ ๋งํผ์ ํ ํฐ์ msg.sender์๊ฒ ๋ณด๋ด๋ค.
        IERC20(to).transferFrom(address(this), msg.sender, swap_amount);
    }

    // token1๊ณผ token2์ด์ธ์ liquidity pool์ ์์ฑํ  ์ ์๋ค.
    function add_liquidity(address token_address, uint amount) public{
        IERC20(token_address).transferFrom(msg.sender, address(this), amount);
    }

    // swap์์ ๊ตํ ๋น์จ์ ๊ณ์ฐํ๊ธฐ ์ํด ์ฌ์ฉํ๋ function์ด๋ค. 
    // ๊ณ์ฐ ๋ฐฉ๋ฒ์ ์ด๋ฒ ๋ฌธ์ ์์ ์์ฒญ ์ค์ํ๋ค!!
    function get_swap_price(address from, address to, uint amount) public view returns(uint){
        return((amount * IERC20(to).balanceOf(address(this)))/IERC20(from).balanceOf(address(this)));
    }

    // spender๊ฐ amount๋งํผ์ token์ ๋ํด์ approve๋๋ค.
    function approve(address spender, uint amount) public {
        SwappableToken(token1).approve(spender, amount);
        SwappableToken(token2).approve(spender, amount);
    }

    // token๋ณ account๊ฐ ๊ฐ์ง๊ณ  ์๋ ๊ฐ์๋ฅผ ํ์ธ ํ  ์ ์๋ค.
    function balanceOf(address token, address account) public view returns (uint){
        return IERC20(token).balanceOf(account);
    }
}      

// SwappableToken contract
contract SwappableToken is ERC20 {
    // ๊ณ์๋งํผ mintingํ๋ค.
    constructor(string memory name, string memory symbol, uint initialSupply) public ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
}

```
- - -

## ํ์ด
์ด๋ฒ ๋ฌธ์ ์์ ์ฐ๋ฆฌ๋ Dex๊ฐ ๊ฐ์ง ๋ชจ๋  ํ ํฐ์ ์๋ชจํ๋ฉด ๋๋ค.
๊ทธ๋ ๋ค๋ฉด ์ด๋ป๊ฒ ์๋ชจํ  ์ ์์๊น? ํํธ๋ฅผ ๋ณด์
- Token์ ๊ฐ๊ฒฉ์ด ์ด๋ป๊ฒ ๊ณ์ฐ๋๋๊ฐ? How is the price of the token calculated?
- Swap์ด ์ด๋ป๊ฒ ์๋ํ๋๊ฐ? How does the swap method work?
- ERC20์ ๊ฑฐ๋๋ฅผ ์ด๋ป๊ฒ approveํ๋๊ฐ? How do you approve a transaction of an ERC20?

์์์ ๋ง ํ๋ฏ์ด ERC20๊ณผ Swap์ ์๋๋ฐฉ์์ ์ดํดํด์ผ ์ด ๋ฌธ์ ๋ฅผ ํ ์ ์๋ค.
ํํธ๋ฅผ ํ ๋๋ก ํ์ด๋ณด์.

๋จผ์  ๋ฌธ์ ์์ Swap function์ด ์ด๋ป๊ฒ ์คํ๋๋์ง ํ์ธํด๋ณด์
swap์ ๋ค์๊ณผ ๊ฐ์ ๊ณผ์ ์ ํตํด ์คํ๋๋ค.
1. from๊ณผ to๊ฐ token1๊ณผ 2์ธ์ง ํ์ธํ๋ค.
2. msg.sender์ from token์ ์์ก(balance)๋ฅผ ํ์ธํ๋ค.
3. get_swap_price๋ฅผ ํตํด swapํ  ํ ํฐ์ ๊ฐ์๋ฅผ ์ฐพ๋๋ค
4. swapํ  from token์ dex์ ๋ณด๋ธ๋ค.
5. dex contract ์์ ์ด transferFrom์ ์ฌ์ฉํ  ์ ์๋๋ก amount๋งํผ์ approveํ๋ค.
5. amount๋งํผ์ ํ ํฐ์ msg.sender์๊ฒ ๋ณด๋ด์ค๋ค. 

๊ทธ๋ ๋ค๋ฉด 3๋ฒ์ ์ฌ์ฉ๋๋ `get_swap_price()`๋ ์ด๋ค ํจ์์ผ๊น?
`get_swap_price()`๋ ์๋ฅผ ๋ค์ด token A๋ฅผ 10๊ฐ๋ฅผ swapํ๋ค๊ณ  ํ์๋ token B๋ฅผ ๋ช๊ฐ ๋ฐ์ ์ ์๋์ง ๊ณ์ฐํ๋ ํจ์์ด๋ฐ.
์ด ํจ์์ ๊ณ์ฐ ๊ณต์์ ๋ค์๊ณผ ๊ฐ๋ค `(amount * IERC20(to).balanceOf(address(this)))/IERC20(from).balanceOf(address(this))`

๋ฐ๋ก ์ด ๊ณต์์ ๋ฌธ์ ๊ฐ ๋ณด์ธ๋ค. ์ต๋๊ธ์ก์ผ๋ก ๊ณ์ swapํ๊ฒ๋๋ฉด ๋ด๊ฐ ๊ฐ์ง๊ณ  ์๋ Token์ ๊ฐ์๊ฐ ๋๊ณ  DEX๊ฐ ๊ฐ์ง๊ณ  ์๋ ํ ํฐ์ ๊ฐ์๋ฅผ 0์ผ๋ก ๋ง๋ค ์ ์๋ค.
๋ง์ฝ DEX contract์ ํ ํฐ ์์ก์ด 0์ด ๋๋ฉด ์ธ์ ๋ 0 ๋๋ error๋ฅผ returnํ  ๊ฒ์ด๋ค.

๋จผ์  swap์์๋ transferFrom์ ์ฌ์ฉํ๊ธฐ ๋๋ฌธ์ approve๋ฅผ ํด์ฃผ์ด์ผํ๋ค. 

์ฐ๋ฆฌ๋ DEX contract์ approve๋ฅผ ์ฌ์ฉํด token 1๊ณผ token 2์ ๋ํด ํ๋ฒ์ approveํด์ค ์ ์๋ค.

```js
// contract๋ฅผ approve ํด์ฃผ๊ธฐ
await contract.approve(instance, "1000000000000000000000")
```
<br/>

์ด์  swapํ๊ธฐ ์  ๋ชจ๋  ์ค๋น๊ฐ ์๋ฃ๋์๋ค. ์ด์  swap์ ํ๋ฉด์ DEX์ token์ค ํ๋์ value๋ฅผ 0์ผ๋ก ๋ง๋ค์ด๋ณด์.

1. ์ฒ์์ผ๋ก ๋ด๊ฐ ๊ฐ์ง๊ณ  ์๋ token 2 ๋ชจ๋(10)๋ฅผ token 1๋ก swapํ์๋ค. 

    ![swap1.png](./swap1.png )

2. token 2 20๊ฐ ๋ชจ๋ token 1๋ก swapํ๊ธฐ

    ![swap2.png](./swap2.png )

swap์ ๊ณ์ํ๋ค๋ณด๋ฉด ๋ด๊ฐ ๊ฐ์ง๊ณ  ์๋ token์ ๊ฐ์๋ ์ ์  ๋ง์์ง๊ณ  DEX๊ฐ ๊ฐ์ง๊ณ  ์๋ Token์ ๊ฐ์๋ ์ค์ด๋๋ ๊ฒ์ ๋ณผ ์ ์์ ๊ฒ์ด๋ค.

3. 3๋ฒ์งธ swap

    ![swap3.png](./swap3.png )
4. 4๋ฒ์งธ swap

    ![swap4.png](./swap4.png )

5. 5๋ฒ์งธ swap

    ![swap5.png](./swap5.png )


๋ง์ง๋ง swap์ ์ฐ๋ฆฌ๊ฐ ๊ฐ์ง๊ณ  ์๋ token 65๊ฐ๋ฅผ ์ ๋ถ swapํ๊ฒ๋๋ฉด Dex๊ฐ ๊ฐ์ง๊ณ  ์๋ token์ ์๋ณด๋ค ๋ง์์ง์ผ๋ก 45๊ฐ๋ง swapํ๋ค. ์ฌ๊ธฐ์ 45๋ผ๋ ์ซ์๋ `(amount * IERC20(to).balanceOf(address(this)))/IERC20(from).balanceOf(address(this))` ์์์ balance๋ค์ ๋ฃ์ด ๊ณ์ฐํ  ์ ์๋ค. 

6. ![lastswap_value_45](./lastswap_value_45.png)

๋ง์ง๋ง์ผ๋ก contract์ token balance๋ฅผ ํ์ธํด๋ณด๋ฉด ๋์ค ํ๋๊ฐ 0์ผ๋ก ๋์ด์๋ ๊ฒ์ ๋ณผ ์ ์์ ๊ฒ์ด๋ค.

```js
// ๋ ์ค ํ๋๊ฐ 0์ด๋ฉด ๋๋ค.
await contract.balanceOf(await contract.token1(), instance).then(x => x.toString())
await contract.balanceOf(await contract.token2(), instance).then(x => x.toString())

```

token์ค ํ๋์ balance๊ฐ 0์ด ๋ ๊ฒ์ ํ์ธํ๋ค๋ฉด ethernaut์ผ๋ก ๋์์ Submit instance๋ฅผ ๋๋ฅด๊ณ  ์กฐ๊ธ ๊ธฐ๋ค๋ฆฌ๋ฉด block์ด mine๋๊ณ , ์๋์ ๊ฐ์ด ๋จ๋ฉฐ ๋ง๋ฌด๋ฆฌ๋๋ค.
```
ูฉ(- ฬฎฬฎฬ-ฬ)?ถ Well done, You have completed this level!!!
```
- - -

## ๋ง๋ฌด๋ฆฌ
์ด๋ฒ ๋ฌธ์ ์ ๊ฐ์ ๊ฒฝ์ฐ๋ ์๋ณธ์ด ๋ง๋ค๋ฉด ์ฝ๊ฒ ๊ฐ๊ฒฉ์ ์กฐ์ํ  ์ ์๊ฒ๋๋ค. ๊ทธ๋ ๊ธฐ ๋๋ฌธ์ ๋๋ถ๋ถ oracle์ ์ฌ์ฉํด ์ ๋ณด๋ฅผ ์ป์ด์จ๋ค. ๋๋ Chainlink Oracle์ ๋ํ ๊ฐ๋์ ์์ง๋ง ์ง์  ์ฌ์ฉํด๋ณธ ์ ์ด ์๋ค. ๋ฌธ์ ๋ฅผ ํ๋ฉด kovan testnet์์ ์ฌ์ฉํ  ์ ์๋ ์ฝ๋๋ฅผ ์ฃผ๋๋ฐ, ์ด๋ oracle์ ์ง์ ์ ์ผ๋ก ์ฌ์ฉํด๋ณด๋ ์ฝ๋์ด๋ค. ๋์ค์ contract๋ฅผ ์งค๋ ๊ทธ๋ฆฌ๊ณ  uniswap์ ๋ถ์ํ  ๋๋ฅผ ๋๋นํด ๋ฏธ๋ฆฌ ๊ณต๋ถํด๋๋ฉด ์ข์ ๊ฒ ๊ฐ๋ค. 

์ด๋ฒ ๋ฌธ์ ๋ฅผ ํ๊ธฐ์  Uniswap V2 ์ฝ๋๋ฅผ ๋ถ์ํด๋ดค๋๋ฐ, ์์ง ๋ด๊ฐ ๋ถ์กฑํ๊ตฌ๋ใ ใ  ๋ผ๋ ๊ฒ์ ๋๋ ์ ์์๋ค. Ethernaut๊ฐ ๋๋ ํ ์ฌ๋ฌ๊ฐ์ง ์ฌ๋ฌ ์ข๋ฅ์ contract๋ฅผ ๋ถ์ํ๋ฉฐ ๊ธฐ์ ์ ๊พธ์คํ ์ฐ๋งํด๊ฐ์ผ๊ฒ ๋ค!

- - -
## REF
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
- Ethernaut 22 DEX walkthrough: https://medium.com/@this_post/ethernaut-22-dex-modified-version-writeups-4330c33a0743

```toc

```