# Nix Embeddings

Nix requires some special handling in order to treat the language injections and embedded regions correctly for
formatting.

There are several injection queries you can find in the wild but none of them will be entirely appropriate to use
alongside Pruner.

This is primarily a result of Nix's indented regions, such as:

```nix
{}: let
  embeddedTs =
    # ts
    ''
      console.log(1);
    '';
```

## Queries

Below is a modified version of the Nix injection queries as defined by
[nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter/blob/45a07f869b0cffba342276f2c77ba7c116d35db8/runtime/queries/nix/injections.scm).
These queries have been altered to use `#match?` instead of `#lua-match?` and to appropriately `#trim!` any indented
string expressions.

```query
((comment) @injection.content
  (#set! injection.language "comment"))

((comment) @injection.language
  . ; this is to make sure only adjacent comments are accounted for the injections
  [
    (string_expression
      (string_fragment) @injection.content)
    (indented_string_expression
      (string_fragment) @injection.content)
  ]
  (#gsub! @injection.language "/%*%s*([%w%p]+)%s*%*/" "%1")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

; #-style Comments
((comment) @injection.language
  . ; this is to make sure only adjacent comments are accounted for the injections
  [
    (string_expression
      (string_fragment) @injection.content)
    (indented_string_expression
      (string_fragment) @injection.content)
  ]
  (#gsub! @injection.language "#%s*([%w%p]+)%s*" "%1")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

(apply_expression
  function: (_) @_func
  argument: [
    (string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "regex")))
    (indented_string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "regex")))
  ]
  (#match? @_func "^[A-Za-z]*\\.*match$")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

(binding
  attrpath: (attrpath
    (identifier) @_path)
  expression: [
    (string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "bash")))
    (indented_string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "bash")))
  ]
  (#match? @_path "^[A-Za-z]+Phase$")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

(binding
  attrpath: (attrpath
    (identifier) @_path)
  expression: [
    (string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "bash")))
    (indented_string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "bash")))
  ]
  (#match? @_path "^pre[A-Za-z]+$")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

(binding
  attrpath: (attrpath
    (identifier) @_path)
  expression: [
    (string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "bash")))
    (indented_string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "bash")))
  ]
  (#match? @_path "^post[A-Za-z]+$")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

(binding
  attrpath: (attrpath
    (identifier) @_path)
  expression: [
    (string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "bash")))
    (indented_string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "bash")))
  ]
  (#match? @_path "^script$")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

(apply_expression
  function: (_) @_func
  argument: (_
    (_)*
    (_
      (_)*
      (binding
        attrpath: (attrpath
          (identifier) @_path)
        expression: [
          (string_expression
            ((string_fragment) @injection.content
              (#set! injection.language "bash")))
          (indented_string_expression
            ((string_fragment) @injection.content
              (#set! injection.language "bash")))
        ])))
  (#match? @_func "^[A-Za-z]*\\.*writeShellApplication$")
  (#match? @_path "^text$")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

(apply_expression
  function: (apply_expression
    function: (apply_expression
      function: (_) @_func))
  argument: [
    (string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "bash")))
    (indented_string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "bash")))
  ]
  (#match? @_func "^[A-Za-z]*\\.*runCommand[A-Za-z]*$")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

((apply_expression
  function: (apply_expression
    function: (_) @_func)
  argument: [
    (string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "bash")))
    (indented_string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "bash")))
  ])
  (#match? @_func "^[A-Za-z]*\\.*writeBash[A-Za-z]*$")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

((apply_expression
  function: (apply_expression
    function: (_) @_func)
  argument: [
    (string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "bash")))
    (indented_string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "bash")))
  ])
  (#match? @_func "^[A-Za-z]*\\.*writeDash[A-Za-z]*$")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

((apply_expression
  function: (apply_expression
    function: (_) @_func)
  argument: [
    (string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "bash")))
    (indented_string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "bash")))
  ])
  (#match? @_func "^[A-Za-z]*\\.*writeShellScript[A-Za-z]*$")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

((apply_expression
  function: (apply_expression
    function: (_) @_func)
  argument: [
    (string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "fish")))
    (indented_string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "fish")))
  ])
  (#match? @_func "^[A-Za-z]*\\.*writeFish[A-Za-z]*$")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

((apply_expression
  function: (apply_expression
    function: (apply_expression
      function: (_) @_func))
  argument: [
    (string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "haskell")))
    (indented_string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "haskell")))
  ])
  (#match? @_func "^[A-Za-z]*\\.*writeHaskell[A-Za-z]*$")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

((apply_expression
  function: (apply_expression
    function: (_) @_func)
  argument: [
    (string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "javascript")))
    (indented_string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "javascript")))
  ])
  (#match? @_func "^[A-Za-z]*\\.*writeJS[A-Za-z]*$")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

((apply_expression
  function: (apply_expression
    function: (_) @_func)
  argument: [
    (string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "perl")))
    (indented_string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "perl")))
  ])
  (#match? @_func "^[A-Za-z]*\\.*writePerl[A-Za-z]*$")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

((apply_expression
  function: (apply_expression
    function: (_) @_func)
  argument: [
    (string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "python")))
    (indented_string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "python")))
  ])
  (#match? @_func "^[A-Za-z]*\\.*writePy[A-Za-z]*\\d*[A-Za-z]*$")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

((apply_expression
  function: (_) @_func
  argument: [
    (string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "rust")))
    (indented_string_expression
      ((string_fragment) @injection.content
        (#set! injection.language "rust")))
  ])
  (#match? @_func "^[A-Za-z]*\\.*writeRust[A-Za-z]*$")
  (#trim! @injection.content 1 0 1 0)
  (#set! injection.combined))

; (runTest) testScript
(apply_expression
  function: (_) @_func
  argument: (_
    (_)*
    (_
      (binding
        attrpath: (attrpath) @_func_name
        expression: (_
          (string_fragment) @injection.content
          (#set! injection.language "python")))
      (#eq? @_func_name "testScript")
      (#match? @_func "^.*\\.*runTest$")
      (#set! injection.combined))))

; (nixosTest) testScript
(apply_expression
  function: (_) @_func
  argument: (_
    (_)*
    (_
      (binding
        attrpath: (attrpath) @_func_name
        expression: (_
          (string_fragment) @injection.content
          (#set! injection.language "python")))
      (#eq? @_func_name "testScript")
      (#match? @_func "^.*\\.*nixosTest$")
      (#set! injection.combined))))

; home-manager Neovim plugin config
(attrset_expression
  (binding_set
    (binding
      attrpath: (attrpath) @_ty_attr
      (_
        (string_fragment) @_ty)
      (#eq? @_ty_attr "type")
      (#eq? @_ty "lua"))
    (binding
      attrpath: (attrpath) @_cfg_attr
      (_
        (string_fragment) @injection.content
        (#set! injection.language "lua"))
      (#eq? @_cfg_attr "config")))
  (#set! injection.combined))
```
