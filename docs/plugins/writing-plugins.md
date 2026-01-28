# Writing Plugins

Pruner plugins are WASM components that implement the `pruner/plugin-api` WIT interface. You can find the source for the
WIT interface [here](https://github.com/pruner-formatter/pruner/blob/master/wit/world.wit).

The interface is straight-forward requiring you to implement only a `format` function which takes in source code as a
byte-array and should return the formatted result as a byte-array.

## Rust

If you are building this in Rust, Pruner exposes a
[pruner-plugin-api](https://github.com/pruner-formatter/pruner/tree/master/crates/plugin-api) crate containing all the
generated interfaces which you can reference without needing to know anything about WASM or WIT.

For a full, end-to-end walkthrough, see:

- [Writing a Plugin in Rust](../guides/writing-a-plugin-in-rust.md)

## I want to write plugins in $LANGUAGE!

Theoretically anything that can compile to WASM components should be usable to write plugins for Pruner. There is no
official documentation in Pruner for how to do this - but I would be happy to accept contributions to that effect.

You can find some great WASM components documentation for other languages
[here](https://component-model.bytecodealliance.org/language-support.html) which should be enough to get going.
