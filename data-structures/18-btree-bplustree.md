# 18 - B-Tree and B+ Tree

## Why B-Trees Exist

All the trees we discussed so far (BST, Red-Black, etc.) are great in memory.

When data lives on **disk** (databases, file systems), random access is extremely expensive.

B-Trees were invented to minimize the number of disk reads.

Key idea: Make nodes **very wide** (hundreds or thousands of keys per node) so that one disk read brings in a lot of data.

## Definition of B-Tree

A B-Tree of order `m` has these properties:

- Every node has at most `m` children.
- Every internal node (except root) has at least `⌈m/2⌉` children.
- The root has at least 2 children (if not a leaf).
- All leaves are at the same level.
- A non-leaf node with `k` keys has `k+1` children.

This guarantees the tree stays **short and wide**.

## B+ Tree (What Databases Actually Use)

B+ Tree is a variant of B-Tree with two crucial differences:

1. **All values are stored only in the leaves**.
2. **Leaf nodes are linked** together (usually as a doubly linked list).

This gives two huge advantages:
- Excellent range query performance (just walk the leaf linked list).
- All data lives at the same level → predictable performance.

Internal nodes only contain **keys for navigation** (indexes).

## Visual Intuition (B+ Tree)

![B+ Tree](/images/bplus-tree.png)

```
          [  50  ]
     /             \
[  20  35 ]     [  60  80 ]
 /   |   \       /   |   \
L1  L2  L3     L4  L5  L6
```

Leaves (L1, L2...) contain the actual records or pointers to records, and are linked left-to-right.

## Why This Design Wins on Disk

Disks (even SSDs) read in **pages** (usually 4KB–16KB).

A B+ tree node is usually sized to fit in one or a few pages.

A single disk read can bring in a node with 100–1000 keys.

Height of the tree for millions or billions of rows is usually 3–5.

That means most lookups need only 3–5 disk I/Os.

## Operations

All major operations (search, insert, delete, range) are O(log n) in terms of **node accesses**.

Because nodes are wide, the constant is tiny.

## Real World — This Is Everywhere

### 1. Relational Databases (The Dominant Use)

- **PostgreSQL**: All indexes are B+ trees (except some special types like GIN, GiST, BRIN)
- **MySQL InnoDB**: Clustered index and all secondary indexes are B+ trees
- **SQLite**: Everything is B+ trees
- **Oracle, SQL Server, DB2**: Same story

The table data itself in InnoDB is stored in a B+ tree (clustered index).

### 2. File Systems

- NTFS (Microsoft)
- APFS (Apple)
- XFS, ext4 (Linux) use B+ trees or B-tree variants for directories and extents
- ZFS uses a different but related tree structure (Merkle + B+ like)

### 3. Key-Value Stores

- LevelDB / RocksDB: Use LSM trees, but the on-disk SSTables often use B+ tree-like block indexes
- Many embedded databases (BoltDB, LMDB) use B+ trees or B-trees

### 4. NoSQL

- MongoDB uses B+ trees for its WiredTiger storage engine indexes
- Cassandra uses B+ tree-like structures in some components

### 5. Operating Systems

Many modern filesystems and even some memory managers use variants.

## In-Memory B+ Trees

Some systems use B+ trees in memory when they want excellent range query + ordered iteration performance (better cache behavior than red-black trees for sequential access in some cases).

## Comparison With Other Trees

| Structure     | Best For                  | On Disk? | Range Queries | Height |
|---------------|---------------------------|----------|---------------|--------|
| Red-Black     | In-memory ordered map     | No       | OK            | ~2 log n |
| B-Tree        | General purpose           | Yes      | Good          | Very low |
| B+ Tree       | Databases, filesystems    | Yes      | Excellent     | Very low |
| Skip List     | Some in-memory DBs (Redis)| No       | Good          | ~log n |

## Insertion and Splitting (High Level)

When a node becomes too full during insert:
1. Split the node into two.
2. Promote the middle key up to the parent.
3. If parent is full, split it too (can propagate all the way to root, creating a new root).

This is why B+ trees stay balanced.

Deletion can cause merging of nodes.

These operations are complex but well understood. Production implementations are extremely optimized and battle-tested.

## Why You Almost Never Implement This Yourself

Implementing a correct, high-performance, crash-safe B+ tree is **very hard**.

You need to handle:
- Node splitting/merging
- Logging / WAL for durability
- Concurrency (latches, lock coupling, or MVCC)
- Page management
- Recovery after crash

This is why database engineers treat storage engines as some of the hardest code in existence.

Most application developers just use PostgreSQL or SQLite and get B+ trees for free.

## Educational Value

Understanding B+ trees explains:
- Why adding an index makes some queries faster
- Why range scans are fast on indexed columns
- Why primary key choice matters (clustered index)
- Why random inserts can cause index fragmentation
- Why "covering indexes" are a thing

## Summary

B-Trees and especially B+ Trees are the data structure that makes modern databases and file systems possible.

They are the reason you can have a table with 50 million rows and still do a lookup or range scan in milliseconds.

If you understand B+ trees deeply, you will understand a huge portion of how databases actually work under the hood.


::: tip Project Lab
**Build it yourself:** [Persistent Key-Value Store](/projects/tier-3/11-key-value-store) — B+ Tree pages, WAL, and Bloom-filtered lookups.
:::

**Next:** [19 - Skip List](19-skip-list.md)
