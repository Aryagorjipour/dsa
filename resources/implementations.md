# High-Quality Open Source Implementations

Focus on clean, well-documented C# and Go code (matching the handbook style).

## Red-Black Tree / Self-Balancing BST
- C#: https://github.com/Blackjack200/RedBlackTree (or search "RedBlackTree C# complete")
- Go: Many good ones in competitive programming repos. See `container/heap` + custom for ordered maps.

## Skip List
- Redis source (C): https://github.com/redis/redis/blob/unstable/src/t_zset.c (production quality)
- LevelDB / RocksDB MemTable: https://github.com/google/leveldb (search for skiplist.h)
- Go implementations: Search "golang skip list" — many battle-tested ones used in key-value stores.

## Segment Tree & Fenwick Tree
- CP-Algorithms reference implementations (very clean): https://cp-algorithms.com/data_structures/segment_tree.html
- GitHub: Search "segment tree fenwick csharp" or "go" — many from competitive programmers.

## Trie / Aho-Corasick
- Aho-Corasick Go: https://github.com/cloudflare/ahocorasick (used in production by Cloudflare)
- Trie implementations are everywhere; focus on ones with deletion and prefix count.

## Bloom Filter / HyperLogLog / Count-Min
- Redis modules for HyperLogLog and Bloom.
- Google Guava or Apache DataSketches (Java, but concepts transfer).
- For Go: Search "golang hyperloglog" — several production-grade libraries.

## Production References (Read the Code)
- **Redis**: Sorted Sets (skip list), HyperLogLog
- **RocksDB**: MemTable (skip list)
- **PostgreSQL**: B+ tree indexes (src/backend/access/nbtree)
- **Linux kernel**: Red-black trees (include/linux/rbtree.h)
- **.NET**: Reference source for SortedSet&lt;T&gt; (uses Red-Black)

These are the best "evidence-based" implementations because they run at massive scale.