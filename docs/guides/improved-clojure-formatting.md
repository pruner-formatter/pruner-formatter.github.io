# Improved Clojure Formatting

There are many areas in Clojure where we can improve on the defacto state of formatting using Pruner.

The guide will take you through configuring Pruner to produce much more attractive Clojure code. See below for a before
and after comparison of formatting an example snippet of Clojure.

::: code-group

<!-- pruner-ignore -->

````clojure [Before]
(defn find-active-users
  "Fetches all active users from the database. Optionally filters by role. Returns a vector of user maps.

## Example

```clojure
(find-active-users   db)
(find-active-users db   {:role   :admin})
```"
  [db & [{:keys [role]}]]
              ;; This comment should be aligned to the let block below.
  (let [query "SELECT id, name, email FROM users WHERE active = true"]
    (jdbc/execute! db [query role])))
````

<!-- pruner-ignore -->

````clojure [After]
(defn find-active-users
  "Fetches all active users from the database. Optionally filters by role.
   Returns a vector of user maps.

   ## Example

   ```clojure
   (find-active-users db)
   (find-active-users db {:role :admin})
   ```"
  [db & [{:keys [role]}]]
  ;; This comment should be aligned to the let block below.
  (let [query "SELECT
                 id,
                 name,
                 email
               FROM
                 users
               WHERE
                 active = true"]
    (jdbc/execute! db [query role])))
````

:::

## Basic Clojure Formatting

Lets start by configuring Pruner with the `cljfmt` formatter:

```toml
[formatters]
cljfmt = { cmd = "cljfmt", args = [
  "fix",
  "-",
  "-q",
  "--remove-multiple-non-indenting-spaces",
] }

[languages]
clojure = ["cljfmt"]
```

This already gives you basic Clojure formatting. Now let's add the interesting parts.

## Formatting Docstrings as Markdown

Clojure docstrings are conventionally written in Markdown, but `cljfmt` treats them as plain strings. With Pruner we can
format them as Markdown using `prettier`.

Take this function with a long docstring containing a Clojure code example:

::: code-group

<!-- pruner-ignore -->

````clojure [Before]
(defn process-user
  "Process a user record by validating their email address, checking their subscription status, and updating their last-login timestamp in the database.

## Example

```clojure
(process-user   {:email \"foo@bar.com\"    :subscription :active})
```"
  [user]
  (-> user validate-email check-subscription update-last-login))
````

<!-- pruner-ignore -->

````clojure [After]
(defn process-user
  "Process a user record by validating their email address, checking their
   subscription status, and updating their last-login timestamp in the
   database.

   ## Example

   ```clojure
   (process-user {:email \"foo@bar.com\" :subscription :active})
   ```"
  [user]
  (-> user validate-email check-subscription update-last-login))
````

:::

#### Configuration

First we need to add the Clojure and Markdown grammar repos, as well as configure the `prettier` formatter.

The grammar repos are required first to parse the Clojure code and discover the sections containing embedded Markdown,
and then to subsequently parse the Markdown regions to find further embedded languages.

As you can guess, it's fully recursive and you can nest arbitrarily deep.

```toml
[grammars]
clojure = "https://github.com/sogaiu/tree-sitter-clojure"
markdown = "https://github.com/tree-sitter-grammars/tree-sitter-markdown"

[formatters]
cljfmt = { cmd = "cljfmt", args = [
  "fix",
  "-",
  "-q",
  "--remove-multiple-non-indenting-spaces",
] }

prettier = { cmd = "prettier", args = [
  "--prose-wrap=always",
  "--print-width=$textwidth",
  "--parser=$language",
] }

[languages]
clojure = ["cljfmt"]
markdown = ["prettier"]
```

#### Injection Queries

Now, treating clojure docstrings as Markdown is not officially baked into the Clojure treesitter grammar. This means we
need to define these embedded regions ourselves using treesitter injection queries.

We can do this by creating an injection query file at `queries/clojure/injections.scm` to tell Pruner where the Markdown
regions are. Don't forget to add the query path to your config:

```toml
query_paths = ["queries"]
```

The following query matches docstrings in `def`, `defn`, `defn-`, `defmacro`, `defprotocol`, and `ns` forms:

```query
;; queries/clojure/injections.scm

;; Match def and defprotocol with docstrings
((list_lit
  ((sym_lit) @def-type
   (sym_lit) @def-name
   (str_lit) @injection.content)
   (map_lit)?
   (_)+)

  (#match? @def-type "^(def|defprotocol)$")
  (#offset! @injection.content 0 1 0 -1)
  (#escape! @injection.content "\"")
  (#set! injection.language "markdown"))

;; Match defn, defn-, and defmacro with docstrings
((list_lit
  ((sym_lit) @def-type
   (sym_lit) @def-name
   (str_lit)? @injection.content)
   (map_lit)?

   [
    (vec_lit)
    (list_lit (vec_lit))+
   ])

  (#match? @def-type "^(defn-?|defmacro)$")
  (#offset! @injection.content 0 1 0 -1)
  (#escape! @injection.content "\"")
  (#set! injection.language "markdown"))

;; Match ns with docstrings
((list_lit
  ((sym_lit) @fn-type
   (sym_lit) @ns-name
   (#eq? @fn-type "ns")

   (str_lit)? @injection.content)
   (map_lit)?)

  (_)*

  (#offset! @injection.content 0 1 0 -1)
  (#escape! @injection.content "\"")
  (#set! injection.language "markdown"))

;; Match protocol method docstrings
(list_lit
  ((sym_lit) @fn-name
   (#eq? @fn-name "defprotocol")
   (sym_lit) @protocol-name

   (str_lit)?)

  (list_lit
    (sym_lit)
    (vec_lit)+
    (str_lit) @injection.content)

  (#offset! @injection.content 0 1 0 -1)
  (#escape! @injection.content "\"")
  (#set! injection.language "markdown"))
```

This query contains some pruner-specific query directives like `#offset!` and `#escape`. See
[Query Directives](../language-injections/query-directives.md) for more details on these directives.

## Formatting and Aligning Comments

By default `cljfmt` does not align comments to the rest of the surrounding code. We can fix this by using a Pruner WASM
plugin.

The [clojure-comment-formatter](https://github.com/pruner-formatter/plugin-clojure-comment-formatter) plugin formats
`;;` comment blocks and aligns them to the code they describe.

Consider the following code where the comment block is misaligned:

<!-- pruner-ignore -->

```clojure
(defn create-user [params]
      ;; Validate the user params and insert a new
      ;; record into the database.
  (let [validated (validate params)]
   ;; Also wasn't aligned
    (db/insert! validated)))
```

After formatting, the comments are aligned to match the indentation of the code they describe:

```clojure
(defn create-user [params]
  ;; Validate the user params and insert a new
  ;; record into the database.
  (let [validated (validate params)]
    ;; Also wasn't aligned
    (db/insert! validated)))
```

#### Configuration

Add the plugin to your config, and extend the clojure language mappings to execute the comments plugin:

```toml
[plugins]
align_comments = "https://github.com/pruner-formatter/plugin-clojure-comment-formatter/releases/download/v0.1.0/plugin.wasm"

[languages]
# This will run `cljfmt`, and then `align_comments` on the result
clojure = ["cljfmt", "align_comments"]
```

## Formatting Embedded SQL

SQL queries embedded in Clojure strings can also be formatted. This is useful when working with JDBC and some raw inline
SQL query strings.

<!-- pruner-ignore -->

```clojure
;; Before
(def query
  "SELECT id, name, email FROM users WHERE active = true ORDER BY created_at DESC")

;; After
(def query
  "SELECT
     id,
     name,
     email
   FROM
     users
   WHERE
     active = TRUE
   ORDER BY
     created_at DESC")
```

#### Configuration

Add the `pg_format` formatter and SQL language pipeline:

```toml
[formatters]
pg_format = { cmd = "pg_format", args = [
  "--spaces=2",
  "--wrap-limit=$textwidth",
  "-",
] }

[languages]
sql = ["pg_format"]
```

Then add an injection query to match SQL strings. This pattern matches any string that starts with a SQL keyword:

```query
;; queries/clojure/injections.scm

((str_lit) @injection.content
  (#match? @injection.content "^\"(SET|TRUNCATE|SELECT|CREATE|DELETE|ALTER|UPDATE|DROP|INSERT|WITH)")
  (#offset! @injection.content 0 1 0 -1)
  (#escape! @injection.content "\"")
  (#set! injection.language "sql"))
```

## Trimming Newlines

The [trim-newlines](https://github.com/pruner-formatter/plugin-trim-newlines) plugin removes leading and trailing
newlines and ensures files end with a single newline. This is a nice finishing touch:

```toml
[plugins]
align_comments = "https://github.com/pruner-formatter/plugin-clojure-comment-formatter/releases/download/v0.1.0/plugin.wasm"
trim_newlines = "https://github.com/pruner-formatter/plugin-trim-newlines/releases/download/v0.1.1/plugin.wasm"

[languages]
clojure = ["cljfmt", "align_comments", "trim_newlines"]
```

## Complete Configuration

Here is the complete configuration with everything described above:

::: code-group

```toml [~/.config/pruner/config.toml]
query_paths = ["queries"]

[grammars]
clojure = "https://github.com/sogaiu/tree-sitter-clojure"
markdown = "https://github.com/tree-sitter-grammars/tree-sitter-markdown"

[formatters]
cljfmt = { cmd = "cljfmt", args = [
  "fix",
  "-",
  "-q",
  "--remove-multiple-non-indenting-spaces",
] }

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

[plugins]
trim_newlines = "https://github.com/pruner-formatter/plugin-trim-newlines/releases/download/v0.1.1/plugin.wasm"
align_comments = "https://github.com/pruner-formatter/plugin-clojure-comment-formatter/releases/download/v0.1.0/plugin.wasm"

[languages]
clojure = ["cljfmt", "align_comments", "trim_newlines"]
markdown = ["prettier", "trim_newlines"]
sql = ["pg_format", "trim_newlines"]
```

:::

## Using LSP for Root Formatting

[clojure-lsp](https://clojure-lsp.io/) provides excellent, context-aware formatting for Clojure code. You may prefer to
let your LSP handle formatting the root document while Pruner takes care of embedded languages like docstrings and SQL.

To achieve this, configure `cljfmt` to only run on injected regions:

```toml
[languages]
clojure = [
  { formatter = "cljfmt", run_in_root = false, run_in_injections = true },
  "align_comments",
  "trim_newlines",
]
```

The `run_in_root` and `run_in_injections` options control whether a formatter executes on the root document or on
injected language regions. See [Configuration](../configuration.md#languages) for more details.

With this setup, your editor runs LSP formatting first, then Pruner handles the rest. For Neovim, see
[Using Pruner with Neovim and Conform.nvim](./neovim-integration.md).

## Editor Integration

If you are using Neovim, the same injection queries can be used for syntax highlighting. Place the query file at
`~/.config/nvim/queries/clojure/injections.scm` and your docstrings will be highlighted as Markdown, and SQL strings as
SQL.

For setting up Pruner as a formatter in Neovim, see
[Using Pruner with Neovim and Conform.nvim](./neovim-integration.md).

Checkout **[this related post](https://julienvincent.io/posts/treesitter-language-injections)** about using TreeSitter
language injections in Neovim
