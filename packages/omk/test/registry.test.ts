/**
 * Locks in the extension mechanism this fork depends on.
 *
 * Upstream services register themselves at module load time via
 * `registerScopedService`, and `overrideScopedService` exists specifically for
 * intentional replacement. That means omk can add or replace services without
 * editing upstream files — but only if agent-core-v2 is imported first, since
 * `overrideScopedService` throws when no prior registration exists.
 */
import { describe, expect, it } from 'vitest';

import { getScopedServiceDescriptors } from '@moonshot-ai/agent-core-v2';

describe('upstream scoped-service registry', () => {
  it('is populated by importing agent-core-v2 (import = register)', () => {
    const app = getScopedServiceDescriptors('app');
    expect(app.length).toBeGreaterThan(0);
  });

  it('exposes the scopes omk may attach to', () => {
    const scopes = ['app', 'session', 'agent'].map((s) => ({
      scope: s,
      count: getScopedServiceDescriptors(s).length,
    }));
    for (const { count } of scopes) {
      expect(count).toBeGreaterThan(0);
    }
  });
});
