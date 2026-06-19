# 00 - What is a Data Structure? How Do You Actually Use One?

## The Simple Truth (No Jargon First)

A **data structure** is just a way to organize and store data in your computer's memory so you can do useful things with it efficiently.

Think of it like this:

- A shoebox is a data structure.
- A filing cabinet with labeled folders is a data structure.
- Your Spotify playlist (ordered, you can add/remove/skip) is a data structure.
- The contact list in your phone (you search by name, not by scanning every contact every time) is a data structure.

The computer doesn't "know" what a list or a map is until you (or the language runtime) tell it how to store the data and what operations are fast or slow.

**Data structure = organized storage + rules for accessing/changing it + performance characteristics.**

## Why This Matters in Real Life (Daily Routine Edition)

Every single day as a developer you make unconscious data structure decisions:

```csharp
// This choice is a data structure decision
var users = new List<User>();           // Dynamic array
var userLookup = new Dictionary<int, User>(); // Hash map
var recentPages = new Queue<string>(10);      // Queue with limit
```

```go
users := []User{}                    // Go slice = dynamic array
userLookup := make(map[int]User)     // Go map = hash map
```

If you use the wrong one, your app is slow or uses too much memory. Sometimes it even crashes under load.

Real example from actual products:
- Twitter used to (and still does in parts) keep your home timeline in memory using carefully chosen structures because scanning a linked list of 500 tweets for every user would melt servers.
- Chrome's V8 engine uses hidden classes + specific array representations (contiguous for "fast elements") because arrays are everywhere in JS.

## The Core Idea: Tradeoffs

There is almost never a "best" data structure. There are only tradeoffs:

| Want this...                    | ...you usually pay with          | Common structure       |
|---------------------------------|----------------------------------|------------------------|
| Fast lookup by key (username)   | More memory + no order           | Hash map               |
| Fast insert at beginning        | Slow random access               | Linked list            |
| Fast min/max extraction         | Slower inserts sometimes         | Heap / Priority Queue  |
| Keep things sorted              | Insert cost                      | Tree (BST, Red-Black) or sorted array |
| Range queries ("sales between Jan-Mar") | More complex code         | Segment tree, B+ tree  |
| Unique items only               | Extra memory                     | Hash set               |
| Never lose recent data          | Old data disappears              | Ring buffer            |

## Anatomy of a Data Structure

Every data structure has these parts:

1. **Storage / Representation** — How bytes live in memory.
   - Contiguous block (array)
   - Nodes pointing to other nodes (linked structures)
   - Hash table buckets

2. **Operations** — What you can do:
   - Add / Insert
   - Remove / Delete
   - Find / Search / Get
   - Update
   - Traverse / Iterate

3. **Complexity guarantees** — How fast each operation is in best / average / worst case.
   - This is where Big O comes in (we'll cover it properly).

4. **Invariants** — Rules that must always be true.
   - In a sorted array: elements are always in order.
   - In a binary search tree: left < node < right.
   - Break the invariant = structure becomes useless.

## Where Data Structures Actually Live

### In Your Programming Language

**C# / .NET:**

```csharp
// These are all data structures under the hood
int[] numbers = new int[5];                    // Array
List<int> list = new();                        // Dynamic array (resizable array)
LinkedList<int> linked = new();                // Doubly linked list
Dictionary<string, int> dict = new();          // Hash map
HashSet<string> set = new();                   // Hash set
Queue<int> q = new();                          // Queue (uses array + head/tail)
Stack<int> s = new();                          // Stack
SortedSet<int> sorted = new();                 // Red-black tree
PriorityQueue<string, int> pq = new();         // Binary heap
```

.NET even exposes `System.Collections.Concurrent` versions that are thread-safe using clever internal structures.

**Go:**

```go
arr := [5]int{}           // Fixed array
slice := []int{1, 2, 3}   // Slice = header + dynamic array under the hood
m := make(map[string]int) // Hash map (runtime uses Swiss table style in modern Go)
var list list.List        // container/list = doubly linked list
```

Go's `container/heap`, `container/ring`, and `container/list` are also there when you need them.

### In Real Applications and Tools

- **Databases**
  - Tables and indexes → B+ trees or B-trees (PostgreSQL, MySQL InnoDB, SQLite)
  - Write-ahead logs and memtables → often skip lists (RocksDB) or balanced trees
  - Full-text search → inverted indexes (often tries + posting lists)

- **Caches**
  - LRU cache in Redis, Varnish, CDN edge nodes, browser caches
  - LFU in some database buffer pools

- **Compilers & Runtimes**
  - Symbol tables → hash maps + tries
  - Abstract Syntax Trees (AST) → tree structures
  - Register allocation → graph coloring

- **Operating Systems**
  - Process scheduling → red-black trees (Linux CFS uses rb-tree)
  - Virtual memory page tables, file system inodes

- **Web Browsers**
  - DOM tree
  - Render tree
  - History + cache structures (LRU)
  - Text editor buffers (gap buffer in many)

- **Distributed Systems**
  - Consistent hashing rings (for sharding)
  - Merkle trees for data synchronization (BitTorrent, IPFS, Git, Cassandra anti-entropy)
  - HyperLogLog and Count-Min Sketch for massive cardinality and frequency counting at companies like Google, Twitter, Meta

- **Games**
  - Spatial partitioning: Quadtrees, KD-trees, R-trees for "which objects are near the player?"
  - Pathfinding graphs for AI

## How to Think About Choosing One (Daily Routine)

Ask these questions in order:

1. **What operations do I need to be fast?**
   - Read by key? Insert often? Get min/max? Range queries? Delete arbitrary?

2. **How much data?**
   - 100 items? Use whatever. 10 million? Structure choice becomes critical.

3. **Concurrency?**
   - Single threaded? Concurrent reads? Heavy writes?

4. **Memory budget?**
   - Can I afford 2x memory for speed?

5. **Do I need order?**
   - Insertion order? Sorted order? Neither?

Example real decision:

> "I need to track the last 1000 requests per user for rate limiting, and check if a specific request ID was seen recently."

Bad: Keep a `List` and scan every time → O(n) per check.

Good: `HashSet` per user for recent IDs + a `Queue` or `LinkedList` to evict old ones when exceeding 1000 → O(1) check.

Or even better: a proper **LRU cache** or **ring buffer** + hash.

## Mental Model: "Data Structures Are Promises"

When you pick a data structure, you are making a promise to your future self and your teammates:

> "I promise that `GetById(id)` will be fast."
> "I promise that things will stay sorted."
> "I promise I can get the top 10 cheapest products quickly."

If the promise is broken by your choice, the whole program suffers.

## Coming Up Next

In the next file we will talk about **Algorithms** — the *recipes* that use these data structures to solve problems.

But before that, you must understand the contract every data structure makes: **how expensive are its operations?**

That's why we learn **Big O**.

Ready? Let's go to [fundamentals/01-big-o.md](01-big-o.md) after the algorithm intro, or jump straight if you want.

Actually, read the algorithm thinking one first.

---

**Key takeaway (put this on your wall):**

> A data structure is not "a list" or "a map".  
> It is a **set of guarantees** about time and memory in exchange for certain capabilities.

Master the guarantees, and you will look at code and instantly see the shape of the data underneath.
