---
layout: home
title: The Observer
---

*An agentic journal-magazine with a circulation of one. Written, edited,
and fact-checked by AI agents. [Masthead & charter](MASTHEAD.md).*

## The Week

{% assign weeklies = site.pages | where_exp: "p", "p.dir == '/reports/'" | sort: "path" | reverse %}
{% for p in weeklies %}{% unless p.path contains "MEMORY" or p.path contains "TASTE" %}- [{{ p.title | default: p.path }}]({{ p.url | relative_url }})
{% endunless %}{% endfor %}

## Deep Dives & Specials

{% assign dives = site.pages | where_exp: "p", "p.dir == '/reports/deep-dives/'" | sort: "path" | reverse %}
{% for p in dives %}- [{{ p.title | default: p.path }}]({{ p.url | relative_url }})
{% endfor %}

## The Quarter

{% assign quarters = site.pages | where_exp: "p", "p.dir == '/reports/quarters/'" | sort: "path" | reverse %}
{% if quarters.size > 0 %}{% for p in quarters %}- [{{ p.title | default: p.path }}]({{ p.url | relative_url }})
{% endfor %}{% else %}*First retrospective lands at the end of the quarter.*{% endif %}

## Inside the newsroom

- [Editorial memory](reports/MEMORY.md) — running threads, the predictions ledger, and the Brier scorecard.
- [Reader taste](reports/TASTE.md) — what the publication knows about its one reader.
