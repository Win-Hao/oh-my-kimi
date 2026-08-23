<div align="center">

# oh-my-kimi

**个人维护的 [Kimi Code](https://github.com/MoonshotAI/kimi-code) 增强版。**

真 fork，持续同步上游 —— 不是插件层。

[English](./README.en.md) · [项目主页](https://win-hao.github.io/oh-my-kimi/) · [分歧记录](./DIVERGENCES.md)

</div>

---

## 这是什么

在上游 kimi-code 之上做加法，一边加功能一边把 harness 的内部拆开看懂。
所有增强都住在独立的 `packages/omk/` 包里，**对上游源码的侵入只有 2 个文件、4 行**。

## 为什么不做插件层

GitHub 上已经有 15 个叫 `oh-my-kimi` 的项目。查了一遍：**14 个是插件 / 编排层，只有 1 个是真 fork。**
最高 6 颗星，绝大多数停更在 2026 年 3～7 月。

插件层有天花板 —— 把 skill、hook、MCP 配完就没得做了，项目自然停更。
真 fork 没人做，因为跟上游的维护成本吓人（kimi-code 近 30 天 281 个提交）。

这个项目要占的就是那个空位：**真 fork + 真维护**。

## 架构

```
packages/omk/              ← 我写的所有东西都在这，新文件永远不冲突
apps/kimi-code/src/main.ts ← 顶部一行 import '@omk/core'   ┐ 对上游的
apps/kimi-code/package.json← devDeps 一行 @omk/core        ┘ 全部侵入
```

接缝选 `main.ts` 是查过数据的：它近 60 天只被上游改过 **6** 次。
而看起来更正统的挂载点 `agent-core-v2/src/index.ts`（`import = register` 的枢纽）
被改了 **69** 次，是全仓第一热点文件 —— 挂在那上面等于天天解冲突。

同理，上游 churn 最高的 `src/agent`（1971）、`src/app`（1370）、`src/session`（678）
一律不碰。

## 开发

```bash
pnpm install

# 启动（KIMI_CODE_HOME 隔离，不污染你日常在用的 kimi）
cd apps/kimi-code
OMK_DEBUG=1 KIMI_CODE_HOME=~/.oh-my-kimi \
  npx tsx --tsconfig ./tsconfig.dev.json \
  --import ../../build/register-raw-text-loader.mjs ./src/main.ts
```

> ⚠️ `--tsconfig ./tsconfig.dev.json` 不能省，否则 `experimentalDecorators` 直接报错崩掉。
> 上游的 `dev:cli-only` 脚本漏了这个参数。

```bash
pnpm --filter @omk/core test        # 单测
pnpm --filter @omk/core typecheck   # 类型检查
```

## 同步上游

```bash
./scripts/omk-sync.sh --dry   # 预览：有多少新提交、哪些文件可能冲突
./scripts/omk-sync.sh         # 执行
```

用 `merge` 不用 `rebase`：这个 fork 不往上游提 PR，不需要干净的历史，
而 merge 每次只处理增量，rebase 每次都要重放全部提交。

**建议每天或每两天跑一次。** 攒一周是 70 个提交，攒一个月是 280 个 ——
冲突难度对间隔是超线性的。

每次决定「这里要跟上游不一样」，立刻记进 [`DIVERGENCES.md`](./DIVERGENCES.md)。
没有那张表，下次同步就会有人（包括三个月后的自己）把上游的写法又搬回来。

## 功能

_（骨架刚搭好，第一个功能还没落地。）_

## 与上游的关系

本项目 fork 自 [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code)，
遵循其 MIT 许可证，版权归 Moonshot AI 所有（见 [LICENSE](./LICENSE)）。

**这是非官方的个人项目，与 Moonshot AI 无关。**
上游的问题请去上游仓库反馈，不要提到这里。

## License

MIT
