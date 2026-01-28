import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Pruner",
  description: "A language-agnostic, TreeSitter-powered formatter",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/introduction" },
    ],

    sidebar: [
      {
        text: "Pruner",
        items: [
          { text: "About", link: "/introduction" },
          { text: "Installation", link: "/installation" },
          { text: "Configuration", link: "/configuration" },
        ],
      },
      {
        text: "Language Injections",
        items: [
          { text: "About", link: "/language-injections/about" },
          {
            text: "Query Directives",
            link: "/language-injections/query-directives",
          },
          {
            text: "Customizing Injections",
            link: "/language-injections/customizing-injections",
          },
        ],
      },
      {
        text: "Plugins",
        items: [
          { text: "About", link: "/plugins/about" },
          { text: "Writing Plugins", link: "/plugins/writing-plugins" },
        ],
      },
      {
        text: "Guides",
        items: [
          {
            text: "Writing a Plugin in Rust",
            link: "/guides/writing-a-plugin-in-rust",
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
