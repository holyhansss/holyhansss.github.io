---
emoji: ๐งข
title: Compound protocol - ์๊ธ, ์ถ๊ธ (mint, redeem)
date: '2022-07-19 20:16:00'
author: ํ์ฑ์
tags: blog Defi Blockchain DAO Compound mint redeem
categories: Defi
---


# ๐ Compound
๋ณธ ๊ธ์์๋ Compound์ ์๊ธ๊ณผ ์ถ๊ธ ๊ณผ์ ์ ์ฝ๋๋ฅผ line by line์ผ๋ก ๋ถ์ํด ๋ณผ ๊ฒ์ด๋ค.

## CToken

## ์๊ธ ๋ฐ ์ถ๊ธ ์๋๋ฆฌ์ค
1. ์ ์ ๊ฐ Compound์ Dai Token์ ์๊ธ์ ํจ์ผ๋ก์จ ์ด์ ์์ต์ ์ป๊ณ ์ถ์ด ํ๋ค.
2. ์ ์ ๊ฐ 100 Dai๋ฅผ ์๊ธํ๋ค.
3. Compound์ cToken ๊ณต๊ธ ๋น์จ์ ๋ง์ถฐ cDai๋ฅผ ์ ์ ์๊ฒ ์ค๋ค.
4. 1๋ ํ
5. ๊ฐ์ง๊ณ  ์๋ CDai์ ์๊ธํ๋ Dai๋ฅผ ๊ตํํ๋ค(์ถ๊ธ)

## Mint

```solidity
    // CErc20.sol    
    function mint(uint mintAmount) override external returns (uint) {
        mintInternal(mintAmount);
        return NO_ERROR;
    }

    // CEther.sol
    function mint() external payable {
        mintInternal(msg.value);
    }
```

์ ์ ๋ `CErc20.sol` ๋๋ `CEther.sol`๊ณผ ์ํธ์์ฉํ๋ค. ์๊ธ์์๋ mintInternal์ด๋ผ๋ ํจ์๋ฅผ ์ฌ์ฉํ๋ ๊ฒ์ ์ ์ ์๋ค.
`CErc20.sol` ๋๋ `CEther.sol`์์ mint๊ฐ ํธ์ถ๋๋ฉด `mint -> mintInteral -> mintFresh` ์์๋ก ์คํ๋๋ค. mintInternal๊ณผ mintFresh๋ CToken.sol์ ์กด์ฌํ๋ ํจ์์ด๋ค.

```solidity
    function mintInternal(uint mintAmount) internal nonReentrant {
        accrueInterest();
        // mintFresh emits the actual Mint event if successful and logs on errors, so we don't need to
        mintFresh(msg.sender, mintAmount);
    }
```

mintInternal์ด ํธ์ถ๋๋ฉด ๊ฐ์ฅ ๋จผ์  `accrueInterest`๋ผ๋ ํจ์๊ฐ ์ฐ์ ์ ์ผ๋ก ํธ์ถ๋๋ค. `accrueInterest` ํจ์๋ ์๊ธ(mint), ์ถ๊ธ(redeem), ์ฐจ์ฉ(borrow), ์ํ(repay), ์ฒญ์ฐ(liquidate) ๋ฑ ์ฃผ์ ๊ธฐ๋ฅ์ด ํธ์ถ๋ ํ ์ฒซ๋ฒ์งธ๋ก ํธ์ถ๋๋ค. ์ด์์จ๊ณผ ๊ด๋ จํ ๊ธ์ ๋ฐ๋ก ๋ง๋ค์ด ์ฌ๋ฆฌ๋๋ก ํ  ๊ฒ์ด๋ค. 

๊ทธ๋ ๋ ๊ฐ๋จํ๊ฒ ์ค๋ชํ์๋ฉด ์ด borrows์ reserves์ ๋์  ์ด์๋ฅผ ์ ์ฉํ๋ค. ์ฆ ๋ง์ง๋ง์ผ๋ก ๊ฐฑ์ ๋์๋ ๋ธ๋ก๊ณผ ํ์ฌ ๋ธ๋ก์ ์ฐจ์ด๋ฅผ ๊ตฌํ์ฌ ์ด์๋ฅผ ๊ณ์ฐํ๊ณ , ํ์ฌ ๋ธ๋ก๋๋ฒ๋ฅผ storage์ ์ ์ฅํ๋ค.

์ดํ mintFresh ํจ์๋ฅผ ํธ์ถํ๋ค. 

```solidity
    function mintFresh(address minter, uint mintAmount) internal {
        /* Fail if mint not allowed */
        uint allowed = comptroller.mintAllowed(address(this), minter, mintAmount);
        if (allowed != 0) {
            revert MintComptrollerRejection(allowed);
        }

        /* Verify market's block number equals current block number */
        if (accrualBlockNumber != getBlockNumber()) {
            revert MintFreshnessCheck();
        }

        Exp memory exchangeRate = Exp({mantissa: exchangeRateStoredInternal()});

        uint actualMintAmount = doTransferIn(minter, mintAmount);

        /*
         * We get the current exchange rate and calculate the number of cTokens to be minted:
         *  mintTokens = actualMintAmount / exchangeRate
         */

        uint mintTokens = div_(actualMintAmount, exchangeRate);

        totalSupply = totalSupply + mintTokens;
        accountTokens[minter] = accountTokens[minter] + mintTokens;

        emit Mint(minter, actualMintAmount, mintTokens);
        emit Transfer(address(this), minter, mintTokens);
    }
```

mintFresh ํจ์์์ mint์ ๊ดํ ๊ฑฐ์ ๋ชจ๋  process๊ฐ ์ด๋ฃจ์ด์ง๋ค. ์ ์ ๊ฐ ๋ง์ผ์ ์ ํด์ง Token์ ์ ๊ณตํจ์ผ๋ก์จ CToken์ ๋ฐ์ ์ ์๋ค. 

```solidity
    uint allowed = comptroller.mintAllowed(address(this), minter, mintAmount);
    if (allowed != 0) {
        revert MintComptrollerRejection(allowed);
    }
    ...
```

mintFresh ํจ์์์๋ ์ฐ์ ์ ์ผ๋ก comptroller์ mintAllowed ํจ์๋ฅผ ํธ์ถํ์ฌ, mint๊ฐ ๊ฐ๋ฅํ์ง ํ์ธํ๋ค. 

```
    function mintAllowed(address cToken, address minter, uint mintAmount) override external returns (uint) {
        // Pausing is a very serious situation - we revert to sound the alarms
        require(!mintGuardianPaused[cToken], "mint is paused");

        // Shh - currently unused
        minter;
        mintAmount;

        if (!markets[cToken].isListed) {
            return uint(Error.MARKET_NOT_LISTED);
        }

        // Keep the flywheel moving
        updateCompSupplyIndex(cToken);
        distributeSupplierComp(cToken, minter);

        return uint(Error.NO_ERROR);
    }
```

mintAllowed ํจ์์์๋ ์ฐ์ ์ ์ผ๋ก ๋ช๊ฐ์ง ํ์ธ์ ์ฐจ๋ฅผ ๊ฑฐ์น๋ค. ์ฒซ๋ฒ์งธ๋ก cToken์ ๊ณต๊ธ์ด ์ค์ง๋์๋์ง ํ์ธํ๋ค. `mintGuardianPaused[cToken]` ๋ฐฐ์ด(mapping)์ storage ๋ณ์๋ก pauseGuardian ๋๋ admin์ด pause ํ  ์ ์๊ณ  admin๋ง unpause ํ  ์ ์๋ค. ~~์์ง Compound์ Governance ๊ด๋ จํด์๋ ๋ณด์ง ๋ชปํธ๋๋ฐ, ์ด ๋ถ๋ถ์๋ Governance๊ฐ ์ ์ฉ๋์ด์๋์ง ๊ถ๊ธํ๋ค...!~~

์ดํ ํน์  cToken์ด market์ ๋ฑ๋ก๋ ํจ์์ธ์ง ํ์ธํ๋ค. ๋ง์ฝ ๋ฑ๋ก๋์ง ์์ cToken์ด๋ผ๋ฉด Error๋ฅผ returnํ๋ค. ์ข ๋ ํ๊ณ  ๋ค์ด๊ฐ๋ณด๋ฉด [_supportMarket](https://github.com/compound-finance/compound-protocol/blob/a3214f67b73310d547e00fc578e8355911c9d376/contracts/ComptrollerG7.sol#L917)์ด๋ผ๋ ํจ์๊ฐ ์๋๋ฐ ์ด ํจ์๋ฅผ ํตํด market์ cToken์ด ๋ฑ๋ก๋๋ ๊ฒ์ ํ์ธํด ๋ณผ ์ ์๋ค.

๋ชจ๋  ์๋ฌ ์ฌํญ์ ํ์ธํ ์ดํ `updateCompSupplyIndex`์ `distributeSupplierComp` ํจ์๋ฅผ ์ฐจ๋ก๋๋ก ์คํ์ํจ๋ค. ์ฐ์  `updateCompSupplyIndex` ํจ์๋ฅผ ํ์ธํด๋ณด์.

```solidity
    function updateCompSupplyIndex(address cToken) internal {
        CompMarketState storage supplyState = compSupplyState[cToken];
        uint supplySpeed = compSpeeds[cToken];
        uint blockNumber = getBlockNumber();
        uint deltaBlocks = sub_(blockNumber, uint(supplyState.block));
        if (deltaBlocks > 0 && supplySpeed > 0) {
            uint supplyTokens = CToken(cToken).totalSupply();
            uint compAccrued = mul_(deltaBlocks, supplySpeed);
            Double memory ratio = supplyTokens > 0 ? fraction(compAccrued, supplyTokens) : Double({mantissa: 0});
            Double memory index = add_(Double({mantissa: supplyState.index}), ratio);
            compSupplyState[cToken] = CompMarketState({
                index: safe224(index.mantissa, "new index exceeds 224 bits"),
                block: safe32(blockNumber, "block number exceeds 32 bits")
            });
        } else if (deltaBlocks > 0) {
            supplyState.block = safe32(blockNumber, "block number exceeds 32 bits");
        }
    }
```

`updateCompSupplyIndex` ํจ์๋ ๋ฐ๋ก ๋ค์์ `distributeSupplierComp`์์ ์ฐ์ผ ๋ณ์๋ค์ ๊ฐฑ์ ํด์ฃผ๋ ์ญํ ์ ํ๋ค. supplyState, supplySpeed, blockNumber์ storage์์ ๊ฐ์ ธ์ค๊ณ  deltaBlock์ ๊ณ์ฐํ๋ค. ๊ทธ๋ฆฌ๊ณ  deltablock์ supplySpeed์ ๋ฐ๋ผ if๋ฌธ์ด ์คํ๋๋ค. ์ฌ๊ธฐ์ DeltaBlock์ `ํ์ฌ blockNumber - ๋ง์ง๋ง์ผ๋ก ๊ฐฑ์ ๋ supplyState.block`์ด๋ค. supplySpeed, ์ฆ comSpeed[cToken]์ public ํจ์์ธ `_setCompSpeed`๋ฅผ ํตํด ๋ฐ๋ ์ ์์ผ๋ฉฐ, admin๋ง์ด ๋ณ๊ฒฝ ๊ฐ๋ฅํ๋ค.

๋ง์ฝ supplySpeed์ deltaBlocks๊ฐ 0๋ณด๋ค ํฌ๋ค๋ฉด ์๋ก์ด supplySpeed * deltaBlock์ผ๋ก ๋์ ๋ comp(compAccrued)์ ๊ฐ์ ๊ตฌํ๋ค. ์ดํ ratio๋ฅผ ๊ตฌํ๋๋ฐ ๋ง์ฝ CToken์ totalSupply๊ฐ 0๋ณด๋ค ํฌ๋ค๋ฉด compAccrued/supplyTokens๋ฅผ ํตํด ratio๋ฅผ ๊ตฌํ๊ณ , ์ด๋ฅผ ๊ธฐ์กด์ index๊ฐ๊ณผ ๋ํ๋ค. ๊ทธ๋ฆฌ๊ณ  ์๋ก์ด index์ block Number๋ฅผ compSupplyState์ ์ ์ฅํด์ค๋ค. 

์ด๋ ๊ฒ `updateCompSupplyIndex` ํจ์์์ compSupplyState์ ๊ฐ์ `distributeSupplierComp` ํจ์์์ ์ฌ์ฉ๋๋ค. ๊นํ๋ธ์์ ์ฝ๋๋ฅผ ๋ณด๋ฉด `distributeSupplierComp` ํจ์์๋ ๋ค์๊ณผ ๊ฐ์ ๊ธ์ด ์ฃผ์์ฒ๋ฆฌ ๋์ด์๋ค. 

- Calculate COMP accrued by a supplier and possibly transfer it to them

์ฆ, ์ฆ๊ฐ๋ COMP๋ฅผ ๊ณ์ฐํ์ฌ ๊ณต๊ธ์(minter)์ transferํด์ฃผ๋ ํจ์๋ผ๋ ๋ป์ด๋ค.

```solidity
    function distributeSupplierComp(address cToken, address supplier) internal {
        CompMarketState storage supplyState = compSupplyState[cToken];
        Double memory supplyIndex = Double({mantissa: supplyState.index});
        Double memory supplierIndex = Double({mantissa: compSupplierIndex[cToken][supplier]});
        compSupplierIndex[cToken][supplier] = supplyIndex.mantissa;

        if (supplierIndex.mantissa == 0 && supplyIndex.mantissa > 0) {
            supplierIndex.mantissa = compInitialIndex;
        }

        Double memory deltaIndex = sub_(supplyIndex, supplierIndex);
        uint supplierTokens = CToken(cToken).balanceOf(supplier);
        uint supplierDelta = mul_(supplierTokens, deltaIndex);
        uint supplierAccrued = add_(compAccrued[supplier], supplierDelta);
        compAccrued[supplier] = supplierAccrued;
        emit DistributedSupplierComp(CToken(cToken), supplier, supplierDelta, supplyIndex.mantissa);
    }
```
`updateCompSupplyIndex` ํจ์์ ๊ฐ์ด compSupplyState๋ฅผ ๋ถ๋ฌ์ค๊ณ , `updateCompSupplyIndex`์์ ์์ฅํ๋ supplyIndex๋ฅผ ๋ถ๋ฌ์จ๋ค. ๊ทธ๋ฆฌ๊ณ  CompSupplierIndex๋ฅผ ๋ถ๋ฌ์ค๋๋ฐ, `ComptrollerStorage.sol`์ ํ์ธํด๋ณด๋ฉด "The COMP borrow index for each market for each supplier as of the last time they accrued COMP" ๋ผ๊ณ  ์ค๋ช์ด ๋์์๋๋ฐ, ๋ญ๊ฐ ํด์์ ํด๋ด๋ ํ ์๋ฟ์ง ์๋๋ค.~~ใใ ์ข ๋ ๊น์ด ๋ค์ด๊ฐ๋ค๋ณด๋ฉด ์ ์ ์์๊น?~~

์ดํ compound์ comp ์ ๊ณต ๋ก์ง์ ๋ฐ๋ผ ๊ณ์ฐํ ํ compAccrued ๊ฐ์ ์ ์ฅํ๋ค. compAccrued ๊ฐ์ ๋์ค์ `claimComp` ํจ์๋ฅผ ํตํด ์ ์ ์ ์ง๊ฐ์ผ๋ก ๋ค์ด๊ฐ๋ค. ์ด๋ ๊ฒ ๋ ํจ์๋ฅผ ๊ฑฐ์น ํ `mintAllowed` ํจ์๋ 0์ returnํ๋ค. ๋ง์ฝ return ๊ฐ์ด 0์ด ์๋๋ผ๋ฉด revert๋ก Transaction์ ๋๋ธ๋ค. ์ด์  mintFresh ํจ์๋ก ๋์์ ๋๋จธ์ง ๋ถ๋ถ์ ํ์ธํด๋ณด์!


```solidity
    // mintFresh()
    ...
    if (accrualBlockNumber != getBlockNumber()) {
        revert MintFreshnessCheck();
    }

    Exp memory exchangeRate = Exp({mantissa: exchangeRateStoredInternal()});

    uint actualMintAmount = doTransferIn(minter, mintAmount);

    /*
        * We get the current exchange rate and calculate the number of cTokens to be minted:
        *  mintTokens = actualMintAmount / exchangeRate
        */

    uint mintTokens = div_(actualMintAmount, exchangeRate);

    totalSupply = totalSupply + mintTokens;
    accountTokens[minter] = accountTokens[minter] + mintTokens;

    emit Mint(minter, actualMintAmount, mintTokens);
    emit Transfer(address(this), minter, mintTokens);
}
```

์ดํ mintFresh์์๋ Freshness๋ฅผ ํ์ธํ๋ค. accrualBlockNumber๋ interface์ ๋ค์๊ณผ ๊ฐ์ด ์ค๋ช์ด ๋์์๋ค. Block number that interest was last accrued at. ์ฆ interest๊ฐ ๊ณ์ฐ๋ ๋ธ๋ก๊ณผ mint๋ฅผ ์คํํ๋ ๋ธ๋ก์ด ๊ฐ์ ๋ธ๋ก์ด๋ผ๋ ๊ฒ์ ํ์ธํ๋ค. ๊ทธ๋ฆฌ๊ณ  exchangeRate๋ฅผ ๊ฐ์ ธ์ค๊ณ , minter์๊ฒ transferํด์ค๋ค. `doTransferIn`์ transfer๊ณผ ๊ฐ์ functionํด์ค๋ค. ์ฃผ์์ ๋ณด๋ฉด transfer ๋์  doTransferIn์ ๋ฐ๋ก ๋ง๋ค์ด์ ์ฌ์ฉํ ์ด์ ๋ ํน์๋ ์๊ธธ ์ ์๋ side-effects์ ๋๋น๋ฅผ ์ํด์์ด๋ค. ์ดํ doTransferIn์์ ๊ณ์ฐ๋ ์ค์  actualMintAmount๋ฅผ ํ์ฉํ๋ฉฐ mintTokens์ ๊ฐ์ ๊ตฌํ๋ค. 

๋ง์ฝ exchangeRate์ด 0.02 ๋ด๊ฐ ๊ณต๊ธํ๋ ํ ํฐ์ด 100๊ฐ๋ผ๊ณ  ์น๋ค๋ฉด ๋๋ 100/0.02 = 5000์ด ๋๋ ๊ฒ์ด๋ค. ๊ทธ๋ ๊ฒ ๊ตฌํ ๊ฐ์ ํ ๋๋ก cToken์ totalSupply์ minter์ ํ ํฐ ์์ ๋์ ์๋ฐ์ดํธํด์ค๋ค.

์ดํ ์ด๋ฒคํธ ๋ก๊ทธ๋ฅผ ์ฐ๊ณ  mintFresh ํจ์๋ ๋๋๋ค.


## Redeem


<!-- ํ์ง๋ง ์ฝ๋์ compSupplyState๊ฐ ํ๋์ cToken์ ๊ดํ ์ํ๊ฐ์ด๋ผ๋ฉด, compSupplierIndex๋ cToken์ ๋ํ supplier -->


### Ref
- https://docs.olympusdao.finance/main/

```toc

```