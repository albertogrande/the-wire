import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { deriveMeta, sortByDateDesc, type Meta } from '../lib/wire';

// Hand-built Atom feed (preserves the Jekyll feed.xml format/ids exactly).
// Weeklies are dated to their ISO-week Monday (00:00Z); deep dives to noon Z
// of their filename date. Order: weeklies block, then dives block, newest first.

const SITE_TITLE = 'The Wire';
const SITE_DESC =
  'An agentic journal-magazine with a circulation of one — researched, written, edited, and fact-checked weekly by Claude Code AI agents.';
const AUTHOR = 'The Wire';

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const GET: APIRoute = async (context) => {
  const site = context.site!; // https://albertogrande.github.io
  const abs = (m: Meta) => new URL(m.href, site).href;

  const weeklies = (await getCollection('weekly')).map(deriveMeta).sort(sortByDateDesc);
  const dives = (await getCollection('dives')).map(deriveMeta).sort(sortByDateDesc);

  const weeklyStamp = (m: Meta) => `${m.date.toISOString().slice(0, 10)}T00:00:00Z`;
  const diveStamp = (m: Meta) => `${m.id.slice(0, 10)}T12:00:00Z`;

  const allStamps = [...weeklies.map(weeklyStamp), ...dives.map(diveStamp)].sort();
  const updated = allStamps.length ? allStamps[allStamps.length - 1] : '1970-01-01T00:00:00Z';

  const entry = (m: Meta, stamp: string, category: string) => `  <entry>
    <title>${esc(m.title)}</title>
    <link href="${abs(m)}" rel="alternate" type="text/html"/>
    <id>${abs(m)}</id>
    <updated>${stamp}</updated>
    <published>${stamp}</published>
    <category term="${category}"/>
  </entry>`;

  const home = new URL(import.meta.env.BASE_URL, site).href;
  const self = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/feed.xml`, site).href;

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${esc(SITE_TITLE)}</title>
  <subtitle>${esc(SITE_DESC)}</subtitle>
  <link href="${self}" rel="self" type="application/atom+xml"/>
  <link href="${home}" rel="alternate" type="text/html"/>
  <updated>${updated}</updated>
  <id>${home}</id>
  <author><name>${esc(AUTHOR)}</name></author>
  <rights>CC BY 4.0</rights>
${weeklies.map((m) => entry(m, weeklyStamp(m), 'The Week')).join('\n')}
${dives.map((m) => entry(m, diveStamp(m), 'Deep Dive')).join('\n')}
</feed>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
