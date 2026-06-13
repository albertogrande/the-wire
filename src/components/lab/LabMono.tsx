// Lab A — "TUI". Mobile-first, light, lead-forward. Stark terminal: a command
// prompt + blinking cursor, an ASCII-framed hero panel, a line-number gutter on
// the latest list, syntax-ish amber accents, keyboard hints. Monospace Web +
// Vercel contrast + IDE color. IA: The Week + latest dives; rest a tap away.
import type { WireData } from '../../lib/frontData';
import { withBase } from '../../lib/wire';

export interface Score {
  open: number; correct: number; incorrect: number; partial: number;
  meanBrier: number | null; settled: number; nextDue: string | null;
}

const more = [
  { label: 'feed', href: withBase('/') },
  { label: 'threads', href: withBase('/threads/') },
  { label: 'predictions', href: withBase('/predictions/') },
  { label: 'about', href: withBase('/about/') },
];
const Cur = () => <span className="la-cur" aria-hidden="true">▌</span>;

export default function LabMono({ wire }: { wire: WireData; score: Score }) {
  const wk = wire.theWeek;
  return (
    <div className="la">
      <header className="la-bar">
        <a href="#" className="la-mark"><span className="la-amber">$</span> the&nbsp;wire</a>
        <nav className="la-nav">{more.map((m) => <a key={m.label} href={m.href}>--{m.label}</a>)}</nav>
      </header>

      <div className="la-cmd"><span className="la-dim">~/the-wire</span> <span className="la-amber">$</span> wire read --this-week<Cur /></div>

      <main className="la-main">
        {wk && (
          <a href={wk.href} className="la-box">
            <span className="la-legend">THE&nbsp;WEEK</span>
            <div className="la-kick"><span className="la-amber"># </span>week {wk.weekNum} · {wk.mins} min · {wk.weekRange}</div>
            <h1 className="la-h">{wk.title}</h1>
            <p className="la-dek">{wk.dek}</p>
            <span className="la-read"><span className="la-amber">→</span> read the issue</span>
          </a>
        )}

        <div className="la-sec">
          <span className="la-amber">##</span><span className="la-sec-l">latest</span>
          <span className="la-rule" aria-hidden="true" />
          <span className="la-dim">{String(wire.dives.length).padStart(2, '0')}</span>
        </div>

        <ul className="la-list">
          {wire.dives.map((d, i) => (
            <li key={d.href} className="la-row">
              <span className="la-ln">{String(i + 1).padStart(2, '0')}</span>
              <div className="la-rowmain">
                <a href={d.href} className="la-row-t">{d.title}</a>
                <p className="la-row-dek">{d.dek}</p>
                <div className="la-row-m">
                  <span className="la-amber">{d.date.slice(5)}</span>
                  <span className="la-dim">·</span><span>{d.desk}</span>
                  {d.author && <><span className="la-dim">·</span><span>{d.author}</span></>}
                  <span className="la-dim">·</span><span>{d.mins}m</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <footer className="la-keys">
          <span><b>↑↓</b> browse</span>
          <span><b>↵</b> open</span>
          <span><b>/</b> search</span>
          <span><b>g</b> feed</span>
        </footer>
      </main>
    </div>
  );
}
