# Query Directives

In addition to the standard
[treesitter directives and predicates](https://tree-sitter.github.io/tree-sitter/using-parsers/queries/3-predicates-and-directives.html),
Pruner also implements some other important directives which can be very useful when writing custom injection queries.

## `#offset!`

This directive is taken directly [from Neovim](https://neovim.io/doc/user/treesitter.html#treesitter-directive-offset!)
and effectively enables offsetting the range of a captured node by a defined amount.

**Parameters**:

- `{capture_id}`
- `{start_row}`
- `{start_col}`
- `{end_row}`
- `{end_col}`

**Example**:

```query
(#offset! @injection.content 0 1 0 -1)
```

## `#escape!`

This directive informs pruner that the content of a embedded language should have any occurances of a given character
escaped.

For example, here is some SQL which contains `"` characters embedded in a rust string (surrounded by `"` characters).
The inner SQL chars need escaping.

```rust
let query = "CREATE DOMAIN accounting.kid text COLLATE \"C\"";
```

**Parameters**:

- `{capture_id}`
- `{character}`

**Example**:

```query
(#escape! @injection.content "\"")
```
