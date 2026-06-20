# 08 - Pseudocode Binary Search and Variants

## Purpose of This Chapter

To master the clean logic of binary search using pseudocode first, then translate precisely to real code while handling all edge cases (empty arrays, overflows, duplicates, rotated arrays, infinite/unbounded arrays).

## Clean Pseudocode (Standard Binary Search)

```
function binarySearch(arr, target):
    low = 0
    high = length(arr) - 1
    
    while low <= high:
        mid = low + (high - low) / 2     // prevent overflow
        if arr[mid] == target:
            return mid
        else if arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
```

## Important Variants with Pseudocode + Real Code

### 1. Find First Occurrence (Lower Bound)

Pseudocode:
```
function findFirst(arr, target):
    low = 0, high = len-1, ans = -1
    while low <= high:
        mid = low + (high-low)//2
        if arr[mid] == target:
            ans = mid
            high = mid - 1   // look left
        else if arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return ans
```

### 2. Find Last Occurrence (Upper Bound)

Similar, but search right on match.

### 3. Search in Rotated Sorted Array

Classic problem: Array was sorted, then rotated at some pivot.

Example: [4,5,6,7,0,1,2], target=0 → index 4

Full detailed implementation required.

### C# Full for Rotated Sorted (with duplicates handling harder)

```csharp
public int Search(int[] nums, int target) {
    int left = 0, right = nums.Length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        
        // Left half sorted
        if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid])
                right = mid - 1;
            else
                left = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[right])
                left = mid + 1;
            else
                right = mid - 1;
        }
    }
    return -1;
}
```

### Go — lower bound (first occurrence)

```go
func FindFirst(arr []int, target int) int {
    lo, hi, ans := 0, len(arr)-1, -1
    for lo <= hi {
        mid := lo + (hi-lo)/2
        if arr[mid] == target {
            ans = mid
            hi = mid - 1
        } else if arr[mid] < target {
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }
    return ans
}
```

### Go — rotated sorted array

```go
func SearchRotated(nums []int, target int) int {
    lo, hi := 0, len(nums)-1
    for lo <= hi {
        mid := lo + (hi-lo)/2
        if nums[mid] == target {
            return mid
        }
        if nums[lo] <= nums[mid] {
            if nums[lo] <= target && target < nums[mid] {
                hi = mid - 1
            } else {
                lo = mid + 1
            }
        } else {
            if nums[mid] < target && target <= nums[hi] {
                lo = mid + 1
            } else {
                hi = mid - 1
            }
        }
    }
    return -1
}
```

## Why Pseudocode First Matters

Pseudocode lets you focus on the **invariant**:
- The target, if exists, is always between low and high.
- We halve the search space each step.

Real code must handle:
- Integer overflow in mid calculation (use left + (right-left)/2)
- Empty array
- All elements same
- Target smaller/larger than all

This chapter builds the mental model used in Exponential Search, Binary Search on Answer, etc.

## Problems to Practice

- Find minimum in rotated sorted array
- Search in 2D matrix (treat as 1D sorted)
- Find peak element
- First bad version (LeetCode style)

Master pseudocode → real code translation here.
