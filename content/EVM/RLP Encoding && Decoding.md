---
emoji: 🧢
title: RLP Encodeing && RLP Decoding
date: '2023-01-17 19:09:00'
author: 한성원
tags: EVM Ethereum Virtual Machine EthereumVirtualMachine
categories: EVM
---


# RLP Encoding && Decoding

Recursive Length Prefix

RLP는 직렬화(serialization) 기법으로 이더리움 네트워크에서 통신을 주고 받을 때 사용된다. 이더리움의 데이터는 RLP로 통일되어있고, transaction 전송, 블록 state, receipt 저장, DB 저장 등에 사용된다. 

RLPEncode와 RLPDecode를 하는 규칙은 각각 5가지 방법이 존재하며, item이라는 단위를 사용하고 있다.

## **RLP Encode**

1. 1 Byte Data
    
    1 byte data 는 ASCCI 코드를 그대로 사용한다. 즉, **[0x00~0x7f]** 사이의 값이다.
    
    > RLP(”0x01”) = 0x01
    > 
    > RLP(”a”) = 0x61
    > 
2. String Data (0 ~ 55 bytes)
    
    String Data의 길이가 0~55 bytes인 경우, **0x80 + String Data의 Length 값**을 첫번째 byte로 사용한다. 즉, 첫번째 byte는 **[0x80 ~ 0xb7]** 사이의 값이다.
    
    > RLP(”hello world”) = [**0x8b**, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64]
    > 
    > - **0x8b** 라는 첫번째 byte 값은 0x80 + Length of String이다. 즉 0x80 + 0x0b = **0x8b**
    > - Hex 0x0b는  = Dec의 11 값이다.
3. String Data ( > 55 bytes)
    
    String Data 가 55 bytes 보다 큰 경우, **0xb7 + bytes of String Data Legth** 값을 첫번째 byte로 사용한다. 즉 첫번째 byte는 [0xc1, 0xf7] 사이의 값이다. 규칙 1번과 2번과 다르게 item이 3파트로 나누어진다. 첫번째 파트는 위에 말한 값이고, 두번째 byte는 **bytes of String Data Length**가 들어간다. 이후 String에 대한 값을 이어붙인다.
    
    > RLP(”aaaa…..”) = [**0xb9**, **0x04**, **0x00**, 0x61, 0x61, 0x61, 0x61, …]
    > 
    > - “a” 1024개로 이루어진 string 값
    > - Hex 0x0400은 Dec의 1024이다. 0x0400은 **0x04, 0x00**으로 나눌 수 있다.
    > - 0x04와 0x00은 총 2 bytes로 첫번째 byte는 0xb7 + 0x02 = **0xb9**
4. Array Data: 1,2,3 규칙을 통해 RLP Encode된 item의 총 합의 길이 (0~55 bytes)
    
    Array의 item이 Encode된 아이템의 총 길이가 0~55 bytes 사이인 경우, **0xc0 + total bytes of RLPEncoded item** 값을 첫번째 byte로 사용한다. 즉 첫번째 byte는 [0xc1, 0xf7] 사이의 값이다. 두번째 byte부터는 RLP Encode 된 item을 이어붙인다. 
    
    > RLP([“**hello**”, “**world**”]) = [**0xcc**, **0x85, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x85, 0x77, 0x6f, 0x72, 0x6c, 0x64**]
    > 
    > - RLP(”**hello**”) = [0x85, 0x68, 0x65, 0x6c, 0x6c, 0x6f] ← Rule #2
    > - RLP("**world**") = [0x85, 0x77, 0x6f, 0x72, 0x6c, 0x64] ← Rule #2
    > - 각각 RLPEncode된 길이는 6이므로, **0xc0** + 0x06 + 0x06 = **0xcc**
5. Array Data: 1,2,3 규칙을 통해 RLP Encode된 item의 총 합의 길이 ( > 55 bytes)
    
    Rule #3와 비슷하게 총 3 파트로 나누어져있다. 
    
    Array의 item이 Encode 된 총 길이가 55 bytes보다 큰 경우, **0xf7 + total bytes of RLP Encoded items** 값을 첫번재 byte로 사용한다. 두번째 파트에서는 bytes는 RLPEncode 된 item의 총 길이를 이어붙인다. 막지막 3번째 파트에서는 각각 item의 RLPEncode 된 값을 이어붙인다.
    
    > RLP("a...", "a...") = [**0xf8, 0x66, 0xb2, 0x61..., 0xb2,, 0x61..**.]
    > 
    > - “a…” = “a” 50개로 이루어진 값
    > - RLP(”a…”) = [**0xb2, 0x61, 0x61, 0x61 …**] ← Rule#2
    > - **0xf8** = **0xf7** **+ 0x01**
    > - 0x01 = “a” 50개로 이루어진 배열이 RLPEncode 된다면 총 길이는 0x33 이다. 총 배열의 아이템이 2개임으로 0x33 +0x33 = 0x66이다. 이때 0x66은 1 byte 임으로 첫번째 bytes를 구할 때 다음과 같은 식을 사용한다. **0xf7** **+ 0x01** = **0xf8**
    > - **0x66** = Total bytes of RLPEncoded items

## **RLP Decode**

RLPDecode를 할때의 규칙은 RLPEncode의 규칙의 역과정이다. 

 

RLP Decode는 RLP Encode의 개념만 확실하다면 쉽게 할 수 Deocde 할 수 있다.

Decode는 다음과 같은 과정을 거친다.

1. 입력된 RLP Encode된 첫번째 byte의 종류에 따라 데이터의 타입(Byte, String, Array)과 데이터의 길이(item의 갯수)를 파악한다.
2. 파악한 데이터의 타입과 offset에 따라 decoding한다.
3. 나머지 데이터를 디코딩 한다.

 첫번째 byte에 따라 다른 디코딩 방법이 적용된다.

| 첫번째 byte | Decoding 방법 | Encode Rule |
| --- | --- | --- |
| [0x00~0x7f] | 값 그 자체가 문자데이터(ASCCI)이다. | # 1 |
| [0x80, 0xb7] | 첫번째 byte에서 0x80을 뺀 값이 문자열의 길이이고, 길이 만큼 문자열 데이터가 들어있다. | # 2 |
| [0xb8, 0xbf] | 첫번째 byte에서 0xb7을 뺀 값이 byte로 표현된 RLP item의 갯수, 그 갯수만큼 문자가 이어진다. | # 3 |
| [0xc0, 0xf7] | 첫번째 바이트에서 0xc0를 뺸 값이 배열의 갯수, 이후 Decode 규칙 1,2,3번을 활용해 deocde 가능 | # 4 |
| [0xf8, 0xff] | 첫번째 바이트에서 0xf7을 뺀값이 아이템의 갯수, 모든 배열의 item의 갯수, 배열은 RLP Encoding 된 값으로 규칙 1,2,3번 활용해 decode 가능 | # 5 |

- - -

## Ref 

[https://ihpark92.tistory.com/47](https://ihpark92.tistory.com/47)

[https://medium.com/ethereum-core-research/rlp-이해하기-1c05a8150a04](https://medium.com/ethereum-core-research/rlp-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0-1c05a8150a04)

[https://meongae.tistory.com/90](https://meongae.tistory.com/90)

## Tools Used

Hex to Dec: [https://www.rapidtables.com/convert/number/hex-to-decimal.html](https://www.rapidtables.com/convert/number/hex-to-decimal.html)

Byte Counter: [https://mothereff.in/byte-counter](https://mothereff.in/byte-counter)

RLP Enoder and Decoder: [https://toolkit.abdk.consulting/ethereum#rlp](https://toolkit.abdk.consulting/ethereum#rlp)


```toc

```