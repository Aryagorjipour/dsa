export interface GlossaryRule {
  /** Literal string or RegExp source (when isRegex is true) */
  match: string
  spoken: string
  isRegex?: boolean
  /** Lower = higher priority among same-length matches; user overrides use 0 */
  priority?: number
}

/** Shipped handbook pronunciation rules — longest match wins at runtime. */
export const DEFAULT_GLOSSARY: GlossaryRule[] = [
  // Complexity notation (regex, longest first)
  { match: 'O\\(n\\s*log\\s*n\\)', spoken: 'big O of n log n', isRegex: true, priority: 10 },
  { match: 'O\\(n\\^2\\)|O\\(n²\\)', spoken: 'big O of n squared', isRegex: true, priority: 10 },
  { match: 'O\\(log\\s*n\\)', spoken: 'big O of log n', isRegex: true, priority: 10 },
  { match: 'O\\(2\\^n\\)', spoken: 'big O of two to the n', isRegex: true, priority: 10 },
  { match: 'O\\(n!\\)', spoken: 'big O of n factorial', isRegex: true, priority: 10 },
  { match: 'O\\(n\\)', spoken: 'big O of n', isRegex: true, priority: 5 },
  { match: 'O\\(1\\)', spoken: 'big O of one', isRegex: true, priority: 5 },
  { match: 'O\\(k\\)', spoken: 'big O of k', isRegex: true, priority: 5 },

  // Languages & platforms
  { match: 'C#', spoken: 'C sharp', priority: 20 },
  { match: '.NET', spoken: 'dot net', priority: 20 },
  { match: 'ASP.NET', spoken: 'A S P dot net', priority: 20 },

  // Acronyms (spell out)
  { match: 'API', spoken: 'A P I', priority: 15 },
  { match: 'LRU', spoken: 'L R U', priority: 15 },
  { match: 'LFU', spoken: 'L F U', priority: 15 },
  { match: 'BFS', spoken: 'B F S', priority: 15 },
  { match: 'DFS', spoken: 'D F S', priority: 15 },
  { match: 'DP', spoken: 'dynamic programming', priority: 15 },
  { match: 'MST', spoken: 'M S T', priority: 15 },
  { match: 'KMP', spoken: 'K M P', priority: 15 },
  { match: 'BST', spoken: 'B S T', priority: 15 },
  { match: 'JSON', spoken: 'jay son', priority: 15 },
  { match: 'HTTP', spoken: 'H T T P', priority: 15 },
  { match: 'URL', spoken: 'U R L', priority: 15 },
  { match: 'CPU', spoken: 'C P U', priority: 15 },
  { match: 'GPU', spoken: 'G P U', priority: 15 },

  // Compound DSA phrases (keep natural flow)
  { match: 'hash map', spoken: 'hashmap', priority: 12 },
  { match: 'hash table', spoken: 'hashtable', priority: 12 },
  { match: 'linked list', spoken: 'linkedlist', priority: 12 },
  { match: 'binary search', spoken: 'binary search', priority: 12 },
  { match: 'red-black tree', spoken: 'red black tree', priority: 12 },
  { match: 'segment tree', spoken: 'segment tree', priority: 12 },
  { match: 'dynamic array', spoken: 'dynamic array', priority: 12 },
  { match: 'priority queue', spoken: 'priority queue', priority: 12 },
  { match: 'ring buffer', spoken: 'ring buffer', priority: 12 },
  { match: 'union-find', spoken: 'union find', priority: 12 },
  { match: 'real-world', spoken: 'real world', priority: 8 },
  { match: 'real world', spoken: 'real world', priority: 8 },
]

export const GLOSSARY_VERSION = '1'