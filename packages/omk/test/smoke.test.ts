import { describe, expect, it } from 'vitest';

import { listFeatures, OMK_VERSION, registerFeature } from '#/index';

describe('omk core', () => {
  it('exposes a version', () => {
    expect(OMK_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('collects registered features', () => {
    registerFeature('smoke');
    expect(listFeatures()).toContain('smoke');
  });
});
