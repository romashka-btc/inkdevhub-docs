---
sidebar_position: 1
---

# NFT Contract with PSP34

Using the examples provided, you will build and deploy a NFT smart contract  using ink! with functions commonly seen in NFT projects.
The standard for NFT smart contract will be [PSP34](https://github.com/w3f/PSPs/blob/master/PSPs/psp-34.md) which is very similar to [ERC721](https://docs.openzeppelin.com/contracts/4.x/erc721) and it is written in ink!.
## Prerequisites
This tutorial is suitable for developers with **intermediate** knowledge of ink! and basic understanding of Rust. Previous experience compiling and deploying an ink! smart contract will be beneficial, such as from following the previous Flipper contract tutorial:

| Tutorial                                                                   | Difficulty                     |
|----------------------------------------------------------------------------|--------------------------------|
| Your First Flipper Contract              | Basic ink! -  Basic Rust       | 
| Implement Uniswap V2 core DEX| Advanced ink! - Basic Rust |         

## How to Start
To follow this tutorial you will need:
- To [set up your ink! environment](https://docs.astar.network/docs/build/environment/ink_environment).
- Basic Rust knowledge. [Learn Rust](https://www.rust-lang.org/learn)
- Prior knowledge about ERC721 is helpful but not mandatory.

## What will be used?
- [ink! v4.2.1](https://github.com/paritytech/ink/tree/v4.2.1)   
- [Openbrush 4.0.0-beta](https://github.com/Brushfam/openbrush-contracts/releases/tag/4.0.0-beta)
- cargo-contract 3.0.1

## What will you learn?
- Full implementation of NFT project in ink!.
- Use Openbrush wizard to create PSP34 smart contract.
- File structure for a smart contract with an additional trait.
- Trait and generic implementation in separate files.
- Unit test for smart contract.
- Event handling.

## Summary
I. OpenBrush wizard  
II. Override mint() method
III Custom Trait for mint() 
IV. PayableMint Trait definition 
V. PayableMint Trait implementation  
VI. Events
