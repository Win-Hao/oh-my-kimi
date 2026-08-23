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
