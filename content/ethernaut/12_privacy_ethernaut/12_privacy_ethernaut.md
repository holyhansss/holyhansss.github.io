---
emoji: ๐งข
title: (Ethernaut ์ทจ์ฝ์  12) Privacy
date: '2022-01-14 16:24:00'
author: ํ์ฑ์
tags: ethernaut Privacy vulnerability
categories: ์ทจ์ฝ์ ๋ถ์
---


# ๐ Privacy
__Difficulty 8/10__

- ์น๋ฆฌ ์กฐ๊ฑด
- ์ฝ๋ ๋ถ์
- ํ์ด
์์๋ก ์งํ ๋  ๊ฒ์ด๋ค.

- - -

## ์น๋ฆฌ ์กฐ๊ฑด
- contract๋ฅผ unlock ํ๊ธฐ!
- ์ฆ ๋ณ์ locked๋ฅผ false๋ก ๋ง๋ค๊ธฐ
- - -

## ์ฝ๋ ๋ถ์
๋ถ์์ ์ฃผ์์!

```solidity
contract Privacy {
    
    bool public locked = true; // slot 0
    uint256 public ID = block.timestamp; // slot 1
    uint8 private flattening = 10; // slot 2
    uint8 private denomination = 255; // slot 2
    uint16 private awkwardness = uint16(now); // slot 2
    bytes32[3] private data; // slot 3,4,5

    //constructor: set data
    constructor(bytes32[3] memory _data) public {
        data = _data;
    }
    
    // key๋ฅผ ๊ฐ์ง๊ณ  unlock ํ  ์ ์๋ function 
    function unlock(bytes16 _key) public {
        // _key์ bytes16(data[2])์ ๊ฐ์ด ๊ฐ์์ง ํ์ธํ๋ค.
        require(_key == bytes16(data[2]));
        // unlock ํ๋ค.
        locked = false;
    }

    /*
        A bunch of super advanced solidity algorithms...

        ,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`
        .,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,
        *.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^         ,---/V\
        `*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.    ~|__(o.o)
        ^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'  UU  UU
    */
}

```
- - -


## ํ์ด
์ด ๋ฌธ์ ์์ ์ฐ๋ฆฌ์ ๋ชฉํ๋ Privacy contract๋ฅผ locked ๋ณ์๋ฅผ false๋ก ๋ง๋๋ ๊ฒ์ด๋ค. 

[Ethernaut 8 Vault](https://holyhansss.github.io/ethernaut/8_vault_ethernaut/8_vault_ethernaut/)์ ๋น์ทํ๋ค๊ณ  ์๊ฐํ๋ค.

์ด ๋ฌธ์ ๋ฅผ ํ๊ธฐ์ ์ ์ฐ๋ฆฌ๊ฐ ์์์ผ ํ๋ ๊ฒ๋ค์ด ์๋ค.
- Storage
- casting
์ ๋ํด์ ํ์คํ๊ฒ ์์์ผ ํ๋ค.
Vault์์๋ ์ค๋ชํ์ง๋ง ํ๋ฒ ๋ storage์ ๋ํด์ ์ค๋ชํ๊ฒ ๋ค. 
EVM์ Storage๋ 2^256๊ฐ์ ๋ฉ๋ชจ๋ฆฌ ์ฌ๋กฏ์ ๊ฐ์ง๊ณ  ์๋ค. ๊ทธ๋ฆฌ๊ณ  ๊ฐ slot์ 32 bytes( = 256 bits)์ ํฌ๊ธฐ์ด๋ค. ํ๋์ slot์ ์ฌ๋ฌ๊ฐ์ง ๋ณ์๋ฅผ ์ ์ ํ  ์ ์๋ค. ํ์ง๋ง ๋ณ์ ์ ์ธ ์์์ ๋ฐ๋ผ slot ํ ๋น์ด ๋ฌ๋ผ์ง๋ ์ ์ํ์! ์๋์ ์์์ฒ๋ผ uint8, uint256, uint8์ 3๊ฐ๋ฅผ ์ฐจ์งํ์ง๋ง uint8, uint8, uint256์ ์ฌ๋กฏ 2๊ฐ ๋ฐ์ ์ฐจ์งํ์ง ์๋๋ค.  Gas optimization์ ์ํด์๋ ์ฐ๋ฆฌ๊ฐ ๊ผญ ์๊ณ  ์์ด์ผํ  ๋ด์ฉ์ด๋ค!
```solidity
uint8 a // slot 0
uint256 b // slot 1
uint8 c // slot 2
```
```solidity
uint8 a // slot 0
uint8 b // slot 0
uint256 c // slot 1
```
[์ด ๊ธ](https://medium.com/coinmonks/solidity-variables-storage-type-conversions-and-accessing-private-variables-c59b4484c183)์ ์ค๋ช์ด ์ ๋์ด์์ผ๋ ํ๋ฒ ํ์ธํด ๋ณด์! ์ด ๊ธ์์๋ casting์ ๋ํด์๋ ๋ค๋ฃจ๊ณ  ์์ผ๋ ๊ผญ ๋ณด๊ณ  ์ค๋ ๊ฒ์ ์ถ์ฒํ๋ค.

์ฐ๋ฆฌ๋ ์ด ๋ฌธ์ ๋ฅผ ํ๊ธฐ ์ํด web3.eth.getStorageAt() method๋ฅผ ์ฌ์ฉํ๋ค. web3.eth.getStorageAt๋ฅผ ํตํด ์ฐ๋ฆฌ๋ lowlevel์์ storage data๋ฅผ ๋ถ๋ฌ์ฌ ์ ์๋ค.

์ฐ์  console ์ฐฝ์์ ์คํ์ํจ๋ค
ctrl + shift + i๋ฅผ ๋๋ฌ console์ฐฝ์ ํ์ฑํ ์ํค์
```javascript
// locked๊ฐ true๋ก lock๋ ๊ฒ์ ์ ์ ์๋ค.
await contract.locked()

// ์ฝ๋ ๋ถ์์์ ๋ดค๋ฏ์ด data[2]๋ 5 ๋ฒ์งธ slot์ ์ ์ฅ๋์ด์๋ค.
await web3.eth.getStorageAt(instance, 5) // 0x3aa30e05517b3f1490c335bb41be74713b0568225baaad3b56642e103a3b4335

// ์ฐ๋ฆฌ๋ 16bytes ๋ง ํ์ํ๊ธฐ ๋๋ฌธ์ ๋ฐ์ ๋ ์๋ผ ์๋ถ๋ถ๋ง ์ฌ์ฉํ๋ค.
await contract.unlock("0x3aa30e05517b3f1490c335bb41be7471")

// locked๊ฐ false๋ก ๋ฐ๋ ๊ฒ์ ํ์ธ ํ  ์ ์๋ค.
await contract.locked()
```
์ดํ Submit instance๋ฅผ ๋๋ฅด๊ณ  ์กฐ๊ธ ๊ธฐ๋ค๋ฆฌ๋ฉด block์ด mine๋๊ณ , ์๋์ ๊ฐ์ด ๋จ๋ฉฐ ๋ง๋ฌด๋ฆฌ๋๋ค.
```
ูฉ(- ฬฎฬฎฬ-ฬ)?ถ Well done, You have completed this level!!!
```

- - -

## ๋ง๋ฌด๋ฆฌ
๋ธ๋ก์ฒด์ธ์์ ์ ๋ณด๋ ๋ชจ๋์๊ฒ ๊ณต๊ฐ๋๋ค. ๋ชจ๋  ์ฌ๋์ด storage๋ฅผ ์ฝ๊ฒ ํ์ธ ํ  ์ ์๊ธฐ ๋๋ฌธ์ด๋ค. ๋ฏผ๊ฐํ ์ ๋ณด๋ค์ ๋ธ๋ก์ฒด์ธ์ ์ฌ๋ฆฌ์ง ์๋ ๊ฒ์ด ์ข๋ค. ๋ํ ๋ณ์ ์ ์ธ ์์์ ๋ฐ๋ผ ๋๋ก๋ ๋ ๋ง์ ๋น์ฉ๋ฅผ ์ง๋ถํด์ผ ํ  ์๋ ์๊ธฐ ๋๋ฌธ์ ์ฝ๋๋ฅผ ์ ์๋ ํญ์ ์ต์ ํ์ ๋ํด ์๊ฐํ๋ฉฐ ํ์!! 


- - -
## ๊ธฐํ ์ ๋ณด
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
- Ethernaut 8 Vault: https://holyhansss.github.io/ethernaut/8_vault_ethernaut/8_vault_ethernaut/
- Storage & Casting: https://medium.com/coinmonks/solidity-variables-storage-type-conversions-and-accessing-private-variables-c59b4484c183
- Privacy ์ทจ์ฝ์ : https://holyhansss.github.io/vulnerability/private_variable/private_variable/
```toc

```