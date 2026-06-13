// Reads the hand/skill-maintained YAML in _data/ at build time. The files stay
// where they are (scripts and skills reference them); Astro just consumes them.
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export type PredStatus = 'open' | 'correct' | 'incorrect' | 'partial';

export interface Prediction {
  id: string;
  made: string;
  made_link: string;
  text: string;
  confidence: number;
  due: string;
  status: PredStatus;
  brier?: number;
  settled_on?: string;
}

export interface ThreadIssue {
  label: string;
  link: string;
}

export interface Thread {
  slug: string;
  title: string;
  momentum: 'up' | 'steady' | 'down';
  summary: string;
  tension?: string;
  issues: ThreadIssue[];
}

const root = process.cwd();

function load<T>(rel: string): T {
  return yaml.load(fs.readFileSync(path.join(root, rel), 'utf8')) as T;
}

export const predictions = load<Prediction[]>('_data/predictions.yml') ?? [];
export const threads = load<Thread[]>('_data/threads.yml') ?? [];

export const byStatus = (s: PredStatus) =>
  predictions.filter((p) => p.status === s);

export const openPredictions = byStatus('open').sort((a, b) =>
  a.due.localeCompare(b.due),
);

export const scorecard = (() => {
  const correct = byStatus('correct').length;
  const incorrect = byStatus('incorrect').length;
  const partial = byStatus('partial').length;
  const scored = predictions.filter((p) => typeof p.brier === 'number');
  const meanBrier = scored.length
    ? scored.reduce((s, p) => s + (p.brier as number), 0) / scored.length
    : null;
  return {
    open: byStatus('open').length,
    correct,
    incorrect,
    partial,
    settled: correct + incorrect + partial,
    meanBrier,
    nextDue: openPredictions[0]?.due ?? null,
  };
})();

// Footer matching: a page's canonical urlPath (/reports/….html) vs made_link
// and thread issue links (stored the same way, without the base prefix).
export const predictionForUrl = (urlPath: string) =>
  predictions.find((p) => p.made_link === urlPath) ?? null;

export const threadsForUrl = (urlPath: string) =>
  threads.filter((t) => t.issues?.some((i) => i.link === urlPath));
