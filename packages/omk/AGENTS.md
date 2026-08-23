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
   - **加一条用户可敲的斜杠命令** → 注册成 builtin skill：
     `registerBuiltinSkill(...)`（深导入 `agent-core-v2/app/skillCatalog/builtin/registry`），
     参考 `src/features/eli5/`。
     别走 `Feature.contributeCommand`——那条 seam 只通过 RPC 暴露给 SDK / VS Code，
     TUI 的斜杠命令来自上游写死的 `BUILTIN_SLASH_COMMANDS`，压根不读它。
     builtin 来源的 skill 在面板里是裸名（`/eli5`），用户 skill 才带 `skill:` 前缀。
4. 配套测试写进 `test/`。

## 目录约定

**按大类分目录，一类一个文件夹**（照 oh-my-pi 的 `tools/` / `commands/` / `slash-commands/`）。

```
packages/omk/
  NOTICE.md                第三方许可，按功能分节
  src/
    index.ts               清单：import 各模块 + registerFeature('<名字>')，逻辑一行不放
    skills/                接 registerBuiltinSkill —— 用户可敲的斜杠命令
      eli5.ts                注册 + SkillDefinition
      eli5.md                正文（`?raw` 导入，tsdown 的 rawTextPlugin 负责内联）
    tools/                 接 Feature.contributeTool —— 模型可调用的工具
    services/              接 registerScopedService / overrideScopedService
    features/              需要上游 Feature 类时（contributeConfig / contributeCommand 等）
    lib/                   跨类共享代码
  test/<名字>.test.ts      一个功能一个测试文件
```

`tools/` `services/` `features/` `lib/` 先不建空目录，第一次用到时再开。

四条规则：

1. **目录 = 接的哪个 seam。** 看一个文件在哪个目录，就知道它挂在上游的哪个扩展点上——
   同步上游时该盯哪块代码，一目了然。
2. **一个文件够就别建目录。** 上游自己的 builtin skill 就是 `write-goal.ts` + `write-goal.md`
   平铺在一起的，照这个来。超过三四个文件再给它开子目录。
3. **一个功能横跨多类时，靠同名串起来**：`skills/eli5.ts` + `tools/eli5.ts`，
   不要为此把它们塞回同一个目录——那就退回按功能分了。
4. **`index.ts` 保持成清单。** 想知道 omk 加了什么，读这一个文件就够。

删功能：删各类目录下的同名文件、删 `index.ts` 那一行、删测试、删 `NOTICE.md` 分节、
删 `DIVERGENCES.md` 里对应的行。

命名：文件名跟用户看到的名字一致（`eli5.ts` → `/eli5`），kebab-case。

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
