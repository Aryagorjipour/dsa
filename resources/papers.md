# Foundational Papers

## Core Papers (Must Read Summaries)

### Skip Lists: A Probabilistic Alternative to Balanced Trees
- **Author**: William Pugh (1990)
- **Link**: https://15721.courses.cs.cmu.edu/spring2018/papers/08-oltpindexes1/pugh-skiplists-cacm1990.pdf
- **Summary**: Introduces skip lists as a simpler, probabilistic alternative to balanced trees. Expected O(log n) with very simple code.
- **Impact**: Used in Redis Sorted Sets, LevelDB/RocksDB MemTables, and many LSM-tree systems.

### A Dichromatic Framework for Balanced Trees (Red-Black Trees)
- **Authors**: Leonidas J. Guibas and Robert Sedgewick (1978)
- **Link**: Search "Guibas Sedgewick red black" or read via Wikipedia references.
- **Summary**: The original formalization of Red-Black trees from 2-3-4 trees.
- **Impact**: Basis for TreeMap/SortedSet in Java, .NET, Linux kernel, etc.

### Space/Time Trade-offs in Hash Coding with Allowable Errors (Bloom Filter)
- **Author**: Burton H. Bloom (1970)
- **Link**: https://dl.acm.org/doi/10.1145/362686.362692 (or search ACM)
- **Summary**: Introduces the Bloom filter for approximate membership testing with tunable false positive rate and very low space.
- **Impact**: Ubiquitous in databases (Cassandra, HBase), caches, networking, and Bitcoin SPV clients.

### HyperLogLog: the analysis of a near-optimal cardinality estimation algorithm
- **Authors**: Philippe Flajolet et al. (2007)
- **Link**: https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf
- **Summary**: The foundational paper on HyperLogLog for estimating cardinality (unique count) with extremely small memory.
- **Impact**: Used by Google, Facebook, Netflix, Redis (PFCOUNT), ClickHouse, etc. for "how many unique users?" at massive scale.

### The Cuckoo Filter: Better Than Bloom
- **Link**: https://www.usenix.org/system/files/nsdip13-paper6.pdf (or search "Fan et al Cuckoo Filter")
- **Summary**: Introduces Cuckoo Filters, which support deletions and often use less space than Bloom filters at low false positive rates.
- **Impact**: Modern replacement in some systems for Bloom filters when deletion is needed.

### Fenwick Tree (Binary Indexed Tree) original paper
- **Author**: Peter M. Fenwick (1994)
- **Summary**: "A new data structure for cumulative frequency tables" — the origin of the Fenwick Tree for prefix sums and range updates in O(log n).

## Additional Important Papers

- **Count-Min Sketch** (Cormode & Muthukrishnan, 2005): For frequency estimation.
- **Consistent Hashing and Random Trees** (Karger et al.): Basis for distributed caching and sharding (used in Akamai, Cassandra, etc.).
- **LSM-tree** papers: Explain why skip lists + Bloom filters are so common in modern storage engines.

These papers are short and extremely high signal. Read the abstracts + key figures first.