---
emoji: ๐งข
title: EVM๊ณผ Transaction
date: '2021-12-13 02:26:00'
author: ํ์ฑ์
tags: EVM Ethereum Virtual Machine EthereumVirtualMachine
categories: EVM
---


# ๐ EVM(Ethereum Virtual Machine)? ๊ทธ๊ฒ ๋ญ๋ฐ?
solidity๋ก smart contract๋ฅผ ์์ฑํ๋ฉด์ __gas optimization__ ๋ฑ์ ๋ํด ๊น์ด ์๊ธฐ์ํด EVM์ ๊ณต๋ถ๋ฅผ ์์ํ์๋ค! 

## 1. Virtual Machine?
๋จผ์  Virtual Machine(๊ฐ์ ๋จธ์ )์ด๋ ๋ญ๊น?   
๊ฐ์๋จธ์ ์ด๋ ๋ฌผ๋ฆฌ์ ์ผ๋ก ์กด์ฌํ๋ ์ปดํจํฐ๋ ์๋์ง๋ง ์ค์  ์ปดํจํฐ์ฒ๋ผ ์๋ํ๋ ์ํํธ์จ์ด์ด๋ค. ๊ฐ์๋จธ์ ์ ์ฌ์ฉํ๊ฒ ๋๋ฉด ํ๋์ ์ปดํจํฐ๋ก 2๊ฐ์ง ์ด์์ ์ด์์ฒด์ ๋ฅผ ์คํ ํ  ์ ์๊ณ , ์ํธ๊ฐ ์ถฉ๋์ ์์จ ์ ์๋ค.   
๋๋ ์ฐ๋ถํฌ๋ฅผ ์ฌ์ฉํ์๋๋ฐ, ์ญ์ ์ฌ์ฉํ๋ฉด์ ๋ฐฐ์ฐ๋๊ฒ ์ต๊ณ ์ธ ๊ฒ ๊ฐ๋ค. 

## 2. EVM(Ethereum Virtual Machine)
์ด๋๋ฆฌ์ ๋ธ๋๋ค์ด ๊ณต์ ํ๋ ํ๋์ ๊ฐ์ ๋จธ์ ์ด๋ค. ๋ชจ๋๊ฐ ๋ค ๊ฐ์ด ์ฌ์ฉํ๊ธฐ์ "World Computer"์ด๋ผ๊ณ ๋ ๋ถ๋ฆฐ๋ค. ๊ทธ๋ฆฌ๊ณ  ์ค๋งํธ ์ปจํธ๋ํธ์ ๋ฐฐํฌ์ ์คํ์ ์ฒ๋ฆฌํ๋ ์ด๋๋ฆฌ์์ ์ผ๋ถ์ด๋ค. EVM์์ ๋ฐฐํฌ๋ ์ฝ๋๋ ๋ค๋ฅธ ํ๋ก์ธ์ค๋ค๊ณผ ์์ ํ ๊ฒฉ๋ฆฌ๋์ด์๋ค.EVM์ ์ญํ ์ ๋ฐ์ดํฐ์ ๋ณํ, ๋ณ๊ฒฝํ๋ ๋ฐ์ดํฐ์ ์ถฉ๋๊ณผ ๋ณด์์ ๋ด๋นํ๋ค. 

## 3. Accounts๋?
๋๊ฐ์ง ์ข๋ฅ์ ๊ณ์ (Accounts)๊ฐ ์กด์ฌํ๋ค. ๋ ๊ณ์ ์๋ ๋ชจ๋ ether๋ฅผ ๋ณด๊ดํ  ์ ์๋ค. Account๋ ์ข๋ฅ์ ๋ถ๋ฌธํ๊ณ  4๊ฐ์ง๋ก ๊ตฌ์ฑ๋์ด์๋ค.
1. Nonce
2. Balance
3. storageRoot
4. CodeHash

- EOA(Externally Owned Accounts)   
EOA๋ Private Key๋ฅผ ํตํด ๊ด๋ฆฌ๋๋ค. ๊ทธ๋ ๊ธฐ ๋๋ฌธ์ private key๊ฐ ์๋ค๋ฉด EOA๋ฅผ ์ธ์ ๋ ๋ค์ ์์ฑํ  ์ ์๊ณ , ์๋ช์ ํตํด transaction์ ๋ณด๋ผ ์ ์๋ค.

- CA(Contract Account)   
CA๋ smart contract๋ฅผ ํตํด ๊ด๋ฆฌ๋๋ค. smart wallet์ด๋ผ๊ณ ๋ ๋ถ๋ฆฌ์ด๋ค. smart contract๋ก ๊ด๋ฆฌ๋๊ธฐ ๋๋ฌธ์ EOA ๋๋ ๋ค๋ฅธ contract์์ ๋ณด๋ด๋ transaction๊ณผ ๋ฉ์ธ์ง๋ฅผ ํตํด ์คํ๋  ์ ์๋ค. ๊ฒฐ๊ตญ ๋ชจ๋  transaction์ EOA๋ก๋ถํฐ ์์๋๋ค.  

๋๊ฐ์ง ๊ณ์ ์ด ์กด์ฌํ์ง๋ง EVM์์๋ ๋์ผํ๊ฒ ์ทจ๊ธํ๋ค.

## 4. Transaction์ด๋?
์ด๋๋ฆฌ์์์ Transcation์ด๋ ์๋ช๋ __๋ฐ์ดํฐ ํํค์ง์ด๋ค.__ ๋ฐ์ดํฐ ํํค์ง์๋ nonce, to, signature, value, data(optional), gaslimit, gasprice์ ๋ํ ์ ๋ณด ๋ฑ์ด ์ ์ฅ๋์ด์๋ค.   
ether๋ฅผ ๊ณ์ ๋ค์๊ฒ ๋ณด๋ด๊ฑฐ๋, smart contract ๋ฐฐํฌํ๊ฑฐ๋ ํจ์๋ฅผ ํธ์ถํ ๋ ์ฌ์ฉ๋๋ค. 
contract creation์ transaction์์๋ `To` field๊ฐ ํ์์๊ณ , `data` field์๋ ๊ณ์ฝ ์ํ๋ฅผ ์ค์ ํ๊ณ  ๊ณ์ฝ์ ๋ฐฐํฌํ๊ธฐ ์ํ ์ด๊ธฐ ์ฝ๋๊ฐ ๋ค์ด๊ฐ๋ค.

## 5. Transaction์ ๊ตฌ์กฐ
- Nonce: ํด๋น account์ transaction์ ๊ฐ์, 0๋ถํฐ ์์(์ด์ค์ง๋ถ ๋ฐฉ์ง)
- Gas Price: transaction์ ๋ณด๋ธ ์ฌ๋์ด ์ง๋ถํ๋ gas์ ๊ฐ๊ฒฉ(in wei)
- Gas Limit: transaction์์์ ์ต๋๋ก ์ฌ์ฉํ  ์ ์๋ gas์ ์
- To: transaction์ ๋ณด๋ด๋ address(์ฃผ์)
- Value: ๋ณด๋ด๋ ๊ฐ(in wei)
- Data: address์ ๋ณด๋ด๋ ๋ฐ์ดํฐ
- v,r,s: ํธ๋์ญ์ ์๋ช์ ๊ตฌ์ฑ ์์

## 6. Message๋?
๋ฉ์ธ์ง๋ Transaction๊ณผ __EOA๊ฐ ์๋ contract๊ฐ__ ์์ฑํ๋ค๋ ๊ฒ ์ธ์ ๊ต์ฅํ ๋น์ทํ๋ค. ํฐ ์ฐจ์ด์ ์ Gas Limit๋ฅผ ์ค์ ํ  ํ์๊ฐ ์๋ค๋ ๊ฒ์ด๋ค. EOA๊ฐ ์ฒ์ Transaction์ ๋ณด๋ผ๋ ์ด๋ฏธ ์ค์ ํ๊ธฐ ๋๋ฌธ์ด๋ค. ๊ฒฐ๊ตญ EOA๊ฐ Transaction์ ๋ณด๋ด์ง ์๋๋ค๋ฉด Message๋ ์์ฑ๋  ์ ์๋ค.

## 7. Gas๋?
Gas๋ ์ ํด์ ธ์๋ ์ฐ์ฐ ๋น์ฉ์ด๋ค. ์ฆ ๋ง์ ์ฐ์ฐ์ ํ  ์๋ก ๋ง์ gas๊ฐ ์๋ชจ๋๋ค. ์ด ์์๋ฃ๋ __Gas Price * Gas์ ์ด ์__ ์ผ๋ก ๊ฒฐ์ ๋๋ค. ๋ง์ฝ ํด์ปค์นด DOS ๊ณต๊ฒฉ์ ์๋ํ๋ค๋ฉด transaction์ ๋น๋กํด gas๋ฅผ ์ง๋ถํด์ผํ๋ค.
๊ทธ๋ ๊ธฐ ๋๋ฌธ์ Gas๋ ์ด๋๋ฆฌ์์ ๊ผญ ํ์ํ ์์์ค ํ๋๋ผ๊ณ  ์๊ฐํ๋ค. Gas limit๊ณผ gas price๋ฅผ ํตํด anti-Dos๋ชจ๋ธ์ ์ ์ง์ํฌ ์ ์๋ค. 


---
์ฒ์์ผ๋ก ๋ด๊ฐ ๊ณต๋ถํ ๋ด์ฉ์ ๊ธ๋ก ๋ด์๋ณด์๋ค. ์๋ง ์ค๋ช์ด ๋ถ์กฑํ ๋ถ๋ถ์ด ๋ง์์ผ๋ฆฌ๋ผ๊ณ  ์๊ฐํ๋ค. ์์ผ๋ก ๋ง์ ๊ธ์ ์ฐ๋ฉฐ ๋ ๊ณต๋ถํ๊ณ  ๊ณต๋ถํ ๊ฒ์ ์ ์ค๋ชํ๊ณ  ์ถ๋ค.

```toc

```