<div align="center">

# oh-my-kimi

**个人维护的 [Kimi Code](https://github.com/MoonshotAI/kimi-code) fork，加了些自用的功能。**

持续同步上游，不是一次性拷贝。

[English](./README.en.md) · [项目主页](https://win-hao.github.io/oh-my-kimi/) · [分歧记录](./DIVERGENCES.md)

</div>

---

## 这是什么

在上游 kimi-code 之上做加法。新加的东西都住在独立的 `packages/omk/` 包里，
**对上游源码的侵入只有 2 个文件、4 行**。

## 架构

```
packages/omk/              ← 新功能都在这，新文件不与上游冲突
apps/kimi-code/src/main.ts ← 顶部一行 import '@omk/core'   ┐ 对上游的
apps/kimi-code/package.json← devDeps 一行 @omk/core        ┘ 全部侵入
```

挂载点特意选在 `apps/kimi-code/src/main.ts`——它是上游很少改动的入口文件，
而不是 `agent-core-v2/src/index.ts` 那种高频变动的注册枢纽。
CI 里有一条检查守着这个约束：任何超出白名单的上游文件改动都会让构建失败。

## 开发

```bash
pnpm install

# 启动（KIMI_CODE_HOME 隔离，不污染日常在用的 kimi）
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
而 merge 每次只处理增量。建议每天或每两天跑一次，别攒。

每次决定「这里要跟上游不一样」，记进 [`DIVERGENCES.md`](./DIVERGENCES.md)，
否则下次同步很容易把上游的写法又搬回来。

## 功能

### `/eli5` —— 说人话

把上一条回答（或指定话题）做成**一张 HTML 图解**：大图、少字，写到系统临时目录后直接在浏览器打开。

```
/eli5                 # 重讲上一条回答
/eli5 kubernetes      # 讲一个指定话题
```

照抄 [anthropics/claude-plugins-community](https://github.com/anthropics/claude-plugins-community)
里 `eli5` 插件的形状——正文只有一句核心指令，剩下的交给模型自己判断；我们只补了终端需要的落地部分
（写临时目录、打开、别写进仓库）。出处见 [`packages/omk/NOTICE.md`](./packages/omk/NOTICE.md)。

实现上它注册成上游的 **builtin skill**，所以面板里是裸的 `/eli5`（用户自建 skill 会带 `skill:` 前缀），
而且**一个上游文件都不用改**——TUI 的斜杠命令是上游写死的静态数组，
引擎的 `contributeCommand` 又只走 RPC、TUI 根本不读，builtin skill 是唯一的零侵入路径。

## 与上游的关系

本项目 fork 自 [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code)，
遵循其 MIT 许可证，版权归 Moonshot AI 所有（见 [LICENSE](./LICENSE)）。

**这是非官方的个人项目，与 Moonshot AI 无关。**
上游的问题请去上游仓库反馈，不要提到这里。

## License

MIT
