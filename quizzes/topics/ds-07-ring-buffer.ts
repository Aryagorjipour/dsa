import type { QuizPack } from '../types'

export default {
  pagePath: '/data-structures/07-ring-buffer',
  topicId: 'ring-buffer',
  title: 'Ring Buffer',
  quiz: [
    {
      id: 'ring-buffer-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'What is the defining characteristic of a ring buffer?',
      options: [
        { id: 'a', text: 'Fixed-size buffer that wraps around to reuse space without shifting' },
        { id: 'b', text: 'Unbounded dynamic array that doubles on every insert' },
        { id: 'c', text: 'Tree structure with rotating child pointers' },
        { id: 'd', text: 'Hash table with circular probing only' },
      ],
      correct: ['a'],
      explanation: 'When the write position reaches the end, it wraps to the beginning — the "ring" reuses slots in place.',
    },
    {
      id: 'ring-buffer-q2',
      type: 'complexity',
      difficulty: 'easy',
      question: 'What are the time complexities of enqueue (Write) and dequeue (Read) in a ring buffer?',
      options: [
        { id: 'a', text: 'O(1) each, when not blocked by full/empty' },
        { id: 'b', text: 'O(n) each due to element shifting' },
        { id: 'c', text: 'O(log n) each' },
        { id: 'd', text: 'O(1) write, O(n) read' },
      ],
      correct: ['a'],
      explanation: 'Head and count (or head/tail) advance with modulo — no shifting. This is why ring buffers dominate systems programming.',
    },
    {
      id: 'ring-buffer-q3',
      type: 'true-false',
      difficulty: 'easy',
      question: 'After initial creation, a ring buffer performs no heap allocations during normal read/write operations.',
      correct: true,
      explanation: 'Fixed backing array + in-place index updates = zero allocations in the hot path. Critical for real-time and embedded systems.',
    },
    {
      id: 'ring-buffer-q4',
      type: 'mcq-multi',
      difficulty: 'medium',
      question: 'Which are common strategies to distinguish "full" from "empty" in a ring buffer? (Select all that apply)',
      options: [
        { id: 'a', text: 'Maintain a separate count variable' },
        { id: 'b', text: 'Always keep one slot permanently empty' },
        { id: 'c', text: 'Use a dedicated full flag' },
        { id: 'd', text: 'Sort the buffer before each read' },
      ],
      correct: ['a', 'b', 'c'],
      explanation: 'Count, sentinel slot, and full flag are the three classic approaches. Sorting is unrelated to ring buffer design.',
    },
    {
      id: 'ring-buffer-q5',
      type: 'scenario',
      difficulty: 'medium',
      question: 'A real-time audio driver needs glitch-free playback with predictable memory. Which structure fits best?',
      options: [
        { id: 'a', text: 'Ring buffer (fixed capacity, O(1) ops, no malloc in hot path)' },
        { id: 'b', text: 'Unbounded linked list' },
        { id: 'c', text: 'Dynamic array that resizes on every frame' },
        { id: 'd', text: 'Binary search tree' },
      ],
      correct: ['a'],
      explanation: 'Audio subsystems (ALSA, CoreAudio, WASAPI) use ring buffers for bounded, allocation-free buffering.',
    },
    {
      id: 'ring-buffer-q6',
      type: 'fill-blank',
      difficulty: 'medium',
      question: 'When a ring buffer is full and uses an overwrite policy, writing a new item typically evicts the ___ entry.',
      correct: ['oldest', 'oldest item', 'first', 'head'],
      aliases: ['old', 'earliest'],
      explanation: 'Overwrite-on-full advances head after writing, discarding the oldest unconsumed item — common in real-time logging.',
    },
    {
      id: 'ring-buffer-q7',
      type: 'code-analysis',
      difficulty: 'hard',
      question: 'In this Write implementation, what happens when the buffer is already full?',
      code: `int index = (_head + _count) % Capacity;
_buffer[index] = item;
if (_count < Capacity) {
    _count++;
} else {
    _head = (_head + 1) % Capacity;
}`,
      codeLang: 'csharp',
      options: [
        { id: 'a', text: 'Overwrites the slot at index and advances head, evicting the oldest item' },
        { id: 'b', text: 'Throws an exception and refuses the write' },
        { id: 'c', text: 'Doubles the buffer capacity' },
        { id: 'd', text: 'Blocks until a consumer reads an item' },
      ],
      correct: ['a'],
      explanation: 'When count equals capacity, count stays at capacity and head advances — the oldest element is effectively discarded.',
    },
    {
      id: 'ring-buffer-q8',
      type: 'matching',
      difficulty: 'medium',
      question: 'Match each domain to a real-world ring buffer use case from the chapter.',
      pairs: [
        { id: '1', left: 'NIC drivers', right: 'Network packet rings' },
        { id: '2', left: 'VoIP (Discord, Zoom)', right: 'Jitter buffers' },
        { id: '3', left: 'High-performance logging', right: 'Circular in-memory log (last N lines)' },
        { id: '4', left: 'Producer/consumer concurrency', right: 'Bounded buffer problem classic example' },
      ],
      explanation: 'Ring buffers appear in networking, audio/video, logging, and concurrent programming throughout systems code.',
    },
  ],
  challenges: [
    {
      id: 'ring-buffer-c1',
      type: 'trace',
      difficulty: 'medium',
      question: 'Ring buffer capacity=5, initially empty. Write A,B,C,D,E (fills it), then Read twice (removes A,B), then Write F,G. Which slots hold values at indices 0→4?',
      options: [
        { id: 'a', text: '[F, G, C, D, E] with head at index 2' },
        { id: 'b', text: '[A, B, C, D, E] unchanged' },
        { id: 'c', text: '[C, D, E, F, G] linear with no wrap' },
        { id: 'd', text: '[G, _, C, D, F] with head at index 0' },
      ],
      correct: ['a'],
      explanation: 'After consuming A,B head=2, count=3 (C,D,E at indices 2–4). F writes at (2+3)%5=0, G at index 1 → [F,G,C,D,E].',
    },
    {
      id: 'ring-buffer-c2',
      type: 'design',
      difficulty: 'hard',
      question: 'You are building a Single Producer / Single Consumer (SPSC) lock-free ring buffer. What is the easiest concurrency model and why?',
      options: [
        { id: 'a', text: 'SPSC — only one writer and one reader means minimal atomic coordination' },
        { id: 'b', text: 'MPMC — multiple producers and consumers is simplest' },
        { id: 'c', text: 'No concurrency model needed — ring buffers are always thread-safe' },
        { id: 'd', text: 'MPSC with a global mutex on every byte' },
      ],
      correct: ['a'],
      explanation: 'SPSC is the easiest lock-free variant: one thread owns head, one owns tail. MPMC requires careful atomic operations on both indices.',
    },
  ],
} satisfies QuizPack