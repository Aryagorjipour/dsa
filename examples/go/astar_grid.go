package main

import (
	"container/heap"
	"fmt"
)

// A* on grid with obstacles and costs
// Classic motivating problem: game/map pathfinding with terrain costs

type Point struct{ r, c int }

type Item struct {
	p    Point
	f    int // priority
	idx  int
}

type PQ []*Item

func (pq PQ) Len() int            { return len(pq) }
func (pq PQ) Less(i, j int) bool  { return pq[i].f < pq[j].f }
func (pq PQ) Swap(i, j int)       { pq[i], pq[j] = pq[j], pq[i]; pq[i].idx = i; pq[j].idx = j }
func (pq *PQ) Push(x interface{}) { *pq = append(*pq, x.(*Item)) }
func (pq *PQ) Pop() interface{}   { old := *pq; n := len(old); item := old[n-1]; *pq = old[:n-1]; return item }

func AStar(grid [][]int, start, goal Point) []Point {
	rows, cols := len(grid), len(grid[0])
	h := func(p Point) int { return abs(p.r-goal.r) + abs(p.c-goal.c) }

	gScore := map[Point]int{start: 0}
	fScore := map[Point]int{start: h(start)}
	open := &PQ{}
	heap.Init(open)
	heap.Push(open, &Item{p: start, f: fScore[start]})

	cameFrom := map[Point]Point{}

	dirs := []Point{{0,1},{1,0},{0,-1},{-1,0}}

	for open.Len() > 0 {
		cur := heap.Pop(open).(*Item).p
		if cur == goal {
			return reconstruct(cameFrom, cur)
		}
		for _, d := range dirs {
			nr, nc := cur.r+d.r, cur.c+d.c
			if nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] < 0 {
				continue
			}
			tentative := gScore[cur] + grid[nr][nc]
			if tentative < gScore[Point{nr,nc}] || gScore[Point{nr,nc}] == 0 {
				cameFrom[Point{nr,nc}] = cur
				gScore[Point{nr,nc}] = tentative
				f := tentative + h(Point{nr,nc})
				heap.Push(open, &Item{p: Point{nr,nc}, f: f})
			}
		}
	}
	return nil
}

func reconstruct(came map[Point]Point, cur Point) []Point {
	path := []Point{cur}
	for p, ok := came[cur]; ok; p, ok = came[p] {
		path = append([]Point{p}, path...)
		cur = p
	}
	return path
}

func abs(x int) int { if x < 0 { return -x }; return x }

func main() {
	// 0 = free (cost 1), -1 = wall, positive = terrain cost
	grid := [][]int{
		{1, 1, 1, 1},
		{1, -1, 5, 1},
		{1, 1, 1, 1},
	}
	start := Point{0, 0}
	goal := Point{2, 3}
	path := AStar(grid, start, goal)
	fmt.Println("Path found:", path)
	// Real use: Games, robotics, maps
}