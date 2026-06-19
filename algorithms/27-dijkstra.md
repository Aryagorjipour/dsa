# 27 - Dijkstra's Shortest Path

## The Problem

Find the shortest path from a source to all other nodes (or to a target) in a graph with **non-negative** edge weights.

## How It Works

Repeatedly select the unvisited node with the current smallest distance (using a priority queue), then relax all its edges.

This is greedy + priority queue.

## Key Requirements

- No negative weights (use Bellman-Ford if negatives exist)

## Real World

- Google Maps / routing engines (when combined with A* and many optimizations)
- Network routing protocols
- Game pathfinding with varying terrain costs
- Some dependency cost calculations

## Implementation Note

Use `PriorityQueue` (C#) or `container/heap` (Go).

Lazy version (allowing duplicate entries) is simpler and often fast enough.

Eager version with decrease-key is more complex.

## Complexity

With binary heap: O((V + E) log V)

## Variants & Improvements

- A* (adds heuristic — we'll cover)
- Bidirectional Dijkstra
- Contraction hierarchies (used in real mapping)

## Summary

Dijkstra = the foundation of almost all real-world shortest path routing with non-negative costs.
