# Real-World Production Use Cases (Evidence-Based)

## Skip Lists
- **Redis**: Sorted Sets (ZADD, ZRANGE, leaderboards, rate limiting windows).
- **LevelDB / RocksDB**: MemTable (in-memory write buffer before flushing to SSTables). Used by CockroachDB, TiDB, etc.
- **Why**: Simple concurrent implementation + good range scan performance.

## Bloom Filters
- **Cassandra, HBase, ScyllaDB**: SSTable index filters (avoid unnecessary disk reads).
- **Bitcoin SPV clients**: Check if transaction is relevant without downloading full block.
- **Web crawlers & CDNs**: URL deduplication at scale.
- **Databases**: Quickly check if a key might exist before expensive lookup.

## HyperLogLog
- **Netflix**: Estimating unique viewers, title popularity at trillions of rows.
- **Google, Facebook, Twitter**: Unique user counts, DAU/MAU, distinct search terms.
- **Redis**: PFADD / PFCOUNT commands.
- **Analytics systems** (ClickHouse, Druid, BigQuery): Cardinality estimation.

## Segment Tree / Fenwick Tree
- **Databases & Analytics**: Range aggregate queries (sum, min, max) over time-series or logs.
- **Financial systems**: Running totals, moving averages, order book statistics.
- **GIS & Image Processing**: 2D range queries.
- **Competitive Programming** (but also in real scheduling systems).

## Count-Min Sketch
- **Network monitoring**: Heavy hitters (top talkers) in traffic.
- **Databases**: Approximate frequency queries.
- **Recommendation systems**: Estimating item popularity.

## Cuckoo Filter
- **Modern key-value stores and caches**: When you need deletion support + better space than Bloom at low false-positive rates.
- Used in some research storage systems and as improvement over Bloom in certain workloads.

## B+ Trees
- **Almost every relational database**: PostgreSQL, MySQL InnoDB, SQLite — tables and indexes.
- **File systems**: NTFS, APFS, ext4 (in some forms), XFS.

## Red-Black Trees
- **.NET**: SortedSet<T>, SortedDictionary
- **Java**: TreeMap, TreeSet
- **Linux kernel**: Process scheduler (CFS), virtual memory areas, many internal structures.
- **Git** (indirectly through balanced trees in some operations).

## Consistent Hashing
- **Apache Cassandra, Amazon DynamoDB**: Data partitioning across nodes with minimal rebalancing when nodes join/leave.
- **Memcached clients (e.g. Ketama), Redis Cluster**: Distributing keys across cache nodes.
- **CDNs (Akamai, etc.)**: Mapping content to edge servers.
- **Load balancers (Maglev at Google, HAProxy)**: Consistent request routing with session affinity.
- **Discord, Vimeo**: Chat and video streaming backend sharding.

## Tries (Prefix Trees)
- **Google Search, Amazon, eBay**: Autocomplete and search suggestions (type "prog" → "programming", "progress").
- **IDEs (VS Code, IntelliJ, Sublime)**: Code completion and symbol lookup. Supports camelCase matching.
- **Mobile keyboards (Gboard, SwiftKey)**: Word prediction and autocorrect.
- **IP routing**: Longest prefix matching in routers.
- **Spell checkers and dictionaries**.

## Rate Limiting Algorithms
- **Twitter**: Limits tweets to 300 per 3 hours, API calls.
- **Amazon, Stripe**: Token bucket for API throttling to protect backend services.
- **Netflix, Uber**: Prevent overload from clients, DDoS mitigation, fair usage.
- Common algos in production: Token Bucket (bursts allowed), Sliding Window Counter (accurate), Leaky Bucket (smooth output).

## LRU / LFU Caches
- **Redis**: LRU as default eviction policy (volatile-lru, allkeys-lru).
- **Memcached**: LRU eviction.
- **Browser caches, CDNs (Cloudflare, Akamai)**: LRU for resource eviction.
- **Database buffer pools** (PostgreSQL, MySQL): Variants of LRU for page caching.
- **Application level**: Many services use LRU for in-memory object caches.

## Disjoint Set (Union-Find)
- **Kruskal’s MST**: In network design, cable laying, clustering.
- **Image segmentation**: Felzenszwalb-Huttenlocher algorithm (computer vision preprocessing).
- **Network connectivity**: Dynamic union of components in social graphs or infrastructure.
- **Clustering algorithms** in ML.

## Quadtree / KD Tree / R-Tree
- **Games**: Quadtrees for collision detection and frustum culling (Unity, custom engines).
- **GIS / Maps**: R-Trees for spatial indexes in PostGIS, MongoDB geospatial.
- **ML / Nearest Neighbors**: KD Trees for fast kNN in low dimensions (scikit-learn uses variants).
- **Graphics**: Octrees (3D quad) for voxel engines and ray tracing acceleration.

Sources: Official blogs (Netflix Tech Blog, Redis docs), kernel source, database source code (Cassandra, DynamoDB), research papers, system design resources, and production engineering posts.

These are not hypothetical — they power the systems you use daily.