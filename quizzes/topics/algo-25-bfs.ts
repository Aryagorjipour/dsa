import type { QuizPack } from '../types'

export default {
  pagePath: '/algorithms/25-bfs',
  topicId: 'bfs',
  title: 'BFS',
  quiz: [
    {
      id: 'bfs-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'Which data structure does BFS use?',
      options: [
        { id: 'a', text: 'Queue (FIFO)' },
        { id: 'b', text: 'Stack (LIFO)' },
        { id: 'c', text: 'Priority queue only' },
        { id: 'd', text: 'Hash map only' },
      ],
      correct: ['a'],
      explanation: 'BFS explores level by level — first discovered, first processed = queue.',
    },
    {
      id: 'bfs-q2',
      type: 'complexity',
      difficulty: 'medium',
      question: 'Time complexity of BFS on a graph with V vertices and E edges:',
      options: [
        { id: 'a', text: 'O(V)' },
        { id: 'b', text: 'O(V + E)' },
        { id: 'c', text: 'O(V²)' },
        { id: 'd', text: 'O(E log V)' },
      ],
      correct: ['b'],
      explanation: 'Each vertex and edge visited at most once with proper visited tracking.',
    },
    {
      id: 'bfs-q3',
      type: 'true-false',
      difficulty: 'easy',
      question: 'BFS finds the shortest path in an unweighted graph.',
      correct: true,
      explanation: 'First time you reach a node is via fewest edges — layers expand uniformly.',
    },
    {
      id: 'bfs-q4',
      type: 'scenario',
      difficulty: 'medium',
      question: 'Social network "degrees of separation" (fewest friend hops). Which algorithm?',
      options: [
        { id: 'a', text: 'BFS from source person' },
        { id: 'b', text: 'DFS only' },
        { id: 'c', text: 'Dijkstra with random weights' },
        { id: 'd', text: 'Bubble sort' },
      ],
      correct: ['a'],
      explanation: 'Unweighted shortest path = BFS. Each hop is one edge.',
    },
    {
      id: 'bfs-q5',
      type: 'trace',
      difficulty: 'medium',
      question: 'Graph: A connected to B,C. B to D. C to D. BFS from A. Order of first discovery?',
      options: [
        { id: 'a', text: 'A, B, C, D' },
        { id: 'b', text: 'A, C, B, D' },
        { id: 'c', text: 'A, D, B, C' },
        { id: 'd', text: 'D, C, B, A' },
      ],
      correct: ['a'],
      explanation: 'A first, then neighbors B and C (order may vary B,C or C,B — A,B,C,D is valid with B before C).',
    },
    {
      id: 'bfs-q6',
      type: 'mcq',
      difficulty: 'hard',
      question: 'Why must BFS track visited nodes?',
      options: [
        { id: 'a', text: 'Prevent revisiting nodes and infinite loops in cyclic graphs' },
        { id: 'b', text: 'Sort the queue' },
        { id: 'c', text: 'Compute edge weights' },
        { id: 'd', text: 'Visited tracking is optional' },
      ],
      correct: ['a'],
      explanation: 'Without visited set, cycles cause exponential re-enqueueing.',
    },
    {
      id: 'bfs-q7',
      type: 'true-false',
      difficulty: 'medium',
      question: 'BFS on a grid maze finds the shortest path in number of steps.',
      correct: true,
      explanation: 'Grid cells are unweighted nodes; BFS gives shortest path in moves.',
    },
    {
      id: 'bfs-q8',
      type: 'code-analysis',
      difficulty: 'hard',
      question: 'What is missing from this BFS that could cause wrong results?',
      code: `queue.push(start);
while (!queue.empty()) {
    node = queue.pop();  // pop from end
    for (neighbor : node.neighbors)
        queue.push(neighbor);
}`,
      codeLang: 'pseudocode',
      options: [
        { id: 'a', text: 'Using stack behavior (pop from end) + no visited set — this is DFS-like and may loop' },
        { id: 'b', text: 'Nothing — this is correct BFS' },
        { id: 'c', text: 'Missing priority queue' },
        { id: 'd', text: 'Queue should be a heap' },
      ],
      correct: ['a'],
      explanation: 'BFS needs dequeue from front (FIFO) and visited tracking. Pop from end = stack = DFS.',
    },
  ],
  challenges: [
    {
      id: 'bfs-c1',
      type: 'trace',
      difficulty: 'hard',
      question: 'Grid BFS from (0,0) to (2,2), 4-directional moves, no obstacles. Minimum steps?',
      options: [
        { id: 'a', text: '4' },
        { id: 'b', text: '2' },
        { id: 'c', text: '3' },
        { id: 'd', text: '5' },
      ],
      correct: ['a'],
      explanation: 'Manhattan distance |2-0| + |2-0| = 4. BFS finds this shortest path.',
    },
    {
      id: 'bfs-c2',
      type: 'mini-code',
      difficulty: 'medium',
      question: 'Implement BFS that returns shortest distance from start to target in an unweighted graph.',
      rubric: [
        'Use a queue, enqueue start with distance 0',
        'Track visited nodes',
        'Dequeue from front, return distance when target found',
        'Enqueue unvisited neighbors with distance + 1',
        'Return -1 or infinity if target unreachable',
      ],
      explanation: 'Classic BFS template. Test on the A→B,C→D graph from q5.',
    },
  ],
} satisfies QuizPack