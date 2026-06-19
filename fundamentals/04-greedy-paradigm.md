# 04 - Greedy Paradigm

## What is a Greedy Algorithm?

A **greedy algorithm** makes the locally optimal choice at each step, hoping it leads to a global optimum.

It never goes back to reconsider previous choices.

This is both its superpower and its danger.

## The Classic "Greedy Works" Example: Coin Change (US coins)

Problem: Make change for 67 cents using fewest coins.

US coins: 25, 10, 5, 1

Greedy strategy:
- Take as many 25 as possible (2 × 25 = 50)
- Take as many 10 as possible (1 × 10 = 10)
- Take as many 5 as possible (1 × 5 = 5)
- Take 1s (2)

Total coins: 2 + 1 + 1 + 2 = **6 coins**

Which happens to be optimal.

**But** this strategy fails for arbitrary coin systems.

Suppose coins = [1, 3, 4] and amount = 6.

Greedy: 4 + 1 + 1 = 3 coins  
Optimal: 3 + 3 = 2 coins

Greedy can be wrong.

## When Greedy Usually Works

Greedy works reliably when the problem has **optimal substructure** + **greedy choice property**.

This is proven for:

- **Activity Selection / Interval Scheduling** (pick the activity that finishes earliest)
- **Huffman Coding** (build optimal prefix codes)
- **Minimum Spanning Tree** (Kruskal and Prim are greedy)
- **Dijkstra's shortest path** (when no negative edges)
- **Fractional Knapsack** (take highest value/weight first)
- **Task scheduling** to minimize lateness

## Real World Greedy in Production

1. **Huffman coding** — Used in JPEG, MP3, ZIP, many compression formats. The algorithm that builds the optimal variable-length codes is greedy.

2. **Kruskal / Prim** for MST — Used in network design, clustering, approximating traveling salesman, some image segmentation.

3. **Dijkstra** — GPS navigation (when combined with A*), network routing protocols (OSPF, IS-IS use variants).

4. **Interval scheduling** — Operating system CPU scheduling (sometimes), meeting room booking systems, video ad insertion in streaming.

5. **Load balancing heuristics** — Assign job to the currently least loaded machine (greedy).

6. **CDN / cache placement** — Some placement decisions use greedy set cover approximations.

## The Danger Zone

Never blindly apply greedy unless you can prove (or at least strongly believe) it produces optimal results.

Many problems that look greedy are actually DP problems:
- 0/1 Knapsack → DP
- Coin change (unlimited but arbitrary denominations) → DP
- Longest Increasing Subsequence → DP or patience sorting tricks

## How to Recognize a Greedy Problem

Ask:
- If I make the locally best choice now, can I ever regret it later?
- Does sorting the input in a clever way let me just walk left to right making irrevocable decisions?

If yes, greedy is often the answer.

## Implementation Pattern

Typical greedy structure:

1. Sort the input according to some criterion.
2. Walk through the sorted list making the best choice at each step that doesn't violate constraints.
3. Done.

Example skeleton (activity selection):

```go
type Activity struct { start, end int }

func SelectActivities(activities []Activity) []Activity {
    // Sort by end time
    sort.Slice(activities, func(i, j int) bool {
        return activities[i].end < activities[j].end
    })
    
    result := []Activity{}
    lastEnd := -1
    for _, a := range activities {
        if a.start >= lastEnd {
            result = append(result, a)
            lastEnd = a.end
        }
    }
    return result
}
```

We'll see many more when we reach graph algorithms (MST) and other chapters.

## Greedy vs DP vs Backtracking

- **Greedy**: irrevocable choices, fast, risk of suboptimal
- **DP**: considers overlapping subproblems, usually optimal, more work
- **Backtracking**: try choices, undo when wrong (brute force with pruning)

Many hard problems start as greedy attempts, then become DP when greedy fails.

## Next

Two Pointers and Sliding Window — some of the most practical patterns you will use weekly as an engineer.
