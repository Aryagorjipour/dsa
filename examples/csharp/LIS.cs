using System;
using System.Collections.Generic;

class LIS {
    public static int LengthOfLIS(int[] nums) {
        var tails = new List<int>();
        foreach (int num in nums) {
            int idx = tails.BinarySearch(num);
            if (idx < 0) idx = ~idx;
            if (idx == tails.Count) tails.Add(num);
            else tails[idx] = num;
        }
        return tails.Count;
    }

    static void Main() {
        Console.WriteLine(LengthOfLIS(new[] {10,9,2,5,3,7,101,18})); // 4
    }
}
