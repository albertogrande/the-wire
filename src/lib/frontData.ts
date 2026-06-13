// Shared front-page data assembly. Extracted from index.astro so the live
// front and every /lab variant render from one identical source — content
// parity across design experiments is guaranteed, only the look differs.
import { getCollection } from 'astro:content';
import { threads, openPredictions } from './data';
import { parseSignals, type FeedItem } from './signals';
import {
  deriveMeta,
  sortByDateDesc,
  weekParts,
  weekRange,
  publishedOn,
  withBase,
  type Meta,
} from './wire';

export interface WireData {
  theWeek: {
    no: number;
    weekNum: string;
    weekId: string;
    weekRange: string;
    published: string;
    title: string;
    dek: string;
    mins: number;
    href: string;
  } | null;
  dives: {
    date: string;
    title: string;
    dek: string;
    author: string;
    desk: string;
    mins: number;
    href: string;
  }[];
  threads: {
    slug: string;
    title: string;
    momentum: 'up' | 'steady' | 'down';
    summary: string;
    tension?: string;
    issues: { label: string; href: string | null }[];
  }[];
  predictions: { id: string; conf: number; due: string; text: string; href: string }[];
  beats: string[];
  feed: FeedItem[];
}

export async function getFrontData(): Promise<WireData> {
  const [weeklyC, divesC, signalsC] = await Promise.all([
    getCollection('weekly'),
    getCollection('dives'),
    getCollection('signals'),
  ]);

  const weeklies: Meta[] = weeklyC.map(deriveMeta).sort(sortByDateDesc);
  const dives: Meta[] = divesC.map(deriveMeta).sort(sortByDateDesc);
  const lead = weeklies[0];

  const { items: feed, beats } = parseSignals(signalsC);

  return {
    theWeek: lead
      ? {
          no: weeklies.length,
          weekNum: weekParts(lead.id).week,
          weekId: lead.id,
          weekRange: weekRange(lead.standfirst),
          published: publishedOn(lead.date),
          title: lead.title,
          dek: lead.dek,
          mins: lead.mins,
          href: lead.href,
        }
      : null,
    dives: dives.map((d) => ({
      date: d.id.slice(0, 10),
      title: d.title,
      dek: d.dek,
      author: d.byline ?? '',
      desk: d.byline ? (d.desk ?? 'Deep Dive') : 'Deep Dive',
      mins: d.mins,
      href: d.href,
    })),
    threads: threads.map((t) => ({
      slug: t.slug,
      title: t.title,
      momentum: t.momentum,
      summary: t.summary,
      tension: t.tension,
      issues: (t.issues ?? []).map((i) => ({
        label: i.label,
        href: i.link ? withBase(i.link) : null,
      })),
    })),
    predictions: openPredictions.map((p) => ({
      id: p.id,
      conf: p.confidence,
      due: p.due,
      text: p.text,
      href: `${withBase('/predictions/')}#${p.id}`,
    })),
    beats,
    feed,
  };
}
