// Starter for Project Lab #1 — Search Library
// Spec: /projects/tier-1/01-search-library

interface ISearcher<T> where T : IComparable<T>
{
    int Search(T[] data, T target);
    string Name { get; }
}

class Program
{
    static void Main()
    {
        Console.WriteLine("Implement LinearSearch, BinarySearch, ExponentialSearch, then a SearchLibrary dispatcher.");
    }
}