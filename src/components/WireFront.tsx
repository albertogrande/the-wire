// Direction A — "htop" Front body (panels only). The masthead + status strip
// are shared chrome rendered by the layout (WireChrome.astro); this island
// owns the interactive panels: lead tabs, expandable threads, beat-filtered feed.
import { useState, type CSSProperties, type ReactNode } from 'react';
import type { FeedItem } from '../lib/signals';

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

const mono: CSSProperties = { fontFamily: 'var(--font-mono)' };
const MOM: Record<string, string> = { up: '↑', steady: '→', down: '↓' };

const Mom = ({ m }: { m: string }) => <span className={`wf-mom wf-mom-${m}`} aria-hidden="true">{MOM[m]}</span>;
const Pulse = ({ label }: { label?: string }) => (
  <span className="wf-pulse-wrap">
    <span className="wf-pulse" aria-hidden="true" />
    {label && <span className="wf-pulse-label">{label}</span>}
  </span>
);

function ConfBar({ value, width = 10 }: { value: number; width?: number }) {
  const filled = Math.round((value / 100) * width);
  return (
    <span className="wf-conf" title={`confidence ${value}%`}>
      <span className="wf-conf-br">[</span>
      <span className="wf-conf-on">{'█'.repeat(filled)}</span>
      <span className="wf-conf-off">{'░'.repeat(width - filled)}</span>
      <span className="wf-conf-br">]</span>
      <span className="wf-conf-pct">{value}%</span>
    </span>
  );
}

const Chip = ({ children, kind = 'open', active, onClick }: { children: ReactNode; kind?: string; active?: boolean; onClick?: () => void }) => {
  const cls = `wf-chip wf-chip-${kind}${active ? ' is-active' : ''}${onClick ? ' is-btn' : ''}`;
  return onClick ? <button className={cls} onClick={onClick}>{children}</button> : <span className={cls}>{children}</span>;
};

function Field({ legend, right, children, style }: { legend: ReactNode; right?: ReactNode; children: ReactNode; style?: CSSProperties }) {
  return (
    <section className="wf-field" style={style}>
      <span className="wf-field-legend">{legend}</span>
      {right !== undefined && <span className="wf-field-right">{right}</span>}
      <div className="wf-field-body">{children}</div>
    </section>
  );
}

function BeatFilter({ beats, value, onChange }: { beats: string[]; value: string | null; onChange: (b: string | null) => void }) {
  return (
    <div className="wf-beats">
      <Chip kind="beat" active={value === null} onClick={() => onChange(null)}>all</Chip>
      {beats.map((b) => (
        <Chip key={b} kind="beat" active={value === b} onClick={() => onChange(b)}>{b}</Chip>
      ))}
    </div>
  );
}

export default function WireFront({ wire }: { wire: WireData }) {
  const [lead, setLead] = useState<'week' | 'dive'>('week');
  const [openThread, setOpenThread] = useState<string | null>(wire.threads[0]?.slug ?? null);
  const [beat, setBeat] = useState<string | null>(null);

  const feed = beat ? wire.feed.filter((f) => f.beat === beat) : wire.feed;
  const dive0 = wire.dives[0];
  const wk = wire.theWeek;
  const fieldBg: CSSProperties = { background: 'transparent' };

  const Tab = ({ id, children }: { id: 'week' | 'dive'; children: ReactNode }) => (
    <button onClick={() => setLead(id)} style={{ ...mono, fontSize: 11, padding: '3px 9px', cursor: 'pointer',
      border: '1px solid ' + (lead === id ? 'var(--accent)' : 'var(--rule-strong)'),
      color: lead === id ? '#fff' : 'var(--muted)', background: lead === id ? 'var(--accent)' : 'transparent',
      borderRadius: 3, letterSpacing: '.03em' }}>{children}</button>
  );

  return (
    <div className="wire wire-front">
      <div className="wf-body">
        <div className="wf-cols">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            <Field legend="█ THE WEEK" style={fieldBg}
              right={<span style={{ display: 'inline-flex', gap: 5 }}><Tab id="week">the week</Tab><Tab id="dive">latest dive</Tab></span>}>
              {lead === 'week' && wk ? (
                <div>
                  <div className="wf-kicker" style={{ marginBottom: 12 }}>
                    <span className="wf-prompt">$</span> latest issue <span className="wf-kdot">░</span> № {wk.no} · Week {wk.weekNum} · {wk.weekId} <span className="wf-kdot">░</span> {wk.mins} min
                  </div>
                  <a href={wk.href} className="wf-h-serif wf-lead-h" style={{ marginBottom: 14, display: 'block', color: 'var(--fg)', textDecoration: 'none' }}>{wk.title}</a>
                  <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5, color: 'var(--muted)', maxWidth: 640 }}>{wk.dek}</p>
                  <div style={{ ...mono, fontSize: 11.5, color: 'var(--faint)', marginTop: 16, letterSpacing: '.03em' }}>
                    {wk.weekRange} · published {wk.published} · unbylined house voice · <a href={wk.href} style={{ color: 'var(--accent-2)' }}>read →</a>
                  </div>
                </div>
              ) : dive0 ? (
                <div>
                  <div className="wf-kicker" style={{ marginBottom: 12 }}>
                    <span className="wf-prompt">$</span> deep dive <span className="wf-kdot">░</span> {dive0.date} <span className="wf-kdot">░</span> {dive0.desk}
                  </div>
                  <a href={dive0.href} className="wf-h-serif wf-lead-h wf-lead-h-sm" style={{ marginBottom: 12, display: 'block', color: 'var(--fg)', textDecoration: 'none' }}>{dive0.title}</a>
                  <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5, color: 'var(--muted)', maxWidth: 640 }}>{dive0.dek}</p>
                  <div style={{ ...mono, fontSize: 11.5, color: 'var(--faint)', marginTop: 16, letterSpacing: '.03em' }}>
                    {dive0.author} · {dive0.mins} min · <a href={dive0.href} style={{ color: 'var(--accent-2)' }}>read →</a>
                  </div>
                </div>
              ) : null}
            </Field>

            <Field legend="DEEP DIVES & SPECIALS" right={String(wire.dives.length)} style={fieldBg}>
              <div>
                {wire.dives.map((d, i) => (
                  <div key={d.href} className="wf-dive-row" style={{ borderTop: i ? '1px solid var(--rule)' : 'none' }}>
                    <div style={{ ...mono, fontSize: 11.5, color: 'var(--faint)' }}>{d.date.slice(5)}</div>
                    <div>
                      <a href={d.href} className="wf-h-serif" style={{ fontSize: 19, lineHeight: 1.2, display: 'block', color: 'var(--fg)', textDecoration: 'none' }}>{d.title}</a>
                      <div style={{ fontSize: 14.5, color: 'var(--muted)', margin: '4px 0 7px', maxWidth: 560 }}>{d.dek}</div>
                      <div style={{ ...mono, fontSize: 11, color: 'var(--faint)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--accent-2)' }}>{d.desk}</span>
                        {d.author && <span>· {d.author}</span>}
                        <span>· {d.mins} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Field>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            <Field legend="RUNNING THREADS" right={String(wire.threads.length)} style={fieldBg}>
              <div>
                {wire.threads.map((t, i) => {
                  const open = openThread === t.slug;
                  return (
                    <div key={t.slug} style={{ borderTop: i ? '1px solid var(--rule)' : 'none', padding: '9px 0' }}>
                      <button onClick={() => setOpenThread(open ? null : t.slug)} style={{ display: 'flex', alignItems: 'baseline', gap: 9, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                        <Mom m={t.momentum} />
                        <span style={{ fontSize: 15.5, lineHeight: 1.2, color: 'var(--fg)', flex: 1 }}>{t.title}</span>
                        <span style={{ ...mono, fontSize: 10, color: 'var(--faint)' }}>{open ? '▾' : '▸'}</span>
                      </button>
                      {open && (
                        <div style={{ marginLeft: 22, marginTop: 7 }}>
                          <div style={{ fontSize: 13.5, lineHeight: 1.45, color: 'var(--muted)' }}>{t.summary}</div>
                          {t.tension && (
                            <div style={{ fontSize: 12.5, lineHeight: 1.4, color: 'var(--fg)', borderLeft: '2px solid var(--c-partial)', paddingLeft: 10, margin: '8px 0 0' }}>
                              <span style={{ ...mono, fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--c-partial)', display: 'block', marginBottom: 2 }}>tension</span>
                              {t.tension}
                            </div>
                          )}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 9 }}>
                            {t.issues.map((iss) => (
                              iss.href
                                ? <a key={iss.label} href={iss.href} style={{ ...mono, fontSize: 10.5, color: 'var(--accent-2)', border: '1px solid var(--rule-strong)', borderRadius: 3, padding: '2px 7px', textDecoration: 'none' }}>{iss.label}</a>
                                : <span key={iss.label} style={{ ...mono, fontSize: 10.5, color: 'var(--accent-2)', border: '1px solid var(--rule-strong)', borderRadius: 3, padding: '2px 7px' }}>{iss.label}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Field>

            <Field legend="OPEN PREDICTIONS" right="brier —" style={fieldBg}>
              <div>
                {wire.predictions.map((p, i) => (
                  <a key={p.id} href={p.href} style={{ display: 'block', borderTop: i ? '1px solid var(--rule)' : 'none', padding: '11px 0', textDecoration: 'none', color: 'var(--fg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6, flexWrap: 'wrap' }}>
                      <Chip kind="open">open</Chip>
                      <ConfBar value={p.conf} />
                      <span style={{ ...mono, fontSize: 11, color: 'var(--faint)', marginLeft: 'auto' }}>due {p.due}</span>
                    </div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.35 }}>{p.text}</div>
                  </a>
                ))}
              </div>
            </Field>
          </div>
        </div>

        <Field legend="THE FEED" style={fieldBg}
          right={<span style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}><span>{feed.length} signals · {wire.feed[0]?.date.slice(5) ?? ''}</span><Pulse label="live" /></span>}>
          <div style={{ marginBottom: 14 }}>
            <BeatFilter beats={wire.beats} value={beat} onChange={setBeat} />
          </div>
          <div>
            {feed.map((f, i) => (
              <div key={i} className="wf-feed-row">
                <span style={{ ...mono, fontSize: 11.5, color: 'var(--faint)' }}>{f.date.slice(5)}</span>
                <span><Chip kind="beat">{f.beat}</Chip></span>
                {f.url
                  ? <a href={f.url} style={{ fontSize: 15, lineHeight: 1.3, color: 'var(--fg)', textDecoration: 'none' }}>{f.title}</a>
                  : <span style={{ fontSize: 15, lineHeight: 1.3 }}>{f.title}</span>}
                <span style={{ ...mono, fontSize: 11, color: 'var(--faint)', display: 'inline-flex', gap: 12, whiteSpace: 'nowrap' }}>
                  <span>{f.src}</span>
                  {f.points != null && <span style={{ color: 'var(--accent-2)' }}>⌁ {f.points}</span>}
                </span>
              </div>
            ))}
            {feed.length === 0 && <div style={{ ...mono, fontSize: 13, color: 'var(--faint)', padding: '10px 0' }}>— no signals on this beat —</div>}
          </div>
        </Field>
      </div>
    </div>
  );
}
