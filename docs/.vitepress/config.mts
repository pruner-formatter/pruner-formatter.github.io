import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Pruner",
  description: "A language-agnostic, TreeSitter-powered formatter",
  themeConfig: {
    search: {
      provider: "local",
    },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/introduction" },
    ],

    sidebar: [
      {
        text: "Pruner",
        items: [
          { text: "Introduction", link: "/introduction" },
          { text: "Installation", link: "/installation" },
          { text: "Quick Start", link: "/quickstart" },
          { text: "Configuration", link: "/configuration" },
        ],
      },
      {
        text: "Language Injections",
        items: [
          { text: "Overview", link: "/language-injections" },
          {
            text: "Query Directives",
            link: "/language-injections/query-directives",
          },
          {
            text: "Customizing Injections",
            link: "/language-injections/customizing-injections",
          },
          {
            text: "Ignoring Code",
            link: "/language-injections/ignoring-code",
          },
        ],
      },
      {
        text: "Plugins",
        items: [
          { text: "Overview", link: "/plugins" },
          { text: "Writing Plugins", link: "/plugins/writing-plugins" },
          {
            text: "Official Plugins",
            collapsed: true,
            items: [
              {
                text: "plugin-trim-newlines",
                link: "https://github.com/pruner-formatter/plugin-trim-newlines",
              },
              {
                text: "plugin-clojure-comment-formatter",
                link: "https://github.com/pruner-formatter/plugin-clojure-comment-formatter",
              },
            ],
          },
        ],
      },
      {
        text: "Guides",
        items: [
          {
            text: "Writing a Plugin in Rust",
            link: "/guides/writing-a-plugin-in-rust",
          },
          {
            text: "Using Pruner in Neovim with conform.nvim",
            link: "/guides/neovim-integration",
          },
          {
            text: "Improved Clojure Formatting",
            link: "/guides/improved-clojure-formatting",
          },
          {
            text: "Nix Embeddings",
            link: "/guides/nix-embeddings",
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/pruner-formatter/pruner" },
    ],
  },

  markdown: {
    languageAlias: {
      query: "clojure",
    },
  },
});
