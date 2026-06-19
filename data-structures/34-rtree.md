# 34 - R-Tree

## What is an R-Tree?

An **R-tree** is a tree data structure designed for **spatial indexing** of multi-dimensional information (especially rectangles).

### Canonical Problem: Find All Objects in a Geographic Region (Spatial Range Queries in Maps/GIS)

**Problem:**

You have millions of points or rectangles (restaurants, map features, bounding boxes). Given a query rectangle, return all that intersect it quickly.

R-Tree groups nearby objects with bounding boxes for pruning.

Used in every major GIS database (PostGIS, MongoDB $geoWithin, etc.).

See resources/ for database spatial index details.

It groups nearby objects and represents them with their minimum bounding rectangle (MBR) at higher levels.

It is the dominant structure for spatial databases and GIS.

## Key Idea

Instead of points, R-trees store **rectangles** (or bounding boxes of objects).

Internal nodes contain bounding boxes that cover all children.

This allows very efficient "find all objects that intersect this rectangle" queries.

## Real World Dominance

### 1. All Major Databases With Spatial Features

- **PostGIS** (on top of PostgreSQL) uses R-tree or R-tree-like indexes (actually GiST which can emulate R-tree)
- **MySQL**, **Oracle Spatial**, **SQL Server**, **MongoDB** geospatial indexes use R-tree variants
- **SQLite** with spatial extensions

### 2. Mapping & GIS Software

- QGIS, ArcGIS, Google Earth Engine internals
- Almost every serious mapping application

### 3. Games (sometimes)

For large open worlds with many static objects.

### 4. File Systems & Storage (less common)

Some specialized spatial or multi-dimensional indexes.

## Operations

- Insert rectangle
- Delete rectangle
- Find all rectangles intersecting a query rectangle (range query)
- Nearest neighbor (possible but more complex)

All are designed to minimize disk I/O.

## Variants

- R*-tree (improved insertion and splitting heuristics, very popular)
- R+ tree
- Hilbert R-tree
- Many others

## Comparison

- **Quadtree**: Simpler, good for points, can suffer from deep trees on uneven data.
- **R-tree**: Better for rectangles, overlapping regions, and production spatial databases.
- **KD-tree**: Better for exact point nearest neighbor in low dimensions.

## Summary

R-Tree = the spatial indexing workhorse of the database and GIS world.

If you have ever used `ST_Within`, `ST_Intersects`, or any "find things near me" feature in a real database, you have used an R-tree (or a close relative).

This completes the **Data Structures** section.

---

You now have a comprehensive understanding of 30+ fundamental and advanced data structures, with real implementations, real-world context in C# and Go ecosystems, and the problems they were invented to solve.

**Next major section:** Algorithms.

We will start with the algorithms fundamentals we haven't fully expanded yet if needed, then dive deep into searching, sorting, graphs, dynamic programming, string algorithms, and more — each with their motivating problems and full code.

Let's go to the algorithms!
