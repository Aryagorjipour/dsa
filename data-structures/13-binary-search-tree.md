# 13 - Binary Search Tree (BST)

## What is a Binary Search Tree?

A **Binary Search Tree** is a binary tree with a special **ordering invariant**:

For every node:
- All values in the **left** subtree are **less than** the node's value
- All values in the **right** subtree are **greater than** the node's value
- This applies recursively

This invariant is what makes BSTs powerful.

## Visual

![Binary Search Tree](/images/bst.png)

```
         50
       /    \
     30      70
    /  \    /  \
   20  40  60   80
```

Search for 40:
- Start at 50 → go left
- 30 → go right
- 40 → found

## Why the Ordering Matters

It enables **logarithmic** operations (on balanced trees):

- Search: O(log n) average
- Insert: O(log n) average
- Delete: O(log n) average

Without the ordering, you would have to scan the whole tree.

## Operations (Detailed)

### Search

Start at root, go left or right based on comparison. Very similar to binary search on array.

### Insert

Search for where it should go, then attach new leaf.

### Delete (The Tricky One)

Three cases:
1. Node has **no children** → just remove it
2. Node has **one child** → replace node with its child
3. Node has **two children** → find **inorder successor** (smallest in right subtree) or predecessor, copy its value, then delete the successor.

### Inorder Traversal

Left → Root → Right gives **sorted order**.

This is one of the most useful properties.

## Implementations

### C# BST Node + Operations

```csharp
public class TreeNode {
    public int Val;
    public TreeNode? Left;
    public TreeNode? Right;
    public TreeNode(int val) => Val = val;
}

public class BST {
    public TreeNode? Root;

    public TreeNode? Search(int val) {
        TreeNode? current = Root;
        while (current != null) {
            if (val == current.Val) return current;
            current = val < current.Val ? current.Left : current.Right;
        }
        return null;
    }

    public void Insert(int val) {
        Root = InsertRec(Root, val);
    }

    private TreeNode InsertRec(TreeNode? node, int val) {
        if (node == null) return new TreeNode(val);
        if (val < node.Val)
            node.Left = InsertRec(node.Left, val);
        else if (val > node.Val)
            node.Right = InsertRec(node.Right, val);
        return node;
    }
}
```

### Go Version

```go
type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
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
```

## The Fatal Flaw: Unbalanced BSTs

If you insert sorted data into a plain BST:

1, 2, 3, 4, 5, 6, 7...

You get a linked list. All operations become O(n).

This is why **self-balancing** trees (Red-Black, AVL, etc.) were invented.

We will cover them in the next chapter.

## Real World Use of Plain BSTs

Surprisingly, many systems still use **unbalanced** or lightly balanced BSTs when:
- Data arrives in random order
- N is small
- Or they use a self-balancing variant under the hood

## Where BSTs Actually Appear

### 1. .NET

- `SortedSet<T>` and `SortedDictionary<TKey,TValue>` are implemented using **Red-Black trees** (self-balancing BST).
- Many internal Roslyn and EF data structures use trees with BST properties.

### 2. Go

Go does not expose a tree in stdlib, but many people implement ordered maps using BSTs or use B-trees when they need persistence + range queries.

### 3. Databases

- Some in-memory indexes use BSTs or their balanced variants.
- B+ trees (covered later) are the dominant on-disk version of the "ordered search tree" idea.

### 4. Compilers

Symbol tables were historically BSTs (now often hash maps + other structures).

### 5. Linux Kernel

The kernel uses red-black trees (self-balancing BST) in many places.

## Important BST Problems (You Will See These)

- Validate BST
- Lowest Common Ancestor in BST (much easier than general tree LCA)
- Kth Smallest Element (use inorder or augmented size fields)
- Convert Sorted Array to Balanced BST
- Range Sum of BST
- Delete Node in a BST (full implementation)
- Serialize/Deserialize BST
- Recover BST (two nodes swapped)

## Augmenting a BST

One of the most powerful advanced techniques:

Add extra information to each node:
- Size of subtree (for order statistics)
- Sum of subtree
- Min / Max in subtree

This turns a regular BST into a powerful ordered statistics tree.

Many real systems do this (order statistic trees, policy based data structures in gcc, etc.).

## Summary

BST = binary tree + ordering invariant.

It gives you the beautiful ability to search, insert, and delete in logarithmic time **if** it stays balanced.

Plain BSTs are fragile. The next step in evolution is self-balancing trees.

**Further reading & visuals**: Check [resources/further-reading.md](../resources/further-reading.md) and the diagrams in the images/ folder.

**Next:** [14 - Self Balancing BST: Red-Black Tree](14-red-black-tree.md)
