# How to upgrade ink! smart contracts

## Prerequisites

Before this tutorial, it’s highly recommended to go through our tutorials on how to declare, read and write storage, and how to do cross-contract calls. This tutorial targets developers with a basic understanding of ink! and a basic level in Rust.

### To follow this tutorial you will need:

- To [set up your ink! environment](https://docs.inkdevhub.io/docs/learn/build-environment/ink_environment)

### What will we do?

In this tutorial, we will learn upgradeable contract concepts and how to implement them in different ways.

### What will we use?

- [ink! 4.2.0](https://github.com/paritytech/ink/tree/v4.2.0)
- [cargo-contract 3.2.0](https://github.com/paritytech/cargo-contract/tree/v3.2.0)
- [substrate-contracts-node](https://github.com/paritytech/substrate-contracts-node)

# Upgradeable contracts

Let’s talk about upgradeable contracts and understand what they are. 

## What are Upgradeable smart contracts?

As you know all contracts are immutable on chain. Immutability is an essential requirement for achieving [decentralization](https://101blockchains.com/decentralization-in-blockchain/) and [security of smart contracts](https://101blockchains.com/smart-contract-security-guide/). However, it is also important to understand that the immutability of smart contracts creates some prominent limitations if there is a bug in the smart contract, or the contracts is outdated and needs an upgrade. For this reason, upgradeable contracts exist.

## How to implement it?

In ink! there are different ways to make an upgradeable contract:

- Replacing Contract Code with `[set_code_hash()](https://paritytech.github.io/ink/ink_env/fn.set_code_hash.html)`;
- Proxy Forwarding;
- Delegating execution to foreign Contract Code with `[delegate_call](https://paritytech.github.io/ink/ink_env/call/fn.build_call.html#example-3-delegate-call)`.

## set_code_hash()

With `set_code_hash()` you can fully change your contract. The only limit you have is storage compatibility. You may feel free to change the functions’ signatures and logic. It is the easiest way to make a contract upgradeable, you just need to add a message with the `set_code_hash()` function in your contract.

```rust
#[ink(message)]
pub fn set_code(&mut self, new_code_hash: [u8; 32]) {
    ink::env::set_code_hash(&new_code_hash).unwrap_or_else(|err| {
        panic!("Failed to set new code hash: {:?}", err)
    });
}
```

To use this function you need to upload or instantiate another contract code to the network, get the code_hash of it, and call the `set_code(code_hash)` message. After that, your contract will change code_hash, but keep its address. Now you have a completely different contract on the initial address. Note that storage fields that were in the initial contract will keep their values from the previous contract.

## Proxy Forwarding

This concept uses cross-contract calls to upgrade its functionality. In `Proxy` contract you can only pick the address of the contract to which you will forward all calls. `Proxy` is just a re-translator of calls. You can use it to achieve upgradeability, by changing address to a newly deployed upgraded contract. Here is an example of how `Proxy` contract can be implemented:

```rust
#[ink::contract]
mod proxy {
    #[ink(storage)]
    pub struct Proxy {
        /// The `AccountId` of a contract where any call that does not match a
        /// selector of this contract is forwarded to.
        forward_address: AccountId,
        /// The `AccountId` of a privileged account that can update the
        /// forwarding address. This address is set to the account that
        /// instantiated this contract.
        admin: AccountId,
    }

    impl Proxy {
        #[ink(constructor)]
        pub fn new(forward_address: AccountId) -> Self {
            let caller = Self::env().caller();
            Self {
                forward_address,
                admin: caller,
            }
        }

        #[ink(message)]
        pub fn change_forward_address(&mut self, new_address: AccountId) {
            assert_eq!(
                self.env().caller(),
                self.admin,
                "caller {:?} does not have sufficient permissions, only {:?} does",
                self.env().caller(),
                self.admin,
            );
            self.forward_address = new_address;
        }

        #[ink(message, payable, selector = _)]
        pub fn forward(&self) -> u32 {
            ink::env::call::build_call::<ink::env::DefaultEnvironment>()
                .call(self.forward_to)
                .transferred_value(self.env().transferred_value())
                .call_flags(
                    ink::env::CallFlags::default()
                        .set_forward_input(true)
                        .set_tail_call(true),
                )
                .invoke();
            unreachable!(
                "the forwarded call will never return since `tail_call` was set"
            );
        }
    }
}
```

As you see, this version of `Proxy` has an admin field. It is used for the security of the contract. Only the address that has deployed the contract can change `forward_address`. As you see `forward` function is payable, and has `_` selector. It means that the forward function will be called when any unknown selector is called to this contract. In the `forward` function, we call the contract with `contract_address` address and pass to it all of the args and transferred value.

To understand how it works, you can deploy `Proxy` contract and call any message from another deployed contract from `Proxy`, and it will forward your call to this contract.

## Delegating execution to foreign Contract Code with `[delegate_call](https://paritytech.github.io/ink/ink_env/call/fn.build_call.html#example-3-delegate-call)`

This is the most controllable method to implement upgradeable contracts. The idea is to build delegate calls. The main advantage of this method is that you can keep signatures of messages and keep storage compatible for every upgrade. Also, you can use different contract implementations when you call any method because you choose `code_hash` every time.

Here is an example of an upgradeable contract with `delegate_call`:

```rust
#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod upgradeable {
    use ink::env::call::{build_call, ExecutionInput, Selector};
    use ink::env::{CallFlags, DefaultEnvironment};

    #[ink(storage)]
    pub struct Upgradeable {
        value: i32,
    }

    impl Upgradeable {
        #[ink(constructor)]
        pub fn new(init_value: i32) -> Self {
            Self { value: init_value }
        }

        #[ink(message)]
        pub fn get(&self, code_hash: Hash) -> i32 {
            build_call::<DefaultEnvironment>()
                .delegate(code_hash)
                .call_flags(CallFlags::default().set_tail_call(true))
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("get")))
                )
                .returns::<i32>()
                .invoke()
        }

        #[ink(message)]
        pub fn set(&mut self, code_hash: Hash, value: i32) {
            build_call::<DefaultEnvironment>()
                .delegate(code_hash)
                .call_flags(CallFlags::default().set_tail_call(true))
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("set")))
                        .push_arg(value)
                )
                .returns::<()>()
                .invoke()
        }
    }
}
```

Now when you deploy the contract, you can use the logic of any contract that has compatible storage and message signatures. For example, you can upload this contract to network and use its `code_hash`.

```rust
#[ink::contract]
mod contract {
    #[ink(storage)]
    pub struct Contract {
        value: i32,
    }

    impl Contract {
        #[ink(constructor)]
        pub fn new(init_value: i32) -> Self {
            Self { value: init_value }
        }
        
        #[ink(message)]
        pub fn set(&mut self, value: i32) {
            self.value = value;
        }

        #[ink(message)]
        pub fn get(&self) -> i32 {
            self.value
        }
    }
}
```

# Conclusion

Now you know what upgradeable contracts are and how to implement them.
