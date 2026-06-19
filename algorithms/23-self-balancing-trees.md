# 23 - Self-Balancing Trees Operations (Red-Black & AVL)

## The Problem

Plain BSTs can become skewed (O(n)). Self-balancing trees guarantee O(log n) height through rotations and recoloring (RB) or height balancing (AVL).

### Canonical Problems

1. Implement insertion/deletion with balancing for Red-Black (full fixup as in data structures chapter).

2. AVL rotations and balance factor maintenance.

3. **Count of smaller numbers after self** or order statistic tree using augmented size in nodes.

4. **Range count queries** in a balanced BST.

## Detailed Operations

- Insert with rotations/recolor (Red-Black fixup)
- Delete with fixup (more complex)
- For AVL: update heights + rotations on insert/delete

## Real World

- `TreeMap` / `SortedSet` in Java / .NET
- Linux kernel many uses
- Database memory components

## Why Separate Chapter

Operations on self-balancing trees are significantly more involved than plain BST. You must maintain invariants after every modification.

Full code for rotations and fixups (reuse from data structure 14 but focus on the algorithm usage and problems).

Practice:
- Implement a order statistic tree (select kth in O(log n))
- Range sum tree using size augmentation
