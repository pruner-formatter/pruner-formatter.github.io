# Writing a Plugin in Rust

This is a short reference on how to write a plugin for Pruner in Rust. For this we will reimplement the
[trim-newlines](https://github.com/pruner-formatter/plugin-trim-newlines) plugin which makes for a perfect, simple
example. Head over to that repository to see the end result of this document.

If you haven't yet, read [Writing Plugins](../plugins/writing-plugins.md) for a quick overview of the plugin API and how
plugins are loaded.

## Create a WASM component crate

First we need to setup the project and for that we need to create a `Cargo.toml` which can be compiled as a WASM
component. Really this just means it needs to be defined as a `cdylib` crate.

```toml
# Cargo.toml
[package]
name = "trim-newlines"
version = "0.0.1"
edition = "2024"
resolver = "2"

[dependencies]
pruner-plugin-api = "1"

[lib]
crate-type = ["cdylib"]
```

## Add initial plugin stub

Next we should create a `lib.rs` file which defines and exports a `Component` struct that implements the `PluginApi`
trait from `pruner-plugin-api`.

```rust
// lib.rs
use pruner_plugin_api::{FormatError, FormatOpts, PluginApi};

struct Component;

impl PluginApi for Component {
    fn format(source: Vec<u8>, _opts: FormatOpts) -> Result<Vec<u8>, FormatError> {
        Ok(source)
    }
}

pruner_plugin_api::bindings::export!(Component);
```

And that's it for a functioning plugin!

## Compile

You can now compile this directly with cargo, making sure to target `wasm32-wasip2`:

```bash
cargo build --release --target wasm32-wasip2
```

Which will output a compiled plugin to `target/wasm32-wasip2/release/trim_newlines.wasm` that is ready to be loaded up
and called by Pruner. Let's add it into our Pruner config:

## Configure Pruner to use it

Add the plugin to `pruner.toml`, then reference it from a language pipeline:

```toml
# pruner.toml
[plugins]
trim_newlines = "file:///path/to/target/wasm32-wasip2/release/trim_newlines.wasm"

[languages]
markdown = ["trim_newlines"]
```

Running Pruner with `--log-level=debug` should show your plugin being loaded and instantiated:

```bash
cat README.md | pruner format --lang markdown --log-level debug
```

It's not doing very much right now, so let's add some actual behaviour to this plugin:

## Added plugin behaviour

Update `format` to strip leading/trailing newlines and add a single trailing newline:

```rust
// lib.rs
use pruner_plugin_api::{FormatError, FormatOpts, PluginApi};

struct Component;

impl PluginApi for Component {
    fn format(source: Vec<u8>, _opts: FormatOpts) -> Result<Vec<u8>, FormatError> {
        let mut start = 0;
        let mut end = source.len();

        while start < end && (source[start] == b'\n' || source[start] == b'\r') {
            start += 1;
        }

        while end > start && (source[end - 1] == b'\n' || source[end - 1] == b'\r') {
            end -= 1;
        }

        let mut result = source[start..end].to_vec();
        result.push(b'\n');
        Ok(result)
    }
}

pruner_plugin_api::bindings::export!(Component);
```

Recompile with `cargo build --release --target wasm32-wasip2` and we are done. Newlines will now be trimmed from our
Markdown files!
