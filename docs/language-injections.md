# Language Injections

Pruner uses tree-sitter injection queries (`injections.scm`) to find regions in your document containing other embedded
languages. These are typically shipped alongside grammars and are automatically included when loading the grammar for
your language.

A good example is Markdown which contains embedded languages inside code blocks. The official markdown grammar includes
injection queries which describe these embedded languages and so Pruner automatically knows how to format these sections
(provided you have the relevant formatters for the language configured, of course).

You are also free to (and encouraged to!) write your own language injections to support formatting embedded languages
not defined in an official grammar.

Pruner loads language injection queries from the configured query "search paths" by resolving
`<query_path>/<language>/injections.scm`.

Next: [Customizing Injections](./language-injections/customizing-injections.md).
