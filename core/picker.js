// The core: the character picker (2026-11-09, agreed with Andrew from a
// mock-up). One chart for choosing which characters of a script to drill -
// Japanese's hiragana and katakana, Bulgarian's alphabet - modelled on Kanji
// Strokes' picker, which Andrew likes for being flexible:
//   - the whole script on one page, in sections (Base / Dakuten and
//     handakuten / Contracted; Same as English / False friends / New shapes),
//     each with Pick all;
//   - tap a character to pick it, a row label (ka, sa...) for the whole row;
//   - Select all for everything;
//   - every tile shaded by its score, and the usual score bar on top (the
//     core's setupCatBar, so it reads like every other bar: untested on the
//     left, strongest on the right, tap it to show or hide untested);
//   - the direction (かな → romaji or back; letters → sounds or back) above;
//   - holding a character does what it did before (its strokes; see and hear
//     it), and the tap after a hold doesn't pick it;
//   - Start shows how many are picked and stays in view at the bottom.
// Strokes itself comes onto it when Strokes moves onto the core.
//
// renderPicker(el, spec) draws it into el and returns { clear, refresh,
// pickSection(key), start() } (the last two for the golden checks).
// spec:
//   sections: [{ key, label, cols, rows: [{ label?, items: [item|null] }] }]
//   item:     { id, char (HTML, already safe), sub (text), band() -> score band
//               or '' (untested), peek? (tile) -> attaches hold-to-peek }
//   direction?: { options: [{ key, label }], get() -> key, set(key) }
//   extras?:  (el) -> adds anything app-specific under the direction choice
//   start(items, directionKey): starts the drill with the picked items
//   unitKey: the text key counting what's picked ("{n} characters")
//   name: what Select all names ("Hiragana")
// Picks are kept while the page is open and cleared after a drill (clear()),
// as the app's kana tables always did.

(function injectPickerStyles() {
  if (document.getElementById('picker-styles')) return;
  const st = document.createElement('style');
  st.id = 'picker-styles';
  st.textContent = `
  .picker-dir { display: flex; gap: 8px; margin: 0.6rem 0 0.4rem; }
  .picker-dir button { flex: 1; padding: 9px 4px; border-radius: 99px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
  .picker-dir button.on { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
  .picker-section-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin: 1.1rem 0 0.5rem; padding-top: 0.9rem; border-top: 1px solid var(--border); }
  .picker-section-head:first-child { border-top: none; padding-top: 0; }
  .picker-section-name { font-size: 16px; font-weight: 700; color: var(--text); }
  .picker-pick-all { flex: none; padding: 5px 12px; border-radius: 99px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }
  .picker-pick-all.on { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
  .picker-row { display: flex; gap: 6px; margin-bottom: 6px; }
  .picker-row-label { flex: 0 0 42px; border: 1px dashed var(--border); border-radius: 10px; background: transparent; color: var(--text-dim); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; }
  .picker-row-label.on { border: 1px solid var(--accent); color: var(--accent); background: var(--accent-dim); }
  .picker-row .kana-ref-card { flex: 1 1 0; min-width: 0; margin: 0; cursor: pointer; }
  .picker-row .kana-ref-card.empty { visibility: hidden; cursor: default; }
  .picker-start { position: sticky; bottom: 12px; z-index: 5; margin-top: 0.8rem; box-shadow: 0 6px 24px rgba(0,0,0,0.45); }
  .picker-start:disabled { opacity: 1; background: var(--surface2); color: var(--text-muted); border: 1px solid var(--border); }
  `;
  document.head.appendChild(st);
})();

function renderPicker(el, spec) {
  const picked = new Set();
  const allItems = [];
  spec.sections.forEach(s => s.rows.forEach(r => r.items.forEach(it => { if (it) allItems.push(it); })));
  const byId = {};
  allItems.forEach(it => { byId[it.id] = it; });
  const tiles = {};      // id -> tile element
  const rowLabels = [];  // [button, items]
  const sectionBtns = []; // [button, items]

  el.innerHTML = '';
  // The score bar, over every character on the chart.
  const bar = document.createElement('div');
  bar.className = 'cat-bar picker-bar';
  el.appendChild(bar);

  // Direction.
  if (spec.direction) {
    const dir = document.createElement('div');
    dir.className = 'picker-dir';
    spec.direction.options.forEach(o => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.key = o.key;
      b.innerHTML = o.label;
      b.onclick = () => { spec.direction.set(o.key); syncDir(); };
      dir.appendChild(b);
    });
    el.appendChild(dir);
    var syncDir = () => dir.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.key === spec.direction.get()));
    syncDir();
  }
  if (spec.extras) spec.extras(el);

  // Select all.
  const selAll = document.createElement('div');
  selAll.className = 'group-card emphasis';
  selAll.style.cursor = 'pointer';
  selAll.innerHTML = '<div class="group-info"><div class="group-name"></div></div><div style="font-size:20px; color:var(--text-muted);">→</div>';
  selAll.onclick = () => { const all = allItems.every(it => picked.has(it.id)); allItems.forEach(it => all ? picked.delete(it.id) : picked.add(it.id)); sync(); };
  el.appendChild(selAll);

  // The sections.
  spec.sections.forEach(s => {
    const items = [];
    s.rows.forEach(r => r.items.forEach(it => { if (it) items.push(it); }));
    if (!items.length) return;
    const head = document.createElement('div');
    head.className = 'picker-section-head';
    head.innerHTML = '<span class="picker-section-name"></span>';
    head.firstChild.innerHTML = s.label;
    const pa = document.createElement('button');
    pa.type = 'button';
    pa.className = 'picker-pick-all';
    pa.onclick = () => { const all = items.every(it => picked.has(it.id)); items.forEach(it => all ? picked.delete(it.id) : picked.add(it.id)); sync(); };
    head.appendChild(pa);
    sectionBtns.push([pa, items]);
    el.appendChild(head);
    s.rows.forEach(r => {
      const row = document.createElement('div');
      row.className = 'picker-row';
      const rowItems = r.items.filter(Boolean);
      if (r.label) {
        const lab = document.createElement('button');
        lab.type = 'button';
        lab.className = 'picker-row-label';
        lab.textContent = r.label;
        lab.setAttribute('aria-label', tx('picker.rowLabel', { row: r.label }));
        lab.onclick = () => { const all = rowItems.every(it => picked.has(it.id)); rowItems.forEach(it => all ? picked.delete(it.id) : picked.add(it.id)); sync(); };
        row.appendChild(lab);
        rowLabels.push([lab, rowItems]);
      }
      const cells = r.items.slice();
      while (cells.length < (s.cols || cells.length)) cells.push(null);
      cells.forEach(it => {
        const t = document.createElement('div');
        if (!it) { t.className = 'kana-ref-card empty'; row.appendChild(t); return; }
        t.className = 'kana-ref-card';
        t.innerHTML = '<span class="kana-ref-char"></span><span class="kana-ref-rom"></span>';
        t.firstChild.innerHTML = it.char;
        t.lastChild.textContent = it.sub;
        t.onclick = () => {
          if (Date.now() < tilePeekSuppressClickUntil) return; // the tap after a hold
          picked.has(it.id) ? picked.delete(it.id) : picked.add(it.id);
          sync();
        };
        if (it.peek) it.peek(t);
        tiles[it.id] = t;
        row.appendChild(t);
      });
      el.appendChild(row);
    });
  });

  // Start.
  const start = document.createElement('button');
  start.className = 'start-btn picker-start';
  start.onclick = () => {
    if (!picked.size) return;
    const dirKey = spec.direction ? spec.direction.get() : null;
    spec.start(allItems.filter(it => picked.has(it.id)), dirKey);
  };
  el.appendChild(start);

  function refresh() {
    const counts = { untested: 0, neg3: 0, neg2: 0, neg1: 0, neutral: 0, pos1: 0, pos2: 0, pos3: 0, pos4: 0 };
    allItems.forEach(it => {
      const band = it.band();
      const t = tiles[it.id];
      if (t) { t.classList.remove(...SCORE_CLASSES); if (band) t.classList.add('score-' + band); }
      if (band) counts[band]++; else counts.untested++;
    });
    setupCatBar(bar, counts);
    if (spec.direction) syncDir();
  }
  function sync() {
    Object.keys(tiles).forEach(id => tiles[id].classList.toggle('selected', picked.has(id)));
    rowLabels.forEach(([b, items]) => b.classList.toggle('on', items.every(it => picked.has(it.id))));
    sectionBtns.forEach(([b, items]) => {
      const all = items.every(it => picked.has(it.id));
      b.classList.toggle('on', all);
      b.textContent = tx(all ? 'picker.pickedAll' : 'picker.pickAll', { n: items.length });
    });
    const all = allItems.every(it => picked.has(it.id));
    selAll.classList.toggle('selected', all);
    selAll.querySelector('.group-name').innerHTML = tx(all ? 'picker.deselectAll' : 'picker.selectAll', { name: spec.name || '' });
    const n = picked.size;
    start.disabled = n === 0;
    start.textContent = n ? tx('picker.start', { what: tx(spec.unitKey, { n }) }) : tx('picker.pickSome');
  }
  refresh();
  sync();
  return {
    clear: () => { picked.clear(); sync(); refresh(); },
    refresh: () => { refresh(); sync(); },
    pickSection: key => { const s = spec.sections.find(x => x.key === key); if (s) s.rows.forEach(r => r.items.forEach(it => { if (it) picked.add(it.id); })); sync(); },
    start: () => start.onclick(),
  };
}
