import type { QuizPack } from '../types'

export default {
  pagePath: '/fundamentals/05-two-pointers-sliding-window',
  topicId: 'two-pointers',
  title: 'Two Pointers and Sliding Window',
  quiz: [
    {
      id: 'tpw-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'Two Sum on a sorted array: why do left and right pointers work in O(n)?',
      options: [
        { id: 'a', text: 'Sorted order lets you increase sum by moving left right or decrease by moving right left' },
        { id: 'b', text: 'Sorted arrays allow O(1) hash lookup by index' },
        { id: 'c', text: 'Two pointers always require O(n log n) preprocessing' },
        { id: 'd', text: 'You must try every pair anyway but with fewer variables' },
      ],
      correct: ['a'],
      explanation: 'On sorted data, sum too small → advance left; sum too large → retreat right. Each pointer moves at most n times.',
      misconception: 'This replaces the O(n²) double loop — it is not the same algorithm with different variable names.',
    },
    {
      id: 'tpw-q2',
      type: 'complexity',
      difficulty: 'medium',
      question: 'Well-written two pointers or sliding window on an array of length n typically achieves:',
      options: [
        { id: 'a', text: 'O(n) time and O(1) or O(k) space' },
        { id: 'b', text: 'O(n²) time and O(n) space' },
        { id: 'c', text: 'O(2^n) time' },
        { id: 'd', text: 'O(log n) time only on unsorted data' },
      ],
      correct: ['a'],
      explanation: 'Each element is visited a constant number of times; space is often a small hash map (k = alphabet size) or just pointers.',
    },
    {
      id: 'tpw-q3',
      type: 'code-analysis',
      difficulty: 'medium',
      question: 'Floyd\'s cycle detection: why does slow move 1 step and fast move 2?',
      code: `slow, fast := head, head
for fast != nil && fast.Next != nil {
    slow = slow.Next
    fast = fast.Next.Next
    if slow == fast { return true }
}`,
      codeLang: 'go',
      options: [
        { id: 'a', text: 'Fast gains on slow inside a cycle — they meet in O(n) time, O(1) space' },
        { id: 'b', text: 'Fast must reach the tail first to count length' },
        { id: 'c', text: 'Slow and fast must always stay adjacent' },
        { id: 'd', text: 'This detects duplicates in a sorted array' },
      ],
      correct: ['a'],
      explanation: 'Fast/slow pointers on a linked structure detect cycles without extra memory — O(n) time, O(1) space.',
    },
    {
      id: 'tpw-q4',
      type: 'true-false',
      difficulty: 'easy',
      question: 'In sliding window, the left pointer never moves backward — each character is visited at most twice.',
      correct: true,
      explanation: 'Right expands the window; left only advances to restore validity. That amortizes to O(n) for problems like longest substring without repeats.',
    },
    {
      id: 'tpw-q5',
      type: 'scenario',
      difficulty: 'medium',
      question: 'Longest substring without repeating characters: "abcabcbb". What is the correct answer?',
      options: [
        { id: 'a', text: '"abc" with length 3' },
        { id: 'b', text: '"abcabc" with length 6' },
        { id: 'c', text: '"bbbb" with length 4' },
        { id: 'd', text: 'Empty string with length 0' },
      ],
      correct: ['a'],
      explanation: 'The longest substring with all unique chars is "abc" (also "bca", "cab" etc.) — length 3. Sliding window tracks last seen index and slides left past duplicates.',
    },
    {
      id: 'tpw-q6',
      type: 'matching',
      difficulty: 'medium',
      question: 'Match each pattern to its pointer setup:',
      pairs: [
        { id: '1', left: 'Two Sum on sorted array', right: 'Opposite ends converging inward' },
        { id: '2', left: 'Floyd cycle detection', right: 'Fast and slow from the same head' },
        { id: '3', left: 'Longest unique substring', right: 'Left/right window with hash map state' },
      ],
      explanation: 'Opposite converging pointers, same-origin different speeds, and expand/shrink windows are the three core setups from the chapter.',
    },
    {
      id: 'tpw-q7',
      type: 'fill-blank',
      difficulty: 'easy',
      question: 'Maximum sum of any contiguous subarray of fixed size K uses a ___ size sliding window with a running sum.',
      correct: ['fixed'],
      aliases: ['constant', 'constant-size', 'fixed-size'],
      explanation: 'Fixed window: add on the right edge, subtract as the window slides — no recomputation from scratch each position.',
    },
    {
      id: 'tpw-q8',
      type: 'scenario',
      difficulty: 'hard',
      question: 'Problem statement includes "contiguous subarray", "substring", and "shortest window containing all characters from T". Which approach?',
      options: [
        { id: 'a', text: 'Sliding window — expand right until valid, shrink left to minimize' },
        { id: 'b', text: 'Brute force: recompute every substring from scratch in O(n³)' },
        { id: 'c', text: 'Binary search on the entire unsorted database table' },
        { id: 'd', text: 'Dijkstra shortest path on a graph' },
      ],
      correct: ['a'],
      explanation: 'Minimum window substring and similar problems use sliding window + frequency map — the chapter\'s trigger words for this pattern.',
    },
  ],
  challenges: [
    {
      id: 'tpw-c1',
      type: 'trace',
      difficulty: 'hard',
      question: 'Two Sum sorted: nums = [2, 7, 11, 15], target = 9. left=0 (2), right=3 (15). Sum=17. What happens next?',
      options: [
        { id: 'a', text: 'Sum too large → right-- to 11' },
        { id: 'b', text: 'Sum too small → left++' },
        { id: 'c', text: 'Found answer immediately' },
        { id: 'd', text: 'Restart from random indices' },
      ],
      correct: ['a'],
      explanation: '17 > 9, so decrease sum by moving right left. Next: 2+11=13 still high; then 2+7=9 — return (2, 7).',
    },
    {
      id: 'tpw-c2',
      type: 'design',
      difficulty: 'medium',
      question: 'API rate limiting: "count requests in the last 5 minutes per user." Which real-world pattern from the chapter applies?',
      options: [
        { id: 'a', text: 'Sliding window log / counter — maintain a time-bounded window of events' },
        { id: 'b', text: 'Merge sort divide and conquer' },
        { id: 'c', text: 'Huffman coding for request compression' },
        { id: 'd', text: 'Floyd cycle detection on linked lists' },
      ],
      correct: ['a'],
      explanation: 'Rate limiting and log analysis use sliding windows over time series — same expand/shrink intuition as substring windows, applied to timestamps.',
    },
  ],
} satisfies QuizPack