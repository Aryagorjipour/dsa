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
- Add new PNG diagrams to `public/images/`.
- Reference them in chapters using `![Description](/images/your-diagram.png)`.

### 4. Adding Project Lab Specs
- Follow the guide in [`projects/contributing.md`](projects/contributing.md).
- Copy [`projects/_template.md`](projects/_template.md) and fill all 10 sections.
- Update [`projects/_metadata.yaml`](projects/_metadata.yaml) and the sidebar in `.vitepress/config.mts`.
- Add cross-links from related handbook chapters using the `::: tip Project Lab` callout format.

### 5. Adding Quizzes & Challenges
- Create a topic file in `quizzes/topics/` (see an existing file for the schema).
- Run `npm run sync:quizzes` to regenerate `quizzes/registry.ts` from topic files.
- Run `npm run sync:quiz-callouts` to add the `::: tip Quizzes & Challenges` callout to the handbook chapter.
- Aim for 8 quiz questions + 2 challenges per topic, mixed difficulty.
- Questions must align with that chapter's content — no generic trivia.
- Run `npm run verify` to ensure registry, callouts, coverage, examples, and site build all pass.

### 6. Suggesting New Topics
Open an issue using the "New Topic Suggestion" template.

## Development

```bash
npm install
npm run docs:dev
npm run verify   # quiz registry/callouts + coverage audit + Go/C# examples + site build
```

## Pull Request Guidelines
- Keep PRs focused.
- Update relevant sections in README TOC if you add major new content.
- Make sure all internal links still work.
- Run the dev server locally to verify rendering.

Thank you!
