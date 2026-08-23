# oh-my-kimi 与上游的分歧记录

> 这份文件是这个 fork 最重要的资产。
>
> 每次决定「这里我要跟上游不一样」，立刻在这里记一条 + 写清楚**为什么**。
> 没有这张表，每次同步上游都会有人（包括三个月后的你自己）把上游的写法又搬回来，
> 然后疑惑为什么坏了。
>
> 参考：oh-my-pi 的 `docs/porting-from-pi-mono.md` 第 15 节 "Intentional Divergences"。

## 基本原则

1. **新功能一律进 `packages/omk/`**，不往上游包里塞。新文件永远不会冲突。
2. **对上游的侵入只有一处**：`apps/kimi-code/src/main.ts` 顶部的 `import '@omk/core'`
   （加上 `apps/kimi-code/package.json` 里的一行依赖声明）。
3. 想改上游现有文件之前，先问：能不能改成「在 omk 里加个新东西」？
4. 一旦真的改了上游文件，**必须在下面记一条**。

## 分歧清单

| 上游 | 本 fork | 为什么 | 同步时注意 |
| --- | --- | --- | --- |
| `apps/kimi-code/src/main.ts` 无外部入口 | 文件顶部 `import '@omk/core'` | omk 的唯一挂载点 | merge 冲突时保留这两行，别被上游版本覆盖 |
| `apps/kimi-code/package.json` devDeps | 多一条 `@omk/core: workspace:^` | 让 tsdown 打包时带上 omk | 同上 |
| `README.md` 是 kimi-code 官方介绍 | 换成 oh-my-kimi 的介绍 | 这是独立仓库，访客第一眼该看到本项目 | 上游近 60 天只改过 1 次，冲突时**永远保留我方** |
| 无 `README.en.md` | 新增英文版 | 中文为主，英文兜住国际访客 | 新文件，不冲突 |
| `README.zh-CN.md` 是上游中文 README | **删除** | 本 fork 的 `README.md` 本身就是中文，再留一份是重复；且已无任何引用（上游只在被我们换掉的 `README.md` 里链过它） | 上游 60 天只改 1 次。若上游改动它，会产生 delete/modify 冲突——**选删除**（`git rm README.zh-CN.md`） |
| 上游 8 个 workflow 全 active | `ci` / `nix-build` / `release` / `pkg-pr-new` / `pr-title-checker` / `docs-deploy` **在仓库设置里禁用**（GitHub API，不改文件） | 跑整个 monorepo 太重且缺上游 secret；`docs-deploy` 会占用 Pages 部署 | **不改文件所以零冲突**。上游新增 workflow 时记得也去禁用 |
| 无自建 CI | 新增 `.github/workflows/omk-ci.yml` | 只验证 omk 包 + 守住侵入面白名单 | 新文件，不冲突 |
| Pages 部署上游 vitepress 文档 | 新增 `.github/workflows/omk-pages.yml`，部署 `site/` | 项目主页 | 新文件，不冲突 |
| `CLAUDE.md` 是**指向 `AGENTS.md` 的符号链接**（mode 120000） | 断开软链，改成真文件，内容是 fork 层指南 | 上游那套讲的是给 kimi-code 提 PR 的流程，在这里会误导 | ⚠️ **别直接写 `CLAUDE.md`**——上游它是软链，直接写会覆盖掉 `AGENTS.md`（60 天改 23 次的烫文件）。现在已是普通文件，但同步时若上游改回软链要留意。`AGENTS.md` 和 `flake.nix` **一个字都不碰** |
| 增删 workspace 包要同步 `flake.nix` | **故意不做** | `flake.nix` 60 天改 25 次，为两行登记去碰它换来长期冲突；Nix 构建这里不用，`nix-build.yml` 已禁用 | 代价：`node scripts/check-nix-workspace.mjs` 会一直报 `@omk/core` 缺失、退出码 1。**这是预期行为，别去"修"** |
| 无 `packages/omk/AGENTS.md` | 新增 | 上游约定「follow the nearest AGENTS.md」，在 omk 里干活时会命中这份 | 新文件，不冲突 |
| commit 描述用祈使句 + `(#PR号)` 后缀 | 改用**过去时**、scope 一律 `omk/<子模块>`、不带 PR 号 | fork 不提 PR，PR 号会指向不存在的东西；过去时让 `git log` 里 fork 的 commit 和 merge 进来的上游 commit 一眼可分。照的是 oh-my-pi `docs/porting-from-pi-mono.md` 第 14 节 | 只影响我方新 commit，不产生冲突。规则写在 `CLAUDE.md` 第 6 条 |
| `registerBuiltinSkill` 只存在于 `packages/agent-core-v2/src/app/skillCatalog/builtin/registry.ts`，barrel 未导出 | omk 走深导入 `@moonshot-ai/agent-core-v2/app/skillCatalog/builtin/registry` 注册 `/eli5` | 要让一条命令在 CLI 里真的敲得出来，只有「注册成 builtin skill」这一条零侵入路径：TUI 的斜杠命令来自上游写死的 `BUILTIN_SLASH_COMMANDS`（`apps/kimi-code/src/tui/commands/registry.ts`），引擎的 `contributeCommand` 只通过 RPC 暴露、TUI 不读它 | **不改上游文件，但依赖上游内部路径**。上游若挪走/改名该模块，import 会直接抛错，`packages/omk/test/eli5.test.ts` 会立刻红——那是好事，别用 try/catch 掩盖 |
| `.gitignore` 无 `.serena/` | 追加一行 `.serena/` | Serena MCP 会在仓库根建项目文件，`git add -A` 会把它扫进来（已误提交过一次） | 上游 60 天改 7 次；追加在文件末尾，冲突时两边都保留 |

## 我已改进、不许被上游盖回去的行为

> 上游可能在同一处「按它自己的想法」重写。移植前先写 before/after，
> 否则改进会被静默回滚而你不会发现。

_（还没有。第一条改进落地时补这里。）_

## 同步点

同步记录写在 commit 历史里，格式（由 `scripts/omk-sync.sh` 生成）：

```
chore(omk): synced upstream (<from>..<to>)
```

标题里的 commit range 就是同步点标记，用来回答「上次同步到哪了」。

查最近一次同步：

```bash
git log --oneline --grep='synced upstream' -1
```
