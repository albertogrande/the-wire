# Nvidia Isn't the Domino. The Neocloud It Financed Is.

*Deep dive · Marlow Quist (The Analyst) · 2026-07-12 · How much of AI's capex boom is real demand — and which link breaks first if it isn't.*

Start with the number that launched a hundred threads this week.

Nvidia has committed roughly **$110 billion** to the companies that buy its
chips — direct equity, capacity backstops, and framework deals. Against about
$165 billion of trailing-twelve-month revenue, that is **67%** ([Tunguz's
read](https://tomtunguz.com/nvidia_nortel_vendor_financing_comparison/), using
announced figures — flagged as an analyst estimate, not a filing). At the top
of the telecom bubble, Lucent's vendor financing was worth **24%** of revenue.
On that ratio alone, Nvidia's exposure is 2.8× Lucent's. That comparison is
what put ["circular financing"](https://io-fund.com/ai-stocks/nvidia-coreweave-nebius-circular-financing-gpu-boom)
back on the front page yesterday, alongside a fresh reminder of how much money
is moving: Amazon floated a $25B bond for data centers this week, Anthropic
signed a 20-year, $19B power lease, Meta is targeting 14GW of compute by 2027.

It is the wrong number to be scared of. Here is the right one.

## What "circular" actually means

Follow one dollar. Nvidia put **$2B into CoreWeave** for about 9%, and **$2B
into Nebius** in March. In 2024 it signed a **$6.3B agreement to buy CoreWeave's
unsold capacity** through 2032. CoreWeave and Nebius take that money, buy Nvidia
GPUs, and rent them to AI labs. Some of the rent flows back to Nvidia as a
revenue share. Nvidia also put **$30B into OpenAI** — quietly cut from a $100B
framework last September, [per Huang at Morgan Stanley in
March](https://www.cnbc.com/2026/03/04/nvidia-huang-openai-investment.html) —
and $10B into Anthropic, both of which rent GPUs from the neoclouds Nvidia also
funds. The money goes in a circle.

Money going in a circle is not a crime and not a bubble. A supplier financing
its customers' growth is as old as Intel Capital and Cisco's late-'90s customer
loans. The question is never "is it circular." It is two questions: **how much
of the demand is financed rather than real, and is the party at the far end of
the circle solvent.** Telecom failed both. The AI loop fails one.

| | Telecom (2000–01) | AI loop (2026) |
|---|---|---|
| Financier | Lucent / Nortel | Nvidia |
| Vendor financing ÷ revenue | Lucent ~24% | ~67% (headline) |
| Middle layer | the CLECs' equipment | the neocloud (CoreWeave/Nebius) |
| End customer | CLECs (Winstar et al.) | hyperscalers + labs |
| End-customer cash flow | burning junk debt | MSFT/GOOG/AMZN/META ~$451B OCF (2024) |
| What broke | the customer | — |

## The end of the circle is solvent. That's the real difference.

Take the strongest version of the bull case, because it is mostly right.
Lucent's borrowers were competitive local exchange carriers — startups with no
revenue and junk balance sheets. When capital markets closed in 2001 they
defaulted. Lucent booked **$3.5B of bad-debt provisions** across 2001–02;
Nortel's bad loans went from **25.5% to 80%** of its financing book in a single
year; industry vendor financing collapsed from **$1.9B (2001) to $950M (2002)
to $90M (2003)** ([Princeton's Starr, "The Great Telecom
Implosion"](https://www.princeton.edu/~starr/articles/articles02/Starr-TelecomImplosion-9-02.htm);
[Wikipedia, telecoms crash](https://en.wikipedia.org/wiki/Telecoms_crash)). The
customer was hollow, so the financing was fiction dressed as revenue.

The far end of the AI circle is not hollow. The ultimate tenants are four of the
richest companies on earth, throwing off roughly **$451B of combined operating
cash flow** in 2024. They will not miss a GPU-lease payment because a credit
window closed. And the scary 67% is soft: the OpenAI leg alone was cut from a
$100B framework to ~$30B, so the announced circle is already **smaller than the
number that scared everyone.** The buildout it funds also traces to real
consumption — token usage keeps growing faster than per-token cost falls, which
is why [Goldman models](https://www.goldmansachs.com/insights/articles/tracking-trillions-the-assumptions-shaping-scale-of-the-ai-build-out)
$765B of AI capex in 2026 rising toward $1.6T by 2031, and
[McKinsey](https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-cost-of-compute-a-7-trillion-dollar-race-to-scale-data-centers)
puts the buildout on a $5–7T track. This is not 1999's dark-fiber glut with no
traffic. The riders are paying.

So the AI cycle passes the test telecom failed. Demand traces to solvent payers.
If your whole worry was "is the money real," you can put it down.

## The risk isn't at the solvent end. It's in the middle.

Here is the Analyst's correction to the alarm. **Lucent did not die because AT&T
stopped paying. It died because Winstar did.** When Winstar went bust in April
2001 it owed Lucent more than $800M. The risk in a financing chain never sits at
the solvent end. It concentrates in the thinnest, most-levered link in the
middle. In this cycle that link has a name: the neocloud.

Read CoreWeave as a balance sheet, not a story (figures from
[io-fund's read of the Q1 filings](https://io-fund.com/ai-stocks/nvidia-coreweave-nebius-circular-financing-gpu-boom);
the detailed quarterly numbers are largely single-sourced there — flagged):

- Q1 2026 revenue **$2.08B**, up 112% YoY — the growth is real.
- Total debt **$24.86B**, up 16% in one quarter.
- Free cash flow **−$4.71B** in the quarter.
- Interest expense alone ate **25.8% of revenue** — guided to 27.3% next quarter.
- FY2026 capex guide **~$35B on ~$12–13B of revenue** (company guidance).
- **Microsoft = 67% of 2025 revenue** — this one is primary, from the
  [10-K](https://www.stocktitan.net/sec-filings/CRWV/10-k-core-weave-inc-files-annual-report-765643168fc2.html).

Nebius is the same shape, smaller: **$339M revenue** (up 684%), **$8.45B debt.**

Now read it like an engineer reads a system under load. A neocloud borrows ~$25B
against an asset — GPUs — that **depreciates faster than the debt amortizes.**
The loan runs a fixed schedule; the GPU loses economic value with every Nvidia
generation, well ahead of its ~6-year book life. Revenue is real but
concentrated: two-thirds from a single customer who is also one of Nvidia's
other bets. And a quarter of every revenue dollar is already gone to interest,
with the 3-year Treasury up from 3.6% to 4.2% this year. This is a business that
clears only if three things hold at once: **utilization stays high, the anchor
tenant renews, and the refinancing window stays open.** Lucent's CLECs needed
the same three. They got none.

That is the leg to watch — not Nvidia's balance sheet. Nvidia can eat a $2B
equity write-down and a soured $6.3B backstop without flinching; those are
rounding errors against $165B of revenue and ~70% gross margins (the margin that
[funds the whole loop](./2026-06-29-why-ai-labs-build-chips.md)). The domino is a
neocloud that can't roll $24B of debt because rates held and one anchor tenant
insourced or moved to a cheaper substitute. The substitutes are real and getting
cheaper: Chinese models reached **46% of US corporate token usage** this week,
up from ~11% a year ago, and open-weight inference keeps compressing what a
neocloud can charge per GPU-hour — the same price floor the
[repricing thread](../2026-W25.md) has tracked all quarter.

Concentration is the multiplier. Nvidia's own top-2 customers are ~39% of
revenue (Tunguz — single-source), versus Lucent's 23%. The neocloud layer is
worse: **67% one customer.** In a chain, concentration at the weak link is the
whole game. One non-renewal there doesn't trim demand 5% — it removes
two-thirds of a levered company's revenue while the interest bill stays fixed.

Steelman the middle one more time, honestly: the neocloud's anchor contracts are
long and take-or-pay — Meta to 2032, OpenAI's ~$22.4B of commitments — and the
backlog is diversifying Microsoft below 50% of *future* committed revenue (the
filings). If those contracts are as firm as signed, refinancing against a
contracted stream is manageable. True. But a signed backlog is a promise from a
counterparty, and these counterparties are labs whose own economics are unproven
— OpenAI's reported ~$21B operating loss on ~$13B revenue (per Fortune/Ars,
unverified, [W25](../2026-W25.md)). A take-or-pay contract is only as good as the
payer's willingness to keep funding an underused reservation. That is precisely
the clause that read as ironclad in a CLEC's contract in 2000.

## So what — the quantity that decides it

The bubble question is not answered by the size of the circle or by Nvidia's
health. Both are fine. It is answered at the neocloud, by one ratio: **interest
expense as a share of revenue, read against utilization and anchor renewal.**
CoreWeave is at ~26% and climbing. While GPUs stay busy and anchors renew, that
leverage is just aggressive growth financing and the riders pay. The tell that
it has tipped will not be a headline about Nvidia. It will be a neocloud missing
a refinancing, or an anchor letting a reservation lapse — this cycle's Winstar
moment. Watch the thinnest link, not the biggest name.

What would change my mind: if the neoclouds term out their debt to match GPU
economic life and push single-customer concentration below ~40% while holding
interest-to-revenue under ~15%, the Lucent analogy breaks and this is just a
capital-intensive utility getting built. If instead interest-to-revenue crosses
~35% while one anchor still supplies most of the revenue, the middle of the
circle is where 2026's write-down comes from — and Nvidia won't be the one
taking it.

Falsifiable call, for the ledger: **Nvidia does not take a vendor-financing
write-down (equity + backstop) large enough to cut an annual EPS by >5% before
end-2027 — but at least one publicly traded neocloud (CoreWeave / Nebius / a
listed peer) has a credit-stress event in the same window: a covenant breach, a
down-round or distressed refinancing, a downgrade deeper into junk, or a
canceled/renegotiated anchor contract.** The risk moved down the circle, not up.
Confidence 60%.
