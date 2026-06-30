#!/usr/bin/env node
/**
 * Scan handbook markdown for symbols that should have glossary coverage.
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve('.')
const strict = process.argv.includes('--strict')

const COVERED_PATTERNS = [
  /C#/,
  /\.NET/,
  /O\([^)]+\)/,
  /\bAPI\b/,
  /\bLRU\b/,
  /\bBFS\b/,
  /\bDFS\b/,
]

const GLOSSARY_MATCHES = [
  'C#',
  '.NET',
  'O\\(n',
  'API',
  'LRU',
  'BFS',
  'DFS',
  'hash map',
]

const SKIP_DIRS = new Set(['node_modules', '.git', '.vitepress/dist', 'examples'])

function walkMd(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkMd(full, files)
    else if (entry.name.endsWith('.md')) files.push(full)
  }
  return files
}

function countMatches(text, re) {
  const m = text.match(new RegExp(re.source, re.flags + (re.global ? '' : 'g')))
  return m?.length ?? 0
}

const files = walkMd(ROOT)
const hits = new Map()

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8')
  for (const pat of COVERED_PATTERNS) {
    const n = countMatches(text, pat)
    if (n > 0) {
      const key = pat.source
      hits.set(key, (hits.get(key) ?? 0) + n)
    }
  }
}

console.log('audit-tts-glossary\n')
let failed = 0

for (const [pattern, count] of hits) {
  const covered =
    pattern.startsWith('O\\(') ||
    GLOSSARY_MATCHES.some(g => pattern.includes(g.replace(/\\/g, '')) || g.includes(pattern.slice(0, 4)))
  const line = `  ${covered ? '✓' : '✗'} ${pattern}: ${count} occurrence(s) in handbook`
  console.log(line)
  if (!covered && strict) failed++
}

if (failed) {
  console.error(`\n${failed} uncovered pattern(s) — add glossary rules`)
  process.exit(1)
}

console.log('\nGlossary audit passed')