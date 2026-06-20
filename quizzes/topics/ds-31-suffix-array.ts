import type { QuizPack } from '../types'

export default {
  pagePath: '/data-structures/31-suffix-array',
  topicId: 'suffix-array',
  title: 'Suffix Array',
  quiz: [
    {
      id: 'sa-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'What is a suffix array?',
      options: [
        { id: 'a', text: 'A sorted array of starting indices of all suffixes of a string' },
        { id: 'b', text: 'A dynamic array with a gap around the cursor' },
        { id: 'c', text: 'A tree that partitions 2D space into quadrants' },
        { id: 'd', text: 'A hash table mapping suffixes to frequencies' },
      ],
      correct: ['a'],
      explanation: 'A suffix array stores the indices of all suffixes sorted lexicographically — not the suffix strings themselves (in optimized forms).',
    },
    {
      id: 'sa-q2',
      type: 'true-false',
      difficulty: 'easy',
      question: 'For the string "banana", the suffix array (sorted starting indices) is [5, 3, 1, 0, 4, 2].',
      correct: true,
      explanation: 'Sorted suffixes: "a"(5), "ana"(3), "anana"(1), "banana"(0), "na"(4), "nana"(2) → indices [5,3,1,0,4,2].',
    },
    {
      id: 'sa-q3',
      type: 'complexity',
      difficulty: 'medium',
      question: 'After preprocessing a text of length n, what is the time to search for a pattern of length m?',
      options: [
        { id: 'a', text: 'O(m log n)' },
        { id: 'b', text: 'O(n log n)' },
        { id: 'c', text: 'O(m)' },
        { id: 'd', text: 'O(n²)' },
      ],
      correct: ['a'],
      explanation: 'Binary search on the suffix array compares the pattern against O(log n) suffixes, each comparison up to O(m).',
    },
    {
      id: 'sa-q4',
      type: 'fill-blank',
      difficulty: 'medium',
      question: 'Suffix arrays enable fast substring search and are closely related to the Burrows-Wheeler Transform used in ___ compression.',
      correct: ['bzip2', 'bzip'],
      aliases: ['bzip2 compression', 'bwt'],
      explanation: 'BWT (used in bzip2) is closely related to suffix arrays and enables data compression.',
    },
    {
      id: 'sa-q5',
      type: 'scenario',
      difficulty: 'medium',
      question: 'You preprocess a genome (long DNA string) to quickly find all occurrences of any query pattern. Best structure?',
      options: [
        { id: 'a', text: 'Suffix Array (+ binary search)' },
        { id: 'b', text: 'Gap buffer' },
        { id: 'c', text: 'HyperLogLog' },
        { id: 'd', text: 'Stack' },
      ],
      correct: ['a'],
      explanation: 'Bioinformatics relies heavily on suffix arrays/trees for DNA and protein sequence analysis.',
    },
    {
      id: 'sa-q6',
      type: 'matching',
      difficulty: 'hard',
      question: 'Match suffix array vs suffix tree characteristics.',
      pairs: [
        { id: '1', left: 'Suffix Array', right: 'Simpler construction, less memory' },
        { id: '2', left: 'Suffix Tree', right: 'O(m) query speed' },
        { id: '3', left: 'Suffix Array', right: 'O(m log n) query, better cache behavior' },
        { id: '4', left: 'Suffix Tree', right: 'More memory, harder to build' },
      ],
      explanation: 'Suffix arrays trade some query speed for simpler construction and better memory/cache properties.',
    },
    {
      id: 'sa-q7',
      type: 'code-analysis',
      difficulty: 'hard',
      question: 'What does the Search method do on the suffix array?',
      code: `while (lo <= hi) {
    int mid = (lo + hi) / 2;
    int cmp = CompareSuffix(pattern, sa[mid]);
    if (cmp <= 0) { if (cmp == 0) first = mid; hi = mid - 1; }
    else { lo = mid + 1; }
}`,
      codeLang: 'csharp',
      options: [
        { id: 'a', text: 'Binary search to find the first suffix array entry matching the pattern' },
        { id: 'b', text: 'Linear scan of all suffixes from left to right' },
        { id: 'c', text: 'Builds the suffix array from scratch' },
        { id: 'd', text: 'Sorts the pattern characters in reverse' },
      ],
      correct: ['a'],
      explanation: 'Search uses binary search on the sorted suffix indices, comparing the pattern against text suffixes.',
    },
    {
      id: 'sa-q8',
      type: 'mcq-multi',
      difficulty: 'medium',
      question: 'Which are real-world applications of suffix arrays? (Select all)',
      options: [
        { id: 'a', text: 'Bioinformatics / DNA sequence search' },
        { id: 'b', text: 'Plagiarism detection across documents' },
        { id: 'c', text: 'Full-text search and substring matching at scale' },
        { id: 'd', text: 'Exact per-user billing reconciliation' },
      ],
      correct: ['a', 'b', 'c'],
      explanation: 'Suffix arrays power bioinformatics, plagiarism detection, and full-text search — not financial exact counting.',
    },
  ],
  challenges: [
    {
      id: 'sa-c1',
      type: 'trace',
      difficulty: 'medium',
      question: 'Text = "banana", suffix array = [5,3,1,0,4,2]. FindAll("na") returns which starting indices?',
      options: [
        { id: 'a', text: '[2, 4] — suffixes "nana" and "na"' },
        { id: 'b', text: '[1, 4]' },
        { id: 'c', text: '[5] only' },
        { id: 'd', text: '[0, 2]' },
      ],
      correct: ['a'],
      explanation: '"na" matches at index 2 ("nana") and index 4 ("na"). Binary search finds the range in the sorted suffix array.',
    },
    {
      id: 'sa-c2',
      type: 'design',
      difficulty: 'hard',
      question: 'You search a 1 GB log for a 20-char pattern with no preprocessing vs. suffix array built once. Which wins for 1000 queries?',
      options: [
        { id: 'a', text: 'Suffix array — O(n log n) build once, then O(m log n) per query' },
        { id: 'b', text: 'Naive scan every time — O(n) per query is faster overall' },
        { id: 'c', text: 'HyperLogLog' },
        { id: 'd', text: 'Gap buffer' },
      ],
      correct: ['a'],
      explanation: 'Preprocessing enables fast repeated pattern search. Naive O(n) per query × 1000 is far slower than O(m log n) after one-time build.',
    },
  ],
} satisfies QuizPack