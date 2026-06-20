#!/usr/bin/env node
import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const examplesDir = join(root, 'examples', 'go');

const files = (await readdir(examplesDir)).filter((f) => f.endsWith('.go'));
let failed = 0;

for (const file of files) {
  const path = join(examplesDir, file);
  const result = spawnSync('go', ['build', '-o', '/dev/null', path], {
    encoding: 'utf-8',
  });
  if (result.status !== 0) {
    failed++;
    console.error(`FAIL ${file}:\n${result.stderr || result.stdout}`);
  } else {
    console.log(`OK ${file}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} Go example(s) failed to compile.`);
  process.exit(1);
}

console.log(`\nAll ${files.length} Go examples compiled successfully.`);