// Parses the scout's signal files (signals/<week>.md) into feed items for the
// Front-page live feed. Each file is dated `## YYYY-MM-DD` headings followed by
// `- [headline](url) — clause … (beat)` lines. We pull headline, source domain,
// beat(s), and a best-effort HN points/comments count from the prose.

export interface FeedItem {
  date: string; // YYYY-MM-DD
  title: string;
  url: string;
  src: string; // bare domain
  beat: string; // primary beat (for the chip + filter)
  beats: string[];
  points: string | null; // e.g. "485" or "1.3k", when present in the prose
}

const linkRe = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

function domain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function parseLine(line: string, date: string): FeedItem | null {
  const body = line.replace(/^[-*]\s+/, '').trim();
  if (!body) return null;

  const links = [...body.matchAll(linkRe)].map((m) => ({ text: m[1], url: m[2] }));
  // primary source: first non-HN link, else first link
  const primary =
    links.find((l) => !/news\.ycombinator\.com/.test(l.url)) ?? links[0];

  // title: first link text if the line opens with a link, else the lead clause
  let title: string;
  if (body.startsWith('[') && links[0]) title = links[0].text;
  else title = body.split(/\s+[—–-]\s+/)[0].replace(linkRe, '$1').trim();
  title = title.replace(/\s+/g, ' ').trim();
  if (!title) return null;

  // beats: trailing (...) group
  const beatMatch = body.match(/\(([^()]*)\)\s*$/);
  const beats = beatMatch
    ? beatMatch[1].split('/').map((b) => b.trim().toLowerCase()).filter(Boolean)
    : [];

  // best-effort HN points/comments
  const pts = body.match(/([\d.,]+k?)\s*(?:points|comments)/i);

  return {
    date,
    title,
    url: primary?.url ?? '',
    src: primary ? domain(primary.url) : '',
    beat: beats[0] ?? 'misc',
    beats: beats.length ? beats : ['misc'],
    points: pts ? pts[1] : null,
  };
}

export function parseSignals(
  entries: { body?: string }[],
  limit = 24,
): { items: FeedItem[]; beats: string[] } {
  const items: FeedItem[] = [];
  for (const entry of entries) {
    let date = '';
    for (const raw of (entry.body ?? '').split('\n')) {
      const h = raw.match(/^##\s+(\d{4}-\d{2}-\d{2})/);
      if (h) {
        date = h[1];
        continue;
      }
      if (/^\s*[-*]\s+/.test(raw) && date) {
        const item = parseLine(raw, date);
        if (item) items.push(item);
      }
    }
  }
  // newest date first; preserve in-file order within a date
  items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const top = items.slice(0, limit);

  // beat filter list = primary beats present, by first appearance
  const beats: string[] = [];
  for (const it of top) if (!beats.includes(it.beat)) beats.push(it.beat);

  return { items: top, beats };
}
