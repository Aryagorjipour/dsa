import type { QuizPack } from '../types'

export default {
  pagePath: '/data-structures/05-queue',
  topicId: 'queue',
  title: 'Queue',
  quiz: [
    {
      id: 'queue-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'Which ordering principle does a queue follow?',
      options: [
        { id: 'a', text: 'FIFO — First In, First Out' },
        { id: 'b', text: 'LIFO — Last In, First Out' },
        { id: 'c', text: 'Highest priority first' },
        { id: 'd', text: 'Random order' },
      ],
      correct: ['a'],
      explanation: 'Like a line at a coffee shop: the first person to join is the first person served.',
    },
    {
      id: 'queue-q2',
      type: 'complexity',
      difficulty: 'easy',
      question: 'What is the time complexity of Enqueue and Dequeue in a well-implemented queue?',
      options: [
        { id: 'a', text: 'O(1) each' },
        { id: 'b', text: 'O(n) each' },
        { id: 'c', text: 'O(log n) each' },
        { id: 'd', text: 'O(1) enqueue, O(n) dequeue' },
      ],
      correct: ['a'],
      explanation: 'A proper queue makes both ends fast — typically via circular array indices or a linked list.',
    },
    {
      id: 'queue-q3',
      type: 'true-false',
      difficulty: 'easy',
      question: 'Calling Remove(0) on a dynamic array every dequeue gives O(1) queue performance.',
      correct: false,
      explanation: 'Remove(0) shifts every remaining element left — O(n) per dequeue. That defeats the purpose of a queue.',
      misconception: 'A plain list used naively is not a proper queue implementation.',
    },
    {
      id: 'queue-q4',
      type: 'scenario',
      difficulty: 'medium',
      question: 'You need to find the shortest path in an unweighted graph. Which structure is essential?',
      options: [
        { id: 'a', text: 'Queue (for BFS level-by-level exploration)' },
        { id: 'b', text: 'Stack (for DFS only)' },
        { id: 'c', text: 'Hash set alone' },
        { id: 'd', text: 'Min-heap alone' },
      ],
      correct: ['a'],
      explanation: 'BFS uses a queue to process nodes in order of discovery distance — one of the most important queue applications.',
    },
    {
      id: 'queue-q5',
      type: 'mcq-multi',
      difficulty: 'medium',
      question: 'Which are valid ways to implement a queue? (Select all that apply)',
      options: [
        { id: 'a', text: 'Dynamic array with head/tail indices and modulo wrap-around' },
        { id: 'b', text: 'Doubly linked list' },
        { id: 'c', text: 'Two stacks (enqueue on one, dequeue by transferring to the other)' },
        { id: 'd', text: 'Sorted array with binary search insert' },
      ],
      correct: ['a', 'b', 'c'],
      explanation: 'Circular array, linked list, and two-stack tricks are all classic queue implementations. A sorted array is for priority queues, not FIFO.',
    },
    {
      id: 'queue-q6',
      type: 'fill-blank',
      difficulty: 'medium',
      question: 'In a circular array queue, advancing the tail index uses modulo to ___ around the buffer.',
      correct: ['wrap', 'wrap around', 'circle', 'loop'],
      aliases: ['modulo', 'rotate'],
      explanation: 'When tail reaches the end of the buffer, (_tail + 1) % capacity wraps back to index 0 — the ring behavior.',
    },
    {
      id: 'queue-q7',
      type: 'code-analysis',
      difficulty: 'hard',
      question: 'What does the resize logic in this queue implementation accomplish?',
      code: `private void Resize() {
    T[] newData = new T[_data.Length * 2];
    for (int i = 0; i < _count; i++) {
        newData[i] = _data[(_head + i) % _data.Length];
    }
    _head = 0;
    _tail = _count;
}`,
      codeLang: 'csharp',
      options: [
        { id: 'a', text: 'Unwraps the circular buffer into a linear layout in a larger array' },
        { id: 'b', text: 'Sorts the queue elements by priority' },
        { id: 'c', text: 'Removes duplicate elements' },
        { id: 'd', text: 'Converts the queue into a stack' },
      ],
      correct: ['a'],
      explanation: 'After many enqueue/dequeue cycles, head and tail may be scattered. Resize copies elements in FIFO order starting at index 0.',
    },
    {
      id: 'queue-q8',
      type: 'matching',
      difficulty: 'medium',
      question: 'Match each use case to the correct linear structure.',
      pairs: [
        { id: '1', left: 'Process oldest task first', right: 'Queue' },
        { id: '2', left: 'Undo most recent action', right: 'Stack' },
        { id: '3', left: 'Level-order tree traversal', right: 'Queue (BFS)' },
        { id: '4', left: 'Background job processor', right: 'Queue' },
      ],
      explanation: '"Process oldest first" or "level by level" → Queue. "Most recent first" or "backtrack" → Stack.',
    },
  ],
  challenges: [
    {
      id: 'queue-c1',
      type: 'trace',
      difficulty: 'medium',
      question: 'Queue (front→back): [10, 20, 30]. You Dequeue(), then Enqueue(40), then Peek(). What value does Peek return?',
      options: [
        { id: 'a', text: '20' },
        { id: 'b', text: '10' },
        { id: 'c', text: '30' },
        { id: 'd', text: '40' },
      ],
      correct: ['a'],
      explanation: 'Dequeue removes 10 → [20, 30]. Enqueue(40) → [20, 30, 40]. Peek looks at the front without removing: 20.',
    },
    {
      id: 'queue-c2',
      type: 'scenario',
      difficulty: 'hard',
      question: 'A Go service processes messages with a slice+head pattern. After dequeuing 500K messages, the slice still holds 1M capacity but only 10 items remain. What should you do?',
      options: [
        { id: 'a', text: 'Shrink the slice when head > len/2: data = data[head:]; head = 0' },
        { id: 'b', text: 'Always call Remove(0) instead of using a head index' },
        { id: 'c', text: 'Ignore it — memory is free' },
        { id: 'd', text: 'Switch to a binary search tree' },
      ],
      correct: ['a'],
      explanation: 'The chapter warns that a large head index can leak memory. Compacting the slice reclaims the unused prefix.',
    },
  ],
} satisfies QuizPack