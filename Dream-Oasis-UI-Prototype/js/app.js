/* =========================================================
   Dream Oasis — Night Garden prototype logic
   ========================================================= */
(function () {
  const D = window.DO_DATA, U = window.UI;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RANK = { legendary: 4, epic: 3, rare: 2, common: 1 };
  const RARITY_COLOR = { legendary: 'var(--glow)', epic: 'var(--night-bloom)', rare: '#C9D3C4', common: 'var(--lichen)' };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fresh = () => ({
    dreams: JSON.parse(JSON.stringify(D.dreams)), pending: D.pendingId, screen: 'home', mode: 'quick',
    emo: { quick: new Set(), detailed: new Set() }, filter: 'all', sort: 'newest', emptyDemo: false,
    people: [], symbols: new Set(), extraSymbols: [], vivid: 3, lucid: false, newId: null, revealId: null, saving: false,
  });
  let state = fresh();

  // ---------- helpers ----------
  const byId = (id) => state.dreams.find((d) => d.id === id);
  const revealed = () => state.dreams.filter((d) => d.id !== state.pending);
  const words = (t) => (t.trim().match(/\S+/g) || []).length;
  function toast(msg) {
    const t = $('#toast');
    t.innerHTML = U.ICON.sparkle + `<span>${U.esc(msg)}</span>`;
    t.classList.add('is-on');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove('is-on'), 2600);
  }
  const leafPath = (x, y, l, a, fill, op = 1, w = .26) => `<path d="M0 0C${l * .3} ${-l * w} ${l * .72} ${-l * w} ${l} 0C${l * .72} ${l * w} ${l * .3} ${l * w} 0 0Z" transform="translate(${x} ${y}) rotate(${a})" fill="${fill}" opacity="${op}"/>`;
  function miniBloom(cx, cy, r, op = 1) {
    let s = '';
    for (let i = 0; i < 6; i++) s += `<ellipse cx="0" cy="${-r}" rx="${r * .5}" ry="${r}" transform="translate(${cx} ${cy}) rotate(${i * 60})" fill="#E8A0AE" opacity="${.85 * op}"/>`;
    for (let i = 0; i < 5; i++) s += `<ellipse cx="0" cy="${-r * .6}" rx="${r * .3}" ry="${r * .6}" transform="translate(${cx} ${cy}) rotate(${i * 72 + 18})" fill="#F4C9D1" opacity="${op}"/>`;
    return s + `<circle cx="${cx}" cy="${cy}" r="${r * .3}" fill="#E6F3B8" opacity="${op}"/>`;
  }
  const fly = (x, y, r = 1.4) => `<circle cx="${x}" cy="${y}" r="${r * 4}" fill="#C9E86B" opacity=".2" filter="url(#hd-blur)"/><circle cx="${x}" cy="${y}" r="${r}" fill="#E6F3B8"/>`;

  // ---------- static decor ----------
  function decor() {
    $('#home-decor').innerHTML = `<svg viewBox="0 0 250 300" aria-hidden="true"><defs><filter id="hd-blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3"/></filter><radialGradient id="hd-moon" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#C9E86B" stop-opacity=".10"/><stop offset="1" stop-color="#C9E86B" stop-opacity="0"/></radialGradient></defs>
      <circle cx="190" cy="80" r="110" fill="url(#hd-moon)"/>
      <path d="M252 -4C226 40 238 72 212 102C190 128 204 164 178 196" fill="none" stroke="#3C5045" stroke-width="1.4"/>
      ${leafPath(240, 30, 26, 150, '#33473B')}${leafPath(232, 56, 24, -20, '#4E6A55', .8)}${leafPath(214, 98, 24, 170, '#33473B')}${leafPath(204, 132, 22, -10, '#4E6A55', .8)}${leafPath(194, 160, 20, 190, '#33473B')}
      <ellipse cx="226" cy="76" rx="5" ry="8" transform="rotate(20 226 76)" fill="#B9727F" opacity=".7"/>
      ${miniBloom(178, 200, 11, .72)}
      ${fly(150, 64)}${fly(118, 132, 1.1)}${fly(206, 236, 1.2)}</svg>`;
    $('#cta-art').innerHTML = `<svg viewBox="0 0 150 170" aria-hidden="true"><defs><filter id="ca-blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9"/></filter></defs>
      <circle cx="104" cy="58" r="30" fill="#E8A0AE" opacity=".16" filter="url(#ca-blur)"/>
      <path d="M150 170C128 140 118 110 104 70" fill="none" stroke="#4E6A55" stroke-width="1.6"/>
      ${leafPath(132, 140, 30, -150, '#4E6A55', .9)}${leafPath(120, 112, 26, -30, '#33473B', .95)}${leafPath(112, 94, 22, -160, '#6F8A72', .6)}
      ${miniBloom(104, 58, 15, .95)}<circle cx="66" cy="34" r="1.4" fill="#E6F3B8"/><circle cx="66" cy="34" r="5" fill="#C9E86B" opacity=".2" filter="url(#ca-blur)"/></svg>`;
  }

  // ================= HOME =================
  function renderHome() {
    const h = new Date().getHours();
    const g = h < 5 ? 'Still awake' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    $('#greeting').innerHTML = `${g},<br><em>${D.user.name}</em>`;
    $('#home-date').textContent = U.fmt.weekday(D.today);

    const p = state.pending && byId(state.pending);
    $('#pending-slot').innerHTML = p ? `<button class="pending" data-reveal="${p.id}" aria-label="Reveal ${U.esc(p.title)}">
        <span class="pending__card">${U.cardBack()}</span>
        <span class="pending__body"><span class="eyebrow">Waiting to bloom</span><span class="pending__title">${U.esc(p.title)}</span><span class="caption">Recorded ${U.fmt.relative(p.date, D.today).toLowerCase()} at ${p.time}</span></span>
        <span class="pending__cta">Reveal</span></button>` : '';

    const dates = new Set(state.dreams.map((d) => d.date));
    let streak = 0; const t = new Date(D.today + 'T00:00:00');
    for (; ;) { const iso = new Date(t - streak * 86400000); const s = `${iso.getFullYear()}-${String(iso.getMonth() + 1).padStart(2, '0')}-${String(iso.getDate()).padStart(2, '0')}`; if (dates.has(s)) streak++; else break; }
    const week = [...Array(7)].map((_, i) => { const d = new Date(t - (6 - i) * 86400000); return dates.has(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`); });
    const rv = revealed();
    const leg = rv.filter((d) => d.rarity === 'legendary').length, epic = rv.filter((d) => d.rarity === 'epic').length;
    $('#stats').innerHTML = `
      <div class="stat"><span class="stat__value">${state.dreams.length}</span><span class="stat__label">Dreams</span><span class="stat__sub">${week.filter(Boolean).length} this week</span></div>
      <div class="stat"><span class="stat__value">${streak}</span><span class="stat__label">Night streak</span><span class="stat__spark" aria-label="Last 7 nights">${week.map((on) => `<i class="${on ? 'on' : ''}"></i>`).join('')}</span></div>
      <div class="stat"><span class="stat__value">${rv.length}</span><span class="stat__label">Cards</span><span class="stat__sub">${leg ? `${leg} legendary` : `${epic} epic`}</span></div>`;

    $('#recent').innerHTML = [...rv].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map((d) => U.row(d, D.today)).join('');
    const quote = rv.find((d) => d.rarity === 'legendary') || rv[0];
    $('#home-quote').innerHTML = quote ? `<span class="eyebrow">From your garden · ${U.esc(quote.title)}</span><p>“${U.esc(quote.reflection)}”</p>` : '';
  }

  // ================= NAVIGATION =================
  function go(target, opts = {}) {
    closeSheet(true);
    let screen = target;
    if (target === 'record-detailed' || target === 'record-quick') { screen = 'record'; setMode(target === 'record-detailed' ? 'detailed' : 'quick'); }
    state.screen = screen;
    $$('.screen').forEach((s) => s.classList.toggle('is-active', s.dataset.screen === screen));
    const el = $(`#screen-${screen}`); if (el && !opts.keepScroll) el.scrollTop = 0;
    $$('.tab').forEach((t) => t.toggleAttribute('aria-current', false));
    const tab = $(`.tab[data-go="${screen}"]`); if (tab) tab.setAttribute('aria-current', 'page');
    $('#tabbar').classList.toggle('is-hidden', screen === 'record');
    $('#rec-actions').classList.toggle('is-on', screen === 'record');
    syncPanel(target === 'record' ? `record-${state.mode}` : target);
    try { history.replaceState(null, '', '#' + screen); } catch (e) { /* sandboxed */ }
  }
  function syncPanel(key) { $$('.panel__link[data-jump]').forEach((b) => b.setAttribute('aria-current', String(b.dataset.jump === key))); }

  // ================= RECORD =================
  function setMode(mode) {
    state.mode = mode;
    $('#mode').dataset.value = mode;
    $$('#mode [role="tab"]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.mode === mode)));
    $$('.rec-form').forEach((f) => f.classList.toggle('is-active', f.dataset.mode === mode));
    $('#save-btn .btn__label').textContent = mode === 'quick' ? 'Save & reveal card' : 'Save dream & reveal card';
    $('#save-hint').textContent = mode === 'quick' ? 'Your card grows from the words you write.' : 'Detail and vividness give rarer cards a better chance.';
    if (state.screen === 'record') syncPanel(`record-${mode}`);
  }
  function renderEmotionChips() {
    ['quick', 'detailed'].forEach((m) => {
      $(`#${m === 'quick' ? 'q' : 'd'}-emotions`).innerHTML = D.emotions.map((e) => U.chip(e, state.emo[m].has(e), `data-emo="${e}" data-form="${m}"`)).join('');
    });
  }
  function renderSymbols() {
    const all = [...D.suggestedSymbols, ...state.extraSymbols];
    $('#d-symbols').innerHTML = all.map((s) => U.chip(s, state.symbols.has(s), `data-sym="${U.esc(s)}"`).replace('class="chip"', 'class="chip chip--tag"')).join('');
  }
  function renderPeople() {
    $('#d-people-tokens').innerHTML = state.people.map((p, i) => `<span class="chip chip--tag chip--removable" style="background:var(--paper-a06)">${U.esc(p)}<button type="button" class="chip__x" data-rm-person="${i}" aria-label="Remove ${U.esc(p)}">${U.ICON.close.replace('<svg', '<svg width="12" height="12"')}</button></span>`).join('');
  }
  function updateCount(id) { const n = words($(`#${id}-text`).value); $(`#${id}-count`).textContent = `${n} ${n === 1 ? 'word' : 'words'}`; }
  function typeInto(el, text, done) {
    if (reduceMotion) { el.value = text; el.dispatchEvent(new Event('input', { bubbles: true })); done && done(); return; }
    el.value = ''; let i = 0; el.focus();
    const step = () => { i += 3; el.value = text.slice(0, i); el.dispatchEvent(new Event('input', { bubbles: true })); el.scrollTop = el.scrollHeight; if (i < text.length) setTimeout(step, 14); else done && done(); };
    step();
  }

  const MOTIF_RULES = [[/lake|sea|ocean|river|swim|underwater|library|book/, 'lake'], [/stair|tide|flood|pool|water/, 'tide'], [/door|gate|key|threshold/, 'door'], [/moth|butterfl|wing|choir|sing/, 'moths'], [/fern|forest|lantern|path|woods/, 'lantern'], [/grand|house|home|greenhouse|rose/, 'greenhouse'], [/fall|petal|drop/, 'petals'], [/clock|late|time|hour|mushroom/, 'mushrooms'], [/tree|orchard|glass|fruit|bell/, 'orchard']];
  const MOTIF_META = {
    lake: ['Beneath Still Water', 'Discovery', 'What you are looking for is already written somewhere inside you.'],
    tide: ['The Rising Pool', 'Hidden feelings', 'Something you stepped over is rising. Let it be felt.'],
    door: ['The Unopened Door', 'Threshold', 'An invitation is waiting for your answer.'],
    moths: ['Wings in the Dark', 'Belonging', 'You are drawn toward a light you have not named yet.'],
    lantern: ['Small Lights', 'Guidance', 'Small lights are enough to find the way.'],
    greenhouse: ['Under Glass', 'Inheritance', 'Something tended long ago is still growing in you.'],
    petals: ['Soft Descent', 'Letting go', 'Falling softly is still falling. You can stop bracing.'],
    mushrooms: ['The Hour Grows', 'Time', 'You are counting time that is not yours to keep.'],
    orchard: ['Ringing Branches', 'Clarity', 'You are listening for something fragile, but true.'],
    seed: ['A First Sprout', 'Beginnings', 'Something small has started. Give it a little light.'],
  };
  function growCard({ text, title, date, emotions, symbols, people, place, vivid, lucid }) {
    const low = text.toLowerCase();
    const motif = (MOTIF_RULES.find(([re]) => re.test(low)) || [0, 'seed'])[1];
    let h = 2166136261; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    const roll = (h >>> 0) % 100;
    let tier = roll < 6 ? 4 : roll < 22 ? 3 : roll < 52 ? 2 : 1;
    if (words(text) >= 25) tier = Math.max(tier, 2);
    if (lucid || vivid >= 4) tier = Math.min(4, tier + 1);
    const rarity = Object.keys(RANK).find((k) => RANK[k] === tier);
    const [defTitle, theme, reflection] = MOTIF_META[motif];
    const no = Math.max(...state.dreams.map((d) => d.no)) + 1;
    const now = new Date();
    return {
      id: 'd' + String(no).padStart(3, '0') + '-' + Date.now().toString(36), no, title: title.trim() || defTitle, date: date || D.today,
      time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), motif, rarity, theme,
      emotion: [...emotions][0] || 'Curious', symbols: symbols.length ? symbols.slice(0, 4) : [theme], people, place: place || '', reflection, text: text.trim(),
    };
  }
  function save() {
    if (state.saving) return;
    const quick = state.mode === 'quick';
    const p = quick ? 'q' : 'd';
    const textEl = $(`#${p}-text`); const field = $(`#${p}-text-field`);
    if (words(textEl.value) < 4) {
      field.classList.add('has-error'); textEl.focus();
      textEl.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 280 });
      return;
    }
    state.saving = true;
    const btn = $('#save-btn');
    btn.classList.add('is-loading'); btn.querySelector('.btn__label').innerHTML = '<span class="saved-mark"><span class="spinner"></span>Planting your dream…</span>';
    const dream = growCard({
      text: textEl.value, title: $(`#${p}-title`).value, date: quick ? $('#q-date').value : D.today, emotions: state.emo[state.mode],
      symbols: quick ? [] : [...state.symbols], people: quick ? [] : [...state.people], place: quick ? '' : $('#d-place').value,
      vivid: quick ? 3 : state.vivid, lucid: quick ? false : state.lucid,
    });
    setTimeout(() => {
      btn.querySelector('.btn__label').innerHTML = `<span class="saved-mark">${U.ICON.check.replace('<svg', '<svg width="18" height="18"')}Saved to your journal</span>`;
      setTimeout(() => {
        state.dreams.unshift(dream); state.pending = dream.id;
        resetForms(); btn.classList.remove('is-loading'); setMode(state.mode); state.saving = false;
        renderAll(); openReveal(dream.id);
      }, 650);
    }, 1300);
  }
  function resetForms() {
    $$('#form-quick input:not([type=date]), #form-quick textarea, #form-detailed input, #form-detailed textarea').forEach((el) => { el.value = ''; });
    $('#q-date').value = D.today;
    state.emo = { quick: new Set(), detailed: new Set() }; state.people = []; state.symbols = new Set(); state.vivid = 3; state.lucid = false;
    $$('.field.has-error').forEach((f) => f.classList.remove('has-error'));
    renderEmotionChips(); renderSymbols(); renderPeople(); renderVivid(); $('#d-lucid').setAttribute('aria-checked', 'false'); updateCount('q'); updateCount('d');
  }
  function renderVivid() { $$('#d-vivid button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.v === state.vivid))); }

  // ================= REVEAL =================
  const REVEAL_COPY = { common: 'A quiet bloom', rare: 'A rare bloom', epic: 'An epic bloom', legendary: 'A legendary bloom' };
  function openReveal(id) {
    const d = byId(id); if (!d) return;
    closeSheet(true);
    state.revealId = id;
    const r = $('#reveal');
    r.dataset.state = 'idle'; r.dataset.rarity = d.rarity;
    $('#reveal-back').innerHTML = U.cardBack();
    $('#reveal-front').innerHTML = U.card(d);
    $('#reveal-flip').classList.remove('is-flipped');
    $('#reveal-eyebrow').textContent = 'New card';
    $('#reveal-title').textContent = 'A dream has taken root';
    $('#reveal-sub').textContent = `${d.title} · recorded ${U.fmt.relative(d.date, D.today).toLowerCase()} at ${d.time}`;
    $('#burst').innerHTML = '';
    r.hidden = false; requestAnimationFrame(() => r.classList.add('is-open'));
    $('#tabbar').classList.add('is-hidden'); $('#rec-actions').classList.remove('is-on');
    syncPanel('reveal');
    setTimeout(() => $('#reveal-flip').focus({ preventScroll: true }), 300);
  }
  function flipReveal() {
    const r = $('#reveal'); if (r.dataset.state !== 'idle') return;
    const d = byId(state.revealId);
    r.dataset.state = 'charging';
    setTimeout(() => {
      r.dataset.state = 'flipping';
      $('#reveal-flip').classList.add('is-flipped');
      const f = $('#flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
      setTimeout(() => burst(d.rarity), 420);
      setTimeout(() => {
        r.dataset.state = 'revealed';
        $('#reveal-eyebrow').textContent = `Nº ${U.pad(d.no)} · added to your garden`;
        $('#reveal-title').textContent = REVEAL_COPY[d.rarity];
        $('#reveal-sub').textContent = `${d.theme} · ${d.emotion}`;
        if (state.pending === d.id) { state.pending = null; state.newId = d.id; renderAll(); }
      }, 950);
    }, reduceMotion ? 0 : 380);
  }
  function burst(rarity) {
    if (reduceMotion) return;
    const n = { common: 10, rare: 16, epic: 22, legendary: 36 }[rarity];
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2; const dist = 110 + Math.random() * 120;
      s += `<i class="${rarity === 'epic' && i % 2 ? 'pink' : ''}" style="--dx:${Math.cos(a) * dist}px;--dy:${Math.sin(a) * dist - 60}px;animation-delay:${Math.random() * 300}ms;width:${3 + Math.random() * 4}px;height:${3 + Math.random() * 4}px"></i>`;
    }
    $('#burst').innerHTML = s;
  }
  function closeReveal(then) {
    const r = $('#reveal');
    r.classList.remove('is-open');
    setTimeout(() => { r.hidden = true; if (then) then(); }, reduceMotion ? 0 : 400);
    if (r.dataset.state !== 'revealed' && state.pending) toast('Your card will wait for you on Home');
  }

  // ================= COLLECTION =================
  const EMPTY_ART = `<svg viewBox="0 0 132 132" aria-hidden="true"><defs><filter id="em-b" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6"/></filter></defs>
    <circle cx="66" cy="62" r="40" fill="#C9E86B" opacity=".08"/><path d="M38 84h56l-7 32H45z" fill="#2F3E36"/><path d="M34 80h64v8H34z" fill="#3C5045"/>
    <path d="M66 80C64 66 70 58 66 46" fill="none" stroke="#6F8A72" stroke-width="2" stroke-linecap="round"/>${leafPath(66, 56, 18, -150, '#6F8A72')}${leafPath(66, 52, 16, -28, '#4E6A55')}
    <circle cx="66" cy="44" r="8" fill="#C9E86B" opacity=".5" filter="url(#em-b)"/><circle cx="66" cy="44" r="2.6" fill="#E6F3B8"/></svg>`;
  function renderCollection() {
    const all = state.emptyDemo ? [] : revealed();
    const counts = { legendary: 0, epic: 0, rare: 0, common: 0 };
    all.forEach((d) => counts[d.rarity]++);
    $('#col-count').innerHTML = `${all.length}<small>${all.length === 1 ? 'card' : 'cards'} since ${D.user.joined}</small>`;
    $('#rarity-bar').innerHTML = all.length ? Object.entries(counts).filter(([, n]) => n).map(([k, n]) => `<span style="flex:${n};background:${RARITY_COLOR[k]}" title="${n} ${k}"></span>`).join('') : '<span style="flex:1;background:var(--fern)"></span>';
    $('#rarity-legend').innerHTML = Object.entries(counts).map(([k, n]) => `<span><b>${n}</b> ${U.cap(k)}</span>`).join('');
    $('#filters').innerHTML = [['all', 'All', all.length], ...Object.entries(counts).map(([k, n]) => [k, U.cap(k), n])]
      .map(([k, label, n]) => `<button type="button" class="chip" aria-pressed="${state.filter === k}" data-filter="${k}">${label} <span class="chip__count">${n}</span></button>`).join('');
    let list = state.filter === 'all' ? all : all.filter((d) => d.rarity === state.filter);
    list = [...list].sort((a, b) => state.sort === 'newest' ? b.date.localeCompare(a.date) : state.sort === 'oldest' ? a.date.localeCompare(b.date) : RANK[b.rarity] - RANK[a.rarity] || b.date.localeCompare(a.date));
    $('#result-count').textContent = state.filter === 'all' ? `Showing all ${list.length}` : `${list.length} ${state.filter}`;
    $('#sort-label').textContent = { newest: 'Newest first', oldest: 'Oldest first', rarity: 'Rarest first' }[state.sort];
    $$('#sort-menu button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.sort === state.sort)));
    if (!list.length) {
      const whole = !all.length;
      $('#grid-slot').innerHTML = `<div class="empty">${EMPTY_ART}<h2 class="heading">${whole ? 'Your garden is waiting' : `No ${state.filter} blooms yet`}</h2>
        <p>${whole ? 'Every dream you record grows into a card. Your first one is a few sentences away.' : state.filter === 'legendary' ? 'Legendary cards are rare. Vivid, detailed entries give them a better chance to appear.' : 'Keep recording. New cards appear here as your garden grows.'}</p>
        ${whole ? '<button class="btn btn--primary" data-go="record">Record a dream</button>' : '<button class="btn btn--secondary" data-filter="all">Show all cards</button>'}</div>`;
      return;
    }
    $('#grid-slot').innerHTML = `<div class="grid">${list.map((d) => `<button class="dcard-btn${d.id === state.newId ? ' is-new' : ''}" data-open="${d.id}" aria-label="Open ${U.esc(d.title)}">${U.card(d)}</button>`).join('')}</div>`;
  }

  // ================= DETAIL SHEET =================
  function openDetail(id) {
    const d = byId(id); if (!d) return;
    $$('.dcard-btn.is-selected').forEach((b) => b.classList.remove('is-selected'));
    const btn = $(`.dcard-btn[data-open="${id}"]`); if (btn) btn.classList.add('is-selected');
    $('#detail-eyebrow').textContent = `Nº ${U.pad(d.no)} · ${U.cap(d.rarity)}`;
    const facts = [['Emotion', d.emotion], ['Theme', d.theme], ['People', d.people.length ? d.people.join(', ') : 'Just you'], ['Place', d.place || 'Not noted']];
    $('#detail-body').innerHTML = `<div class="detail">
      <div class="flip detail__card is-flipped" id="detail-flip"><div class="flip__inner"><div class="flip__face">${U.cardBack()}</div><div class="flip__face flip__face--front">${U.card(d)}</div></div></div>
      <button class="detail__turn" id="detail-turn">${U.ICON.turn}Turn card over</button>
      <div class="detail__head"><h2 class="title" id="detail-title">${U.esc(d.title)}</h2><p class="caption">${U.fmt.long(d.date)} · ${d.time} · <span class="rarity-tag" data-rarity="${d.rarity}">${U.cap(d.rarity)}</span></p></div>
      <section class="detail__block"><h3 class="eyebrow">The dream</h3><p class="detail__text">${U.esc(d.text)}</p></section>
      <section class="detail__block"><h3 class="eyebrow">Reflection</h3><p class="serif-italic" style="font-size:19px;line-height:1.4;color:var(--text-2)">${U.esc(d.reflection)}</p></section>
      <section class="detail__block"><h3 class="eyebrow">Symbols</h3><div class="chips">${d.symbols.map((s) => `<span class="chip chip--tag">${U.esc(s)}</span>`).join('')}</div></section>
      <section class="detail__block"><dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${U.esc(v)}</dd></div>`).join('')}</dl></section>
      <button class="btn btn--secondary btn--block" data-toast="Sharing arrives with the community release">${U.ICON.share}Share this card</button>
    </div>`;
    const s = $('#sheet'); s.hidden = false; requestAnimationFrame(() => s.classList.add('is-open'));
    $('#detail-body').scrollTop = 0;
    syncPanel('detail');
  }
  function closeSheet(instant) {
    const s = $('#sheet'); if (s.hidden) return;
    s.classList.remove('is-open');
    $$('.dcard-btn.is-selected').forEach((b) => b.classList.remove('is-selected'));
    if (instant) { s.hidden = true; return; }
    setTimeout(() => { s.hidden = true; }, 420);
    syncPanel(state.screen);
  }

  function renderAll() { renderHome(); renderCollection(); }

  // ================= EVENTS =================
  document.addEventListener('click', (e) => {
    const t = e.target;
    const goEl = t.closest('[data-go]'); if (goEl) { go(goEl.dataset.go); return; }
    const rv = t.closest('[data-reveal]'); if (rv) { openReveal(rv.dataset.reveal); return; }
    const op = t.closest('[data-open]'); if (op) { openDetail(op.dataset.open); return; }
    const tst = t.closest('[data-toast]'); if (tst) { toast(tst.dataset.toast); return; }
    if (t.closest('[data-close]')) { closeSheet(); return; }
    const emo = t.closest('[data-emo]');
    if (emo) {
      const set = state.emo[emo.dataset.form]; const v = emo.dataset.emo;
      if (set.has(v)) set.delete(v); else if (set.size >= 3) { toast('Choose up to three feelings'); return; } else set.add(v);
      emo.setAttribute('aria-pressed', String(set.has(v))); return;
    }
    const sym = t.closest('[data-sym]'); if (sym) { const v = sym.dataset.sym; state.symbols.has(v) ? state.symbols.delete(v) : state.symbols.add(v); sym.setAttribute('aria-pressed', String(state.symbols.has(v))); return; }
    const rmP = t.closest('[data-rm-person]'); if (rmP) { state.people.splice(+rmP.dataset.rmPerson, 1); renderPeople(); return; }
    const flt = t.closest('[data-filter]'); if (flt) { state.filter = flt.dataset.filter; renderCollection(); return; }
    const srt = t.closest('[data-sort]'); if (srt) { state.sort = srt.dataset.sort; $('#sort-menu').hidden = true; $('#sort-btn').setAttribute('aria-expanded', 'false'); renderCollection(); return; }
    if (t.closest('#sort-btn')) { const m = $('#sort-menu'); m.hidden = !m.hidden; $('#sort-btn').setAttribute('aria-expanded', String(!m.hidden)); return; }
    if (!t.closest('#sort-menu')) $('#sort-menu').hidden = true;
    const mode = t.closest('#mode [data-mode]'); if (mode) { setMode(mode.dataset.mode); return; }
    const sample = t.closest('[data-sample]');
    if (sample) {
      const p = sample.dataset.sample; $(`#${p}-text-field`).classList.remove('has-error');
      typeInto($(`#${p}-text`), D.sample.text, () => { if (!$(`#${p}-title`).value) $(`#${p}-title`).value = D.sample.title; });
      return;
    }
    const viv = t.closest('#d-vivid [data-v]'); if (viv) { state.vivid = +viv.dataset.v; renderVivid(); return; }
    if (t.closest('#d-lucid')) { state.lucid = !state.lucid; $('#d-lucid').setAttribute('aria-checked', String(state.lucid)); return; }
    if (t.closest('#d-people-add')) { addPerson(); return; }
    if (t.closest('#save-btn')) { save(); return; }
    if (t.closest('#reveal-flip')) { flipReveal(); return; }
    if (t.closest('#reveal-close')) { closeReveal(() => go(state.screen === 'record' ? 'home' : state.screen)); return; }
    if (t.closest('#reveal-keep')) { const id = state.revealId; closeReveal(() => { go('collection'); const el = $(`.dcard-btn[data-open="${id}"]`); const sc = $('#screen-collection'); if (el) sc.scrollTo({ top: el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 160, behavior: reduceMotion ? 'auto' : 'smooth' }); }); return; }
    if (t.closest('#reveal-home')) { closeReveal(() => go('home')); return; }
    if (t.closest('#detail-turn')) { $('#detail-flip').classList.toggle('is-flipped'); return; }
    const jump = t.closest('[data-jump]');
    if (jump) {
      const k = jump.dataset.jump;
      if (k === 'reveal') { go('home'); openReveal(state.pending || revealed().sort((a, b) => b.date.localeCompare(a.date))[0].id); }
      else if (k === 'detail') { go('collection'); const first = revealed()[0]; if (first) openDetail(first.id); }
      else go(k);
      return;
    }
    if (t.closest('[data-action="empty"]')) { state.emptyDemo = !state.emptyDemo; state.filter = 'all'; $('#empty-state').textContent = state.emptyDemo ? 'On' : 'Off'; renderCollection(); go('collection'); return; }
    if (t.closest('[data-action="reset"]')) { state = fresh(); $('#empty-state').textContent = 'Off'; resetForms(); renderAll(); setMode('quick'); go('home'); toast('Prototype reset'); }
  });
  function addPerson() { const inp = $('#d-people'); const v = inp.value.trim().replace(/,$/, ''); if (v) { state.people.push(v); inp.value = ''; renderPeople(); } inp.focus(); }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!$('#sheet').hidden) closeSheet(); else if (!$('#reveal').hidden) closeReveal(() => go('home')); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.id === 'reveal-flip') { e.preventDefault(); flipReveal(); }
    if (e.target.id === 'd-people' && (e.key === 'Enter' || e.key === ',')) { e.preventDefault(); addPerson(); }
    if (e.target.id === 'd-symbol-new' && e.key === 'Enter') { e.preventDefault(); const v = e.target.value.trim(); if (v) { if (!D.suggestedSymbols.includes(v) && !state.extraSymbols.includes(v)) state.extraSymbols.push(v); state.symbols.add(v); e.target.value = ''; renderSymbols(); } }
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'q-text' || e.target.id === 'd-text') { const p = e.target.id[0]; updateCount(p); if (words(e.target.value) >= 4) $(`#${p}-text-field`).classList.remove('has-error'); }
  });
  $$('form').forEach((f) => f.addEventListener('submit', (e) => { e.preventDefault(); save(); }));

  // ---------- device fit (desktop) ----------
  function fit() {
    const dev = $('#device'), wrap = $('#device-wrap');
    if (window.innerWidth <= 520) { dev.style.transform = ''; wrap.style.height = ''; wrap.style.width = ''; return; }
    const s = Math.max(.62, Math.min(1, (window.innerHeight - 56) / dev.offsetHeight));
    dev.style.transform = `scale(${s})`; wrap.style.width = dev.offsetWidth * s + 'px'; wrap.style.height = dev.offsetHeight * s + 'px';
  }

  // ---------- boot ----------
  $$('[data-icon]').forEach((el) => { el.innerHTML = U.ICON[el.dataset.icon] || ''; });
  decor(); renderEmotionChips(); renderSymbols(); renderPeople(); renderVivid(); renderAll(); setMode('quick');
  const start = (location.hash || '#home').slice(1);
  go(['home', 'record', 'collection'].includes(start) ? start : 'home');
  fit(); window.addEventListener('resize', fit);
})();
