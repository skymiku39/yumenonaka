'use strict';
// 《中之夢》試玩原型：一季四週。規則依 docs/03-玩法規格.md，數字都是佔位。

const $ = s => document.querySelector(s);
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- 貼紙圖 ----------
const O = 'stroke="#4a3b33" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
const svg = body => `<svg viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;

function face(hair, eye, mood, extra) {
  const eyes = mood === 'tired'
    ? `<path d="M35 57h9M56 57h9" ${O} fill="none"/>`
    : mood === 'laugh'
      ? `<path d="M35 59q4-7 9 0M56 59q4-7 9 0" ${O} fill="none"/>`
      : `<circle cx="40" cy="57" r="3.5" fill="${eye}"/><circle cx="60" cy="57" r="3.5" fill="${eye}"/>`;
  const mouth = mood === 'tired'
    ? `<path d="M45 70h10" ${O} fill="none"/>`
    : mood === 'laugh'
      ? `<path d="M42 66q8 12 16 0z" fill="#e06666" ${O}/>`
      : `<path d="M44 68q6 5 12 0" ${O} fill="none"/>`;
  return svg(
    `<path d="M16 54a34 36 0 0 1 68 0v24q-8 8-12-2H28q-4 10-12 2z" fill="${hair}" ${O}/>` +
    `<circle cx="50" cy="56" r="25" fill="#ffe6d5" ${O}/>` +
    `<path d="M25 52q2-26 25-26t25 26q-12-12-25-9t-25 9z" fill="${hair}" ${O}/>` +
    `<circle cx="33" cy="66" r="4" fill="#ffb6b6" opacity=".7"/><circle cx="67" cy="66" r="4" fill="#ffb6b6" opacity=".7"/>` +
    eyes + mouth + (extra || ''));
}

const STK = {
  nami: mood => face('#6b5142', '#3a2a22', mood),
  kaoru: mood => face('#b79be8', '#7a4fd0', mood,
    `<g fill="#fff3a6" ${O}><circle cx="24" cy="26" r="5"/><circle cx="32" cy="22" r="5"/><circle cx="30" cy="32" r="5"/></g><circle cx="29" cy="27" r="3" fill="#f6b26b"/>`),
};

const ICON = {
  work: svg(`<path d="M38 36v-8h24v8" fill="none" ${O}/><rect x="18" y="36" width="64" height="44" rx="8" fill="#d39a6a" ${O}/><rect x="44" y="52" width="12" height="10" rx="2" fill="#fff3a6" ${O}/>`),
  class: svg(`<path d="M50 28q-16-8-32-4v50q16-4 32 4q16-8 32-4V24q-16-4-32 4z" fill="#8fc1ee" ${O}/><path d="M50 28v50" ${O} fill="none"/>`),
  practice: svg(`<rect x="38" y="14" width="24" height="42" rx="12" fill="#f39a9a" ${O}/><path d="M28 46q0 22 22 22t22-22M50 68v16M38 84h24" fill="none" ${O}/>`),
  idea: svg(`<path d="M50 14a24 24 0 0 1 14 44v8H36v-8a24 24 0 0 1 14-44z" fill="#ffe27a" ${O}/><rect x="38" y="68" width="24" height="12" rx="4" fill="#c9c2bb" ${O}/>`),
  rest: svg(`<path d="M64 18a34 34 0 1 0 18 46a26 26 0 0 1-18-46z" fill="#a9c9f2" ${O}/><path d="M22 22h12l-12 12h12" fill="none" ${O}/>`),
  prep: svg(`<rect x="24" y="22" width="52" height="62" rx="6" fill="#a8dcae" ${O}/><rect x="38" y="14" width="24" height="14" rx="4" fill="#c9c2bb" ${O}/><path d="M34 44h32M34 56h32M34 68h20" fill="none" ${O}/>`),
  live: svg(`<rect x="14" y="26" width="72" height="50" rx="10" fill="#c7b3f2" ${O}/><path d="M43 40v22l20-11z" fill="#fff" ${O}/>`),
  heart: svg(`<path d="M50 82C16 58 18 30 36 26q10-2 14 10q4-12 14-10c18 4 20 32-14 56z" fill="#f39a9a" ${O}/>`),
  cut: svg(`<circle cx="30" cy="70" r="11" fill="#c9c2bb" ${O}/><circle cx="70" cy="70" r="11" fill="#c9c2bb" ${O}/><path d="M36 62L70 16M64 62L30 16" fill="none" ${O}/>`),
  coin: svg(`<circle cx="50" cy="50" r="32" fill="#ffd45e" ${O}/><path d="M50 32v36M40 42q10-8 20 0q-2 8-10 8t-10 8q10 8 20 0" fill="none" ${O}/>`),
  chat: svg(`<path d="M16 24h68v40H44L28 80V64H16z" fill="#fff" ${O}/><path d="M30 38h40M30 50h26" fill="none" ${O}/>`),
  wish: svg(`<path d="M50 12l11 24l26 3l-19 18l5 26l-23-13l-23 13l5-26l-19-18l26-3z" fill="#ffe27a" ${O}/>`),
  quiet: svg(`<circle cx="50" cy="50" r="32" fill="#e6e0d8" ${O}/><path d="M36 50h28" fill="none" ${O}/>`),
};

// ---------- 資料 ----------
const ROUTES = {
  talk: { n: '雜談', c: 1,
    ok: ['「各位草安～今天想聊最近看到的事。」', '「說到這個我就想到……」她把話題接得很順。', '「那今天就聊到這裡，草民晚安。」'],
    slip: '講到一半，她冒出一句很不薰草的幹話，然後自己先笑出來。' },
  sing: { n: '歌回', c: 2,
    ok: ['第一首是唱慣的歌，聲音很穩。', '中段換了慢歌，留言區安靜下來聽。', '最後一首收得很漂亮。'],
    slip: '副歌唱錯了一個字。她停了半拍，笑出聲，接著唱下去。' },
  game: { n: '遊戲', c: 2,
    ok: ['「今天來玩這個～」開場很順。', '她一邊操作一邊唸留言，沒有冷場。', '順利過關，「謝謝大家陪我玩」。'],
    slip: '被小怪打死了。她大叫一聲，完全不是薰草的聲音。' },
  voice: { n: '聲音', c: 1,
    ok: ['她開始朗讀短文，聲音很輕。', '翻紙的聲音，停頓都剛好。', '最後一句唸完，留了三秒的安靜。'],
    slip: '朗讀到一半唸錯，呼吸聲沒收好，她輕輕笑了一下。' },
};
const ST = ['鎖住', '① 入門', '② 上手', '③ 風格', '④ 代表作'];
const STRESS = ['平穩', '緊繃', '撐不住'];
const SEG = ['開場', '中段', '收尾', '加長'];
const AUTO = location.search.includes('auto');

let G = null;
let V = null;

function newGame(first) {
  G = { week: 1, day: 1, slot: 0, heart: 4, stress: 2, money: 2, insp: 1, study: 0, known: 0, prep: 0,
    rested: false, pushed: false, kept: 0, cut: 0, dream: [], clips: [], bigDone: null, cur: null, r: {} };
  for (const k in ROUTES) G.r[k] = { st: 0, cap: 1, exp: 0, kept: 0 };
  G.r.talk.st = 1;
  G.r[first].st = 1;
  G.r[first].cap = 2;
}

const stage = () => (G.stress < 5 ? 0 : G.stress < 8 ? 1 : 2);
const slots = () => (G.day === 6 ? 2 : 4);
const addStress = n => { G.stress = clamp(G.stress + n, 0, 10); };
const knownName = () => (G.known < 2 ? '陌生' : G.known < 5 ? '眼熟' : '常客');
const locked = () => Object.keys(ROUTES).filter(k => !G.r[k].st);

function spend(c) {
  if (G.heart >= c) { G.heart -= c; return ''; }
  G.heart = 0;
  G.pushed = true;
  addStress(2);
  return '\n（心力不夠，她硬撐了過去。）';
}

function unlockRandom(why) {
  const l = locked();
  if (!l.length) return '';
  const k = pick(l);
  G.r[k].st = 1;
  return `\n★ ${why}，解鎖了「${ROUTES[k].n}」企劃。`;
}

// ---------- 畫面 ----------
function view(o) { V = o; render(); }

function pips(n, max, cls) {
  let h = '';
  for (let i = 0; i < max; i++) h += `<span class="pip ${cls} ${i < n ? 'on' : ''}"></span>`;
  return `<span class="pips">${h}</span>`;
}

function hud() {
  const s = stage();
  const chips = Object.keys(ROUTES).map(k => {
    const r = G.r[k];
    const bar = r.st && r.st < r.cap ? `（練習 ${r.exp}/3）` : '';
    return `<span class="chip ${r.st ? 'open' : ''}">${ROUTES[k].n}　${ST[r.st]}${bar}</span>`;
  }).join('');
  return `<div class="hud">
    <span class="tag">第 ${G.week} 週・第 ${Math.min(G.day, 7)} 天 ${pips(slots() - G.slot, slots(), 'slot')}</span>
    <span class="tag">心力 ${pips(G.heart, 5, '')}</span>
    <span class="tag stage${s}">壓力：${STRESS[s]}</span>
    <span class="tag">錢 ${G.money}</span>
    <span class="tag">靈感 ${G.insp}/5</span>
    <span class="tag">學習度 ${G.study}%</span>
    <span class="tag">草民認得你：${knownName()}</span>
  </div><div class="skills">${chips}</div>`;
}

function render() {
  document.body.className = V.mode;
  if (V.mode === 'title') {
    $('#app').innerHTML = `<section class="sheet title-sheet">
      <div class="duo"><div class="stk">${STK.nami('normal')}</div><div class="stk">${STK.kaoru('laugh')}</div></div>
      <h1>中之夢</h1><p class="sub">Yumenonaka　試玩原型</p>
      <p class="text">${V.text}</p></section>${buttons()}`;
    return;
  }
  $('#app').innerHTML = hud() +
    `<section class="sheet"><div class="who stk">${STK[V.who](V.mood || 'normal')}</div>
    <h2>${V.title}</h2><p class="text">${V.text}</p></section>` + buttons();
}

function buttons() {
  return `<div class="choices">${V.choices.map((c, i) =>
    `<button data-i="${i}" class="${c.i ? '' : 'plain'}" ${c.off ? 'disabled' : ''}>` +
    (c.i ? `<span class="stk ic">${ICON[c.i]}</span>` : '') +
    `<b>${c.t}</b>${c.s ? `<small>${c.s}</small>` : ''}</button>`).join('')}</div>`;
}

$('#app').addEventListener('click', e => {
  const b = e.target.closest('button[data-i]');
  if (b && !b.disabled) V.choices[+b.dataset.i].on();
});

const namiMood = () => (stage() === 2 || G.heart === 0 ? 'tired' : 'normal');
const go = (t, on, s) => [{ t, s, on }];

// ---------- 開場 ----------
function title() {
  G = null;
  view({ mode: 'title',
    text: '白天，你是 VTuber 的中之人奈實，安排她的一週。\n直播的晚上，你是觀眾席裡的一位草民。\n隔天，再陪她回看昨晚的自己。',
    choices: go('開始', pickSkill, '一季四週，約十分鐘') });
}

function pickSkill() {
  const c = Object.keys(ROUTES).map(k => ({ i: 'live', t: ROUTES[k].n,
    s: k === 'talk' ? '雜談本來就會，選它可以再往上練' : '開場就會，而且可以直接練到上手',
    on: () => { newGame(k); dayView('大四開學。直播已經兩年多了。\n這週要怎麼過？'); } }));
  G = null;
  V = { mode: 'title', text: '奈實已經有直播經驗。雜談是基本功，另外選一項她擅長的：', choices: c };
  render();
}

// ---------- 白天 ----------
function dayView(msg) {
  const left = slots() - G.slot;
  const c = [
    { i: 'work', t: '上班', s: '2 時段・心力 −1・錢 +2・壓力 +1', off: left < 2, on: () => {
      const x = spend(1); G.money += 2; addStress(1);
      act(2, '在店裡站了一個下午。' + x + (Math.random() < 0.2 ? unlockRandom('打工時碰到相關的工作') : '')); } },
    { i: 'class', t: '上課', s: '學校的課，或花錢報名', on: classMenu },
    { i: 'practice', t: '練習', s: '把學會的練到熟', on: practiceMenu },
    { i: 'idea', t: '找靈感', s: '1 時段・靈感 +1', on: () => {
      G.insp = clamp(G.insp + 1, 0, 5);
      act(1, '出門走了一圈，記下幾個想法。' + (Math.random() < 0.25 ? unlockRandom('路上看到有趣的東西') : '')); } },
    { i: 'rest', t: '休息', s: '1 時段・心力 +1・壓力 −1', on: () => {
      G.heart = clamp(G.heart + 1, 0, 5); addStress(-1); G.rested = true;
      act(1, '好好吃了一頓飯，躺了一下。'); } },
  ];
  if (G.day <= 6) c.push({ i: 'prep', t: '準備直播', s: `1 時段・心力 −1・準備 ${G.prep}/2`, off: G.prep >= 2, on: () => {
    const x = spend(1); G.prep++; act(1, '排了流程，試了一下麥克風。' + x); } });
  view({ mode: 'day', who: 'nami', mood: namiMood(),
    title: `第 ${G.week} 週　第 ${G.day} 天${G.day === 6 ? '（直播日，只有半天）' : ''}`,
    text: msg || '接下來要做什麼？', choices: c });
}

function classMenu() {
  const c = [{ i: 'class', t: '學校的課', s: '1 時段・心力 −1・學習度 +7', on: () => {
    const x = spend(1); G.study = clamp(G.study + 7, 0, 100);
    act(1, '坐在教室後排抄筆記。' + x + (Math.random() < 0.15 ? unlockRandom('課堂上剛好講到') : '')); } }];
  for (const k in ROUTES) {
    const r = G.r[k];
    if (r.cap >= 2) continue;
    c.push({ i: 'coin', t: `報名「${ROUTES[k].n}」課`, s: r.st ? '錢 −2・學會「上手」' : '錢 −2・解鎖並學會「上手」', off: G.money < 2, on: () => {
      const x = spend(1); G.money -= 2; r.st = Math.max(r.st, 1); r.cap = 2;
      act(1, `上了一堂${ROUTES[k].n}的課。學會了，接下來要靠練習。` + x); } });
  }
  c.push({ t: '返回', on: () => dayView() });
  view({ mode: 'day', who: 'nami', mood: namiMood(), title: '上課', text: '學校的課累積學習度，是為了畢業。\n報名的課要自己花錢，能學到直播用得上的東西。', choices: c });
}

function practiceMenu() {
  const c = [];
  for (const k in ROUTES) {
    const r = G.r[k];
    if (!r.st) continue;
    const can = r.st < r.cap;
    c.push({ i: 'practice', t: `練習${ROUTES[k].n}`,
      s: can ? `1 時段・心力 −1・進度 ${r.exp}/3` : r.st >= 2 ? '再上去不是練出來的，要靠「留下」' : '要先上課學會',
      off: !can, on: () => {
        const x = spend(1); r.exp++;
        let m = `練了一輪${ROUTES[k].n}。`;
        if (r.exp >= 3) { r.st++; r.exp = 0; m += `\n★ ${ROUTES[k].n}到了「${ST[r.st]}」。`; }
        act(1, m + x); } });
  }
  c.push({ t: '返回', on: () => dayView() });
  view({ mode: 'day', who: 'nami', mood: namiMood(), title: '練習', text: '練習只能練到上課學會的程度。', choices: c });
}

function act(n, msg) {
  G.slot += n;
  if (G.slot < slots()) return dayView(msg);
  if (G.day === 6) {
    return view({ mode: 'day', who: 'nami', mood: namiMood(), title: '直播日　傍晚', text: msg + '\n\n該準備開播了。', choices: go('選今晚的企劃', streamMenu) });
  }
  view({ mode: 'day', who: 'nami', mood: namiMood(), title: `第 ${G.week} 週　第 ${G.day} 天　結束`, text: msg, choices: go('睡覺', nextDay, G.rested ? '今天有休息，明天回復較多' : '今天沒有休息') });
}

function nextDay() {
  const s = stage();
  let g = G.pushed ? 0 : G.rested ? 2 : 1;
  if (s === 1) g = Math.max(0, g - 1);
  G.heart = clamp(G.heart + g, 0, 5);
  G.rested = false;
  G.pushed = false;
  G.day++;
  G.slot = 0;
  if (G.day > 7) return weekEnd();
  let m = `早上。回復了 ${g} 格心力。`;
  if (s === 2) {
    G.slot = 1;
    addStress(-3);
    m = '灰色的早晨。她躺到中午才起來，少了一個時段。';
  }
  if (G.day === 7 && G.clips.length) return review(0, m);
  dayView(m);
}

// ---------- 直播（夜晚，草民視角） ----------
function streamMenu() {
  const c = [];
  for (const k in ROUTES) {
    const r = G.r[k];
    if (!r.st) continue;
    c.push({ i: 'live', t: ROUTES[k].n + (G.insp ? '' : '（陽春版）'),
      s: `心力 −${ROUTES[k].c}・${G.insp ? '靈感 −1' : '沒有靈感'}・${ST[r.st]}`, on: () => startStream(k, false) });
    if (G.week === 4 && r.st >= 2) {
      c.push({ i: 'wish', t: `季末大企劃：${ROUTES[k].n}`, s: '心力 −3・靈感 −3', off: G.insp < 3, on: () => startStream(k, true) });
    }
  }
  view({ mode: 'day', who: 'nami', mood: namiMood(), title: '直播日　晚上', text: `準備程度 ${G.prep}/2。今晚要播什麼？`, choices: c });
}

function startStream(k, big) {
  let used = 0;
  if (big) { G.insp -= 3; used = 2; } else if (G.insp) { G.insp--; used = 1; }
  const x = spend(big ? 3 : ROUTES[k].c);
  G.cur = { k, big, q: G.r[k].st + G.prep + used - (x ? 1 : 0), seg: 0, max: 3, tips: 0, clips: [], slip: false, ext: false };
  segment('你打開了薰草的直播。');
}

function segment(pre) {
  const C = G.cur;
  const R = ROUTES[C.k];
  const slip = Math.random() < clamp(0.65 - 0.12 * C.q, 0.15, 0.7);
  const line = slip ? R.slip : R.ok[Math.min(C.seg, 2)];
  const sawSlip = C.slip;
  if (slip) C.slip = true;
  C.clips.push({ k: C.k, real: slip, text: line });
  const next = m => { C.seg++; C.seg < C.max ? segment(m) : endStream(m); };
  const c = [{ i: 'chat', t: '留言「草安！」', s: '讓她看到你的 ID', on: () => { G.known++; next('你的留言滑過畫面，她唸了你的 ID。'); } }];
  if (slip) c.push({ i: 'chat', t: '留言「笑死，好可愛」', s: '回應剛剛那一下', on: () => { G.known++; next('她看到留言，又笑了一下。'); } });
  if (sawSlip) c.push({ i: 'chat', t: '留言「這不是薰草」', s: '看過她破功才會出現', on: () => { G.known++; addStress(1); next('留言區安靜了一秒。'); } });
  const l = locked();
  if (G.known >= 2 && l.length) {
    const w = l[0];
    c.push({ i: 'wish', t: `許願：想看${ROUTES[w].n}`, s: '眼熟以後才能許新企劃', on: () => {
      G.r[w].st = 1; next(`她唸出你的願望：「${ROUTES[w].n}嗎……我想想喔。」\n★ 解鎖了「${ROUTES[w].n}」企劃（要不要做，由白天的她決定）。`); } });
  }
  c.push({ i: 'coin', t: '打賞（小）', s: '+1', on: () => { C.tips += 1; next('「謝謝你的 SC～」'); } });
  c.push({ i: 'coin', t: '打賞（大）', s: '+4・給太多她會有壓力', on: () => { C.tips += 4; next('「欸、這麼多……謝謝。」她頓了一下。'); } });
  c.push({ i: 'quiet', t: '沉默', s: '只是看著', on: () => next('你沒有留言，繼續看。') });
  view({ mode: 'night', who: 'kaoru', mood: slip ? 'laugh' : 'normal',
    title: `直播中：${C.big ? '季末大企劃・' : ''}${R.n}　${SEG[C.seg]}`, text: pre + '\n\n' + line, choices: c });
}

function endStream(pre) {
  const C = G.cur;
  if (C.ext) return offAir(pre, false);
  view({ mode: 'day', who: 'nami', mood: namiMood(), title: '直播日　收尾',
    text: pre + '\n\n（回到奈實）留言還很熱。要多播一下嗎？', choices: [
      { i: 'live', t: '加長直播', s: '心力 −1・多一段・下播直接睡', on: () => { C.ext = true; C.max = 4; segment('「那再多聊一下好了。」' + spend(1)); } },
      { i: 'rest', t: '準時下播', s: '下播後還能做一件事', on: () => offAir('「今天就到這裡，草民晚安。」', true) }] });
}

function offAir(pre, onTime) {
  const C = G.cur;
  const total = C.tips + 1 + rnd(2);
  G.money += total;
  let m = pre + `\n\n下播後三十秒。${C.slip ? '她摘下耳機，想起剛剛那聲笑，耳朵有點熱。' : '她摘下耳機，房間很安靜。'}\n今晚的打賞：${total}。`;
  if (C.tips > C.q + 1) { addStress(2); m += '\n「收了這麼多，下次不能出錯。」'; }
  G.clips = C.clips.slice().sort((a, b) => b.real - a.real).slice(0, 3);
  if (C.big) G.bigDone = C.k;
  G.prep = 0;
  G.cur = null;
  const c = onTime ? [
    { i: 'cut', t: '剪輯精華', s: '多一點人認得這個頻道', on: () => { G.known++; nextDay(); } },
    { i: 'chat', t: '經營社群', s: '靈感 +1', on: () => { G.insp = clamp(G.insp + 1, 0, 5); nextDay(); } },
    { i: 'rest', t: '早點睡', s: '算作休息，明天回復較多', on: () => { G.rested = true; nextDay(); } },
  ] : go('直接睡', nextDay, '加長之後沒有力氣做別的事');
  view({ mode: 'day', who: 'nami', mood: C.slip ? 'laugh' : namiMood(), title: '下播', text: m, choices: c });
}

// ---------- 隔天回看 ----------
function grow() {
  let m = '';
  for (const k in ROUTES) {
    const r = G.r[k];
    if (r.st === 2 && r.kept >= 2) { r.st = 3; m += `\n★ ${ROUTES[k].n}有了自己的風格（③）。這不是練出來的。`; }
    if (r.st === 3 && G.bigDone === k) { r.st = 4; G.bigDone = null; m += `\n★ ${ROUTES[k].n}的季末大企劃成了代表作（④）。`; }
  }
  return m;
}

function review(i, pre) {
  if (i >= G.clips.length) {
    G.clips = [];
    return dayView(pre + grow() + '\n\n回看完了。今天剩下的時間？');
  }
  const c = G.clips[i];
  const r = G.r[c.k];
  view({ mode: 'day', who: 'nami', mood: c.real ? 'laugh' : 'normal', title: `隔天回看　片段 ${i + 1}/${G.clips.length}`,
    text: pre + '\n\n【昨晚】' + c.text + (c.real ? '\n——這一段，是她自己笑出來的。' : ''), choices: [
      { i: 'heart', t: '留下', s: c.real ? '讓草民看到這個她（會有點不安）' : '這段本來就很順', on: () => {
        let m = '留下了。';
        if (c.real) { r.kept++; G.kept++; addStress(1); m = '留下了。她有點不安，但沒有按下刪除。'; }
        review(i + 1, m); } },
      { i: 'cut', t: '剪掉', s: c.real ? '回放保持完美' : '不留也沒關係', on: () => {
        let m = '剪掉了。';
        if (c.real) { G.cut++; if (r.st < r.cap) r.exp = Math.min(2, r.exp + 1); m = '剪掉了。回放裡的薰草很完美。'; }
        review(i + 1, m); } }] });
}

// ---------- 週末、夢、結算 ----------
function weekEnd() {
  const m = `第 ${G.week} 週結束。\n留下 ${G.kept} 段，剪掉 ${G.cut} 段。壓力：${STRESS[stage()]}。`;
  const next = G.week === 4 ? go('入睡', () => dream(true), '季末夢')
    : G.week === 2 ? go('入睡', () => dream(false), '今晚會作夢')
      : go('下一週', nextWeek);
  view({ mode: 'day', who: 'nami', mood: namiMood(), title: '週末', text: m, choices: next });
}

function nextWeek() {
  G.week++;
  G.day = 1;
  G.slot = 0;
  dayView('新的一週。');
}

function dream(final) {
  const perfect = G.cut > G.kept;
  const t = final
    ? (perfect ? '「最近的回放，都很好。」\n理想中的薰草看起來很滿意。她的話越來越少。' : '「妳留下了那些片段。」\n她看著妳。「那是我嗎？」')
    : (stage() ? '「妳看起來很累。」\n「可是草民在等。」' : '「昨天那一場，可以更好。」');
  const ans = a => () => { G.dream.push(a); final ? ending() : nextWeek(); };
  view({ mode: 'dream', who: 'kaoru', mood: 'normal', title: final ? '季末夢' : '短夢', text: t, choices: [
    { t: '照理想做', s: '「我會做得更好。」', on: ans('照理想做') },
    { t: '說出感受', s: '「我有點累。」', on: ans('說出感受') },
    { t: '沉默', s: '……', on: ans('沉默') }] });
}

function ending() {
  const x = G.study / 100;
  const p = Math.round((1 - Math.exp(-2 * x)) / (1 - Math.exp(-2)) * 100);
  const laugh = G.kept === 0 ? '想像' : G.kept < 4 ? '流露' : '保留';
  const skills = Object.keys(ROUTES).map(k => `${ROUTES[k].n}：${ST[G.r[k].st]}`).join('　');
  const t = `這一季結束了。\n\n${skills}\n留下 ${G.kept} 段，剪掉 ${G.cut} 段。笑聲：${laugh}。\n學習度 ${G.study}%，照這樣期末合格的機率大約 ${p}%。\n草民認得你：${knownName()}。\n夢裡的回答：${G.dream.join('、')}。\n\n` +
    (G.cut > G.kept ? '回放裡的薰草一直很完美。' : G.kept ? '有幾段笑聲留在了頻道上。' : '這一季沒有特別的片段。') +
    '\n留下或剪掉，都沒有標準答案。';
  if (AUTO) document.title = 'AUTO-DONE';
  view({ mode: 'day', who: 'nami', mood: G.kept ? 'laugh' : 'normal', title: '第一季　結算', text: t, choices: go('再玩一次', title) });
}

// ---------- 啟動 ----------
window.addEventListener('error', e => { document.title = 'ERR ' + e.message; });
title();

// 自動測試：網址加 ?auto 會隨機點到結算為止
if (AUTO) {
  const timer = setInterval(() => {
    if (document.title !== '中之夢　試玩原型') return clearInterval(timer);
    const b = [...document.querySelectorAll('button[data-i]:not(:disabled)')];
    if (b.length) pick(b).click();
  }, 1);
}
