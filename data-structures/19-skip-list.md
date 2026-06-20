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

This is exactly what Redis uses Skip Lists for in Sorted Sets (ZADD, ZRANGE, ZRANK).

Plain BST would work but is harder to make concurrent. Skip Lists are simpler and perform well.

Search starts at the highest level and drops down when needed. Average O(log n).

## How the Magic Happens (Probabilistic)

When inserting a node, we flip a coin to decide its height:

- 50% chance height 1
- 25% chance height 2
- 12.5% chance height 3
- etc.

With proper constants, the expected height is logarithmic, and search/insert/delete are O(log n) expected.

Because it's probabilistic, there is no complex rebalancing code like red-black trees.

## Operations & Complexity

| Operation | Expected | Worst (rare) | Space |
|-----------|----------|--------------|-------|
| Search    | O(log n) | O(n)         | O(n) avg |
| Insert    | O(log n) | O(n)         | O(n) avg |
| Delete    | O(log n) | O(n)         | O(n) avg |
| Range     | O(log n + k) | O(n)     | k = result size |

## Complete Implementation (Go)

Based on `examples/go/skip_list_basic.go`, expanded with search and delete.

```go
import "math/rand"

type SkipListNode struct {
    key     int
    value   any
    forward []*SkipListNode
}

type SkipList struct {
    header *SkipListNode
    level  int
    maxLvl int
}

func NewSkipList() *SkipList {
    const maxLevel = 16
    return &SkipList{
        header: &SkipListNode{forward: make([]*SkipListNode, maxLevel)},
        maxLvl: maxLevel,
    }
}

func randomLevel() int {
    level := 0
    for rand.Float32() < 0.5 && level < 15 {
        level++
    }
    return level
}

func (sl *SkipList) Search(key int) (any, bool) {
    x := sl.header
    for i := sl.level; i >= 0; i-- {
        for x.forward[i] != nil && x.forward[i].key < key {
            x = x.forward[i]
        }
    }
    x = x.forward[0]
    if x != nil && x.key == key {
        return x.value, true
    }
    return nil, false
}

func (sl *SkipList) Insert(key int, value any) {
    update := make([]*SkipListNode, sl.maxLvl)
    x := sl.header

    for i := sl.level; i >= 0; i-- {
        for x.forward[i] != nil && x.forward[i].key < key {
            x = x.forward[i]
        }
        update[i] = x
    }

    x = x.forward[0]
    if x != nil && x.key == key {
        x.value = value
        return
    }

    lvl := randomLevel()
    if lvl > sl.level {
        for i := sl.level + 1; i <= lvl; i++ {
            update[i] = sl.header
        }
        sl.level = lvl
    }

    newNode := &SkipListNode{key: key, value: value, forward: make([]*SkipListNode, lvl+1)}
    for i := 0; i <= lvl; i++ {
        newNode.forward[i] = update[i].forward[i]
        update[i].forward[i] = newNode
    }
}

func (sl *SkipList) Delete(key int) bool {
    update := make([]*SkipListNode, sl.maxLvl)
    x := sl.header

    for i := sl.level; i >= 0; i-- {
        for x.forward[i] != nil && x.forward[i].key < key {
            x = x.forward[i]
        }
        update[i] = x
    }

    x = x.forward[0]
    if x == nil || x.key != key {
        return false
    }

    for i := 0; i <= sl.level; i++ {
        if update[i].forward[i] != x {
            break
        }
        update[i].forward[i] = x.forward[i]
    }

    for sl.level > 0 && sl.header.forward[sl.level] == nil {
        sl.level--
    }
    return true
}

func (sl *SkipList) Range(low, high int) []int {
    var result []int
    x := sl.header.forward[0]
    for x != nil && x.key < low {
        x = x.forward[0]
    }
    for x != nil && x.key <= high {
        result = append(result, x.key)
        x = x.forward[0]
    }
    return result
}
```

## Complete Implementation (C#)

```csharp
public class SkipList {
    private const int MaxLevel = 16;
    private readonly SkipListNode _header = new(MaxLevel);
    private int _level;
    private readonly Random _rng = new();

    private class SkipListNode {
        public int Key;
        public object? Value;
        public SkipListNode?[] Forward;

        public SkipListNode(int level) {
            Forward = new SkipListNode?[level + 1];
        }
    }

    public bool TryGet(int key, out object? value) {
        var x = _header;
        for (int i = _level; i >= 0; i--) {
            while (x.Forward[i] != null && x.Forward[i]!.Key < key) {
                x = x.Forward[i]!;
            }
        }
        x = x.Forward[0]!;
        if (x != null && x.Key == key) {
            value = x.Value;
            return true;
        }
        value = null;
        return false;
    }

    public void Insert(int key, object? value) {
        var update = new SkipListNode?[MaxLevel];
        var x = _header;

        for (int i = _level; i >= 0; i--) {
            while (x.Forward[i] != null && x.Forward[i]!.Key < key) {
                x = x.Forward[i]!;
            }
            update[i] = x;
        }

        x = x.Forward[0]!;
        if (x != null && x.Key == key) {
            x.Value = value;
            return;
        }

        int lvl = RandomLevel();
        if (lvl > _level) {
            for (int i = _level + 1; i <= lvl; i++) {
                update[i] = _header;
            }
            _level = lvl;
        }

        var newNode = new SkipListNode(lvl) { Key = key, Value = value };
        for (int i = 0; i <= lvl; i++) {
            newNode.Forward[i] = update[i]!.Forward[i];
            update[i]!.Forward[i] = newNode;
        }
    }

    public bool Delete(int key) {
        var update = new SkipListNode?[MaxLevel];
        var x = _header;

        for (int i = _level; i >= 0; i--) {
            while (x.Forward[i] != null && x.Forward[i]!.Key < key) {
                x = x.Forward[i]!;
            }
            update[i] = x;
        }

        x = x.Forward[0]!;
        if (x == null || x.Key != key) return false;

        for (int i = 0; i <= _level; i++) {
            if (update[i]!.Forward[i] != x) break;
            update[i]!.Forward[i] = x.Forward[i];
        }

        while (_level > 0 && _header.Forward[_level] == null) {
            _level--;
        }
        return true;
    }

    private int RandomLevel() {
        int level = 0;
        while (_rng.NextDouble() < 0.5 && level < MaxLevel - 1) {
            level++;
        }
        return level;
    }
}
```

## Real World Use

### 1. Redis Sorted Sets

Redis sorted sets (`ZSET`) combine a hash table (O(1) member → score) with a skip list (ordered by score).

### 2. LevelDB / RocksDB MemTable

The in-memory write buffer in LSM-tree storage engines is a skip list.

### 3. Other Databases

Apache Cassandra, CockroachDB, and various custom key-value stores use skip lists.

## Pros and Cons vs Balanced Trees

| Feature              | Skip List        | Red-Black Tree |
|----------------------|------------------|----------------|
| Implementation       | Simpler          | More complex   |
| Concurrency          | Easier           | Harder         |
| Worst case           | O(n) (rare)      | O(log n)       |
| Memory per element   | Higher           | Lower          |
| Range iteration      | Excellent        | Good           |

## Summary

Skip lists are one of the most beautiful "probabilistic" data structures that crossed over into heavy real-world production use (especially thanks to Redis and LSM storage engines).

They prove that sometimes "good enough with high probability + much simpler code" wins over "perfectly balanced with more complex code".

::: tip Project Lab
**Build it yourself:** [Persistent Key-Value Store](/projects/tier-3/11-key-value-store)
:::

**Next:** [20 - Segment Tree](20-segment-tree.md)