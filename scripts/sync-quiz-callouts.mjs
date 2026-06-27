#!/usr/bin/env node
/**
 * Inserts quiz callouts into handbook chapters that have quiz packs.
 * Run: node scripts/sync-quiz-callouts.mjs
 * Check: node scripts/sync-quiz-callouts.mjs --check
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const TOPICS_DIR = join(ROOT, 'quizzes', 'topics')

const CALLOUT_MARKER = '::: tip Quizzes & Challenges'
const CALLOUT_BLOCK = `::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::
`

function pagePathToFile(pagePath) {
  const stripped = pagePath.replace(/^\//, '')
  return join(ROOT, `${stripped}.md`)
}

async function collectPagePaths() {
  const files = (await readdir(TOPICS_DIR)).filter((f) => f.endsWith('.ts')).sort()
  const paths = []
  for (const file of files) {
    const content = await readFile(join(TOPICS_DIR, file), 'utf8')
    const pagePath = content.match(/pagePath:\s*'([^']+)'/)?.[1]
    if (pagePath) paths.push(pagePath)
  }
  return paths.sort()
}

function insertCallout(content) {
  if (content.includes(CALLOUT_MARKER)) {
    return { content, changed: false }
  }

  const projectIdx = content.indexOf('::: tip Project Lab')
  if (projectIdx !== -1) {
    return {
      content: content.slice(0, projectIdx) + CALLOUT_BLOCK + '\n' + content.slice(projectIdx),
      changed: true,
    }
  }

  const nextIdx = content.indexOf('**Next:**')
  if (nextIdx !== -1) {
    return {
      content: content.slice(0, nextIdx) + CALLOUT_BLOCK + '\n' + content.slice(nextIdx),
      changed: true,
    }
  }

  return { content: content.trimEnd() + '\n\n' + CALLOUT_BLOCK + '\n', changed: true }
}

const check = process.argv.includes('--check')
const pagePaths = await collectPagePaths()
let missing = 0
let updated = 0

for (const pagePath of pagePaths) {
  const filePath = pagePathToFile(pagePath)
  let content
  try {
    content = await readFile(filePath, 'utf8')
  } catch {
    console.error(`Missing handbook file for quiz pagePath: ${pagePath}`)
    missing++
    continue
  }

  const { content: next, changed } = insertCallout(content)
  if (!next.includes(CALLOUT_MARKER)) {
    console.error(`Failed to insert callout: ${pagePath}`)
    missing++
    continue
  }

  if (check) {
    if (changed) {
      console.error(`Missing quiz callout: ${pagePath}`)
      missing++
    }
  } else if (changed) {
    await writeFile(filePath, next)
    updated++
  }
}

if (check) {
  if (missing > 0) {
    console.error(`\n${missing} chapter(s) missing quiz callouts. Run: npm run sync:quiz-callouts`)
    process.exit(1)
  }
  console.log(`Quiz callout check passed (${pagePaths.length} chapters).`)
} else {
  console.log(`Quiz callouts synced: ${updated} updated, ${pagePaths.length - updated} already present.`)
}