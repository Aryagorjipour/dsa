package main

import (
	"fmt"
	"math/rand"
	"time"
)

// This simulates the Two Crystal Balls problem with a random breaking floor.

func findBreakingFloor(breakingFloor int, totalFloors int) int {
	if breakingFloor < 0 || breakingFloor > totalFloors {
		return -1
	}

	// Calculate optimal jump size
	jump := 0
	for jump*(jump+1)/2 < totalFloors {
		jump++
	}

	drops := 0
	prev := 0

	for current := jump; current < totalFloors; current += jump {
		drops++
		if current >= breakingFloor {
			// First ball broke. Linear search with second ball
			for i := prev + 1; i <= current && i < totalFloors; i++ {
				drops++
				if i >= breakingFloor {
					fmt.Printf("Broke at floor %d. Total drops: %d\n", i, drops)
					return i
				}
			}
			return current
		}
		prev = current
		jump-- // decrease jump size
		if jump < 1 {
			jump = 1
		}
	}

	// Check remaining floors
	for i := prev + 1; i < totalFloors; i++ {
		drops++
		if i >= breakingFloor {
			fmt.Printf("Broke at floor %d. Total drops: %d\n", i, drops)
			return i
		}
	}
	return totalFloors // never breaks
}

func main() {
	rand.Seed(time.Now().UnixNano())
	total := 100
	breaking := rand.Intn(total + 1) // 0 to 100

	fmt.Printf("True breaking floor: %d (0 means never breaks)\n", breaking)
	result := findBreakingFloor(breaking, total)
	fmt.Printf("Found breaking floor: %d\n", result)
}
