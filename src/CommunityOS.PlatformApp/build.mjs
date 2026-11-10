import { copyFile, mkdir } from 'node:fs/promises';
import { build } from 'esbuild';

await mkdir('dist', { recursive: true });
await build({
  entryPoints: ['main.tsx'],
  bundle: true,
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
  outfile: 'dist/platform.js',
});
await copyFile('index.html', 'dist/index.html');
