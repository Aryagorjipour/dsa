package main

import (
	"fmt"
	"hash/fnv"
	"math"
	"math/bits"
)

// HyperLogLog for cardinality estimation.
// Problem: Estimate unique count in a huge stream with tiny memory.
// Production: Netflix, Google Analytics, Redis PFCOUNT.

type HyperLogLog struct {
	registers []int
	p         int
	m         int
}

func NewHyperLogLog(p int) *HyperLogLog {
	return &HyperLogLog{
		registers: make([]int, 1<<p),
		p:         p,
		m:         1 << p,
	}
}

func (h *HyperLogLog) Add(item string) {
	hash := hash32(item)
	idx := hash >> (32 - h.p)
	w := (hash << h.p) | (1 << (h.p - 1))
	rho := bits.LeadingZeros32(w) + 1
	if int(rho) > h.registers[idx] {
		h.registers[idx] = int(rho)
	}
}

func (h *HyperLogLog) Estimate() float64 {
	sum := 0.0
	zeros := 0
	for _, r := range h.registers {
		sum += math.Pow(2, -float64(r))
		if r == 0 {
			zeros++
		}
	}
	alpha := 0.7213 / (1.0 + 1.079/float64(h.m))
	estimate := alpha * float64(h.m) * float64(h.m) / sum
	if estimate <= 2.5*float64(h.m) && zeros > 0 {
		estimate = float64(h.m) * math.Log(float64(h.m)/float64(zeros))
	}
	return estimate
}

func hash32(s string) uint32 {
	h := fnv.New32a()
	h.Write([]byte(s))
	return h.Sum32()
}

func main() {
	hll := NewHyperLogLog(10)
	const unique = 8000
	const total = 10000
	for i := 0; i < total; i++ {
		hll.Add(fmt.Sprintf("user%d", i%unique))
	}
	fmt.Printf("Estimated unique: %.0f\n", hll.Estimate())
}