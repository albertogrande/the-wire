// Derives every piece's metadata WITHOUT frontmatter — parsed from the H1,
// the filename (collection id), and the italic standfirst line, exactly as the
// Jekyll site did. The skills keep writing plain Markdown; this is the single
// place that understands the conventions. If frontmatter ever appears, its
// fields win (entry.data.*), so adoption can be gradual.

export type Kind = 'weekly' | 'daily' | 'ondemand' | 'quarterly';

export interface WireEntry {
  id: string;
  collection: string;
  body?: string;
  data?: Record<string, any>;
}

export interface Meta {
  id: string;
  collection: string;
  kind: Kind;
  title: string;
  standfirst: string;
  dek: string;
  byline: string | null; // columnist name, daily dives only
  desk: string | null; // e.g. "The Contrarian"
  date: Date;
  mins: number; // estimated reading time
  urlPath: string; // canonical Jekyll-style path, no base: /reports/<…>.html
  href: string; // base-prefixed link for the live site
}

const RAW_BASE = import.meta.env.BASE_URL ?? '/';
const BASE = RAW_BASE.replace(/\/$/, ''); // "/the-wire"

export function withBase(p: string): string {
  return `${BASE}${p.startsWith('/') ? '' : '/'}${p}`;
}

function firstMatch(body: string, re: RegExp): string | null {
  const m = body.match(re);
  return m ? m[1].trim() : null;
}

function isoWeekMonday(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Dow = (jan4.getUTCDay() + 6) % 7; // 0 = Monday
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - jan4Dow + (week - 1) * 7);
  return monday;
}

function quarterEnd(year: number, q: number): Date {
  const endMonth = [2, 5, 8, 11][q - 1]; // Mar, Jun, Sep, Dec (0-based)
  const day = [31, 30, 30, 31][q - 1];
  return new Date(Date.UTC(year, endMonth, day));
}

export function deriveMeta(entry: WireEntry): Meta {
  const body = entry.body ?? '';
  const data = entry.data ?? {};
  const id = entry.id;

  const title = data.title ?? firstMatch(body, /^#\s+(.+?)\s*$/m) ?? id;
  const standfirst =
    data.standfirst ?? firstMatch(body, /^\*(.+?)\*\s*$/m) ?? '';
  const segs = standfirst.split(' · ');
  const dek = data.dek ?? (segs.length > 1 ? segs[segs.length - 1] : standfirst);

  // Collection → kind. Deep-dives split daily vs on-demand by the columnist
  // byline "(Desk)" in the standfirst (daily-dive writes it; deep-dive doesn't).
  let kind: Kind;
  let byline: string | null = null;
  let desk: string | null = null;
  let urlPath: string;
  let date: Date;

  if (entry.collection === 'weekly') {
    kind = 'weekly';
    urlPath = `/reports/${id}.html`;
    const wp = id.split('-W');
    date = isoWeekMonday(Number(wp[0]), Number(wp[1]));
  } else if (entry.collection === 'quarters') {
    kind = 'quarterly';
    urlPath = `/reports/quarters/${id}.html`;
    const qp = id.split('-Q');
    date = quarterEnd(Number(qp[0]), Number(qp[1]));
  } else {
    // deep-dives
    urlPath = `/reports/deep-dives/${id}.html`;
    date = new Date(`${id.slice(0, 10)}T00:00:00Z`);
    const bylineSeg = segs[1] ?? '';
    const bm = bylineSeg.match(/^(.+?)\s*\((.+)\)\s*$/);
    if (bm) {
      kind = 'daily';
      byline = data.byline ?? bm[1].trim();
      desk = data.desk ?? bm[2].trim();
    } else {
      kind = 'ondemand';
    }
  }

  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const mins = Math.max(1, Math.round(words / 200));

  return {
    id,
    collection: entry.collection,
    kind,
    title,
    standfirst,
    dek,
    byline,
    desk,
    date,
    mins,
    urlPath,
    href: withBase(urlPath),
  };
}

export function sortByDateDesc(a: Meta, b: Meta): number {
  const d = b.date.getTime() - a.date.getTime();
  return d !== 0 ? d : b.id.localeCompare(a.id);
}

const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  d.toLocaleDateString('en-GB', { timeZone: 'UTC', ...opts });

export const fmtLong = (d: Date) =>
  fmt(d, { day: 'numeric', month: 'long', year: 'numeric' }); // 11 June 2026
export const fmtMed = (d: Date) =>
  fmt(d, { day: 'numeric', month: 'short', year: 'numeric' }); // 11 Jun 2026
export const fmtShort = (d: Date) =>
  fmt(d, { day: 'numeric', month: 'short' }); // 11 Jun

// Weekly id "2026-W23" → { week: "23", year: "2026" }
export function weekParts(id: string) {
  const [year, week] = id.split('-W');
  return { year, week };
}

// Weekly standfirst "Week of 2026-06-01 to 2026-06-07 · …" → "1 Jun – 7 Jun 2026"
export function weekRange(standfirst: string): string {
  const m = standfirst.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/);
  if (!m) return '';
  const a = new Date(`${m[1]}T00:00:00Z`);
  const b = new Date(`${m[2]}T00:00:00Z`);
  const left = a.getUTCMonth() === b.getUTCMonth() ? String(a.getUTCDate()) : fmtShort(a);
  return `${left} – ${fmtShort(b)} ${b.getUTCFullYear()}`;
}

// The issue covers a Mon–Sun week and publishes the following Monday.
export function publishedOn(weeklyDate: Date): string {
  const pub = new Date(weeklyDate);
  pub.setUTCDate(weeklyDate.getUTCDate() + 7);
  return `Mon ${pub.toISOString().slice(0, 10)}`;
}
