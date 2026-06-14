// Reads usage/ledger.csv (appended by every workflow run) at build time and
// returns parsed runs + aggregates for the public "what it costs" page.
import fs from 'node:fs';
import path from 'node:path';

export interface Run {
  date: string; // ISO-ish, UTC
  workflow: string;
  runId: string;
  result: string;
  model: string;
  turns: number;
  durationMs: number;
  inTok: number;
  outTok: number;
  cacheRead: number;
  cacheCreated: number;
  cost: number;
}

function parseLine(line: string): string[] {
  const out: string[] = [];
  let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') q = !q;
    else if (c === ',' && !q) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

export function loadUsage(): Run[] {
  const file = path.join(process.cwd(), 'usage', 'ledger.csv');
  let text = '';
  try { text = fs.readFileSync(file, 'utf8'); } catch { return []; }
  const lines = text.trim().split('\n');
  if (lines.length <= 1) return [];
  return lines.slice(1).map((l) => {
    const f = parseLine(l);
    const n = (i: number) => Number(f[i]) || 0;
    return {
      date: f[0], workflow: f[1], runId: f[2], result: f[3], model: f[4],
      turns: n(5), durationMs: n(6), inTok: n(7), outTok: n(8),
      cacheRead: n(9), cacheCreated: n(10), cost: n(11),
    };
  }).filter((r) => r.date);
}

export interface Group { key: string; runs: number; cost: number; }
export function groupBy(runs: Run[], field: 'workflow' | 'model'): Group[] {
  const m = new Map<string, Group>();
  for (const r of runs) {
    const k = r[field] || '—';
    const g = m.get(k) ?? { key: k, runs: 0, cost: 0 };
    g.runs += 1; g.cost += r.cost;
    m.set(k, g);
  }
  return [...m.values()].sort((a, b) => b.cost - a.cost);
}
