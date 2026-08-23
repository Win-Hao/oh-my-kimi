# packages/omk

oh-my-kimi 在上游 kimi-code 之上加的所有东西都住在这个包里。
仓库级的规则见根目录 `CLAUDE.md`；这里只写本包的约定。

## 为什么是一个独立的包

新文件永远不会跟上游冲突。把增强放进独立包，冲突面积就被锁死在
「对上游的两行接缝」上，而不是随功能数量增长。

（上游的 `AGENTS.md` 是写给 kimi-code 贡献者的，不覆盖本包。）

## 加一个功能

1. 在 `src/` 下新建模块，功能自成一个文件或目录。
2. 在 `src/index.ts` 里 import 它，让 `index.ts` 保持成一份「omk 加了什么」的清单。
3. 需要接进引擎时，用上游的 DI 注册点：
   - 新增服务 → `registerScopedService(scope, id, ctor, ...)`
   - **替换上游服务的实现** → `overrideScopedService(...)`，这是上游提供的正规替换入口，
     用它就不用去改上游源码。
4. 配套测试写进 `test/`。

## 加载时序（别改）

`src/index.ts` 顶部有一行 `import '@moonshot-ai/agent-core-v2'`，**不能删**。

上游的服务是在模块顶层调 `registerScopedService()` 自注册的，而
`overrideScopedService()` 在找不到已有注册时会抛错。omk 是通过
`apps/kimi-code/src/main.ts` 的第一行被加载的，比上游任何模块都早——
所以必须自己先把上游 barrel 拉进来，注册表才是满的。

`test/registry.test.ts` 锁住了这条链路，删掉那行 import 它会红。

## tsconfig 的一个坑

`tsconfig.json` 的 `include` 里有 `../agent-core-v2/src/env.d.ts`，**不能删**。

上游用 `*.md?raw` 导入 prompt 文件，环境声明在那份 `env.d.ts` 里。omk 依赖
agent-core-v2，`tsc` 会跟进它的源码，拿不到声明就是 100 多个 `TS2307`。
若上游把该文件挪走，这里会立刻报错——那是好事，别改成通配符掩盖掉。

## 注释

上游把 `agent-core-v2` / `kap-server` / `transcript` 设成了无注释区，
**本包不在其列**。该写就写，尤其是「为什么这么做」——
这个 fork 的很多决策不写下来就会在下次同步时丢掉。
