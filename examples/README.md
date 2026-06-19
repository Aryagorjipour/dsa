# Examples Directory

This folder contains **runnable, evidence-based** examples.

Focus is on quality over quantity. Each demonstrates a real motivating problem or production pattern.

## Current High-Quality Examples

### Core Search
- `binary_search_twocrystals` (Go + C#) — Two Crystal Balls problem. Classic for Binary + Exponential Search.

### Dynamic Programming
- `knapsack` — 0/1 Knapsack (resource allocation, scheduling).
- `lis` — Longest Increasing Subsequence (O(n log n) patience sort style).

### Range Query Structures
- `segment_tree_range_sum` (Go + C#) — Range aggregates with updates. Used in analytics, finance, GIS.

### Probabilistic Structures
- `bloom_filter` (Go + C#) — Membership testing. Production in Cassandra, HBase, crawlers, Bitcoin SPV.

### Sorted Structures
- `skip_list_basic` (Go) — Skip list. Production in Redis ZSETs, RocksDB/LevelDB MemTables.

### Prefix & Autocomplete
- `trie_autocomplete` (Go + C#) — Trie for suggestions. Used in Google Search, VS Code, Amazon typeahead, keyboards.

### Distributed Systems
- `consistent_hashing` (Go + C#) — Consistent hashing with virtual nodes. Used in Cassandra, DynamoDB, Memcached, Akamai CDN, load balancers.

### Rate Limiting
- `rate_limiter` (Go) — Token bucket. Used by Twitter, Amazon, Stripe, Netflix to protect APIs.

### Graph / Connectivity
- `union_find_mst` (Go) — Disjoint Set for Kruskal MST and connectivity. Used in network design, clustering, image segmentation.

### Advanced String & Pathfinding
- `astar_grid.go` — A* with heuristic on grid (game/robotics pathfinding).
- `aho_corasick.go` — Multi-pattern search (antivirus, moderation, bioinformatics).

### More Complex Structures
- `quadtree_2d.go` — 2D range queries (games, GIS).
- `hyperloglog_simple.go` — Cardinality estimation (unique counts at scale).
- `rope_basic.go` — Large string manipulation (editors).

New images added for Skip List, Merkle, Quadtree, KD Tree, etc. (unique names in images/).

New diagrams in images/: fenwick-tree.png, astar-heuristic.png, aho-corasick-automaton.png, segment-tree-advanced.png (non-overriding names).

See `resources/production-use-cases.md` for detailed evidence from real systems.

## How to Run
- Go: `go run examples/go/<file>.go`
- C#: Compile as console app or use `dotnet script`.

## Philosophy
We selected examples that are:
- Accurate to how the structure is actually used (Redis, RocksDB, databases, Netflix-scale analytics)
- Usable as starting points for real code
- Tied directly to chapters with explanations

See `resources/production-use-cases.md` for more evidence of where these appear in the real world.

Add more only when they demonstrate a distinct, high-value use case.