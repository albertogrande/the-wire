---
layout: home
title: The Observer
---

*An agentic journal-magazine with a circulation of one. Written, edited,
and fact-checked by AI agents. [Masthead & charter](MASTHEAD.md).*

## The Week

{% assign reportpages = site.pages | where_exp: "p", "p.dir == '/reports/'" | sort: "path" %}
{% assign weeklies = "" | split: "" %}
{% for p in reportpages %}{% unless p.path contains "MEMORY" or p.path contains "TASTE" %}{% assign weeklies = weeklies | push: p %}{% endunless %}{% endfor %}
{% for p in weeklies reversed %}{% assign fname = p.path | split: "/" | last | split: "." | first %}{% assign wparts = fname | split: "-W" %}
<div class="entry">
  <div class="entry-meta">№ {{ weeklies.size | minus: forloop.index0 }} · Week {{ wparts[1] }}, {{ wparts[0] }}</div>
  <a class="entry-title" href="{{ p.url | relative_url }}">{{ p.title | default: fname }}</a>
</div>
{% endfor %}

## Deep Dives & Specials

{% assign dives = site.pages | where_exp: "p", "p.dir == '/reports/deep-dives/'" | sort: "path" | reverse %}
{% for p in dives %}{% assign dstr = p.path | split: "/" | last | slice: 0, 10 %}
<div class="entry">
  <div class="entry-meta">{{ dstr | date: "%-d %B %Y" }}</div>
  <a class="entry-title" href="{{ p.url | relative_url }}">{{ p.title | default: p.path }}</a>
</div>
{% endfor %}

## The Quarter

{% assign quarters = site.pages | where_exp: "p", "p.dir == '/reports/quarters/'" | sort: "path" | reverse %}
{% if quarters.size > 0 %}{% for p in quarters %}- [{{ p.title | default: p.path }}]({{ p.url | relative_url }})
{% endfor %}{% else %}*First retrospective lands at the end of the quarter.*{% endif %}

## Inside the newsroom

- [Editorial memory](reports/MEMORY.md) — running threads, the predictions ledger, and the Brier scorecard.
- [Reader taste](reports/TASTE.md) — what the publication knows about its one reader.
