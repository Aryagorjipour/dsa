import type { QuizPack } from '../types'

export default {
  pagePath: '/algorithms/33-dp-fundamentals',
  topicId: 'dp-fundamentals',
  title: 'DP Fundamentals',
  quiz: [
    {
      id: 'dp-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'What two properties must a problem have for dynamic programming to apply?',
      options: [
        { id: 'a', text: 'Optimal substructure and overlapping subproblems' },
        { id: 'b', text: 'Sorted input and O(1) access' },
        { id: 'c', text: 'No recursion allowed' },
        { id: 'd', text: 'Exactly two possible choices at each step' },
      ],
      correct: ['a'],
      explanation: 'Optimal solution built from optimal subsolutions; same subsolutions recur many times.',
    },
    {
      id: 'dp-q2',
      type: 'true-false',
      difficulty: 'medium',
      question: 'Memoization is a top-down DP approach that caches recursive results.',
      correct: true,
      explanation: 'Top-down: recurse with a cache. Bottom-up: fill table iteratively without recursion.',
    },
    {
      id: 'dp-q3',
      type: 'mcq',
      difficulty: 'medium',
      question: 'Naive recursive Fibonacci is slow because:',
      options: [
        { id: 'a', text: 'It recomputes the same Fib values exponentially many times' },
        { id: 'b', text: 'Fibonacci numbers are too large to store' },
        { id: 'c', text: 'Recursion is always O(n²)' },
        { id: 'd', text: 'It uses a queue' },
      ],
      correct: ['a'],
      explanation: 'fib(5) calls fib(3) twice, fib(4) calls fib(2) twice — overlapping subproblems → O(2^n).',
    },
    {
      id: 'dp-q4',
      type: 'complexity',
      difficulty: 'medium',
      question: 'Memoized Fibonacci (caching each fib(k) once) time complexity:',
      options: [
        { id: 'a', text: 'O(n)' },
        { id: 'b', text: 'O(2^n)' },
        { id: 'c', text: 'O(log n)' },
        { id: 'd', text: 'O(n²)' },
      ],
      correct: ['a'],
      explanation: 'Each of n subproblems computed once → O(n) time, O(n) space.',
    },
    {
      id: 'dp-q5',
      type: 'scenario',
      difficulty: 'medium',
      question: 'Climbing stairs: 1 or 2 steps at a time. Ways to reach step n. Why DP?',
      options: [
        { id: 'a', text: 'ways(n) = ways(n-1) + ways(n-2) — optimal substructure + overlap' },
        { id: 'b', text: 'Must try all n! permutations' },
        { id: 'c', text: 'Greedy always picks 2 steps' },
        { id: 'd', text: 'No substructure exists' },
      ],
      correct: ['a'],
      explanation: 'Same recurrence as Fibonacci — textbook intro DP problem.',
    },
    {
      id: 'dp-q6',
      type: 'fill-blank',
      difficulty: 'easy',
      question: 'Bottom-up DP fills a table iteratively, usually starting from ___ cases.',
      correct: ['base', 'base case', 'base cases', 'smallest'],
      aliases: ['trivial', 'initial'],
      explanation: 'Base cases (e.g., dp[0]=1) anchor the recurrence before building up.',
    },
    {
      id: 'dp-q7',
      type: 'mcq-multi',
      difficulty: 'hard',
      question: 'Which problems are classic DP? (Select all)',
      options: [
        { id: 'a', text: '0/1 Knapsack' },
        { id: 'b', text: 'Longest Common Subsequence' },
        { id: 'c', text: 'Merge sort' },
        { id: 'd', text: 'Edit distance' },
      ],
      correct: ['a', 'b', 'd'],
      explanation: 'Merge sort is divide-and-conquer, not DP — no overlapping subproblem cache needed.',
    },
    {
      id: 'dp-q8',
      type: 'code-analysis',
      difficulty: 'hard',
      question: 'What optimization does this add over naive recursion?',
      code: `var memo = new Dictionary<int, long>();
long Fib(int n) {
    if (n <= 1) return n;
    if (memo.TryGetValue(n, out var v)) return v;
    memo[n] = Fib(n-1) + Fib(n-2);
    return memo[n];
}`,
      codeLang: 'csharp',
      options: [
        { id: 'a', text: 'Reduces time from exponential to O(n) by caching' },
        { id: 'b', text: 'Reduces space to O(1)' },
        { id: 'c', text: 'Makes it iterative only' },
        { id: 'd', text: 'No improvement' },
      ],
      correct: ['a'],
      explanation: 'Each n computed once. Space is O(n) for cache + recursion stack.',
    },
  ],
  challenges: [
    {
      id: 'dp-c1',
      type: 'trace',
      difficulty: 'medium',
      question: 'Bottom-up dp[0]=1, dp[1]=1, dp[i]=dp[i-1]+dp[i-2]. What is dp[6]?',
      options: [
        { id: 'a', text: '13' },
        { id: 'b', text: '8' },
        { id: 'c', text: '21' },
        { id: 'd', text: '5' },
      ],
      correct: ['a'],
      explanation: '1,1,2,3,5,8,13 — dp[6]=13 (Fibonacci).',
    },
    {
      id: 'dp-c2',
      type: 'design',
      difficulty: 'hard',
      question: 'You have overlapping subproblems but NO optimal substructure. Can classic DP help?',
      options: [
        { id: 'a', text: 'No — both properties are required for optimization via DP' },
        { id: 'b', text: 'Yes — memoization always works' },
        { id: 'c', text: 'Yes — use a heap instead' },
        { id: 'd', text: 'Only with greedy' },
      ],
      correct: ['a'],
      explanation: 'Without optimal substructure, caching subsolutions does not build a global optimum.',
    },
    {
      id: 'dp-c3',
      type: 'variant',
      difficulty: 'medium',
      question: 'Space-optimized Fibonacci uses O(1) extra space. How?',
      options: [
        { id: 'a', text: 'Only track last two values instead of full array' },
        { id: 'b', text: 'Use a hash map of all values' },
        { id: 'c', text: 'Store all values on disk' },
        { id: 'd', text: 'Recursion depth is O(1)' },
      ],
      correct: ['a'],
      explanation: 'dp[i] only depends on dp[i-1] and dp[i-2] — rolling variables suffice.',
    },
  ],
} satisfies QuizPack