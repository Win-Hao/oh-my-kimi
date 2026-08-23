/**
 * oh-my-kimi entry point.
 *
 * Everything this fork adds lives under `packages/omk`. Upstream files are
 * touched in exactly one place — a single `import '@omk/core'` in
 * `apps/kimi-code/src/main.ts` — so upstream merges stay conflict-free.
 *
 * Keep this file side-effect-light: it runs before the CLI parses argv.
 */

export const OMK_VERSION = '0.1.0';

/** Features register themselves here as they are added. */
const features: string[] = [];

export function registerFeature(name: string): void {
  features.push(name);
}

export function listFeatures(): readonly string[] {
  return features;
}

if (process.env['OMK_DEBUG'] === '1') {
  process.stderr.write(`[omk] v${OMK_VERSION} loaded, ${features.length} feature(s)\n`);
}
