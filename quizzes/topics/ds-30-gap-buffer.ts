import type { QuizPack } from '../types'

export default {
  pagePath: '/data-structures/30-gap-buffer',
  topicId: 'gap-buffer',
  title: 'Gap Buffer',
  quiz: [
    {
      id: 'gb-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'What is a gap buffer?',
      options: [
        { id: 'a', text: 'A dynamic array with an empty gap region kept near the cursor for cheap local edits' },
        { id: 'b', text: 'A binary tree of string chunks for very large documents' },
        { id: 'c', text: 'A probabilistic sketch for cardinality estimation' },
        { id: 'd', text: 'A sorted array of all suffixes of a string' },
      ],
      correct: ['a'],
      explanation: 'Gap buffers maintain a movable empty region around the cursor so inserts/deletes near the cursor are cheap.',
    },
    {
      id: 'gb-q2',
      type: 'true-false',
      difficulty: 'easy',
      question: 'Inserting a character at the cursor in a gap buffer is typically O(1) when the gap has space.',
      correct: true,
      explanation: 'Insert just writes into the gap and advances gapStart — no shifting of surrounding text.',
    },
    {
      id: 'gb-q3',
      type: 'complexity',
      difficulty: 'medium',
      question: 'What is the time complexity of MoveCursor to a new position?',
      options: [
        { id: 'a', text: 'O(distance) — proportional to how far the gap must move' },
        { id: 'b', text: 'O(1) always' },
        { id: 'c', text: 'O(log n)' },
        { id: 'd', text: 'O(n²)' },
      ],
      correct: ['a'],
      explanation: 'Moving the gap requires copying characters across the distance. Worst case is O(n).',
    },
    {
      id: 'gb-q4',
      type: 'fill-blank',
      difficulty: 'medium',
      question: 'Gap buffers exploit the ___ of human editing — users usually edit near where they were editing before.',
      correct: ['locality', 'spatial locality', 'editing locality'],
      aliases: ['local', 'locality of reference'],
      explanation: 'Because edits cluster near the cursor, keeping the gap there makes most operations O(1).',
    },
    {
      id: 'gb-q5',
      type: 'scenario',
      difficulty: 'medium',
      question: 'Building an interactive text editor where users type sequentially at the cursor. Best buffer structure?',
      options: [
        { id: 'a', text: 'Gap Buffer' },
        { id: 'b', text: 'HyperLogLog' },
        { id: 'c', text: 'KD-tree' },
        { id: 'd', text: 'Count-Min Sketch' },
      ],
      correct: ['a'],
      explanation: 'Gap buffers are one of the simplest and most effective structures for interactive cursor-local editing.',
    },
    {
      id: 'gb-q6',
      type: 'matching',
      difficulty: 'hard',
      question: 'Match each text-editing structure to its best use case.',
      pairs: [
        { id: '1', left: 'Gap Buffer', right: 'Normal typing, cursor-local edits' },
        { id: '2', left: 'Rope', right: 'Very large files, non-local edits' },
        { id: '3', left: 'Piece Table', right: 'Word-style editing (Microsoft Word)' },
        { id: '4', left: 'Contiguous char[]', right: 'Simple append-only string building' },
      ],
      explanation: 'Each structure optimizes for different editing patterns and document sizes.',
    },
    {
      id: 'gb-q7',
      type: 'code-analysis',
      difficulty: 'hard',
      question: 'When MoveGap moves the gap left (newPos < gapStart), what happens?',
      code: `if (newPos < _gapStart) {
    int delta = _gapStart - newPos;
    Array.Copy(_buffer, newPos, _buffer, _gapEnd - delta, delta);
    _gapStart = newPos;
    _gapEnd -= delta;
}`,
      codeLang: 'csharp',
      options: [
        { id: 'a', text: 'Characters between newPos and gapStart are copied to the right side of the gap' },
        { id: 'b', text: 'The entire buffer is reallocated from scratch' },
        { id: 'c', text: 'Characters are deleted permanently' },
        { id: 'd', text: 'The gap size doubles automatically' },
      ],
      correct: ['a'],
      explanation: 'Moving the gap shifts text across the gap region. Left moves copy text rightward into the gap\'s trailing space.',
    },
    {
      id: 'gb-q8',
      type: 'mcq-multi',
      difficulty: 'medium',
      question: 'Which editors or systems have used gap buffers? (Select all that apply)',
      options: [
        { id: 'a', text: 'Emacs (famously, for a long time)' },
        { id: 'b', text: 'Some older IDEs and code editors' },
        { id: 'c', text: 'Redis PFADD/PFCOUNT' },
        { id: 'd', text: 'Any "mostly sequential editing" workload' },
      ],
      correct: ['a', 'b', 'd'],
      explanation: 'Emacs is the classic example. Redis PFADD is HyperLogLog, not gap buffers.',
    },
  ],
  challenges: [
    {
      id: 'gb-c1',
      type: 'trace',
      difficulty: 'medium',
      question: 'Text "Hello|     World" (| = gap start). User types "X". What happens?',
      options: [
        { id: 'a', text: '"X" is written at gapStart, gapStart advances — "HelloX|    World"' },
        { id: 'b', text: 'Entire string is copied to a new rope tree' },
        { id: 'c', text: 'Gap moves to the end of the file first' },
        { id: 'd', text: '"X" is appended after "World" always' },
      ],
      correct: ['a'],
      explanation: 'Insert writes into the gap at gapStart and increments gapStart. No shifting needed when gap has space.',
    },
    {
      id: 'gb-c2',
      type: 'design',
      difficulty: 'hard',
      question: 'You edit a 50 MB log file with frequent jumps to random line numbers across the file. Best buffer?',
      options: [
        { id: 'a', text: 'Rope — gap buffer pays O(n) to move the gap on distant cursor jumps' },
        { id: 'b', text: 'Gap Buffer — always optimal at any file size' },
        { id: 'c', text: 'Bloom filter' },
        { id: 'd', text: 'Suffix array only' },
      ],
      correct: ['a'],
      explanation: 'Gap buffers degrade when the cursor jumps far often. Ropes handle large files and non-local edits in O(log n).',
    },
  ],
} satisfies QuizPack