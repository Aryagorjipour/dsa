package main

import (
	"fmt"
	"hash/fnv"
	"math"
)

func ln(x float64) float64 {
	return math.Log(x)
}

// Simple Bloom Filter
// Real-world: Cassandra/HBase SSTable filters, web crawlers, Bitcoin SPV, caches

type BloomFilter struct {
	bitArray []bool
	k        int // number of hash functions
	m        int // size
}

func NewBloomFilter(expectedItems int, falsePositiveRate float64) *BloomFilter {
	m := int(-float64(expectedItems) * ln(falsePositiveRate) / (ln(2) * ln(2)))
	k := int(float64(m) / float64(expectedItems) * ln(2))
	return &BloomFilter{
		bitArray: make([]bool, m),
		k:        k,
		m:        m,
	}
}

func (bf *BloomFilter) Add(item string) {
	for i := 0; i < bf.k; i++ {
		h := hash(item, i) % bf.m
		bf.bitArray[h] = true
	}
}

func (bf *BloomFilter) MightContain(item string) bool {
	for i := 0; i < bf.k; i++ {
		h := hash(item, i) % bf.m
		if !bf.bitArray[h] {
			return false
		}
	}
	return true
}

func hash(s string, seed int) int {
	h := fnv.New32a()
	h.Write([]byte(s))
	h.Write([]byte{byte(seed)})
	return int(h.Sum32())
}

func main() {
	bf := NewBloomFilter(1000, 0.01)
	bf.Add("https://example.com/page1")
	bf.Add("https://example.com/page2")

	fmt.Println("Might contain page1:", bf.MightContain("https://example.com/page1"))
	fmt.Println("Might contain unknown:", bf.MightContain("https://example.com/unknown"))

	// Used in production by Cassandra, HBase, crawlers, and many caches
	// to avoid expensive lookups with very low memory.
}