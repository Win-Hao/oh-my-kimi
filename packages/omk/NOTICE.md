# Third-party notices

What omk borrowed from elsewhere, and under what licence.

## `/eli5` (`src/skills/eli5.md`)

Follows the `eli5` plugin in
[anthropics/claude-plugins-community](https://github.com/anthropics/claude-plugins-community),
whose entire instruction is one sentence: *"Explain like I'm someone who knows nothing about
this topic, using a HTML artifact with big pictures and few words."* Our skill keeps that
sentence and adds the write-to-temp-and-open plumbing a terminal needs, since kimi-code has no
artifact panel.

Licensing of the source, as published:

- the repository is **Apache-2.0** (its `LICENSE` file carries the unfilled Apache boilerplate
  copyright line);
- the plugin's own `.claude-plugin/plugin.json` declares `"license": "MIT"` and
  `"author": { "name": "Thariq Shihipar" }`.

Both permit reuse with attribution, which this notice provides. No copyright line is
reproduced here because the source does not state one.
