/**
 * Locks the route `/eli5` takes to the palette.
 *
 * The chain is: omk imports the skill module -> `registerBuiltinSkill` puts it in
 * the upstream static contribution list -> `visibleBuiltinSkills` folds it into
 * `BuiltinSkillSource` -> the TUI names a *builtin*-sourced skill by its bare
 * name. Every link below is upstream behaviour omk depends on, so a sync that
 * breaks one should fail here rather than in a session.
 */
import { describe, expect, it } from 'vitest';

import {
  InMemorySkillCatalog,
  isUserActivatableSkillType,
  visibleBuiltinSkills,
} from '@moonshot-ai/agent-core-v2';
import { getBuiltinSkillContributions } from '@moonshot-ai/agent-core-v2/app/skillCatalog/builtin/registry';

import { ELI5_FEATURE_NAME, ELI5_SKILL } from '#/skills/eli5';
import { listFeatures } from '#/index';

describe('eli5 skill', () => {
  it('parses out of the markdown with the frontmatter name and description', () => {
    expect(ELI5_SKILL.name).toBe('eli5');
    expect(ELI5_SKILL.description.length).toBeGreaterThan(0);
    expect(ELI5_SKILL.content).toContain('$ARGUMENTS');
  });

  it('keeps the description short enough to survive the model listing', () => {
    // `formatModelSkill` truncates at LISTING_DESC_MAX (250) when building the
    // system-prompt listing, and the description is the only part of the skill
    // that lives there — a truncated one loses its trigger words.
    expect(ELI5_SKILL.description.length).toBeLessThanOrEqual(250);
  });

  it('registers itself into the upstream builtin contributions on import', () => {
    expect(getBuiltinSkillContributions().map((skill) => skill.name)).toContain('eli5');
  });

  it('survives the builtin visibility filter with product skills off', () => {
    // `productSpecific` would hide it for users who turned product skills off,
    // and an `experimentalFlag` would hide it behind a flag. It has neither.
    const visible = visibleBuiltinSkills(false).map((skill) => skill.name);
    expect(visible).toContain('eli5');
  });

  it('is the kind of skill the TUI turns into a bare `/eli5`', () => {
    // buildSkillSlashCommands drops the `skill:` prefix only for builtin sources,
    // and lists only user-activatable types.
    expect(ELI5_SKILL.source).toBe('builtin');
    expect(isUserActivatableSkillType(ELI5_SKILL.metadata.type)).toBe(true);
  });

  it('renders a topic argument into the prompt', () => {
    const catalog = new InMemorySkillCatalog();
    catalog.registerBuiltinSkill(ELI5_SKILL);
    const rendered = catalog.renderSkillPrompt(ELI5_SKILL, 'kubernetes');
    expect(rendered).toContain('kubernetes');
    expect(rendered).not.toContain('$ARGUMENTS');
  });

  it('renders with no argument at all, leaving the target to the conversation', () => {
    const catalog = new InMemorySkillCatalog();
    const rendered = catalog.renderSkillPrompt(ELI5_SKILL, '');
    expect(rendered).not.toContain('$ARGUMENTS');
    // The `$ARGUMENTS` placeholder counts as consumed, so upstream must not
    // append its `ARGUMENTS:` fallback block.
    expect(rendered).not.toContain('ARGUMENTS:');
  });

  it('shows up in the omk feature manifest', () => {
    expect(listFeatures()).toContain(ELI5_FEATURE_NAME);
  });
});
