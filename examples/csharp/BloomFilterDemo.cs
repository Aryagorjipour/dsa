using System;
using System.Collections;

// Simple Bloom Filter demo
// Production use: Avoid disk reads in Cassandra/HBase, URL dedup in crawlers, membership in caches
public class BloomFilterDemo {
    private BitArray bits;
    private int k;
    private int m;

    public BloomFilterDemo(int expected, double fpRate) {
        m = (int)(-expected * Math.Log(fpRate) / (Math.Log(2) * Math.Log(2)));
        k = (int)(m / (double)expected * Math.Log(2));
        bits = new BitArray(m);
    }

    public void Add(string item) {
        for (int i = 0; i < k; i++) {
            int h = (item.GetHashCode() + i * 31) & 0x7FFFFFFF;
            bits[h % m] = true;
        }
    }

    public bool MightContain(string item) {
        for (int i = 0; i < k; i++) {
            int h = (item.GetHashCode() + i * 31) & 0x7FFFFFFF;
            if (!bits[h % m]) return false;
        }
        return true;
    }

    public static void Main() {
        var bf = new BloomFilterDemo(1000, 0.01);
        bf.Add("user:12345");
        bf.Add("user:67890");

        Console.WriteLine("Might contain user:12345: " + bf.MightContain("user:12345"));
        Console.WriteLine("Might contain unknown: " + bf.MightContain("user:99999"));

        // Real use in databases and crawlers to save expensive operations
    }
}