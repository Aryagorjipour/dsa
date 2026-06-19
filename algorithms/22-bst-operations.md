# 22 - BST Operations

## The Problems BST Operations Solve

A plain Binary Search Tree supports ordered data with logarithmic operations (when balanced).

### Canonical Problem 1: Kth Smallest Element in a BST

Given a BST, find the k-th smallest element in it.

Solution: Inorder traversal (left-root-right) gives sorted order. Use a counter.

Full code:

**C#**

```csharp
public int KthSmallest(TreeNode root, int k) {
    int count = 0;
    int result = -1;
    void Inorder(TreeNode node) {
        if (node == null) return;
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
```

**Go** similar with closure or global.

### Canonical Problem 2: Validate Binary Search Tree

Check if the tree is a valid BST (left < node < right for all).

Careful with min/max passing (not just parent).

### Canonical Problem 3: Lowest Common Ancestor in BST

Because of ordering, LCA is simpler than general tree.

```csharp
TreeNode LCA(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null) return null;
    if (p.Val < root.Val && q.Val < root.Val)
        return LCA(root.Left, p, q);
    if (p.Val > root.Val && q.Val > root.Val)
        return LCA(root.Right, p, q);
    return root;
}
```

## Other Important Operations

- Insert, Delete (with 0,1,2 children cases)
- Find min / max
- Range queries (inorder within bounds)
- Floor / Ceil

## Why These Problems Exist

They demonstrate the power of the BST invariant for ordered statistics and ancestor queries without full traversal.

## Real World

- Database indexes (though they use B+ trees)
- Symbol tables in compilers
- Any ordered set with fast "kth" or range needs

Implement these operations fully to internalize BST power and its limitations (hence self-balancing trees).
