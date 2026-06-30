#!/usr/bin/env node
/**
 * Ensure Piper/ONNX WASM source assets exist in node_modules (Vite ?url imports).
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve('.')
const REQUIRED = [
  'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.mjs',
  'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm',
  'node_modules/@diffusionstudio/piper-wasm/build/piper_phonemize.wasm',
  'node_modules/@diffusionstudio/piper-wasm/build/piper_phonemize.data',
]

let failed = 0
for (const rel of REQUIRED) {
  const full = path.join(ROOT, rel)
  if (!fs.existsSync(full)) {
    console.error(`FAIL: missing ${rel}`)
    failed += 1
    continue
  }
  const size = fs.statSync(full).size
  if (size < 1024) {
    console.error(`FAIL: ${rel} too small (${size} bytes)`)
    failed += 1
    continue
  }
  console.log(`ok: ${rel} (${(size / 1024 / 1024).toFixed(1)} MB)`)
}

if (failed) {
  console.error(`\n${failed} check(s) failed`)
  process.exit(1)
}

console.log('\nAll TTS WASM source checks passed')