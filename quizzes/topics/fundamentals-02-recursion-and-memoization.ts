import type { QuizPack } from '../types'

export default {
  pagePath: '/fundamentals/02-recursion-and-memoization',
  topicId: 'recursion',
  title: 'Recursion and Memoization',
  quiz: [
    {
      id: 'rec-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'Every correct recursive function must have:',
      options: [
        { id: 'a', text: 'A base case and a recursive case' },
        { id: 'b', text: 'At least three parameters' },
        { id: 'c', text: 'A global mutable variable' },
        { id: 'd', text: 'Tail call optimization enabled by the compiler' },
      ],
      correct: ['a'],
      explanation: 'Base case stops recursion; recursive case reduces to smaller subproblem(s). Without a base case you get infinite recursion and stack overflow.',
    },
    {
      id: 'rec-q2',
      type: 'code-analysis',
      difficulty: 'easy',
      question: 'What does Factorial(5) return, and what is the maximum stack depth?',
      code: `func Factorial(n int) int {
    if n <= 1 { return 1 }
    return n * Factorial(n-1)
}`,
      codeLang: 'go',
      options: [
        { id: 'a', text: '120, stack depth 5' },
        { id: 'b', text: '24, stack depth 4' },
        { id: 'c', text: '120, stack depth 1' },
        { id: 'd', text: '5, stack depth 5' },
      ],
      correct: ['a'],
      explanation: '5! = 120. Each call adds a stack frame until n=1 — depth equals n (5 frames for Factorial(5)).',
    },
    {
      id: 'rec-q3',
      type: 'complexity',
      difficulty: 'medium',
      question: 'Naive recursive Fibonacci (two calls per level, no cache) has time complexity:',
      options: [
        { id: 'a', text: 'O(2^n)' },
        { id: 'b', text: 'O(n)' },
        { id: 'c', text: 'O(n log n)' },
        { id: 'd', text: 'O(1)' },
      ],
      correct: ['a'],
      explanation: 'Each Fib(n) spawns Fib(n-1) and Fib(n-2), recomputing the same values exponentially — Fib(40) does millions of redundant calls.',
      misconception: 'Tree recursion without memoization is beautiful but terrible for performance.',
    },
    {
      id: 'rec-q4',
      type: 'true-false',
      difficulty: 'medium',
      question: 'C# and Go generally guarantee tail call optimization, so deep tail-recursive functions are always safe.',
      correct: false,
      explanation: 'Neither C# nor Go guarantees TCO in general. Write recursion for clarity on shallow depth; use iteration or explicit stacks for large depth.',
      misconception: 'Do not assume the compiler will turn tail recursion into a loop.',
    },
    {
      id: 'rec-q5',
      type: 'fill-blank',
      difficulty: 'easy',
      question: 'Caching expensive function results and reusing them on repeated inputs is called ___.',
      correct: ['memoization', 'memoisation'],
      aliases: ['memo', 'top-down caching'],
      explanation: 'Memoization stores computed results (e.g., in a map) so each subproblem is solved once — turning exponential Fib into O(n).',
    },
    {
      id: 'rec-q6',
      type: 'matching',
      difficulty: 'medium',
      question: 'Match each Fibonacci approach to its time and space (chapter table):',
      pairs: [
        { id: '1', left: 'Naive recursion', right: 'O(2^n) time, O(n) stack' },
        { id: '2', left: 'Memoized recursion', right: 'O(n) time, O(n) space' },
        { id: '3', left: 'Iterative bottom-up', right: 'O(n) time, O(1) space' },
      ],
      explanation: 'Memoization fixes redundant work; bottom-up iteration also avoids deep call stacks.',
    },
    {
      id: 'rec-q7',
      type: 'scenario',
      difficulty: 'medium',
      question: 'You need Fib(1_000_000) in production Go. Best approach?',
      options: [
        { id: 'a', text: 'Naive recursive Fib — elegant and fast enough' },
        { id: 'b', text: 'Memoized recursion — always safe at any depth' },
        { id: 'c', text: 'Bottom-up iterative loop — O(n) time, O(1) space, no stack overflow risk' },
        { id: 'd', text: 'Remove the base case to let it converge' },
      ],
      correct: ['c'],
      explanation: 'Depth n recursion blows the stack for large n. Bottom-up iteration computes in O(n) time with O(1) extra space and no call-stack risk.',
      misconception: 'Memoized recursion still uses O(n) stack depth — dangerous at n = 1,000,000.',
    },
    {
      id: 'rec-q8',
      type: 'ordering',
      difficulty: 'hard',
      question: 'Order the call stack resolution for Factorial(3) from first call to final return (top = first frame pushed):',
      items: [
        { id: 'a', text: 'Factorial(3) waits for Factorial(2)' },
        { id: 'b', text: 'Factorial(2) waits for Factorial(1)' },
        { id: 'c', text: 'Factorial(1) hits base case, returns 1' },
        { id: 'd', text: 'Unwind: 2×1=2, then 3×2=6' },
      ],
      correct: ['a', 'b', 'c', 'd'],
      explanation: 'Calls push frames down to the base case, then results multiply on the way back up: 1 → 2 → 6.',
    },
  ],
  challenges: [
    {
      id: 'rec-c1',
      type: 'code-analysis',
      difficulty: 'hard',
      question: 'What is wrong with this memoized Fib if called as Fib(40) with no second argument?',
      code: `func Fib(n int, memo map[int]int) int {
    if n <= 1 { return n }
    if val, ok := memo[n]; ok { return val }
    result := Fib(n-1, memo) + Fib(n-2, memo)
    memo[n] = result
    return result
}`,
      codeLang: 'go',
      options: [
        { id: 'a', text: 'memo is nil — writing memo[n] panics; must initialize map when nil' },
        { id: 'b', text: 'Base case should return 1, not n' },
        { id: 'c', text: 'Memoization cannot be used with recursion' },
        { id: 'd', text: 'Fibonacci has no overlapping subproblems' },
      ],
      correct: ['a'],
      explanation: 'The chapter\'s Go version initializes memo when nil. Without that, the first memo[n] write panics on a nil map.',
    },
    {
      id: 'rec-c2',
      type: 'design',
      difficulty: 'medium',
      question: 'Walking a DOM tree or filesystem directory structure. When does the chapter recommend recursion over iteration?',
      options: [
        { id: 'a', text: 'When the problem is naturally tree-like, clarity wins, and depth is small or you accept explicit stack' },
        { id: 'b', text: 'Never — iteration is always mandatory' },
        { id: 'c', text: 'Only when you need O(2^n) performance' },
        { id: 'd', text: 'Only when tail call optimization is guaranteed' },
      ],
      correct: ['a'],
      explanation: 'Tree traversal (DOM, ASTs, file systems) is naturally recursive. Use recursion when depth is bounded; use iteration + explicit stack for very deep trees.',
    },
  ],
} satisfies QuizPack