/* Buildathon Radar — renders everything from the live-scraped datasets in /data */
const $ = (s, r = document) => r.querySelector(s);
const num = n => (n ?? 0).toLocaleString('en-US');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const [mid, mezo, env, evm] = await Promise.all([
  fetch('data/midnight.json').then(r => r.json()),
  fetch('data/mezo.json').then(r => r.json()),
  fetch('data/env-projects.json').then(r => r.json()),
  fetch('data/evm-projects.json').then(r => r.json()),
]);
const projects = evm.projects || [];

/* hero */
const heroStats = [
  [num(evm.meta?.totalProducts ?? 4595), 'products scraped', ''],
  ['74', 'buildathons tracked', ''],
  [String(mid.wave1Submissions), 'submissions in the latest wave', ''],
  [num(evm.meta?.evmProjects ?? evm.count ?? projects.length), 'EVM projects identified', 'amber'],
  ['0', 'Mezo-aware projects exist', 'lime'],
];
$('#hero-stats').innerHTML = heroStats.map(([v, k, c]) =>
  `<div class="hstat"><div class="v ${c}">${v}</div><div class="k">${k}</div></div>`).join('');

/* section 01: latest buildathon */
$('#latest-sub').textContent = `${mid.event} — the most recent buildathon actually running on Akindo. Judging for Wave 1 was in progress at scrape time; votes are not public until judging closes.`;
$('#mid-title').textContent = mid.event;
$('#mid-host').textContent = `Host community: Midnight · Track tech: Midnight / Compact · ${mid.builders} registered builders`;
$('#mid-pools').innerHTML = mid.pools.map((p, i) => `<div class="pool-chip">Wave ${i + 1} <b>$${num(p)}</b></div>`).join('') + `<div class="pool-chip">Total <b>$${num(mid.poolTotal)}</b> USDT</div>`;
$('#mid-timeline').innerHTML = [mid.timeline.program, mid.timeline.wave1, mid.timeline.wave2, mid.timeline.wave3].map(t => `<span class="tl-chip">${esc(t)}</span>`).join('');

const bars = (rows, alt = false, unit = '%') => rows.map(([l, v]) => {
  const max = Math.max(...rows.map(r => r[1]));
  return `<div class="bar-row"><span class="lbl">${esc(l)}</span><div class="bar-track"><div class="bar-fill ${alt ? 'alt' : ''}" style="width:${(v / max * 100).toFixed(1)}%"></div></div><span class="val">${v}${unit}</span></div>`;
}).join('');
$('#mid-rubric').innerHTML = bars(mid.rubric);
$('#mid-cats').innerHTML = bars(mid.categories.slice(0, 8), true, '');
$('#mid-stack').innerHTML = mid.stack.map(([t, c]) => `<span class="chip">${esc(t)} <b>${c}</b></span>`).join('');

const q = mid.quality;
const qStats = [
  [q.medianUpdateWords, 'median words per update note', 'good'],
  [q.nearEmpty, `near-empty updates (<100 words) — ${q.nearEmpty}/${mid.wave1Submissions}`, 'bad'],
  [q.deliverableUrl, `filled the formal deliverable URL (${mid.wave1Submissions} total)`, 'warn'],
  [q.github, 'cite a GitHub repo in their description', 'warn'],
  [q.neither, `cite neither repo nor demo — ${Math.round(q.neither / mid.wave1Submissions * 100)}% of the wave`, 'bad'],
  [q.withThreads, 'have any community discussion thread', 'bad'],
];
$('#mid-quality').innerHTML = qStats.map(([v, k, c]) => `<div class="stat"><div class="v ${c}">${v}</div><div class="k">${k}</div></div>`).join('');

$('#collision-teaser').innerHTML = `<b>⚠ Lookalike names:</b> this single wave contains both <b>Veilpay</b> and <b>Vielpay</b> — two different teams — and a third, separate <b>veil-pay</b> sits in the Fhenix buildathon. See section 05.`;

/* tabs over the named lists */
const T = mid.lists;
const ENV_RE = /vinpassport|slopstream/i;
const envNames = (T.envAdjacent || []).filter(n => !ENV_RE.test(n));
const tabs = [
  ['Near-empty (19)', () => `<table class="mini-table"><thead><tr><th>Words</th><th>Project</th><th>Tagline</th></tr></thead><tbody>${
    T.nearEmpty.map(t => `<tr><td class="mono">${t.words}</td><td>${esc(t.product)}</td><td class="dim">${esc((t.tagline || '').slice(0, 80))}</td></tr>`).join('')}</tbody></table>`],
  ['Deliverable URL (6)', () => `<table class="mini-table"><thead><tr><th>Project</th><th>URL</th></tr></thead><tbody>${
    T.deliverable.map(d => `<tr><td>${esc(d.product)}</td><td class="mono">${esc(d.url.replace('https://', ''))}</td></tr>`).join('')}</tbody></table>
    <p class="note">5 GitHub repos + 1 X post. The other 153 submissions left the field blank — links leaked into free-text descriptions instead.</p>`],
  ['GitHub in description (15)', () => `<div class="pill-list">${T.github.map(n => `<span class="pill">${esc(n)}</span>`).join('')}</div>`],
  ['Threads (5)', () => `<div class="pill-list">${T.threads.map(n => `<span class="pill">${esc(n)}</span>`).join('')}</div><p class="note">One thread each. 154 of 159 submissions have zero community discussion — visibility comes from demo quality, not conversation.</p>`],
  ['Themes', () => `
    <div class="theme-block"><h5>Private payroll (${T.themes.privatePayroll.length})</h5><div class="pill-list">${T.themes.privatePayroll.map(n => `<span class="pill">${esc(n)}</span>`).join('')}</div></div>
    <div class="theme-block"><h5>Identity / credentials (${T.themes.identity_category.length})</h5><div class="pill-list">${T.themes.identity_category.map(n => `<span class="pill">${esc(n)}</span>`).join('')}</div></div>
    <div class="theme-block"><h5>Hiring (${T.themes.hiring.length})</h5><div class="pill-list">${T.themes.hiring.map(n => `<span class="pill">${esc(n)}</span>`).join('')}</div></div>
    <div class="theme-block"><h5>Health data (${T.themes.health.length})</h5><div class="pill-list">${T.themes.health.map(n => `<span class="pill">${esc(n)}</span>`).join('')}</div></div>
    <div class="theme-block"><h5>Environment-adjacent (${envNames.length})</h5><div class="pill-list">${envNames.map(n => `<span class="pill">${esc(n)}</span>`).join('')}</div></div>`],
];
const tabsEl = $('#mid-tabs'), bodyEl = $('#mid-tab-body');
tabsEl.innerHTML = tabs.map(([label], i) => `<button class="tab ${i === 0 ? 'active' : ''}" data-i="${i}">${label}</button>`).join('');
const showTab = i => { bodyEl.innerHTML = tabs[i][1](); tabsEl.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', +b.dataset.i === i)); };
tabsEl.addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) showTab(+b.dataset.i); });
showTab(0);

/* section 02: EVM explorer */
$('#explorer-sub').textContent = `${num(projects.length)} projects classified as EVM out of ${num(evm.meta?.totalProducts ?? 4595)} scraped (incl. ${evm.meta?.mixedCrossChain ?? 0} cross-chain). Votes and earnings are private until judging closes — this is stack, categories and submission behaviour.`;
$('#evm-stats').innerHTML = [
  [num(projects.length), 'EVM projects', ''],
  [String(projects.filter(p => p.s >= 3).length), 'resubmitted 3+ times', 'amber'],
  [String(projects.filter(p => p.s === 0).length), 'product pages only', ''],
  [num(evm.meta?.nonEvm ?? 0), 'non-EVM (Aleo, Sui, XRPL, ICP…)', ''],
  [String(evm.meta?.unclassified ?? 0), 'no stack signal (2023-era stubs)', ''],
].map(([v, k, c]) => `<div class="stat"><div class="v ${c}">${v}</div><div class="k">${k}</div></div>`).join('');

const state = { q: '', chain: '', cat: '', sort: 'subs', shown: 60 };
const chains = [...new Set(projects.flatMap(p => p.ch || []))].sort((a, b) =>
  projects.filter(p => (p.ch || []).includes(b)).length - projects.filter(p => (p.ch || []).includes(a)).length);
const cats = [...new Set(projects.flatMap(p => p.cat || []))].sort();
$('#chain-filter').innerHTML = `<option value="">All chains</option>` + chains.map(c => `<option>${esc(c)}</option>`).join('');
$('#cat-filter').innerHTML = `<option value="">All categories</option>` + cats.map(c => `<option>${esc(c)}</option>`).join('');

const filtered = () => {
  const q = state.q.toLowerCase();
  let rows = projects.filter(p => {
    if (state.chain && !(p.ch || []).includes(state.chain)) return false;
    if (state.cat && !(p.cat || []).includes(state.cat)) return false;
    if (q) {
      const hay = `${p.n} ${p.t || ''} ${p.c || ''} ${(p.ch || []).join(' ')} ${(p.cat || []).join(' ')} ${(p.tags || []).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  if (state.sort === 'subs') rows.sort((a, b) => b.s - a.s || (a.n || '').localeCompare(b.n || ''));
  if (state.sort === 'name') rows.sort((a, b) => (a.n || '').localeCompare(b.n || ''));
  if (state.sort === 'community') rows.sort((a, b) => (a.c || '').localeCompare(b.c || ''));
  return rows;
};
const row = p => `<tr>
  <td><div class="pname">${esc(p.n || '(unnamed)')}</div>${p.t ? `<div class="ptag">${esc(p.t.slice(0, 110))}</div>` : ''}</td>
  <td>${esc(p.c || '—')}</td>
  <td><div class="tags-inline">${(p.ch || []).length ? p.ch.map(c => `<span class="tagxs chain">${esc(c)}</span>`).join('') : '<span class="dim tagxs">—</span>'}</div></td>
  <td><div class="tags-inline">${(p.cat || []).slice(0, 3).map(c => `<span class="tagxs">${esc(c)}</span>`).join('')}</div></td>
  <td class="num">${p.s}</td></tr>`;
const render = () => {
  const rows = filtered();
  $('#result-count').textContent = `${num(rows.length)} projects match · showing ${Math.min(state.shown, rows.length)} · sorted by ${state.sort === 'subs' ? 'submission count' : state.sort}`;
  $('#evm-body').innerHTML = rows.slice(0, state.shown).map(row).join('');
  $('#load-more').style.display = rows.length > state.shown ? '' : 'none';
  $('#load-note').textContent = rows.length > state.shown ? `${num(rows.length - state.shown)} more not shown` : '';
};
$('#q').addEventListener('input', e => { state.q = e.target.value; state.shown = 60; render(); });
$('#chain-filter').addEventListener('change', e => { state.chain = e.target.value; state.shown = 60; render(); });
$('#cat-filter').addEventListener('change', e => { state.cat = e.target.value; state.shown = 60; render(); });
$('#sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
$('#reset').addEventListener('click', () => { state.q = ''; state.chain = ''; state.cat = ''; state.shown = 60; $('#q').value = ''; $('#chain-filter').value = ''; $('#cat-filter').value = ''; render(); });
$('#load-more').addEventListener('click', () => { state.shown += 120; render(); });
render();

/* charts */
const hbar = (rows, cls = '') => rows.map(([l, v]) => {
  const max = Math.max(...rows.map(r => r[1]));
  return `<div class="hbar-row"><span class="lbl">${esc(l)}</span><div class="hbar-track"><div class="hbar-fill ${cls}" style="width:${Math.max(2, v / max * 100).toFixed(1)}%"></div></div><span class="val">${num(v)}</span></div>`;
}).join('');
const chainCounts = chains.slice(0, 12).map(c => [c, projects.filter(p => (p.ch || []).includes(c)).length]);
$('#chain-chart').innerHTML = hbar(chainCounts);

const RX = {
  'DEX / AMM / swap / perps': /\bdex\b|\bamm\b|\bswap\b|exchange|liquidity pool|orderbook|order book|perpetual|\bperp\b/i,
  'Lending / vaults / collateral': /lending|borrow|money market|loan|collateral|vault|yield/i,
  'Payments / payroll / invoices': /payment|payroll|remittance|invoice|payout|settlement/i,
  'Dev tooling / SDK / explorers': /\bsdk\b|\bapi\b|indexer|explorer|dashboard|tooling|framework|scaffold|boilerplate|template|starter/i,
  'RWA / tokenization': /\brwa\b|tokeniz|real world asset|treasury|bond/i,
  'Stablecoins': /stablecoin|stable coin|\busdt\b|\busdc\b|\bdai\b/i,
  'Bitcoin-adjacent': /\bbitcoin\b|\bbtc\b|brc-?20|ordinal|lightning|babylon|btcfi/i,
};
const slices = Object.entries(RX).map(([l, rx]) => [l, projects.filter(p => rx.test(`${p.n || ''} ${p.t || ''}`)).length])
  .sort((a, b) => b[1] - a[1]);
slices.push(['Mezo / MUSD', 0]);
$('#slice-chart').innerHTML = hbar(slices, 'lime');

/* section 03: env catalog */
$('#env-body').innerHTML = env.map(e => `<tr>
  <td><div class="pname">${esc(e.name)}</div></td>
  <td>${esc(e.community || '—')}</td>
  <td><div class="ptag">${esc((e.tagline || '').slice(0, 120))}</div></td>
  <td><div class="ev-list">${e.events.slice(0, 2).map(x => `<span>${x.date} · ${esc(x.event.slice(0, 44))}</span>`).join('')}${e.events.length > 2 ? `<span class="dim">+${e.events.length - 2} more</span>` : ''}${e.events.length ? '' : '<span class="dim">product page only</span>'}</div></td>
  <td class="num">${e.subs}</td></tr>`).join('');

/* section 04: mezo */
$('#mezo-sub').textContent = `${mezo.event} — ${mezo.total} across two waves, judged by the Mezo core team on ${mezo.chains.join(', ')}. Pre-registration is open; Wave 1 build starts Oct 16.`;
$('#mezo-waves').innerHTML = `<thead><tr><th>Wave</th><th>Build</th><th>Judging</th><th>Pool</th></tr></thead><tbody>${
  mezo.waves.map(w => `<tr><td>${w.name}</td><td>${w.build}</td><td>${w.judging}</td><td class="num">${w.pool}</td></tr>`).join('')}</tbody>`;
$('#mezo-total').textContent = `Kickoff ${mezo.kickoff} · winners announcement ${mezo.winners}. Prizes are paid in MEZO tokens, not stablecoins.`;
$('#mezo-rubric').innerHTML = bars(mezo.rubric);
$('#mezo-tracks').innerHTML = mezo.tracks.map(t => `<li>${esc(t)}</li>`).join('');
$('#payout-steps').innerHTML = mezo.payout.steps.map(s => `<li>${esc(s)}</li>`).join('');
$('#payout-formula').textContent = mezo.payout.formula;
$('#kyb-docs').innerHTML = mezo.payout.kybDocs.map(d => `<li>${esc(d)}</li>`).join('');
$('#mezo-entry').innerHTML = mezo.entry.map(e => `<span class="chip">${esc(e)}</span>`).join('');
$('#mezo-notes').innerHTML = [
  'Prioritised: teams with a working product adding MUSD/MEZO integration; new teams with a credible long-term plan.',
  'One participant = one team per wave. Every member registers individually on Akindo.',
  'Akindo DevRel screens submissions (integration + working deployment + materials) before the Mezo team scores them.',
  'Wave 2 is a resubmission of the same project and must show meaningful new progress.',
  'Prohibited jurisdictions cannot participate or receive prizes — check the rules before building.',
].map(t => `<li>${t}</li>`).join('');
$('#plays-body').innerHTML = mezo.plays.map(([n, d, t, e]) => `<tr><td><div class="pname">${esc(n)}</div></td><td><div class="ptag">${esc(d)}</div></td><td><span class="tagxs chain">${esc(t)}</span></td><td class="num">${esc(e)}</td></tr>`).join('');

/* section 05: collisions */
$('#veilpay-cards').innerHTML = mid.veilpay.map(v => `<div class="vcard">
  <div class="vn">${esc(v.name)}</div>
  <div class="vid">${v.id}</div>
  <div class="vt">${esc(v.tagline)}</div>
  <div class="vrow"><b>Community:</b> ${esc(v.community)}</div>
  <div class="vrow"><b>Submitted to:</b> ${esc(v.where)}</div>
  <div class="vrow"><b>Links:</b> ${esc(v.note)}</div>
</div>`).join('');
