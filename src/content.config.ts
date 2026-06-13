import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

// Preserve the original filename case in the entry id (Astro's default slug
// lowercases it, which would turn 2026-W23 → 2026-w23 and break made_link /
// URL parity with the Jekyll-era .html paths).
const keepId = ({ entry }: { entry: string }) => entry.replace(/\.[^.]+$/, '');

// Content stays in the repo-root reports/ tree (skills write there). No schema:
// metadata is derived in src/lib/wire.ts from the H1, filename, and standfirst.
// MEMORY.md / TASTE.md live in reports/ but never match the weekly pattern.
const weekly = defineCollection({
  loader: glob({ pattern: '*-W*.md', base: './reports', generateId: keepId }),
});

const dives = defineCollection({
  loader: glob({ pattern: '*.md', base: './reports/deep-dives', generateId: keepId }),
});

const quarters = defineCollection({
  loader: glob({ pattern: '*.md', base: './reports/quarters', generateId: keepId }),
});

// Editorial working memory — published in public (the build-in-public ethos);
// the predictions page links to /reports/MEMORY.html.
const docs = defineCollection({
  loader: glob({ pattern: '{MEMORY,TASTE}.md', base: './reports', generateId: keepId }),
});

// The scout's daily signal feed — now surfaced publicly on the Front page.
const signals = defineCollection({
  loader: glob({ pattern: '*.md', base: './signals', generateId: keepId }),
});

export const collections = { weekly, dives, quarters, docs, signals };
