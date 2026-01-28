default:
    @just --list

run:
    pnpm vitepress dev --host 0.0.0.0 --port 2244 docs

build:
    pnpm vitepress build docs
