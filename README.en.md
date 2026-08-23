<div align="center">

# oh-my-kimi

**A personally maintained fork of [Kimi Code](https://github.com/MoonshotAI/kimi-code), with a few additions of my own.**

Continuously synced with upstream, not a one-time copy.

[中文](./README.md) · [Project site](https://win-hao.github.io/oh-my-kimi/) · [Divergences](./DIVERGENCES.md)

</div>

---

## What this is

Additions layered on top of upstream kimi-code. Everything lives in a standalone
`packages/omk/` package — **the total footprint in upstream source is 2 files, 4 lines.**

## Architecture

```
packages/omk/               ← everything new lives here; new files don't conflict with upstream
apps/kimi-code/src/main.ts  ← one line: import '@omk/core'    ┐ the entire
apps/kimi-code/package.json ← one devDependency entry          ┘ upstream footprint
```

The seam is deliberately placed in `apps/kimi-code/src/main.ts`, a rarely-touched
entry file, rather than the frequently-rewritten registration hub at
`agent-core-v2/src/index.ts`. A CI check enforces this: any upstream file change
outside the allowlist fails the build.

## Development

```bash
pnpm install

# KIMI_CODE_HOME keeps this isolated from your everyday kimi install
cd apps/kimi-code
OMK_DEBUG=1 KIMI_CODE_HOME=~/.oh-my-kimi \
  npx tsx --tsconfig ./tsconfig.dev.json \
  --import ../../build/register-raw-text-loader.mjs ./src/main.ts
```

> ⚠️ `--tsconfig ./tsconfig.dev.json` is required; without it the build fails on
> `experimentalDecorators`. Upstream's own `dev:cli-only` script omits it.

```bash
pnpm --filter @omk/core test        # unit tests
pnpm --filter @omk/core typecheck   # type check
```

## Syncing upstream

```bash
./scripts/omk-sync.sh --dry   # preview: how many new commits, which files may conflict
./scripts/omk-sync.sh         # do it
```

Merge, not rebase: this fork sends no PRs upstream, so clean history buys nothing,
and merge only resolves the delta since the last sync. Run it every day or two.

Whenever you decide to diverge from upstream, record it in
[`DIVERGENCES.md`](./DIVERGENCES.md) — otherwise the next sync quietly reverts you.

## Features

_(Scaffolding only so far; the first feature has not landed yet.)_

## Relationship to upstream

Forked from [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code) under its
MIT license; copyright remains with Moonshot AI (see [LICENSE](./LICENSE)).

**This is an unofficial personal project, not affiliated with Moonshot AI.**
Please report upstream bugs upstream, not here.

## License

MIT
