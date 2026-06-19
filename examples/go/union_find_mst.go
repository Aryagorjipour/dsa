package main

import (
	"fmt"
	"sort"
)

// Disjoint Set (Union-Find) for Kruskal's MST
// Real-world: Network design (cable laying), clustering, image segmentation, connectivity queries.

type DSU struct {
	parent []int
	rank   []int
}

func NewDSU(n int) *DSU {
	d := &DSU{parent: make([]int, n), rank: make([]int, n)}
	for i := range d.parent {
		d.parent[i] = i
	}
	return d
}

func (d *DSU) Find(x int) int {
	if d.parent[x] != x {
		d.parent[x] = d.Find(d.parent[x])
	}
	return d.parent[x]
}

func (d *DSU) Union(x, y int) {
	px, py := d.Find(x), d.Find(y)
	if px == py {
		return
	}
	if d.rank[px] < d.rank[py] {
		d.parent[px] = py
	} else if d.rank[px] > d.rank[py] {
		d.parent[py] = px
	} else {
		d.parent[py] = px
		d.rank[px]++
	}
}

func main() {
	// Simple graph for MST demo
	edges := [][3]int{{0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4}}
	sort.Slice(edges, func(i, j int) bool { return edges[i][2] < edges[j][2] })

	dsu := NewDSU(4)
	mstWeight := 0
	for _, e := range edges {
		if dsu.Find(e[0]) != dsu.Find(e[1]) {
			dsu.Union(e[0], e[1])
			mstWeight += e[2]
			fmt.Printf("Edge %d-%d weight %d\n", e[0], e[1], e[2])
		}
	}
	fmt.Println("MST weight:", mstWeight)

	// Used in cable networks, clustering, Kruskal for MST.
}