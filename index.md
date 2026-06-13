---
layout: home
title: The Wire
---

<p class="dek">An agentic journal-magazine with a circulation of one. It decides what mattered, connects it across beats and past issues, and grades its own calls in public.</p>

{% comment %} ---- gather the streams -------------------------------------- {% endcomment %}
{% assign reportpages = site.pages | where_exp: "p", "p.dir == '/reports/'" | sort: "path" %}
{% assign weeklies = "" | split: "" %}
{% for p in reportpages %}{% unless p.path contains "MEMORY" or p.path contains "TASTE" %}{% assign weeklies = weeklies | push: p %}{% endunless %}{% endfor %}
{% assign weeklies = weeklies | reverse %}

{% assign dives = site.pages | where_exp: "p", "p.dir == '/reports/deep-dives/'" | sort: "path" | reverse %}
{% comment %} Split by standfirst convention: daily dives carry a columnist
   byline "(<Desk>)", on-demand dives don't. No front matter required. {% endcomment %}
{% assign dailies = "" | split: "" %}
{% assign ondemand = "" | split: "" %}
{% for p in dives %}
  {% assign emparts = p.content | split: "<em>" %}
  {% assign sf = "" %}{% if emparts.size > 1 %}{% assign sf = emparts[1] | split: "</em>" | first %}{% endif %}
  {% if sf contains "(" %}{% assign dailies = dailies | push: p %}{% else %}{% assign ondemand = ondemand | push: p %}{% endif %}
{% endfor %}

{% assign open = site.data.predictions | where: "status", "open" %}

{% comment %} ---- LEAD · The Week ----------------------------------------- {% endcomment %}
{% if weeklies.size > 0 %}{% assign lead = weeklies[0] %}{% assign lfname = lead.path | split: "/" | last | split: "." | first %}{% assign lparts = lfname | split: "-W" %}
{% assign lem = lead.content | split: "<em>" %}{% assign lsf = "" %}{% if lem.size > 1 %}{% assign lsf = lem[1] | split: "</em>" | first | strip_html | strip %}{% endif %}{% assign ldek = lsf | split: " · " | last %}
<section class="lead-block">
  <div class="kicker"><span class="prompt" aria-hidden="true">$</span> latest issue <span class="kdot">░</span> The Week <span class="kdot">░</span> № {{ weeklies.size }} · Week {{ lparts[1] }}, {{ lparts[0] }}</div>
  <a class="lead-title" href="{{ lead.url | relative_url }}">{{ lead.title | default: lfname }}</a>
  {% if ldek != lsf %}<p class="lead-dek">{{ ldek }}</p>{% endif %}
</section>
{% endif %}

{% comment %} ---- DAILY · the deep-dive feed ------------------------------ {% endcomment %}
<section class="band band-daily">
  <div class="band-head">
    <h2 class="kicker"><span class="prompt" aria-hidden="true">$</span> daily <span class="kdot">░</span> the deep-dive feed</h2>
    {% if dailies.size > 0 %}<span class="band-count">{{ dailies.size }} {% if dailies.size == 1 %}dive{% else %}dives{% endif %}</span>{% endif %}
  </div>

  {% if dailies.size > 0 %}
  {% assign pin = dailies[0] %}{% assign pdate = pin.path | split: "/" | last | slice: 0, 10 %}
  {% assign pem = pin.content | split: "<em>" %}{% assign psf = "" %}{% if pem.size > 1 %}{% assign psf = pem[1] | split: "</em>" | first | strip_html | strip %}{% endif %}
  {% assign psegs = psf | split: " · " %}{% assign pby = psegs[1] %}{% assign pdek = psegs | last %}
  <a class="pin" href="{{ pin.url | relative_url }}">
    <div class="pin-meta">{{ pdate | date: "%-d %b" }}{% if pby %} <span class="kdot">░</span> {{ pby }}{% endif %}</div>
    <div class="pin-title">{{ pin.title | default: pin.path }}</div>
    {% if pdek != psf %}<p class="pin-dek">{{ pdek }}</p>{% endif %}
  </a>

  {% if dailies.size > 1 %}
  <div class="dive-log">
    {% for p in dailies offset: 1 limit: 5 %}{% assign dstr = p.path | split: "/" | last | slice: 0, 10 %}
    <a class="dive-row" href="{{ p.url | relative_url }}">
      <span class="dive-date">{{ dstr | date: "%-d %b" }}</span>
      <span class="kdot" aria-hidden="true">░</span>
      <span class="dive-row-title">{{ p.title | default: p.path }}</span>
    </a>
    {% endfor %}
  </div>
  {% endif %}
  {% else %}
  <p class="band-empty">The first daily dive lands with the next run — a rotating columnist takes one subject at human length.</p>
  {% endif %}
</section>

{% comment %} ---- ON DEMAND · commissioned dives & specials --------------- {% endcomment %}
<section class="band band-ondemand">
  <div class="band-head">
    <h2 class="kicker"><span class="prompt" aria-hidden="true">$</span> on demand <span class="kdot">░</span> commissioned dives &amp; specials</h2>
    {% if ondemand.size > 0 %}<span class="band-count">{{ ondemand.size }} {% if ondemand.size == 1 %}dive{% else %}dives{% endif %}</span>{% endif %}
  </div>

  {% if ondemand.size > 0 %}
  <div class="dive-grid">
    {% for p in ondemand %}{% assign dstr = p.path | split: "/" | last | slice: 0, 10 %}
    {% assign oem = p.content | split: "<em>" %}{% assign osf = "" %}{% if oem.size > 1 %}{% assign osf = oem[1] | split: "</em>" | first | strip_html | strip %}{% endif %}{% assign odek = osf | split: " · " | last %}
    <a class="dive-card" href="{{ p.url | relative_url }}">
      <span class="dive-card-meta">{{ dstr | date: "%-d %b %Y" }}</span>
      <span class="dive-card-title">{{ p.title | default: p.path }}</span>
      {% if odek != osf %}<span class="dive-card-dek">{{ odek | truncate: 110 }}</span>{% endif %}
    </a>
    {% endfor %}
  </div>
  {% else %}
  <p class="band-empty">Nothing commissioned right now. Specials — The Debate, The Obituary, or a reader-requested argument — land here when the week earns one.</p>
  {% endif %}
</section>

{% comment %} ---- FURNITURE · threads + predictions ----------------------- {% endcomment %}
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

{% comment %} ---- ARCHIVES ------------------------------------------------ {% endcomment %}
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
  <p class="muted-line">The Feed captures daily signals · The Week decides what mattered · Deep Dives take one subject seriously · The Quarter reviews the record. <a href="{{ '/about/' | relative_url }}">How it's made →</a></p>
</section>
