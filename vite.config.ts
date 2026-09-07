import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build metadata is baked in at compile time; the workflow exports these from the run.
const buildSha = process.env.GITHUB_SHA ?? process.env.BUILD_SHA ?? 'local';
const buildTime = process.env.BUILD_TIME ?? new Date().toISOString();

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_SHA__: JSON.stringify(buildSha),
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
});
