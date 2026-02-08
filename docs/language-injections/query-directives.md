# Query Directives

In addition to the standard Tree-sitter [directives and predicates][treesitter-directives], Pruner also implements some
other important directives which can be very useful when writing custom injection queries.

## `#offset!`

This directive is taken directly [from Neovim][neovim-offset] and effectively enables offsetting the range of a captured
node by a defined amount.

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

This directive informs Pruner that the content of an embedded language should have any occurrences of a given character
escaped.

For example, here is some SQL which contains `"` characters embedded in a Rust string (surrounded by `"` characters).
The inner SQL chars need escaping.

```rust
fn main() {
  let query = "CREATE DOMAIN accounting.kid text COLLATE\"C\"";
}
```

**Parameters**:

- `{capture_id}`
- `{character}`

**Example**:

```query
(#escape! @injection.content "\"")
```

## `#gsub!`

This directive rewrites a captured string value using a Lua `string.gsub`-style pattern and replacement.

Pruner supports this for rewriting the text of captures like `@injection.language` (for example, stripping a comment
prefix like `#` and extra whitespace).

This directive is also taken from Neovim, which is why it accepts a `lua-pattern` instead of the same regex match as
native treesitter `#matches?` directive. This is done in order to accept queries from nvim-treesitter's large corpus of
language queries.

**Parameters**:

- `{capture_id}`
- `{lua_pattern}`
- `{replacement}`

**Example**:

```query
(#gsub! @injection.language "#%s*([%w%p]+)%s*" "%1")
```

## `#trim!`

This directive trims whitespace from the start and/or end of a captured range.

By default (one-arg form), Pruner trims whitespace-only lines at the end of the capture. This is useful when the capture
includes a trailing newline and indentation before a closing delimiter.

**Parameters**:

- `{capture_id}`

**Example**:

```query
(#trim! @injection.content)
```

You can also specify a 4-flag form to trim linewise and/or charwise at each end.

**Parameters**:

- `{capture_id}`
- `{start_linewise}` ("0" or "1")
- `{start_charwise}` ("0" or "1")
- `{end_linewise}` ("0" or "1")
- `{end_charwise}` ("0" or "1")

**Example**:

```query
(#trim! @injection.content "1" "0" "1" "0")
```

## Query Properties

Some behaviors are enabled via query properties set with `#set!`.

### `injection.combined`

When a pattern has multiple `@injection.content` captures that should be treated as one injected region, you can mark
the pattern as combined.

This is useful when the embedded language content is split into multiple fragments (for example, across adjacent string
fragments).

**Example**:

```query
(#set! injection.combined)
```

### `pruner.injection.indented`

This property tells Pruner to apply additional whitespace trimming to the injected range before running embedded
formatters.

This is intended for languages/constructs where the captured region typically starts with a newline after an opening
delimiter and ends with indentation before a closing delimiter. For example, nix embeddings:

```nix
{}: let
  embeddedTs =
    # ts
    ''
      console.log("hello");
    '';
```

**Example**:

```query
(#set! pruner.injection.indented)
```

[treesitter-directives]:
  https://tree-sitter.github.io/tree-sitter/using-parsers/queries/3-predicates-and-directives.html
[neovim-offset]: https://neovim.io/doc/user/treesitter.html#treesitter-directive-offset!
