---
emoji: ๐งข
title: (Ethernaut ์ทจ์ฝ์  15) Naught Coin
date: '2022-01-22 20:04:00'
author: ํ์ฑ์
tags: ethernaut NaughtCoin Naught Coin vulnerability 
categories: ์ทจ์ฝ์ ๋ถ์
---


# ๐ Privacy
__Difficulty 5/10__

- ์น๋ฆฌ ์กฐ๊ฑด
- ์ฝ๋ ๋ถ์
- ํ์ด
์์๋ก ์งํ ๋  ๊ฒ์ด๋ค.

- - -

## ์น๋ฆฌ ์กฐ๊ฑด
- ๋ด๊ฐ ๊ฐ์ง๊ณ  ์๋ Naught Coin์ ์์ก์ 0์ผ๋ก ๋ง๋ค๊ธฐ

- - -

## ์ฝ๋ ๋ถ์
๋ถ์์ ์ฃผ์์!
์ฃผ์์ค ์์ด๋ก ์ฐ์ฌ์๋ ๊ฒ์ ๊ธฐ์กด ์ฝ๋์ ํฌํจ๋์ด์๋ ๊ฒ์ด๋ค:)!
๋ ์์ธํ ์ค๋ช์ ์ฝ๋ ๋ค์ ๋์จ๋ค.

```solidity
 contract NaughtCoin is ERC20 {

    // string public constant name = 'NaughtCoin';
    // string public constant symbol = '0x0';
    // uint public constant decimals = 18;
    uint public timeLock = now + 10 * 365 days;
    uint256 public INITIAL_SUPPLY;
    address public player;

    // constructor: NaughtCoin์ด๋ผ๋ ํ ํฐ์ ๋ง๋ ๋ค.
    constructor(address _player) 
    ERC20('NaughtCoin', '0x0')
    public {
        player = _player;
        // ์ด ๊ณต๊ธ๋ ์ค์ 
        INITIAL_SUPPLY = 1000000 * (10**uint256(decimals()));
        // _totalSupply = INITIAL_SUPPLY;
        // _balances[player] = INITIAL_SUPPLY;
        // ์ด ๊ณต๊ธ๋๋งํผ player์๊ฒ ๊ณต๊ธ
        _mint(player, INITIAL_SUPPLY);
        emit Transfer(address(0), player, INITIAL_SUPPLY);
    }
    

    // openzeppline์ ERC20.transfer()์ overrideํ function
    function transfer(address _to, uint256 _value) override public lockTokens returns(bool) {
        super.transfer(_to, _value);
    }

    // 10๋๊ฐ timelock์ด ๊ฑธ๋ ค์๋ค. ๊ทธ๋์ player๋ 10๋๊ฐ token์ transferํ์ง ๋ชปํ๋ค.
    // Prevent the initial owner from transferring tokens until the timelock has passed
    modifier lockTokens() {
        if (msg.sender == player) {
        require(now > timeLock);
        _;
        } else {
        _;
        }
    } 
} 


```
- - -


## ํ์ด

NaughtCoin์ ERC20 ํ ํฐ์ด๋ฉฐ ๋น์ ์ ์ด๋ฏธ ๋ชจ๋  ํ ํฐ์ ๋ณด์ ํ๊ณ  ์์ต๋๋ค. ์ค์ํ ๊ฑด 10๋์ ํ์ ๊ธฐ๊ฐ์ด ์ง๋์ผ๋ง ์๋ํ  ์ ์๋ค๋ ๊ฒ๋๋ค. ์ด๋ป๊ฒ ํ๋ฉด ์์ ๋กญ๊ฒ ๋ณด๋ผ ์ ์๋์ง ์์๋ด ์ฃผ์ค ์ ์๋์? ํ ํฐ ์์ก์ 0์ผ๋ก ์ค์ ํ์ฌ ์ด ์์ค์ ์๋ฃํ์ญ์์ค.


์ด ๋ฌธ์ ์์ ์ฐ๋ฆฌ์ ๋ชฉํ๋ ์ฐ๋ฆฌ๊ฐ ๊ฐ์ง๊ณ  ์๋ token์ ๊ฐ์๋ฅผ 0์ผ๋ก ๋ง๋๋ ๊ฒ์ด๋ค. ํ์ง๋ง ์ ์ฝ๋๋ฅผ ๋ณด๋ฉด ์ ์ ์๋ค์ํผ transfer์ 10๋๊ฐ ์ฌ์ฉํ  ์ ์๋ค. ๊ทธ๋ ๋ค๋ฉด ์ด๋ป๊ฒ ํ์ด์ผ ํ ๊น?

ERC20 token์ deploy ํด๋ดค๋ค๋ฉด transfer์ด์ธ์ ํ ํฐ์ ์ฃผ๊ณ ๋ฐ์ ์ ์๋ ๋ฐฉ๋ฒ์ด ์๋ค๋ ๊ฒ์ ์ ๊ฒ์ด๋ค.

ERC20์ ๊ดํด์ ์ ๋ชจ๋ฅธ๋ค๋ฉด ์ด ๋ฌธ์ ๋ฅผ ํ ์ ์๋ค! [์ฌ๊ธฐ์](https://eips.ethereum.org/EIPS/eip-20) ERC20์ ๊ดํด ๋ฐฐ์ฐ๊ณ  ์ค์.

- [openzeppline ERC20 contract](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/9b3710465583284b8c4c5d2245749246bb2e0094/contracts/token/ERC20/ERC20.sol)

ERC20์ transfer์ด ์ธ์ transferFrom์ด๋ผ๋ ํจ์๊ฐ ์กด์ฌํ๋ค. transferFrom ํจ์๋ ๋ค๋ฅธ address์๊ฒ approve ๋ฐ์ ๋งํผ์ ํ ํฐ์ ๋ณด๋ผ ์ ์๊ฒ๋๋ค. ์ฆ A๊ฐ B์๊ฒ ์ํ๋ ์๋งํผ approve, B๊ฐ ์์ ์๊ฒ approve๋ ๋งํผ ๋๊ตฌ์๊ฒ๋  token์ ๋ณด๋ผ ์ ์๊ฒ๋๋ค. 

์ฐ๋ฆฌ๊ฐ ์ด ๋ฌธ์ ๋ฅผ ํ ์ ์๋ ์๋๋ฆฌ์ค๋ ์ด๋ ๋ค.
1. player account์ด์ธ์ account๋ฅผ ํ๋ ๋ ์์ฑํ๋ค. ์์ฑํ account๋ฅผ B๋ผ๊ณ  ์นญํ๊ฒ ๋ค.
2. player์ธ ์ฐ๋ฆฌ๊ฐ ์ฐ๋ฆฌ ์์ ์๊ฒ ์ ์ฒด token์ ์๋งํผ์ approve ํด์ค๋ค.
3. ์ฐ๋ฆฌ๋ approve๋ฐ์ ์๋งํผ transferFromํจ์๋ฅผ ์ฌ์ฉํด B์ ์ด์ฒดํ๋ค. 
4. player์ token balance๋ 0์ด ๋๋ค.

๊ทธ๋ ๋ค๋ฉด ํธ๋ ๋ฐฉ๋ฒ์ ๋ณด๋ฉฐ ์ข ๋ ์ดํดํด๋ณด์
ํ๊ธฐ ์  metamask๋ฅผ ํตํด account๋ฅผ ํ๋ ๋ ์์ฑํ๋ค.

์ฐ์  console ์ฐฝ์์ ์คํ์ํจ๋ค
ctrl + shift + i๋ฅผ ๋๋ฌ console์ฐฝ์ ํ์ฑํ ์ํค์
```javascript
// ๋จผ์  ์ฐ๋ฆฌ๊ฐ ์ด์ฑํด์ผํ  token์ ์์ ํ์ํด์ผํ๋ค.
let playerBalance = await contract.balanceOf(player)
playerBalance.toString(); // "1000000000000000000000000"

// player ์์ ์๊ฒ ํ ํฐ ์ด์ฒด ๊ถํ์ ๋ถ์ฌํ๋ค.
await contract.approve(player,"1000000000000000000000000")

// B account์๊ฒ ๋ชจ๋  token์ ์ด์ฒดํ๋ค.
await contract.transferFrom(player, "0x690A732BA98fcfe72bDedE2085816BCF6498058d", "1000000000000000000000000")

```

์ดํ Submit instance๋ฅผ ๋๋ฅด๊ณ  ์กฐ๊ธ ๊ธฐ๋ค๋ฆฌ๋ฉด block์ด mine๋๊ณ , ์๋์ ๊ฐ์ด ๋จ๋ฉฐ ๋ง๋ฌด๋ฆฌ๋๋ค.
```
ูฉ(- ฬฎฬฎฬ-ฬ)?ถ Well done, You have completed this level!!!
```

- - -

## ๋ง๋ฌด๋ฆฌ
์ด๋ฒ ๋ฌธ์ ์์๋ ERC20 ํ ํฐ์ ๋ํ ๊ฐ๋์ ๋ค๋ฃจ๋ ๊ฒ ๊ฐ๋ค. ERC20์ ๋ํด์ ์ ์ดํดํ๊ณ  ์๋ค๋ฉด ์ฝ๊ฒ ํ ์ ์๋ ๋ฌธ์ ์๋ค๊ณ  ์๊ฐํ๋ค. ๋ฌธ์ ๋ฅผ ํ๋ฉด ๋์ค๋ ์ค๋ช์์๋ contract๋ฅผ ๋ง๋  ์ฌ๋์ ERC20์ ๋ํด ์ ๋ชจ๋ฅด๋ ์ฌ๋์ผ ๊ฒ์ด๋ผ๊ณ  ๋งํ๋ค. ERC20์ Defi์ ์ฌ๋ฌ ์๋น์ค์์ ์ฌ์ฉํ๊ณ  ์๋ __ํ์ฅฐ__ ์ด๊ธฐ ๋๋ฌธ์ ํ์ ์ ์ผ๋ก ์์ธํ ์์์ผํ๋ค๊ณ  ์๊ฐํ๋ค. ์์ผ๋ก ์ฌ๋ฌ contract๋ฅผ ๋ถ์ํด๋ณด๋ฉด์ ๋ ๊น์ ์ดํด๋ฅผ ํด๋ณด์^^! 

- - -
## ๊ธฐํ ์ ๋ณด
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
- ์ฐธ๊ณ  ์๋ฃ: https://medium.com/coinmonks/ethernaut-lvl-14-gatekeeper-2-walkthrough-how-contracts-initialize-and-how-to-do-bitwise-ddac8ad4f0fd

```toc

```