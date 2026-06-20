import type { QuizPack } from '../types'

export default {
  pagePath: '/algorithms/34-0-1-knapsack',
  topicId: '0-1-knapsack',
  title: '0/1 Knapsack',
  quiz: [
    {
      id: 'knapsack-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'What does `dp[i][w]` represent in the 0/1 knapsack DP table?',
      options: [
        { id: 'a', text: 'Maximum value using the first i items with capacity at most w' },
        { id: 'b', text: 'Minimum weight to achieve value w with i items' },
        { id: 'c', text: 'Number of ways to fill capacity w exactly' },
        { id: 'd', text: 'Whether item i fits in capacity w' },
      ],
      correct: ['a'],
      explanation: 'Each cell stores the best achievable value for a prefix of items and a weight budget.',
    },
    {
      id: 'knapsack-q2',
      type: 'true-false',
      difficulty: 'easy',
      question: 'In 0/1 knapsack, each item may be included at most once.',
      correct: true,
      explanation: 'The "0/1" name means take or skip — not fractional and not unlimited copies.',
    },
    {
      id: 'knapsack-q3',
      type: 'mcq',
      difficulty: 'medium',
      question: 'When considering item i at capacity w, the recurrence compares:',
      options: [
        { id: 'a', text: 'Skip: dp[i-1][w]; Take (if fits): v[i-1] + dp[i-1][w - w[i-1]]' },
        { id: 'b', text: 'Take: dp[i-1][w]; Skip: dp[i][w-1]' },
        { id: 'c', text: 'Always add v[i-1] regardless of weight' },
        { id: 'd', text: 'dp[i][w] = dp[i-1][w] + dp[i][w-1]' },
      ],
      correct: ['a'],
      explanation: 'Take uses row i-1 and reduced capacity so the same item is not reused.',
    },
    {
      id: 'knapsack-q4',
      type: 'complexity',
      difficulty: 'medium',
      question: 'Time complexity of the standard 2D 0/1 knapsack DP:',
      options: [
        { id: 'a', text: 'O(n × W)' },
        { id: 'b', text: 'O(2^n)' },
        { id: 'c', text: 'O(n log W)' },
        { id: 'd', text: 'O(n²)' },
      ],
      correct: ['a'],
      explanation: 'Nested loops over n items and W+1 capacities — pseudo-polynomial in numeric W.',
    },
    {
      id: 'knapsack-q5',
      type: 'scenario',
      difficulty: 'medium',
      question: 'Space-optimized 1D knapsack iterates w from W down to weight[i]. Why?',
      options: [
        { id: 'a', text: 'Descending w ensures each item is used at most once' },
        { id: 'b', text: 'Ascending w is faster on modern CPUs' },
        { id: 'c', text: 'Descending w enables fractional knapsack' },
        { id: 'd', text: 'Order does not matter for 0/1 knapsack' },
      ],
      correct: ['a'],
      explanation: 'Iterating upward would let dp[w - weight] include the current item again — unbounded behavior.',
    },
    {
      id: 'knapsack-q6',
      type: 'fill-blank',
      difficulty: 'easy',
      question: 'Knapsack DP is called ___-polynomial because runtime depends on the numeric value of W, not just input bit length.',
      correct: ['pseudo', 'pseudo-polynomial'],
      aliases: ['pseudopolynomial'],
      explanation: 'O(n × W) is polynomial in W itself, but W can be exponential in the number of bits encoding it.',
    },
    {
      id: 'knapsack-q7',
      type: 'mcq-multi',
      difficulty: 'hard',
      question: 'Which statements about knapsack variants are correct? (Select all)',
      options: [
        { id: 'a', text: 'Unbounded knapsack iterates capacity ascending in 1D DP' },
        { id: 'b', text: 'Subset sum is a special case where values equal weights' },
        { id: 'c', text: '0/1 knapsack is solvable in true polynomial time in n alone' },
        { id: 'd', text: '2D table enables backtracking to recover selected items' },
      ],
      correct: ['a', 'b', 'd'],
      explanation: '0/1 knapsack is NP-hard; the DP is pseudo-polynomial, not polynomial in input size alone.',
    },
    {
      id: 'knapsack-q8',
      type: 'code-analysis',
      difficulty: 'hard',
      question: 'What does comparing `dp[wi, cap] != dp[wi-1, cap]` during backtrack indicate?',
      code: `while (wi > 0 && cap > 0) {
    if (dp[wi, cap] != dp[wi - 1, cap]) {
        taken.Add(wi - 1);
        cap -= weights[wi - 1];
    }
    wi--;
}`,
      codeLang: 'csharp',
      options: [
        { id: 'a', text: 'Item wi-1 was taken in the optimal solution at this capacity' },
        { id: 'b', text: 'Item wi-1 exceeds capacity' },
        { id: 'c', text: 'The table has a bug' },
        { id: 'd', text: 'All items were skipped' },
      ],
      correct: ['a'],
      explanation: 'A different value in row wi vs wi-1 means taking item wi-1 improved the optimum.',
    },
  ],
  challenges: [
    {
      id: 'knapsack-c1',
      type: 'trace',
      difficulty: 'medium',
      question: 'Weights [1, 3, 4], values [15, 20, 30], capacity W=4. What is the maximum value?',
      options: [
        { id: 'a', text: '35' },
        { id: 'b', text: '45' },
        { id: 'c', text: '50' },
        { id: 'd', text: '30' },
      ],
      correct: ['a'],
      explanation: 'Take items 0 and 1: weight 1+3=4, value 15+20=35. Item 2 alone gives 30.',
    },
    {
      id: 'knapsack-c2',
      type: 'variant',
      difficulty: 'hard',
      question: 'You need unlimited copies of each item. What single change to 1D DP applies?',
      options: [
        { id: 'a', text: 'Iterate w from weight[i] up to W (ascending)' },
        { id: 'b', text: 'Iterate w from W down to weight[i] (descending)' },
        { id: 'c', text: 'Use a min instead of max' },
        { id: 'd', text: 'Remove the inner loop entirely' },
      ],
      correct: ['a'],
      explanation: 'Ascending capacity lets the same item contribute multiple times — unbounded knapsack.',
    },
  ],
} satisfies QuizPack