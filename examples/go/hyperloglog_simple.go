package main

import (
	"fmt"
	"hash/fnv"
	"math"
)

// Very simplified HyperLogLog for cardinality estimation
// Problem: Estimate unique count in huge stream with tiny memory.
// Production: Netflix, Google Analytics, Redis PFCOUNT.

type HyperLogLog struct {
	registers []int
	p         int
}

func NewHyperLogLog(p int) *HyperLogLog {
	return &HyperLogLog{
		registers: make([]int, 1<<p),
		p:         p,
	}
}

func (h *HyperLogLog) Add(item string) {
	hash := hash32(item)
	idx := hash >> (32 - h.p)
	rho := leadingZeros(hash<<(h.p)) + 1
	if rho > h.registers[idx] {
		h.registers[idx] = rho
	}
}

func hash32(s string) uint32 {
	h := fnv.New32a()
	h.Write([]byte(s))
	return h.Sum32()
}

func leadingZeros(x uint32) int {
	// simplified
	return 32 - bitsLen(x)
}

func bitsLen(x uint32) int {
	// placeholder
	return 1
}

func (h *HyperLogLog) Estimate() float64 {
	sum := 0.0
	for _, r := range h.registers {
		sum += math.Pow(2, -float64(r))
	}
	alpha := 0.7213
	m := float64(len(h.registers))
	estimate := alpha * m * m / sum
	return estimate
}

func main() {
	hll := NewHyperLogLog(10)
	for i := 0; i < 10000; i++ {
		hll.Add(fmt.Sprintf("user%d", i%8000)) // simulate duplicates
	}
	fmt.Printf("Estimated unique: %.0f\n", hll.Estimate())
	// Real: Used for unique counts at massive scale.
}
