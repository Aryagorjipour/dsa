import type { QuizPack } from '../types'

export default {
  pagePath: '/data-structures/20-segment-tree',
  topicId: 'segment-tree',
  title: 'Segment Tree',
  quiz: [
    {
      id: 'segtree-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'What problem does a segment tree primarily solve?',
      options: [
        { id: 'a', text: 'Efficient range queries and updates on an array in O(log n)' },
        { id: 'b', text: 'Sorting an array in O(n log n) with O(1) space' },
        { id: 'c', text: 'Storing strings by character prefix' },
        { id: 'd', text: 'Finding shortest paths in weighted graphs' },
      ],
      correct: ['a'],
      explanation: 'Segment trees precompute range aggregates in a binary tree over array segments.',
    },
    {
      id: 'segtree-q2',
      type: 'complexity',
      difficulty: 'easy',
      question: 'Time complexity of a range sum query on a segment tree of n elements:',
      options: [
        { id: 'a', text: 'O(1)' },
        { id: 'b', text: 'O(log n)' },
        { id: 'c', text: 'O(n)' },
        { id: 'd', text: 'O(n log n)' },
      ],
      correct: ['b'],
      explanation: 'Query visits O(log n) nodes by covering whole segments or splitting at boundaries.',
    },
    {
      id: 'segtree-q3',
      type: 'true-false',
      difficulty: 'medium',
      question: 'A common segment tree implementation uses an array of size roughly 4×n to store the tree nodes.',
      correct: true,
      explanation: 'The 4n sizing trick safely accommodates a complete binary tree over n leaves.',
    },
    {
      id: 'segtree-q4',
      type: 'scenario',
      difficulty: 'medium',
      question: 'You must add +5 to every element in index range [L, R] and answer many range-sum queries on an array of 10⁵ elements. Which technique is key?',
      options: [
        { id: 'a', text: 'Lazy propagation — defer pushing range updates until children are visited' },
        { id: 'b', text: 'Rebuild the entire tree after each range update' },
        { id: 'c', text: 'Store only leaf nodes and scan O(n) per query' },
        { id: 'd', text: 'Use a stack for DFS traversal only' },
      ],
      correct: ['a'],
      explanation: 'Lazy propagation marks "this whole segment needs +5" and pushes down only when needed — O(log n) range updates.',
    },
    {
      id: 'segtree-q5',
      type: 'fill-blank',
      difficulty: 'medium',
      question: 'Each internal node in a segment tree stores the ___ of its two children\'s segments (e.g., sum, min, or max).',
      correct: ['aggregate', 'combination', 'combined value'],
      aliases: ['sum', 'result', 'combination of'],
      explanation: 'Internal nodes aggregate child ranges — the combine function defines what queries return.',
    },
    {
      id: 'segtree-q6',
      type: 'code-analysis',
      difficulty: 'hard',
      question: 'What does Propagate do when lazy[node] is non-zero?',
      code: `private void Propagate(int node, int start, int end) {
    if (lazy[node] != 0) {
        tree[node] += (end - start + 1) * lazy[node];
        if (start != end) {
            lazy[2 * node + 1] += lazy[node];
            lazy[2 * node + 2] += lazy[node];
        }
        lazy[node] = 0;
    }
}`,
      codeLang: 'csharp',
      options: [
        { id: 'a', text: 'Applies the pending range add to tree[node] and passes it to children\'s lazy tags' },
        { id: 'b', text: 'Deletes all elements in the range' },
        { id: 'c', text: 'Swaps left and right children' },
        { id: 'd', text: 'Rebuilds the tree from scratch' },
      ],
      correct: ['a'],
      explanation: 'Lazy tags accumulate at internal nodes; Propagate applies them and forwards to children when descending.',
    },
    {
      id: 'segtree-q7',
      type: 'mcq-multi',
      difficulty: 'hard',
      question: 'Which range queries can a segment tree support with the right combine function? (Select all that apply)',
      options: [
        { id: 'a', text: 'Range minimum' },
        { id: 'b', text: 'Range maximum' },
        { id: 'c', text: 'Range GCD' },
        { id: 'd', text: 'Arbitrary range median in O(log n) with no extra structure' },
      ],
      correct: ['a', 'b', 'c'],
      explanation: 'Any associative aggregate works. Range median requires different techniques (e.g., persistence or wavelet tree).',
    },
    {
      id: 'segtree-q8',
      type: 'scenario',
      difficulty: 'hard',
      question: 'You only need prefix sums and point updates — no range min/max or lazy range adds. What does the chapter suggest as a simpler alternative?',
      options: [
        { id: 'a', text: 'Fenwick Tree (Binary Indexed Tree)' },
        { id: 'b', text: 'Bloom filter' },
        { id: 'c', text: 'Skip list' },
        { id: 'd', text: 'Union-Find' },
      ],
      correct: ['a'],
      explanation: 'Fenwick trees are shorter to code and use less memory for prefix-sum-only workloads.',
    },
  ],
  challenges: [
    {
      id: 'segtree-c1',
      type: 'trace',
      difficulty: 'medium',
      question: 'Array [3, 1, 4, 2]. Segment tree stores range sums. Query sum of indices [1, 2] (values 1 and 4). What is the result?',
      options: [
        { id: 'a', text: '5' },
        { id: 'b', text: '4' },
        { id: 'c', text: '7' },
        { id: 'd', text: '3' },
      ],
      correct: ['a'],
      explanation: 'Range [1,2] covers arr[1]=1 and arr[2]=4 → sum = 5.',
    },
    {
      id: 'segtree-c2',
      type: 'mini-code',
      difficulty: 'hard',
      question: 'Implement range sum Query(l, r) on a segment tree with lazy propagation. Trace a query on [2, 4] after UpdateRange(1, 3, +10).',
      rubric: [
        'Call Propagate before reading or recursing at each node',
        'Return tree[node] when node segment is fully inside [l, r]',
        'Return 0 when node segment is disjoint from [l, r]',
        'Otherwise recurse into both children and sum results',
      ],
      explanation: 'Correct query traversal respects lazy tags and only aggregates fully covered segments.',
    },
  ],
} satisfies QuizPack