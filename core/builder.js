// Português Drill - The core: the sentence builder, sentence challenge and
// reading challenge (2026-11-07, refactor step 7 - the mechanics moved here
// from pt/builder.js, unchanged in behaviour).
//
// The core does: the columns and their colours, picking and unpicking, the
// sentence strip, Check (right / wrong / missing / extra, "right verb - check
// the form"), one more go with wrong picks taken off, the session line, and
// part scores over the last 20 first checks (building and reading kept apart).
//
// The app registers:
//   setBuilderLanguage({...})  the language's rules - assemble(sel) and
//       chunks(sel) (word order, joins), english(sel), notes(sel) for the free
//       builder, newTarget() and buildColumns() for a challenge, formsMatch,
//       clearWith (what goes when a wrong pick comes off), partDefs.
//       Optional hooks, for a language whose builder differs (Japanese:
//       readings, endings and か, Answer it): screen (its screen id), title(),
//       onReset(why) ('enter' | 'challenge' | 'clear': its own state),
//       targetSel(target), same(a, b), sayPick(id, card), sayText(),
//       targetSay(), mark(id, s, t) (before the usual right / missing /
//       extra; undefined to carry on), compare(id, s, t), afterMark(res, prev),
//       counts(res) -> { r, n } (session and verdict), recordParts(res),
//       labelHtml(label), stripHtml(chunks), answerHtml(), endingMsg(),
//       buttons(btn, chunks), drawColumns(colsEl).
//   registerBuilderMode({...}) one per mode, in the order they're offered:
//       id, label, slots ([id, role] in sentence order), reading (false: no
//       reading challenge), preset(sel) and fixed (parts that are given),
//       formSlot (the part whose form is chosen under it), formAlwaysChecked,
//       agreeSlot, partFor(id) (part-score name), onPick(id, card, same, extra)
//       (what a new pick clears), endingNote(reverse), draw(ui) (its columns).
// The test every mode must pass: it solves its own challenges (see
// golden/harness.js, builderPlay; Japanese: golden/japanese/harness.js).
// Japanese moved onto it 10 Nov 2026 (ja/builder.js registers its modes).

let sbMode = null, sbChallenge = false, sbReverse = false; // sbMode: the first mode registered
// Answer it (Japanese 4 Nov; on the core 11 Nov, for Portuguese too): a
// question about you, answered by building the whole sentence. The target
// is the answer; sbTarget.question {pt|jp, en, slot} is the prompt, and
// slot is the part asked about - any card that fits it is right (the
// language's answerFits / adoptAnswer). sbShowQEn: the question's English shown.
let sbAnswer = false, sbShowQEn = false;
let sbSel = {}, sbTarget = null, sbTry = 0, sbDone = false, sbResult = null, sbCols = null;
let sbStats = { right: 0, total: 0 };
// The modes, and the language's builder rules, are registered by the app
// (pt/builder.js for Portuguese). See the notes at the top of this file.
const BUILDER_MODES = {};
function registerBuilderMode(m) { BUILDER_MODES[m.id] = m; if (!sbMode) sbMode = m.id; }
let BUILDER = null;
function setBuilderLanguage(b) { BUILDER = b; }
const sbM = () => BUILDER_MODES[sbMode];
// A mode's fixed parts are given, not picked (Going's verb is always ir).
const sbPreset = () => { const m = sbM(); if (m.preset) m.preset(sbSel); };
const sbFixed = id => (sbM().fixed || []).includes(id);
const sbReadingMode = id => BUILDER_MODES[id] && BUILDER_MODES[id].reading !== false;
// A mode the current challenge can use: reading and Answer it can each be
// switched off per mode (reading: false, answer: false).
const sbModeOk = id => BUILDER_MODES[id] && (sbReverse ? sbReadingMode(id) : sbAnswer ? BUILDER_MODES[id].answer !== false : true);
const sbSlots = () => sbM().slots.map(([id, role]) => ({ id, role }));
const sbSlotIdx = id => sbSlots().findIndex(s => s.id === id);
const sbHook = (name, ...a) => BUILDER[name] ? BUILDER[name](...a) : undefined;
const sbTargetSel = () => BUILDER.targetSel ? BUILDER.targetSel(sbTarget) : sbTarget.sel;
const sbSame = (a, b) => !!a && !!b && (BUILDER.same ? BUILDER.same(a, b) : a.pt === b.pt);
const sbLabelHtml = l => BUILDER.labelHtml ? BUILDER.labelHtml(l) : l;

// --- part scores (building and reading kept apart) ------------------------
const SB_PARTS_KEY = APP.storagePrefix + 'SentenceParts', SB_PARTS_KEY_R = APP.storagePrefix + 'SentencePartsR';
let sbParts = {}, sbPartsR = {};
try { sbParts = JSON.parse(localStorage.getItem(SB_PARTS_KEY)) || {}; } catch (e) { sbParts = {}; }
try { sbPartsR = JSON.parse(localStorage.getItem(SB_PARTS_KEY_R)) || {}; } catch (e) { sbPartsR = {}; }
function sbRecordPart(id, ok) {
  const store = sbReverse ? sbPartsR : sbParts;
  const e = store[id] || { r: [], n: 0 };
  e.r.push(ok ? 1 : 0);
  if (e.r.length > 20) e.r = e.r.slice(-20);
  e.n++;
  store[id] = e;
}
function sbSaveParts() { try { localStorage.setItem(SB_PARTS_KEY, JSON.stringify(sbParts)); localStorage.setItem(SB_PARTS_KEY_R, JSON.stringify(sbPartsR)); } catch (e) { /* fine */ } }
function sbPartStats(rev) {
  const store = rev ? sbPartsR : sbParts;
  return BUILDER.partDefs.map(([id, label, slot]) => {
    const e = store[id];
    const pct = e && e.r.length ? Math.round(100 * e.r.reduce((a, b) => a + b, 0) / e.r.length) : null;
    return { id, label, slot, pct, n: e ? e.n : 0 };
  });
}
function sbWeakestPart(rev) {
  const ok = sbPartStats(rev).filter(x => x.n >= 5 && x.pct !== null).sort((a, b) => a.pct - b.pct);
  return ok.length && ok[0].pct < 100 ? ok[0] : null;
}
function sbPartsPanelHtml(rev) {
  const stats = sbPartStats(rev).filter(x => x.n > 0);
  if (!stats.length) return '';
  const rows = stats.map(x => {
    const few = x.n < 5;
    return `<div class="sbp-row${few ? ' sbp-few' : ''}" style="--slot:var(--slot-${x.slot})"><span class="sbp-label">${sbLabelHtml(x.label)}</span>` +
      `<span class="sbp-bar"><span style="width:${x.pct}%"></span></span><span class="sbp-pct">${few ? '–' : x.pct + '%'}</span></div>`;
  }).join('');
  const weak = sbWeakestPart(rev);
  return `<div class="sbp-panel"><div class="sbp-title">${rev ? tx('parts.titleReading') : tx('parts.titleChallenge')}</div>${rows}` +
    `<div class="sbp-note">${weak ? tx('parts.mostRoom', { part: sbLabelHtml(weak.label) }) + ' ' : ''}${tx('parts.over20')}</div></div>`;
}

// --- screen --------------------------------------------------------------
function sbRefreshPanels() {
  const panel = document.getElementById('sb-parts-panel');
  if (panel) panel.innerHTML = sbPartsPanelHtml(false) + sbPartsPanelHtml(true);
}
// challenge: false (builder) | true (sentence challenge) | 'reverse' (reading)
function showSentenceBuilder(challenge) {
  sbReverse = challenge === 'reverse';
  sbAnswer = challenge === 'answer'; sbShowQEn = false;
  sbChallenge = !!challenge;
  if (!sbModeOk(sbMode)) sbMode = Object.keys(BUILDER_MODES).find(sbModeOk);
  // Every entry starts clean (a finished challenge once locked the builder).
  sbSel = {}; sbTarget = null; sbTry = 0; sbDone = false; sbResult = null;
  sbHook('onReset', 'enter', challenge);
  const title = document.getElementById('sb-title');
  if (title) title.textContent = sbHook('title') || (sbReverse ? tx('sb.titleReading') : sbAnswer ? tx('sb.titleAnswer') : sbChallenge ? tx('sb.titleChallenge') : tx('sb.titleBuilder'));
  sbStart();
  showScreen(BUILDER.screen || 'sb');
  window.scrollTo(0, 0);
}
function sbStart() { if (sbChallenge) sbNewChallenge(); else { sbSel = {}; sbPreset(); BUILDER.buildColumns(); sbRender(); } }
function sbSetMode(m) {
  if (sbMode === m || !sbModeOk(m)) return;
  sbMode = m; sbSel = {}; sbTarget = null; sbTry = 0; sbDone = false; sbResult = null;
  sbStart();
}
function sbNewChallenge() {
  sbTarget = BUILDER.newTarget();
  sbSel = {}; sbTry = 0; sbDone = false; sbResult = null; sbShowQEn = false;
  sbHook('onReset', 'challenge');
  sbPreset();
  BUILDER.buildColumns();
  sbRender();
}
function sbShuffle() { BUILDER.buildColumns(); sbSel = {}; sbPreset(); sbRender(); }
function sbClear() { if (sbDone) return; sbSel = {}; sbHook('onReset', 'clear'); sbPreset(); sbResult = null; sbRender(); }
const sbLocked = id => sbResult && sbResult[id] === 'right';
// extra: what the card brings with it (Japanese: the verb an object is
// listed under), for the mode's onPick.
function sbPick(id, card, extra) {
  if (sbDone || sbLocked(id)) return;
  const same = sbSame(sbSel[id], card);
  if (same) delete sbSel[id]; else sbSel[id] = card;
  if (sbResult) delete sbResult[id];
  // What a new pick clears (a new verb has its own forms and objects...).
  if (sbM().onPick) sbM().onPick(id, card, same, extra);
  sbRender();
  if (!same) { if (BUILDER.sayPick) BUILDER.sayPick(id, card); else if (!sbReverse) speakTarget(card.pt); }
}
function sbPickForm(f) {
  if (sbDone || sbLocked('ending')) return;
  if (sbSel.form && sbSel.form.pt === f.pt) delete sbSel.form; else sbSel.form = f;
  if (sbResult) delete sbResult.ending;
  sbRender();
  if (sbSel.form && !sbReverse) speakTarget(f.pt);
}
function sbPickAgree(f) {
  if (sbDone || sbLocked('agree')) return;
  if (sbSel.agree && sbSel.agree.pt === f.pt) delete sbSel.agree; else sbSel.agree = f;
  if (sbResult) delete sbResult.agree;
  sbRender();
  if (sbSel.agree) speakTarget(f.pt);
}
// Answer it's question: hear it, show or hide its English.
function sbSayTheQuestion() { if (sbTarget && sbTarget.question) speakTarget(sbTarget.question.pt); }
function sbToggleQuestionEn() { sbShowQEn = !sbShowQEn; sbRender(); }
function sbSay() { const t = BUILDER.sayText ? BUILDER.sayText() : BUILDER.assemble(sbSel); if (t) speakTarget(t); }
function sbSayTarget() { if (sbTarget) speakTarget(BUILDER.targetSay ? BUILDER.targetSay() : sbTarget.pt); }

// Check: each part right / wrong / missing / extra; the right verb (or
// describing word) with the wrong form is its own message.
function sbCheck() {
  if (!sbTarget || sbDone) return;
  sbTry++;
  const M = sbM(), T = sbTargetSel(), S = sbSel, res = {}, prev = sbResult || {};
  sbSlots().forEach(({ id }) => {
    if (prev[id] === 'right') { res[id] = 'right'; return; }
    if (sbFixed(id)) return; // given (ir in Going); only its form counts
    const t = T[id], s = S[id];
    if (BUILDER.mark) { const m = BUILDER.mark(id, s, t); if (m !== undefined) { res[id] = m; return; } }
    if (id === 'who' && sbTarget.whoOptional) { if (s) res[id] = s.pt === t.pt ? 'right' : 'wrong'; return; }
    if (!t && !s) return;
    if (!t) { res[id] = 'extra'; return; }
    if (!s) { res[id] = 'missing'; return; }
    res[id] = BUILDER.compare ? BUILDER.compare(id, s, t) : s.pt === t.pt ? 'right' : 'wrong';
    // Answer it: the part asked about is yours to choose - any card that
    // fits is right, and the answer shown becomes yours.
    if (res[id] === 'wrong' && sbAnswer && sbTarget.question && sbTarget.question.slot === id && BUILDER.answerFits && BUILDER.answerFits(id, s, t)) { BUILDER.adoptAnswer(id, s); res[id] = 'right'; }
  });
  // The form chosen under a pick (a verb's ending) is marked as "ending";
  // an agreeing form (Being's describing word) as "agree".
  const formOk = () => S.form && BUILDER.formsMatch(S.form, T.form, T);
  if (M.formAlwaysChecked) res.ending = prev.ending === 'right' || formOk() ? 'right' : (S.form ? 'wrong' : 'missing');
  else if (M.formSlot && res[M.formSlot] === 'right') res.ending = prev.ending === 'right' || formOk() ? 'right' : 'ending';
  if (M.agreeSlot && res[M.agreeSlot] === 'right') res.agree = prev.agree === 'right' || (S.agree && S.agree.pt === T.agree.pt) ? 'right' : 'ending';
  sbHook('afterMark', res, prev);
  if (sbTry === 1) {
    const c = sbCounts(res);
    sbStats.total += c.n; sbStats.right += c.r;
    if (BUILDER.recordParts) BUILDER.recordParts(res);
    else Object.entries(res).forEach(([id, r]) => {
      const part = M.partFor ? M.partFor(id) : id;
      sbRecordPart(part, r === 'right');
    });
    sbSaveParts();
  }
  // Wrong picks come off, so the second go starts from what's right.
  if (sbTry < 2) Object.keys(res).forEach(id => {
    if (res[id] === 'wrong' || res[id] === 'extra') {
      if (id === 'ending') { delete S.form; return; }
      delete S[id];
      ((BUILDER.clearWith || {})[id] || []).forEach(k => delete S[k]);
    }
    if (res[id] === 'ending') { if (id === 'agree') delete S.agree; else delete S.form; }
  });
  sbResult = res;
  // (A part left out where that's fine is null: not counted either way.)
  const allRight = Object.values(res).every(r => r === 'right' || r === null);
  if (allRight || sbTry >= 2) sbDone = true;
  // Draw first, then speak: if speech fails on a device, the challenge still
  // finishes (2026-11-07 - a reading challenge on a Pixel stuck at Check).
  sbRender();
  if (sbDone) sbSayTarget();
}
// Parts right of parts counted: every part marked, unless the language counts
// otherwise (Japanese: the answer's parts).
function sbCounts(res) {
  if (BUILDER.counts) return BUILDER.counts(res);
  const ids = Object.keys(res);
  return { r: ids.filter(k => res[k] === 'right').length, n: ids.length };
}
function sbRender() {
  const top = document.getElementById('sb-strip'), colsEl = document.getElementById('sb-cols');
  if (!top || !colsEl) return;
  const M = sbM();
  document.querySelectorAll('#sb-mode-row button').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === sbMode);
    b.disabled = !sbModeOk(b.dataset.mode);
  });
  const chunks = BUILDER.chunks(sbSel);
  const mark = c => {
    let id = c.id;
    if (id === M.formSlot && sbResult && (sbResult.ending === 'ending' || M.formAlwaysChecked)) id = 'ending';
    if (id === M.agreeSlot && sbResult && sbResult.agree === 'ending') id = 'agree';
    return sbResult && sbResult[id] ? ' sb-' + sbResult[id] : '';
  };
  const label = id => (sbSlots().find(x => String(x.id) === String(id)) || {}).role || id; // (Japanese's ids are numbers)
  let html = '';
  if (BUILDER.stripHtml) html += BUILDER.stripHtml(chunks);
  else if (sbReverse && sbTarget) {
    html += `<div class="sb-pt sb-prompt-pt" onclick="sbSayTarget()">${escapeHtmlText(sbTarget.pt)}</div>`;
    html += Object.keys(sbSel).some(k => sbSel[k] && !sbFixed(k))
      ? `<div class="sb-en sb-en-built">"${escapeHtmlText(BUILDER.english(sbSel))}"</div>`
      : `<div class="sb-empty">${tx('sb.readingHelp')}</div>`;
  } else {
    if (sbAnswer && sbTarget && sbTarget.question) {
      const Q = sbTarget.question;
      html += `<div class="sb-pt sb-prompt-pt" onclick="sbSayTheQuestion()">${escapeHtmlText(Q.pt)}</div>` + (sbShowQEn || sbDone ? `<div class="sb-en">"${escapeHtmlText(Q.en)}"</div>` : '');
    } else if (sbChallenge && sbTarget) html += `<div class="sb-prompt">"${escapeHtmlText(sbTarget.en)}"</div>`;
    if (chunks.length) {
      html += `<div class="sb-pt">${chunks.map((c, k) => {
        const txt = k === 0 ? c.pt.charAt(0).toUpperCase() + c.pt.slice(1) : c.pt;
        return `<span class="sb-chunk${c.verbOnly ? ' sb-verb-only' : ''}${mark(c)}" style="--slot:var(--slot-${c.slot + 1})">${escapeHtmlText(txt)}</span>`;
      }).join(' ')}.</div>`;
      if (!sbChallenge) html += `<div class="sb-en">"${escapeHtmlText(BUILDER.english(sbSel))}"</div>`;
    } else html += `<div class="sb-empty">${sbAnswer ? tx('sb.answerHelp') : sbChallenge ? tx('sb.challengeHelp') : tx('sb.builderHelp')}</div>`;
  }
  const notes = !sbChallenge && !BUILDER.stripHtml ? BUILDER.notes(sbSel) : [];
  if (notes.length) html += `<div class="sb-notes">${notes.map(escapeHtmlText).join(' · ')}</div>`;
  if (sbChallenge && sbResult) {
    if (sbDone) {
      const { r, n } = sbCounts(sbResult);
      html += BUILDER.answerHtml ? BUILDER.answerHtml() : sbReverse ? `<div class="sb-answer"><div class="sb-en sb-en-answer">"${escapeHtmlText(sbTarget.en)}"</div></div>`
        : `<div class="sb-answer" onclick="sbSayTarget()"><div class="sb-pt">${escapeHtmlText(sbTarget.pt)}</div>${sbAnswer ? `<div class="sb-en">"${escapeHtmlText(sbTarget.en)}"</div>` : ''}</div>`;
      html += `<div class="sb-verdict${r === n ? ' good' : ''}">${r === n ? (sbTry === 1 ? tx('sb.allRightFirst') : tx('sb.allRightSecond')) : tx('sb.rOfN', { r, n })}</div>`;
    } else {
      const missing = Object.keys(sbResult).filter(k => sbResult[k] === 'missing').map(k => k === 'ending' ? tx('sb.theVerbForm') : label(k));
      const wrongN = Object.values(sbResult).filter(r => r === 'wrong' || r === 'extra').length;
      const bits = [wrongN ? tx('sb.nNotRight', { n: wrongN }) : '',
        BUILDER.endingMsg ? BUILDER.endingMsg() : sbResult.ending === 'ending' ? (M.endingNote ? M.endingNote(sbReverse) : tx('sb.checkTheForm')) : '',
        sbResult.agree === 'ending' ? tx('sb.checkAgreement') : '',
        missing.length ? tx('sb.missing', { parts: missing.join(', ') }) : ''].filter(Boolean);
      html += `<div class="sb-verdict">${tx('sb.oneMoreGo', { bits: bits.join(' · ') })}</div>`;
    }
  }
  const btn = (text, fn, main) => `<button type="button" class="ds-btn${main ? ' ds-btn-main' : ''}" onclick="${fn}">${text}</button>`;
  html += '<div class="ds-buttons sb-buttons">';
  if (BUILDER.buttons) html += BUILDER.buttons(btn, chunks);
  else if (sbReverse) html += btn(tx('sb.hearIt'), 'sbSayTarget()');
  else if (sbAnswer) {
    html += btn(tx('sb.hearQuestion'), 'sbSayTheQuestion()');
    if (!sbDone) html += btn(sbShowQEn ? tx('sb.hideEnglish') : tx('sb.showEnglish'), 'sbToggleQuestionEn()');
    if (chunks.length) html += btn(tx('sb.hearMyAnswer'), 'sbSay()');
  } else if (chunks.length) html += btn(tx('sb.hearIt'), 'sbSay()');
  if (sbChallenge) html += sbDone ? btn(tx('drill.next'), 'sbNewChallenge()', true) : btn(sbTry ? tx('sb.checkAgain') : tx('drill.check'), 'sbCheck()', true) + btn(tx('sb.clear'), 'sbClear()');
  else html += btn(tx('sb.clear'), 'sbClear()') + btn(tx('sb.shuffle'), 'sbShuffle()');
  html += '</div>';
  if (sbChallenge && sbStats.total) {
    const weak = sbWeakestPart(sbReverse);
    html += `<div class="sb-stats">${tx('sb.session', { r: sbStats.right, n: sbStats.total })}${weak ? ' · ' + tx('sb.sessionWeak', { part: sbLabelHtml(weak.label), pct: weak.pct }) : ''}</div>`;
  }
  top.innerHTML = html;

  // Columns
  colsEl.innerHTML = '';
  colsEl.classList.toggle('sb-rev', sbReverse);
  if (BUILDER.drawColumns) { BUILDER.drawColumns(colsEl); return; }
  const T = sbDone && sbTarget ? sbTargetSel() : null;
  const column = (id, note, fill) => {
    const i = sbSlotIdx(id);
    const col = document.createElement('div');
    col.className = 'ds-col sb-col';
    col.style.setProperty('--slot', `var(--slot-${i + 1})`);
    col.innerHTML = `<div class="ds-head"><div class="ds-head-top"><span class="ds-num">${i + 1}</span><span class="ds-role">${escapeHtmlText(sbSlots()[i].role)}</span></div></div>` +
      (note && !sbReverse ? `<div class="ds-note">${escapeHtmlText(note)}</div>` : '');
    fill(col);
    colsEl.appendChild(col);
  };
  const card = (col, id, it) => {
    const el = document.createElement('div');
    const picked = sbSel[id] && sbSel[id].pt === it.pt;
    const isAns = T && T[id] && T[id].pt === it.pt;
    el.className = 'ds-card sb-card' + (picked ? ' sb-picked' : '') + (picked && sbResult && sbResult[id] === 'right' ? ' sb-ok' : '') + (isAns && !picked ? ' sb-should' : '');
    const len = it.pt.length;
    el.innerHTML = `<div class="ds-pt${len >= 20 ? ' xlong' : len >= 14 ? ' long' : ''}">${escapeHtmlText(it.pt)}</div><div class="ds-en">${escapeHtmlText(it.en)}</div>`;
    el.onclick = () => sbPick(id, it);
    col.appendChild(el);
  };
  const groupHead = (col, text) => { const h = document.createElement('div'); h.className = 'ds-group-head'; h.innerHTML = `<span class="ds-pt">${escapeHtmlText(text)}</span>`; col.appendChild(h); };
  const formBox = (col, head, forms, chosen, ans, onPick, labelOf) => {
    const box = document.createElement('div');
    box.className = 'sb-forms';
    box.innerHTML = `<div class="sb-forms-head">${escapeHtmlText(head)}</div>`;
    forms.forEach(f => {
      const b = document.createElement('button');
      b.type = 'button';
      const on = chosen && chosen.pt === f.pt && (!sbReverse || chosen.tense === f.tense);
      b.className = 'sb-form' + (on ? ' active' : '') + (ans && ans.pt === f.pt && !on ? ' sb-should' : '');
      b.textContent = labelOf ? labelOf(f) : f.pt;
      b.onclick = () => onPick(f);
      box.appendChild(b);
    });
    col.appendChild(box);
  };
  // The columns themselves are the mode's (what each offers, its notes, the
  // form choosers under a pick); the core supplies the pieces.
  M.draw({ column, card, groupHead, formBox, T, p: sbSel.who ? sbSel.who.p : 0 });
}
