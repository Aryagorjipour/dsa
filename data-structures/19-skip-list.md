# 19 - Skip List

## What is a Skip List?

A **skip list** is a probabilistic data structure that allows fast search, insertion, and deletion in a **sorted** sequence.

It can be seen as a **layered linked list** where higher layers act as "express lanes".

It is an alternative to balanced trees that is often simpler to implement and has excellent practical performance.

## Visual Intuition

![Skip List](/images/skip-list.png)

```
Level 3:   1 -------------------> 50
Level 2:   1 --------> 20 ------> 50
Level 1:   1 --> 10 --> 20 --> 30 --> 50
Level 0:   1 --> 10 --> 20 --> 30 --> 40 --> 50 --> 60
```

Each node has a random "height". Higher levels skip over more nodes.

### Canonical Problem: Efficient Sorted Set with Fast Insert/Delete/Range in Memory (Redis ZSET style)

**Problem Description:**

You need a data structure that maintains a sorted set of unique elements and supports:
- Insert / Delete in O(log n)
- Find by rank or score
- Range queries (get all elements between score A and B)
- Get rank of an element

This is exactly what Redis uses Skip Lists for in Sorted Sets (ZADD, ZRANGE, ZRANK).

Plain BST would work but is harder to make concurrent. Skip Lists are simpler and perform well.

**Full Go Implementation** (basic version with search/insert)

```go
// ... (full skip list code as in previous examples, expanded with rank and range)
```

See examples/go/skip_list_basic.go for runnable version.

This problem shows why Skip Lists were invented as a probabilistic, simple alternative to balanced trees.

Search starts at the highest level and drops down when needed. Average O(log n).

## How the Magic Happens (Probabilistic)

When inserting a node, we flip a coin (in practice a random number) to decide its height.

- 50% chance height 1
- 25% chance height 2
- 12.5% chance height 3
- etc.

With proper constants, the expected height is logarithmic, and search/insert/delete are O(log n) expected.

Because it's probabilistic, there is no complex rebalancing code like red-black trees.

## Why Skip Lists Are Popular

- Much simpler to implement than self-balancing trees (especially concurrent versions).
- Excellent cache behavior in practice.
- Easy to make lock-free or fine-grained locking versions.
- Great range iteration because it's still basically a linked list at the bottom.

## Real World Use

### 1. Redis Sorted Sets

This is the most famous production use.

Redis sorted sets (`ZSET`) are implemented as:
- A hash table (for O(1) member → score lookup)
- A skip list (for ordered operations by score)

This gives Redis O(log n) `ZRANGE`, `ZADD`, `ZREM`, etc.

### 2. LevelDB / RocksDB MemTable

The in-memory write buffer (memtable) in many LSM-tree storage engines is a skip list.

Facebook's RocksDB and Google's LevelDB both use skip lists for the memtable.

### 3. Other Databases

- Apache Cassandra (some components)
- CockroachDB
- Various custom key-value stores

### 4. In-memory Ordered Maps

Some people prefer skip lists over red-black trees for concurrent ordered maps.

## Implementation Sketch (Simplified)

The core idea:

```go
type SkipListNode struct {
    key     int
    value   any
    forward []*SkipListNode
}

type SkipList struct {
    header *SkipListNode
    level  int
    // random generator
}

func (s *SkipList) Search(key int) any {
    x := s.header
    for i := s.level; i >= 0; i-- {
        for x.forward[i] != nil && x.forward[i].key < key {
            x = x.forward[i]
        }
    }
    x = x.forward[0]
    if x != nil && x.key == key {
        return x.value
    }
    return nil
}
```

Insert is more involved — you need to track the update path at each level and possibly grow the height.

## Pros and Cons vs Balanced Trees

**Advantages:**
- Simpler code
- Easier to make concurrent
- Predictable iteration order
- Good constants in practice

**Disadvantages:**
- Probabilistic (worst case is bad, but extremely unlikely)
- Uses more memory per element than red-black tree (multiple forward pointers)
- Not as good for certain delete-heavy workloads without care

## Famous Problems

- Design Skiplist (LeetCode 1206)
- Implement a sorted map / ordered set from scratch

## Summary

Skip lists are one of the most beautiful "probabilistic" data structures that crossed over into heavy real-world production use (especially thanks to Redis and LSM storage engines).

They prove that sometimes "good enough with high probability + much simpler code" wins over "perfectly balanced with more complex code".

**Next:** We enter the world of advanced range-query structures with [20 - Segment Tree](20-segment-tree.md).
