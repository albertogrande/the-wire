// The Feed page island — the firehose moved off the lead-forward front.
// Mono grid: --beat filter flags + a line-numbered signal list. Light, amber.
import { useState } from 'react';
import type { FeedItem } from '../lib/signals';

export default function Feed({ feed, beats }: { feed: FeedItem[]; beats: string[] }) {
  const [beat, setBeat] = useState<string | null>(null);
  const items = beat ? feed.filter((f) => f.beat === beat) : feed;
  return (
    <div className="fd">
      <div className="fd-beats">
        <button className={`fd-beat ${beat === null ? 'is-on' : ''}`} onClick={() => setBeat(null)}>--all</button>
        {beats.map((b) => (
          <button key={b} className={`fd-beat ${beat === b ? 'is-on' : ''}`} onClick={() => setBeat(b)}>--{b}</button>
        ))}
      </div>
      <ul className="fd-list">
        {items.map((f, i) => (
          <li className="fd-row" key={i}>
            <span className="fd-ln">{String(i + 1).padStart(3, '0')}</span>
            <div className="fd-main">
              {f.url
                ? <a className="fd-t" href={f.url}>{f.title}</a>
                : <span className="fd-t">{f.title}</span>}
              <div className="fd-m">
                <span className="amber">{f.date.slice(5)}</span>
                <span className="dim">·</span><span className="fd-beatlabel">{f.beat}</span>
                <span className="dim">·</span><span>{f.src}</span>
                {f.points != null && <><span className="dim">·</span><span className="amber">⌁{f.points}</span></>}
              </div>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="fd-empty">— no signals on --{beat} —</li>}
      </ul>
    </div>
  );
}
