---
emoji: ๐งข
title: Solidity Storage Layout For Proxy Contracts and Diamonds
date: '2022-02-16 11:04:00'
author: ํ์ฑ์
tags: EVM EthereumVirtualMachine ProxyContracts solidity Diamonds Storage Layout
categories: EVM
---


# ๐ Solidity Storage Layout For Proxy Contracts and Diamonds
์ด ๊ธ์ ๋ด๊ฐ ๊ณต๋ถํ๋ฉด์ ์ฐพ์ [์ด ๊ธ](https://medium.com/1milliondevs/solidity-storage-layout-for-proxy-contracts-and-diamonds-c4f009b6903)์ ๋ณ์ญํ์๋ค. ์ด ๊ธ์ Ethernaut์ 24๋ฒ Puzzle Wallet์ ํ๋ ๊ณต๋ถํ๋ ๊ฒ์ ๋ดค๋ค. ์ด ๊ธ์ ์ฝ๊ธฐ ์ํด์๋ proxy contract์ ๋ํ ์ฌ์ ์ง์์ด ํ์ํ๋ค. ๋ํ ์ด ๊ธ์ Diamond standard์ ์ ์์ธ NickMudge์ ๊ธ์ด๋ฉฐ, Proxy contract์ Storage Layout๊ณผ Diamond standard์ ๋ํด์ ๋ค๋ฃฌ๋ค. ๊ธ์๋ ๋ด๊ฐ ์๊ฐํ๋ ๋ถ๋ถ์ด ํฌํจ๋์ด์์ ์๋ ์๊ธฐ ๋๋ฌธ์, ๋ด ๊ธ์ด ์ดํด๊ฐ ์ ๋์ง ์๋๋ค๋ฉด [์๋ฌธ](https://medium.com/1milliondevs/solidity-storage-layout-for-proxy-contracts-and-diamonds-c4f009b6903)์ ์ฝ์ด๋ณด๋ ๊ฒ์ ์ถ์ฒํ๋ค.

### ์์
`Storage Layout`์ contract์ ์ํ ๋ณ์๊ฐ `contract storage`์ ์ ์ฅ๋๋ ๋ฐฉ๋ฒ๊ณผ ์ ์ฅ๋๋ ์์น์ด๋ค.

`Storage Layout`์ ์ฐ๋ฆฌ๊ฐ ํ์์์ contract๋ฅผ ์์ฑํ  ๋๋ ๊ณ ๋ คํ์ง ์์๋ ๊ด์ฐฎ๋ค. ์๋ํ๋ฉด Solidity compiler๊ฐ ์์์ ์ฒ๋ฆฌํด์ฃผ๊ธฐ ๋๋ฌธ์ด๋ค.

ํ์ง๋ง `Proxy contract` ๋๋ `Diamond`๋ฅผ ์์ฑํ ๋๋ `Storage layout`์ ๊ณ ๋ คํ๋ฉด contract๋ฅผ ์์ฑํด์ผํ๋ค.

์ด์ ๋ฅผ ์ค๋ชํ๊ธฐ ์ ์ contract storage์ ์ํ๋ณ์ Layout์ ๋ํด์ ๋จผ์  ์ด์ผ๊ธฐ ํด๋ณด์.1
1. ์ํ๋ณ์์ `Storage Layout`์ Slot 0์์ ์์ํ๋ฉฐ ์๋ก์ด ์ํ๋ณ์๋ง๋ค ์ฆ๊ฐํ๋ค. Ex) ์ฒซ๋ฒ์งธ ์ํ๋ณ์๋ Slot 0, ๋๋ฒ์งธ๋ Slot 1... (optimize ์ ์ธ)
2. struct์ array๋ ์ง์ ๋ ๋งํผ์ ๊ณต๊ฐ์ ์ฐจ์งํ์ฌ storage์ ์ ์ฅ๋๋ค.
3. ๋์  array์ mapping์ ๋์ ์ผ๋ก ํฌ๊ธฐ๊ฐ ๋ณํ๊ธฐ ๋๋ฌธ์ storage์์น์ key์ hash ๊ฐ์ ๊ธฐ๋ฐ์ผ๋ก ํ๋ ์์น์ ์ ์ฅ๋๋ค.

Storage Layout์ ์๋ ๋ฐฉ์์ ๋ํ ์ค๋ช์ [Solidity docs](https://solidity.readthedocs.io/en/v0.6.3/miscellaneous.html)์ ์ ๋์์๋ค!

์ฆ Storage Layout์ Slot 0์์ ์์ํ์ฌ ์๋ก์ด ์ํ๋ณ์๊ฐ ์ฌ๋๋ง๋ค ์ฆ๊ฐํ๋ค๋ ๊ฒ์ ์ ์ ์๋ค.

### Problem
    ๋ฌธ์ ๋ Proxy contract์ logic contract๊ฐ ๊ฐ์ storage layout์ ๊ณต์ ํ๋ค๋ ๊ฒ์ด๋ค.

๋ค์ ์ฝ๋๋ ๋ฌธ์ ์ ๋ํด ์ค๋ชํ๊ธฐ ์ํ ์์์ด๋ค.

ProxyA๋ 2๊ฐ์ ์ํ๋ณ์๋ฅผ ์ ์ํ๋ค, facetA์ owner.

```solidity
contract ProxyA {
    address facetA;  
    address owner;
    constructor() public {
        owner = msg.sender;
        facetA = 0x0b22380B7c423470979AC3eD7d3c07696773dEa1;
    }
    fallback() external payable {
        address facetAddress = facetA;
        assembly {
        ... code omitted for simplicity
        }
    }
}
```
<br/>

FacetA๋ ํ๋์ ์ํ๋ณ์๋ฅผ ์ ์ํ๋ค.

<br/>

```solidity
contract FacetA {
    address user;
    function getUser() external view returns(address) {
        return user;
    }
    function setUser(address newUser) external {
        user = newUser;
    } 
}
```

<br/>

ProxyA contract๋ FacetA์๊ฒ ํจ์ ํธ์ถ์ ์์(delegate)ํ๋ค. ์ด๋ ๋ฌธ์ ๋ ์์์์ ProxyA์ FacetA๋ `storage layout`์ ๊ณต์ ํ๋ค๋ ๊ฒ์ด๋ค. ProxyA์ ์ํ๋ณ์ `facet`๋ slot 0์ ์์นํ๋ค. ๋ํ FacetA์ ์ํ๋ณ์ `user`๋ slot 0์ ์์นํ๋ค. ์ฐ๋ฆฌ๋ setUser๋ฅผ ํตํด user๋ง ๋ฐ๋๋ ๊ฒ์ ์๋ํ์ง๋ง, ๋ง์ฝ `setUser(address newUser)`๊ฐ ํธ์ถ๋๋ค๋ฉด `user`์ `facetA`๊ฐ ๋ชจ๋ `newUser`๋ก ๋ฐ๋ ๊ฒ์ด๋ค. 

์ฌ๋๋ค์ ์ด์ ๊ฐ์ ๋ฌธ์ ๋ฅผ ํด๊ฒฐํ๊ธฐ์ํด ๋ค์ํ ํจํด์ ๋ง๋ค์๊ณ  ์ด์ ๋ถํฐ ๊ทธ ํจํด๋ค์ ๋ํด์ ์ค๋ชํด๋ณด๊ฒ ๋ค.

### Unstructured Storage
Solidity์ storage๋ `assembly`๋ฅผ ํตํด์ contract storage์ ์์๋ก ์์น๋ฅผ ์ ํด value๋ฅผ ์ ์ฅํ  ์ ์๋ค. ์ด ํจํด์ `Unstructured Storage Pattern`์ด๋ค. ์ด ํจํด์ ์์๋ฅผ ํจ๊ป ๋ณด์

<br/>

```solidity
contract ProxyA {
    function getOwner() internal view returns(address owner) {
        bytes32 position = keccak256("owner");
        assembly {
            owner := sload(position)
        }
    }
    function setOwner(address owner) internal {
        bytes32 position = keccak256("owner");
        assembly {
            sstore(position, owner)
        }
    }
    function getFacet() internal view returns(address facet) {
        bytes32 position = keccak256("FacetA");
        assembly {
            facet := sload(position)
        }
    }
    function setFacet(address facet) internal {
        bytes32 position = keccak256("FacetA");
        assembly {
            sstore(position, facet)
        }
    }
}
```

<br/>

์ ์์์์๋ `get`๊ณผ `set` ํจ์๋ฅผ ์ด์ฉํด `owner`์ `facetA`์ storage์ ์ ์ฅํ๊ณ  ๊ฐ์ ธ์ฌ ์ ์๋ค. ์ฐ๋ฆฌ๋ ์ํ๋ณ์๊ฐ ์ ์ฅ๋๋ ์ฅ์๋ฅผ `assembly`๋ฅผ ์ฌ์ฉํด ์ง์ ํจ์ผ๋ก์จ ๋ค๋ฅธ storage ๋ณ์์ ์ถฉ๋๋์ง ์๋๋ก ํ ๊ฒ์ด๋ค. ์ถฉ๋ํ์ง ์๋๋ค๋ ์ฅ์ ๋ ์์ง๋ง, `Unstructured Storage Pattern`์ ๋ช๊ฐ์ง ๋จ์ ์ด ์กด์ฌํ๋ค. 
1. ๊ฐ storage ๋ณ์์ ๋ํด์ getter์ setter๋ฅผ ์ ์ํด์ผํ๋ค.
2. ๋จ์ํ ๋ฒ์๋ค์๋ง ์ ์ฉ์ด ๋๋ค(`uint`, `address` ๋ฑ). structs์ mappings์๋ ์ ์ฉ๋๊ธฐ ํ๋ค๋ค.


### Inherited Storage
Proxy contract์ logic contract ์ด์ธ์ storage contract๋ฅผ ๋ฐฐํฌํด ์์(Inherit)ํ๋ ๋ฐฉ๋ฒ์ด๋ค. ์ด ๋ฐฉ๋ฒ์ ์ฌ์ฉํ๋ฉด proxy ์ logic contract๊ฐ ๋์ผํ ์ํ๋ณ์๋ฅผ ์ ์ธํ๊ธฐ ๋๋ฌธ์ ์ถฉ๋์ด ๋ฐ์ํ์ง ์๋๋ค. ์๋ ์์๋ฅผ ๋ณด์!

<br/>


```solidity
contract Storage1 {
    address owner;
    address facetA;
    address user;
}
contract ProxyA is Storage1 {
    ... code omitted for simplicity
}
contract FacetA is Storage1 {
    ... code omitted for simplicity
}
```
<br/>

์์ ๊ฐ์ contract๋ฅผ ๋ฐฐํฌํ๊ณ  ์ฐ๊ฒฐํ ํ์ logic contract๋ฅผ ์ถ๊ฐ๋ก ์์ฑํ  ์ ์๊ณ  ์๋ก์ด ์ํ๋ณ์๋ฅผ ์ ์ํ  ์๋ ์๋ค. ์ด ๋ฐฉ๋ฒ์ ์๋ก์ด storage contract๋ฅผ ๋ฐฐํฌํ๊ณ  ์ด์ ์ storage contract๋ฅผ ์์ํ๋ ๋ฐฉ์์ผ๋ก ์๋ํ๋ค. 

์์๋ฅผ ํ๋ฒ ๋ณด์!

```solidity
contract Storage2 is Storage1 {
    address facetB;
    address nextUser;
}
contract FacetB is Storage2 {
    ... code omitted for simplicity
}
```
<br/>

`Storage2`๋ ProxyA๋ฅผ ๊ทธ๋๋ก ์ฌ์ฉํ  ์ ์๋ค. ์๋ํ๋ฉด `Storage2`์ ์๋ก์ด ์ํ๋ณ์๋ค์ `Storage1`์ ์ํ๋ณ์ ๋ค์ ์ ์๋๊ธฐ ๋๋ฌธ์ด๋ค. 

์ด ๋ฐฉ์๋ ๋จ์ ์ด ์กด์ฌํ๋ค.
1. Logic Contract๋ค์ ์ฌ์ฉํ์ง ์๋ ์ํ๋ณ์๋ ํฌํจ๋์ด์๋ Storage contract๋ฅผ ์์ํด์ผํ๋ค. 
2. Logic Contract๋ ํน์  proxy contract์ ์ฐ๊ฒฐ๋๋ฉฐ ๋ค๋ฅธ ์ํ๋ณ์๋ฅผ ์ ์ธํ๋ proxy cotnract ๋ฐ logic contract๋ฅผ ์ฌ์ฉํ  ์ ์๋ค. 

<br/>

<!-- ์ด์ ๋ค๋ฅด๊ฒ Diamond Storage๋ ๋จ์ ์ด ์กด์ฌํ์ง ์๋๋ค.
1. Proxy contracts, diamonds, Logic Contract๋ ์์ ๋ค์ด ์ฌ์ฉํ๋ Diamond Storage๋ง ์์ํ๋ฉด ๋๋ค. 
2. Diamond Storage๋ proxy contrat์ Logic Contract๋ฅผ ๋ถ๋ฆฌ์ํฌ ์ ์๋ค. ๋ํ Diamond Storage๋ฅผ ์ฌ์ฉํ๋ Logic contract๋ ๋ค๋ฅธ proxy contract ๋๋ logic contract์ ๊ฐ์ด ์ฌ์ฉํ  ์ ์๋ค. Diamond Storage๋ ๋ ๊ณ ์ฒ๋ผ Logic contract์ proxy contract๋ฅผ ์ฐ๊ฒฐํ๊ฑฐ๋ ์ฌ์ฌ์ฉ ํ  ์ ์๊ฒ ํด์ค๋ค. -->

### Eternal Storage
Ethernal Storage๋ Solidity์ `mappings`๋ฅผ ์ฌ์ฉํด contract storage API๋ฅผ ๋ง๋๋ ๊ฒ์ด๋ค. ๊ทธ๋์ Proxy์ logic contract๋ API๋ฅผ ์ด์ฉํด ์ถฉ๋์์ด storage๋ฅผ ์ฌ์ฉ ํ  ์ ์๋ค. 

์๋ ์์๋ฅผ ๋ณด๋ฉฐ ๋ ์ดํดํด ๋ณด์!

```solidity
contract ProxyA {
    mapping(bytes32 => uint256) internal uIntStorage;
    mapping(bytes32 => uint256[]) internal uIntArrayStorage;
    mapping(bytes32 => string) internal stringStorage;
    mapping(bytes32 => address) internal addressStorage;
    mapping(bytes32 => bytes) internal bytesStorage;
    constructor() public {
        addressStorage["owner"] = msg.sender;
        addressStorage["facetA"] = 0x0b22380B7c423470979AC3eD7...;
    }
    fallback() external payable {
        address facetAddress = addressStorage["facetA"];
        assembly {
        ... code omitted for simplicity
        }
    }
}
```

<br/>

```solidity
contract FacetA {
    mapping(bytes32 => uint256) internal uIntStorage;
    mapping(bytes32 => uint256[]) internal uIntArrayStorage;
    mapping(bytes32 => string) internal stringStorage;
    mapping(bytes32 => address) internal addressStorage;
    mapping(bytes32 => bytes) internal bytesStorage;
    function getUser() external view returns(address) {
        return addressStorage["user"];
    }
    function setUser(address newUser) external {
        addressStorage["user"] = newUser;
    }
}
```
<br/>

์์ ์์ ๊ฐ์ด ์ฐ๋ฆฌ๋ `mappings`๋ฅผ ์ฌ์ฉํด ์ํ๋ณ์๋ฅผ ์ ์ฅํ๊ณ  ์ฝ์ ์ ์๋ค. ์ด๋ ๊ฒ ํด๋ ์ ์๋ํ์ง๋ง ๋จ์ ์ด ๋ถ๋ช ์กด์ฌํ๋ค.
1. ์ํ๋ณ์๋ฅผ ๋ค๋ฃจ๊ธฐ ํ๋  ๋ฌธ๋ฒ
2. ๊ธฐ๋ณธ์ ์ธ ๋จ์ํ ๋ณ์๋ ์ฝ๊ฒ ์ฌ์ฉ๋  ์ ์์ง๋ง `struct`์ `mapping`๊ฐ์ ๊ฒฝ์ฐ ์ผ๋ฐ์ ์ธ ๋ฐฉ์์ผ๋ก ์๋ํ์ง ์๋๋ค.
3. Proxy contract์ ๋ชจ๋  logic contract๋ ํญ์ ๊ฐ์ Storage API๋ฅผ ๊ฐ์ง๊ณ  ์์ด์ผํ๋ค. 
4. slot ์์๋๋ก ์ ์ฅ๋๋ ๊ฒ์ด ์๋๊ธฐ ๋๋ฌธ์ ์ด๋ค ์ํ๋ณ์๊ฐ ์กด์ฌํ๋์ง ํ๋์ ํ์ธํ  ์ ์๋ค.


### Conclusion
์ฌ๋๋ค์ Procy contract์ Storage Layout์ ๊ด๋ฆฌํ๊ธฐ ์ํด ์ฌ๋ฌ๊ฐ์ง ๋ฐฉ๋ฒ์ ์๊ฐํด๋๋ค.

์ด๋ค ๋ฐฉ๋ฒ์ด ์ข์์ง๋ ๊ฐ์์ ์ํฉ ๋ฐ ์ทจํฅ์ ๋ฐ๋ผ ๋ค๋ฅด๋ค. ํ์ง๋ง ์ด๋ ๋ฐฉ๋ฒ์ ์ฌ์ฉํ๋  ๋จ์ ์ด ์กด์ฌํ๋ค. ๊ทธ๋์ ๋์จ ๋ฐฉ๋ฒ์ด Diamond Storage์ด๋ค. ๋ค์ Post์์๋ Diamond Storage์ ๋ํด์ ๋ค๋ฃจ๊ฒ ๋ค. Diamond Storage๋ ์ ์ธ๊ฐ์ง ๋ฐฉ๋ฒ๊ณผ ๋ค๋ฅด๊ฒ ๋จ์ ์ด ์กด์ฌํ์ง ์๋๋ค!  


### My Summary(๋์๊ฒ ํ๋ ๋ง)
Proxy contract์ ๋ํด์ ๊ณต๋ถํ๋ฉฐ ์ฐพ์ ๊ธ์ ๋ฒ์ญํด๋ณด์๋ค. Proxy contract๋ฅผ ์ฒ์ ์ ํ์ ๋๋ ๋ง๋งํ๊ธฐ๋ง ํ์ง๋ง ์ข์ ๊ธ์ ์ฌ๋ฌ๊ฒ ์ฝ๊ณ ๋๋ ์ข ์ดํด๊ฐ ๋๋ ๊ฒ ๊ฐ๋ค. Proxy์ ๋ํ ์ด๋ก ์ ์๋ฒฝํ๊ฒ ๊นจ์ฐ์น ํ ์ง์  upgradable contract๋ ์ง๋ณด์ ~~๋ฐฐ์ฐ๋ฉด ๋ฐฐ์ธ์๋ก ๋ฐฐ์์ผํ๋๊ฒ ๋ ๋ง์์ง๋๊ฑด ๊ธฐ๋ถํ...?ใใ~~ ์์ผ๋ก ๊พธ์คํ ๋ฐฐ์ฐ์! ์๊ฐ์ด ์๋๋๋ผ๋ ํ๋ฃจ์ ๊ธ ํ๋์ฉ์ด๋ผ๋ ์ฝ์ผ๋ฉฐ ์ต์ํด์ง์. ํ์ํ!

```toc

```