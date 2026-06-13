// Lab A — "Monospace Grid". Mobile-first, light. IA is decided: the front is
// ONE best read (The Week) + the latest dives. Everything else is a tap away.
// The Monospace Web + Vercel: one mono typeface, rules not boxes, lots of air.
import type { WireData } from '../../lib/frontData';
import { withBase } from '../../lib/wire';

export interface Score {
  open: number; correct: number; incorrect: number; partial: number;
  meanBrier: number | null; settled: number; nextDue: string | null;
}

const more = [
  { label: 'Feed', href: withBase('/') },
  { label: 'Threads', href: withBase('/threads/') },
  { label: 'Predictions', href: withBase('/predictions/') },
  { label: 'About', href: withBase('/about/') },
];

export default function LabMono({ wire }: { wire: WireData; score: Score }) {
  const wk = wire.theWeek;
  return (
    <div className="la">
      <header className="la-top">
        <a className="la-mark" href="#">the&nbsp;wire</a>
        <nav className="la-nav">{more.map((m) => <a key={m.label} href={m.href}>{m.label}</a>)}</nav>
      </header>

      <main className="la-main">
        {wk && (
          <a href={wk.href} className="la-hero">
            <div className="la-kick">$ this week · week {wk.weekNum} · {wk.mins} min read</div>
            <h1 className="la-hero-h">{wk.title}</h1>
            <p className="la-hero-dek">{wk.dek}</p>
            <span className="la-read">read the issue →</span>
          </a>
        )}

        <div className="la-sec-head">
          <span className="la-sec-label">LATEST</span>
          <span className="la-rule" aria-hidden="true" />
          <span className="la-sec-right">{wire.dives.length}</span>
        </div>
        <ul className="la-list">
          {wire.dives.map((d) => (
            <li key={d.href} className="la-row">
              <a href={d.href} className="la-row-t">{d.title}</a>
              <p className="la-row-dek">{d.dek}</p>
              <div className="la-row-m">
                <span className="la-date">{d.date.slice(5)}</span>
                <span>{d.desk}{d.author ? ` · ${d.author}` : ''}</span>
                <span>{d.mins} min</span>
              </div>
            </li>
          ))}
        </ul>

        <footer className="la-foot">
          <span className="la-foot-k">more →</span>
          {more.map((m) => <a key={m.label} href={m.href}>{m.label}</a>)}
        </footer>
      </main>
    </div>
  );
}
