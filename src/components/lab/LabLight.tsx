// Lab C — "Modern Cards". Mobile-first, light. Supabase-light + Vercel: clean
// surface, soft rounded cards, one green accent, generous spacing. IA decided:
// a hero read (The Week) + the latest dives as cards. Everything else a tap away.
import type { WireData } from '../../lib/frontData';
import { withBase } from '../../lib/wire';
import type { Score } from './LabMono';

const more = [
  { label: 'Feed', href: withBase('/') },
  { label: 'Threads', href: withBase('/threads/') },
  { label: 'Predictions', href: withBase('/predictions/') },
  { label: 'About', href: withBase('/about/') },
];

export default function LabLight({ wire }: { wire: WireData; score: Score }) {
  const wk = wire.theWeek;
  return (
    <div className="lc">
      <header className="lc-top">
        <a href="#" className="lc-mark"><span className="lc-dot" /> the wire</a>
        <nav className="lc-nav">{more.map((m) => <a key={m.label} href={m.href}>{m.label}</a>)}</nav>
      </header>

      <main className="lc-main">
        {wk && (
          <a href={wk.href} className="lc-hero">
            <span className="lc-badge">The Week · {wk.mins} min</span>
            <h1 className="lc-hero-h">{wk.title}</h1>
            <p className="lc-hero-dek">{wk.dek}</p>
            <span className="lc-cta">Read the issue →</span>
          </a>
        )}

        <div className="lc-sec">
          <h2 className="lc-sec-h">Latest dives</h2>
          <a href={more[0].href} className="lc-sec-link">All signals →</a>
        </div>

        <div className="lc-cards">
          {wire.dives.map((d) => (
            <a key={d.href} href={d.href} className="lc-card">
              <span className="lc-card-k">{d.desk}{d.author ? ` · ${d.author}` : ''}</span>
              <span className="lc-card-h">{d.title}</span>
              <span className="lc-card-dek">{d.dek}</span>
              <span className="lc-card-m">{d.date.slice(5)} · {d.mins} min</span>
            </a>
          ))}
        </div>

        <footer className="lc-foot">
          {more.map((m) => <a key={m.label} href={m.href}>{m.label}</a>)}
        </footer>
      </main>
    </div>
  );
}
