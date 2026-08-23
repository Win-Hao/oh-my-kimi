# oh-my-kimi —— fork 层的 Agent 指南

用与用户相同的语言回复。

**这个仓库不是 kimi-code 上游，是个人维护的 fork。**
上游的 `AGENTS.md`（以及各包下的 `AGENTS.md`）原样保留，用来理解**上游代码**怎么写；
但涉及协作流程的部分对这里不适用，见下面的「不适用清单」。

上游文件按 churn 分工：`AGENTS.md`（近 60 天改 23 次）和 `flake.nix`（25 次）是上游最烫的文件，
**一个字都不要碰**；本文件 `CLAUDE.md`（1 次）是冷的，所以 fork 的规则写在这里。

---

## 硬规则

### 1. 新东西一律进 `packages/omk/`

新文件永远不会跟上游冲突。动手改上游现有文件之前，先问一遍：
**能不能改成「在 omk 里加个新东西」？**

上游的 DI 提供了现成的替换点：服务在模块顶层用 `registerScopedService()` 自注册，
另有 `overrideScopedService()` 专门用于**有意替换**上游服务的实现——
用它就不必去改上游源码。相关时序已在 `packages/omk/src/index.ts` 里锁住，
并有 `test/registry.test.ts` 守着。

### 2. 对上游的侵入面只有两个文件

```
apps/kimi-code/src/main.ts     顶部一行 import '@omk/core'
apps/kimi-code/package.json    devDeps 一行 @omk/core
```

`.github/workflows/omk-ci.yml` 里有一条检查：跟 `upstream/main` 算 merge-base，
任何超出白名单的上游文件改动**直接让构建失败**。这是故意的摩擦，别绕过它——
要越界就走第 3 条。

### 3. 越界必须记进 `DIVERGENCES.md`

真的决定要改上游文件，或者要跟上游的做法不一样，**立刻记一条 + 写清楚为什么**。
没有那张表，下次同步就会有人（包括三个月后的自己）把上游的写法又搬回来，
然后疑惑为什么坏了。同时更新 `omk-ci.yml` 里的白名单。

### 4. 同步用脚本，不要手工 merge

```bash
./scripts/omk-sync.sh --dry   # 预览：多少新提交、哪些文件可能冲突
./scripts/omk-sync.sh         # 执行
```

用 `merge` 不用 `rebase`：这个 fork 不往上游提 PR，不需要干净历史，
而 merge 每次只处理增量。建议每天或每两天跑一次，别攒——
冲突难度对间隔是超线性的。

`rerere` 和 `zdiff3` 已配好，同一个冲突第二次会自动套用上次的解法。

---

## 上游规则的「不适用清单」

上游 `AGENTS.md` 里这些是给**上游贡献者**的，在这个 fork 里不做：

| 上游要求 | 这里 |
|---|---|
| 填 `.github/pull_request_template.md` | 不提 PR 给上游，不适用 |
| 跑 `gen-changesets` skill 生成 changeset | 不发包，不适用 |
| PR 标题用 Conventional Commit | commit 仍沿用该风格，但没有 PR 环节 |
| 增删 workspace 包时同步 `flake.nix` | **故意不做**，见下 |

### 已知的「预期失败」

```bash
node scripts/check-nix-workspace.mjs   # 会报 @omk/core 缺失，退出码 1
```

这是**有意的**：`flake.nix` 是上游高频文件（60 天 25 次），为了两行登记去改它，
换来的是长期的冲突成本；而 Nix 构建这里不用，`nix-build.yml` 也已禁用。
**看到这个报错不要去"修"它。** 已记在 `DIVERGENCES.md`。

---

## 上游规则里仍然适用的

- **不要给 commit 加 agent 署名**，也不要在 commit message 或任何说明文字里暴露 agent 身份。
- 读代码优先用 `rg`。
- 包内导入用 `#/...`。
- 以代码为准，不要靠读 Markdown 来理解实现。
- 改动保持聚焦，不要顺手夹带无关重构。
- 不要提交临时草稿文件，scratch 放 `.tmp/`（已 gitignore）。

**注意一个差别**：上游把 `agent-core-v2` / `kap-server` / `transcript` 设成了无注释区
（由 `scripts/check-no-comments.mjs` 强制）。`packages/omk` **不在其列**，
可以正常写注释——而且应该写，因为这里的很多决策（比如为什么挂在 `main.ts`）
不写下来就会丢。

---

## 环境

- Node `>=24.15.0`，pnpm `10.33.0`（`.npmrc` 有 `engine-strict=true`，版本不对装不上）
- 启动 CLI（`--tsconfig` 不能省，否则 `experimentalDecorators` 直接崩）：

```bash
cd apps/kimi-code
OMK_DEBUG=1 KIMI_CODE_HOME=~/.oh-my-kimi \
  npx tsx --tsconfig ./tsconfig.dev.json \
  --import ../../build/register-raw-text-loader.mjs ./src/main.ts
```

- 验证 omk：

```bash
pnpm --filter @omk/core test
pnpm --filter @omk/core typecheck
```
