# 14 - Self-Balancing BST: Red-Black Tree

## The Problem

Plain BSTs can degenerate into linked lists.

We need a tree that **automatically stays balanced** (or close to it) after insertions and deletions.

Two famous solutions:
- **AVL Trees** — strictly balanced (height difference at most 1). More rotations.
- **Red-Black Trees** — "mostly balanced" (no path more than twice as long as any other). Fewer rotations, better for insertions/deletions in practice.

Red-Black trees are used **everywhere** in real systems.

## Red-Black Tree Rules (Invariants)

Every node is colored either **Red** or **Black**.

The rules:
1. Every node is Red or Black.
2. Root is always Black.
3. All leaves (NIL nodes) are Black.
4. If a node is Red, both its children must be Black (no two reds in a row).
5. Every path from a node to its descendant leaves must contain the **same number of black nodes**.

These rules guarantee that the tree height is at most `2 * log(n + 1)`.

That is good enough for O(log n) operations.

## Visual Example

![Red-Black Tree](/images/red-black-tree.png)

## Rotations — The Rebalancing Tool

Rotations change the structure without violating the search property.

There are two basic rotations: **left rotate** and **right rotate**.

They are the same operations used in AVL trees.

## Insertion in Red-Black Tree

Steps:
1. Insert like normal BST.
2. Color the new node **Red**.
3. Fix violations by recoloring and rotations.

There are several cases (uncle is red, uncle is black + zig-zag, etc.). The full logic is mechanical.

## Operations & Complexity

| Operation | Average | Worst | Space |
|-----------|---------|-------|-------|
| Search    | O(log n) | O(log n) | O(n) |
| Insert    | O(log n) | O(log n) | O(n) |
| Delete    | O(log n) | O(log n) | O(n) |

At most 2 rotations per insert; delete fixup can require O(log n) rotations.

## Complete Implementation (C#)

```csharp
public enum Color { Red, Black }

public class RBNode {
    public int Val;
    public Color Color = Color.Red;
    public RBNode Left, Right, Parent;

    public RBNode(int val, RBNode nil) {
        Val = val;
        Left = Right = Parent = nil;
    }
}

public class RedBlackTree {
    public RBNode Root;
    private readonly RBNode _nil;

    public RedBlackTree() {
        _nil = new RBNode(0, null!) { Color = Color.Black };
        _nil.Left = _nil.Right = _nil.Parent = _nil;
        Root = _nil;
    }

    public bool Search(int val) {
        RBNode x = Root;
        while (x != _nil) {
            if (val == x.Val) return true;
            x = val < x.Val ? x.Left : x.Right;
        }
        return false;
    }

    private void LeftRotate(RBNode x) {
        RBNode y = x.Right;
        x.Right = y.Left;
        if (y.Left != _nil) y.Left.Parent = x;
        y.Parent = x.Parent;
        if (x.Parent == _nil) Root = y;
        else if (x == x.Parent.Left) x.Parent.Left = y;
        else x.Parent.Right = y;
        y.Left = x;
        x.Parent = y;
    }

    private void RightRotate(RBNode x) {
        RBNode y = x.Left;
        x.Left = y.Right;
        if (y.Right != _nil) y.Right.Parent = x;
        y.Parent = x.Parent;
        if (x.Parent == _nil) Root = y;
        else if (x == x.Parent.Right) x.Parent.Right = y;
        else x.Parent.Left = y;
        y.Right = x;
        x.Parent = y;
    }

    public void Insert(int val) {
        RBNode node = new(val, _nil);
        RBNode y = _nil;
        RBNode x = Root;

        while (x != _nil) {
            y = x;
            if (val < x.Val) x = x.Left;
            else x = x.Right;
        }

        node.Parent = y;
        if (y == _nil) Root = node;
        else if (val < y.Val) y.Left = node;
        else y.Right = node;

        InsertFixup(node);
    }

    private void InsertFixup(RBNode z) {
        while (z.Parent != _nil && z.Parent.Color == Color.Red) {
            if (z.Parent == z.Parent.Parent.Left) {
                RBNode y = z.Parent.Parent.Right;
                if (y.Color == Color.Red) {
                    z.Parent.Color = Color.Black;
                    y.Color = Color.Black;
                    z.Parent.Parent.Color = Color.Red;
                    z = z.Parent.Parent;
                } else {
                    if (z == z.Parent.Right) {
                        z = z.Parent;
                        LeftRotate(z);
                    }
                    z.Parent.Color = Color.Black;
                    z.Parent.Parent.Color = Color.Red;
                    RightRotate(z.Parent.Parent);
                }
            } else {
                RBNode y = z.Parent.Parent.Left;
                if (y.Color == Color.Red) {
                    z.Parent.Color = Color.Black;
                    y.Color = Color.Black;
                    z.Parent.Parent.Color = Color.Red;
                    z = z.Parent.Parent;
                } else {
                    if (z == z.Parent.Left) {
                        z = z.Parent;
                        RightRotate(z);
                    }
                    z.Parent.Color = Color.Black;
                    z.Parent.Parent.Color = Color.Red;
                    LeftRotate(z.Parent.Parent);
                }
            }
        }
        Root.Color = Color.Black;
    }
}
```

## Complete Implementation (Go)

```go
type Color int

const (
    Red Color = iota
    Black
)

type RBNode struct {
    val            int
    color          Color
    left, right, parent *RBNode
}

type RedBlackTree struct {
    root, nil *RBNode
}

func NewRedBlackTree() *RedBlackTree {
    nilNode := &RBNode{color: Black}
    nilNode.left, nilNode.right, nilNode.parent = nilNode, nilNode, nilNode
    return &RedBlackTree{nil: nilNode, root: nilNode}
}

func (t *RedBlackTree) newNode(val int) *RBNode {
    return &RBNode{val: val, color: Red, left: t.nil, right: t.nil, parent: t.nil}
}

func (t *RedBlackTree) Search(val int) bool {
    x := t.root
    for x != t.nil {
        if val == x.val {
            return true
        }
        if val < x.val {
            x = x.left
        } else {
            x = x.right
        }
    }
    return false
}

func (t *RedBlackTree) leftRotate(x *RBNode) {
    y := x.right
    x.right = y.left
    if y.left != t.nil {
        y.left.parent = x
    }
    y.parent = x.parent
    if x.parent == t.nil {
        t.root = y
    } else if x == x.parent.left {
        x.parent.left = y
    } else {
        x.parent.right = y
    }
    y.left = x
    x.parent = y
}

func (t *RedBlackTree) rightRotate(x *RBNode) {
    y := x.left
    x.left = y.right
    if y.right != t.nil {
        y.right.parent = x
    }
    y.parent = x.parent
    if x.parent == t.nil {
        t.root = y
    } else if x == x.parent.right {
        x.parent.right = y
    } else {
        x.parent.left = y
    }
    y.right = x
    x.parent = y
}

func (t *RedBlackTree) Insert(val int) {
    node := t.newNode(val)
    y, x := t.nil, t.root
    for x != t.nil {
        y = x
        if val < x.val {
            x = x.left
        } else {
            x = x.right
        }
    }
    node.parent = y
    if y == t.nil {
        t.root = node
    } else if val < y.val {
        y.left = node
    } else {
        y.right = node
    }
    t.insertFixup(node)
}

func (t *RedBlackTree) insertFixup(z *RBNode) {
    for z.parent != t.nil && z.parent.color == Red {
        if z.parent == z.parent.parent.left {
            y := z.parent.parent.right
            if y.color == Red {
                z.parent.color = Black
                y.color = Black
                z.parent.parent.color = Red
                z = z.parent.parent
            } else {
                if z == z.parent.right {
                    z = z.parent
                    t.leftRotate(z)
                }
                z.parent.color = Black
                z.parent.parent.color = Red
                t.rightRotate(z.parent.parent)
            }
        } else {
            y := z.parent.parent.left
            if y.color == Red {
                z.parent.color = Black
                y.color = Black
                z.parent.parent.color = Red
                z = z.parent.parent
            } else {
                if z == z.parent.left {
                    z = z.parent
                    t.rightRotate(z)
                }
                z.parent.color = Black
                z.parent.parent.color = Red
                t.leftRotate(z.parent.parent)
            }
        }
    }
    t.root.color = Black
}
```

This is the classic CLRS-style implementation with full symmetric rotations and insert fixup. Full delete fixup is even longer — production code uses platform libraries.

## Where Red-Black Trees Are Used in the Real World

### 1. Linux Kernel (Extremely Heavy Use)

- Completely Fair Scheduler (CFS) uses rb-tree for tasks
- Virtual memory area (VMA) tracking
- File system directory entry cache (dcache)

### 2. .NET

- `SortedSet<T>`
- `SortedDictionary<TKey, TValue>`

### 3. Java

- `TreeMap` and `TreeSet` are Red-Black trees

### 4. GCC / C++ STL

- `std::map`, `std::set`, `std::multimap` are Red-Black trees

### 5. Databases & Storage Engines (sometimes)

Some in-memory components use RB-trees. B+ trees dominate on disk.

## Why Red-Black Over AVL?

- Fewer rotations on average during insert/delete
- Better constant factors in practice for mixed workloads
- Still guarantees O(log n) height

## Summary

Red-Black tree = BST + color rules + rotations that keep the tree balanced enough.

It is one of the most successful data structures ever invented for ordered associative containers.

You will rarely implement one from scratch in application code (use the platform's `SortedSet` / `TreeMap`), but understanding how it works makes you a much better engineer when you need to reason about performance of ordered collections.

**Next:** [15 - Heap](15-heap.md)