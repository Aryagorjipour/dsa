import type { QuizPack } from '../types'

export default {
  pagePath: '/data-structures/24-bloom-filter',
  topicId: 'bloom-filter',
  title: 'Bloom Filter',
  quiz: [
    {
      id: 'bloom-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'What question does a Bloom filter answer?',
      options: [
        { id: 'a', text: '"Might this item have been seen before?" — with possible false positives, never false negatives' },
        { id: 'b', text: '"Exactly how many times was this item inserted?"' },
        { id: 'c', text: '"What is the k-th smallest element?"' },
        { id: 'd', text: '"Are these two elements in the same connected component?"' },
      ],
      correct: ['a'],
      explanation: 'Bloom filters give definite "not present" or probable "present" — a one-sided error model.',
    },
    {
      id: 'bloom-q2',
      type: 'true-false',
      difficulty: 'easy',
      question: 'A standard Bloom filter never produces false negatives.',
      correct: true,
      explanation: 'If any hash position is 0, the item was definitely never added. All-1s means "probably seen."',
    },
    {
      id: 'bloom-q3',
      type: 'complexity',
      difficulty: 'medium',
      question: 'Time complexity of Add and Query in a Bloom filter with k hash functions:',
      options: [
        { id: 'a', text: 'O(1)' },
        { id: 'b', text: 'O(k)' },
        { id: 'c', text: 'O(m) where m = bit array size' },
        { id: 'd', text: 'O(n) where n = items inserted' },
      ],
      correct: ['b'],
      explanation: 'Both operations run k hash functions and touch k bits — O(k), independent of n.',
    },
    {
      id: 'bloom-q4',
      type: 'scenario',
      difficulty: 'medium',
      question: 'RocksDB checks a Bloom filter before reading an SSTable from disk. The filter says "definitely not present." What happens?',
      options: [
        { id: 'a', text: 'Skip the disk read — the key cannot be in that SSTable' },
        { id: 'b', text: 'Read the SSTable anyway because Bloom filters always lie' },
        { id: 'c', text: 'Rebuild the entire database' },
        { id: 'd', text: 'Delete the SSTable' },
      ],
      correct: ['a'],
      explanation: 'No false negatives means a negative answer is trustworthy — huge I/O savings in LSM storage engines.',
    },
    {
      id: 'bloom-q5',
      type: 'mcq-multi',
      difficulty: 'medium',
      question: 'Which are true about standard Bloom filters? (Select all that apply)',
      options: [
        { id: 'a', text: 'Uses a bit array and k hash functions' },
        { id: 'b', text: 'Cannot delete items without a variant (e.g., counting Bloom filter)' },
        { id: 'c', text: 'False positive rate grows as more items are inserted' },
        { id: 'd', text: 'Provides exact membership with zero error' },
      ],
      correct: ['a', 'b', 'c'],
      explanation: 'Standard Blooms are approximate, insert-only structures. Exact membership needs a hash set or similar.',
    },
    {
      id: 'bloom-q6',
      type: 'fill-blank',
      difficulty: 'medium',
      question: 'During a Bloom filter query, if ___ bit corresponding to any of the k hashes is 0, the item is definitely not present.',
      correct: ['any', 'a'],
      aliases: ['any one', 'at least one'],
      explanation: 'A zero bit means no inserted item set that position — conclusive negative answer.',
    },
    {
      id: 'bloom-q7',
      type: 'scenario',
      difficulty: 'hard',
      question: 'A web crawler deduplicates billions of URLs in memory. Occasional re-fetching of a seen URL is acceptable. Best structure?',
      options: [
        { id: 'a', text: 'Bloom filter — compact, fast, tolerates rare false positives' },
        { id: 'b', text: 'Exact hash set storing every full URL string' },
        { id: 'c', text: 'B+ tree with disk persistence per URL' },
        { id: 'd', text: 'Trie storing every character of every URL without compression' },
      ],
      correct: ['a'],
      explanation: 'Billions of URLs cannot all sit in an exact set — Bloom filters trade tiny FP rate for massive memory savings.',
    },
    {
      id: 'bloom-q8',
      type: 'code-analysis',
      difficulty: 'hard',
      question: 'Why does MightContain return false inside the loop?',
      code: `public bool MightContain(string item) {
    foreach (int hash in GetHashes(item)) {
        if (!_bits[Math.Abs(hash % _m)]) return false;
    }
    return true;
}`,
      codeLang: 'csharp',
      options: [
        { id: 'a', text: 'One unset bit means this item\'s hashes were never all set during Add — definitely absent' },
        { id: 'b', text: 'The bit array is full' },
        { id: 'c', text: 'A hash collision always means the item exists' },
        { id: 'd', text: 'False is returned when all bits are 1' },
      ],
      correct: ['a'],
      explanation: 'Add sets all k positions; query requires all k to be 1. Any 0 proves the item was never inserted.',
    },
  ],
  challenges: [
    {
      id: 'bloom-c1',
      type: 'trace',
      difficulty: 'medium',
      question: 'Bloom filter m=8 bits, k=2. Add "cat" sets bits {2, 5}. Add "dog" sets bits {1, 5}. Query "bird" hashes to {3, 5}. Result?',
      options: [
        { id: 'a', text: 'Definitely not present (bit 3 is 0)' },
        { id: 'b', text: 'Probably present' },
        { id: 'c', text: 'Definitely present' },
        { id: 'd', text: 'Cannot determine' },
      ],
      correct: ['a'],
      explanation: 'Bits set: {1, 2, 5}. Query needs {3, 5} — bit 3 is unset → definite negative.',
    },
    {
      id: 'bloom-c2',
      type: 'variant',
      difficulty: 'hard',
      question: 'You need deletion support in a cache negative-lookup filter. Which variant from the chapter fits?',
      options: [
        { id: 'a', text: 'Counting Bloom Filter (counters instead of bits)' },
        { id: 'b', text: 'Standard Bloom filter with double hashing only' },
        { id: 'c', text: 'Union-Find with path compression' },
        { id: 'd', text: 'Segment tree with lazy propagation' },
      ],
      correct: ['a'],
      explanation: 'Counting Blooms decrement counters on delete. Cuckoo filters are another deletion-capable alternative.',
    },
  ],
} satisfies QuizPack