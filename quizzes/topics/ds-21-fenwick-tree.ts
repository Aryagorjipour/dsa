import type { QuizPack } from '../types'

export default {
  pagePath: '/data-structures/21-fenwick-tree',
  topicId: 'fenwick-tree',
  title: 'Fenwick Tree',
  quiz: [
    {
      id: 'fenwick-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'What is a Fenwick Tree (Binary Indexed Tree) optimized for?',
      options: [
        { id: 'a', text: 'Prefix sum queries and point updates in O(log n)' },
        { id: 'b', text: 'String prefix matching' },
        { id: 'c', text: 'Graph connectivity queries' },
        { id: 'd', text: 'Probabilistic membership testing' },
      ],
      correct: ['a'],
      explanation: 'Fenwick trees excel at "sum from index 0 to i" and single-element updates with minimal code.',
    },
    {
      id: 'fenwick-q2',
      type: 'complexity',
      difficulty: 'easy',
      question: 'Time complexity of a point update in a Fenwick Tree of size n:',
      options: [
        { id: 'a', text: 'O(1)' },
        { id: 'b', text: 'O(log n)' },
        { id: 'c', text: 'O(n)' },
        { id: 'd', text: 'O(n log n)' },
      ],
      correct: ['b'],
      explanation: 'Update walks up the tree by adding the lowest set bit — at most log n steps.',
    },
    {
      id: 'fenwick-q3',
      type: 'true-false',
      difficulty: 'medium',
      question: 'In a Fenwick Tree, prefix sum uses the operation idx -= idx & -idx to move to the next contributing range.',
      correct: true,
      explanation: 'Subtracting the lowest set bit peels off the ranges that contribute to the prefix sum.',
    },
    {
      id: 'fenwick-q4',
      type: 'scenario',
      difficulty: 'medium',
      question: 'Count inversions in an array of size n (pairs i < j where arr[i] > arr[j]). Why does the chapter use a Fenwick Tree?',
      options: [
        { id: 'a', text: 'After coordinate compression, PrefixSum(rank-1) counts smaller elements seen so far in O(log n) per element' },
        { id: 'b', text: 'Fenwick trees sort the array in O(n)' },
        { id: 'c', text: 'Inversions require a Merkle proof' },
        { id: 'd', text: 'Fenwick trees merge disjoint sets' },
      ],
      correct: ['a'],
      explanation: 'Scanning right-to-left, each element\'s rank lets the BIT count how many smaller values precede it — O(n log n) total.',
    },
    {
      id: 'fenwick-q5',
      type: 'matching',
      difficulty: 'medium',
      question: 'Match Fenwick Tree vs Segment Tree trade-offs from the chapter.',
      pairs: [
        { id: '1', left: 'Code length', right: 'Fenwick: very short' },
        { id: '2', left: 'Memory usage', right: 'Fenwick: less' },
        { id: '3', left: 'Range min/max queries', right: 'Segment tree: easy' },
        { id: '4', left: 'Lazy range updates', right: 'Segment tree: natural' },
      ],
      explanation: 'Choose Fenwick for prefix sums; reach for segment trees when aggregates or lazy range ops get complex.',
    },
    {
      id: 'fenwick-q6',
      type: 'fill-blank',
      difficulty: 'medium',
      question: 'Range sum [l, r] in a Fenwick Tree is computed as PrefixSum(r) - PrefixSum(___).',
      correct: ['l - 1', 'l-1', 'left - 1'],
      aliases: ['l minus 1'],
      explanation: 'Prefix sums are inclusive; subtracting PrefixSum(l-1) isolates the [l, r] window.',
    },
    {
      id: 'fenwick-q7',
      type: 'code-analysis',
      difficulty: 'hard',
      question: 'What does idx += idx & -idx do in the Update method?',
      code: `public void Update(int idx, long delta) {
    idx++;
    while (idx < n) {
        tree[idx] += delta;
        idx += idx & -idx;
    }
}`,
      codeLang: 'csharp',
      options: [
        { id: 'a', text: 'Moves to the next index whose range responsibility includes the updated position' },
        { id: 'b', text: 'Clears all bits in idx' },
        { id: 'c', text: 'Finds the parent in a binary search tree' },
        { id: 'd', text: 'Computes the hash of the index' },
      ],
      correct: ['a'],
      explanation: 'Adding the lowest set bit jumps to the next ancestor in the implicit Fenwick tree structure.',
    },
    {
      id: 'fenwick-q8',
      type: 'true-false',
      difficulty: 'hard',
      question: 'Peter Fenwick invented the Binary Indexed Tree in 1994; it remains a competitive programming staple for prefix-sum problems.',
      correct: true,
      explanation: 'The BIT\'s elegance — O(log n) with ~10 lines of code — made it ubiquitous in CP and analytics.',
    },
  ],
  challenges: [
    {
      id: 'fenwick-c1',
      type: 'trace',
      difficulty: 'medium',
      question: 'Fenwick tree built from [2, 4, 1, 3]. After Update(index=1, delta=+5) on the underlying array (0-based index 1, value 4→9), what is RangeSum(1, 2)?',
      options: [
        { id: 'a', text: '10' },
        { id: 'b', text: '5' },
        { id: 'c', text: '12' },
        { id: 'd', text: '9' },
      ],
      correct: ['a'],
      explanation: 'Array becomes [2, 9, 1, 3]. Range [1,2] = 9 + 1 = 10.',
    },
    {
      id: 'fenwick-c2',
      type: 'variant',
      difficulty: 'hard',
      question: 'You need "how many numbers ≤ X have been inserted so far" on a stream of 10⁶ values. Which chapter technique pairs with the Fenwick Tree?',
      options: [
        { id: 'a', text: 'Coordinate compression — map values to ranks, then use PrefixSum on ranks' },
        { id: 'b', text: 'Merkle proof verification' },
        { id: 'c', text: 'Union by rank on a disjoint set' },
        { id: 'd', text: 'Lazy propagation on a segment tree only — Fenwick cannot help' },
      ],
      correct: ['a'],
      explanation: 'Order-statistic queries over compressed ranks are a classic Fenwick + coordinate compression pattern.',
    },
  ],
} satisfies QuizPack