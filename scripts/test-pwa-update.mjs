#!/usr/bin/env node
/**
 * Static checks for PWA update wiring.
 */

import fs from 'node:fs'
import path from 'node:path'

let failed = 0
function assert(name, cond) {
  if (!cond) {
    console.error(`FAIL: ${name}`)
    failed++
  } else {
    console.log(`ok: ${name}`)
  }
}

const swComposable = fs.readFileSync(
  path.resolve('.vitepress/theme/composables/useServiceWorker.ts'),
  'utf8',
)
const prompt = fs.readFileSync(
  path.resolve('.vitepress/theme/components/PwaUpdatePrompt.vue'),
  'utf8',
)
const config = fs.readFileSync(path.resolve('.vitepress/config.mts'), 'utf8')
const swHelper = fs.readFileSync(path.resolve('public/sw-clean-urls.js'), 'utf8')

assert('applyServiceWorkerUpdate exported', swComposable.includes('export async function applyServiceWorkerUpdate'))
assert('onNeedReload reload hook', swComposable.includes('onNeedReload'))
assert('SKIP_WAITING postMessage', swComposable.includes("postMessage({ type: 'SKIP_WAITING' })"))
assert('controllerchange reload fallback', swComposable.includes("addEventListener('controllerchange'"))
assert('prompt uses applyServiceWorkerUpdate', prompt.includes('applyServiceWorkerUpdate'))
assert('injectRegister disabled', config.includes('injectRegister: false'))
assert('sw helper handles SKIP_WAITING', swHelper.includes("type === 'SKIP_WAITING'"))

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}

console.log('\nAll PWA update wiring tests passed')