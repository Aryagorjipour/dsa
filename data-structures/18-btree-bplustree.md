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

## Operations & Complexity

| Operation     | Time (node accesses) | Notes |
|---------------|----------------------|-------|
| Search        | O(log_m n)           | Very shallow tree |
| Insert        | O(log_m n)           | May split nodes |
| Delete        | O(log_m n)           | May merge nodes |
| Range scan    | O(log_m n + k)       | k = result size; leaf links help |

## Educational In-Memory B+ Tree

The implementation below is a **simplified educational version** for learning. It runs entirely in memory with no WAL, no page management, and no crash recovery. Production database B+ trees (PostgreSQL, InnoDB, SQLite) add write-ahead logging, latch coupling, and buffer pool management — do not use this code in production.

### Complete Implementation (C#)

```csharp
public class BPlusTree {
    private const int Order = 4; // max keys per node
    private BPlusNode _root;

    private abstract class BPlusNode {
        public List<int> Keys = new();
    }

    private sealed class InternalNode : BPlusNode {
        public List<BPlusNode> Children = new();
    }

    private sealed class LeafNode : BPlusNode {
        public List<int> Values = new();
        public LeafNode? Next;
    }

    public BPlusTree() {
        _root = new LeafNode();
    }

    public bool Search(int key) {
        var leaf = FindLeaf(key);
        return leaf.Keys.BinarySearch(key) >= 0;
    }

    public void Insert(int key, int value) {
        if (_root.Keys.Count == Order - 1) {
            var newRoot = new InternalNode();
            newRoot.Children.Add(_root);
            SplitChild(newRoot, 0);
            _root = newRoot;
        }
        InsertNonFull(_root, key, value);
    }

    public List<int> RangeQuery(int low, int high) {
        var result = new List<int>();
        var leaf = FindLeaf(low);
        while (leaf != null) {
            for (int i = 0; i < leaf.Keys.Count; i++) {
                if (leaf.Keys[i] >= low && leaf.Keys[i] <= high) {
                    result.Add(((LeafNode)leaf).Values[i]);
                }
                if (leaf.Keys[i] > high) return result;
            }
            leaf = ((LeafNode)leaf).Next;
        }
        return result;
    }

    private LeafNode FindLeaf(int key) {
        BPlusNode node = _root;
        while (node is InternalNode internal) {
            int i = 0;
            while (i < internal.Keys.Count && key >= internal.Keys[i]) i++;
            node = internal.Children[i];
        }
        return (LeafNode)node;
    }

    private void InsertNonFull(BPlusNode node, int key, int value) {
        if (node is LeafNode leaf) {
            int idx = leaf.Keys.BinarySearch(key);
            if (idx < 0) idx = ~idx;
            leaf.Keys.Insert(idx, key);
            leaf.Values.Insert(idx, value);
            return;
        }
        var internal = (InternalNode)node;
        int i = internal.Keys.Count - 1;
        while (i >= 0 && key < internal.Keys[i]) i--;
        i++;
        if (internal.Children[i].Keys.Count == Order - 1) {
            SplitChild(internal, i);
            if (key > internal.Keys[i]) i++;
        }
        InsertNonFull(internal.Children[i], key, value);
    }

    private void SplitChild(InternalNode parent, int idx) {
        BPlusNode full = parent.Children[idx];
        var newNode = full is LeafNode ? (BPlusNode)new LeafNode() : new InternalNode();
        int mid = (Order - 1) / 2;

        if (full is LeafNode fullLeaf && newNode is LeafNode newLeaf) {
            for (int j = mid; j < fullLeaf.Keys.Count; j++) {
                newLeaf.Keys.Add(fullLeaf.Keys[j]);
                newLeaf.Values.Add(fullLeaf.Values[j]);
            }
            fullLeaf.Keys.RemoveRange(mid, fullLeaf.Keys.Count - mid);
            fullLeaf.Values.RemoveRange(mid, fullLeaf.Values.Count - mid);
            newLeaf.Next = fullLeaf.Next;
            fullLeaf.Next = newLeaf;
            parent.Keys.Insert(idx, newLeaf.Keys[0]);
            parent.Children.Insert(idx + 1, newLeaf);
        } else {
            var fullInternal = (InternalNode)full;
            var newInternal = (InternalNode)newNode;
            int promote = fullInternal.Keys[mid];
            for (int j = mid + 1; j < fullInternal.Keys.Count; j++) {
                newInternal.Keys.Add(fullInternal.Keys[j]);
                newInternal.Children.Add(fullInternal.Children[j]);
            }
            newInternal.Children.Add(fullInternal.Children[^1]);
            fullInternal.Keys.RemoveRange(mid, fullInternal.Keys.Count - mid);
            fullInternal.Children.RemoveRange(mid + 1, fullInternal.Children.Count - mid - 1);
            parent.Keys.Insert(idx, promote);
            parent.Children.Insert(idx + 1, newInternal);
        }
    }
}
```

### Complete Implementation (Go)

```go
import "sort"

const bPlusOrder = 4

type leafNode struct {
    keys, values []int
    next         *leafNode
}

type internalNode struct {
    keys     []int
    children []node
}

type node interface {
    isNode()
}

func (*leafNode) isNode()     {}
func (*internalNode) isNode() {}

type BPlusTree struct {
    root node
}

func NewBPlusTree() *BPlusTree {
    return &BPlusTree{root: &leafNode{}}
}

func (t *BPlusTree) Search(key int) bool {
    leaf := t.findLeaf(key)
    _, ok := t.indexOf(leaf.keys, key)
    return ok
}

func (t *BPlusTree) Insert(key, value int) {
    if len(t.rootKeys()) == bPlusOrder-1 {
        newRoot := &internalNode{children: []node{t.root}}
        t.splitChild(newRoot, 0)
        t.root = newRoot
    }
    t.insertNonFull(t.root, key, value)
}

func (t *BPlusTree) RangeQuery(low, high int) []int {
    var result []int
    leaf := t.findLeaf(low)
    for leaf != nil {
        for i, k := range leaf.keys {
            if k >= low && k <= high {
                result = append(result, leaf.values[i])
            }
            if k > high {
                return result
            }
        }
        leaf = leaf.next
    }
    return result
}

func (t *BPlusTree) rootKeys() []int {
    switch n := t.root.(type) {
    case *leafNode:
        return n.keys
    case *internalNode:
        return n.keys
    }
    return nil
}

func (t *BPlusTree) findLeaf(key int) *leafNode {
    n := t.root
    for {
        switch cur := n.(type) {
        case *leafNode:
            return cur
        case *internalNode:
            i := 0
            for i < len(cur.keys) && key >= cur.keys[i] {
                i++
            }
            n = cur.children[i]
        }
    }
}

func (t *BPlusTree) insertNonFull(n node, key, value int) {
    switch cur := n.(type) {
    case *leafNode:
        i := sort.SearchInts(cur.keys, key)
        cur.keys = insertInt(cur.keys, i, key)
        cur.values = insertInt(cur.values, i, value)
    case *internalNode:
        i := len(cur.keys) - 1
        for i >= 0 && key < cur.keys[i] {
            i--
        }
        i++
        if childKeys(cur.children[i]) == bPlusOrder-1 {
            t.splitChild(cur, i)
            if key > cur.keys[i] {
                i++
            }
        }
        t.insertNonFull(cur.children[i], key, value)
    }
}

func (t *BPlusTree) splitChild(parent *internalNode, idx int) {
    full := parent.children[idx]
    mid := (bPlusOrder - 1) / 2

    switch f := full.(type) {
    case *leafNode:
        newLeaf := &leafNode{
            keys:   append([]int{}, f.keys[mid:]...),
            values: append([]int{}, f.values[mid:]...),
        }
        f.keys = f.keys[:mid]
        f.values = f.values[:mid]
        newLeaf.next = f.next
        f.next = newLeaf
        parent.keys = insertInt(parent.keys, idx, newLeaf.keys[0])
        parent.children = insertNode(parent.children, idx+1, newLeaf)
    case *internalNode:
        promote := f.keys[mid]
        newInternal := &internalNode{
            keys:     append([]int{}, f.keys[mid+1:]...),
            children: append([]node{}, f.children[mid+1:]...),
        }
        f.keys = f.keys[:mid]
        f.children = f.children[:mid+1]
        parent.keys = insertInt(parent.keys, idx, promote)
        parent.children = insertNode(parent.children, idx+1, newInternal)
    }
}

func childKeys(n node) int {
    switch v := n.(type) {
    case *leafNode:
        return len(v.keys)
    case *internalNode:
        return len(v.keys)
    }
    return 0
}

func (t *BPlusTree) indexOf(keys []int, key int) (int, bool) {
    for i, k := range keys {
        if k == key {
            return i, true
        }
    }
    return -1, false
}

func insertInt(s []int, i, v int) []int {
    s = append(s, 0)
    copy(s[i+1:], s[i:])
    s[i] = v
    return s
}

func insertNode(s []node, i int, v node) []node {
    s = append(s, nil)
    copy(s[i+1:], s[i:])
    s[i] = v
    return s
}
```

> **Note:** This is an educational in-memory B+ tree. It does not implement WAL, page caching, or crash recovery. Real storage engines spend thousands of engineering hours on those concerns.

## Real World — This Is Everywhere

### 1. Relational Databases

- **PostgreSQL**: B+ tree indexes (plus GIN, GiST, BRIN for special cases)
- **MySQL InnoDB**: Clustered index and secondary indexes are B+ trees
- **SQLite**: Everything is B+ trees

### 2. File Systems

- NTFS, APFS, XFS, ext4 use B+ tree or B-tree variants

### 3. Key-Value Stores

- LevelDB / RocksDB: LSM trees with B+ tree-like block indexes
- BoltDB, LMDB: B+ trees or B-trees

## Comparison With Other Trees

| Structure     | Best For                  | On Disk? | Range Queries | Height |
|---------------|---------------------------|----------|---------------|--------|
| Red-Black     | In-memory ordered map     | No       | OK            | ~2 log n |
| B-Tree        | General purpose           | Yes      | Good          | Very low |
| B+ Tree       | Databases, filesystems    | Yes      | Excellent     | Very low |
| Skip List     | Some in-memory DBs (Redis)| No       | Good          | ~log n |

## Summary

B-Trees and especially B+ Trees are the data structure that makes modern databases and file systems possible.

They are the reason you can have a table with 50 million rows and still do a lookup or range scan in milliseconds.

If you understand B+ trees deeply, you will understand a huge portion of how databases actually work under the hood.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Persistent Key-Value Store](/projects/tier-3/11-key-value-store) — B+ Tree pages, WAL, and Bloom-filtered lookups.
:::

**Next:** [19 - Skip List](19-skip-list.md)