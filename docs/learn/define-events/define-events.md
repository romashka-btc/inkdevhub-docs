# Prerequisites

Before this tutorial, you should have already completed the [Flipper Tutorial](https://docs.astar.network/docs/tutorials/flipper_tutorial). This tutorial targets developers with no experience in ink! and a basic level in Rust.

## To follow this tutorial you will need:

- To [set up your ink! environment](https://docs.inkdevhub.io/docs/learn/build-environment/ink_environment)

## What Will We Be Doing?

In this tutorial we will implement events, using the most basic contract [Flipper](https://github.com/paritytech/ink/blob/v4.0.0/examples/flipper/lib.rs) as an example.

## What Will We Use?

- [ink! 4.2.0](https://github.com/paritytech/ink/tree/v4.2.0)
- [cargo-contract 3.2.0](https://github.com/paritytech/cargo-contract/tree/v3.2.0)
- [substrate-contracts-node](https://github.com/paritytech/substrate-contracts-node)

## What Will You Learn?

You will learn how to define contract events.

# Events

This is a step-by-step explanation of how to implement events in ink! smart contracts.

## What are Events?

Smart contract events refer to a feature in blockchain-based smart contracts that allows them to emit signals or notifications when specific conditions are met. Events in smart contracts provide a way for external entities, such as other smart contracts or off-chain applications, to be notified when certain actions or state changes occur within the contract.

## Types Used in Events

In Events we can use the same types as in Storage:

- Rust primitives type
    - `bool`
    - `u{8,16,32,64,128}`
    - `i{8,16,32,64,128}`
    - `String`
- Substrate specific types:
    - `AccountId`
    - `Balance`
    - `Hash`
- ink! provided
    - `Vec`
- Custom data structure [details](https://use.ink/datastructures/custom-datastructure)

## Examples

Let’s take a look at the [Psp22 contract](https://github.com/w3f/PSPs/blob/master/PSPs/psp-22.md). There are two events used in Psp22:

- Transfer: event emitted when a token transfer occurs. It has 3 arguments: `from`, `to`, and `value`. Where `from`- address of account which sends tokens, `to` - address of account which receives tokens, and `value` is the amount of tokens.
- Approve: event emitted when an approval occurs that `spender` is allowed to withdraw up to the amount of `value` tokens from `owner`. It has 3 arguments: `owner`, `spender`, and `value`. Where `owner`- the address of the account that owns tokens, `sender`- the address of the account that gets an allowance to spend tokens from the `owner`'s account, and `value` is the amount of tokens.

# How to Define and Use Events?

Let’s create a learning contract to understand how events work.

## 1. Flipper Smart Contract

In a new project folder, execute the following:

```bash
cargo contract new flipper # flipper is introduced from the beginning.
```

## 2. Define an Event

Let's define an event that will be emitted when the flipper is flipped. Events are just structs with the `#[ink(event)]` attribute and a `#[ink(topic)]` attribute on each field that should be indexed.

```rust
/// Emitted whenever the stored value changes by a call to the `flip` or `new` methods.
#[ink(event)]
pub struct Flip {
    #[ink(topic)]
    status: bool,
}
```

Then we can emit the event in the `flip` function.

```rust
pub fn flip(&mut self) {
    self.value = !self.value;
    
    // Emit the `Flip` event.
    self.env().emit_event(Flip {
        status: self.value,
    });
}
```

## 3. Build and Deploy a Contract

Now, we can compile the contract and deploy it by [Substrate Contracts UI](https://contracts-ui.substrate.io/) to test it. Run the following command to compile the contract:

```bash
cargo contract build
```

Then run your local Substrate node:

```bash
substrate-contracts-node --dev
```

Finally, deploy the contract with [Substrate Contracts UI](https://contracts-ui.substrate.io/). Let's flip the flipper and check the events emitted by the contract. As you can see, the event is emitted when the flipper is flipped and now we have the status `true`.

We can flip it again and check the events emitted by the contract. As you can see, the event is emitted when the flipper is flipped and now we have the status `false`.


## 4. Change event field

Let's make some changes to the contract and emit another event. Now we will store an integer value in the contract.

```rust
#[ink(storage)]
pub struct Flipper {
    value: i32,
}
```

Also, we need to update the `new` function to initialize the `number` field and replace the flip function with a `set` function that will set the value of the `number` field to change `bool` to `i32` in a `get` function.

```rust
#[ink(constructor)]
pub fn new(init_value: i32) -> Self {
    Self {
        value: init_value,
    }
}

impl Flipper {
    ...
    
    #[ink(message)]
    pub fn set(&mut self, new_value: i32) {
        self.value = new_value;
    }
    
    #[ink(message)]
    pub fn get(&self) -> i32 {
        self.value
    }
}
```

## 5. Define advanced event

Let's define an event that will be emitted when the value is set. And we will make it more advanced.

```rust
#[ink(event)]
pub struct Set {
    #[ink(topic)]
    old_value: i32,
    #[ink(topic)]
    new_value: i32,
    account: AccountId,
}
```

Then we can emit the event in the `set` function.

```rust
#[ink(message)]
pub fn set(&mut self, new_value: i32) {
    let old_value = self.value;
    self.value = new_value;

    self.env().emit_event(Set {
        old_value,
        new_value,
        account: self.env().caller(),
    });
}
```

This event will be emitted when the value is set. Let's compile the contract and deploy it by [Substrate Contracts UI](https://contracts-ui.substrate.io/) and call the `set` function.

As you can see, the event is emitted when the value is set and we can see the old value, the new value, and the account that is called the `set` function.

# Conclusion

Now you know how to define events in ink! smart contracts. You can check the full code of the contract [here](https://www.notion.so/How-to-define-events-bd4a04049a6a407a8674e33e53e59d57?pvs=21).
