---
emoji: ๐งข
title: (Ethernaut ์ทจ์ฝ์  17) Recovery
date: '2022-01-25 14:32:00'
author: ํ์ฑ์
tags: ethernaut Recovery vulnerability 
categories: ์ทจ์ฝ์ ๋ถ์
---


# ๐ 1. Recovery
__Difficulty 6/10__

- ์น๋ฆฌ ์กฐ๊ฑด
- ์ฝ๋ ๋ถ์
- ํ์ด
์์๋ก ์งํ ๋  ๊ฒ์ด๋ค.

- - -

## ์น๋ฆฌ ์กฐ๊ฑด
- ์์ด๋ฒ๋ฆฐ CA์ ์ฃผ์๋ฅผ ์ฐพ๊ณ  CA๊ฐ ๊ฐ์ง๊ณ  ์๋ Ether ์ ๋ถ ํ์ํ๊ธฐ

- - -

## ์ฝ๋ ๋ถ์
์ด๋ฏธ ์ ์ค๋ช๋์ด์์ด ๊ฐ๋จํ ๋ถ์๋ง ์ฃผ์์ ์ ์๋ค!

```solidity
contract Recovery {

    //generate tokens
    function generateToken(string memory _name, uint256 _initialSupply) public {
        new SimpleToken(_name, msg.sender, _initialSupply);
    
    }
}

contract SimpleToken {

    using SafeMath for uint256;
    // public variables
    string public name;
    mapping (address => uint) public balances;

    // constructor
    constructor(string memory _name, address _creator, uint256 _initialSupply) public {
        name = _name;
        balances[_creator] = _initialSupply;
    }

    // collect ether in return for tokens
    receive() external payable {
        balances[msg.sender] = msg.value.mul(10);
    }

    // allow transfers of tokens
    function transfer(address _to, uint _amount) public { 
        require(balances[msg.sender] >= _amount);
        balances[msg.sender] = balances[msg.sender].sub(_amount);
        balances[_to] = _amount;
    }

    // clean up after ourselves
    function destroy(address payable _to) public {
        selfdestruct(_to);
    }
}
```
- - -

## ํ์ด
์ด ๋ฌธ์ ์์ ์ฐ๋ฆฌ์ ๋ชฉํ๋ ์์ด๋ฒ๋ฆฐ CA์ ์ฃผ์๋ฅผ ์ฐพ๊ณ  CA์์ ์๋ Ether๋ฅผ ํ์ํ๋ ๊ฒ์ด๋ค. 
์ค๋ช์ ์ฝ์ด๋ณด๋ฉด Recovery contract๋ฅผ ์ด์ฉํด SimpleToken contract์ instance๋ฅผ ๋ง๋ค์๋ค. ํ์ง๋ง instance์ ์ฃผ์๋ ์ ์ฅ๋์ง ์์๊ณ  ์์ด๋ฒ๋ฆฌ๊ฒ ๋์๋ค๊ณ  ํ๋ค. ๊ทธ๋ฆฌ๊ณ  ์์ด๋ฒ๋ฆฌ๊ธฐ ์ ์ 0.5 Ether๋ฅผ ๋ณด๋๋ค๊ณ  ํ๋ค. 

๊ทธ๋ ๋ค๋ฉด ์ฐ๋ฆฌ๋ ์ด๋ป๊ฒํ๋ฉด ์ฐพ์ ์ ์์๊น?

์ฃผ์๋ฅผ ์ฐพ๋ ๋ฐฉ๋ฒ์ 2๊ฐ์ง๊ฐ ์กด์ฌํ๋ค.
1. Etherscan์ ํตํด ํ์ธํ๋ ๋ฐฉ๋ฒ
2. nonce์ ์์ฑ์ ์ฃผ์๋ฅผ ์ฌ์ฉํด ํ์ธํ๋ ๋ฐฉ๋ฒ

ํ์๋ Etherscan์ ์ฌ์ฉํ๋ ๋ฐฉ๋ฒ์ผ๋ก ๋ฌธ์ ๋ฅผ ํ์๋ค.

#### 1. Etherscan ์ฌ์ฉํ์ฌ ํ๊ธฐ
์ฐ๋ฆฌ๊ฐ Ethernaut๋ฅผ ํตํด instance๋ฅผ ๋ง๋ค ๋น์ ์ฃผ์ ์ฃผ์ด์ง๊ณ , ๊ทธ ์ฃผ์๋ฅผ ํตํด ๋ชจ๋  ์ํธ์์ฉ์ด ์ผ์ด๋๋ค. 
๊ทธ๋ผ์ผ๋ก instance์ ์ฃผ์๋ฅผ etherscan์์ ๊ฒ์ํ์ฌ ์ผ์ด๋ transaction์ ํ์ธํ  ์ ์๋ค. 

๊ทธ๋ผ ๋ฐ๋ก ํ์ธํด๋ณด์!
์์๋ ๋ค์๊ณผ ๊ฐ๋ค
1. rinkeby testnet์ Etherscan์ ์ ์
2. instance ์ฃผ์ ๊ฒ์
3. transaction ํ์ธ
4. transaction์์ SimpleToken ์ฃผ์ ํ์ธ
5. SimpleToken์์ destroy() ์คํ

์ฐ์  Etherscan rinkeby testnet์ ์ ์ํ๋ค.
์ดํ instance ์ฃผ์๋ฅผ ๊ฒ์ํ๋ค. ๊ฒ์ ํ internal transaction์ ํ์ธํด๋ณด๋ฉด ๋งจ ์์ ๋ง์ง๋ง์ผ๋ก ์์ฑ๋ transaction์์ SimpleToken์ด ์์ฑ๋๋ค.
![contract_creation_ethernaut_recov](./contract_creation_ethernaut_recov.png)

์์ฑ๋ contract ํด๋ฆญํด ๋ค์ด๊ฐ๋ณด๋ฉด ๋ค์๊ณผ ๊ฐ์ด ๋์จ๋ค.
![simpleToken_contract_creation_ethernaut_recov](./simpleToken_contract_creation_ethernaut_recov.png)
๋๋ transaction์ด 3๊ฐ ์๋๋ฐ, ๋ฌธ์ ๋ฅผ ํ์ง ์์๋ค๋ฉด 2๊ฐ์ผ ๊ฒ์ด๋ค. 
~~๋ฌธ์ ์์๋ 0.5 ether์ด๋ผ๊ณ  ๋งํ์ง๋ง ์ค์ ๋ก๋ 0.001 ether๋ฐ์ ์๋ค!~~

์ด์  ์ฃผ์๋ฅผ ์์์ผ๋ destory()๋ฅผ ์คํ์์ผ ether๋ฅผ ์ฐพ์์ค๋ฉด ๋๋๋ค!

๋๋ remix๋ฅผ ์ฌ์ฉํ์ฌ transaction์ ๋ณด๋๋ค.

ethernaut์์ ์ฝ๋๋ฅผ copyํ ํ DEPLOY & RUN ๋ถ๋ถ์์ injected web3๋ฅผ ์ ํํ๊ณ  address at์ simpletoken ์ฃผ์๋ฅผ ๋ฃ๊ณ  ์คํ์ํจ๋ค.

๊ทธ๋ผ ์๋ deploy contract์ contract๊ฐ ๋์ค๊ณ  ์์ ์ ์ฃผ์๋ฅผ ๋ฃ์ด destory()๋ฅผ ์คํ์ํค๋ฉด ์๋ฃ๋๋ค.

์๋ฃ ํ ethernaut์ผ๋ก ๋์์ Submit instance๋ฅผ ๋๋ฅด๊ณ  ์กฐ๊ธ ๊ธฐ๋ค๋ฆฌ๋ฉด block์ด mine๋๊ณ , ์๋์ ๊ฐ์ด ๋จ๋ฉฐ ๋ง๋ฌด๋ฆฌ๋๋ค.
```
ูฉ(- ฬฎฬฎฬ-ฬ)?ถ Well done, You have completed this level!!!
```
- - -

## ๋ง๋ฌด๋ฆฌ
์ด๋ฒ ๋ฌธ์ ๋ ํ์์ Etherscan์ ์ฌ์ฉํ์ด์ ์ด๋ ต์ง ์๊ฒ ํ ์ ์์๋ค. ํ์ง๋ง ์ฒ์์ ๋ฌธ์  ์์ฒด๊ฐ ์ดํด๊ฐ ์๋์ ๋์ด๋์ ๋นํด ์๊ฐ์ด ๋ง์ด ์ง์ฒด๋ ๊ฒ ๊ฐ์๋ค. ๊ทธ๋ฆฌ๊ณ  ๋ฌธ์ ๋ฅผ ํ๊ณ ๋๋ etherscan์ ์ฌ์ฉํ๋ ๋ฐฉ๋ฒ๋ง๊ณ  `keccack256(address, nonce)`๋ฅผ ์ฌ์ฉํด ํธ๋ ๋ฐฉ๋ฒ๋ ์๋ค๊ณ  ์๋ ค์ฃผ์๋ค. ์๋ง contract creation์ด ์ผ์ด๋ ๋ ์ด๋ป๊ฒ ์์ฑ๋๋์ง์ nonce์ ์ค์์ฑ์ ์๋ ค์ฃผ๋ ค๊ณ  ํ ๊ฒ ๊ฐ๋ค! Ethernaut ์๋ฆฌ์ฆ๊ฐ ๋๋๊ณ  nonce๋ฅผ ์ด์ฉํด ๋ค์ ํ๋ฒ ๋ฌธ์ ๋ฅผ ํ์ด๋ณด๋ฉด ์ข์๊ฒ๊ฐ๋ค:)!

- - -
## REF
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org

```toc

```