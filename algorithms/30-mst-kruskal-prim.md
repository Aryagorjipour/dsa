# 30 - Minimum Spanning Tree (Kruskal + Prim)

## The Problem

Given a connected, undirected, weighted graph, find a subset of edges that connects all vertices with minimum total weight, without cycles.

This is the **Minimum Spanning Tree** (MST).

## Two Classic Algorithms

### Kruskal (Greedy + Union-Find)

- Sort all edges by weight
- Add the next smallest edge that doesn't create a cycle (use Union-Find to check)
- Stop when you have V-1 edges

Extremely elegant when combined with Union-Find.

### Prim (Grow from a vertex using priority queue)

- Start from any vertex
- Repeatedly add the cheapest edge that connects a vertex in the tree to one outside

Similar to Dijkstra in structure.

## Real World

- Designing minimum cost networks (telecom, electrical, roads)
- Clustering algorithms
- Approximating Traveling Salesman Problem
- Image segmentation
- Some wiring / PCB layout problems

## Summary

MST algorithms are perfect examples of greedy working beautifully when the problem has the right structure.
