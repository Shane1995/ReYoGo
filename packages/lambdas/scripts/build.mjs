import { build } from 'esbuild';
import { glob } from 'glob';

const entryPoints = await glob('src/handlers/**/index.ts');

if (entryPoints.length === 0) {
  console.error('No handler entry points found in src/handlers/**/index.ts');
  process.exit(1);
}

await build({
  entryPoints,
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  outdir: 'dist',
  // Output each handler as dist/{handlerName}/index.js
  entryNames: '[dir]/[name]',
  outbase: 'src/handlers',
  // AWS SDK v3 is provided by the Lambda Node 22 runtime
  external: ['@aws-sdk/*'],
  sourcemap: true,
  minify: false,
});

console.log(
  `Built ${entryPoints.length} handler(s):`,
  entryPoints.map((e) => e.replace('src/handlers/', '').replace('/index.ts', '')),
);
