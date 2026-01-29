# Plugins

Pruner plugins enable writing formatting behaviour in a way that is fast, versioned, and shareable. A plugin is
essentially just a bundled function that takes source code in and returns altered source code. As Pruner evolves I do
expect the Plugin interface and capabilities to grow beyond this.

Plugins are WASM components that implement the
**[pruner/plugin-api@1.0.0](https://github.com/pruner-formatter/pruner/blob/master/wit/world.wit)**
[WIT](https://component-model.bytecodealliance.org/design/wit.html) interface. You can download the latest interface
definition from the releases page. Plugins can be loaded from disk or from a remote URL.

By using WASM Pruner allows authors to write plugins in any language of their choosing so long as it can be compiled to
a WASM component. See [here](https://component-model.bytecodealliance.org/language-support.html) for a list of known
supported languages.

## Official Plugins

- **[trim-newlines](https://github.com/pruner-formatter/plugin-trim-newlines)** - Trim leading/trailing newlines from
  any language
- **[clojure-comment-formatter](https://github.com/pruner-formatter/plugin-clojure-comment-formatter)** - Format and
  align Clojure comments to the node they correspond to.

## Community Plugins

Feel free to open a PR contributing your own plugin(s)!

## Writing Plugins

See:

- **[Writing plugins](./plugins/writing-plugins.md)**
- **[Writing a plugin in Rust](./guides/writing-a-plugin-in-rust.md)**
