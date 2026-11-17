/* =========================================================
   Reusable UI pieces (return HTML strings)
   ========================================================= */
(function () {
  const sv = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  const ICON = {
    garden: sv('<path d="M12 21V11"/><path d="M12 13C12 8.5 9 6 5 6c0 4.5 3 7 7 7Z"/><path d="M12 11c0-4 2.6-6.5 6.5-6.5 0 4-2.6 6.5-6.5 6.5Z"/>'),
    pen: sv('<path d="M5 19l1.2-4.4L16.4 4.4a2 2 0 0 1 2.9 2.9L9.1 17.5 5 19Z"/><path d="M14.5 6.3l3 3"/>'),
    cards: sv('<rect x="4" y="7.5" width="11" height="13.5" rx="2"/><path d="M8.5 4.2h8.3a2 2 0 0 1 2 2V17"/>'),
    close: sv('<path d="M6 6l12 12M18 6 6 18"/>'),
    back: sv('<path d="M15 5l-7 7 7 7"/>'),
    chevron: sv('<path d="M9 6l6 6-6 6"/>'),
    check: sv('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 'stroke-width="2.2"'),
    calendar: sv('<rect x="4" y="5.5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'),
    pin: sv('<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>'),
    sort: sv('<path d="M7 5v14M4 16l3 3 3-3M17 19V5M14 8l3-3 3 3"/>'),
    sparkle: sv('<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8L12 3.5Z"/><path d="M19 16v4M17 18h4"/>'),
    turn: sv('<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.6"/><path d="M20 4v4.6h-4.6"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.4"/><path d="M4 20v-4.6h4.6"/>'),
    share: sv('<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5"/>'),
    tap: sv('<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M12 10.5a1.5 1.5 0 0 1 3 0v1a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.5a5.5 5.5 0 0 1-4.6-2.5L4.6 15a1.5 1.5 0 0 1 2.4-1.8L9 15"/>'),
    alert: sv('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.2v.3"/>'),
    plus: sv('<path d="M12 5v14M5 12h14"/>'),
    people: sv('<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5c.8-3.2 3-5 5.5-5s4.7 1.8 5.5 5"/><path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.6 14.6c1.6.6 2.6 2.2 3 4.9"/>'),
    tag: sv('<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.4 1.4 0 0 1 0 2l-6.4 6.4a1.4 1.4 0 0 1-2 0l-8.6-8Z"/><circle cx="8" cy="8" r="1.3"/>'),
  };

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const parse = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
  const fmt = {
    short: (iso) => { const d = parse(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; },
    long: (iso) => { const d = parse(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; },
    relative: (iso, todayIso) => {
      const diff = Math.round((parse(todayIso) - parse(iso)) / 86400000);
      if (diff === 0) return 'Today'; if (diff === 1) return 'Yesterday';
      const d = parse(iso); return diff < 7 ? `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}` : fmt.short(iso);
    },
    weekday: (iso) => { const d = parse(iso); return `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()]}, ${d.getDate()} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()]}`; },
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const pad = (n) => String(n).padStart(3, '0');
  const rule = '<svg viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="1" x2="100" y2="1" stroke="currentColor" vector-effect="non-scaling-stroke"/></svg>';

  function card(d) {
    const orn = NightArt.ornament(d.rarity);
    const corners = orn ? ['tl', 'tr', 'bl', 'br'].map((c) => `<span class="dcard__corner dcard__corner--${c}">${orn}</span>`).join('') : '';
    return `<article class="dcard" data-rarity="${d.rarity}" aria-label="${esc(d.title)}, ${d.rarity} card">
  <div class="dcard__frame"><div class="dcard__inner">
    <div class="dcard__art">${NightArt.render(d.motif, d.rarity, d.id)}</div>
    <header class="dcard__head"><span class="dcard__no">Nº ${pad(d.no)}</span><span class="dcard__badge"><span>${cap(d.rarity)}</span></span></header>
    <div class="dcard__body">
      <h3 class="dcard__title">${esc(d.title)}</h3>
      <dl class="dcard__facts"><div><dt>Theme</dt><dd>${esc(d.theme)}</dd></div><div><dt>Emotion</dt><dd>${esc(d.emotion)}</dd></div></dl>
      <p class="dcard__reflection">${esc(d.reflection)}</p>
      <footer class="dcard__foot">${rule}<span class="dcard__foot-full">${fmt.long(d.date)}</span><span class="dcard__foot-compact">${esc(d.emotion)} · ${fmt.short(d.date)}</span>${rule}</footer>
    </div>
  </div>${corners}</div>
</article>`;
  }
  const cardBack = () => `<article class="dcard dcard--back" aria-label="Face-down dream card"><div class="dcard__frame"><div class="dcard__inner">${NightArt.back()}</div></div></article>`;

  function row(d, today) {
    return `<button class="row" data-open="${d.id}" aria-label="Open ${esc(d.title)}">
  <span class="row__thumb">${NightArt.render(d.motif, d.rarity, d.id)}</span>
  <span class="row__body"><span class="row__title">${esc(d.title)}</span><span class="row__meta">${fmt.relative(d.date, today)} · ${esc(d.emotion)}</span></span>
  <span class="rarity-tag" data-rarity="${d.rarity}">${cap(d.rarity)}</span>
</button>`;
  }

  const chip = (label, pressed, attrs = '') => `<button type="button" class="chip" aria-pressed="${pressed ? 'true' : 'false'}" ${attrs}><span class="chip__dot"></span>${ICON.check.replace('<svg', '<svg class="chip__check"')}${esc(label)}</button>`;

  window.UI = { ICON, fmt, esc, cap, pad, card, cardBack, row, chip };
})();
