/**
 * oh-my-kimi entry point.
 *
 * Everything this fork adds lives under `packages/omk`. Upstream files are
 * touched in exactly one place — a single `import '@omk/core'` at the top of
 * `apps/kimi-code/src/main.ts` — so upstream merges stay conflict-free.
 *
 * Load order matters. Upstream services register themselves as a side effect of
 * being imported (`registerScopedService` runs at module top level), and
 * `overrideScopedService` throws when no prior registration exists. Since this
 * module runs before anything else in `main.ts`, it must pull in the upstream
 * barrel itself before any feature tries to register or override.
 *
 * Keep this file side-effect-light otherwise: it runs before argv is parsed.
 */

// Side-effect import: populates the upstream scoped-service registry.
import '@moonshot-ai/agent-core-v2';

export const OMK_VERSION = '0.1.0';

/** Features register themselves here as they are added. */
const features: string[] = [];

export function registerFeature(name: string): void {
  features.push(name);
}

export function listFeatures(): readonly string[] {
  return features;
}

// ---------------------------------------------------------------------------
// Features go below. Each one should live in its own module under `src/` and be
// imported here, so that this file stays a readable manifest of what omk adds.
// ---------------------------------------------------------------------------

if (process.env['OMK_DEBUG'] === '1') {
  process.stderr.write(`[omk] v${OMK_VERSION} loaded, ${features.length} feature(s)\n`);
}
