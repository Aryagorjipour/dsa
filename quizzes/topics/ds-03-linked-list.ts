import type { QuizPack } from '../types'

export default {
  pagePath: '/data-structures/03-linked-list',
  topicId: 'linked-list',
  title: 'Linked List',
  quiz: [
    {
      id: 'll-q1',
      type: 'mcq',
      difficulty: 'easy',
      question: 'What is the main structural difference between an array and a linked list?',
      options: [
        { id: 'a', text: 'Linked list nodes are scattered in memory, connected by pointers' },
        { id: 'b', text: 'Linked lists store elements in contiguous memory' },
        { id: 'c', text: 'Linked lists cannot store integers' },
        { id: 'd', text: 'Arrays use pointers between every element' },
      ],
      correct: ['a'],
      explanation: 'Each node holds data + a pointer to the next node. No guarantee of memory contiguity.',
    },
    {
      id: 'll-q2',
      type: 'complexity',
      difficulty: 'easy',
      question: 'What is the time complexity of accessing the element at index k in a singly linked list?',
      options: [
        { id: 'a', text: 'O(1)' },
        { id: 'b', text: 'O(log k)' },
        { id: 'c', text: 'O(k) or O(n)' },
        { id: 'd', text: 'O(1) with caching' },
      ],
      correct: ['c'],
      explanation: 'You must traverse from the head, following k pointers — no random access.',
    },
    {
      id: 'll-q3',
      type: 'true-false',
      difficulty: 'medium',
      question: 'Inserting at the head of a singly linked list (when you already have a pointer to the head) is O(1).',
      correct: true,
      explanation: 'Create a new node, point it to the old head, update head — constant time, no shifting.',
    },
    {
      id: 'll-q4',
      type: 'mcq',
      difficulty: 'medium',
      question: 'Why might a linked list use MORE memory than an array for the same number of elements?',
      options: [
        { id: 'a', text: 'Each node stores extra pointer(s) in addition to the data' },
        { id: 'b', text: 'Linked lists duplicate all data twice' },
        { id: 'c', text: 'Linked lists require a hash table per element' },
        { id: 'd', text: 'Arrays always compress data' },
      ],
      correct: ['a'],
      explanation: 'Pointer overhead per node (8 bytes on 64-bit) adds up, plus potential allocator metadata.',
    },
    {
      id: 'll-q5',
      type: 'scenario',
      difficulty: 'medium',
      question: 'An LRU cache eviction list needs O(1) removal of arbitrary nodes when you have a pointer to them. Why is a doubly linked list ideal?',
      options: [
        { id: 'a', text: 'You can unlink a node in O(1) knowing only its address and its neighbors' },
        { id: 'b', text: 'Doubly linked lists sort automatically' },
        { id: 'c', text: 'Singly linked lists cannot be traversed' },
        { id: 'd', text: 'Arrays support O(1) arbitrary deletion without shifting' },
      ],
      correct: ['a'],
      explanation: 'With prev/next pointers, removal is pointer rewiring — no traversal or shifting needed.',
    },
    {
      id: 'll-q6',
      type: 'code-analysis',
      difficulty: 'hard',
      question: 'What is wrong with this singly linked list deletion?',
      code: `void Delete(Node* head, Node* target) {
    if (head == target) { /* handle head */ return; }
    Node* curr = head;
    while (curr->next != target) curr = curr->next;
    curr->next = target->next;
    // forgot to free(target)
}`,
      codeLang: 'pseudocode',
      options: [
        { id: 'a', text: 'Memory leak — the deleted node is not freed/deallocated' },
        { id: 'b', text: 'Infinite loop is guaranteed' },
        { id: 'c', text: 'Cannot delete non-head nodes' },
        { id: 'd', text: 'Nothing is wrong' },
      ],
      correct: ['a'],
      explanation: 'The logic unlinks correctly but leaks the node memory. In managed languages the GC handles this; in C/C++/Go you must free.',
    },
    {
      id: 'll-q7',
      type: 'fill-blank',
      difficulty: 'easy',
      question: 'The classic trade-off: arrays excel at random access; linked lists excel at ___ insertions/deletions when you have the node reference.',
      correct: ['O(1)', 'o(1)', 'constant'],
      aliases: ['constant time', 'fast'],
      explanation: 'O(1) insertion/deletion at a known position is the linked list superpower.',
    },
    {
      id: 'll-q8',
      type: 'true-false',
      difficulty: 'hard',
      question: 'Linked lists always outperform arrays for cache-sensitive sequential iteration.',
      correct: false,
      explanation: 'Pointer chasing causes cache misses. Arrays with spatial locality often iterate faster despite O(n) for both.',
    },
  ],
  challenges: [
    {
      id: 'll-c1',
      type: 'trace',
      difficulty: 'medium',
      question: 'List: 1 → 3 → 5 → 7. Insert 4 after the node containing 3. What is the new sequence?',
      options: [
        { id: 'a', text: '1 → 3 → 4 → 5 → 7' },
        { id: 'b', text: '1 → 4 → 3 → 5 → 7' },
        { id: 'c', text: '1 → 3 → 5 → 4 → 7' },
        { id: 'd', text: '4 → 1 → 3 → 5 → 7' },
      ],
      correct: ['a'],
      explanation: 'New node points to 5; node 3 points to new node 4.',
    },
    {
      id: 'll-c2',
      type: 'debug',
      difficulty: 'hard',
      question: 'Floyd\'s cycle detection (tortoise/hare) on a linked list with a cycle — what does it detect?',
      options: [
        { id: 'a', text: 'Whether the list has a cycle, using two pointers at different speeds' },
        { id: 'b', text: 'The sorted order of elements' },
        { id: 'c', text: 'Memory leaks in the allocator' },
        { id: 'd', text: 'The length without traversal' },
      ],
      correct: ['a'],
      explanation: 'Fast and slow pointers meet inside a cycle. This is a classic linked list interview technique.',
    },
  ],
} satisfies QuizPack