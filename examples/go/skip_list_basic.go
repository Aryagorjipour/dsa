package main

import (
	"fmt"
	"math/rand"
)

// Basic Skip List (inspired by Redis ZSET / LevelDB MemTable)
// Real-world: Sorted sets, leaderboards, time-series windows, LSM memtables (Redis, RocksDB)

type Node struct {
	value int
	next  []*Node
}

type SkipList struct {
	head  *Node
	level int
}

func NewSkipList() *SkipList {
	return &SkipList{
		head:  &Node{next: make([]*Node, 16)},
		level: 0,
	}
}

func randomLevel() int {
	level := 0
	for rand.Float32() < 0.5 && level < 15 {
		level++
	}
	return level
}

func (sl *SkipList) Insert(value int) {
	update := make([]*Node, 16)
	x := sl.head

	for i := sl.level; i >= 0; i-- {
		for x.next[i] != nil && x.next[i].value < value {
			x = x.next[i]
		}
		update[i] = x
	}

	lvl := randomLevel()
	if lvl > sl.level {
		for i := sl.level + 1; i <= lvl; i++ {
			update[i] = sl.head
		}
		sl.level = lvl
	}

	newNode := &Node{value: value, next: make([]*Node, lvl+1)}
	for i := 0; i <= lvl; i++ {
		newNode.next[i] = update[i].next[i]
		update[i].next[i] = newNode
	}
}

func (sl *SkipList) Print() {
	for i := sl.level; i >= 0; i-- {
		fmt.Printf("Level %d: ", i)
		x := sl.head.next[i]
		for x != nil {
			fmt.Printf("%d ", x.value)
			x = x.next[i]
		}
		fmt.Println()
	}
}

func main() {
	sl := NewSkipList()
	sl.Insert(10)
	sl.Insert(20)
	sl.Insert(15)
	sl.Insert(5)

	fmt.Println("Skip List contents (Redis-style sorted set simulation):")
	sl.Print()

	// Real use: Redis ZSET for leaderboards, rate limit windows,
	// or RocksDB/LevelDB MemTable for in-memory sorted data.
}