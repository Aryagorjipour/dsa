// Starter for Project Lab #4 — Hash Map from Scratch
// Spec: /projects/tier-1/04-hash-map-from-scratch

interface IHashMap<K, V>
{
    void Put(K key, V value);
    bool TryGet(K key, out V value);
    bool Delete(K key);
    int Size { get; }
}

class Program
{
    static void Main()
    {
        Console.WriteLine("Implement ChainingHashMap with FNV-1a hashing and load-factor resizing.");
    }
}