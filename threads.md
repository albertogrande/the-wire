---
layout: default
title: Threads
permalink: /threads/
---
<div class="page-head">
  <div class="kicker"><span class="prompt" aria-hidden="true">$</span> connect, don't list</div>
  <h1 class="page-title">Running threads</h1>
  <p class="dek">The publication's open storylines, carried across issues. Each tracks momentum — <span class="mom mom-up">↑</span> gaining, <span class="mom mom-steady">→</span> steady, <span class="mom mom-down">↓</span> stalling — and notes evidence that cuts against it.</p>
</div>

<div class="threads">
  {% for t in site.data.threads %}
  <section class="thread" id="{{ t.slug }}">
    <div class="thread-head">
      <span class="mom mom-{{ t.momentum }}" aria-hidden="true">{% if t.momentum == 'up' %}↑{% elsif t.momentum == 'down' %}↓{% else %}→{% endif %}</span>
      <h2 class="thread-title">{{ t.title }}</h2>
      <span class="thread-mom-label">{% if t.momentum == 'up' %}gaining{% elsif t.momentum == 'down' %}stalling{% else %}steady{% endif %}</span>
    </div>
    <p class="thread-summary">{{ t.summary }}</p>
    {% if t.tension %}<p class="thread-tension"><span class="tension-k">Tension</span>{{ t.tension }}</p>{% endif %}
    <div class="thread-issues">
      {% for i in t.issues %}<a class="issue-tag" href="{{ i.link | relative_url }}">{{ i.label }}</a>{% endfor %}
    </div>
  </section>
  {% endfor %}
</div>
