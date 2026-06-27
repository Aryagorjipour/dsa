import type { QuizPack } from '../types'

export default {
  pagePath: '/fundamentals/03-divide-and-conquer',
  topicId: 'divide-and-conquer',
  title: 'Divide and Conquer',
  quiz: [
    {
      id: 'dac-q1',
      type: 'ordering',
      difficulty: 'easy',
      question: 'Order the three steps of Divide and Conquer (first step at top):',
      items: [
        { id: 'a', text: 'Divide into smaller subproblems of the same type' },
        { id: 'b', text: 'Conquer (solve) subproblems recursively' },
        { id: 'c', text: 'Combine subproblem solutions into the final answer' },
      ],
      correct: ['a', 'b', 'c'],
      explanation: 'Split → solve recursively → merge results. Merge sort is the textbook example: split halves, sort each, merge in O(n).',
    },
    {
      id: 'dac-q2',
      type: 'complexity',
      difficulty: 'medium',
      question: 'Merge sort divides in half (log n levels) and merges in O(n) per level. Overall time complexity:',
      options: [
        { id: 'a', text: 'O(n log n)' },
        { id: 'b', text: 'O(n²)' },
        { id: 'c', text: 'O(n)' },
        { id: 'd', text: 'O(2^n)' },
      ],
      correct: ['a'],
      explanation: 'log n recursion levels × O(n) merge per level = O(n log n). If combine were O(n²), the whole algorithm would degrade badly.',
    },
    {
      id: 'dac-q3',
      type: 'true-false',
      difficulty: 'medium',
      question: 'In quicksort, the combine step is trivial because partitioning already places elements relative to the pivot.',
      correct: true,
      explanation: 'Quicksort\'s combine is essentially nothing — partition around pivot, recursively sort left and right. Average O(n log n), worst O(n²).',
    },
    {
      id: 'dac-q4',
      type: 'mcq',
      difficulty: 'medium',
      question: 'Divide and Conquer vs Dynamic Programming — what is the key difference from the chapter?',
      options: [
        { id: 'a', text: 'D&C subproblems are independent; DP subproblems overlap and need caching' },
        { id: 'b', text: 'D&C always uses bottom-up tables; DP always uses recursion' },
        { id: 'c', text: 'D&C is only for sorting; DP is only for graphs' },
        { id: 'd', text: 'They are identical — the names are interchangeable' },
      ],
      correct: ['a'],
      explanation: 'Merge sort = pure D&C (no overlapping subproblems). Memoized Fibonacci = DP (heavy overlap). Many advanced algorithms mix both ideas.',
    },
    {
      id: 'dac-q5',
      type: 'scenario',
      difficulty: 'hard',
      question: 'Google MapReduce processes petabytes by mapping over shards then reducing results. Which D&C phase mapping is correct?',
      options: [
        { id: 'a', text: 'Map = conquer pieces independently; Reduce = combine' },
        { id: 'b', text: 'Map = combine; Reduce = divide only' },
        { id: 'c', text: 'MapReduce has no relation to divide and conquer' },
        { id: 'd', text: 'Reduce runs before Map on every job' },
      ],
      correct: ['a'],
      explanation: 'MapReduce is divide-and-conquer at massive scale — workers conquer partitions in parallel, then reducers combine partial results.',
    },
    {
      id: 'dac-q6',
      type: 'code-analysis',
      difficulty: 'medium',
      question: 'What is the base case in this merge sort skeleton?',
      code: `int[] MergeSort(int[] arr, int lo, int hi) {
    if (lo >= hi) return new[] { arr[lo] };
    int mid = lo + (hi - lo) / 2;
    var left = MergeSort(arr, lo, mid);
    var right = MergeSort(arr, mid + 1, hi);
    return Merge(left, right);
}`,
      codeLang: 'csharp',
      options: [
        { id: 'a', text: 'lo >= hi — single element, return it directly' },
        { id: 'b', text: 'mid == 0' },
        { id: 'c', text: 'arr.Length == 0 only' },
        { id: 'd', text: 'There is no base case' },
      ],
      correct: ['a'],
      explanation: 'When the range is one element (lo >= hi), recursion stops and returns that element — classic D&C base case.',
    },
    {
      id: 'dac-q7',
      type: 'fill-blank',
      difficulty: 'easy',
      question: 'Balanced divide-and-conquer on size n typically creates recursion depth of O(___).',
      correct: ['log n', 'logn', 'log(n)'],
      aliases: ['logarithmic', 'lg n'],
      explanation: 'Halving each step gives log n levels — usually safe for stack depth. n levels of recursion is dangerous.',
    },
    {
      id: 'dac-q8',
      type: 'matching',
      difficulty: 'medium',
      question: 'Match each system from the chapter to its divide-and-conquer role:',
      pairs: [
        { id: '1', left: 'Merge sort combine step', right: 'O(n) merge of two sorted halves' },
        { id: '2', left: 'FFT (Cooley-Tukey)', right: 'Split signal, conquer, combine frequencies' },
        { id: '3', left: 'Independent subproblems on multicore', right: 'Natural parallelism (goroutines / Tasks)' },
      ],
      explanation: 'Efficient combine steps and independent subproblems are why D&C powers sorting, signal processing, and parallel systems.',
    },
  ],
  challenges: [
    {
      id: 'dac-c1',
      type: 'variant',
      difficulty: 'hard',
      question: 'Suppose merge sort\'s combine (Merge) step cost O(n²) instead of O(n). What happens to total runtime?',
      options: [
        { id: 'a', text: 'Still O(n log n) — combine cost does not matter' },
        { id: 'b', text: 'Degrades badly — O(n²) combine at each of log n levels can approach O(n² log n) or worse' },
        { id: 'c', text: 'Becomes O(1) because recursion helps' },
        { id: 'd', text: 'Becomes O(n) — fewer merges needed' },
      ],
      correct: ['b'],
      explanation: 'The chapter stresses: "The magic often lives in the combine step being efficient." Expensive combine destroys the D&C advantage.',
    },
    {
      id: 'dac-c2',
      type: 'design',
      difficulty: 'medium',
      question: 'When does Divide and Conquer "shine" according to the chapter?',
      options: [
        { id: 'a', text: 'Subproblems are independent, combine is cheaper than brute force, and splits stay balanced' },
        { id: 'b', text: 'Subproblems heavily overlap and need a shared memo table' },
        { id: 'c', text: 'You must revisit and undo previous choices' },
        { id: 'd', text: 'Input must be a linked list only' },
      ],
      correct: ['a'],
      explanation: 'Clean independent splits + cheap combine + balanced size ≈ log n depth. Overlapping subproblems point you toward DP instead.',
    },
  ],
} satisfies QuizPack