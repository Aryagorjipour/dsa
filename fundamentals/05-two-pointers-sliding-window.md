# 05 - Two Pointers and Sliding Window

These two patterns are absolute daily drivers in real software engineering. You will use them constantly for string and array problems.

## Two Pointers

### The Basic Idea

Instead of using nested loops (O(n²)), use **two indices** moving through the data, often from different directions or at different speeds.

### Classic Example: Two Sum (Sorted Array)

Problem: Given a sorted array of numbers and a target, find two numbers that sum to the target.

**Naive**: O(n²) double loop.

**Two pointers**: O(n)

**C#**

```csharp
(int, int) TwoSumSorted(int[] nums, int target) {
    int left = 0;
    int right = nums.Length - 1;

    while (left < right) {
        int sum = nums[left] + nums[right];
        if (sum == target) return (nums[left], nums[right]);
        if (sum < target) left++;
        else right--;
    }
    return (-1, -1);
}
```

**Go**

```go
func TwoSumSorted(nums []int, target int) (int, int) {
    left, right := 0, len(nums)-1
    for left < right {
        sum := nums[left] + nums[right]
        if sum == target {
            return nums[left], nums[right]
        }
        if sum < target {
            left++
        } else {
            right--
        }
    }
    return -1, -1
}
```

Why it works: Because the array is sorted. Moving left increases the sum, moving right decreases it. We can decide direction in O(1).

### Fast and Slow Pointers (Floyd's Cycle Detection)

Used to detect cycles in a linked list (very common in real interview questions and real systems that have buggy linked structures).

```go
func HasCycle(head *ListNode) bool {
    if head == nil {
        return false
    }
    slow, fast := head, head
    for fast != nil && fast.Next != nil {
        slow = slow.Next
        fast = fast.Next.Next
        if slow == fast {
            return true
        }
    }
    return false
}
```

This is O(n) time and O(1) space. Beautiful.

Real use: Detecting cycles in data pipelines, linked structures in memory, some graph algorithms.

### Other Two Pointer Patterns

- Remove duplicates from sorted array in-place
- Move all zeros to end while preserving order
- Container with most water (two pointers on heights)
- 3Sum, 4Sum (sort + two pointers)
- Valid palindrome (ignoring non-alphanum)
- Minimum window substring (often sliding window variant)

## Sliding Window

### The Idea

Maintain a "window" (contiguous subarray or substring) that satisfies some condition, and **slide** it efficiently instead of recomputing from scratch every time.

You usually have:
- A left pointer
- A right pointer that expands the window
- Some state (hashmap, counter, sum) that you update as you expand/shrink

When the window becomes invalid, you move left forward until it becomes valid again.

### Classic Example: Longest Substring Without Repeating Characters

Problem: Given a string, find the length of the longest substring with all unique characters.

"abcabcbb" → "abc" length 3  
"pwwkew" → "wke" length 3

**Sliding window solution** — O(n) time.

**C#**

```csharp
int LengthOfLongestSubstring(string s) {
    var seen = new Dictionary<char, int>();
    int left = 0, maxLen = 0;

    for (int right = 0; right < s.Length; right++) {
        char c = s[right];
        if (seen.ContainsKey(c) && seen[c] >= left) {
            left = seen[c] + 1;
        }
        seen[c] = right;
        maxLen = Math.Max(maxLen, right - left + 1);
    }
    return maxLen;
}
```

**Go**

```go
func LengthOfLongestSubstring(s string) int {
    seen := map[byte]int{}
    left, maxLen := 0, 0

    for right := 0; right < len(s); right++ {
        c := s[right]
        if idx, ok := seen[c]; ok && idx >= left {
            left = idx + 1
        }
        seen[c] = right
        if right-left+1 > maxLen {
            maxLen = right - left + 1
        }
    }
    return maxLen
}
```

Key insight: We never move left backward. Each character is visited at most twice (once by right, once by left). Hence O(n).

### Another Killer Example: Minimum Window Substring

"Find the smallest window in S that contains all characters from T".

This is a very common real-world problem:
- Finding the shortest clip of video that contains certain keywords
- Extracting smallest log range that contains all required error codes
- UI "find text containing these terms"

The pattern is the same: expand right, track required counts, when valid, try to shrink left.

### Fixed Size Sliding Window

Sometimes the window size is fixed (e.g., maximum sum of any subarray of size K).

In this case it's even simpler — just maintain a running sum and subtract when the window slides.

### Real World Sliding Window Usage

1. **Rate limiting** (sliding window log / sliding window counter)
2. **Log analysis & monitoring** — "show me the last 5 minutes of errors with these properties"
3. **Video / audio processing** — moving windows for feature detection
4. **Networking** — TCP congestion control uses sliding windows
5. **Stock / time series analysis** — moving averages
6. **Anomaly detection** in metrics systems

## Two Pointers + Sliding Window Together

Many hard string problems are solved by combining:
- Two pointers for different speeds/directions
- Sliding window + hashmap for state
- Sometimes binary search on the window size

Example family:
- Minimum window substring
- Longest substring with at most K distinct characters
- Longest repeating character replacement

## Complexity

Most well-written two pointers / sliding window solutions are **O(n)** time and **O(1)** or **O(k)** space (where k is alphabet size or number of unique elements).

This is as good as it gets for linear data.

## When to Reach For These Patterns

You see these trigger words:
- "contiguous subarray"
- "substring"
- "longest/shortest window"
- "sorted array"
- "two numbers that..."
- "remove duplicates in place"
- "partition"

Train your brain: "This smells like two pointers or sliding window."

---

You now have the fundamental paradigms:
- Recursion + Memo
- Divide & Conquer
- Greedy
- Two Pointers / Sliding Window

These patterns appear again and again in almost every algorithm we will study.

Time to start building **concrete data structures**.

Next: [data-structures/01-array.md](../data-structures/01-array.md)
::: tip Quizzes & Challenges
**Test yourself:** expand **Quizzes & Challenges** at the bottom of this page (or jump to [#quiz](#quiz)). Track progress on the [Quiz Dashboard](/quizzes).
:::

::: tip Project Lab
**Build it yourself:** [Statistical Sampler](/projects/tier-2/09-statistical-sampler) and [API Rate Limiter](/projects/tier-4/18-api-rate-limiter) — sliding windows in analytics and rate limiting.
:::
