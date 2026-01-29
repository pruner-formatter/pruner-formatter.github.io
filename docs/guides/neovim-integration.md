# Using Pruner with Neovim and Conform.nvim

[conform.nvim](https://github.com/stevearc/conform.nvim) is a popular formatter plugin for Neovim. Pruner can be
configured as a conform formatter, allowing you to format files with Pruner directly from Neovim.

## Basic Setup

Add the following to your conform setup to define a `pruner` formatter:

```lua
require("conform").setup({
  formatters_by_ft = {
    markdown = { "pruner" },
    mdx = { "pruner" },
    clojure = { "pruner" },
  },

  formatters = {
    pruner = {
      command = "pruner",
      args = function(_, ctx)
        local args = { "format" }

        local textwidth = vim.api.nvim_get_option_value("textwidth", { buf = ctx.buf })
        if textwidth and textwidth > 0 then
          table.insert(args, "--print-width=" .. textwidth)
        end

        local filetype = vim.api.nvim_get_option_value("filetype", { buf = ctx.buf })
        if filetype then
          table.insert(args, "--lang=" .. filetype)
        end

        return args
      end,
    },
  },
})
```

This configuration:

- Passes `--print-width` from the buffer's `textwidth` option, allowing Pruner to respect your preferred line width
- Passes `--lang` from the buffer's filetype so Pruner knows which language pipeline to use

## Keybinding

Add a keybinding to format the current buffer:

```lua
vim.keymap.set("", "<localleader>f", function()
  require("conform").format({ async = true })
end, { desc = "Format current buffer" })
```

## Advanced: Using Profiles

If you need to use different Pruner [profiles](../configuration.md#profilesname) for different filetypes, you can create
a factory function that generates formatter definitions:

```lua
local function pruner(config)
  config = config or {}

  return {
    command = "pruner",
    args = function(_, ctx)
      local args = { "format" }

      local textwidth = vim.api.nvim_get_option_value("textwidth", { buf = ctx.buf })
      if textwidth and textwidth > 0 then
        table.insert(args, "--print-width=" .. textwidth)
      end

      local filetype = vim.api.nvim_get_option_value("filetype", { buf = ctx.buf })
      if filetype then
        table.insert(args, "--lang=" .. filetype)
      end

      if config.profile then
        table.insert(args, "--profile=" .. config.profile)
      end

      return args
    end,
  }
end
```

Then use it in your conform setup to create multiple formatter instances:

```lua
...

require("conform").setup({
  formatters_by_ft = {
    markdown = { "pruner" },
    -- Use the LSP server for formatting, but run some other pruner profile afterwards
    rust = { lsp_format = "first", "pruner_trim" },
  },

  formatters = {
    pruner = pruner(),
    pruner_trim = pruner({ profile = "trim" }),
  },
})
```

This allows you to define language-specific profiles in your `pruner.toml` and selectively apply them from Neovim.
