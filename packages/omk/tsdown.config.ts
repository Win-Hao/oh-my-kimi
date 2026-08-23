import { defineConfig } from 'tsdown';

// Shared build helper (read-only upstream file, same one agent-core-v2 uses):
// inlines `*.md?raw` imports so prompt/skill markdown ships inside the bundle.
import { rawTextPlugin } from '../../build/raw-text-plugin.mjs';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  plugins: [rawTextPlugin()],
});
