package main

import (
	"fmt"
	"hash/fnv"
	"sort"
)

// Simple Consistent Hashing with Virtual Nodes
// Real-world: Cassandra, DynamoDB, Memcached (Ketama), Akamai CDN, Redis Cluster sharding.

type ConsistentHash struct {
	ring       map[uint32]string
	sortedKeys []uint32
	replicas   int
}

func NewConsistentHash(replicas int) *ConsistentHash {
	return &ConsistentHash{
		ring:     make(map[uint32]string),
		replicas: replicas,
	}
}

func (ch *ConsistentHash) hash(key string) uint32 {
	h := fnv.New32a()
	h.Write([]byte(key))
	return h.Sum32()
}

func (ch *ConsistentHash) AddNode(node string) {
	for i := 0; i < ch.replicas; i++ {
		virtualKey := fmt.Sprintf("%s-%d", node, i)
		h := ch.hash(virtualKey)
		ch.ring[h] = node
		ch.sortedKeys = append(ch.sortedKeys, h)
	}
	sort.Slice(ch.sortedKeys, func(i, j int) bool {
		return ch.sortedKeys[i] < ch.sortedKeys[j]
	})
}

func (ch *ConsistentHash) GetNode(key string) string {
	if len(ch.ring) == 0 {
		return ""
	}
	h := ch.hash(key)
	idx := sort.Search(len(ch.sortedKeys), func(i int) bool {
		return ch.sortedKeys[i] >= h
	})
	if idx == len(ch.sortedKeys) {
		idx = 0
	}
	return ch.ring[ch.sortedKeys[idx]]
}

func main() {
	ch := NewConsistentHash(3) // 3 virtual nodes per physical
	ch.AddNode("nodeA")
	ch.AddNode("nodeB")
	ch.AddNode("nodeC")

	fmt.Println("Key 'user123' ->", ch.GetNode("user123"))
	fmt.Println("Key 'item456' ->", ch.GetNode("item456"))

	// Add new node - only ~1/3 keys remap
	ch.AddNode("nodeD")
	fmt.Println("After adding nodeD, 'user123' ->", ch.GetNode("user123"))

	// Used in sharded caches and DBs to minimize data movement on scale.
}