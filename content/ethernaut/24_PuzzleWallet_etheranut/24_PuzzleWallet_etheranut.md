---
emoji: π§’
title: (Ethernaut μ·¨μ½μ  24) Puzzle Wallet
date: '2022-02-13 19:48:00'
author: νμ±μ
tags: ethernaut PuzzleWallet vulnerability 24
categories: μ·¨μ½μ λΆμ
---


# π 1. Puzzle Wallet
__Difficulty 7/10__

- μΉλ¦¬ μ‘°κ±΄
- μ½λ λΆμ
- νμ΄
μμλ‘ μ§ν λ  κ²μ΄λ€.

- - -

## μΉλ¦¬ μ‘°κ±΄
- 


- - -
## λ€μ΄κ°κΈ° μ 


## μ½λ λΆμ
λΆμμ μ£Όμμ μμ΅λλ€!

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/proxy/UpgradeableProxy.sol";

contract PuzzleProxy is UpgradeableProxy {
    address public pendingAdmin;
    address public admin;

    constructor(address _admin, address _implementation, bytes memory _initData) UpgradeableProxy(_implementation, _initData) public {
        admin = _admin;
    }

    modifier onlyAdmin {
      require(msg.sender == admin, "Caller is not the admin");
      _;
    }

    function proposeNewAdmin(address _newAdmin) external {
        pendingAdmin = _newAdmin;
    }

    function approveNewAdmin(address _expectedAdmin) external onlyAdmin {
        require(pendingAdmin == _expectedAdmin, "Expected new admin by the current admin is not the pending admin");
        admin = pendingAdmin;
    }

    function upgradeTo(address _newImplementation) external onlyAdmin {
        _upgradeTo(_newImplementation);
    }
}

contract PuzzleWallet {
    using SafeMath for uint256;
    address public owner;
    uint256 public maxBalance;
    mapping(address => bool) public whitelisted;
    mapping(address => uint256) public balances;

    function init(uint256 _maxBalance) public {
        require(maxBalance == 0, "Already initialized");
        maxBalance = _maxBalance;
        owner = msg.sender;
    }

    modifier onlyWhitelisted {
        require(whitelisted[msg.sender], "Not whitelisted");
        _;
    }

    function setMaxBalance(uint256 _maxBalance) external onlyWhitelisted {
      require(address(this).balance == 0, "Contract balance is not 0");
      maxBalance = _maxBalance;
    }

    function addToWhitelist(address addr) external {
        require(msg.sender == owner, "Not the owner");
        whitelisted[addr] = true;
    }

    function deposit() external payable onlyWhitelisted {
      require(address(this).balance <= maxBalance, "Max balance reached");
      balances[msg.sender] = balances[msg.sender].add(msg.value);
    }

    function execute(address to, uint256 value, bytes calldata data) external payable onlyWhitelisted {
        require(balances[msg.sender] >= value, "Insufficient balance");
        balances[msg.sender] = balances[msg.sender].sub(value);
        (bool success, ) = to.call{ value: value }(data);
        require(success, "Execution failed");
    }

    function multicall(bytes[] calldata data) external payable onlyWhitelisted {
        bool depositCalled = false;
        for (uint256 i = 0; i < data.length; i++) {
            bytes memory _data = data[i];
            bytes4 selector;
            assembly {
                selector := mload(add(_data, 32))
            }
            if (selector == this.deposit.selector) {
                require(!depositCalled, "Deposit can only be called once");
                // Protect against reusing msg.value
                depositCalled = true;
            }
            (bool success, ) = address(this).delegatecall(data[i]);
            require(success, "Error while delegating call");
        }
    }
}
```

<br/>


- - -

## νμ΄


token1κ³Ό 2, λͺ¨λκ° balanceκ° 0μ΄ λ κ²μ νμΈνλ€λ©΄ ethernautμΌλ‘ λμμ Submit instanceλ₯Ό λλ₯΄κ³  μ‘°κΈ κΈ°λ€λ¦¬λ©΄ blockμ΄ mineλκ³ , μλμ κ°μ΄ λ¨λ©° λ§λ¬΄λ¦¬λλ€.
```
Ω©(- Μ?Μ?Μ-Μ)ΫΆ Well done, You have completed this level!!!
```
- - -

## λ§λ¬΄λ¦¬


- - -
## REF
- rinkeyb network ether faucet: https://faucets.chain.link/rinkeby
- ethernaut: https://ethernaut.openzeppelin.com/
- remix IDE: https://remix.ethereum.org

```toc

```