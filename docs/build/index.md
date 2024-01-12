---
title: Build
position: 1
---

import Figure from "/src/components/figure"

# Overview

 <Figure caption="Block Consumption" src={require('./img/banner-build.jpg').default } width="100%" /> 

Welcome to the Build section of the ink! Dev Hub documentation, your comprehensive guide to developing WASM (ink!) smart contracts within the Polkadot and Kusama ecosystems. Here, you'll find all the tools and resources you need to bring your innovative smart contract ideas to life.

From scaffolding your project with Swanky to leveraging DRink!'s minimal runtime for effective contract interactions, this section covers it all. Our goal is to empower you, whether you're a seasoned web3 developer or new to the ecosystem, to seamlessly navigate the complexities of WASM smart contract development.

# Swanky Suite 

Swanky is designed to be the go-to developer tool for every aspect of developing WASM (ink!) smart contracts for Polkadot, from scaffolding to live-net deployment. While some tools currently exist, Swanky's intent is to integrate and extend these tools as necessary, offering a more streamlined, dev-friendly experience.

The development of a smart contract project follows a clear, necessary sequence: scaffolding a new project, building and testing locally, deploying and testing on a test network, and finally deploying on a live network. Swanky is designed to provide support at every stage of this process, making it an indispensable asset for any WASM (ink!) smart contract developer.

# DRink!

DRink! library provides a minimal viable functionality for arbitrary runtime interaction and standard contract-related operations (like code upload, instantiation or calling). DRink! was designed with a particular trade-off in mind: giving up the whole node layer with simultaneously gaining direct access to the runtime. For that, we make use of the existing machinery exposed by the Substrate framework, that before was primarily used for pallet unit testing. We build (in-memory) minimal runtime supporting ink! smart contracts (although the library supports arbitrary ink!-compatible runtime) and expose a convenient, synchronous interface for interacting with the chain.

Since there is no node running in the background, we can benefit from omitting node/network configuration issues, blocktime/finalization delays or overhead coming from asynchronous communication between e2e client and RPC chain service.

DRink! originally came with drink-cli: a command-line tool with terminal graphic interface for local playing with contracts.

