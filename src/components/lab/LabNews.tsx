// Lab B — "Newswire". Mobile-first, light. The Bloomberg/Businessweek EDITORIAL
// side (not the terminal): a wire-service front — bold serif hero, newspaper
// hierarchy, one hot accent. IA decided: The Week + latest dives only.
import type { WireData } from '../../lib/frontData';
import { withBase } from '../../lib/wire';
import type { Score } from './LabMono';

const more = [
  { label: 'Feed', href: withBase('/') },
  { label: 'Threads', href: withBase('/threads/') },
  { label: 'Predictions', href: withBase('/predictions/') },
  { label: 'About', href: withBase('/about/') },
];

export default function LabNews({ wire }: { wire: WireData; score: Score }) {
  const wk = wire.theWeek;
  const [top, ...rest] = wire.dives;
  return (
    <div className="lb">
      <header className="lb-mast">
        <div className="lb-dateline">VOL. I {wk ? `· WEEK ${wk.weekNum} · ${wk.weekRange}` : ''}</div>
        <a href="#" className="lb-name">The&nbsp;Wire</a>
        <nav className="lb-nav">{more.map((m) => <a key={m.label} href={m.href}>{m.label}</a>)}</nav>
      </header>

      <main className="lb-main">
        {wk && (
          <a href={wk.href} className="lb-lead">
            <span className="lb-tag">THE WEEK</span>
            <h1 className="lb-lead-h">{wk.title}</h1>
            <p className="lb-lead-dek">{wk.dek}</p>
            <span className="lb-meta">Unbylined house voice · {wk.mins} min · published {wk.published}</span>
          </a>
        )}

        <div className="lb-band">Latest dispatches</div>

        {top && (
          <a href={top.href} className="lb-story lb-story-top">
            <span className="lb-kick">{top.desk} · {top.date.slice(5)}</span>
            <h2 className="lb-story-h">{top.title}</h2>
            <p className="lb-story-dek">{top.dek}</p>
            <span className="lb-byline">{top.author || 'The Wire'} · {top.mins} min</span>
          </a>
        )}

        <ul className="lb-list">
          {rest.map((d) => (
            <li key={d.href} className="lb-item">
              <a href={d.href} className="lb-item-h">{d.title}</a>
              <span className="lb-kick">{d.desk} · {d.date.slice(5)} · {d.mins} min</span>
            </li>
          ))}
        </ul>

        <footer className="lb-foot">
          {more.map((m) => <a key={m.label} href={m.href}>{m.label}</a>)}
        </footer>
      </main>
    </div>
  );
}
