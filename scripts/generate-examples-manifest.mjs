import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const EXAMPLES = join(ROOT, 'examples')
const OUT = join(ROOT, 'public', 'examples-manifest.json')

/** Map example filenames to handbook page paths */
const PAGE_MAP = {
  'binary_search_twocrystals': '/algorithms/07-binary-search',
  'knapsack': '/algorithms/34-0-1-knapsack',
  'segment_tree_range_sum': '/data-structures/20-segment-tree',
  'bloom_filter': '/data-structures/24-bloom-filter',
  'skip_list_basic': '/data-structures/19-skip-list',
  'trie_autocomplete': '/data-structures/17-trie',
  'consistent_hashing': '/algorithms/47-consistent-hashing',
  'rate_limiter': '/algorithms/48-rate-limiting',
  'union_find_mst': '/algorithms/31-mst-kruskal-prim',
  'astar_grid': '/algorithms/32-astar',
  'aho_corasick': '/algorithms/43-aho-corasick',
  'hyperloglog_simple': '/data-structures/26-hyperloglog',
  'rope_basic': '/data-structures/29-rope',
  'quadtree_2d': '/data-structures/32-quadtree',
  'BloomFilterDemo': '/data-structures/24-bloom-filter',
  'BinarySearchTwoCrystals': '/algorithms/07-binary-search',
  'SegmentTreeRange': '/data-structures/20-segment-tree',
  'TrieAutocomplete': '/data-structures/17-trie',
  'ConsistentHashing': '/algorithms/47-consistent-hashing',
  'LIS': '/algorithms/38-longest-increasing-subsequence',
}

async function readExamples(dir, lang, ext) {
  const entries = await readdir(dir).catch(() => [])
  const result = {}
  for (const file of entries) {
    if (!file.endsWith(ext)) continue
    const key = basename(file, ext)
    const content = await readFile(join(dir, file), 'utf8')
    const page = PAGE_MAP[key]
    if (!page) continue
    if (!result[page]) result[page] = {}
    result[page][lang] = content
  }
  return result
}

const goExamples = await readExamples(join(EXAMPLES, 'go'), 'go', '.go')
const csExamples = await readExamples(join(EXAMPLES, 'csharp'), 'csharp', '.cs')

const manifest = {}
for (const [page, langs] of Object.entries(goExamples)) {
  manifest[page] = { ...manifest[page], ...langs }
}
for (const [page, langs] of Object.entries(csExamples)) {
  manifest[page] = { ...(manifest[page] || {}), ...langs }
}

await writeFile(OUT, JSON.stringify(manifest, null, 2))
console.log(`Wrote ${Object.keys(manifest).length} page mappings to public/examples-manifest.json`)