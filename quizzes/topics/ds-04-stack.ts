import type { QuizPack } from '../types'

export default {
  pagePath: '/data-structures/04-stack',
  topicId: 'stack',
  title: 'Stack',
  quiz: [
    {
      id: 'stack-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'Which principle does a stack follow?',
      options: [
        { id: 'a', text: 'LIFO — Last In, First Out' },
        { id: 'b', text: 'FIFO — First In, First Out' },
        { id: 'c', text: 'Random access by index' },
        { id: 'd', text: 'Priority-based ordering' },
      ],
      correct: ['a'],
      explanation: 'The most recently pushed element is the first one popped — like a stack of plates.',
    },
    {
      id: 'stack-q2',
      type: 'complexity',
      difficulty: 'easy',
      question: 'What is the time complexity of Push and Pop on a stack implemented with a dynamic array?',
      options: [
        { id: 'a', text: 'O(1) amortized' },
        { id: 'b', text: 'O(n)' },
        { id: 'c', text: 'O(log n)' },
        { id: 'd', text: 'O(n²)' },
      ],
      correct: ['a'],
      explanation: 'Append/remove at the end is O(1) amortized; occasional resize is rare enough to amortize.',
    },
    {
      id: 'stack-q3',
      type: 'scenario',
      difficulty: 'medium',
      question: 'Which real-world system component uses a call stack?',
      options: [
        { id: 'a', text: 'Function call frames during recursion' },
        { id: 'b', text: 'TCP packet ordering' },
        { id: 'c', text: 'Database B-tree page layout' },
        { id: 'd', text: 'GPU texture mipmaps' },
      ],
      correct: ['a'],
      explanation: 'Each function call pushes a frame; return pops it. Stack overflow = too many nested calls.',
    },
    {
      id: 'stack-q4',
      type: 'trace',
      difficulty: 'medium',
      question: 'Operations in order: Push(1), Push(2), Push(3), Pop(), Push(4), Pop(), Pop(). What value does the last Pop() return?',
      options: [
        { id: 'a', text: '3' },
        { id: 'b', text: '4' },
        { id: 'c', text: '2' },
        { id: 'd', text: '1' },
      ],
      correct: ['c'],
      explanation: 'Push 1,2,3 → Pop returns 3, Push 4 → Pop returns 4, final Pop returns 2.',
    },
    {
      id: 'stack-q5',
      type: 'true-false',
      difficulty: 'easy',
      question: 'Stacks are commonly used to check whether parentheses in an expression are balanced.',
      correct: true,
      explanation: 'Push opening brackets; on closing, pop and verify match. Non-empty stack at end = unbalanced.',
    },
    {
      id: 'stack-q6',
      type: 'mcq',
      difficulty: 'medium',
      question: 'Converting infix "3 + 4 * 2" to postfix using a stack — why is operator precedence handled with the stack?',
      options: [
        { id: 'a', text: 'Higher-precedence operators on top delay lower-precedence pops' },
        { id: 'b', text: 'Stacks automatically sort numbers' },
        { id: 'c', text: 'Postfix has no operator precedence' },
        { id: 'd', text: 'Multiplication is always pushed first' },
      ],
      correct: ['a'],
      explanation: 'The shunting-yard algorithm uses the stack to defer operators until precedence rules allow output.',
    },
    {
      id: 'stack-q7',
      type: 'code-analysis',
      difficulty: 'hard',
      question: 'What does this stack-based DFS pattern guarantee?',
      code: `stack.push(start);
while (!stack.empty()) {
    node = stack.pop();
    if (visited.add(node)) {
        for (neighbor : node.neighbors)
            stack.push(neighbor);
    }
}`,
      codeLang: 'pseudocode',
      options: [
        { id: 'a', text: 'Each node is processed once; order depends on push order (LIFO depth-first)' },
        { id: 'b', text: 'Shortest path in unweighted graph' },
        { id: 'c', text: 'Topological order' },
        { id: 'd', text: 'Breadth-first level order' },
      ],
      correct: ['a'],
      explanation: 'Stack DFS explores deeply before backtracking — not shortest path (that is BFS).',
    },
    {
      id: 'stack-q8',
      type: 'fill-blank',
      difficulty: 'medium',
      question: 'Popping from an empty stack should raise an error or return a special value — this condition is called ___ underflow.',
      correct: ['stack'],
      aliases: ['Stack'],
      explanation: 'Stack underflow is the counterpart to overflow (too many pushes on a fixed stack).',
    },
  ],
  challenges: [
    {
      id: 'stack-c1',
      type: 'trace',
      difficulty: 'medium',
      question: 'Validate parentheses: "({[]})". Stack trace — what is on the stack after processing "{["?',
      options: [
        { id: 'a', text: '(, {' },
        { id: 'b', text: '(, {, [' },
        { id: 'c', text: '[' },
        { id: 'd', text: 'empty' },
      ],
      correct: ['b'],
      explanation: 'Push ( then { then [. Stack top is [ with ( and { below.',
    },
    {
      id: 'stack-c2',
      type: 'mini-code',
      difficulty: 'hard',
      question: 'Implement a function that returns true if a string of brackets ()[]{} is balanced. Use a stack.',
      rubric: [
        'Push opening brackets onto a stack',
        'On closing bracket, pop and verify it matches',
        'Return false if stack empty on pop or mismatch',
        'Return stack.isEmpty() at the end',
      ],
      explanation: 'This is the canonical stack interview problem. Try it in the Playground with a slice/stack in Go or Stack<char> in C#.',
    },
  ],
} satisfies QuizPack