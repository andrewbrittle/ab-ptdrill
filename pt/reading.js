// Português Drill - Portuguese: reading passages (11 Nov 2026, from the
// Japanese app, for Porto). Like a class reading task: a short diary of one
// day - four linked sentences in the past, all from the sentence engine's own
// words and rules (grammar.js SENT) - then four English statements to mark
// true or false. Every statement comes from one fact in the passage; a false
// one changes that single detail. Tap a line to hear it.
//   1. Where I went, how and with whom (pretérito: fui).
//   2. What I did there (Lá, comi / li / comprei…).
//   3. What something was like (imperfeito: era / estava), when there's a
//      describing word for the place, the city or the train.
//   4. Then home, and what I did there (Depois, voltei para casa e vi…).

// Destinations that are also places where something happens (SENT.places keys).
const RP_DEST_PLACE = { praia: 'beach', jardim: 'park', biblioteca: 'library', mercado: 'market', restaurante: 'restaurant' };
// What can be described: by destination, by kind of destination, by transport.
const RP_DESCRIBE_DEST = { restaurante: 'restaurant' }, RP_DESCRIBE_KIND = { city: 'town' };
const RP_DESCRIBE_TRANSPORT = { 'de comboio': 'comboio', 'de autocarro': 'autocarro' };
// A false sentence about what something was like says the opposite plainly
// ("The restaurant was expensive" when it was cheap) - never "wasn't", which
// made you untangle a double negative (Andrew, 11 Nov). An adjective with no
// clear opposite here (delicious, interesting...) gives no sentence to mark.
const RP_OPPOSITE_EN = {
  caro: 'cheap', barato: 'expensive', cheio: 'empty', vazio: 'full', grande: 'small', pequeno: 'big',
  rápido: 'slow', lento: 'fast', frio: 'warm', quente: 'cold', novo: 'old', velho: 'new',
  fechado: 'open', estreito: 'wide', limpo: 'dirty', bom: 'bad', atrasado: 'on time', antigo: 'modern',
};

const rpOther = (list, cur, same) => sPick(list.filter(x => !same(x, cur)));
const rpObjEn = o => o[1];
// An activity's objects that suit a place (an object may name its own places).
function rpActsAt(key) {
  return SENT.activities.map(act => ({ act, objs: act.objs.filter(o => (o[3] || act.places).includes(key)) })).filter(x => x.objs.length);
}
const rpPast = (act, o) => (o[2] || act.en)[2];

function rpPassage() {
  const me = SENT.people.find(x => x.kind === 'me');
  const time = sTime('past', t => !t.long && !t.night && !t.morning);
  if (!time) return null;
  const d = sPick(SENT.destinations.filter(x => (RP_DEST_PLACE[x.pt] || x.kind === 'city') && destOk(x, time, 'past')));
  if (!d) return null;
  const city = d.kind === 'city';
  const trs = SENT.transport.filter(x => city ? x.trip : x.local);
  const tr = sPick(trs), comp = sCompanion(me);
  if (!tr || !comp) return null;
  const lines = [], facts = [];
  // 1. Where, how, with whom.
  lines.push({ pt: `${time.pt} fui ${ptPrepJoin('a', d)} ${tr.pt} ${comp.pt}.`, en: enTidy(`${sCap(time.en)}, I went to ${d.en} ${tr.en} ${comp.en}.`) });
  const otherTr = rpOther(trs, tr, (a, b) => a.pt === b.pt);
  facts.push({ t: `I went to ${d.en} ${tr.en}.`, f: otherTr && `I went to ${d.en} ${otherTr.en}.` });
  const alone = /^sozinh/.test(comp.pt);
  facts.push({ t: sCap(`I went ${comp.en}.`), f: alone ? 'I went with a friend.' : 'I went on my own.' });
  // 2. What I did there.
  const acts = city ? [{ act: SENT.activities.find(a => a.verb === 'visitar'), objs: SENT.activities.find(a => a.verb === 'visitar').objs.filter(o => /museu|castelo/.test(o[0])) }]
    .concat(rpActsAt('restaurant')) : rpActsAt(RP_DEST_PLACE[d.pt]);
  const A = sPick(acts.filter(x => x.act && x.objs.length));
  if (!A) return null;
  const o = sPick(A.objs);
  lines.push({ pt: `Lá, ${vForm(A.act.verb, 'pret', 0)} ${o[0]}.`, en: `There, I ${rpPast(A.act, o)} ${rpObjEn(o)}.` });
  const o2 = rpOther(A.objs, o, (a, b) => a[0] === b[0]);
  facts.push({ t: sCap(`I ${rpPast(A.act, o)} ${rpObjEn(o)} there.`), f: o2 && sCap(`I ${rpPast(A.act, o2)} ${rpObjEn(o2)} there.`) });
  // 3. What something was like.
  const ctx = RP_DESCRIBE_DEST[d.pt] || RP_DESCRIBE_KIND[d.kind];
  const things = [];
  if (ctx) things.push(...SENT.describe.find(c => c.ctx === ctx).items);
  if (RP_DESCRIBE_TRANSPORT[tr.pt]) things.push(...SENT.describe.find(c => c.ctx === 'travel').items.filter(it => it.pt === RP_DESCRIBE_TRANSPORT[tr.pt]));
  const it = sPick(things);
  if (it) {
    const a = sPick(it.adj), pl = nounPlural(it), g = nounGender(it);
    const be = vForm(a[2], 'imp', pl ? 4 : 2), adj = ptAgree(a[0], g, pl), very = sChance(0.35);
    const was = pl ? 'were' : 'was';
    lines.push({ pt: sCap(`${ptArticle(it)} ${be} ${very ? 'muito ' : ''}${adj}.`), en: sCap(`${it.en} ${was} ${very ? 'very ' : ''}${a[1]}.`) });
    const opp = RP_OPPOSITE_EN[a[0]];
    facts.push({ t: sCap(`${it.en} ${was} ${a[1]}.`), f: opp && sCap(`${it.en} ${was} ${opp}.`) });
  }
  // 4. Then home, and something there.
  const home = rpActsAt('home').filter(x => x.act !== A.act && !['tomar'].includes(x.act.verb));
  const H = sPick(home), ho = H && sPick(H.objs);
  if (H) {
    lines.push({ pt: `Depois, voltei para casa e ${vForm(H.act.verb, 'pret', 0)} ${ho[0]}.`, en: `After that, I went home and ${rpPast(H.act, ho)} ${rpObjEn(ho)}.` });
    const H2 = rpOther(home, H, (a, b) => a.act === b.act), ho2 = H2 && sPick(H2.objs);
    facts.push({ t: `At home, I ${rpPast(H.act, ho)} ${rpObjEn(ho)}.`, f: ho2 && `At home, I ${rpPast(H2.act, ho2)} ${rpObjEn(ho2)}.` });
  }
  const claims = shuffle(facts.filter(f => f.t && f.f)).slice(0, 4).map(f => { const truth = sChance(0.5); return { en: truth ? f.t : f.f, truth }; });
  if (claims.length < 3) return null;
  return { title: time.pt, lines, claims };
}

let rpCur = null, rpShowEn = false, rpStats = { right: 0, total: 0 };

function showReadingPassage() {
  for (let i = 0; i < 30 && !(rpCur = rpPassage()); i++);
  rpShowEn = false;
  rpRender();
  showScreen('reading');
  window.scrollTo(0, 0);
}

function rpRender() {
  const el = document.getElementById('reading-body');
  if (!el || !rpCur) return;
  const done = rpCur.claims.every(c => c.ans !== undefined);
  const esc = escapeHtmlText;
  el.innerHTML = `
    <div class="settings-sub">${esc(tx('rp.intro'))}</div>
    <div class="rp-passage">
      ${rpCur.lines.map((l, k) => `<div class="rp-line" onclick="rpSay(${k})"><div class="rp-pt">${esc(l.pt)}</div>${rpShowEn || done ? `<div class="rp-en">${esc(l.en)}</div>` : ''}</div>`).join('')}
    </div>
    <div class="ds-buttons">
      <button type="button" class="ds-btn" onclick="rpSay()">${esc(tx('rp.hearAll'))}</button>
      ${done ? '' : `<button type="button" class="ds-btn" onclick="rpShowEn=!rpShowEn;rpRender()">${esc(tx(rpShowEn ? 'sb.hideEnglish' : 'sb.showEnglish'))}</button>`}
    </div>
    <div class="rp-claims">
      ${rpCur.claims.map((c, k) => {
        const res = c.ans === undefined ? '' : c.ans === c.truth ? ' rp-right' : ' rp-wrong';
        const off = c.ans !== undefined ? 'disabled' : '';
        return `<div class="rp-claim${res}"><div class="rp-claim-en">${k + 1}. ${esc(c.en)}</div><div class="rp-tf">
          <button type="button" class="rp-btn${c.ans === true ? ' active' : ''}" onclick="rpAnswer(${k}, true)" ${off}>${esc(tx('rp.true'))}</button>
          <button type="button" class="rp-btn${c.ans === false ? ' active' : ''}" onclick="rpAnswer(${k}, false)" ${off}>${esc(tx('rp.false'))}</button></div>
          ${c.ans !== undefined ? `<div class="rp-verdict">${esc(tx(c.ans === c.truth ? 'rp.right' : 'rp.notThisTime', { tf: tx(c.truth ? 'rp.itsTrue' : 'rp.itsFalse') }))}</div>` : ''}</div>`;
      }).join('')}
    </div>
    ${done ? `<div class="sb-verdict rp-score${rpCur.claims.every(c => c.ans === c.truth) ? ' good' : ''}">${esc(tx('rp.score', { r: rpCur.claims.filter(c => c.ans === c.truth).length, n: rpCur.claims.length, sr: rpStats.right, st: rpStats.total }))}</div>` : ''}
    <div class="ds-buttons"><button type="button" class="ds-btn ds-btn-main" onclick="showReadingPassage()">${esc(tx(done ? 'rp.next' : 'rp.different'))}</button></div>`;
}

// One line, or (no k) the whole passage.
function rpSay(k) {
  if (!rpCur) return;
  speakTarget(k === undefined ? rpCur.lines.map(l => l.pt).join(' ') : rpCur.lines[k].pt);
}

function rpAnswer(k, val) {
  const c = rpCur && rpCur.claims[k];
  if (!c || c.ans !== undefined) return;
  c.ans = val;
  rpStats.total++; if (val === c.truth) rpStats.right++;
  rpRender();
}
