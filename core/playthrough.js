// Play through a word list (26 Nov 2026, Andrew) - an optional core part:
// a page that loads this script (after core/core.js) gets a Play through
// button on its word tiles screen. Japanese and Portuguese load it.
//
// Each word in turn: its tile lit, its bubble up (Japanese: the kana drawn
// stroke by stroke, the romaji, the English), a moment to try reading it,
// the word said, then the bubble held for a while once both the voice and
// any drawing have finished - longer words longer, a little per letter.
// About 3-4 seconds a word in Japanese (Andrew's own guess from the guide
// reader). For watching at the screen; nothing is scored or stored except
// the speed. Stops at the end of the list - never runs on into the next.
//
// The bar: previous word, play / pause, next word, speed (the pauses, not
// the voice), close. Paused, the arrows - or a tap on a tile - show and say
// one word at a time. While the bar is open a tap on a tile means "this
// word", caught before the tile's own select-for-drill tap; closing the bar
// puts tapping back. Holding a word yourself pauses it.
//
// The core makes the button and the bar (play-* classes); the page styles
// them ("Play through" in ja/index.html's and pt/index.html's styles). An app can change the pace with
// APP.playThrough = { lead, hold, perLetter } in ms (Japanese: 120 a kana,
// for the drawing; the default 40 a letter suits a spelt-out word).
//
// Also shared with Japanese's guide reader (ja/guides.js): PLAY_SPEEDS,
// PLAY_ICON and playWake.

const PLAY_SPEEDS = [1, 0.85, 0.7, 1.15];
const PLAY_ICON = {
  play: '<svg viewBox="0 0 24 24" width="22" height="22"><polygon points="7,4 20,12 7,20" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/></svg>',
  prev: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 5 8 12 15 19"/></svg>',
  next: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 5 16 12 9 19"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>',
};

// Keep the screen on while something plays (r: the player's state, with
// .playing and .lock).
async function playWake(r, on) {
  if (!r) return;
  try {
    if (on && !r.lock && navigator.wakeLock) {
      const lock = await navigator.wakeLock.request('screen');
      if (r.playing && !r.lock) r.lock = lock; else lock.release();
    } else if (!on && r.lock) { const l = r.lock; r.lock = null; l.release(); }
  } catch (e) { /* no wake lock here - the screen may dim on its own */ }
}

const TP_SPEED_KEY = APP.storagePrefix + 'TilePlaySpeed';
const TP_PACE = Object.assign({ lead: 750, hold: 1600, perLetter: 40 }, APP.playThrough || {});
let tp = null;   // { pos, playing, gen, tile, utter, lock } while the bar is open

// The button, under the "Tap a word..." line, and the bar - made once.
(function tpBuild() {
  const sub = document.getElementById('vocab-tile-selection-sub');
  const screen = document.getElementById('screen-vocab-tile-selection');
  if (!sub || !screen) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ds-btn ds-btn-main play-open';
  btn.id = 'tp-open';
  btn.textContent = tx('play.through');
  btn.onclick = () => tpOpen();
  sub.after(btn);
  const bar = document.createElement('div');
  bar.className = 'play-bar';
  bar.id = 'tp-bar';
  const b = (cls, id, label, fn, html) => `<button type="button"${cls ? ` class="${cls}"` : ''}${id ? ` id="${id}"` : ''} aria-label="${escapeHtmlText(label)}" title="${escapeHtmlText(label)}" onclick="${fn}">${html}</button>`;
  bar.innerHTML = '<div class="play-msg" id="tp-msg" style="display:none"></div><div class="play-btns">'
    + b('', '', tx('play.prev'), 'tpStep(-1)', PLAY_ICON.prev)
    + b('play-play', 'tp-play', tx('play.play'), 'tpToggle()', PLAY_ICON.play)
    + b('', '', tx('play.next'), 'tpStep(1)', PLAY_ICON.next)
    + b('play-speed', 'tp-speed', tx('play.speed'), 'tpSpeedNext()', '1×')
    + b('', '', tx('play.stop'), 'tpClose()', PLAY_ICON.close)
    + '</div>';
  screen.appendChild(bar);
})();

function tpSpeed() {
  try { const v = parseFloat(localStorage.getItem(TP_SPEED_KEY)); if (PLAY_SPEEDS.includes(v)) return v; } catch (e) { /* private mode */ }
  return 1;
}
function tpTiles() { return [...document.querySelectorAll('#vocab-tile-grid .kana-ref-card')]; }
function tpItems() { return vocabTileCategory ? resolveVocabCategory(vocabTileCategory).items : []; }

function tpOpen() {
  if (!tpTiles().length) return;
  if (!tp) {
    tp = { pos: 0, playing: false, gen: 0, tile: null, utter: null, lock: null };
    document.getElementById('screen-vocab-tile-selection').classList.add('play-on');
    document.getElementById('tp-bar').classList.add('show');
  }
  tpSync();
  tpPlay();
}

function tpClose() {
  if (!tp) return;
  tpPause();
  tpUnlight();
  tp = null;
  const sc = document.getElementById('screen-vocab-tile-selection');
  if (sc) sc.classList.remove('play-on');
  const bar = document.getElementById('tp-bar');
  if (bar) bar.classList.remove('show');
}

function tpMsg(text) {
  const m = document.getElementById('tp-msg');
  if (m) { m.textContent = text || ''; m.style.display = text ? '' : 'none'; }
}
function tpSync() {
  if (!tp) return;
  const btn = document.getElementById('tp-play');
  if (btn) {
    btn.innerHTML = tp.playing ? PLAY_ICON.pause : PLAY_ICON.play;
    const label = tx(tp.playing ? 'play.pause' : 'play.play');
    btn.setAttribute('aria-label', label); btn.title = label;
  }
  const sp = document.getElementById('tp-speed');
  if (sp) sp.textContent = tpSpeed() + '×';
}

function tpUnlight() {
  if (tp && tp.tile) tp.tile.classList.remove('play-current');
  if (tp) tp.tile = null;
  if (document.getElementById('tile-peek-bubble') && !document.querySelector('#vocab-tile-grid .tile-peeking')) hideTilePeekBubble();
}

// Light word i and put its bubble up; say it too when asked. Returns a
// promise for the bubble's drawing having finished (at once if nothing is
// drawn - see showTilePeekBubble's b.drawn).
function tpShow(i, speak) {
  const tiles = tpTiles(), item = tpItems()[i], tile = tiles[i];
  if (!tile || !item) return Promise.resolve();
  tpUnlight();
  tp.pos = i; tp.tile = tile;
  tile.classList.add('play-current');
  // Room above the tile for its bubble, and clear of the bar: the page
  // jumps (no smooth scroll) so the bubble lands next to the tile.
  const r = tile.getBoundingClientRect();
  const bar = document.getElementById('tp-bar');
  const bottom = window.innerHeight - (bar ? bar.offsetHeight : 0) - 24;
  if (r.top < 150 || r.bottom > bottom) tile.scrollIntoView({ block: 'center' });
  const b = showTilePeekBubble(tile, item);
  if (speak) tpSay(item);
  return Promise.resolve(b && b.drawn).catch(() => {});
}

function tpSay(item, done) {
  if (!SPEECH_SUPPORTED || !soundAllowed()) { if (done) setTimeout(done, 600); return; }
  const gen = tp.gen;
  cancelSpeechIfBusy();
  const u = new SpeechSynthesisUtterance(item.speakAs || item.jp);
  u.lang = LANG.code;
  const v = LANG.pickVoice(window.speechSynthesis.getVoices()).voice;
  if (v) { u.voice = v; u.lang = v.lang || LANG.code; }
  u.rate = LANG.rate || 0.9;
  tp.utter = u;   // kept, or some browsers lose its end event
  let fin = false;
  const finish = () => { if (fin) return; fin = true; clearTimeout(cap); if (done && tp && gen === tp.gen) done(); };
  u.onend = finish;
  u.onerror = e => {
    // Cut off by holding a word (its own bubble speaks it): stop here.
    if (e && (e.error === 'interrupted' || e.error === 'canceled')) { fin = true; clearTimeout(cap); if (tp && gen === tp.gen) tpPause(); return; }
    finish();
  };
  // Never wait forever on a lost end event.
  const cap = setTimeout(finish, 5000);
  // Safari can drop speech queued straight after cancel().
  setTimeout(() => { if (tp && gen === tp.gen) window.speechSynthesis.speak(u); }, 60);
}

function tpPlay() {
  if (!tp) return;
  if (tp.pos >= tpTiles().length) tp.pos = 0;
  tpMsg(soundAllowed() ? '' : tx('play.soundOff'));
  tp.playing = true;
  tpSync();
  playWake(tp, true);
  tpRun(tp.pos, ++tp.gen);
}

function tpPause() {
  if (!tp) return;
  tp.gen++;
  const was = tp.playing;
  tp.playing = false;
  if (was) cancelSpeechIfBusy();
  playWake(tp, false);
  tpSync();
}

function tpToggle() { if (tp) { if (tp.playing) tpPause(); else tpPlay(); } }

const tpWait = ms => new Promise(r => setTimeout(r, ms));
async function tpRun(i, gen) {
  const live = () => tp && gen === tp.gen && tp.playing;
  const held = () => !!document.querySelector('#vocab-tile-grid .tile-peeking');
  const n = tpTiles().length;
  while (live() && i < n) {
    // Holding a word yourself takes over: stop here.
    if (held()) return tpPause();
    const s = tpSpeed();
    const drawn = tpShow(i, false);
    await tpWait(TP_PACE.lead / s);
    if (!live()) return;
    const item = tpItems()[i];
    await Promise.all([new Promise(r => tpSay(item, r)), drawn]);
    if (!live()) return;
    const letters = [...(item.jp || '')].filter(c => /\p{L}/u.test(c)).length;
    await tpWait((TP_PACE.hold + TP_PACE.perLetter * letters) / s);
    if (!live()) return;
    i++;
    if (i < n) {
      if (held()) return tpPause();
      hideTilePeekBubble(); await tpWait(150);
    }
  }
  if (live()) { tpPause(); tp.pos = 0; tpMsg(tx('play.end')); }
}

// A word: from here if playing, or shown and said on its own if paused.
function tpGo(i) {
  if (!tp) return;
  if (i < 0 || i >= tpTiles().length) return;
  tpMsg('');
  tp.gen++;
  if (tp.playing) { cancelSpeechIfBusy(); tp.pos = i; tpRun(i, tp.gen); }
  else tpShow(i, true);
}
function tpStep(step) { if (tp) tpGo(tp.pos + step); }
function tpSpeedNext() {
  const i = PLAY_SPEEDS.indexOf(tpSpeed());
  try { localStorage.setItem(TP_SPEED_KEY, String(PLAY_SPEEDS[(i + 1) % PLAY_SPEEDS.length])); } catch (e) { /* private mode */ }
  tpSync();
}

// While the bar is open a tap on a tile is "this word" (caught before the
// tile's own select-for-drill tap).
document.addEventListener('click', e => {
  if (!tp) return;
  const tile = e.target.closest && e.target.closest('#vocab-tile-grid .kana-ref-card');
  if (!tile) return;
  e.stopPropagation(); e.preventDefault();
  if (Date.now() < tilePeekSuppressClickUntil) return;
  tpGo(tpTiles().indexOf(tile));
}, true);
// Away from the app (the voice is cut off anyway): pause, keep the place.
document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible') tpPause(); });
