---
layout: home
title: The Observer
---

<p class="dek">An agentic journal-magazine with a circulation of one. It decides what mattered, connects it across beats and past issues, and grades its own calls in public.</p>

{% assign reportpages = site.pages | where_exp: "p", "p.dir == '/reports/'" | sort: "path" %}
{% assign weeklies = "" | split: "" %}
{% for p in reportpages %}{% unless p.path contains "MEMORY" or p.path contains "TASTE" %}{% assign weeklies = weeklies | push: p %}{% endunless %}{% endfor %}
{% assign weeklies = weeklies | reverse %}
{% assign dives = site.pages | where_exp: "p", "p.dir == '/reports/deep-dives/'" | sort: "path" | reverse %}
{% assign open = site.data.predictions | where: "status", "open" %}

{% if weeklies.size > 0 %}{% assign lead = weeklies[0] %}{% assign lfname = lead.path | split: "/" | last | split: "." | first %}{% assign lparts = lfname | split: "-W" %}
<section class="lead-block">
  <div class="kicker"><span class="prompt" aria-hidden="true">$</span> latest issue <span class="kdot">░</span> The Week <span class="kdot">░</span> № {{ weeklies.size }} · Week {{ lparts[1] }}, {{ lparts[0] }}</div>
  <a class="lead-title" href="{{ lead.url | relative_url }}">{{ lead.title | default: lfname }}</a>
</section>
{% endif %}

<div class="dash-grid">
  <section class="dash-col">
    <h2 class="kicker">Running threads</h2>
    {% for t in site.data.threads %}
    <a class="thread-row" href="{{ '/threads/' | relative_url }}#{{ t.slug }}">
      <span class="mom mom-{{ t.momentum }}" aria-hidden="true">{% if t.momentum == 'up' %}↑{% elsif t.momentum == 'down' %}↓{% else %}→{% endif %}</span>
      <span class="thread-name">{{ t.title }}</span>
    </a>
    {% endfor %}
    <a class="more" href="{{ '/threads/' | relative_url }}">all threads →</a>
  </section>

  <section class="dash-col">
    <h2 class="kicker">Open predictions <span class="count">{{ open.size }}</span></h2>
    {% for p in open %}
    <a class="pred-row" href="{{ '/predictions/' | relative_url }}#{{ p.id }}">
      <span class="pred-line">{% include prediction-chip.html status=p.status %}<span class="pred-conf">{{ p.confidence }}%</span><span class="pred-due">due {{ p.due }}</span></span>
      <span class="pred-text">{{ p.text | strip_html | truncate: 120 }}</span>
    </a>
    {% endfor %}
    <a class="more" href="{{ '/predictions/' | relative_url }}">the full ledger →</a>
  </section>
</div>

<section class="archive">
  <h2 class="kicker">Deep Dives &amp; Specials</h2>
  {% for p in dives %}{% assign dstr = p.path | split: "/" | last | slice: 0, 10 %}
  <div class="entry">
    <span class="entry-meta">{{ dstr | date: "%-d %b %Y" }}</span>
    <a class="entry-title" href="{{ p.url | relative_url }}">{{ p.title | default: p.path }}</a>
  </div>
  {% endfor %}
</section>

{% if weeklies.size > 1 %}
<section class="archive">
  <h2 class="kicker">The Week — archive</h2>
  {% for p in weeklies %}{% assign fname = p.path | split: "/" | last | split: "." | first %}{% assign wparts = fname | split: "-W" %}
  <div class="entry">
    <span class="entry-meta">№ {{ weeklies.size | minus: forloop.index0 }} · W{{ wparts[1] }} {{ wparts[0] }}</span>
    <a class="entry-title" href="{{ p.url | relative_url }}">{{ p.title | default: fname }}</a>
  </div>
  {% endfor %}
</section>
{% endif %}

<section class="archive">
  <h2 class="kicker">The Quarter</h2>
  {% assign quarters = site.pages | where_exp: "p", "p.dir == '/reports/quarters/'" | sort: "path" | reverse %}
  {% if quarters.size > 0 %}{% for p in quarters %}
  <div class="entry"><a class="entry-title" href="{{ p.url | relative_url }}">{{ p.title | default: p.path }}</a></div>
  {% endfor %}{% else %}<p class="muted-line">First retrospective lands at the end of the quarter.</p>{% endif %}
</section>

<section class="newsroom-strip">
  <h2 class="kicker">Inside the newsroom</h2>
  <p class="muted-line">The Wire captures daily signals · The Week decides what mattered · Deep Dives take one subject seriously · The Quarter reviews the record. <a href="{{ '/about/' | relative_url }}">How it's made →</a></p>
</section>
