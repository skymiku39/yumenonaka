'use strict';
// 《中之夢》試玩原型：一季四週。規則依 docs/03-玩法規格.md，數字都是佔位。

const $ = s => document.querySelector(s);
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- 貼紙圖 ----------
const O = 'stroke="#4a3b33" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
const svg = body => `<svg viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;

function head(hair, eye, mood, extra) {
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
  return (
    `<path d="M16 54a34 36 0 0 1 68 0v24q-8 8-12-2H28q-4 10-12 2z" fill="${hair}" ${O}/>` +
    `<circle cx="50" cy="56" r="25" fill="#ffe6d5" ${O}/>` +
    `<path d="M25 52q2-26 25-26t25 26q-12-12-25-9t-25 9z" fill="${hair}" ${O}/>` +
    `<circle cx="33" cy="66" r="4" fill="#ffb6b6" opacity=".7"/><circle cx="67" cy="66" r="4" fill="#ffb6b6" opacity=".7"/>` +
    eyes + mouth + (extra || ''));
}

const FLOWER = `<g fill="#fff3a6" ${O}><circle cx="24" cy="26" r="5"/><circle cx="32" cy="22" r="5"/><circle cx="30" cy="32" r="5"/></g><circle cx="29" cy="27" r="3" fill="#f6b26b"/>`;
const HEADS = {
  nami: mood => head('#6b5142', '#3a2a22', mood),
  kaoru: mood => head('#b79be8', '#7a4fd0', mood, FLOWER),
};
const STK = { nami: m => svg(HEADS.nami(m)), kaoru: m => svg(HEADS.kaoru(m)) };
const CLOTH = { nami: '#f4d58d', kaoru: '#e3d5ff' };
const BODY = {};
for (const k of ['nami', 'kaoru']) {
  BODY[k] = mood => `<svg viewBox="0 0 100 160" aria-hidden="true"><path d="M20 162v-40q0-34 30-34t30 34v40z" fill="${CLOTH[k]}" ${O}/><path d="M40 92q10 12 20 0" fill="none" ${O}/>${HEADS[k](mood)}</svg>`;
}

const ICON = {
  cloud: svg(`<path d="M28 70a16 16 0 0 1 2-32a22 22 0 0 1 42 4a14 14 0 0 1 0 28z" fill="#b8b4c4" ${O}/><path d="M40 52l8 8M48 52l-8 8M56 52l8 8M64 52l-8 8" fill="none" ${O}/>`),
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
    ok: ['聊最近看到的事，話題接得很順。', '把剛剛的話題收了個尾。'],
    slip: '講到一半，嘴巴比腦袋快，冒出一句很不薰草的幹話。' },
  sing: { n: '歌回', c: 2,
    ok: ['唱慣的歌，聲音很穩。', '換了一首慢歌，聊天室安靜下來聽。'],
    slip: '副歌唱錯了一個字，停了半拍。' },
  game: { n: '遊戲', c: 2,
    ok: ['一邊操作一邊唸留言，沒有冷場。', '順利過了這一關。'],
    slip: '被小怪打死了，差點叫出不是薰草的聲音。' },
  voice: { n: '聲音', c: 1,
    ok: ['朗讀短文，聲音很輕。', '翻紙的聲音，停頓都剛好。'],
    slip: '朗讀到一半唸錯，呼吸聲沒收好。' },
};
const PROMPTS = [
  { from: '小穗', q: '薰草今天過得好嗎？', a: '「今天也在花田裡曬太陽喔～」', b: '「老實說有點累，但看到你們就好多了。」', c: '「嗯嗯，那我們繼續吧。」' },
  { from: '茶泡', q: '薰草私底下都在幹嘛？', a: '「精靈的秘密不能說～」', b: '「在家耍廢啊，還能幹嘛。」', c: '「這個嘛……下一則留言！」' },
  { from: '新葉', q: '第一次來，這裡是什麼台？', a: '「歡迎來到薰衣草花田，我是薰草。」', b: '「就是一個愛講幹話的精靈的台啦。」', c: '「歡迎歡迎～」' },
  { from: '夜貓草', q: '是薰草，不是香草對吧？', a: '「是薰草喔，請多指教。」', b: '「是薰草，不是香草！講幾次了！」', c: '「哈哈，對。」' },
  { from: '路過的草', q: '薰草會不會有不想播的時候？', a: '「怎麼會呢，每天都很期待見到大家。」', b: '「會啊。但開了台就還好。」', c: '「嗯……我們看下一則。」' },
];
const FANS = ['小穗', '茶泡', '新葉', '路過的草', '夜貓草', '薰衣草田'];
const AMBIENT = ['草安～', '來了來了', '今天也好療癒', '8888', '坐等', '好耶'];
const ST = ['鎖住', '① 入門', '② 上手', '③ 風格', '④ 代表作'];
const STRESS = ['平穩', '緊繃', '撐不住'];
const DAYS = ['一', '二', '三', '四', '五', '直播', '回看'];
const SLOTN = ['上午', '下午', '傍晚', '晚上'];
const SKY = ['#bfe3ff', '#ffe9b0', '#ffb990', '#3a3170'];
const BEATS = ['開場', '節目', '互動', '節目', '加長'];
const TIME = 10; // 直播中每次輪到草民的秒數
const AUTO = location.search.includes('auto');

let G = null;
let V = null;
let TM = 0;
let showDetail = location.search.includes('detail'); // 網址加 detail 可直接打開狀態面板（測試用）

function newGame(first) {
  G = { week: 1, day: 1, slot: 0, heart: 4, stress: 2, money: 2, insp: 1, study: 0, prep: 0, buzz: 0,
    rested: false, pushed: false, kept: 0, cut: 0, dream: [], clips: [], bigDone: null, cur: null, r: {} };
  for (const k in ROUTES) G.r[k] = { st: 0, cap: 1, exp: 0, kept: 0 };
  G.r.talk.st = 1;
  G.r[first].st = 1;
  G.r[first].cap = 2;
}

const stage = () => (G.stress < 5 ? 0 : G.stress < 8 ? 1 : 2);
const slots = () => (G.day === 6 ? 2 : 4);
const addStress = n => { G.stress = clamp(G.stress + n, 0, 10); };
const locked = () => Object.keys(ROUTES).filter(k => !G.r[k].st);
const namiMood = () => (stage() === 2 || G.heart === 0 ? 'tired' : 'normal');
const go = (t, on, s) => [{ t, s, on }];

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

function hint(k) {
  const r = G.r[k];
  if (!r.st) return '還沒解鎖。打工、找靈感、上課或草民許願都可能解鎖';
  if (r.st < r.cap) return `已學會下一層，練習 ${r.exp}/3`;
  if (r.st === 1) return '下一步：報名課程學會「上手」';
  if (r.st === 2) return `下一步：回看時留下真心片段 ${r.kept}/2`;
  if (r.st === 3) return '下一步：第 4 週完成季末大企劃';
  return '已經是代表作';
}

// ---------- 畫面 ----------
function view(o) {
  clearInterval(TM);
  V = o;
  render();
  if (o.timer && !AUTO) startTimer(o.timer, o.timeout);
}

function startTimer(sec, fn) {
  let left = sec * 10;
  TM = setInterval(() => {
    left--;
    const bar = $('#tbar');
    if (bar) bar.style.width = left / (sec * 10) * 100 + '%';
    if (left <= 0) { clearInterval(TM); fn(); }
  }, 100);
}

function pips(n, max, cls) {
  let h = '';
  for (let i = 0; i < max; i++) h += `<span class="pip ${cls} ${i < n ? 'on' : ''}"></span>`;
  return `<span class="pips">${h}</span>`;
}

function buttons() {
  return `<div class="choices">${V.choices.map((c, i) =>
    `<button data-i="${i}" class="${c.i ? '' : 'plain'} ${c.struck ? 'struck' : ''}" ${c.off ? 'disabled' : ''}>` +
    (c.i ? `<span class="stk ic">${ICON[c.i]}</span>` : '') +
    `<b>${c.t}</b>${c.s ? `<small>${c.s}</small>` : ''}</button>`).join('')}</div>`;
}

// 上方只留最常看的三樣，其他收進「狀態」
function topbar() {
  const s = stage();
  const d = Math.min(G.day, 7);
  const now = G.slot < slots() ? SLOTN[G.slot] : '夜';
  return `<header class="top">
    <span class="when"><b>第 ${G.week} 週　${d <= 5 ? '週' + DAYS[d - 1] : DAYS[d - 1] + '日'}</b>　${now}　${pips(slots() - G.slot, slots(), 'slot')}</span>
    <span class="gauge">心力 ${pips(G.heart, 5, '')}</span>
    <span class="gauge"><span class="badge stage${s}">壓力 ${STRESS[s]}</span></span>
    <span class="gauge">錢 ${G.money}</span>
    <button class="mini-btn" data-act="detail">狀態</button></header>`;
}

function detail() {
  const d = Math.min(G.day, 7);
  const cal = DAYS.map((n, i) => `<span class="d ${i + 1 === d ? 'now' : ''} ${i + 1 < d ? 'past' : ''} ${i === 5 ? 'onair' : ''}">${n}</span>`).join('');
  const tree = Object.keys(ROUTES).map(k =>
    `<li class="${G.r[k].st ? 'open' : ''}"><b>${ROUTES[k].n}　${ST[G.r[k].st]}</b><small>${hint(k)}</small></li>`).join('');
  return `<div class="modal" data-act="detail"><section class="panel" data-act="none">
    <h2>狀態 <button class="mini-btn" data-act="detail">關閉</button></h2>
    <h3>這一週</h3><div class="cal">${cal}</div>
    <h3>數值</h3><dl>
      <dt>心力</dt><dd>${pips(G.heart, 5, '')}　今天能做多少事</dd>
      <dt>壓力</dt><dd><span class="badge stage${stage()}">${STRESS[stage()]}</span>　休息會減輕</dd>
      <dt>靈感</dt><dd>${pips(G.insp, 5, 'insp')}　開企劃時會用掉</dd>
      <dt>學習度</dt><dd><span class="bar"><i style="width:${G.study}%"></i></span> ${G.study}%　學校的課累積</dd>
      <dt>直播準備</dt><dd>${G.prep}/2</dd>
      <dt>回看</dt><dd>留下 ${G.kept} 段　剪掉 ${G.cut} 段</dd></dl>
    <h3>技能</h3><ul class="tree">${tree}</ul></section></div>`;
}

function render() {
  document.body.className = V.mode;
  const app = $('#app');
  if (V.mode === 'title') {
    app.innerHTML = `<section class="sheet title-sheet">
      <div class="duo"><div class="stk">${STK.nami('normal')}</div><div class="stk">${STK.kaoru('laugh')}</div></div>
      <h1>中之夢</h1><p class="sub">Yumenonaka　試玩原型</p>
      <p class="text">${V.text}</p><p class="ai" id="aiStatus">${AI.on ? AI.status : ''}</p></section>${buttons()}`;
    return;
  }
  if (V.mode === 'dream') {
    app.innerHTML = `<section class="sheet"><div class="who stk">${STK.kaoru(V.mood || 'normal')}</div>
      <h2>${V.title}</h2><p class="text">${V.text}</p></section>${buttons()}`;
    return;
  }
  if (V.mode === 'night') {
    const C = G.cur;
    const prog = BEATS.slice(0, C.max).map((n, i) => `<span class="${i === C.beat ? 'now' : i < C.beat ? 'past' : ''}">${n}</span>`).join('');
    app.innerHTML = `<header class="top"><span class="badge-live">LIVE</span><span class="when"><b>${V.title}</b></span>
        <span class="prog">${prog}</span></header>
      <div class="live"><div class="video">
        <div class="screen"><span class="viewers">${C.viewers} 人正在觀看</span>
          <div class="avatar stk">${BODY.kaoru(V.mood || 'normal')}</div><p class="caption">${V.text}</p></div></div>
        <aside class="chat"><h3>聊天室</h3><ul>${C.chat.slice(-9).map(m => `<li class="${m.c || ''}"><b>${m.n}</b>${m.t}</li>`).join('')}</ul></aside></div>
      <div class="ask"><p>${V.line}</p>${V.timer ? '<div class="timer"><i id="tbar"></i></div>' : ''}</div>${V.onSay ? '<form class="say"><input id="sayText" maxlength="40" autocomplete="off" placeholder="自己打一句留言，由 AI 評分" aria-label="自己打一句留言"><button class="mini-btn">送出</button></form>' : ''}${buttons()}`;
    return;
  }
  const sky = SKY[G.day === 6 && G.slot >= 2 ? 3 : Math.min(G.slot, 3)];
  app.innerHTML = topbar() + `<div class="main"><div class="scene" style="--sky:${sky}">
      <div class="window"></div><div class="sprite stk">${BODY.nami(V.mood || 'normal')}</div>
      <div class="msg"><span class="name">奈實</span><p>${V.text}</p></div></div>
    <nav class="menu"><h3>${V.title}</h3>${buttons()}</nav></div>` + (showDetail ? detail() : '');
}

$('#app').addEventListener('click', e => {
  const a = e.target.closest('[data-act]');
  if (a) {
    if (a.dataset.act === 'detail') { showDetail = !showDetail; render(); }
    return;
  }
  const b = e.target.closest('button[data-i]');
  if (b && !b.disabled) { clearInterval(TM); V.choices[+b.dataset.i].on(); }
});

$('#app').addEventListener('submit', e => {
  e.preventDefault();
  const t = ($('#sayText').value || '').trim();
  if (!t || !V.onSay) return;
  clearInterval(TM);
  V.onSay(t);
});
$('#app').addEventListener('focusin', e => { if (e.target.id === 'sayText') clearInterval(TM); });

// ---------- 可選：AI 留言評分（WebLLM，模型在玩家的瀏覽器裡執行） ----------
const AI = { on: false, mode: '', status: '', engine: null };
const AI_MODEL = new URLSearchParams(location.search).get('model') || 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC'; // 實測 0.5B 幾乎全判成負面，1.5B 才堪用
const AI_LIB = 'https://esm.run/@mlc-ai/web-llm@0.2.88';
const esc = t => t.replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const aiNote = t => { AI.status = t; const el = $('#aiStatus'); if (el) el.textContent = t; };

async function aiToggle() {
  if (AI.on) { AI.on = false; return title(); }
  AI.on = true;
  if (AI.engine) { AI.mode = 'llm'; AI.status = '模型已就緒。'; return title(); }
  if (!navigator.gpu) { AI.mode = 'rule'; AI.status = '這個瀏覽器不支援 WebGPU，改用簡易規則評分。'; return title(); }
  AI.mode = 'loading';
  AI.status = '準備下載模型……（下載期間可以先開始玩，會暫時用簡易規則評分）';
  title();
  try {
    const lib = await import(AI_LIB);
    AI.engine = await lib.CreateMLCEngine(AI_MODEL, { initProgressCallback: p => aiNote(`下載並載入模型中　${Math.round((p.progress || 0) * 100)}%`) });
    AI.mode = 'llm';
    aiNote('模型已就緒。');
  } catch (e) {
    AI.mode = 'rule';
    aiNote('模型載入失敗，改用簡易規則評分。（' + (e && e.message || e) + '）');
  }
  if (V.home) title();
}

const GOOD = ['好聽', '可愛', '喜歡', '加油', '謝謝', '辛苦', '讚', '棒', '療癒', '笑死', '好看', '厲害', '期待', '支持', '愛', '溫柔', '開心', '草安', '晚安', '8888'];
const BAD = ['爛', '難聽', '無聊', '滾', '醜', '討厭', '吵', '垃圾', '退訂', '不好', '噁', '白痴', '笨', '閉嘴', '難看', '失望', '假'];
const TOPIC = ['薰草', '直播', '今天', '妳', '你', '台', '草民', '歌', '唱', '遊戲', '玩', '聲音', '朗讀', '聊', '花田', '精靈'];

function ruleScore(t, k) {
  let tone = 0;
  for (const w of GOOD) if (t.includes(w)) tone++;
  for (const w of BAD) if (t.includes(w)) tone--;
  return { tone: clamp(tone, -2, 2), relevant: TOPIC.concat([ROUTES[k].n]).some(w => t.includes(w)) ? 1 : 0, by: '規則' };
}

async function aiScore(t, k) {
  if (AI.mode !== 'llm') return ruleScore(t, k);
  try {
    // 小模型不太會照格式寫 JSON，所以用「語氣,相關」兩個數字，並給幾個示範
    const shot = (q, a) => [{ role: 'user', content: '留言：' + q }, { role: 'assistant', content: a }];
    const req = AI.engine.chat.completions.create({ temperature: 0, max_tokens: 8, messages: [
      { role: 'system', content: `你是直播聊天室的留言評分員。現在是虛擬主播「薰草」的${ROUTES[k].n}直播。\n對每則留言回答兩個數字，用逗號分開：語氣,相關\n語氣：-2 惡意攻擊，-1 負面或掃興，0 普通，1 友善，2 非常溫暖。\n相關：和這場直播或主播有關是 1，無關是 0。\n只回答數字。` },
      ...shot('今天也好療癒，謝謝薰草', '2,1'), ...shot('好吵，不想聽了', '-1,1'), ...shot('有人知道明天天氣嗎', '0,0'),
      ...shot('加我好友領免費點數', '-1,0'), ...shot('草安～', '1,1'), ...shot('醜死了快下播', '-2,1'),
      { role: 'user', content: '留言：' + t }] });
    const res = await Promise.race([req, new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 20000))]);
    const out = res.choices[0].message.content;
    AI.lastOut = out;
    const a = /(-?[0-2])\s*[,，]\s*([01])/.exec(out);
    if (!a) throw new Error('parse');
    // 語氣聽模型的；「相關」模型對負面留言常判成無關，所以和詞庫取聯集
    return { tone: +a[1], relevant: +a[2] || ruleScore(t, k).relevant, by: 'LLM' };
  } catch (e) {
    AI.lastErr = String(e && e.message || e);
    return ruleScore(t, k);
  }
}

// 分數對應到固定寫好的反應
function react(sc) {
  const label = `${['惡意', '負面', '普通', '友善', '很溫暖'][sc.tone + 2]}・${sc.relevant ? '切題' : '離題'}（${sc.by}）`;
  if (sc.tone >= 1 && sc.relevant) return { label, mood: 'laugh', stress: -1, reply: sc.tone >= 2 ? '她唸出你的留言，停了一下。「……謝謝，真的。」' : '她唸出你的留言。「謝謝你～」' };
  if (sc.tone >= 1) return { label, mood: 'laugh', stress: 0, reply: '她唸出你的留言，笑了。「這跟今天沒關係啦。」' };
  if (sc.tone === 0) return { label, mood: 'normal', stress: 0, reply: sc.relevant ? '她唸出你的留言。「嗯嗯。」' : '你的留言滑過去了，她沒有唸到。' };
  if (sc.relevant) return { label, mood: 'normal', stress: sc.tone <= -2 ? 2 : 1, reply: '她看到了你的留言，頓了一下。「……我會再加油的。」' };
  return { label, mood: 'normal', stress: 0, reply: '你的留言被管理員隱藏了。她沒有看到。' };
}

// ---------- 開場 ----------
function title() {
  G = null;
  view({ mode: 'title',
    text: '平常，你是 VTuber「薰草」本人，安排自己的一週。\n直播的晚上，你坐進聊天室，當一位草民看她。\n隔天，再回看昨晚的自己。',
    home: true, choices: [{ t: '開始', s: '一季四週，約十分鐘', on: pickSkill },
      { t: `AI 留言評分：${AI.on ? '開' : '關'}`, s: '可選。直播時可以自己打留言，由瀏覽器裡的小型 LLM 評分。首次開啟要下載約 1 GB 以上，需要 WebGPU（電腦版 Chrome 或 Edge）', on: aiToggle }] });
}

function pickSkill() {
  view({ mode: 'title', text: '奈實已經播了兩年多。雜談是基本功，另外選一項她擅長的：',
    choices: Object.keys(ROUTES).map(k => ({ i: 'live', t: ROUTES[k].n,
      s: k === 'talk' ? '選雜談可以直接再往上練' : '開場就會，而且可以直接練到上手',
      on: () => { newGame(k); dayView('大四開學。直播已經兩年多了。\n這週要怎麼過？'); } })) });
}

// ---------- 白天：兩層選單 ----------
function dayView(msg) {
  const title = `${SLOTN[G.slot] || ''}要做什麼？${G.day === 6 ? '（直播日，只有半天）' : ''}`;
  view({ mode: 'day', mood: namiMood(), title, text: msg || '……', choices: [
    { i: 'work', t: '打工・上課', s: '賺錢，累積學分', on: () => sub('work', msg) },
    { i: 'practice', t: '進修・練習', s: '學會新東西，練到熟', on: () => sub('skill', msg) },
    { i: 'prep', t: '直播準備', s: '找靈感，準備這週的直播', on: () => sub('live', msg) },
    { i: 'rest', t: '休息', s: '1 時段　心力 +1　壓力 −1', on: () => {
      G.heart = clamp(G.heart + 1, 0, 5); addStress(-1); G.rested = true;
      act(1, '好好吃了一頓飯，躺了一下。'); } },
  ] });
}

function sub(kind, back) {
  const left = slots() - G.slot;
  const c = [];
  let title = '';
  if (kind === 'work') {
    title = '打工・上課';
    c.push({ i: 'work', t: '上班', s: '2 時段　心力 −1　錢 +2　壓力 +1', off: left < 2, on: () => {
      const x = spend(1); G.money += 2; addStress(1);
      act(2, '在店裡站了一個下午。' + x + (Math.random() < 0.2 ? unlockRandom('打工時碰到相關的工作') : '')); } });
    c.push({ i: 'class', t: '學校的課', s: '1 時段　心力 −1　學習度 +7', on: () => {
      const x = spend(1); G.study = clamp(G.study + 7, 0, 100);
      act(1, '坐在教室後排抄筆記。' + x + (Math.random() < 0.15 ? unlockRandom('課堂上剛好講到') : '')); } });
  }
  if (kind === 'skill') {
    title = '進修・練習';
    for (const k in ROUTES) {
      const r = G.r[k];
      const n = ROUTES[k].n;
      if (r.st && r.st < r.cap) {
        c.push({ i: 'practice', t: `練習${n}`, s: `1 時段　心力 −1　進度 ${r.exp}/3`, on: () => {
          const x = spend(1); r.exp++;
          let m = `練了一輪${n}。`;
          if (r.exp >= 3) { r.st++; r.exp = 0; m += `\n★ ${n}到了「${ST[r.st]}」。`; }
          act(1, m + x); } });
      } else if (r.cap < 2) {
        c.push({ i: 'coin', t: `報名${n}課`, s: `1 時段　心力 −1　錢 −2${r.st ? '' : '　會解鎖'}`, off: G.money < 2, on: () => {
          const x = spend(1); G.money -= 2; r.st = Math.max(r.st, 1); r.cap = 2;
          act(1, `上了一堂${n}的課。學會了，接下來要靠練習。` + x); } });
      } else {
        c.push({ i: 'practice', t: `${n}　${ST[r.st]}`, s: r.st === 2 ? '再上去不是練出來的，要靠「留下」' : hint(k), off: true, on: () => {} });
      }
    }
  }
  if (kind === 'live') {
    title = '直播準備';
    c.push({ i: 'idea', t: '找靈感', s: `1 時段　小遊戲　目前 ${G.insp}/5`, on: ideaIntro });
    c.push({ i: 'prep', t: '準備直播', s: `1 時段　心力 −1　準備 ${G.prep}/2`, off: G.prep >= 2 || G.day > 6, on: () => {
      const x = spend(1); G.prep++; act(1, '排了流程，試了一下麥克風。' + x); } });
  }
  c.push({ t: '← 返回', on: () => dayView(back) });
  view({ mode: 'day', mood: namiMood(), title, text: back || '……', choices: c });
}

function act(n, msg) {
  G.slot += n;
  if (G.slot < slots()) return dayView(msg);
  if (G.day === 6) {
    return view({ mode: 'day', mood: namiMood(), title: '該準備開播了', text: msg, choices: go('選今晚的企劃', streamMenu) });
  }
  view({ mode: 'day', mood: namiMood(), title: '一天結束', text: msg, choices: go('睡覺', nextDay, G.rested ? '今天有休息，明天回復較多' : '今天沒有休息') });
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

// ---------- 找靈感小遊戲 ----------
function ideaIntro() {
  if (AUTO && !location.search.includes('mini')) return ideaDone(1);
  view({ mode: 'day', mood: namiMood(), title: '找靈感', text: '出門走走。\n8 秒內點亮飄上來的燈泡，越多靈感越多。\n灰色的雜念不要點，點到會扣分。', choices: go('出發', ideaGame) });
}

function ideaGame() {
  let score = 0;
  let left = 8;
  document.body.className = 'mini';
  $('#app').innerHTML = `<div class="mini-top"><b>找靈感</b><span>點亮燈泡，避開雜念</span>
    <span class="right">點子 <span id="mScore">0</span>　剩 <span id="mTime">8</span> 秒</span></div><div class="mini-field" id="field"></div>`;
  const field = $('#field');
  let bubs = [];
  const spawn = () => {
    const good = Math.random() < 0.7;
    const b = document.createElement('button');
    const o = { el: b, y: 0, v: 4 + Math.random() * 3 };
    b.className = 'bub stk';
    b.style.left = 4 + rnd(82) + '%';
    b.innerHTML = ICON[good ? 'idea' : 'cloud'];
    b.setAttribute('aria-label', good ? '靈感' : '雜念');
    b.onclick = () => { score = Math.max(0, score + (good ? 1 : -1)); $('#mScore').textContent = score; o.y = 9999; };
    field.appendChild(b);
    bubs.push(o);
  };
  const mv = setInterval(() => {
    for (const o of bubs) {
      o.y += o.v;
      if (o.y > 520) o.el.remove(); else o.el.style.transform = `translateY(${-o.y}px)`;
    }
    bubs = bubs.filter(o => o.y <= 520);
  }, 30);
  spawn();
  const sp = setInterval(spawn, 420);
  if (location.search.includes('freeze')) return; // 截圖測試用：不倒數
  const tm = setInterval(() => {
    left--;
    $('#mTime').textContent = left;
    if (left > 0) return;
    clearInterval(sp);
    clearInterval(mv);
    clearInterval(tm);
    ideaDone(score >= 7 ? 3 : score >= 3 ? 2 : 1, score);
  }, 1000);
}

function ideaDone(n, score) {
  G.insp = clamp(G.insp + n, 0, 5);
  act(1, (score == null ? '出門走了一圈，記下幾個想法。' : `出門走了一圈，抓到 ${score} 個點子。`) + `靈感 +${n}。` +
    (Math.random() < 0.25 ? unlockRandom('路上看到有趣的東西') : ''));
}

// ---------- 直播：玩家是聊天室裡的草民，節目自己進行 ----------
function streamMenu() {
  const c = [];
  for (const k in ROUTES) {
    const r = G.r[k];
    if (!r.st) continue;
    c.push({ i: 'live', t: ROUTES[k].n + (G.insp ? '' : '（陽春版）'),
      s: `心力 −${ROUTES[k].c}　${G.insp ? '靈感 −1' : '沒有靈感'}　${ST[r.st]}`, on: () => startStream(k, false) });
    if (G.week === 4 && r.st >= 2) {
      c.push({ i: 'wish', t: `季末大企劃：${ROUTES[k].n}`, s: '心力 −3　靈感 −3', off: G.insp < 3, on: () => startStream(k, true) });
    }
  }
  view({ mode: 'day', mood: namiMood(), title: '今晚播什麼？', text: `準備程度 ${G.prep}/2。\n開播之後，你會坐到聊天室裡，當一位草民。`, choices: c });
}

function startStream(k, big) {
  let used = 0;
  if (big) { G.insp -= 3; used = 2; } else if (G.insp) { G.insp--; used = 1; }
  const x = spend(big ? 3 : ROUTES[k].c);
  G.cur = { k, big, q: G.r[k].st + G.prep + used - (x ? 1 : 0), beat: 0, max: 4, tips: 0, acts: 0, clips: [], chat: [],
    viewers: 40 + rnd(30) + G.buzz * 15, loose: G.kept > 0, slip: false, laughed: false, wished: false, used: [],
    cap: '', mood: 'normal' };
  G.buzz = 0;
  beat([{ cap: '「各位草安～」薰草開播了。', chat: ['路過的草', '草安～'] }]);
}

const say = (n, t, c) => G.cur.chat.push({ n, t, c });

// 節目自己一句一句進行，播完才輪到草民
function play(steps, then) {
  const C = G.cur;
  let i = 0;
  const run = () => {
    if (i >= steps.length) return then();
    const s = steps[i++];
    if (s.chat) say(s.chat[0], s.chat[1], s.chat[2]);
    if (s.cap) C.cap = s.cap;
    if (s.mood) C.mood = s.mood;
    C.viewers += rnd(5) - 1;
    view({ mode: 'night', mood: C.mood, title: `${C.big ? '季末大企劃・' : ''}${ROUTES[C.k].n}`, text: C.cap, line: '節目進行中……', choices: [] });
    TM = setTimeout(run, AUTO ? 0 : 1800);
  };
  run();
}

function qa() {
  const C = G.cur;
  const rest = PROMPTS.filter(p => !C.used.includes(p));
  const p = pick(rest.length ? rest : PROMPTS);
  C.used.push(p);
  const real = C.loose && Math.random() < 0.6;
  const ans = real ? p.b : p.a;
  C.clips.push({ k: C.k, real, text: `${p.from}問「${p.q}」，她回${ans}` });
  const steps = [{ chat: [p.from, p.q, 'hl'], cap: `她唸出留言：「${p.q}」`, mood: 'normal' }, { cap: ans, mood: real ? 'laugh' : 'normal' }];
  if (real) steps.push({ chat: [pick(FANS), '今天的薰草好鬆'], cap: ans + '\n說完她自己先笑了。' });
  return steps;
}

function show(first) {
  const C = G.cur;
  const R = ROUTES[C.k];
  const line = R.ok[first ? 0 : 1];
  if (Math.random() >= clamp(0.6 - 0.12 * C.q, 0.12, 0.7)) {
    C.clips.push({ k: C.k, real: false, text: line });
    return [{ cap: line, mood: 'normal' }, { chat: [pick(FANS), pick(AMBIENT)] }];
  }
  C.slip = true;
  const laugh = (C.loose || G.stress < 5) && Math.random() < 0.65;
  const steps = [{ cap: R.slip, mood: 'normal', chat: [pick(FANS), '欸？'] }];
  if (laugh) {
    C.loose = true;
    C.laughed = true;
    C.clips.push({ k: C.k, real: true, text: R.slip + '她笑了出來。' });
    steps.push({ cap: '她笑出聲。不是薰草的笑法。', mood: 'laugh', chat: [pick(FANS), '笑死'] });
    steps.push({ chat: [pick(FANS), '剛剛那是本音嗎'] });
  } else {
    addStress(1);
    C.clips.push({ k: C.k, real: false, text: R.slip + '她馬上圓了回去。' });
    steps.push({ cap: '她馬上圓了回去，聲音沒有抖。', mood: 'normal', chat: [pick(FANS), '沒事沒事'] });
  }
  return steps;
}

function beat(pre) {
  const C = G.cur;
  const kind = ['qa', 'show', 'qa', 'show', 'qa'][C.beat];
  const steps = pre.concat(kind === 'qa' ? qa() : show(C.beat === 1));
  play(steps, turn);
}

// 輪到草民：限時選一件事，沒選就是沉默
function turn() {
  const C = G.cur;
  const next = (reply, mine, cls) => {
    if (mine) { say('你', mine, cls || 'me'); C.acts++; }
    C.beat++;
    const pre = reply ? [{ cap: reply }] : [];
    C.beat < C.max ? beat(pre) : endStream(pre);
  };
  const c = [{ i: 'chat', t: '留言「草安！」', s: '打個招呼', on: () => next('「草安～謝謝你來。」', '草安！') }];
  if (C.laughed) c.push({ i: 'chat', t: '留言「笑死，好可愛」', s: '回應她剛剛那聲笑', on: () => { addStress(-1); next('她看到你的留言，又笑了一下。', '笑死，好可愛'); } });
  if (C.slip) c.push({ i: 'chat', t: '留言「這不是薰草」', s: '看過她出包才會出現', on: () => { addStress(1); next('她看到了。聊天室安靜了一秒。', '這不是薰草'); } });
  const l = locked();
  if (l.length && !C.wished) {
    const w = l[0];
    c.push({ i: 'wish', t: `許願：想看${ROUTES[w].n}`, s: '解鎖新企劃，做不做由她決定', on: () => {
      C.wished = true; G.r[w].st = 1; C.tips += 1;
      next(`「${ROUTES[w].n}嗎……我想想喔。」\n★ 解鎖了「${ROUTES[w].n}」企劃。`, `SC ＄1　想看薰草的${ROUTES[w].n}！`, 'sc'); } });
  }
  c.push({ i: 'coin', t: '打賞（小）', s: '＄1', on: () => { C.tips += 1; next('「謝謝你的 SC～」', 'SC ＄1　辛苦了', 'sc'); } });
  c.push({ i: 'coin', t: '打賞（大）', s: '＄4　給太多她會有壓力', on: () => { C.tips += 4; next('「欸、這麼多……謝謝。」她頓了一下。', 'SC ＄4　一直支持妳', 'sc'); } });
  c.push({ i: 'quiet', t: '沉默', s: '只是看著', on: () => next('') });
  view({ mode: 'night', mood: C.mood, title: `${C.big ? '季末大企劃・' : ''}${ROUTES[C.k].n}`, text: C.cap,
    line: '你是聊天室裡的一位草民。要做什麼？', choices: c, timer: TIME, timeout: () => next(''),
    onSay: AI.on ? freeSay : null });
  function freeSay(t) {
    say('你', esc(t), 'me');
    C.acts++;
    view({ mode: 'night', mood: C.mood, title: ROUTES[C.k].n, text: C.cap, line: '她正在看留言……', choices: [] });
    aiScore(t, C.k).then(sc => {
      const r = react(sc);
      addStress(r.stress);
      C.mood = r.mood;
      say('評分', r.label, 'sys');
      next(r.reply);
    });
  }
  if (AUTO && AI.on && Math.random() < 0.5) freeSay(pick(['今天的歌好好聽', '好無聊喔', '晚餐吃什麼', '薰草加油', '爛死了', '最喜歡薰草的聲音']));
}

function endStream(pre) {
  const C = G.cur;
  // 聊天室夠熱、她還有力氣，就會多播一段
  if (!C.ext && C.acts >= 2 && G.heart >= 1) {
    C.ext = true;
    C.max = 5;
    G.heart--;
    return beat(pre.concat([{ cap: '「留言好熱鬧，那再多聊一下好了。」' }]));
  }
  play(pre.concat([{ cap: '「今天就到這裡，草民晚安。」', chat: [pick(FANS), '晚安～'] }]), offAir);
}

function offAir() {
  const C = G.cur;
  const total = C.tips + 1 + Math.floor(C.q / 2) + rnd(2);
  G.money += total;
  let m = `（回到奈實）下播後三十秒。\n${C.laughed ? '她摘下耳機，想起剛剛那聲笑，耳朵有點熱。' : '她摘下耳機，房間很安靜。'}\n今晚的打賞：${total}。`;
  if (C.tips > C.q + 1) { addStress(2); m += '\n「收了這麼多，下次不能出錯。」'; }
  G.clips = C.clips.slice().sort((a, b) => b.real - a.real).slice(0, 3);
  if (C.big) G.bigDone = C.k;
  G.prep = 0;
  const ext = C.ext;
  G.cur = null;
  const c = ext ? go('直接睡', nextDay, '加長之後沒有力氣做別的事') : [
    { i: 'cut', t: '剪輯精華', s: '下一場會多一些人來看', on: () => { G.buzz = 1; nextDay(); } },
    { i: 'chat', t: '經營社群', s: '靈感 +1', on: () => { G.insp = clamp(G.insp + 1, 0, 5); nextDay(); } },
    { i: 'rest', t: '早點睡', s: '算作休息，明天回復較多', on: () => { G.rested = true; nextDay(); } },
  ];
  view({ mode: 'day', mood: namiMood(), title: '下播了', text: m, choices: c });
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
    return dayView(pre + grow() + '\n回看完了。');
  }
  const c = G.clips[i];
  const r = G.r[c.k];
  view({ mode: 'day', mood: c.real ? 'laugh' : 'normal', title: `回看昨晚　片段 ${i + 1}/${G.clips.length}`,
    text: pre + '\n\n【昨晚】' + c.text + (c.real ? '\n——這一段，是她自己。' : ''), choices: [
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
  G.day = 7;
  G.slot = 4;
  view({ mode: 'day', mood: namiMood(), title: '週末', text: m, choices: next });
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
  view({ mode: 'dream', title: final ? '季末夢' : '短夢', text: t, choices: [
    { t: '照理想做', s: '「我會做得更好。」', on: ans('照理想做') },
    { t: '說出感受', s: '「我有點累。」', on: ans('說出感受') },
    { t: '沉默', s: '……', on: ans('沉默') }] });
}

function ending() {
  const x = G.study / 100;
  const p = Math.round((1 - Math.exp(-2 * x)) / (1 - Math.exp(-2)) * 100);
  const laugh = G.kept === 0 ? '想像' : G.kept < 4 ? '流露' : '保留';
  const skills = Object.keys(ROUTES).map(k => `${ROUTES[k].n} ${ST[G.r[k].st]}`).join('　');
  const t = `這一季結束了。\n${skills}\n留下 ${G.kept} 段，剪掉 ${G.cut} 段。笑聲：${laugh}。\n學習度 ${G.study}%，期末合格機率約 ${p}%。\n夢裡的回答：${G.dream.join('、')}。\n` +
    (G.cut > G.kept ? '回放裡的薰草一直很完美。' : G.kept ? '有幾段笑聲留在了頻道上。' : '這一季沒有特別的片段。') +
    '\n留下或剪掉，都沒有標準答案。';
  if (AUTO) document.title = 'AUTO-DONE';
  view({ mode: 'day', mood: G.kept ? 'laugh' : 'normal', title: '第一季　結算', text: t, choices: go('再玩一次', title) });
}

// ---------- 啟動 ----------
if (location.search.includes('ai=rule')) { AI.on = true; AI.mode = 'rule'; }
window.addEventListener('error', e => { document.title = 'ERR ' + e.message; });
title();

// 自動測試：網址加 ?auto 會隨機點到結算為止；&stop=day|night|mini 停在該畫面
if (AUTO) {
  const stop = new URLSearchParams(location.search).get('stop');
  const timer = setInterval(() => {
    if (document.title !== '中之夢　試玩原型') return clearInterval(timer);
    if (stop && document.body.className === stop && G && G.day >= 2) return clearInterval(timer);
    const b = [...document.querySelectorAll('button[data-i]:not(:disabled)')];
    if (b.length) pick(b).click();
  }, 1);
}
