# 23 - Self-Balancing Trees Operations (Red-Black & AVL)

## The Problem

Plain BSTs skew to O(n) height. Self-balancing trees maintain O(log n) through rotations and recoloring (red-black) or height checks (AVL).

### Canonical Problem: Order Statistic — Select K-th Smallest in O(log n)

Augment each node with subtree size. After insert/delete with balancing, `Select(k)` walks using sizes without full inorder traversal.

## Operations & Complexity

| Operation | Red-Black | AVL |
|-----------|-----------|-----|
| Search | O(log n) | O(log n) |
| Insert | O(log n) | O(log n) |
| Delete | O(log n) | O(log n) |
| Select k-th | O(log n) with augmentation | O(log n) |

## Rotations (shared by RB and AVL)

### C#

```csharp
static TreeNode RightRotate(TreeNode y) {
    var x = y.Left!;
    y.Left = x.Right;
    x.Right = y;
    return x;
}

static TreeNode LeftRotate(TreeNode x) {
    var y = x.Right!;
    x.Right = y.Left;
    y.Left = x;
    return y;
}
```

### Go

```go
func rightRotate(y *TreeNode) *TreeNode {
    x := y.Left
    y.Left = x.Right
    x.Right = y
    return x
}

func leftRotate(x *TreeNode) *TreeNode {
    y := x.Right
    x.Right = y.Left
    y.Left = x
    return x
}
```

## Order Statistic Select (augmented BST)

### C#

```csharp
public class AugNode {
    public int Val;
    public AugNode? Left, Right;
    public int Size = 1;
}

public static int Select(AugNode? root, int k) {
    if (root == null) return -1;
    int leftSize = root.Left?.Size ?? 0;
    if (k == leftSize + 1) return root.Val;
    if (k <= leftSize) return Select(root.Left, k);
    return Select(root.Right, k - leftSize - 1);
}
```

### Go

```go
type AugNode struct {
    Val        int
    Left, Right *AugNode
    Size       int
}

func selectK(root *AugNode, k int) int {
    if root == nil {
        return -1
    }
    leftSize := 0
    if root.Left != nil {
        leftSize = root.Left.Size
    }
    if k == leftSize+1 {
        return root.Val
    }
    if k <= leftSize {
        return selectK(root.Left, k)
    }
    return selectK(root.Right, k-leftSize-1)
}
```

Full insert/delete with red-black fixup is in [14 - Red-Black Tree](../data-structures/14-red-black-tree.md). Practice applying rotations after every BST mutation.

## Real World

- .NET `SortedSet<T>` / Java `TreeMap` — red-black trees
- Linux kernel `rbtree` — scheduling, VMAs
- Database in-memory indexes before flushing to B+ trees

## Summary

Self-balancing tree operations are BST operations plus invariant restoration. Augment nodes for order statistics and range queries.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [In-Memory Database Index](/projects/tier-3/10-in-memory-db-index) — plain BST to red-black tree.
:::

**Next:** [24 - Trie Operations](24-trie-operations.md)