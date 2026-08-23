# oh-my-kimi —— fork 层的 Agent 指南

用与用户相同的语言回复。

**这个仓库不是 kimi-code 上游，是个人维护的 fork。**
上游的 `AGENTS.md`（以及各包下的 `AGENTS.md`）原样保留，用来理解**上游代码**怎么写；
但涉及协作流程的部分对这里不适用，见下面的「不适用清单」。

上游文件按 churn 分工：`AGENTS.md`（近 60 天改 23 次）和 `flake.nix`（25 次）是上游最烫的文件，
**一个字都不要碰**；本文件 `CLAUDE.md` 在上游是一个指向 `AGENTS.md` 的符号链接、内容恒定，
所以断开软链改成真文件，fork 的规则写在这里。

> ⚠️ **踩过的坑**：在上游状态下直接写 `CLAUDE.md` 会顺着软链把 `AGENTS.md` 覆盖掉。
> 现在它已是普通文件，但如果哪次同步后上游把它改回软链，写之前先 `ls -la` 看一眼。

改动上游文件前，先跑一遍：

```bash
./scripts/omk-check-footprint.sh    # 含工作区；CI 用 --committed 跑同一份逻辑
```

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
然后疑惑为什么坏了。同时更新 `scripts/omk-check-footprint.sh` 里的 `ALLOWED` 白名单。

下面这行是 `@` 导入，把整张分歧表拉进上下文——**别改成普通 markdown 链接**，
实测过 Claude Code 不会顺着普通链接去读文件，只有 `@` 前缀才真的加载：

@./DIVERGENCES.md

（等这张表长到几十条、明显占上下文了，再改成按需读。）

### 4. 同步用脚本，不要手工 merge

```bash
./scripts/omk-sync.sh --dry   # 预览：多少新提交、哪些文件可能冲突
./scripts/omk-sync.sh         # 执行
```

用 `merge` 不用 `rebase`：这个 fork 不往上游提 PR，不需要干净历史，
而 merge 每次只处理增量。建议每天或每两天跑一次，别攒——
冲突难度对间隔是超线性的。

`rerere` 和 `zdiff3` 已配好，同一个冲突第二次会自动套用上次的解法。

### 5. 查 CI 结果要按 commit SHA 取，不能取「最新一个」

```bash
./scripts/omk-ci-status.sh          # 等当前 HEAD 的 CI 跑完
```

> ⚠️ **踩过的坑**：push 之后立刻跑 `gh run list --limit 1` 取 run id，
> 那一刻 GitHub 还没创建新 run，取到的是**上一次**的——如果上一次是绿的，
> 你会得到一个假的成功，而真正的失败被漏掉。
> 正确做法是 `gh run list --commit "$(git rev-parse HEAD)"`，脚本已经封好。

### 6. commit 用英文过去时，scope 按子模块嵌套

```
<type>(omk/<子模块>): <过去时英文描述>
```

```
feat(omk/registry): added an override for the upstream permission service
fix(omk/ci): restored the footprint check on merge commits
docs(omk/readme): stopped calling the fork an "enhanced build"
chore(omk): synced upstream (d723cc47e..a1b2c3d4e)
```

- **英文、过去时**（`added` / `restored` / `stopped`），冒号后全小写。
  这跟上游 kimi-code 的祈使句（`add` / `keep`）**故意不一样**，
  照的是 oh-my-pi 的 `docs/porting-from-pi-mono.md` 第 14 节。
  好处是 `git log` 里 fork 的 commit 和 merge 进来的上游 commit 一眼能分开。
- **scope 一律以 `omk/` 开头**，后面跟子模块（`registry` / `ci` / `readme` / `scripts` / `sync`）。
  只有横跨多个子模块、或者纯仓库级的操作（同步、版本）才用光秃秃的 `omk`。
  `omk/` 这个前缀是关键：它保证任何一条 fork 层 commit 都不会跟上游的 scope 撞名。
- type 用满 `feat` `fix` `refactor` `perf` `docs` `test` `chore`。
- **不带 `(#1234)` 后缀**——那是上游 PR 号，这里没有 PR 环节，写了会指向不存在的 PR。
- **不加 agent 署名**，也不在正文里暴露 agent 身份（这条跟上游一致，见下）。

同步上游的 commit 由 `omk-sync.sh` 生成，标题里带 commit range 当同步点标记：

```
chore(omk): synced upstream (<from>..<to>)
```

### 7. 新功能在分支上做，不在 main 上做

```bash
./scripts/omk-sync.sh          # 先同步，别在落后的 main 上开分支
git switch -c feat/omk-<功能>
# ... 做完，测试绿了 ...
git switch main && git merge --no-ff feat/omk-<功能>
```

两条限定，不然分支本身会变成麻烦：

- **当天合回去。** 这个 fork 的同步是从 upstream merge 进 main，一条活了一周的功能分支
  等于要同时应付「上游变化」和「main 变化」两个方向的合并，比直接在 main 上做还累。
- **合并用 `--no-ff`。** `git log` 里已经混着 merge 进来的上游 commit，功能分支再被
  fast-forward 掉，就分不出哪几个 commit 属于同一个功能了。

`omk-ci.yml` 的触发条件已经放宽到 `branches: ['**']`，分支推上去就会跑。

---

## 上游规则的「不适用清单」

上游 `AGENTS.md` 里这些是给**上游贡献者**的，在这个 fork 里不做：

| 上游要求 | 这里 |
|---|---|
| 填 `.github/pull_request_template.md` | 不提 PR 给上游，不适用 |
| 跑 `gen-changesets` skill 生成 changeset | 不发包，不适用 |
| PR 标题用 Conventional Commit | commit 仍用该风格，但没有 PR 环节；描述改用过去时，见第 6 条 |
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
