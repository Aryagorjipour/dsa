# 21 - BST Operations

## The Problems BST Operations Solve

A plain Binary Search Tree supports ordered data with logarithmic operations when the tree stays reasonably balanced.

These operations are the vocabulary behind in-memory indexes, symbol tables, and ordered statistics — the same ideas scaled up in B+ trees and red-black trees in production databases.

### Canonical Problem 1: Kth Smallest Element in a BST

Given a BST, find the k-th smallest element (1-indexed).

**Why inorder works:** Left → Root → Right visits nodes in sorted order. Walk inorder and count until you hit k.

### Canonical Problem 2: Validate Binary Search Tree

Determine whether a tree satisfies the BST invariant for **all** nodes — not just parent-child pairs. Pass down `(min, max)` bounds as you recurse.

### Canonical Problem 3: Lowest Common Ancestor in a BST

Because of ordering, LCA is O(h): if both targets are smaller, go left; if both larger, go right; otherwise the current node is the LCA.

## Operations & Complexity

| Operation | Average | Worst (skewed) | Notes |
|-----------|---------|----------------|-------|
| Search | O(h) | O(n) | h = height |
| Insert | O(h) | O(n) | Same path as search |
| Delete | O(h) | O(n) | Three cases; two-child uses successor |
| Kth smallest | O(h + k) | O(n) | Inorder with early stop |
| LCA | O(h) | O(n) | Uses BST ordering |
| Floor / Ceil | O(h) | O(n) | Search with last candidate |

## Full Implementation

### C#

```csharp
public class TreeNode {
    public int Val;
    public TreeNode? Left;
    public TreeNode? Right;
    public TreeNode(int val) => Val = val;
}

public static class BSTOps {
    public static int KthSmallest(TreeNode? root, int k) {
        int count = 0;
        int result = -1;
        void Inorder(TreeNode? node) {
            if (node == null || result != -1) return;
            Inorder(node.Left);
            count++;
            if (count == k) {
                result = node.Val;
                return;
            }
            Inorder(node.Right);
        }
        Inorder(root);
        return result;
    }

    public static bool IsValidBST(TreeNode? root) {
        return Validate(root, long.MinValue, long.MaxValue);
    }

    private static bool Validate(TreeNode? node, long min, long max) {
        if (node == null) return true;
        if (node.Val <= min || node.Val >= max) return false;
        return Validate(node.Left, min, node.Val)
            && Validate(node.Right, node.Val, max);
    }

    public static TreeNode? LCA(TreeNode? root, TreeNode p, TreeNode q) {
        if (root == null) return null;
        if (p.Val < root.Val && q.Val < root.Val) return LCA(root.Left, p, q);
        if (p.Val > root.Val && q.Val > root.Val) return LCA(root.Right, p, q);
        return root;
    }

    public static TreeNode Insert(TreeNode? root, int val) {
        if (root == null) return new TreeNode(val);
        if (val < root.Val) root.Left = Insert(root.Left, val);
        else if (val > root.Val) root.Right = Insert(root.Right, val);
        return root;
    }

    public static TreeNode? Delete(TreeNode? root, int val) {
        if (root == null) return null;
        if (val < root.Val) {
            root.Left = Delete(root.Left, val);
        } else if (val > root.Val) {
            root.Right = Delete(root.Right, val);
        } else {
            if (root.Left == null) return root.Right;
            if (root.Right == null) return root.Left;
            TreeNode succ = MinNode(root.Right);
            root.Val = succ.Val;
            root.Right = Delete(root.Right, succ.Val);
        }
        return root;
    }

    private static TreeNode MinNode(TreeNode node) {
        while (node.Left != null) node = node.Left;
        return node;
    }

    public static int? Floor(TreeNode? root, int val) {
        int? floor = null;
        while (root != null) {
            if (root.Val == val) return val;
            if (root.Val < val) {
                floor = root.Val;
                root = root.Right;
            } else {
                root = root.Left;
            }
        }
        return floor;
    }

    public static int? Ceil(TreeNode? root, int val) {
        int? ceil = null;
        while (root != null) {
            if (root.Val == val) return val;
            if (root.Val > val) {
                ceil = root.Val;
                root = root.Left;
            } else {
                root = root.Right;
            }
        }
        return ceil;
    }
}
```

### Go

```go
type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

func KthSmallest(root *TreeNode, k int) int {
    count := 0
    result := -1
    var inorder func(*TreeNode)
    inorder = func(node *TreeNode) {
        if node == nil || result != -1 {
            return
        }
        inorder(node.Left)
        count++
        if count == k {
            result = node.Val
            return
        }
        inorder(node.Right)
    }
    inorder(root)
    return result
}

func IsValidBST(root *TreeNode) bool {
    var validate func(*TreeNode, int64, int64) bool
    validate = func(node *TreeNode, min, max int64) bool {
        if node == nil {
            return true
        }
        if int64(node.Val) <= min || int64(node.Val) >= max {
            return false
        }
        return validate(node.Left, min, int64(node.Val)) &&
            validate(node.Right, int64(node.Val), max)
    }
    return validate(root, math.MinInt64, math.MaxInt64)
}

func LCA(root, p, q *TreeNode) *TreeNode {
    if root == nil {
        return nil
    }
    if p.Val < root.Val && q.Val < root.Val {
        return LCA(root.Left, p, q)
    }
    if p.Val > root.Val && q.Val > root.Val {
        return LCA(root.Right, p, q)
    }
    return root
}

func Insert(root *TreeNode, val int) *TreeNode {
    if root == nil {
        return &TreeNode{Val: val}
    }
    if val < root.Val {
        root.Left = Insert(root.Left, val)
    } else if val > root.Val {
        root.Right = Insert(root.Right, val)
    }
    return root
}

func Delete(root *TreeNode, val int) *TreeNode {
    if root == nil {
        return nil
    }
    if val < root.Val {
        root.Left = Delete(root.Left, val)
    } else if val > root.Val {
        root.Right = Delete(root.Right, val)
    } else {
        if root.Left == nil {
            return root.Right
        }
        if root.Right == nil {
            return root.Left
        }
        succ := minNode(root.Right)
        root.Val = succ.Val
        root.Right = Delete(root.Right, succ.Val)
    }
    return root
}

func minNode(node *TreeNode) *TreeNode {
    for node.Left != nil {
        node = node.Left
    }
    return node
}

func Floor(root *TreeNode, val int) (int, bool) {
    floor, ok := -1, false
    for root != nil {
        if root.Val == val {
            return val, true
        }
        if root.Val < val {
            floor, ok = root.Val, true
            root = root.Right
        } else {
            root = root.Left
        }
    }
    return floor, ok
}

func Ceil(root *TreeNode, val int) (int, bool) {
    ceil, ok := -1, false
    for root != nil {
        if root.Val == val {
            return val, true
        }
        if root.Val > val {
            ceil, ok = root.Val, true
            root = root.Left
        } else {
            root = root.Right
        }
    }
    return ceil, ok
}
```

Add `import "math"` at the top of a real Go file using `IsValidBST`.

## Delete: The Three Cases

1. **No children** — remove the node.
2. **One child** — replace the node with its child.
3. **Two children** — copy the inorder successor (minimum in right subtree), then delete the successor.

This preserves the BST invariant without restructuring the whole tree.

## Real World

- **Compilers** — symbol tables and scoped name lookup historically used tree structures.
- **In-memory indexes** — many educational and embedded DBs use BST-family trees before graduating to B+ trees on disk.
- **.NET `SortedSet<T>`** — red-black tree under the hood; same ordered operations at O(log n).
- **Database index scans** — range queries `[lo, hi]` are inorder walks; k-th smallest is order-statistics on augmented trees.

Plain BSTs degrade on sorted input — that limitation motivates [23 - Self-Balancing Trees](23-self-balancing-trees.md).

## Summary

BST operations turn the ordering invariant into fast search, insert, delete, and ordered statistics — when height stays logarithmic.

Master insert, delete, validate, k-th, and LCA here; self-balancing trees fix the skew problem next.

::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [In-Memory Database Index](/projects/tier-3/10-in-memory-db-index) — BST to self-balancing red-black tree.
:::

**Next:** [23 - Self-Balancing Trees Operations](23-self-balancing-trees.md)