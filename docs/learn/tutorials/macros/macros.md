# How to work with ink! smart contract macros

## Prerequisites

Before this tutorial, you should have already completed the [Flipper Tutorial](./flipper-contract/flipper-contract.md). This tutorial targets developers with no experience in ink! and a basic level in Rust.

### To follow this tutorial you will need:

- To [set up your ink! environment](https://docs.inkdevhub.io/docs/learn/build-environment/ink_environment)

### What will we do?

In this tutorial, we will learn how to use macros provided by ink!

### What will we use?

- [ink! 4.2.0](https://github.com/paritytech/ink/tree/v4.2.0)

## #[ink::contract]

The `#[ink::contract]` macro is used to initiate the creation of ink! smart contracts. This macro examines the given smart contract code and produces the required code structure. To use it you just need to define a simple rust module with `#[ink::contract]` macro.

```rust
#[ink::contract]
mod contract {
...
}
```

However, in addition to that, every contract must include storage, at least one constructor, and a message. To define storage you can use `[#[ink(storage)]](https://www.notion.so/How-to-work-with-macro-1f6cad316db64eac8539e261d845901f?pvs=21)` macro, to define the constructor and message you need to use `[#[ink(constructor)]](https://www.notion.so/How-to-work-with-macro-1f6cad316db64eac8539e261d845901f?pvs=21)` and `[#[ink(message)]](https://www.notion.so/How-to-work-with-macro-1f6cad316db64eac8539e261d845901f?pvs=21)` macros.

## #[ink(storage)]

We have a separate tutorial that explains how to define and use storage. 

## #[ink(constructor)]

This macro applies to a method that should return the contract object with the initial storage values. 

```rust
#[ink::contract]
mod contract {
		#[ink(storage)]
		pub struct Contract {
				...
		}
		
		impl Contract {
				#[ink(constructor)]
				pub fn new(args...) -> Self { ... }
	
				#[ink(constructor)]
				pub fn another_constructor() -> Self { ... }

				...
		}
}
```

The contract may define multiple constructors, allowing users to instantiate it in various ways.

## #[ink(message)]

The `#[ink(message)]` attribute is used to flag a method for the ink! storage struct as a message, allowing it to be called by the contract's API. It is important to note that all public functions must use this attribute. At least one method must be defined with `#[ink(message)]`. Methods marked with `#[ink(message)`] are special, because they can be dispatched when the contract is invoked. The ink! messages defined for an ink! smart contract determine its API surface for user interaction. Multiple ink! messages can be defined for an ink! smart contract. An ink! message with a `&self` receiver can only read state, while an ink! message with a `&mut self` receiver can mutate the contract's storage.

```rust
#[ink::contract]
mod contract {
		#[ink(storage)]
		pub struct Contract {
				...
		}
		
		impl Contract {
				...
				#[ink(message)]
				pub fn can_mutate_storage(&mut self, from: AccountId) {
				    ...
				}

				#[ink(message)]
				pub fn can_only_read_storage(&self, from: AccountId) {
						...
				}
		}
}
```

The return value of a message must implement `scale::Encode`. It is important to understand that the collections under `ink_storage`, such as `Vec` or `HashMap`, do not implement `scale::Encode`. This means that you cannot simply return a `Vec` from an ink! message. This restriction is intentional, as returning a complete data structure with potentially unbounded content is an anti-pattern for smart contracts due to unpredictable gas costs. If you truly need to return a data structure in its entirety, then use the ones from `ink_prelude` (for example, `ink_prelude::vec::Vec`), as they implement `scale::Encode`.

```rust
#[ink::contract]
mod contract {
		#[ink(storage)]
		pub struct Contract {
				...
		}
		
		impl Contract {
				...
				#[ink(message)]
				pub fn can_mutate_storage(&mut self, from: AccountId) {
				    ...
				}

				#[ink(message)]
				pub fn can_only_read_storage(&self, from: AccountId) {
						...
				}
		}
}
```

## #[ink(selector = …)]

By default, ink! creates a selector for each message and constructor, which is necessary for invoking functions in the compiled Wasm blob. The `selector` attribute allows specifying a dispatch selector for the entity, giving control over API selectors and the ability to rename APIs without causing breakage.

Selectors must be `u32` decodable integers, such as `selector = 0xCAFEBABE` or `selector = 42`. An exception is a fallback selector `_`, which allows contract calls not matching any other message selectors to be dispatched to a fallback message. Fallback messages can be `[payable](https://www.notion.so/How-to-work-with-macro-1f6cad316db64eac8539e261d845901f?pvs=21)`.

```rust
#[ink(message, selector = 0xABCD123)]
fn message(&self) {}

#[ink(message, selector = 5552)]
fn another_message(&self) {}

#[ink(message, payable, selector = _)]
fn fallback(&self) {}
```

## #[ink(payable)]

The ink! message allows receiving value as part of the call. Ink! constructors are implicitly payable due to the initial endowment required by a contract. By default, an ink! message will reject calls that try to add additional funds to the smart contract. However, the authors of ink! smart contracts can make an ink! message payable by adding the `payable` flag to it. It's important to note that ink! constructors are always implicitly payable and thus cannot be flagged as such.

```rust
#[ink(message, payable)]
pub fn payable_message(&self) {
		//stores the amount of token transferred to this message
    let transferred_value = self.env().transferred_value();
}
```

## #[ink(default)]

This feature is applicable to ink! messages and constructors. It serves as a hint for UIs to determine whether a constructor or message should be selected as the default option. Only one constructor or message can be marked as the default.

```rust
#[ink(constructor, default)]
pub fn default_constructor(&self) {    
}

#[ink(message, default)]
pub fn default_message(&self) {    
}
```

## #[ink(event)]

We have a separate tutorial that explains how to define events. You can find it [here](../define-events/define-events.md).

## #[ink(topic)]

Fields in ink! events can be designated as topics, prompting the ink! codegen to create a topic hash for the specified field. Each ink! event is limited to a certain number of these topic fields. This functionality is similar to indexed event arguments in Solidity.

```rust
#[ink(event)]
pub struct Transferred {
    #[ink(topic)]
    from: Option<AccountId>,

    #[ink(topic)]
    to: Option<AccountId>,

    amount: Balance
}
```

## #[ink(anonymous)]

This attribute applies to ink! events and directs the ink! codegen to treat the ink! event as anonymous, excluding the event signature as a topic upon emitting. This behavior closely resembles anonymous events in Solidity.

In ink!, anonymous events have similar semantics as in Solidity, which means that their event signature will not be included in their event topics serialization, reducing event emitting overhead. This functionality is particularly useful for user-defined events.

By default, the event signature is one of the topics of the event, unless the event is annotated with `#[ink(anonymous)]`. This attribute implies that it is not possible to filter for specific anonymous events by name.

```rust
#[ink(event)]
#[ink(anonymous)]
pub struct Event {
    #[ink(topic)]
    state: StateEnum,
    value: i32,
}
```

## #[ink(impl)]

This attribute is designed for a specific scenario that is rarely required. It can be used on ink! implementation blocks to make ink! aware of them. This is particularly useful for implementation blocks that don't contain any other ink! attributes, as they would otherwise be flagged by ink! as a Rust item. By adding `#[ink(impl)]` to such implementation blocks, they are treated as ink! implementation blocks, allowing access to the environment, etc.

It's important to note that ink! messages and constructors still need to be explicitly flagged as such.

```rust
#[ink::contract]
mod contract {
    #[ink(storage)]
    pub struct Contract {
        ...
    }

    impl MyStorage {
	      #[ink(constructor)]
	      pub fn constructor() -> Self {
	          ...
	      }
	
	      #[ink(message)]
	      pub fn message(&self) {
	          ...
	      }
    }

		#[ink(impl)]
    impl MyStorage {
        fn method(&self) -> i32 {
            ...
        }
    }
}
```

## #[ink(namespace = "…")]

Applicable to ink! trait implementation blocks for disambiguating other trait implementation blocks with equal names. This modifies the resulting selectors for all the ink! messages and ink! constructors within the trait implementation, allowing for disambiguation between trait implementations with overlapping messages or constructor names.

```rust
#[ink(namespace = "namespace_name")]
impl SomeTrait for Contract {
    #[ink(message)]
    fn message(&self) {}
}
```

# Conclusion

Now you have the knowledge of when and how to use the ink! macros.
