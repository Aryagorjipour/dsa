#!/usr/bin/env node
import { readdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const examplesDir = join(root, 'examples', 'go')

const files = (await readdir(examplesDir)).filter((f) => f.endsWith('.go')).sort()
let failed = 0

for (const file of files) {
  const path = join(examplesDir, file)
  const build = spawnSync('go', ['build', '-o', '/dev/null', path], { encoding: 'utf-8' })
  if (build.status !== 0) {
    failed++
    console.error(`FAIL build ${file}:\n${build.stderr || build.stdout}`)
    continue
  }

  const run = spawnSync('go', ['run', path], { encoding: 'utf-8' })
  if (run.status !== 0) {
    failed++
    console.error(`FAIL run ${file}:\n${run.stderr || run.stdout}`)
    continue
  }

  if (file === 'hyperloglog_simple.go') {
    const match = (run.stdout || '').match(/Estimated unique:\s*([\d.]+)/)
    if (!match) {
      failed++
      console.error(`FAIL ${file}: missing "Estimated unique:" output`)
      continue
    }
    const estimate = Number(match[1])
    if (estimate < 6000 || estimate > 10000) {
      failed++
      console.error(`FAIL ${file}: estimate ${estimate} outside [6000, 10000]`)
      continue
    }
  }

  console.log(`OK ${file}`)
}

if (failed > 0) {
  console.error(`\n${failed} Go example(s) failed verification.`)
  process.exit(1)
}

console.log(`\nAll ${files.length} Go examples built and ran successfully.`)