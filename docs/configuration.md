# Configuration File

Pruner is configured with a TOML file.

By default, Pruner loads configuration from (in this order):

- A `pruner.toml` file at or in a parent of the current working directory
- A user-level config file placed at `$XDG_CONFIG_HOME/pruner/config.toml`. This will be merged with project-level
  config files
- A config file specified through the `--config` flag passed when calling format. If specified, this will be the only
  config used.

## Merging and Path Resolution

When Pruner merges multiple config files:

- Arrays are concatenated.
- Tables are merged by key; the later config wins on conflicts.
- `grammar_download_dir` and `grammar_build_dir` are overwritten by the later config when present.

All relative paths in a config file are resolved relative to that file's directory.

## Simple Example

```toml
query_paths = ["queries"]

[grammars]
markdown = "https://github.com/tree-sitter-grammars/tree-sitter-markdown"

[formatters]
prettier = { cmd = "prettier", args = [
  "--print-width=$textwidth",
  "--parser=$language",
] }

[languages]
markdown = ["prettier"]
```

## `query_paths`

Array of filesystem paths to search for custom injection queries.

Default: `[]`

Pruner resolves injections from:

`<query_path>/<language>/injections.scm`

```toml
query_paths = ["queries"]
```

## `grammar_paths`

Array of filesystem paths that contain compiled Tree-sitter grammars.

Default: `[]`

```toml
grammar_paths = ["grammars"]
```

## `grammar_download_dir`

Directory where grammar git repos are cloned.

Default: `$XDG_DATA_HOME/pruner/grammars` (or `~/.local/share/pruner/grammars`)

```toml
grammar_download_dir = "./.pruner/grammars"
```

## `grammar_build_dir`

Directory where cloned grammars are built and their compiled artifacts are stored.

Default: `$XDG_DATA_HOME/pruner/build` (or `~/.local/share/pruner/build`)

```toml
grammar_build_dir = "./.pruner/build"
```

## `[grammars]`

Mapping of `language -> grammar spec`.

Default: `{}`

Pruner uses Tree-sitter grammars to parse the root document and discover embedded language regions via injection
queries. Unlike a formatter binary (which you provide via `[formatters]`), a grammar is a git repository containing a
Tree-sitter parser.

Grammar spec forms:

- String URL
- Table with `url` and optional `rev`

Defaults:

- `rev`: no default (omitted means "use the repo default")

```toml
[grammars]
rust = "https://github.com/tree-sitter/tree-sitter-rust"
sql = { url = "https://github.com/derekstride/tree-sitter-sql", rev = "gh-pages" }
```

### Grammar Download and Build

On startup (e.g. `pruner format ...`), Pruner ensures the grammar repositories exist on disk. Each configured grammar is
cloned into `grammar_download_dir/<language>` using a shallow clone (`git clone --depth 1`). If a `rev` is provided,
Pruner passes it to `git clone --revision <rev>`.

This clone step is "first run only" for a given directory: if the target directory already exists, Pruner will not fetch
updates.

After cloning, Pruner loads grammars by scanning all directories under:

- `grammar_paths` (if any)
- plus the downloaded grammars directory (`grammar_download_dir`)

For each grammar directory, Pruner uses `tree-sitter-loader` to find language configurations and compile/load the parser
from the grammar's `src/` directory. Compiled parser artifacts are written into `grammar_build_dir`.

### Injection Queries

Once a grammar is loaded, Pruner also loads its injection query. The "base" injection query comes from the grammar
repository itself (via the grammar's configured injection query files). You can then override or extend that query with
your own files under `query_paths/<language>/injections.scm`.

If your custom `injections.scm` starts with `;; extends`, Pruner appends it to the base query. Otherwise, it replaces
the base query entirely.

This is how Pruner discovers embedded languages (for example, fenced code blocks in Markdown).

## `[formatters]`

Mapping of `name -> formatter spec`.

Default: `{}`

Formatter spec keys:

| Key              | Type             | Default    | Meaning                                                                                   |
| ---------------- | ---------------- | ---------- | ----------------------------------------------------------------------------------------- |
| `cmd`            | string           | (required) | Executable name/path                                                                      |
| `args`           | array of strings | (required) | CLI args (use `[]` for none)                                                              |
| `stdin`          | bool             | `true`     | Send source on stdin; if `false`, Pruner writes to a temp file and you should use `$file` |
| `fail_on_stderr` | bool             | `false`    | Treat any stderr output as an error                                                       |

Argument template variables:

| Variable     | Meaning                                        |
| ------------ | ---------------------------------------------- |
| `$textwidth` | The effective print width for this region      |
| `$language`  | The language name being formatted              |
| `$file`      | Temp file path (only set when `stdin = false`) |

How substitution works:

Pruner doesn't do any special parsing of your formatter arguments. Instead, it takes each element of `args` and runs a
plain string replacement pass over it right before spawning the process. This means you can embed template variables
anywhere inside an argument (for example, `"--parser=$language"`).

`$language` is replaced with the language currently being formatted.

`$textwidth` is replaced with the effective print width for the current region. For the root document, that's the CLI
`--print-width`. For injected regions, Pruner subtracts the computed indentation from `--print-width` so embedded code
wraps correctly, and clamps the result to at least 1.

`$file` exists for formatters that require a filename rather than stdin. When `stdin = false`, Pruner writes the region
to a temporary file, replaces `$file` with that path, runs the formatter, then reads the file back as the formatter
output. When `stdin = true` (the default), `$file` expands to an empty string.

```toml
[formatters]
# Reads from stdin; uses region-aware width and language.
prettier = { cmd = "prettier", args = [
  "--print-width=$textwidth",
  "--parser=$language",
] }

# Tools like stylua generally expect a filename.
stylua = { cmd = "stylua", args = ["$file"], stdin = false }
```

## `[plugins]`

Mapping of `name -> plugin spec`.

Default: `{}`

Plugin spec forms:

- String URL
- Table with `url`

Plugins are WASM components implementing the Pruner plugin API.

Each plugin entry is loaded by name, and then referenced from `[languages]` the same way as a normal formatter.

Plugin URLs support:

- `https://...` and `http://...`
- `file:///absolute/path/to/plugin.wasm`

When you use a remote URL, Pruner downloads the component into its data cache directory (it is not currently
configurable):

- Default cache dir: `$XDG_DATA_HOME/pruner/cache` (or `~/.local/share/pruner/cache`)
- Downloaded bytes: `$CACHE/wasm/<name>/component.wasm`
- Metadata (TOML): `$CACHE/wasm/<name>/metadata.toml`

The metadata stores the resolved URL and the SHA-256 hash of the downloaded bytes. On subsequent runs, if the URL in the
metadata matches and the downloaded file still exists, Pruner will reuse it and will not re-download.

After resolving the `.wasm` bytes (either from `file://` or the download cache), Pruner compiles the component with
Wasmtime and caches the compiled artifact keyed by the content hash:

`$CACHE/wasm/<name>/compiled/<sha256>.cwasm`

This means:

- `file://` plugins automatically recompile when the file content changes.
- `http(s)://` plugins re-download only when the URL changes (if you publish new bytes at the same URL, you currently
  need to clear the cache to force a refresh).

```toml
[plugins]
trim_newlines = "https://github.com/pruner-formatter/plugin-trim-newlines/releases/download/v0.1.0/plugin.wasm"
local_plugin = { url = "file:///absolute/path/to/plugin.wasm" }
```

## `[languages]`

Mapping of `language -> pipeline`.

Default: `{}`

A pipeline is an array of formatter references. Each item can be:

- A string (the name of a formatter from `[formatters]` or a plugin from `[plugins]`)
- A table with conditional execution settings

Per-item table keys:

| Key                 | Type   | Default    | Meaning                               |
| ------------------- | ------ | ---------- | ------------------------------------- |
| `formatter`         | string | (required) | Formatter/plugin name                 |
| `run_in_root`       | bool   | `true`     | Run when formatting the root document |
| `run_in_injections` | bool   | `true`     | Run when formatting injected regions  |

```toml
[languages]
markdown = ["prettier", "trim_newlines"]

rust = [{ formatter = "rustfmt", run_in_injections = false }]
```

## `[profiles.<name>]`

Profiles are partial config overlays applied with the global `--profile <name>` flag, and can be specified multiple
times to apply multiple profiles.

These can be used to define variations to the formatter pipeline which are conditionally applied when calling Pruner.

Profiles can contain any of the same keys as the root config (except `profiles` itself), including nested tables like
`[profiles.<name>.languages]`.

Profiles are applied in the order they are specified; later profiles win on conflicts.

```toml
[languages]
markdown = ["prettier", "trim_newlines"]

[profiles.trim]
languages.markdown = ["trim_newlines"]
```

And can then subsequently be used like so

```bash
cat README.md | pruner format --lang markdown --profile trim
```

## Full Config Example

```toml
# Search paths for tree-sitter injection queries
#
# This is not required if you don't care about formatting embedded languages
query_paths = ["queries"]

# Here you can define repository URLs containing tree-sitter language grammars. These repos will be cloned down,
# compiled, and loaded when formatting these languages.
#
# This is not required if you don't care about formatting embedded languages
[grammars]
clojure = "https://github.com/sogaiu/tree-sitter-clojure"
markdown = "https://github.com/tree-sitter-grammars/tree-sitter-markdown"
sql = { url = "https://github.com/derekstride/tree-sitter-sql", rev = "gh-pages" }

# Named formatters which can be executed by Pruner. The tools referenced by `cmd` will need to be installed and
# available on your $PATH
[formatters]
prettier = { cmd = "prettier", args = [
  "--prose-wrap=always",
  "--print-width=$textwidth",
  "--parser=$language",
] }

pg_format = { cmd = "pg_format", args = [
  "--spaces=2",
  "--wrap-limit=$textwidth",
  "-",
] }

# Wasm plugins to be loaded by pruner. This should be a URI pointing to a compiled .wasm binary implementing the
# pruner/plugin-api.
[plugins]
trim_newlines = "https://github.com/pruner-formatter/plugin-trim-newlines/releases/download/v0.1.0/plugin.wasm"
plugin_b = { url = "file:///path/to/plugin.wasm" }

# This section contains a mapping of language name -> formatters. When the relevant language is to be formatted, pruner
# will execute the formatters specified here in order.
#
# These can be named [formatters] or [plugins]
[languages]
markdown = ["prettier", "trim_newlines"]
sql = ["pg_format", "trim_newlines", "plugin_b"]

# Profiles are partial config overrides which can be applied selectively at runtime. More on this below.
[profiles]
```
