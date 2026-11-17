/* =========================================================
   Night Garden artwork engine
   Each dream theme ("motif") is drawn from the same botanical
   vocabulary; rarity adds luminosity (fireflies + halo).
   Output: SVG strings, viewBox 240 x 260.
   ========================================================= */
(function () {
  const C = {
    moss: '#0F1613', gh: '#18221E', ghr: '#1D2924', fern: '#2F3E36', fern2: '#3C5045',
    leaf: '#4E6A55', leafLight: '#6F8A72', leafDeep: '#33473B', lichen: '#A9B3A7', paper: '#ECE7DA',
    glow: '#C9E86B', glowPale: '#E6F3B8', bloom: '#E8A0AE', bloomLight: '#F4C9D1', bloomDeep: '#B9727F', water: '#132522'
  };
  const r1 = (n) => Math.round(n * 10) / 10;
  let uidCounter = 0;

  // ---------- seeded random (stable art per dream) ----------
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // ---------- primitives ----------
  const leaf = (x, y, l, a, fill, op = 1, w = .24, extra = '') =>
    `<path d="M0 0C${r1(l * .3)} ${r1(-l * w)} ${r1(l * .72)} ${r1(-l * w)} ${r1(l)} 0C${r1(l * .72)} ${r1(l * w)} ${r1(l * .3)} ${r1(l * w)} 0 0Z" transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(a)})" fill="${fill}" opacity="${op}" ${extra}/>`;
  const petal = (cx, cy, l, w, a, fill, op = 1) =>
    `<ellipse cx="0" cy="${r1(-l / 2)}" rx="${r1(w / 2)}" ry="${r1(l / 2)}" transform="translate(${r1(cx)} ${r1(cy)}) rotate(${r1(a)})" fill="${fill}" opacity="${op}"/>`;
  const stem = (d, w = 1.6, col = C.leaf, op = 1) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`;
  const halo = (u, x, y, r, col, op) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" opacity="${op}" filter="url(#${u}-blur8)"/>`;
  function bloom(u, cx, cy, r, n = 8, opts = {}) {
    let s = '';
    for (let i = 0; i < n; i++) s += petal(cx, cy, r * 1.9, r * .95, (360 / n) * i + (opts.rot || 0), opts.outer || C.bloom, opts.op ?? .92);
    for (let i = 0; i < n - 1; i++) s += petal(cx, cy, r * 1.15, r * .58, (360 / (n - 1)) * i + 18 + (opts.rot || 0), opts.inner || C.bloomLight, .95);
    if (opts.glow) s += halo(u, cx, cy, r * .9, C.glow, .45);
    s += `<circle cx="${cx}" cy="${cy}" r="${r1(r * .28)}" fill="${opts.glow ? C.glowPale : C.paper}"/>`;
    return s;
  }
  function firefly(u, x, y, r = 1.5) {
    return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r * 4.2)}" fill="${C.glow}" opacity=".2" filter="url(#${u}-blur3)"/><circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="${C.glowPale}"/>`;
  }
  function moth(x, y, s, a, op = .88) {
    const up = `M0 0C${r1(-s * .3)} ${r1(-s * .9)} ${r1(-s * 1.25)} ${r1(-s * .8)} ${r1(-s * 1.15)} ${r1(-s * .12)}C${r1(-s * .95)} ${r1(s * .2)} ${r1(-s * .35)} ${r1(s * .12)} 0 0Z`;
    const low = `M0 ${r1(s * .05)}C${r1(-s * .2)} ${r1(s * .25)} ${r1(-s * .75)} ${r1(s * .62)} ${r1(-s * .58)} ${r1(s * .8)}C${r1(-s * .3)} ${r1(s * .86)} ${r1(-s * .06)} ${r1(s * .42)} 0 ${r1(s * .05)}Z`;
    return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(a)})" opacity="${op}">
      <path d="${up}" fill="${C.paper}"/><path d="${low}" fill="${C.lichen}"/>
      <g transform="scale(-1 1)"><path d="${up}" fill="${C.paper}"/><path d="${low}" fill="${C.lichen}"/></g>
      <circle cx="${r1(-s * .62)}" cy="${r1(-s * .42)}" r="${r1(s * .13)}" fill="${C.fern}"/><circle cx="${r1(s * .62)}" cy="${r1(-s * .42)}" r="${r1(s * .13)}" fill="${C.fern}"/>
      <ellipse cx="0" cy="${r1(s * .2)}" rx="${r1(s * .09)}" ry="${r1(s * .42)}" fill="${C.leafDeep}"/></g>`;
  }
  function grass(xs, y, rand) { return xs.map((x) => leaf(x, y, 10 + rand() * 12, -70 - rand() * 40, C.leafDeep, .9, .16)).join(''); }
  const qb = (p0, p1, p2, t) => [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]];
  const qbAngle = (p0, p1, p2, t) => { const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]); const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]); return Math.atan2(dy, dx) * 180 / Math.PI; };

  // ---------- motifs ----------
  const MOTIFS = {
    orchard(u, rand) { // The Glass Orchard — glass bells on a pale tree
      let s = `<ellipse cx="120" cy="268" rx="170" ry="46" fill="${C.ghr}"/>` + grass([40, 62, 88, 150, 176, 204], 240, rand);
      s += stem('M120 252C117 214 125 192 120 150', 3.4, C.paper, .5);
      ['M120 172C100 152 82 142 62 120', 'M121 162C140 142 160 134 180 112', 'M120 150C112 128 104 112 94 92', 'M120 150C128 126 140 108 152 86', 'M120 150C120 128 121 104 122 74']
        .forEach((d, i) => { s += stem(d, 2 - i * .15, C.paper, .42); });
      [[78, 136, -140], [104, 120, -60], [140, 118, -120], [166, 128, -40], [112, 96, -100], [134, 98, -70]].forEach(([x, y, a]) => { s += leaf(x, y, 15, a, C.paper, .12, .26, `stroke="${C.paper}" stroke-opacity=".35" stroke-width=".6"`); });
      [[62, 120], [180, 112], [94, 92], [152, 86], [122, 74], [84, 134], [160, 126]].forEach(([x, y], i) => {
        s += stem(`M${x} ${y}V${y + 8}`, .8, C.paper, .5);
        s += `<path d="M${x - 7} ${y + 18}C${x - 7} ${y + 6} ${x + 7} ${y + 6} ${x + 7} ${y + 18}L${x + 9} ${y + 22}L${x - 9} ${y + 22}Z" fill="${C.paper}" fill-opacity=".14" stroke="${C.paper}" stroke-opacity=".75" stroke-width=".8"/>`;
        s += `<circle cx="${x}" cy="${y + 23.5}" r="1.5" fill="${i === 3 ? C.bloom : C.glowPale}"/>`;
        if (i === 1 || i === 4) s += stem(`M${x + 13} ${y + 8}q5 6 0 13M${x + 17} ${y + 5}q7 9 0 19`, .8, C.lichen, .55);
      });
      return { svg: s, center: [120, 116], bg: ['#22342C', '#16201C'] };
    },
    tide(u, rand) { // Tide Under the Stairs — stairs into a still pool
      let s = '';
      for (let i = 0; i < 8; i++) s += `<rect x="${4 + i * 15}" y="${62 + i * 15}" width="74" height="15" fill="${i % 2 ? '#33463C' : C.fern2}"/><rect x="${4 + i * 15}" y="${62 + i * 15}" width="74" height="1" fill="${C.paper}" opacity=".18"/>`;
      s += stem('M0 48L118 166', 1.2, C.lichen, .45);
      for (let i = 0; i < 6; i++) s += stem(`M${10 + i * 18} ${58 + i * 18}v-14`, 1, C.lichen, .35);
      s += `<rect x="0" y="166" width="240" height="94" fill="${C.water}" opacity=".93"/>` + stem('M0 166.5H240', 1, C.lichen, .4);
      [[20, 5, .38], [40, 10, .24], [62, 15, .13]].forEach(([rx, ry, o]) => { s += `<ellipse cx="156" cy="196" rx="${rx}" ry="${ry}" fill="none" stroke="${C.lichen}" stroke-opacity="${o}"/>`; });
      s += `<path d="M126 200a24 7 0 1 0 2-6l12 3z" fill="${C.leaf}"/><ellipse cx="200" cy="222" rx="16" ry="5" fill="${C.leafDeep}"/><ellipse cx="96" cy="232" rx="14" ry="4" fill="${C.leafDeep}"/>`;
      s += `<ellipse cx="156" cy="212" rx="16" ry="5" fill="${C.bloom}" opacity=".22" filter="url(#${u}-blur3)"/>`;
      s += bloom(u, 156, 188, 9, 8, { rot: 10 });
      return { svg: s, center: [156, 186], bg: ['#1C3430', '#132320'] };
    },
    door(u, rand) { // A Door That Hummed — overgrown arch, lit keyhole
      let s = '';
      [[62, .16], [82, .09]].forEach(([r, o]) => { s += `<path d="M${120 - r} 150A${r} ${r} 0 0 1 ${120 + r} 150" fill="none" stroke="${C.glow}" stroke-opacity="${o}"/>`; });
      s += `<path d="M76 240V130A44 44 0 0 1 164 130V240Z" fill="#14201B" stroke="${C.fern2}" stroke-width="2"/>`;
      s += `<path d="M88 232V134A32 32 0 0 1 152 134V232Z" fill="none" stroke="${C.fern}" stroke-width="1.2"/>` + stem('M120 104V232', 1, C.fern, 1);
      s += `<rect x="86" y="236" width="68" height="3" fill="${C.glow}" opacity=".8"/><ellipse cx="120" cy="246" rx="50" ry="8" fill="${C.glow}" opacity=".18" filter="url(#${u}-blur8)"/>`;
      s += halo(u, 140, 184, 10, C.glow, .35) + `<circle cx="140" cy="182" r="3" fill="${C.glowPale}"/><path d="M138.6 183h2.8l1 7h-4.8z" fill="${C.glowPale}"/>`;
      s += stem('M64 242C58 202 70 172 70 140C70 96 104 76 124 80C150 84 170 104 172 142', 1.6, C.leaf, 1);
      [[63, 224, -120], [68, 200, -60], [65, 178, -130], [71, 154, -50], [79, 118, -120], [95, 94, -80], [117, 82, -100], [140, 86, -40], [158, 98, -10], [168, 118, 20], [172, 140, -20], [56, 210, 170]].forEach(([x, y, a], i) => { s += leaf(x, y, 13 + (i % 3) * 2, a, i % 2 ? C.leafLight : C.leaf, .95, .3); });
      s += grass([30, 52, 176, 198, 214], 244, rand);
      return { svg: s, center: [120, 160], bg: ['#202E28', '#141C18'] };
    },
    moths(u, rand) { // The Moth Choir — moths circling a night-bloom
      let s = stem('M120 256C114 220 126 196 120 150', 2.6, C.leaf, 1);
      s += leaf(118, 214, 44, -150, C.leaf, 1, .28) + leaf(121, 196, 40, -24, C.leafLight, 1, .28) + leaf(119, 236, 30, -36, C.leafDeep, 1, .28);
      s += halo(u, 120, 128, 40, C.bloom, .16);
      s += bloom(u, 120, 128, 25, 9, { glow: true, rot: 4 });
      for (let i = 0; i < 6; i++) { const a = -100 + i * 58; const rad = 84 + (i % 2) * 8; const x = 120 + Math.cos(a * Math.PI / 180) * rad; const y = 126 + Math.sin(a * Math.PI / 180) * rad * .82; s += moth(x, y, 8 + (i % 3) * 2.2, a + 90); }
      for (let i = 0; i < 14; i++) s += `<circle cx="${r1(30 + rand() * 180)}" cy="${r1(30 + rand() * 190)}" r=".8" fill="${C.lichen}" opacity=".5"/>`;
      return { svg: s, center: [120, 128], bg: ['#2A3430', '#17201C'] };
    },
    lantern(u, rand) { // Lanterns in the Fern — fronds with hanging lights
      let s = '';
      const fronds = [[[66, 260], [36, 160], [98, 94]], [[124, 262], [118, 150], [152, 66]], [[180, 260], [214, 172], [168, 118]]];
      fronds.forEach(([p0, p1, p2], fi) => {
        s += stem(`M${p0}Q${p1} ${p2}`, 1.8, C.leaf, 1);
        for (let k = 1; k < 15; k++) { const t = k / 15; const [x, y] = qb(p0, p1, p2, t); const ang = qbAngle(p0, p1, p2, t); const l = 22 * (1 - t) + 5; s += leaf(x, y, l, ang - 62, fi === 1 ? C.leafLight : C.leaf, .95, .2) + leaf(x, y, l, ang + 62, C.leafDeep, .95, .2); }
        s += stem(`M${p2[0]} ${p2[1]}a6 6 0 1 1 -6 -6a3.5 3.5 0 1 1 3.5 3.5`, 1.4, C.leafLight, 1);
      });
      [[fronds[1], .46, C.glow], [fronds[0], .62, C.bloom], [fronds[2], .5, C.glow]].forEach(([[p0, p1, p2], t, col]) => {
        const [x, y] = qb(p0, p1, p2, t);
        s += stem(`M${r1(x)} ${r1(y)}v16`, .8, C.lichen, .7) + halo(u, r1(x), r1(y + 25), 15, col, .32);
        s += `<rect x="${r1(x - 5)}" y="${r1(y + 16)}" width="10" height="15" rx="4" fill="${col}"/><rect x="${r1(x - 3)}" y="${r1(y + 14)}" width="6" height="3" rx="1" fill="${C.fern2}"/>`;
      });
      return { svg: s, center: [124, 140], bg: ['#203229', '#141E19'] };
    },
    greenhouse(u, rand) { // Grandmother's Greenhouse — climbing rose under glass
      let s = `<ellipse cx="120" cy="268" rx="170" ry="40" fill="${C.ghr}"/>`;
      s += `<path d="M36 242V150C36 92 204 92 204 150V242Z" fill="${C.paper}" fill-opacity=".035" stroke="${C.lichen}" stroke-opacity=".55" stroke-width="1.4"/>`;
      [70, 104, 136, 170].forEach((x) => { s += stem(`M${x} ${x === 70 || x === 170 ? 118 : 104}V242`, 1, C.lichen, .3); });
      s += stem('M36 172H204M36 206H204', 1, C.lichen, .25) + stem('M52 120C80 106 160 106 188 120', 1, C.lichen, .25);
      s += `<rect x="104" y="172" width="32" height="34" fill="${C.glow}" opacity=".1"/>`;
      s += `<path d="M106 242l4-18h20l4 18z" fill="${C.fern2}"/>`;
      s += stem('M120 226C110 206 132 194 118 174C106 156 128 146 122 126C118 114 126 104 124 96', 1.8, C.leaf, 1);
      [[114, 214, -150], [124, 196, -20], [110, 168, -160], [128, 152, -30], [118, 120, -150]].forEach(([x, y, a]) => { s += leaf(x, y, 15, a, C.leafLight, 1, .3); });
      [[118, 176, 7], [127, 148, 8.5], [110, 198, 6], [123, 124, 7.5], [125, 98, 5.5]].forEach(([x, y, r], i) => { s += bloom(u, x, y, r, 7, { rot: i * 13 }); });
      s += leaf(48, 238, 26, -60, C.leafDeep, 1, .26) + leaf(190, 238, 24, -120, C.leafDeep, 1, .26);
      return { svg: s, center: [120, 150], bg: ['#24352D', '#172019'] };
    },
    petals(u, rand) { // Falling Through Petals — a tumbling bloom and its spiral
      let s = '';
      for (let i = 0; i < 30; i++) { const t = i / 30; const a = t * 760 * Math.PI / 180; const rad = 18 + t * 74; const x = 120 + Math.cos(a) * rad; const y = 18 + t * 226 + Math.sin(a) * rad * .22; s += petal(x, y, 7 + t * 10, 4 + t * 5, a * 70, i % 3 ? C.bloom : C.bloomLight, .35 + t * .55); }
      s += halo(u, 122, 120, 34, C.bloom, .16);
      s += `<g transform="rotate(28 122 120)">${bloom(u, 122, 120, 17, 7, {})}</g>`;
      s += stem('M110 140C100 160 98 176 104 196', 1.6, C.leaf, .9) + leaf(104, 176, 18, 150, C.leaf, .9, .28);
      return { svg: s, center: [122, 120], bg: ['#25312C', '#171F1B'] };
    },
    mushrooms(u, rand) { // The Mushroom Clock — a clock ringed by glowing caps
      let s = `<ellipse cx="120" cy="270" rx="170" ry="44" fill="${C.ghr}"/>`;
      s += `<circle cx="120" cy="128" r="58" fill="${C.paper}" fill-opacity=".04" stroke="${C.lichen}" stroke-opacity=".45"/><circle cx="120" cy="128" r="51" fill="none" stroke="${C.fern2}"/>`;
      for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180; const inner = i % 3 ? 46 : 41; s += `<line x1="${r1(120 + Math.cos(a) * inner)}" y1="${r1(128 + Math.sin(a) * inner)}" x2="${r1(120 + Math.cos(a) * 50)}" y2="${r1(128 + Math.sin(a) * 50)}" stroke="${C.lichen}" stroke-opacity=".6" stroke-width="${i % 3 ? .8 : 1.6}"/>`; }
      s += stem('M120 128L101 112', 2.2, C.glow, 1) + stem('M120 128L152 141', 1.6, C.paper, .85) + `<circle cx="120" cy="128" r="3" fill="${C.glowPale}"/>`;
      [[44, 240, 18, 30, C.bloomDeep], [70, 244, 11, 18, C.paper], [168, 242, 20, 34, C.bloomDeep], [196, 246, 10, 16, C.glow], [92, 248, 8, 12, C.glow], [146, 248, 9, 14, C.paper]].forEach(([x, y, w, h, col]) => {
        if (col === C.glow) s += halo(u, x, y - h, w * 1.4, C.glow, .3);
        s += `<rect x="${x - w * .18}" y="${y - h}" width="${w * .36}" height="${h}" rx="${w * .18}" fill="${C.paper}" opacity=".82"/>`;
        s += `<path d="M${x - w} ${y - h + 2}C${x - w} ${y - h - w * 1.1} ${x + w} ${y - h - w * 1.1} ${x + w} ${y - h + 2}Z" fill="${col}"/>`;
        if (col !== C.glow) s += `<circle cx="${x - w * .35}" cy="${y - h - w * .35}" r="${r1(w * .12)}" fill="${C.paper}" opacity=".6"/><circle cx="${x + w * .3}" cy="${y - h - w * .5}" r="${r1(w * .09)}" fill="${C.paper}" opacity=".6"/>`;
      });
      for (let i = 0; i < 10; i++) s += `<circle cx="${r1(150 + rand() * 60)}" cy="${r1(150 + rand() * 70)}" r=".9" fill="${C.glow}" opacity=".6"/>`;
      return { svg: s, center: [120, 128], bg: ['#212F29', '#151D19'] };
    },
    lake(u, rand) { // The Library Under the Lake — books, kelp and light shafts
      let s = `<rect x="0" y="34" width="240" height="226" fill="url(#${u}-water)"/>` + stem('M0 34q15 -4 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0', 1, C.lichen, .45);
      [[40, 70], [110, 150], [170, 210]].forEach(([a, b]) => { s += `<path d="M${a} 34L${b} 34L${b + 40} 260L${a + 10} 260Z" fill="${C.paper}" opacity=".035"/>`; });
      [['M30 260C40 220 20 190 34 150', 1], ['M206 260C196 214 218 186 204 140', 2]].forEach(([d], i) => { s += stem(d, 1.6, C.leaf, 1); for (let k = 0; k < 6; k++) s += leaf(i ? 206 : 30, 250 - k * 18, 14, i ? -150 + (k % 2) * 120 : -30 - (k % 2) * 120, C.leaf, .9, .3); });
      [[74, 228, 92, 13, C.fern2], [80, 215, 80, 13, '#4A3F45'], [70, 202, 88, 13, '#3E5B48'], [84, 189, 74, 13, C.fern2]].forEach(([x, y, w, h, col]) => { s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${col}"/><rect x="${x + 6}" y="${y + 5}" width="${w - 12}" height="1.2" fill="${C.paper}" opacity=".3"/>`; });
      [[56, 196, 12, 44], [176, 202, 11, 38], [164, 210, 10, 30]].forEach(([x, y, w, h]) => { s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${C.fern2}" stroke="${C.paper}" stroke-opacity=".2"/>`; });
      s += halo(u, 121, 178, 26, C.glow, .3) + `<path d="M121 186C110 178 98 178 90 182V170C98 166 110 166 121 174C132 166 144 166 152 170V182C144 178 132 178 121 186Z" fill="${C.paper}" opacity=".92"/>` + stem('M121 174V186', .8, C.lichen, 1);
      for (let i = 0; i < 9; i++) s += `<circle cx="${r1(100 + rand() * 50)}" cy="${r1(60 + rand() * 100)}" r="${r1(1 + rand() * 2.4)}" fill="none" stroke="${C.paper}" stroke-opacity=".4"/>`;
      return { svg: s, center: [121, 176], bg: ['#1A2F2C', '#11201C'] };
    },
    seed(u, rand) { // fallback — a single sprout
      let s = `<ellipse cx="120" cy="250" rx="90" ry="26" fill="${C.ghr}"/>`;
      s += stem('M120 236C118 210 124 196 120 170', 2.2, C.leaf, 1) + leaf(120, 176, 34, -150, C.leafLight, 1, .3) + leaf(120, 172, 30, -28, C.leaf, 1, .3);
      s += halo(u, 120, 150, 16, C.glow, .35) + `<circle cx="120" cy="150" r="3" fill="${C.glowPale}"/>`;
      return { svg: s, center: [120, 170], bg: ['#20302A', '#151D19'] };
    },
  };

  const RARITY_FX = { common: { flies: 2 }, rare: { flies: 4, halo: [C.lichen, .12, 64] }, epic: { flies: 6, halo: [C.bloom, .2, 74] }, legendary: { flies: 11, halo: [C.glow, .24, 86], ring: true } };

  function render(motif, rarity = 'common', seedKey = motif) {
    const u = 'a' + (++uidCounter);
    const rand = rng(hash(seedKey));
    const m = (MOTIFS[motif] || MOTIFS.seed)(u, rand);
    const fx = RARITY_FX[rarity] || RARITY_FX.common;
    const [cx, cy] = m.center;
    let fxBack = '';
    if (fx.halo) fxBack += `<circle cx="${cx}" cy="${cy}" r="${fx.halo[2]}" fill="${fx.halo[0]}" opacity="${fx.halo[1]}" filter="url(#${u}-blur16)"/>`;
    if (fx.ring) fxBack += `<circle cx="${cx}" cy="${cy}" r="98" fill="none" stroke="${C.glow}" stroke-opacity=".22"/><circle cx="${cx}" cy="${cy}" r="106" fill="none" stroke="${C.glow}" stroke-opacity=".1" stroke-dasharray="1 5"/>`;
    let flies = '';
    for (let i = 0; i < fx.flies; i++) flies += firefly(u, 18 + rand() * 204, 20 + rand() * 170, 1.1 + rand() * .9);
    return `<svg viewBox="0 0 240 260" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
<radialGradient id="${u}-bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="${m.bg[0]}"/><stop offset=".55" stop-color="${m.bg[1]}"/><stop offset="1" stop-color="${C.moss}"/></radialGradient>
<radialGradient id="${u}-vig" cx="50%" cy="45%" r="70%"><stop offset=".6" stop-color="${C.moss}" stop-opacity="0"/><stop offset="1" stop-color="${C.moss}" stop-opacity=".75"/></radialGradient>
<linearGradient id="${u}-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A3430"/><stop offset="1" stop-color="${C.moss}"/></linearGradient>
<filter id="${u}-blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="${u}-blur8" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="${u}-blur16" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16"/></filter>
</defs>
<rect width="240" height="260" fill="url(#${u}-bg)"/>${fxBack}${m.svg}${flies}<rect width="240" height="260" fill="url(#${u}-vig)"/></svg>`;
  }

  // ---------- Card back: botanical lattice + glowing emblem ----------
  function back() {
    const u = 'b' + (++uidCounter);
    const ringText = 'DREAM OASIS · NIGHT GARDEN · DREAM OASIS · NIGHT GARDEN · ';
    let corners = '';
    [[30, 34, 0], [270, 34, 90], [270, 418, 180], [30, 418, 270]].forEach(([x, y, a]) => {
      corners += `<g transform="translate(${x} ${y}) rotate(${a})">${stem('M0 0C10 2 18 8 22 18', 1, C.lichen, .55)}${leaf(8, 3, 11, -20, C.lichen, .45, .3)}${leaf(16, 9, 10, 40, C.lichen, .35, .3)}<circle cx="0" cy="0" r="1.6" fill="${C.glow}"/></g>`;
    });
    let ring = '';
    for (let i = 0; i < 12; i++) { const a = (i * 30 + 15) * Math.PI / 180; ring += leaf(150 + Math.cos(a) * 100, 226 + Math.sin(a) * 100, 12, i * 30 + 15 + 90, C.fern2, .9, .3); }
    return `<svg viewBox="0 0 300 452" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
<pattern id="${u}-pat" width="44" height="44" patternUnits="userSpaceOnUse">${leaf(6, 30, 18, -40, C.fern, 1, .28)}${leaf(28, 12, 14, 40, C.fern, .7, .28)}<circle cx="36" cy="36" r="1" fill="${C.lichen}" opacity=".25"/></pattern>
<radialGradient id="${u}-fade" cx="50%" cy="50%" r="55%"><stop offset=".25" stop-color="${C.moss}" stop-opacity=".97"/><stop offset=".62" stop-color="${C.moss}" stop-opacity=".55"/><stop offset="1" stop-color="${C.moss}" stop-opacity=".1"/></radialGradient>
<filter id="${u}-blur" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="10"/></filter>
<path id="${u}-circle" d="M150 226m-74 0a74 74 0 1 1 148 0a74 74 0 1 1 -148 0"/>
</defs>
<rect width="300" height="452" fill="${C.moss}"/><rect width="300" height="452" fill="url(#${u}-pat)"/><rect width="300" height="452" fill="url(#${u}-fade)"/>
<rect x="14" y="14" width="272" height="424" rx="14" fill="none" stroke="${C.lichen}" stroke-opacity=".22"/><rect x="20" y="20" width="260" height="412" rx="10" fill="none" stroke="${C.fern}"/>
${corners}
<text x="150" y="60" text-anchor="middle" fill="${C.lichen}" style="font: 600 9px var(--font-body); letter-spacing: .32em">DREAM OASIS</text>
${ring}
<circle cx="150" cy="226" r="88" fill="none" stroke="${C.lichen}" stroke-opacity=".3"/>
<text fill="${C.lichen}" style="font: 600 8.4px var(--font-body); letter-spacing: .24em"><textPath href="#${u}-circle">${ringText}</textPath></text>
<circle cx="150" cy="226" r="62" fill="#131B17" stroke="${C.fern2}"/>
<circle class="emblem-core" cx="150" cy="226" r="30" fill="${C.glow}" opacity=".5" filter="url(#${u}-blur)"/>
${bloom(u, 150, 226, 19, 6, { rot: 0, op: .95 })}
<circle cx="150" cy="226" r="6.5" fill="${C.glowPale}"/>
<text x="150" y="404" text-anchor="middle" fill="${C.lichen}" opacity=".85" style="font: italic 16px var(--font-display)">a dream is growing</text>
</svg>`;
  }

  // ---------- Corner ornaments (top-left orientation) ----------
  function ornament(rarity) {
    if (rarity === 'common') return '';
    let s = '';
    if (rarity === 'rare') {
      s = `${stem('M3 3C14 5 22 11 28 22', 1.1, 'currentColor', .9)}${leaf(10, 5, 9, -10, 'currentColor', .8, .3)}${leaf(19, 11, 8, 50, 'currentColor', .7, .3)}`;
    } else {
      s = `${stem('M3 3C20 3 30 10 34 24C37 34 32 41 26 39C21 37 22 31 27 31', 1.1, 'currentColor', .95)}${stem('M3 3C3 18 8 28 18 34', 1, 'currentColor', .8)}${leaf(14, 4, 10, -12, 'currentColor', .85, .3)}${leaf(26, 10, 9, 40, 'currentColor', .75, .3)}${leaf(4, 14, 9, 80, 'currentColor', .8, .3)}<circle cx="34" cy="24" r="2.2" fill="currentColor"/>`;
      if (rarity === 'legendary') s += `${stem('M18 34C24 40 34 44 46 44', 1, 'currentColor', .7)}${leaf(36, 42, 8, -10, 'currentColor', .7, .3)}<circle cx="46" cy="44" r="1.8" fill="currentColor"/><circle cx="3" cy="3" r="2.6" fill="currentColor"/>`;
    }
    return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">${s}</svg>`;
  }

  window.NightArt = { render, back, ornament, motifs: Object.keys(MOTIFS) };
})();
