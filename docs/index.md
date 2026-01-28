---
layout: home

hero:
  name: "Pruner"
  text: "A TreeSitter-powered formatter"
  tagline: "Compose existing language formatters, and format embedded languages reliably."
  actions:
    - theme: brand
      text: What is Pruner
      link: /introduction
    - theme: alt
      text: Getting Started
      link: /getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/pruner-formatter/pruner

features:
  - title: Embedded Languages
    details: Format code blocks, strings, templates, and other injected regions with the right toolchain.
  - title: Composable Pipelines
    details: Define language pipelines in TOML and reuse them across projects and editors.
  - title: WASM Plugins
    details: Add project-specific formatting rules, or new formatters, via shareable WASM components.
---

## Quick Start

```bash
brew install pruner-formatter/tap/pruner
cat README.md | pruner format --lang markdown > README.md
```

Prefer the full overview? Read the docs at [Introduction](./introduction.md).
