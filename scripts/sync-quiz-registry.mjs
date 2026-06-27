#!/usr/bin/env node
/**
 * Regenerates quizzes/registry.ts from quizzes/topics/*.ts files.
 * Run: node scripts/sync-quiz-registry.mjs
 * Check: node scripts/sync-quiz-registry.mjs --check
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const TOPICS_DIR = join(ROOT, 'quizzes', 'topics')
const OUT = join(ROOT, 'quizzes', 'registry.ts')

const SECTION_ORDER = { Fundamentals: 0, 'Data Structures': 1, Algorithms: 2 }

function inferSection(pagePath) {
  if (pagePath.startsWith('/fundamentals/')) return 'Fundamentals'
  if (pagePath.startsWith('/data-structures/')) return 'Data Structures'
  return 'Algorithms'
}

function fileToVar(file) {
  return file.replace(/\.ts$/, '')
}

export function generateRegistryContent(entries) {
  const loaders = entries
    .map((e) => `  '${e.pagePath}': () => import('./topics/${fileToVar(e.file)}'),`)
    .join('\n')

  const index = entries
    .map(
      (e) =>
        `  { pagePath: '${e.pagePath}', topicId: '${e.topicId}', title: '${e.title.replace(/'/g, "\\'")}', section: '${e.section}', quizCount: ${e.quizCount}, challengeCount: ${e.challengeCount} },`,
    )
    .join('\n')

  return `import type { QuizPack } from './types'

export interface QuizIndexEntry {
  pagePath: string
  topicId: string
  title: string
  section: 'Fundamentals' | 'Data Structures' | 'Algorithms'
  quizCount: number
  challengeCount: number
}

type QuizLoader = () => Promise<{ default: QuizPack }>

const LOADERS: Record<string, QuizLoader> = {
${loaders}
}

export const QUIZ_INDEX: QuizIndexEntry[] = [
${index}
]

export function totalQuizQuestions(): number {
  return QUIZ_INDEX.reduce((sum, e) => sum + e.quizCount + e.challengeCount, 0)
}

export function hasQuiz(pagePath: string): boolean {
  return pagePath in LOADERS
}

export async function loadQuizPack(pagePath: string): Promise<QuizPack | null> {
  const loader = LOADERS[pagePath]
  if (!loader) return null
  const mod = await loader()
  return mod.default
}

export function getQuizIndexEntry(pagePath: string): QuizIndexEntry | undefined {
  return QUIZ_INDEX.find(e => e.pagePath === pagePath)
}
`
}

async function collectEntries() {
  const files = (await readdir(TOPICS_DIR)).filter((f) => f.endsWith('.ts')).sort()
  const entries = []

  for (const file of files) {
    const content = await readFile(join(TOPICS_DIR, file), 'utf8')
    const pagePath = content.match(/pagePath:\s*'([^']+)'/)?.[1]
    const topicId = content.match(/topicId:\s*'([^']+)'/)?.[1]
    const title = content.match(/title:\s*'([^']+)'/)?.[1]
    if (!pagePath || !topicId || !title) {
      console.warn(`Skipping ${file}: missing metadata`)
      continue
    }
    const quizCount = (content.match(/id:\s*'[^']+-q\d+'/g) || []).length
    const challengeCount = (content.match(/id:\s*'[^']+-c\d+'/g) || []).length
    entries.push({
      file,
      pagePath,
      topicId,
      title,
      section: inferSection(pagePath),
      quizCount: quizCount || 8,
      challengeCount: challengeCount || 2,
    })
  }

  entries.sort((a, b) => {
    const sa = SECTION_ORDER[a.section] - SECTION_ORDER[b.section]
    if (sa !== 0) return sa
    return a.pagePath.localeCompare(b.pagePath)
  })

  return entries
}

const check = process.argv.includes('--check')
const entries = await collectEntries()
const output = generateRegistryContent(entries)

if (check) {
  const existing = await readFile(OUT, 'utf8')
  if (existing !== output) {
    console.error('quizzes/registry.ts is out of date. Run: npm run sync:quizzes')
    process.exit(1)
  }
  const totalQ = entries.reduce((s, e) => s + e.quizCount + e.challengeCount, 0)
  console.log(`Registry check passed (${entries.length} topics, ${totalQ} questions).`)
} else {
  await writeFile(OUT, output)
  const totalQ = entries.reduce((s, e) => s + e.quizCount + e.challengeCount, 0)
  console.log(`Wrote registry with ${entries.length} topics, ${totalQ} total questions`)
}