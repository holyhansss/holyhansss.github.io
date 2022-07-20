---
emoji: 🧢
title: Compound protocol - 예금, 출금 (mint, redeem)
date: '2022-07-19 20:16:00'
author: 한성원
tags: blog Defi Blockchain DAO Compound mint redeem
categories: Defi
---


# 👋 Compound
본 글에서는 Compound의 예금과 출금 과정의 코드를 line by line으로 분석해 볼 것이다.

## CToken

## 예금 및 출금 시나리오
1. 유저가 Compound에 Dai Token을 예금을 함으로써 이자 수익을 얻고싶어 한다.
2. 유저가 100 Dai를 예금한다.
3. Compound의 cToken 공급 비율에 맞춰 cDai를 유저에게 준다.
4. 1년 후
5. 가지고 있는 CDai와 예금했던 Dai를 교환한다(출금)

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

유저는 `CErc20.sol` 또는 `CEther.sol`과 상호작용한다. 예금시에는 mintInternal이라는 함수를 사용하는 것을 알 수 있다.
`CErc20.sol` 또는 `CEther.sol`에서 mint가 호출되면 `mint -> mintInteral -> mintFresh` 순서로 실행된다. mintInternal과 mintFresh는 CToken.sol에 존재하는 함수이다.

```solidity
    function mintInternal(uint mintAmount) internal nonReentrant {
        accrueInterest();
        // mintFresh emits the actual Mint event if successful and logs on errors, so we don't need to
        mintFresh(msg.sender, mintAmount);
    }
```

mintInternal이 호출되면 가장 먼저 `accrueInterest`라는 함수가 우선적으로 호출된다. `accrueInterest` 함수는 예금(mint), 출금(redeem), 차용(borrow), 상환(repay), 청산(liquidate) 등 주요 기능이 호출된 후 첫번째로 호출된다. 이자율과 관련한 글은 따로 만들어 올리도록 할 것이다. 

그레도 간단하게 설명하자면 총 borrows와 reserves에 누적 이자를 적용한다. 즉 마지막으로 갱신되었던 블록과 현재 블록의 차이를 구하여 이자를 계산하고, 현재 블록넘버를 storage에 저장한다.

이후 mintFresh 함수를 호출한다. 

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

mintFresh 함수에서 mint에 관한 거의 모든 process가 이루어진다. 유저가 마켓에 정해진 Token을 제공함으로써 CToken을 받을 수 있다. 

```solidity
    uint allowed = comptroller.mintAllowed(address(this), minter, mintAmount);
    if (allowed != 0) {
        revert MintComptrollerRejection(allowed);
    }
    ...
```

mintFresh 함수에서는 우선적으로 comptroller의 mintAllowed 함수를 호출하여, mint가 가능한지 확인하다. 

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

mintAllowed 함수에서는 우선적으로 몇가지 확인절차를 거친다. 첫번째로 cToken의 공급이 중지되었는지 확인한다. `mintGuardianPaused[cToken]` 배열(mapping)은 storage 변수로 pauseGuardian 또는 admin이 pause 할 수 있고 admin만 unpause 할 수 있다. ~~아직 Compound의 Governance 관련해서는 보지 못헸는데, 이 부분에도 Governance가 적용되어있는지 궁금하다...!~~

이후 특정 cToken이 market에 등록된 함수인지 확인한다. 만약 등록되지 않은 cToken이라면 Error를 return한다. 좀 더 파고 들어가보면 [_supportMarket](https://github.com/compound-finance/compound-protocol/blob/a3214f67b73310d547e00fc578e8355911c9d376/contracts/ComptrollerG7.sol#L917)이라는 함수가 있는데 이 함수를 통해 market에 cToken이 등록되는 것을 확인해 볼 수 있다.

모든 에러 사항을 확인한 이후 `updateCompSupplyIndex`와 `distributeSupplierComp` 함수를 차례대로 실행시킨다. 우선 `updateCompSupplyIndex` 함수를 확인해보자.

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

`updateCompSupplyIndex` 함수는 바로 다음에 `distributeSupplierComp`에서 쓰일 변수들을 갱신해주는 역할을 한다. supplyState, supplySpeed, blockNumber을 storage에서 가져오고 deltaBlock을 계산한다. 그리고 deltablock와 supplySpeed에 따라 if문이 실행된다. 여기서 DeltaBlock은 `현재 blockNumber - 마지막으로 갱신된 supplyState.block`이다. supplySpeed, 즉 comSpeed[cToken]은 public 함수인 `_setCompSpeed`를 통해 바뀔 수 있으며, admin만이 변경 가능하다.

만약 supplySpeed와 deltaBlocks가 0보다 크다면 새로운 supplySpeed * deltaBlock으로 누적된 comp(compAccrued)의 값을 구한다. 이후 ratio를 구하는데 만약 CToken의 totalSupply가 0보다 크다면 compAccrued/supplyTokens를 통해 ratio를 구하고, 이를 기존의 index값과 더한다. 그리고 새로운 index와 block Number를 compSupplyState에 저장해준다. 

이렇게 `updateCompSupplyIndex` 함수에서 compSupplyState의 값은 `distributeSupplierComp` 함수에서 사용된다. 깃허브에서 코드를 보면 `distributeSupplierComp` 함수에는 다음과 같은 글이 주석처리 되어있다. 

- Calculate COMP accrued by a supplier and possibly transfer it to them

즉, 증가된 COMP를 계산하여 공급자(minter)에 transfer해주는 함수라는 뜻이다.

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
`updateCompSupplyIndex` 함수와 같이 compSupplyState를 불러오고, `updateCompSupplyIndex`에서 자장했던 supplyIndex를 불러온다. 그리고 CompSupplierIndex를 불러오는데, `ComptrollerStorage.sol`을 확인해보면 "The COMP borrow index for each market for each supplier as of the last time they accrued COMP" 라고 설명이 나와있는데, 뭔가 해석을 해봐도 확 와닿지 않는다.~~ㅜㅜ 좀 더 깊이 들어가다보면 알 수 있을까?~~

이후 compound의 comp 제공 로직에 따라 계산한 후 compAccrued 값을 저장한다. compAccrued 값은 나중에 `claimComp` 함수를 통해 유저의 지갑으로 들어간다. 이렇게 두 함수를 거친 후 `mintAllowed` 함수는 0을 return한다. 만약 return 값이 0이 아니라면 revert로 Transaction을 끝낸다. 이제 mintFresh 함수로 돌아와 나머지 부분을 확인해보자!


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

이후 mintFresh에서는 Freshness를 확인한다. accrualBlockNumber는 interface에 다음과 같이 설명이 나와있다. Block number that interest was last accrued at. 즉 interest가 계산된 블록과 mint를 실행하는 블록이 같은 블록이라는 것을 확인한다. 그리고 exchangeRate를 가져오고, minter에게 transfer해준다. `doTransferIn`은 transfer과 같은 function해준다. 주석에 보면 transfer 대신 doTransferIn을 따로 만들어서 사용한 이유는 혹시나 생길 수 있는 side-effects에 대비를 위해서이다. 이후 doTransferIn에서 계산된 실제 actualMintAmount를 활용하며 mintTokens의 값을 구한다. 

만약 exchangeRate이 0.02 내가 공급하는 토큰이 100개라고 친다면 나는 100/0.02 = 5000이 되는 것이다. 그렇게 구한 값을 토대로 cToken의 totalSupply와 minter의 토큰 소유량을 업데이트해준다.

이후 이벤트 로그를 찍고 mintFresh 함수는 끝난다.


## Redeem


<!-- 하지만 코드상 compSupplyState가 하나의 cToken에 관한 상태값이라면, compSupplierIndex는 cToken에 대한 supplier -->


### Ref
- https://docs.olympusdao.finance/main/

```toc

```