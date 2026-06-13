---
layout: default
title: Predictions
permalink: /predictions/
---
{%- assign preds = site.data.predictions -%}
{%- assign open = preds | where: "status", "open" -%}
{%- assign correct = preds | where: "status", "correct" -%}
{%- assign incorrect = preds | where: "status", "incorrect" -%}
{%- assign partial = preds | where: "status", "partial" -%}
{%- assign settled = correct.size | plus: incorrect.size | plus: partial.size -%}
{%- assign bcount = 0 -%}{%- assign bsum = 0.0 -%}
{%- for p in preds -%}{%- if p.brier -%}{%- assign bcount = bcount | plus: 1 -%}{%- assign bsum = bsum | plus: p.brier -%}{%- endif -%}{%- endfor -%}

<div class="page-head">
  <div class="kicker"><span class="prompt" aria-hidden="true">$</span> keep score in public</div>
  <h1 class="page-title">The predictions ledger</h1>
  <p class="dek">Every issue carries a falsifiable call with a stated confidence. Every due call gets settled, right or wrong, and scored with <a href="{{ '/about/' | relative_url }}#brier">Brier</a> — lower is better, 0.25 is a coin flip. Credibility is the product.</p>
</div>

<div class="scorecard">
  <div class="score-cell"><span class="score-n">{{ open.size }}</span><span class="score-l">open</span></div>
  <div class="score-cell"><span class="score-n">{{ correct.size }}–{{ incorrect.size }}</span><span class="score-l">record{% if partial.size > 0 %} (+{{ partial.size }} partial){% endif %}</span></div>
  <div class="score-cell"><span class="score-n">{% if bcount > 0 %}{{ bsum | divided_by: bcount | round: 2 }}{% else %}—{% endif %}</span><span class="score-l">mean Brier</span></div>
  <div class="score-cell"><span class="score-n">{{ settled }}</span><span class="score-l">settled</span></div>
</div>

<table class="ledger">
  <thead>
    <tr><th>Made</th><th>Prediction</th><th class="num">Conf.</th><th>Due</th><th>Status</th><th class="num">Brier</th></tr>
  </thead>
  <tbody>
    {% for p in preds %}
    <tr id="{{ p.id }}">
      <td class="led-made">{% if p.made_link %}<a href="{{ p.made_link | relative_url }}">{{ p.made }}</a>{% else %}{{ p.made }}{% endif %}</td>
      <td class="led-text">{{ p.text }}</td>
      <td class="num">{{ p.confidence }}%</td>
      <td class="led-due">{{ p.due }}</td>
      <td>{% include prediction-chip.html status=p.status %}</td>
      <td class="num">{% if p.brier %}{{ p.brier }}{% else %}<span class="muted-line">—</span>{% endif %}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>

<p class="ledger-note muted-line">Source of truth: <a href="https://github.com/albertogrande/the-wire/blob/main/_data/predictions.yml"><code>_data/predictions.yml</code></a>. Working memory: <a href="{{ '/reports/MEMORY.html' | relative_url }}">editorial memory</a>.</p>
