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
| 上游 8 个 workflow 全 active | `ci` / `nix-build` / `release` / `pkg-pr-new` / `pr-title-checker` / `docs-deploy` **在仓库设置里禁用**（GitHub API，不改文件） | 跑整个 monorepo 太重且缺上游 secret；`docs-deploy` 会占用 Pages 部署 | **不改文件所以零冲突**。上游新增 workflow 时记得也去禁用 |
| 无自建 CI | 新增 `.github/workflows/omk-ci.yml` | 只验证 omk 包 + 守住侵入面白名单 | 新文件，不冲突 |
| Pages 部署上游 vitepress 文档 | 新增 `.github/workflows/omk-pages.yml`，部署 `site/` | 项目主页 | 新文件，不冲突 |
| `CLAUDE.md` 是**指向 `AGENTS.md` 的符号链接**（mode 120000） | 断开软链，改成真文件，内容是 fork 层指南 | 上游那套讲的是给 kimi-code 提 PR 的流程，在这里会误导 | ⚠️ **别直接写 `CLAUDE.md`**——上游它是软链，直接写会覆盖掉 `AGENTS.md`（60 天改 23 次的烫文件）。现在已是普通文件，但同步时若上游改回软链要留意。`AGENTS.md` 和 `flake.nix` **一个字都不碰** |
| 增删 workspace 包要同步 `flake.nix` | **故意不做** | `flake.nix` 60 天改 25 次，为两行登记去碰它换来长期冲突；Nix 构建这里不用，`nix-build.yml` 已禁用 | 代价：`node scripts/check-nix-workspace.mjs` 会一直报 `@omk/core` 缺失、退出码 1。**这是预期行为，别去"修"** |
| 无 `packages/omk/AGENTS.md` | 新增 | 上游约定「follow the nearest AGENTS.md」，在 omk 里干活时会命中这份 | 新文件，不冲突 |

## 我已改进、不许被上游盖回去的行为

> 上游可能在同一处「按它自己的想法」重写。移植前先写 before/after，
> 否则改进会被静默回滚而你不会发现。

_（还没有。第一条改进落地时补这里。）_

## 同步点

同步记录写在 commit 历史里，格式：

```
chore(omk): 同步上游 (<from>..<to>)
```

查最近一次同步：

```bash
git log --oneline --grep='同步上游' -1
```
