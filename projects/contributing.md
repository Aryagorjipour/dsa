# Contributing to Project Lab

Project Lab specs are **build blueprints**, not solutions. Each project combines 3–7 handbook concepts into a real system learners implement themselves.

## Adding a New Project

1. Copy [`_template.md`](./_template.md) to the appropriate tier folder.
2. Number sequentially — never reuse or overwrite existing project IDs.
3. Fill all 10 sections. Milestones give **hints**, not complete code.
4. Add an entry to [`_metadata.yaml`](./_metadata.yaml).
5. Update the coverage tables in [`README.md`](./README.md).
6. Add sidebar entry in `.vitepress/config.mts` (Project Lab section).
7. Add cross-links from related handbook chapters (see below).
8. Run `npm run docs:build` to verify links.

## Quality Bar

Every project spec must include:

- Real-world motivation citing actual products (Redis, PostgreSQL, AWS, etc.)
- Handbook links in Learning Objectives and Core DSA table
- Mermaid architecture diagram
- 5–6 milestones with success criteria
- Separate C# and Go implementation notes
- Testing strategy (unit, property-based, or benchmark)

## Cross-Linking Convention

### Handbook chapter → Project Lab

Add at the end of relevant chapters:

```markdown
::: tip Project Lab
**Build it yourself:** [Project Name](/projects/tier-N/NN-slug) — one-line description.
:::
```

### Project → Handbook

Use clean URLs in tables and objectives: `/data-structures/10-lru-cache`

## Starter Code

Optional interface stubs live in `projects-starters/go/` and `projects-starters/csharp/`. Starters provide test harnesses and empty structs — not working solutions.

## Tier Guidelines

| Tier | Audience | Scope |
|------|----------|-------|
| 1 | New to DSA | Single structures/algorithms, from scratch |
| 2 | Completed Tier 1 | Multi-component systems, 2–4 concepts |
| 3 | Solid foundation | Production patterns, 4–7 concepts |
| 4 | Expert | Distributed/infrastructure-scale designs |

## Questions?

Open an issue on [GitHub](https://github.com/Aryagorjipour/dsa) with the "New Topic Suggestion" template.