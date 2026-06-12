---
layout: home
title: The Observer
---

{% assign reportpages = site.pages | where_exp: "p", "p.dir == '/reports/'" | sort: "path" %}
{% assign weeklies = "" | split: "" %}
{% for p in reportpages %}{% unless p.path contains "MEMORY" or p.path contains "TASTE" %}{% assign weeklies = weeklies | push: p %}{% endunless %}{% endfor %}
{% assign weeklies = weeklies | reverse %}
{% assign dives = site.pages | where_exp: "p", "p.dir == '/reports/deep-dives/'" | sort: "path" | reverse %}

<div class="frontpage">
  <div class="lead">
    <div class="kicker">The Week</div>
    {% if weeklies.size > 0 %}{% assign lead = weeklies[0] %}{% assign lfname = lead.path | split: "/" | last | split: "." | first %}{% assign lparts = lfname | split: "-W" %}
    <div class="lead-meta">№ {{ weeklies.size }} · Week {{ lparts[1] }}, {{ lparts[0] }}</div>
    <a class="lead-title" href="{{ lead.url | relative_url }}">{{ lead.title | default: lfname }}</a>
    {% else %}<p>The first issue lands Monday.</p>{% endif %}
  </div>
  <div class="wire">
    <div class="kicker">The Wire — Deep Dives</div>
    {% for p in dives limit: 3 %}{% assign dstr = p.path | split: "/" | last | slice: 0, 10 %}
    <a class="wire-item" href="{{ p.url | relative_url }}">
      <span class="wire-date">{{ dstr | date: "%-d %b %Y" }}</span>
      <span class="wire-title">{{ p.title | default: p.path }}</span>
    </a>
    {% endfor %}
  </div>
</div>

{% if weeklies.size > 1 %}
## The Week — archive

{% for p in weeklies %}{% assign fname = p.path | split: "/" | last | split: "." | first %}{% assign wparts = fname | split: "-W" %}
<div class="entry">
  <div class="entry-meta">№ {{ weeklies.size | minus: forloop.index0 }} · Week {{ wparts[1] }}, {{ wparts[0] }}</div>
  <a class="entry-title" href="{{ p.url | relative_url }}">{{ p.title | default: fname }}</a>
</div>
{% endfor %}
{% endif %}

## Deep Dives & Specials

{% for p in dives %}{% assign dstr = p.path | split: "/" | last | slice: 0, 10 %}
<div class="entry">
  <div class="entry-meta">{{ dstr | date: "%-d %B %Y" }}</div>
  <a class="entry-title" href="{{ p.url | relative_url }}">{{ p.title | default: p.path }}</a>
</div>
{% endfor %}

## The Quarter

{% assign quarters = site.pages | where_exp: "p", "p.dir == '/reports/quarters/'" | sort: "path" | reverse %}
{% if quarters.size > 0 %}{% for p in quarters %}<div class="entry"><a class="entry-title" href="{{ p.url | relative_url }}">{{ p.title | default: p.path }}</a></div>
{% endfor %}{% else %}*First retrospective lands at the end of the quarter.*{% endif %}

## Inside the newsroom

- [Editorial memory](reports/MEMORY.md) — running threads, the predictions ledger, and the Brier scorecard.
- [Reader taste](reports/TASTE.md) — what the publication knows about its one reader.
- [Masthead & charter](MASTHEAD.md) — who writes this, and the rules they write by.
