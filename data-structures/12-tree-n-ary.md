# 12 - General Tree (N-ary Tree)

## What is a Tree?

A **tree** is a hierarchical data structure.

It consists of **nodes** connected by **edges**.

Key properties:
- There is exactly one **root** node (unless empty).
- Every node except the root has exactly one **parent**.
- There are no cycles.
- A node can have zero or more **children**.

If a node has no children, it is a **leaf**.

## N-ary Tree

An **n-ary tree** means each node can have up to **n** children (or any number — "general tree").

- Binary tree = n=2
- Ternary = n=3
- File system directories = effectively unbounded n

## Visual

```
          Root
        /   |   \
      A     B     C
     / \    |    
    D   E   F
```

## Why Trees Exist

Trees model **hierarchical** relationships naturally:
- File systems (directories contain files and subdirectories)
- Organization charts
- HTML DOM / UI component trees
- Abstract Syntax Trees in compilers
- Game scene graphs
- Taxonomies and categories
- XML / JSON document structure

## Operations

| Operation          | Time (with good impl) | Notes |
|--------------------|-----------------------|-------|
| Find a node        | O(n) worst            | May need to visit many nodes |
| Add child          | O(1)                  | If you have parent ref |
| Remove subtree     | O(1) or O(subtree size) | Depends if you just unlink or physically delete |
| Traverse           | O(n)                  | Visit every node |

## Common Tree Traversals

### Depth-First (DFS family)
- Pre-order: Root → Left → Right (generalized to children)
- Post-order: Children → Root
- In-order: Only really makes sense for binary

### Breadth-First (Level Order)
- Level by level using a queue.

We will study DFS and BFS in depth in the algorithm chapters.

## C# Node Representation

```csharp
public class TreeNode<T> {
    public T Value { get; set; }
    public List<TreeNode<T>> Children { get; } = new();

    public TreeNode(T value) => Value = value;

    public void AddChild(TreeNode<T> child) => Children.Add(child);
}
```

## Go

```go
type TreeNode[T any] struct {
    Value    T
    Children []*TreeNode[T]
}
```

## Real World Examples

### 1. File Systems

Every operating system represents directories as trees.

Commands like `find`, `ls -R`, backup tools, and `git` all walk trees.

### 2. DOM in Browsers

The entire web page is a tree. CSS selectors, event bubbling, rendering, and React/Vue virtual DOM are all tree algorithms.

### 3. Compilers & Interpreters

- Parse tree → Abstract Syntax Tree (AST)
- Almost every compiler pass walks trees

Roslyn (C# compiler) and `go/ast` are massive tree structures.

### 4. Game Development

- Scene graphs
- Behavior trees for AI
- Quadtrees / Octrees for spatial partitioning (later chapters)

### 5. UI Frameworks (.NET, Flutter, etc.)

Every control has children. Layout, hit testing, and rendering walk the tree.

### 6. Organizational Data

Reporting lines, category taxonomies, product catalogs.

### 7. Git Internally

Git objects form a Merkle DAG (special kind of tree/graph).

## Important Tree Properties & Terms

- **Height** of a node = longest path to a leaf
- **Depth** of a node = distance from root
- **Height of tree** = height of root
- **Full tree**, **Complete tree**, **Perfect tree**, **Balanced tree** (definitions matter for later BST chapters)

## Common Operations on General Trees

- Calculate height/depth
- Count nodes / leaves
- Serialize / deserialize (very common in distributed systems)
- Lowest Common Ancestor (LCA) — extremely important problem
- Find all paths from root to leaves
- Tree flattening (preorder to array and back)

## Serialization Example (LeetCode-style)

Many systems need to send trees over the wire.

Common formats:
- Level order with null markers
- Pre-order + special markers for nulls

## Summary

General trees are the natural way to represent hierarchy.

Once you understand tree traversal and recursion on trees, almost everything that follows (binary trees, BSTs, heaps, tries, segment trees, etc.) becomes much easier.

**Next:** [13 - Binary Search Tree](13-binary-search-tree.md)
