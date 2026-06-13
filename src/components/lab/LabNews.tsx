// Lab B — "Editor". Mobile-first, light, lead-forward. The issue rendered like a
// markdown file open in a code editor: tab bar, line-number gutter, syntax-
// colored frontmatter (# heading, > blockquote), a file-explorer "latest", and
// a vim status bar. Stark + IDE + terminal, amber accent. IA: The Week + dives.
import type { WireData } from '../../lib/frontData';
import { withBase } from '../../lib/wire';
import type { Score } from './LabMono';

const more = [
  { label: 'dives/', href: withBase('/') },
  { label: 'threads/', href: withBase('/threads/') },
  { label: 'predictions/', href: withBase('/predictions/') },
];
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28);

let LN = 0;
const Line = ({ children, cls = '' }: { children?: React.ReactNode; cls?: string }) => (
  <div className={`lb-line ${cls}`}>
    <span className="lb-ln">{String(++LN).padStart(2, '0')}</span>
    <span className="lb-code">{children}</span>
  </div>
);

export default function LabNews({ wire }: { wire: WireData; score: Score }) {
  const wk = wire.theWeek;
  LN = 0;
  return (
    <div className="lb">
      <div className="lb-tabs">
        <span className="lb-tab is-active">this-week.md<i className="lb-dirty" /></span>
        {more.map((m) => <a key={m.label} href={m.href} className="lb-tab">{m.label}</a>)}
      </div>

      <main className="lb-editor">
        {wk && (
          <a href={wk.href} className="lb-file">
            <Line cls="lb-fm">---</Line>
            <Line><span className="lb-key">desk</span>: the week</Line>
            <Line><span className="lb-key">issue</span>: no.{wk.no} · week {wk.weekNum}</Line>
            <Line><span className="lb-key">read</span>: {wk.mins} min</Line>
            <Line cls="lb-fm">---</Line>
            <Line />
            <Line cls="lb-h1"><span className="lb-amber"># </span><span className="lb-htext">{wk.title}</span></Line>
            <Line />
            <Line cls="lb-bq"><span className="lb-amber">&gt; </span>{wk.dek}</Line>
            <Line />
            <Line cls="lb-link"><span className="lb-amber">→</span> read the issue</Line>
          </a>
        )}

        <div className="lb-exp">
          <div className="lb-exp-cmd"><span className="lb-amber">$</span> ls latest/ <span className="lb-dim">— {wire.dives.length} files</span></div>
          {wire.dives.map((d) => (
            <a key={d.href} href={d.href} className="lb-frow">
              <span className="lb-fic">▸</span>
              <span className="lb-fmain">
                <span className="lb-ftitle">{d.title}</span>
                <span className="lb-fpath">
                  <span className="lb-dim">{d.date.slice(5)}/</span>
                  <span className="lb-amber">{slug(d.desk)}</span>
                  <span className="lb-dim">/{slug(d.title)}.md</span>
                  <span className="lb-dim"> · {d.mins}m</span>
                </span>
              </span>
            </a>
          ))}
        </div>

        <footer className="lb-status">
          <span className="lb-mode">NORMAL</span>
          <span className="lb-spath">the-wire/front.md</span>
          <span className="lb-dim">utf-8 · ↵ open</span>
        </footer>
      </main>
    </div>
  );
}
