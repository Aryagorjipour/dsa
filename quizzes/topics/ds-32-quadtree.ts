import type { QuizPack } from '../types'

export default {
  pagePath: '/data-structures/32-quadtree',
  topicId: 'quadtree',
  title: 'Quadtree',
  quiz: [
    {
      id: 'qt-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'What does a quadtree partition?',
      options: [
        { id: 'a', text: '2D space into four quadrants recursively' },
        { id: 'b', text: 'k-dimensional point space with alternating axis splits' },
        { id: 'c', text: 'Text into string chunks in a binary tree' },
        { id: 'd', text: 'A stream into approximate frequency buckets' },
      ],
      correct: ['a'],
      explanation: 'Each internal quadtree node has four children: NW, NE, SW, SE — the 2D equivalent of spatial binary partitioning.',
    },
    {
      id: 'qt-q2',
      type: 'true-false',
      difficulty: 'easy',
      question: 'Each internal node in a quadtree has exactly four children.',
      correct: true,
      explanation: 'Quad = four. Internal nodes subdivide into four quadrants when capacity is exceeded.',
    },
    {
      id: 'qt-q3',
      type: 'complexity',
      difficulty: 'medium',
      question: 'What is the average-case time complexity of a range query returning k points?',
      options: [
        { id: 'a', text: 'O(log n + k)' },
        { id: 'b', text: 'O(n²)' },
        { id: 'c', text: 'O(1)' },
        { id: 'd', text: 'O(n log n)' },
      ],
      correct: ['a'],
      explanation: 'Range query prunes non-intersecting quadrants (log factor) then collects k results. Worst case is O(n) with clustered points.',
    },
    {
      id: 'qt-q4',
      type: 'fill-blank',
      difficulty: 'medium',
      question: 'The 3D generalization of a quadtree is called an ___.',
      correct: ['octree'],
      aliases: ['oct tree', '8-tree'],
      explanation: 'Octree divides 3D space into eight octants — the natural 3D extension of quadtrees.',
    },
    {
      id: 'qt-q5',
      type: 'scenario',
      difficulty: 'medium',
      question: 'A game engine needs efficient collision detection and frustum culling in 2D. Best spatial structure?',
      options: [
        { id: 'a', text: 'Quadtree' },
        { id: 'b', text: 'Suffix array' },
        { id: 'c', text: 'Gap buffer' },
        { id: 'd', text: 'Count-Min Sketch' },
      ],
      correct: ['a'],
      explanation: 'Quadtrees are extremely common in games for collision detection, visibility culling, and AI perception.',
    },
    {
      id: 'qt-q6',
      type: 'ordering',
      difficulty: 'hard',
      question: 'Order the steps when inserting a point into a full quadtree node.',
      items: [
        { id: '1', text: 'Check if point is within node boundary' },
        { id: '2', text: 'If node has room and is undivided, add point directly' },
        { id: '3', text: 'If full, Subdivide into four child quadrants' },
        { id: '4', text: 'Redistribute existing points and insert new point into children' },
      ],
      correct: ['1', '2', '3', '4'],
      explanation: 'Insert checks boundary, uses leaf capacity if available, otherwise subdivides and redistributes points to children.',
    },
    {
      id: 'qt-q7',
      type: 'code-analysis',
      difficulty: 'hard',
      question: 'How does QueryRange avoid scanning the entire tree?',
      code: `if (!Intersects(qx1, qy1, qx2, qy2)) return;
// ... check local points ...
if (divided) {
    nw!.QueryRange(...); ne!.QueryRange(...);
    sw!.QueryRange(...); se!.QueryRange(...);
}`,
      codeLang: 'csharp',
      options: [
        { id: 'a', text: 'Prunes subtrees whose boundaries do not intersect the query rectangle' },
        { id: 'b', text: 'Always visits every node regardless of position' },
        { id: 'c', text: 'Sorts all points before querying' },
        { id: 'd', text: 'Uses binary search on the Y axis only' },
      ],
      correct: ['a'],
      explanation: 'Intersects check discards entire quadrants that don\'t overlap the query region — the core quadtree optimization.',
    },
    {
      id: 'qt-q8',
      type: 'mcq-multi',
      difficulty: 'medium',
      question: 'Which are real-world uses of quadtrees? (Select all)',
      options: [
        { id: 'a', text: 'Game collision detection and frustum culling' },
        { id: 'b', text: 'GIS point-of-interest storage and querying' },
        { id: 'c', text: 'Quadtree image compression' },
        { id: 'd', text: 'Exact financial transaction deduplication' },
      ],
      correct: ['a', 'b', 'c'],
      explanation: 'Quadtrees appear in games, GIS, graphics, and image processing. They are spatial indexes, not financial tools.',
    },
  ],
  challenges: [
    {
      id: 'qt-c1',
      type: 'trace',
      difficulty: 'medium',
      question: 'A quadtree node has Capacity=4 and already holds 4 points. A 5th point arrives. What happens first?',
      options: [
        { id: 'a', text: 'Subdivide into four quadrants and redistribute the points' },
        { id: 'b', text: 'Reject the point — quadtree is full forever' },
        { id: 'c', text: 'Convert to a KD-tree automatically' },
        { id: 'd', text: 'Merge with a neighboring node' },
      ],
      correct: ['a'],
      explanation: 'When capacity is exceeded, Subdivide splits the region into NW/NE/SW/SE children and redistributes points.',
    },
    {
      id: 'qt-c2',
      type: 'variant',
      difficulty: 'hard',
      question: 'All 1 million points are clustered in one corner of the map. What happens to quadtree performance?',
      options: [
        { id: 'a', text: 'Worst case degrades toward O(n) — tree becomes very deep in one region' },
        { id: 'b', text: 'Performance improves because points are close together' },
        { id: 'c', text: 'Quadtree automatically rebalances to O(1)' },
        { id: 'd', text: 'Clustered data is the ideal case for quadtrees' },
      ],
      correct: ['a'],
      explanation: 'The chapter notes worst case occurs with clustered points (all in one corner), creating deep unbalanced subdivision.',
    },
  ],
} satisfies QuizPack