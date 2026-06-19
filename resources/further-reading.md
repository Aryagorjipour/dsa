# Further Reading & Advanced Topics

## Probabilistic Data Structures
- Why they exist: Trade exactness for massive memory savings.
- Good to know: HyperLogLog, Count-Min Sketch, Bloom/Cuckoo are approximations. Know the error bounds.

## Persistent / Immutable Data Structures
- Used in Git, functional programming, and some databases.
- Related to the Rope and persistent BST variants.

## Cache-Oblivious Algorithms
- B+ trees and some segment tree variants are designed to work well regardless of cache line size.

## External Memory Model
- Why we use B+ trees on disk instead of Red-Black trees (page size matters).

## Concurrency
- Lock-free skip lists, concurrent hash maps, work-stealing deques.

## History
- Many of these structures were invented in the 1970s–1990s when memory was expensive and algorithms had to be extremely efficient.

**Further exploration**:
- Read the source of one production system (Redis skip list or PostgreSQL B+ tree).
- Implement one advanced structure (Segment Tree with lazy propagation or Aho-Corasick) from scratch.

These topics are "good to know" for senior engineers and system designers but go beyond the core handbook.