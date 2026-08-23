<div align="center">

# oh-my-kimi

**A personally maintained enhanced build of [Kimi Code](https://github.com/MoonshotAI/kimi-code).**

A real fork that actually tracks upstream — not a plugin layer.

[中文](./README.md) · [Project site](https://win-hao.github.io/oh-my-kimi/) · [Divergences](./DIVERGENCES.md)

</div>

---

## What this is

Additions layered on top of upstream kimi-code, built to learn the harness internals
by extending them. Everything lives in a standalone `packages/omk/` package —
**the total footprint in upstream source is 2 files, 4 lines.**

## Why not a plugin layer

There are already 15 GitHub projects named `oh-my-kimi`. **14 are plugin or
orchestration layers; exactly one is a real fork.** Top star count is 6, and most
stopped receiving commits between March and July 2026.

Plugin layers have a ceiling — once the skills, hooks and MCP servers are wired up,
there is nothing left to build. Real forks are rare because tracking upstream is
expensive (kimi-code landed 281 commits in the last 30 days).

This project takes the empty slot: **a real fork that is really maintained.**

## Architecture

```
packages/omk/               ← everything I write; new files never conflict
apps/kimi-code/src/main.ts  ← one line: import '@omk/core'    ┐ the entire
apps/kimi-code/package.json ← one devDependency entry          ┘ upstream footprint
```

`main.ts` was picked as the seam from churn data: upstream touched it **6** times in
60 days. The more "proper" mount point, `agent-core-v2/src/index.ts` (the
`import = register` hub), was touched **69** times — the single hottest file in the repo.

## Development

```bash
pnpm install

cd apps/kimi-code
OMK_DEBUG=1 KIMI_CODE_HOME=~/.oh-my-kimi \
  npx tsx --tsconfig ./tsconfig.dev.json \
  --import ../../build/register-raw-text-loader.mjs ./src/main.ts
```

> ⚠️ `--tsconfig ./tsconfig.dev.json` is required; without it the build fails on
> `experimentalDecorators`. Upstream's own `dev:cli-only` script omits it.

## Syncing upstream

```bash
./scripts/omk-sync.sh --dry   # preview: how many new commits, which files may conflict
./scripts/omk-sync.sh         # do it
```

Merge, not rebase: this fork sends no PRs upstream, so clean history buys nothing,
and merge only resolves the delta since the last sync.

## Relationship to upstream

Forked from [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code) under its
MIT license; copyright remains with Moonshot AI (see [LICENSE](./LICENSE)).

**This is an unofficial personal project, not affiliated with Moonshot AI.**
Please report upstream bugs upstream, not here.

## License

MIT
