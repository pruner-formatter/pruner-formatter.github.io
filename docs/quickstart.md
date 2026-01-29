# Quick Start

A configuration file is required for pruner to do anything when presented with source code. Without one pruner will just
return the presented text verbatim.

For this example lets configure Pruner to format the following Markdown document which contains some embedded
JavaScript:

::: code-group
````markdown [hello-world.md]
Hello, 
world!

```javascript
console.log(  "Hello, world"  )
```
````
:::

The only external formatter we require for this is `prettier` which conveniently understands how to format both of these
languages. We also need the Markdown treesitter grammar so that Pruner can parse out the embedded JS code region.

Add the following config to `$XDG_CONFIG_HOME/pruner/config.toml` (or `~/.config/pruner/config.toml`):

::: code-group
```toml [~/.config/pruner/config.toml]
[grammars]
markdown = "https://github.com/tree-sitter-grammars/tree-sitter-markdown"

# Instruct pruner on how to invoke the `prettier` binary
[formatters]
prettier = { cmd = "prettier", args = [
  "--prose-wrap=always",
  "--print-width=$textwidth",
  "--parser=$language",
] }

# Instruct pruner to use the `prettier` formatter for both markdown and javascript
[languages]
markdown = ["prettier"]
javascript = ["prettier"]
```
:::

Pruner reads from stdin and writes to stdout.

```bash
cat hello-world.md | pruner format --lang markdown > hello-world.md
cat hello-world.md
```

::: code-group
````markdown [hello-world.md]
Hello, world!

```javascript
console.log("Hello, world");
```
````
:::

And we can see `pruner` has successfully formatted both the outer Markdown document as well as the inner JavaScript code
region!
