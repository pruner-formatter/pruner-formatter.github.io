# Ignoring Regions

Sometimes you want Pruner to skip formatting specific embedded regions.

Pruner supports this in two ways:

- A simple `pruner-ignore` marker comment (works for any grammar where the marker is parsed as a comment node)
- Optional Tree-sitter ignore queries (`pruner/ignore.scm`) for more precise control

## Marker Comments (`pruner-ignore`)

If Pruner sees a comment node whose text contains `pruner-ignore`, it will ignore the next named sibling node (skipping
over any adjacent comment nodes)

This lets you put a marker comment directly above, or above any parent of, an embedded region and pruner will ignore it.

Example (Rust):

```rust
fn main() {
  // pruner-ignore
  let query = "SELECT * FROM USER;";
}
```

Or placed on the function, it will be inherited by all children:

```rust
// pruner-ignore
fn main() {
  let query = "SELECT * FROM USER;";
}
```

## Ignore Queries (`pruner/ignore.scm`)

For grammars that need special handling, Pruner will also try to load an optional ignore query:

`<query_path>/<language>/pruner/ignore.scm`

This is resolved from your configured `query_paths` the same way custom injection queries are.

If the file starts with `;; extends`, it will be appended to any earlier ignore query found in the search paths;
otherwise it replaces it.

### Captures

Pruner recognizes two captures in `pruner/ignore.scm`:

- `@pruner.ignore`
  - The captured node range is ignored.
- `@pruner.ignore.marker`
  - The captured node acts like a marker comment: Pruner ignores the marker itself plus the next named sibling node
    (skipping adjacent comment nodes).

### Examples

Ignore a specific node directly:

```query
((fenced_code_block) @pruner.ignore)
```

Treat an HTML block containing `pruner-ignore` as a marker:

```query
((html_block) @pruner.ignore.marker
  (#match? @pruner.ignore.marker "pruner-ignore"))
```

The above query is especially useful for Markdown as Markdown doesn't natively define `comment` nodes in its grammar and
so we need to define them explicitly for Pruner to handle them correctly.
