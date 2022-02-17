---
emoji: 🧢
title: Solidity Storage Layout For Proxy Contracts and Diamonds
date: '2022-02-16 11:04:00'
author: 한성원
tags: EVM EthereumVirtualMachine ProxyContracts solidity Diamonds Storage Layout
categories: EVM
---


# 👋 Solidity Storage Layout For Proxy Contracts and Diamonds
이 글은 내가 공부하면서 찾은 [이 글](https://medium.com/1milliondevs/solidity-storage-layout-for-proxy-contracts-and-diamonds-c4f009b6903)을 변역하였다. 이 글은 Ethernaut의 24번 Puzzle Wallet을 풀때 공부했던 것을 봤다. 이 글을 읽기 위해서는 proxy contract에 대한 사전지식이 필요하다. 또한 이 글은 Diamond standard의 저자인 NickMudge의 글이며, Proxy contract의 Storage Layout과 Diamond standard에 대해서 다룬다. 글에는 내가 생각하는 부분이 포함되어있을 수도 있기 때문에, 내 글이 이해가 잘 되지 않는다면 [원문](https://medium.com/1milliondevs/solidity-storage-layout-for-proxy-contracts-and-diamonds-c4f009b6903)을 읽어보는 것을 추천한다.

### 시작
`Storage Layout`은 contract의 상태 변수가 `contract storage`에 저장되는 방법과 저장되는 위치이다.

`Storage Layout`은 우리가 평상시에 contract를 작성할 때는 고려하지 않아도 괜찮다. 왜냐하면 Solidity compiler가 알아서 처리해주기 때문이다.

하지만 `Proxy contract` 또는 `Diamond`를 작성할때는 `Storage layout`을 고려하면 contract를 작성해야한다.

이유를 설명하기 전에 contract storage와 상태변수 Layout에 대해서 먼저 이야기 해보자.1
1. 상태변수의 `Storage Layout`은 Slot 0에서 시작하며 새로운 상태변수마다 증가한다. Ex) 첫번째 상태변수는 Slot 0, 두번째는 Slot 1... (optimize 제외)
2. struct와 array도 지정된 만큼에 공간을 차지하여 storage에 저장된다.
3. 동적 array와 mapping은 동적으로 크기가 변하기 때문에 storage위치와 key의 hash 값을 기반으로 하는 위치에 저장된다.

Storage Layout의 작동 방식에 대한 설명은 [Solidity docs](https://solidity.readthedocs.io/en/v0.6.3/miscellaneous.html)에 잘 나와있다!

즉 Storage Layout은 Slot 0에서 시작하여 새로운 상태변수가 올때마다 증가한다는 것을 알 수 있다.

### Problem
    문제는 Proxy contract와 logic contract가 같은 storage layout을 공유한다는 것이다.

다음 코드는 문제에 대해 설명하기 위한 예시이다.

ProxyA는 2개의 상태변수를 정의한다, facetA와 owner.

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

FacetA는 하나의 상태변수를 정의한다.

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

ProxyA contract는 FacetA에게 함수 호출을 위임(delegate)한다. 이때 문제는 위임시에 ProxyA와 FacetA는 `storage layout`을 공유한다는 것이다. ProxyA의 상태변수 `facet`는 slot 0에 위치한다. 또한 FacetA의 상태변수 `user`도 slot 0에 위치한다. 우리는 setUser를 통해 user만 바뀌는 것을 의도했지만, 만약 `setUser(address newUser)`가 호출된다면 `user`와 `facetA`가 모두 `newUser`로 바뀔 것이다. 

사람들은 이와 같은 문제를 해결하기위해 다양한 패턴을 만들었고 이제부터 그 패턴들에 대해서 설명해보겠다.

### Unstructured Storage
Solidity의 storage는 `assembly`를 통해서 contract storage에 임의로 위치를 정해 value를 저장할 수 있다. 이 패턴은 `Unstructured Storage Pattern`이다. 이 패턴의 예시를 함께 보자

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

위 예시에서는 `get`과 `set` 함수를 이용해 `owner`와 `facetA`을 storage에 저장하고 가져올 수 있다. 우리는 상태변수가 저장되는 장소를 `assembly`를 사용해 지정함으로써 다른 storage 변수와 충돌되지 않도록 한 것이다. 충돌하지 않는다는 장점도 있지만, `Unstructured Storage Pattern`은 몇가지 단점이 존재한다. 
1. 각 storage 변수에 대해서 getter와 setter를 정의해야한다.
2. 단순한 번수들에만 적용이 된다(`uint`, `address` 등). structs와 mappings에는 적용되기 힘들다.


### Inherited Storage
Proxy contract와 logic contract 이외에 storage contract를 배포해 상속(Inherit)하는 방법이다. 이 방법을 사용하면 proxy 와 logic contract가 동일한 상태변수를 선언하기 때문에 충돌이 발생하지 않는다. 아래 예시를 보자!

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

위와 같은 contract를 배포하고 연결한 후에 logic contract를 추가로 생성할 수 있고 새로운 상태변수를 정의할 수도 있다. 이 방법은 새로운 storage contract를 배포하고 이전의 storage contract를 상속하는 방식으로 작동한다. 

예시를 한번 보자!

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

`Storage2`는 ProxyA를 그대로 사용할 수 있다. 왜냐하면 `Storage2`의 새로운 상태변수들은 `Storage1`의 상태변수 뒤에 정의되기 때문이다. 

이 방식도 단점이 존재한다.
1. Logic Contract들은 사용하지 않는 상태변수도 포함되어있는 Storage contract를 상속해야한다. 
2. Logic Contract는 특정 proxy contract와 연결되며 다른 상태변수를 선언하는 proxy cotnract 및 logic contract를 사용할 수 없다. 

<br/>

<!-- 이와 다르게 Diamond Storage는 단점이 존재하지 않는다.
1. Proxy contracts, diamonds, Logic Contract는 자신들이 사용하는 Diamond Storage만 상속하면 된다. 
2. Diamond Storage는 proxy contrat와 Logic Contract를 분리시킬 수 있다. 또한 Diamond Storage를 사용하는 Logic contract는 다른 proxy contract 또는 logic contract와 같이 사용할 수 있다. Diamond Storage는 레고처럼 Logic contract와 proxy contract를 연결하거나 재사용 할 수 있게 해준다. -->

### Eternal Storage
Ethernal Storage는 Solidity의 `mappings`를 사용해 contract storage API를 만드는 것이다. 그래서 Proxy와 logic contract는 API를 이용해 충돌없이 storage를 사용 할 수 있다. 

아래 예시를 보며 더 이해해 보자!

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

위의 예시 같이 우리는 `mappings`를 사용해 상태변수를 저장하고 읽을 수 있다. 이렇게 해도 잘 작동하지만 단점이 분명 존재한다.
1. 상태변수를 다루기 힘든 문법
2. 기본적인 단순한 변수는 쉽게 사용될 수 있지만 `struct`와 `mapping`같은 경우 일반적인 방식으로 작동하지 않는다.
3. Proxy contract와 모든 logic contract는 항상 같은 Storage API를 가지고 있어야한다. 
4. slot 순서대로 저장되는 것이 아니기 때문에 어떤 상태변수가 존재하는지 한눈에 확인할 수 없다.


### Conclusion
사람들은 Procy contract의 Storage Layout을 관리하기 위해 여러가지 방법을 생각해냈다.

어떤 방법이 좋은지는 각자의 상황 및 취향에 따라 다르다. 하지만 어느 방법을 사용하든 단점이 존재한다. 그래서 나온 방법이 Diamond Storage이다. 다음 Post에서는 Diamond Storage에 대해서 다루겠다. Diamond Storage는 위 세가지 방법과 다르게 단점이 존재하지 않는다!  


### My Summary(나에게 하는 말)
Proxy contract에 대해서 공부하며 찾은 글을 번역해보았다. Proxy contract를 처음 접했을 때는 막막하기만 했지만 좋은 글을 여러게 읽고나니 좀 이해가 되는 것 같다. Proxy에 대한 이론을 완벽하게 깨우친 후 직접 upgradable contract도 짜보자 ~~배우면 배울수록 배워야하는게 더 많아지는건 기분탓...?ㅎㅎ~~ 앞으로 꾸준히 배우자! 시간이 안되더라도 하루에 글 하나씩이라도 읽으며 익숙해지자. 화아팅!

```toc

```