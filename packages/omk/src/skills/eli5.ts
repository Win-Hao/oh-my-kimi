/**
 * `/eli5` — re-explains something in plain language.
 *
 * The prompt body follows the `eli5` plugin in anthropics/claude-plugins-community; see the
 * package root's NOTICE.md.
 *
 * That original is four lines — one instruction, no numbers. Ours is ~8 KB because it also
 * carries a design system and a layout procedure. That is deliberate and should not be
 * "simplified" back:
 *
 * - The art direction locks the *style*, not just the quality. Without it every run invents
 *   its own layout and palette; a tool people reach for repeatedly should look the same
 *   every time. This reason holds no matter how good the model gets.
 * - The layout procedure (plan nodes and edges, place on a fixed grid, derive endpoints
 *   from box geometry) exists because models estimate SVG coordinates and produce dangling
 *   arrows and orphan boxes. Rules cannot fix arithmetic; a procedure can.
 * - Anything that is a *number* here should read as a condition, not a constant — section
 *   count follows the topic's idea count rather than a fixed range, because a fixed range
 *   silently truncates broad topics.
 *
 * Why this ships as an upstream *builtin skill* instead of a command:
 *
 * - The TUI's slash commands come from `BUILTIN_SLASH_COMMANDS`, a static array
 *   in `apps/kimi-code/src/tui/commands/registry.ts`. Adding one there means
 *   editing a third upstream file.
 * - The engine's `contributeCommand` seam (`Feature.contributeCommand`) is only
 *   surfaced over RPC as `agentCommandService.list` / `run`. The SDK and the
 *   VS Code app read it; the TUI never does, so a contributed command would not
 *   be typeable in the CLI.
 * - Skills *are* merged into the palette at runtime, and `buildSkillSlashCommands`
 *   gives a skill whose `source` is `'builtin'` a bare name — `/eli5` — while
 *   user and project skills get the `skill:` prefix.
 *
 * So the builtin-skill registry is the only route to a real `/eli5` with zero
 * upstream edits. `registerBuiltinSkill` is a module-level static channel
 * (same shape as `registerConfigSection`); `BuiltinSkillSource.load()` folds the
 * contributions in lazily at App scope, so registering at import time is enough.
 */
import { parseSkillText, type SkillDefinition } from '@moonshot-ai/agent-core-v2';
// Deep import: the barrel re-exports `builtin/builtin` but not `builtin/registry`,
// so this symbol is only reachable through the package's `./*` subpath export.
// Recorded in DIVERGENCES.md — if upstream moves the file, this throws at import.
import { registerBuiltinSkill } from '@moonshot-ai/agent-core-v2/app/skillCatalog/builtin/registry';

// Relative, not `#/...`: the package's imports map is `#/*` -> `./src/*.ts`,
// which would append `.ts` to the markdown path.
import ELI5_BODY from './eli5.md?raw';

export const ELI5_FEATURE_NAME = 'eli5';

/** Upstream builtin skills carry a `builtin://<name>` pseudo path; match that. */
const PSEUDO_PATH = 'builtin://eli5';

const parsed = parseSkillText({
  skillMdPath: '/builtin/skills/eli5.md',
  skillDirName: ELI5_FEATURE_NAME,
  source: 'builtin',
  text: ELI5_BODY,
});

export const ELI5_SKILL: SkillDefinition = {
  ...parsed,
  path: PSEUDO_PATH,
  dir: PSEUDO_PATH,
  metadata: {
    ...parsed.metadata,
    // `inline` keeps it user-activatable in the palette and lets the model reach
    // for it on its own when the user asks for a simpler explanation.
    type: parsed.metadata.type ?? 'inline',
  },
};

registerBuiltinSkill(ELI5_SKILL);
