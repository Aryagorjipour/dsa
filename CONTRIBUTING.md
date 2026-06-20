# Contributing to DSA Handbook

Thank you for your interest! This handbook aims to be one of the best practical resources for learning Data Structures & Algorithms with real code and real use cases.

## How to Contribute

### 1. Improving Explanations
- Edit any `.md` file.
- Make concepts clearer, add better analogies, or fix inaccuracies.
- Keep the tone professional but playful.

### 2. Adding or Improving Examples
- Add or enhance runnable examples in `examples/go/` or `examples/csharp/`.
- Every example should demonstrate a **real problem** the technique solves.

### 3. Adding Diagrams
- Add new images to the `images/` folder.
- Reference them in the relevant chapter using `![Description](/images/name.png)`.

### 4. Adding Project Lab Specs
- Follow the guide in [`projects/contributing.md`](projects/contributing.md).
- Copy [`projects/_template.md`](projects/_template.md) and fill all 10 sections.
- Update [`projects/_metadata.yaml`](projects/_metadata.yaml) and the sidebar in `.vitepress/config.mts`.
- Add cross-links from related handbook chapters using the `::: tip Project Lab` callout format.

### 5. Suggesting New Topics
Open an issue using the "New Topic Suggestion" template.

## Development

```bash
npm install
npm run docs:dev
```

## Pull Request Guidelines
- Keep PRs focused.
- Update relevant sections in README TOC if you add major new content.
- Make sure all internal links still work.
- Run the dev server locally to verify rendering.

Thank you!
