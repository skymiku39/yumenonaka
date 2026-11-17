'use strict';
// 《中之夢》試玩原型：一季四週。規則依 docs/03-玩法規格.md，數字都是佔位。

// 測試用：網址加 seed=數字 會固定亂數，讓同一組操作每次結果相同
{
  let seed = +new URLSearchParams(location.search).get('seed');
  if (seed) Math.random = () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
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
  rest: svg(`<path d="M22 44h44v18a22 22 0 0 1-44 0z" fill="#fff" ${O}/><path d="M66 48h8a8 8 0 0 1 0 16h-9" fill="none" ${O}/><path d="M16 88h56" fill="none" ${O}/><path d="M36 32q-5-7 0-14M52 32q-5-7 0-14" fill="none" ${O}/>`),
  prep: svg(`<rect x="24" y="22" width="52" height="62" rx="6" fill="#a8dcae" ${O}/><rect x="38" y="14" width="24" height="14" rx="4" fill="#c9c2bb" ${O}/><path d="M34 44h32M34 56h32M34 68h20" fill="none" ${O}/>`),
  live: svg(`<rect x="14" y="26" width="72" height="50" rx="10" fill="#c7b3f2" ${O}/><path d="M43 40v22l20-11z" fill="#fff" ${O}/>`),
  sleep: svg(`<path d="M64 18a34 34 0 1 0 18 46a26 26 0 0 1-18-46z" fill="#a9c9f2" ${O}/><path d="M22 22h12l-12 12h12" fill="none" ${O}/>`),
  heart: svg(`<path d="M50 82C16 58 18 30 36 26q10-2 14 10q4-12 14-10c18 4 20 32-14 56z" fill="#f39a9a" ${O}/>`),
  cut: svg(`<circle cx="30" cy="70" r="11" fill="#c9c2bb" ${O}/><circle cx="70" cy="70" r="11" fill="#c9c2bb" ${O}/><path d="M36 62L70 16M64 62L30 16" fill="none" ${O}/>`),
  coin: svg(`<circle cx="50" cy="50" r="32" fill="#ffd45e" ${O}/><path d="M50 32v36M40 42q10-8 20 0q-2 8-10 8t-10 8q10 8 20 0" fill="none" ${O}/>`),
  chat: svg(`<path d="M16 24h68v40H44L28 80V64H16z" fill="#fff" ${O}/><path d="M30 38h40M30 50h26" fill="none" ${O}/>`),
  wish: svg(`<path d="M50 12l11 24l26 3l-19 18l5 26l-23-13l-23 13l5-26l-19-18l26-3z" fill="#ffe27a" ${O}/>`),
  quiet: svg(`<circle cx="50" cy="50" r="32" fill="#e6e0d8" ${O}/><path d="M36 50h28" fill="none" ${O}/>`),
};

// ---------- 資料 ----------
const ROUTES = {
  talk: { n: '雜談', c: 1, praise: '這段好好笑',
    ok: ['聊最近看到的事，話題接得很順。', '把剛剛的話題收了個尾。', '唸了幾則留言，一則一則接下去。', '講了一件小時候的事，聊天室刷了一排草。'],
    slips: ['講到一半，嘴巴比腦袋快，冒出一句很不薰草的幹話。', '講到一半忘了自己要講什麼，安靜了三秒。', '把草民的名字唸錯了，還唸了兩次。'] },
  sing: { n: '歌回', c: 2, praise: '這首好好聽',
    ok: ['唱慣的歌，聲音很穩。', '換了一首慢歌，聊天室安靜下來聽。', '唱完一首，喝了口水，報了下一首的歌名。', '副歌的長音撐得很漂亮。'],
    slips: ['副歌唱錯了一個字，停了半拍。', '前奏下錯了，慢了一拍才跟上。', '高音破掉了，聲音分岔。'] },
  game: { n: '遊戲', c: 2, praise: '這波操作好強',
    ok: ['一邊操作一邊唸留言，沒有冷場。', '順利過了這一關。', '照著草民的建議走，找到了隱藏的寶箱。', '打王打得很穩，一次就過。'],
    slips: ['被小怪打死了，差點叫出不是薰草的聲音。', '正在教草民怎麼過，自己先掉了下去。', '按錯鍵，把剛剛的進度蓋掉了。'] },
  voice: { n: '聲音', c: 1, praise: '聲音好舒服',
    ok: ['朗讀短文，聲音很輕。', '翻紙的聲音，停頓都剛好。', '換了一篇比較長的，語速放得更慢。', '最後一句唸完，留了幾秒空白。'],
    slips: ['朗讀到一半唸錯，呼吸聲沒收好。', '翻頁的時候把麥克風碰歪了。', '唸到好笑的地方，自己先噴笑。'] },
};
// a：照人設回答　b：照實回答　c：帶過
const PROMPTS = [
  { from: '小穗', q: '薰草今天過得好嗎？', a: '「今天也在花田裡曬太陽喔～」', b: '「老實說有點累，但看到你們就好多了。」', c: '「嗯嗯，那我們繼續吧。」' },
  { from: '茶泡', q: '薰草私底下都在幹嘛？', a: '「精靈的秘密不能說～」', b: '「在家耍廢啊，還能幹嘛。」', c: '「這個嘛……下一則留言！」' },
  { from: '新葉', q: '第一次來，這裡是什麼台？', a: '「歡迎來到薰衣草花田，我是薰草。」', b: '「就是一個愛講幹話的精靈的台啦。」', c: '「歡迎歡迎～」' },
  { from: '夜貓草', q: '是薰草，不是香草對吧？', a: '「是薰草喔，請多指教。」', b: '「是薰草，不是香草！講幾次了！」', c: '「哈哈，對。」' },
  { from: '路過的草', q: '薰草會不會有不想播的時候？', a: '「怎麼會呢，每天都很期待見到大家。」', b: '「會啊。但開了台就還好。」', c: '「嗯……我們看下一則。」' },
  { from: '路過的草', q: '薰草平常幾點睡？', a: '「精靈跟著月亮睡喔～」', b: '「很晚。真的很晚。不要學。」', c: '「嗯……秘密。」' },
  { from: '小穗', q: '薰草有沒有不會的事？', a: '「精靈什麼都會一點點～」', b: '「很多啊。早起就不會。」', c: '「這個嘛～」' },
  { from: '茶泡', q: '今天晚餐吃什麼？', a: '「花蜜跟露水～」', b: '「泡麵。加了蛋，應該算有煮吧。」', c: '「吃飽了吃飽了。」' },
  { from: '新葉', q: '為什麼會開始直播？', a: '「想讓花田的風吹到更遠的地方。」', b: '「一開始只是想試試看，結果就播到現在了。」', c: '「說來話長，下次再說～」' },
  { from: '夜貓草', q: '播這麼久不會累嗎？', a: '「看到大家就不累了～」', b: '「會啊，下播都直接躺平。」', c: '「還好啦。」' },
  { from: '薰衣草田', q: '薰草有被留言傷到過嗎？', a: '「花田裡只有溫柔的風喔。」', b: '「有。會記很久。但好的也會記很久。」', c: '「……我們看下一則。」' },
  { from: '小穗', q: '剛剛那聲是噴嚏嗎？', a: '「是花粉在跳舞～」', b: '「對啦是噴嚏，不要剪成精華！」', c: '「沒有沒有。」' },
  { from: '茶泡', q: '薰草考試都考幾分？', a: '「精靈不用考試喔～」', b: '「不要問，很可怕。」', c: '「下一題！」' },
];
const FANS = ['小穗', '茶泡', '新葉', '路過的草', '夜貓草', '薰衣草田'];
const AMBIENT = ['草安～', '來了來了', '今天也好療癒', '8888', '坐等', '好耶'];
const ST = ['鎖住', '① 入門', '② 上手', '③ 風格', '④ 代表作'];
const STRESS = ['平穩', '緊繃', '撐不住'];
const DAYS = ['週一', '週二', '週三', '週四', '週五', '直播日', '回看日'];
const SLOTN = ['上午', '下午', '傍晚', '晚上'];
const SEGS = ['開場', '中段', '收尾', '加長'];
// 金錢一律是台幣，數字是佔位
const PAY = {
  start: 1000,      // 開場的存款
  allowance: 10000, // 家裡每月匯一次的生活費。一季四週算一個月，月初入帳
  living: 3000,    // 每週開銷：吃飯、交通、網路
  work: 800,       // 一班 4 小時，時薪 200
  study: 150,      // 一次研習的講義與車錢
  scS: 75, scL: 750, wish: 150, // 玩家的 SC 金額
  cut: 0.7,        // 平台抽三成，她拿七成
};
// 靈感一律整數。找靈感 +2，玩小遊戲再 +1，等於原本的 1 與 0.5 都乘以二
const INSP = { max: 10, idea: 2, mini: 1, show: 2, big: 6, movie: 1, social: 2 };
const nt = n => 'NT$' + n.toLocaleString('en-US');
const HOURS = ['9:00', '14:00', '18:00', '22:00'];
const ACTS = {
  work: { n: '上班', i: 'work', s: `佔 2 格，晚上不行　心力 −1　+${nt(PAY.work)}　壓力 +1` },
  study: { n: '大四研習', i: 'class', s: `週二、週四，晚上不開　心力 −1　學習度 +7　−${nt(PAY.study)}` },
  idea: { n: '找靈感', i: 'idea', s: `靈感 +${INSP.idea}，可玩小遊戲再 +${INSP.mini}` },
  prep: { n: '準備直播', i: 'prep', s: '心力 −1　準備 +1（最多 2）' },
};
// 休息的方式：出門的要花錢，錢不夠就改成在家
const REST = {
  home: { n: '在家休息', t: '在家休息', i: 'rest', cost: 0, heart: 1, stress: 1, insp: 0, msg: '在家泡了杯茶，什麼都不做。' },
  eat: { n: '吃點好的', t: '吃好料', i: 'heart', cost: 300, heart: 2, stress: 1, insp: 0, msg: '出門吃了一頓想吃很久的。' },
  movie: { n: '看電影', t: '看電影', i: 'live', cost: 350, heart: 1, stress: 2, insp: INSP.movie, msg: '一個人去看了場電影，散場時腦袋裡多了點東西。' },
};
const restSub = r => (r.cost ? '出門。' : '') + `心力 +${r.heart}　壓力 −${r.stress}${r.insp ? '　靈感 +' + r.insp : ''}　${r.cost ? '−' + nt(r.cost) : '不花錢'}`;
const STUDY_DAYS = [2, 4]; // 大四研習只開在這幾天（1＝週一）
// 技能樹：每條路線四層的名字（docs/03 的 2.8）
const NODES = {
  talk: ['日常閒聊', '主題雜談', '把幹話說完', '草廢特輯'],
  sing: ['熟悉的歌', '完整歌單', '唱錯也接得住', '自己的歌回'],
  game: ['自己玩給大家看', '觀眾場', '輸了也敢大叫', '招牌觀眾場'],
  voice: ['朗讀短文', '紙聲與 ASMR', '留著呼吸與停頓', '自己寫的朗讀'],
};
const NUM = '①②③④';

// 哪一格能放哪個行動：研習只在研習日，研習和上班都不能排在晚上
function allowed(a, d, s) {
  if ((a === 'study' || a === 'work') && s === 3) return false;
  if (a === 'study' && !STUDY_DAYS.includes(d)) return false;
  return true;
}
const AUTO = location.search.includes('auto');

const TEST = (AUTO || location.search.includes('seed=')) && !location.search.includes('forcesave'); // 測試時不讀寫存檔
const SAVE_KEY = 'yumenonaka-save-v2';
function save(note) {
  if (TEST) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ G: { ...G, cur: null, play: null }, note })); } catch (e) { /* 不能存就算了 */ }
}
function loadSave() {
  if (TEST) return null;
  try { const v = JSON.parse(localStorage.getItem(SAVE_KEY)); return v && v.G && v.G.plan && v.G.r && v.G.asked ? v : null; } catch (e) { return null; }
}
function clearSave() { if (TEST) return; try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* 沒關係 */ } }

let G = null;
let V = null;
let showTree = location.search.includes('tree'); // 網址加 tree 可直接打開技能樹（測試用）

function newGame(first) {
  G = { week: 1, day: 1, heart: 4, stress: 2, money: PAY.start + PAY.allowance, insp: INSP.show, study: 0, prep: 0, buzz: 0,
    rested: false, pushed: false, kept: 0, cut: 0, dream: [], clips: [], bigDone: null, cur: null, r: {},
    plan: DAYS.map((_, i) => Array(i === 5 ? 2 : 4).fill(null)), done: [], brush: 'rest:home', show: 'talk', big: false, story: [], asked: [], skip: 0, morning: '', exam: null };
  for (const k in ROUTES) G.r[k] = { st: 0, exp: 0, kept: 0 };
  G.r.talk.st = 1;
  G.r[first].st = 1;
  G.r[first].exp = 1; // 擅長的那一項已經有底子
}

const stageOf = n => (n < 5 ? 0 : n < 8 ? 1 : 2);
const stage = () => stageOf(G.stress);
const addStress = n => { G.stress = clamp(G.stress + n, 0, 10); };
const locked = () => Object.keys(ROUTES).filter(k => !G.r[k].st);
const namiMood = () => (stage() === 2 || G.heart === 0 ? 'tired' : 'normal');
const passRate = () => Math.round((1 - Math.exp(-2 * G.study / 100)) / (1 - Math.exp(-2)) * 100);

function unlockRandom(why) {
  const l = locked();
  if (!l.length) return '';
  const k = pick(l);
  G.r[k].st = 1;
  return `\n★ ${why}，解鎖了「${ROUTES[k].n}」企劃。`;
}

function hint(k) {
  const r = G.r[k];
  if (!r.st) return '未解鎖（許願、打工、找靈感、研習）';
  if (r.st === 1) return `練習 ${r.exp}/3 →「上手」`;
  if (r.st === 2) return `留下真心片段 ${r.kept}/2 →「風格」`;
  if (r.st === 3) return '第 4 週季末大企劃 →「代表作」';
  return '已經是代表作';
}

// 到達新階段時的劇情，排在當天結果之前播
function story(then) {
  if (!G.story.length) return then();
  const [k, st] = G.story.shift();
  const n = ROUTES[k].n;
  const t = st === 2 ? `她把${n}從頭到尾排了一遍，沒有卡住。\n不是哪一天突然會的。是練到某一輪，發現不用再看筆記了。`
    : st === 3 ? `她重看留下來的那兩段${n}。裡面的人會笑場、會出包，草民卻留言說「這樣很好」。\n這個不是練出來的。`
      : `${n}的季末大企劃播完了。回放的標題她想了很久，最後寫的是自己取的名字。`;
  view({ mode: 'day', mood: 'laugh', sky: 1, title: `劇情：${n}　${ST[st]}`,
    text: `${t}\n★ ${n}到了「${ST[st]}」：${NODES[k][st - 1]}。\n（劇情是暫代文字）`, choices: [{ t: '繼續 ▶', on: () => story(then) }] });
}

// ---------- 行動規則：正式執行和排程預估共用 ----------
// S 是 G 或 G 的複本。real 為 false 時不擲骰、不動 G。
function spend(S, c) {
  if (S.heart >= c) { S.heart -= c; return false; }
  S.heart = 0;
  S.pushed = true;
  S.stress = clamp(S.stress + 2, 0, 10);
  return true;
}

function step(S, a, real) {
  const o = { a, t: '', i: 'quiet', warn: '', msg: '' };
  const cost = c => { if (spend(S, c)) { o.warn = '硬撐'; return '（心力不夠，她硬撐了過去。）'; } return ''; };
  if (!a) { o.t = ''; o.msg = '沒排事情，發了一會兒呆。'; return o; }
  if (a === 'work') {
    o.t = '上班'; o.i = 'work';
    const x = cost(1); S.money += PAY.work; S.stress = clamp(S.stress + 1, 0, 10);
    o.msg = `在店裡站了四個小時。薪水 ${nt(PAY.work)}。` + x + (real && Math.random() < 0.2 ? unlockRandom('打工時碰到相關的工作') : '');
  } else if (a === 'study') {
    o.t = '研習'; o.i = 'class';
    if (S.money < PAY.study) { o.warn = S.maybe ? '看打賞夠不夠' : '錢不夠'; o.msg = '想去研習，但講義和車錢湊不出來。'; return o; }
    const x = cost(1); S.study = clamp(S.study + 7, 0, 100); S.money -= PAY.study;
    o.msg = `到學校上大四研習，坐在後排抄筆記。講義與車錢 ${nt(PAY.study)}。` + x + (real && Math.random() < 0.15 ? unlockRandom('研習剛好講到') : '');
  } else if (a === 'idea') {
    o.t = '找靈感'; o.i = 'idea';
    if (S.insp >= INSP.max) { o.warn = '靈感已滿'; o.msg = '出門走了一圈，但腦袋已經裝不下了。'; }
    else { S.insp = clamp(S.insp + INSP.idea, 0, INSP.max); o.msg = `出門走了一圈，記下幾個想法。靈感 +${INSP.idea}。` + (real && Math.random() < 0.25 ? unlockRandom('路上看到有趣的東西') : ''); }
  } else if (a === 'prep') {
    o.t = '準備直播'; o.i = 'prep';
    if (G.week === 4 && (S.maybe || G.day === 7)) { o.warn = '沒有下一場'; o.msg = '這一季的直播都播完了，沒有東西要準備。'; }
    else if (S.prep >= 2) { o.warn = '已經準備好'; o.msg = '流程已經排好了，沒有東西可以再準備。'; }
    else { const x = cost(1); S.prep++; o.msg = '排了流程，試了一下麥克風。' + x; }
  } else if (a.startsWith('rest')) {
    let r = REST[a.slice(5)] || REST.home;
    let pre = '';
    if (S.money < r.cost) { o.warn = S.maybe ? '看打賞夠不夠' : '錢不夠，改在家'; pre = `本來想${r.n}，但錢不夠。`; r = REST.home; }
    o.t = r.t; o.i = r.i;
    S.money -= r.cost;
    S.heart = clamp(S.heart + r.heart, 0, 5); S.stress = clamp(S.stress - r.stress, 0, 10); S.insp = clamp(S.insp + r.insp, 0, INSP.max); S.rested = true;
    o.msg = pre + r.msg + (r.cost ? `花了 ${nt(r.cost)}。` : '');
  } else {
    // skill:路線。直接練習，練滿就到「上手」；再上去不是練出來的
    const k = a.slice(6);
    const r = S.r[k];
    const n = ROUTES[k].n;
    o.t = '練' + n; o.i = 'practice';
    if (!r.st) { o.warn = '還沒解鎖'; o.msg = `想練${n}，但還不知道從哪裡開始。`; }
    else if (r.st > 1) { o.warn = '練不上去'; o.msg = `${n}再上去不是練出來的。她發了一會兒呆。`; }
    else {
      const x = cost(1); r.exp++;
      o.msg = `練了一輪${n}。`;
      if (r.exp >= 3) { r.st = 2; r.exp = 0; o.msg += `\n★ ${n}到了「${ST[2]}」。`; if (real) G.story.push([k, 2]); }
      o.msg += x;
    }
  }
  return o;
}

// 過一晚：依休息情況回復心力
function night(S) {
  const s = stageOf(S.stress);
  let g = (S.pushed ? 0 : S.rested ? 2 : 1) + (S.early ? 1 : 0);
  S.early = false;
  if (s === 1) g = Math.max(0, g - 1);
  S.heart = clamp(S.heart + g, 0, 5);
  S.rested = false;
  S.pushed = false;
  if (s === 2) S.stress = clamp(S.stress - 3, 0, 10);
  return { g, grey: s === 2 };
}

function runSlots(S, d, skip, real) {
  const row = G.plan[d - 1];
  const out = [];
  for (let s = 0; s < row.length; s++) {
    if (s < skip) { out.push({ a: row[s], t: '起不來', i: 'cloud', warn: '灰色的早晨', msg: '躺到中午才起來。' }); continue; }
    if (row[s] === 'work') {
      if (row[s + 1] === 'work') { const o = step(S, 'work', real); out.push(o, { ...o, cont: true }); s++; }
      else out.push({ a: 'work', t: '上班', i: 'work', warn: '沒趕上', msg: '起得太晚，沒趕上班。' });
      continue;
    }
    out.push(step(S, row[s], real));
  }
  return out;
}

// 照目前的行程往後推，標出會硬撐、錢不夠的格子
function forecast() {
  const S = JSON.parse(JSON.stringify({ heart: G.heart, stress: G.stress, money: G.money, insp: G.insp, study: G.study,
    prep: G.prep, rested: G.rested, pushed: G.pushed, r: G.r }));
  const cells = [];
  let skip = G.skip;
  let live = null;
  for (let d = G.day; d <= 7; d++) {
    if (d > G.day) skip = night(S).grey ? 1 : 0;
    cells[d - 1] = runSlots(S, d, skip, false);
    if (d === 6) {
      const big = G.big && S.insp >= INSP.big;
      const c = big ? 3 : ROUTES[G.show].c;
      live = { heart: S.heart, prep: S.prep, insp: S.insp, push: S.heart < c, fall: G.big && !big };
      if (big) S.insp -= INSP.big; else if (S.insp >= INSP.show) S.insp -= INSP.show;
      spend(S, c); S.prep = 0; S.maybe = true;
    }
  }
  return { cells, live };
}

// ---------- 畫面 ----------
function view(o) {
  V = o;
  render();
}

function pips(n, max, cls) {
  let h = '';
  for (let i = 0; i < max; i++) h += `<span class="pip ${cls} ${i < n ? 'on' : ''}"></span>`;
  return `<span class="pips">${h}</span>`;
}

function buttons() {
  return `<div class="choices">${V.choices.map((c, i) =>
    `<button data-i="${i}" class="${c.i ? '' : 'plain'}" ${c.off ? 'disabled' : ''}>` +
    (c.i ? `<span class="stk ic">${ICON[c.i]}</span>` : '') +
    `<b>${c.t}</b>${c.s ? `<small>${c.s}</small>` : ''}</button>`).join('')}</div>`;
}

function topbar() {
  const s = stage();
  return `<header class="top">
    <span class="when"><b>第 ${G.week} 週　${DAYS[Math.min(G.day, 7) - 1]}</b></span>
    <span class="gauge" data-g="heart">心力 ${pips(G.heart, 5, '')}</span>
    <span class="gauge" data-g="stress"><span class="badge stage${s}">壓力 ${STRESS[s]}</span></span>
    <span class="gauge" data-g="money">${nt(G.money)}</span>
    <span class="gauge" data-g="insp">靈感 ${G.insp}/${INSP.max}</span>
    <span class="gauge" data-g="prep">準備 ${ROUTES[G.show].n} ${G.prep}/2</span>
    <span class="gauge" data-g="study">學習度 ${G.study}%</span></header>`;
}

function sideInfo() {
  const any = n => Object.keys(G.r).some(k => G.r[k].st >= n);
  const goal = (ok, t) => `<li class="${ok ? 'ok' : ''}">${ok ? '✓' : '□'} ${t}</li>`;
  const tree = Object.keys(ROUTES).map(k => {
    const r = G.r[k];
    const nodes = [1, 2, 3, 4].map(i => `<span class="node ${r.st >= i ? 'on' : r.st + 1 === i ? 'next' : ''}">${NUM[i - 1]}</span>`).join('');
    return `<li class="${r.st ? 'open' : ''}"><b>${ROUTES[k].n}<span class="nodes">${nodes}</span></b><small>${hint(k)}</small></li>`;
  }).join('');
  return `<section class="info"><h3>這一季的目標</h3><ul class="goals">
      ${goal(any(2), '一條路線到「② 上手」')}
      ${goal(any(3), '留下 2 段真心片段 →「③ 風格」')}
      ${goal(any(4), `第 4 週季末大企劃（靈感 ${INSP.big}）→「④ 代表作」`)}
      ${goal(G.exam === true, `第 4 週期末，合格機率 ${passRate()}%`)}</ul>
    <h3>技能樹<button class="mini-btn" data-act="tree">看整棵樹</button></h3><ul class="tree">${tree}</ul></section>`;
}

function treeModal() {
  const how = ['解鎖：草民許願、打工、找靈感或研習', '練習 3 次（回看時剪掉片段也會加進度）', '回看時留下 2 段真心片段', `第 4 週做季末大企劃（要先有 ③，靈感 ${INSP.big}）`];
  const col = k => {
    const r = G.r[k];
    return `<div class="branch"><h4>${ROUTES[k].n}</h4>` + [0, 1, 2, 3].map(i => {
      const prog = r.st !== i ? '' : i === 1 ? `　${r.exp}/3` : i === 2 ? `　${r.kept}/2` : '';
      return `<div class="tnode ${r.st > i ? 'on' : r.st === i ? 'next' : ''}"><b>${NUM[i]} ${NODES[k][i]}</b><small>${r.st > i ? '已達成' : how[i] + prog}</small></div>`;
    }).join('') + '</div>';
  };
  return `<div class="modal" data-act="tree"><section class="panel" data-act="none">
    <h2>技能樹<button class="mini-btn" data-act="tree">關閉</button></h2>
    <div class="tnode on base"><b>基礎（開場就有）</b><small>說話・開台流程・設備</small></div>
    <div class="branches">${Object.keys(ROUTES).map(col).join('')}</div>
    <p class="tip">到 ②、③、④ 時各有一段劇情。③ 不是練出來的，要靠回看時留下真心片段。</p></section></div>`;
}

// 任何一個行動的圖示、名稱、說明
function actInfo(a) {
  if (a === 'erase') return { i: 'cut', n: '拿掉', s: '點格子把它清空' };
  if (a.startsWith('rest')) { const r = REST[a.slice(5)] || REST.home; return { i: r.i, n: r.n, s: restSub(r) + '　白天有休息，當晚睡覺多回 1 格心力' }; }
  if (a.startsWith('skill')) { const k = a.slice(6); return { i: 'practice', n: '練習' + ROUTES[k].n, s: `心力 −1　進度 ${G.r[k].exp}/3，練滿就到「② 上手」` }; }
  return ACTS[a];
}
const descHTML = a => { const x = actInfo(a); return `<b>${x.n}</b>${x.s}`; };

function palette() {
  const list = ['study', 'work'].concat(Object.keys(ROUTES).filter(k => G.r[k].st === 1).map(k => 'skill:' + k),
    ['idea', 'prep'], Object.keys(REST).map(k => 'rest:' + k), ['erase']);
  const chips = list.map(a => { const x = actInfo(a); return `<button class="chip ${G.brush === a ? 'on' : ''}" data-act="brush" data-a="${a}">` +
    `<span class="stk">${ICON[x.i]}</span>${x.n}</button>`; }).join('');
  return `<div class="chips">${chips}</div><p class="desc" id="desc">${descHTML(G.brush)}</p>`;
}

const showName = () => (G.big ? '大企劃・' : '') + ROUTES[G.show].n;

// 直播內容要在排行程時先決定。沒決定就是雜談；準備是針對這個內容做的
function showRow() {
  const wk = G.day === 7 ? G.week + 1 : G.week;
  if (wk > 4) return '<h3 class="step">① 這一季的直播都播完了</h3>';
  const lock = G.day === 6;
  let h = '';
  let bigRow = '';
  for (const k in ROUTES) {
    const r = G.r[k];
    h += `<button class="brush ${G.show === k ? 'on' : ''}" data-act="show" data-k="${k}" ${!r.st || lock ? 'disabled' : ''}>` +
      `<span class="stk ic">${ICON.live}</span><b>${ROUTES[k].n}</b><small>${r.st ? `心力 −${ROUTES[k].c}　${ST[r.st]}` : '還沒解鎖'}</small></button>`;
  }
  if (wk === 4) {
    const st = G.r[G.show].st;
    bigRow = `<p class="bigrow"><button class="chip ${G.big ? 'on' : ''}" data-act="big" ${st < 2 || lock ? 'disabled' : ''}><span class="stk">${ICON.wish}</span>做成季末大企劃</button>` +
      `<small>${st < 2 ? `${ROUTES[G.show].n}要先到「② 上手」` : `心力 −3　靈感 −${INSP.big}${st < 3 ? '　還沒有③，成不了代表作' : ''}`}</small></p>`;
  }
  const why = lock ? '今天就是直播日，不能再改' : '沒選就是雜談。準備是針對這個內容做的，換了要重新準備';
  return `<h3 class="step">① ${G.day === 7 ? '下週' : '這週'}直播播什麼<small>${why}</small></h3><div class="palette">${h}</div>${bigRow}`;
}

function setShow(k, big) {
  if (G.day === 6 || (G.show === k && G.big === big)) return;
  const lost = G.prep > 0;
  G.show = k;
  G.big = big;
  G.prep = 0;
  plan(lost ? `直播內容換成${showName()}。之前做的準備不算了。` : `直播內容定成${showName()}。`);
}

// 照目前的行程，列出最值得注意的幾件事
function tips(F) {
  const cells = F.cells.flat().filter(o => o && !o.cont);
  const n = w => cells.filter(o => o.warn.startsWith(w)).length;
  const L = F.live;
  const t = [];
  if (n('硬撐')) t.push(`有 ${n('硬撐')} 格會硬撐（心力不夠）。多排一點休息，或少做一件事。`);
  if (L && L.push) t.push('照這樣排，開播時心力不夠。直播日之前留一點休息。');
  if (L && L.fall) t.push(`開播時靈感不到 ${INSP.big}，季末大企劃會變成一般版。`);
  else if (L && L.insp < INSP.show) t.push('開播時靈感不夠，只能播陽春版。排一次找靈感。');
  if (L && L.prep < 2) t.push(`開播前的準備只有 ${L.prep}/2。準備越足，失誤越少、SC 越多。`);
  if (n('錢不夠')) t.push('有幾格的錢不夠。排一班上班，或等直播的 SC 入帳。');
  const left = G.plan.slice(G.day - 1).flat();
  const can = Object.keys(ROUTES).filter(k => G.r[k].st === 1);
  if (can.length && !Object.keys(G.r).some(k => G.r[k].st >= 2) && !left.some(a => a && a.startsWith('skill:'))) {
    t.push('還沒有路線到「② 上手」，這週也沒排練習。練滿 3 次就到。');
  }
  if (STUDY_DAYS.some(d => d >= G.day) && G.study < 100 && !left.includes('study')) t.push('這週沒排大四研習。研習只開在週二、週四，晚上不開。');
  if (n('靈感已滿')) t.push('有幾格找靈感時靈感已經滿了，可以換成別的事。');
  const wk4 = Object.keys(ROUTES).find(k => G.r[k].st === 3);
  if (G.week === 4 && G.day < 6 && wk4 && !(G.big && G.show === wk4)) t.unshift(`第 4 週了。把直播內容選成${ROUTES[wk4].n}並做成季末大企劃，就能到「④ 代表作」。`);
  if (!Object.keys(G.r).some(k => G.r[k].st >= 3) && Object.keys(G.r).some(k => G.r[k].st === 2)) t.push('「③ 風格」不是練出來的：直播時用留言接住她，隔天回看時留下那些片段。');
  if (n('練不上去')) t.push('有幾格練習已經練不上去了，可以換成別的事。');
  if (!t.length) t.push('照這樣排沒有明顯的問題。');
  return `<section class="info"><h3>提醒</h3><ul class="goals wrap">${t.slice(0, 4).map(x => `<li>${x}</li>`).join('')}</ul></section>`;
}

function grid(F) {
  let h = '<div class="grid">';
  for (let d = 1; d <= 7; d++) {
    h += `<span class="dh ${d === G.day ? 'now' : ''} ${d < G.day ? 'past' : ''}" data-d="${d}" ${d < G.day ? '' : 'data-act="day" role="button" tabindex="0" title="把這天的空格填滿"'} style="grid-column:${d + 1};grid-row:1">${DAYS[d - 1]}${STUDY_DAYS.includes(d) ? '<i>研習日</i>' : ''}</span>`;
  }
  for (let s = 0; s < 4; s++) h += `<span class="rh t${s}" data-s="${s}" style="grid-column:1;grid-row:${s + 2}">${SLOTN[s]}<small>${HOURS[s]}</small></span>`;
  for (let d = 1; d <= 7; d++) {
    const past = d < G.day;
    const row = past ? G.done[d - 1] || [] : F.cells[d - 1];
    row.forEach((o, s) => {
      h += `<button class="cell ${past ? 'past' : ''} ${o.warn ? 'bad' : ''} ${o.t ? '' : 'empty'} ${!past && !allowed(G.brush, d, s) ? 'no' : ''} t${s}" style="grid-column:${d + 1};grid-row:${s + 2}"
        data-act="cell" data-d="${d}" data-s="${s}" data-a="${o.a || ''}" ${past ? 'disabled' : ''} aria-label="${DAYS[d - 1]}${SLOTN[s]}：${o.t || '空'}${o.warn ? '，' + o.warn : ''}">` +
        (o.t ? `<span class="stk">${ICON[o.i]}</span><b>${o.t}</b>` : '<b>＋</b>') + (o.warn ? `<em>${o.warn}</em>` : '') + '</button>';
    });
  }
  const L = F.live;
  h += `<div class="onair" style="grid-column:7;grid-row:4 / span 2"><b>直播${L ? '：' + showName() : ''}</b>` +
    (L ? `<small>開播前預估<br>心力 ${L.heart}　靈感 ${L.insp}<br>準備 ${L.prep}/2</small>` +
      (L.push ? '<em>會硬撐</em>' : '') + (L.fall ? '<em>靈感不夠做大企劃</em>' : '') : '<small>已下播</small>') + '</div>';
  return h + '</div>';
}

function render() {
  hot = null;
  document.body.className = V.mode;
  const app = $('#app');
  if (V.mode === 'title') {
    app.innerHTML = `<section class="sheet title-sheet">
      <div class="duo"><div class="stk">${STK.nami('normal')}</div><div class="stk">${STK.kaoru('laugh')}</div></div>
      <h1>中之夢</h1><p class="sub">Yumenonaka　試玩原型</p>
      <p class="text">${V.text}</p><p class="ai" id="aiStatus">${AI.on ? AI.status : ''}</p></section>${buttons()}`;
  } else if (V.mode === 'dream') {
    app.innerHTML = `<section class="sheet"><div class="who stk">${STK.kaoru(V.mood || 'normal')}</div>
      <h2>${V.title}</h2><p class="text">${V.text}</p></section>${buttons()}`;
  } else if (V.mode === 'night') {
    const C = G.cur;
    const prog = SEGS.slice(0, C.max).map((n, i) => `<span class="${i === C.seg ? 'now' : i < C.seg ? 'past' : ''}">${n}</span>`).join('');
    app.innerHTML = `<header class="top"><span class="badge-live">LIVE</span><span class="when"><b>${C.big ? '季末大企劃・' : ''}${ROUTES[C.k].n}</b></span>
        <span class="clipn">真心片段 ${C.clips.length}</span><span class="prog">${prog}</span></header>
      <div class="live"><div class="video">
        <div class="screen"><span class="viewers">${C.viewers} 人正在觀看</span>
          <div class="avatar stk">${BODY.kaoru(C.mood)}</div><p class="caption">${C.cap}</p></div></div>
        <aside class="chat"><h3>聊天室</h3><ul>${C.chat.slice(-9).map(m => `<li class="${m.c || ''}"><b>${m.n}</b>${m.t}</li>`).join('')}</ul></aside></div>
      <div class="ask"><p>${V.line}</p></div>` +
      (V.onSay ? '<form class="say"><input id="sayText" maxlength="40" autocomplete="off" placeholder="自己打一句留言，由 AI 評分" aria-label="自己打一句留言"><button class="mini-btn">送出</button></form>' : '') +
      buttons();
  } else if (V.mode === 'plan') {
    const F = forecast();
    app.innerHTML = topbar() + `<div class="main"><section class="board">
        <div class="note"><span class="stk face">${STK.nami(namiMood())}</span><p>${V.text}</p></div>
        ${showRow()}
        <h3 class="step">② 排行程<small>先點一張行動卡，再點格子放上去。再點一次可以拿掉，紅字是會出的問題</small></h3>
        ${palette()}
        <div class="gridwrap">${grid(F)}</div>
        <p class="tools"><button class="mini-btn" data-act="clear">清空還沒過的格子</button><span>點日子的標題，可以把那天的空格一次填滿</span></p></section>
      <aside class="side"><nav class="menu"><h3>③ 排好就開始</h3>${buttons()}</nav>${tips(F)}${sideInfo()}</aside></div>`;
  } else {
    app.innerHTML = topbar() + `<div class="main"><div class="scene t${V.sky || 0}">
        <div class="floor"></div><div class="beam"></div><div class="window"><i class="orb"></i><i class="stars"></i></div>
        <div class="clock"><i class="hh"></i><i class="mm"></i></div><div class="lamp"><i class="glow"></i></div><div class="sprite stk">${BODY.nami(V.mood || 'normal')}</div>
        <div class="msg"><span class="name">奈實</span><p>${V.text}</p></div></div>
      <aside class="side"><nav class="menu"><h3>${V.title}</h3>${buttons()}</nav>${sideInfo()}</aside></div>`;
  }
  if (showTree && G && (V.mode === 'plan' || V.mode === 'day')) app.insertAdjacentHTML('beforeend', treeModal());
  // 只有一顆「繼續」時把焦點放上去，空白鍵或 Enter 就能前進
  const only = app.querySelectorAll('button[data-i]');
  if (only.length === 1 && !V.onSay && V.mode !== 'plan') only[0].focus({ preventScroll: true });
}

$('#app').addEventListener('click', e => {
  const a = e.target.closest('[data-act]');
  if (a) {
    if (a.dataset.act === 'brush') { G.brush = a.dataset.a; render(); }
    if (a.dataset.act === 'tree') { showTree = !showTree; render(); }
    if (a.dataset.act === 'cell') paint(+a.dataset.d, +a.dataset.s);
    if (a.dataset.act === 'day') fillDay(+a.dataset.d);
    if (a.dataset.act === 'clear') { for (let d = G.day; d <= 7; d++) G.plan[d - 1].fill(null); plan('還沒過的格子都清空了。'); }
    if (a.dataset.act === 'show' && !a.disabled) setShow(a.dataset.k, G.big && G.r[a.dataset.k].st >= 2);
    if (a.dataset.act === 'big' && !a.disabled) setShow(G.show, !G.big);
    return;
  }
  const b = e.target.closest('button[data-i]');
  if (b && !b.disabled) V.choices[+b.dataset.i].on();
});

// 滑鼠停在行動卡或格子上時，它會動到的數值和對應的時段、日子會閃
function affects(a) {
  if (!a || a === 'erase') return [];
  if (a === 'show') return ['heart', 'insp', 'prep'];
  if (a === 'work') return ['heart', 'money', 'stress'];
  if (a === 'study') return ['heart', 'study', 'money'];
  if (a === 'idea') return ['insp'];
  if (a === 'prep') return ['heart', 'prep'];
  if (a.startsWith('skill')) return ['heart'];
  const r = REST[a.slice(5)] || REST.home;
  return ['heart', 'stress'].concat(r.cost ? ['money'] : [], r.insp ? ['insp'] : []);
}

const unblink = () => document.querySelectorAll('.blink').forEach(e => e.classList.remove('blink'));
const blink = sel => { const e = $(sel); if (e) e.classList.add('blink'); };
let hot = null;
const onHover = e => {
  const el = e.target.closest('.brush, .chip, .cell');
  if (el === hot) return;
  hot = el;
  unblink();
  const desc = $('#desc');
  if (desc && G) desc.innerHTML = descHTML(el && el.classList.contains('chip') && el.dataset.a ? el.dataset.a : G.brush);
  if (!el || !G) return;
  const cell = el.classList.contains('cell');
  const a = el.dataset.act === 'show' || el.dataset.act === 'big' ? 'show' : el.dataset.a || (cell ? G.brush : '');
  for (const g of affects(a)) blink(`.gauge[data-g="${g}"]`);
  if (cell) { blink(`.rh[data-s="${el.dataset.s}"]`); blink(`.dh[data-d="${el.dataset.d}"]`); }
};
$('#app').addEventListener('mouseover', onHover);
$('#app').addEventListener('focusin', onHover); // 用鍵盤移到卡片或格子上也會閃
$('#app').addEventListener('mouseleave', () => { hot = null; unblink(); });

// 數字鍵 1–9 對應畫面上的選項
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.repeat || showTree) return;
  const n = +e.key;
  if (!n || !V || !V.choices || V.mode === 'plan') return;
  const c = V.choices[n - 1];
  if (c && !c.off) c.on();
});

$('#app').addEventListener('submit', e => {
  e.preventDefault();
  const t = ($('#sayText').value || '').trim();
  if (!t || !V.onSay) return;
  V.onSay(t);
});

// ---------- 可選：AI 留言評分（WebLLM，模型在玩家的瀏覽器裡執行） ----------
// 網址加 ?ai 才會開啟（會下載約 1 GB 的模型）；?ai=rule 只用簡易規則。
const AI = { on: false, mode: '', status: '', engine: null };
const AI_MODEL = new URLSearchParams(location.search).get('model') || 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC'; // 實測 0.5B 幾乎全判成負面，1.5B 才堪用
const AI_LIB = 'https://esm.run/@mlc-ai/web-llm@0.2.88';
const esc = t => t.replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const aiNote = t => { AI.status = t; const el = $('#aiStatus'); if (el) el.textContent = t; };

async function aiLoad() {
  AI.on = true;
  if (!navigator.gpu) { AI.mode = 'rule'; return aiNote('AI 留言：這個瀏覽器不支援 WebGPU，改用簡易規則評分。'); }
  AI.mode = 'loading';
  aiNote('AI 留言：準備下載模型……（下載期間可以先開始玩，會暫時用簡易規則評分）');
  try {
    const lib = await import(AI_LIB);
    AI.engine = await lib.CreateMLCEngine(AI_MODEL, { initProgressCallback: p => aiNote(`AI 留言：下載並載入模型中　${Math.round((p.progress || 0) * 100)}%`) });
    AI.mode = 'llm';
    aiNote('AI 留言：模型已就緒。');
  } catch (e) {
    AI.mode = 'rule';
    aiNote('AI 留言：模型載入失敗，改用簡易規則評分。（' + (e && e.message || e) + '）');
  }
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
    const a = /(-?[0-2])\s*[,，]\s*([01])/.exec(out);
    if (!a) throw new Error('parse');
    // 語氣聽模型的；「相關」模型對負面留言常判成無關，所以和詞庫取聯集
    return { tone: +a[1], relevant: +a[2] || ruleScore(t, k).relevant, by: 'LLM' };
  } catch (e) {
    return ruleScore(t, k);
  }
}

// ---------- 開場 ----------
function title() {
  G = null;
  const sv = loadSave();
  const how = { i: 'idea', t: '怎麼玩', s: '一週的流程和這一季的目標', on: howTo };
  view({ mode: 'title',
    text: '平常，你是 VTuber「薰草」本人奈實，排自己的一週。\n直播的晚上，你坐進聊天室，當一位草民看她。你的留言會影響她怎麼接。\n隔天，再回到奈實，決定昨晚的真心片段要留下還是剪掉。\n進度會自動存在這個瀏覽器裡，下次從最近一次排行程的地方接著玩。',
    choices: sv ? [{ i: 'live', t: '繼續上次', s: `第 ${sv.G.week} 週　${DAYS[sv.G.day - 1]}`, on: () => { G = sv.G; plan(sv.note); } },
      { i: 'cut', t: '從頭開始', s: '會蓋掉上次的進度', on: pickSkill }, how]
      : [{ i: 'live', t: '開始', s: '一季四週', on: pickSkill }, how] });
}

function howTo() {
  view({ mode: 'title', text: '【一週怎麼過】\n' +
    '① 排行程：先決定這週直播播什麼，再把行動放進週曆。紅字是照這樣排會出的問題。\n' +
    '② 過日子：一天一天看結果。每天睡前可以選擇繼續，或隔天早上回週曆改行程。\n' +
    '③ 直播日：你變成聊天室裡的一位草民。每一段先出現一幕，再輪到你選一件事。用留言接住她，她就會露出自己，多一段真心片段。\n' +
    '④ 回看日：回到奈實，決定那些真心片段要留下還是剪掉。\n\n' +
    '【這一季的目標】\n' +
    '・把一條路線練到「② 上手」（練習 3 次）\n' +
    '・留下 2 段真心片段，長出「③ 風格」（這個不是練出來的）\n' +
    '・第 4 週做季末大企劃，成為「④ 代表作」\n' +
    '・第 4 週期末考：大四研習上得越多，合格機率越高\n\n' +
    '【要顧的東西】\n' +
    '心力：做事會用掉，休息和睡覺會回來；不夠還硬做就是硬撐。\n' +
    '壓力：硬撐、上班、出包、SC 收得太多、留下片段的不安都會累積，休息會減輕；太高隔天會起不來。\n' +
    '錢：家裡每月匯一次生活費，每週有固定開銷，不夠就要上班或靠直播的 SC。',
    choices: [{ t: '← 回到標題', on: title }] });
}

function pickSkill() {
  view({ mode: 'title', text: '奈實已經播了兩年多。雜談是基本功，另外選一項她擅長的：',
    choices: Object.keys(ROUTES).map(k => ({ i: 'live', t: ROUTES[k].n,
      s: k === 'talk' ? '只專心雜談，練習已經有底子' : '開場就會，而且練習已經有底子',
      on: () => { newGame(k); plan(`大四開學，直播已經兩年多了。家裡這個月的生活費 ${nt(PAY.allowance)} 入帳了，下一筆要等下個月。\n照 ①②③ 的順序排好這一週。直播在第 6 天，隔天回看。`); } })) });
}

// ---------- 白天：排一週 ----------
function pairs(row) {
  const p = {};
  for (let s = 0; s < row.length; s++) if (row[s] === 'work' && row[s + 1] === 'work') { p[s] = s + 1; p[s + 1] = s; s++; }
  return p;
}

function clearCell(row, s) {
  if (row[s] === 'work') { const q = pairs(row)[s]; if (q != null) row[q] = null; }
  row[s] = null;
}

function paint(d, s) {
  if (d < G.day) return;
  const row = G.plan[d - 1];
  const a = G.brush;
  if (!allowed(a, d, s)) return plan(s === 3 ? `${actInfo(a).n}不能排在晚上。` : '大四研習只開在週二和週四，其他天排不進去。');
  const same = row[s] === a;
  if (a === 'work' && !same) {
    const t = s + 1 < row.length && allowed('work', d, s + 1) ? s + 1 : s - 1;
    clearCell(row, s); clearCell(row, t);
    row[s] = row[t] = 'work';
  } else {
    clearCell(row, s);
    if (a !== 'erase' && !same) row[s] = a;
  }
  plan();
}

function plan(note) {
  if (G.brush.startsWith('skill:') && G.r[G.brush.slice(6)].st !== 1) G.brush = 'rest:home';
  if (AUTO && note != null) {
    if (G.day !== 6 && Math.random() < 0.5) {
      const k = pick(Object.keys(ROUTES).filter(r => G.r[r].st));
      const big = (G.day === 7 ? G.week + 1 : G.week) === 4 && G.r[k].st >= 2;
      if (G.show !== k || G.big !== big) { G.show = k; G.big = big; G.prep = 0; }
    }
    const all = ['study', 'study', 'work', 'idea', 'prep', 'rest:home', 'rest:eat', 'rest:movie'].concat(Object.keys(ROUTES).map(k => 'skill:' + k));
    for (let d = G.day; d <= 7; d++) G.plan[d - 1].forEach((_, s) => { G.brush = pick(all); if (!G.plan[d - 1][s]) paintQuiet(d, s); });
  }
  const text = note != null ? note : V.text;
  save(text); // 每動一次行程就存，關掉再開會回到這張週曆
  const empty = G.plan.slice(G.day - 1).reduce((n, row) => n + row.filter(a => !a).length, 0);
  view({ mode: 'plan', text, choices: [{ i: 'live', t: G.day === 1 ? '開始這一週' : `從${DAYS[G.day - 1]}繼續`,
    s: empty ? `還有 ${empty} 格沒排，空著就是發呆` : '行程排滿了', on: runDay }] });
}

// 點日子的標題：用手上的行動把那天的空格填滿；手上是「拿掉」就清空那天
function fillDay(d) {
  if (d < G.day) return;
  const row = G.plan[d - 1];
  if (G.brush === 'erase') row.fill(null);
  else row.forEach((a, s) => { if (!row[s]) paintQuiet(d, s); });
  plan(G.brush === 'study' && !STUDY_DAYS.includes(d) ? '大四研習只開在週二和週四，其他天排不進去。' : undefined);
}

function paintQuiet(d, s) {
  const row = G.plan[d - 1];
  if (!allowed(G.brush, d, s)) return;
  if (G.brush === 'work') { const t = s + 1 < row.length && allowed('work', d, s + 1) ? s + 1 : s - 1; if (row[t]) return; row[s] = row[t] = 'work'; }
  else row[s] = G.brush;
}

function runDay() {
  const out = runSlots(G, G.day, G.skip, true);
  G.done[G.day - 1] = out.map(o => ({ a: o.a, t: o.t, i: o.i, warn: o.warn }));
  G.skip = 0;
  const lines = out.map((o, s) => (o.cont ? '' : `【${SLOTN[s]}${out[s + 1] && out[s + 1].cont ? '～' + SLOTN[s + 1] : ''}】${o.msg}`)).filter(Boolean);
  const skies = out.map((o, i) => (o.cont ? -1 : i)).filter(n => n >= 0);
  const up = grow(); // 練到 ② 的當下，之前留下的片段夠了就直接長出 ③
  if (up) lines.push(up.trim());
  G.play = { lines: (G.morning ? [G.morning] : []).concat(lines), skies: (G.morning ? [0] : []).concat(skies, up ? [skies[skies.length - 1]] : []) };
  G.dayText = (G.morning ? G.morning + '\n' : '') + lines.join('\n');
  G.morning = '';
  G.ideaN = out.filter(o => o.a === 'idea' && !o.warn).length;
  dayEnd();
}

// 一天的結果。當天找過靈感的話，可以選擇玩小遊戲多拿一點
function dayEnd() {
  const g = Math.max(0, (G.pushed ? 0 : G.rested ? 2 : 1) - (stage() === 1 ? 1 : 0));
  const rest = stage() === 2 ? '壓力撐不住了。明早會起不來，少一個時段' : `明早回復 ${g} 格心力` + (G.pushed ? '（今天硬撐過）' : '');
  let title = `${DAYS[G.day - 1]}結束`;
  let c = [{ i: 'sleep', t: '睡覺，過下一天', s: rest, on: () => nextDay(false) },
    { i: 'prep', t: '睡覺，明早改行程', s: '回到週曆', on: () => nextDay(true) }];
  if (G.day === 6) {
    const big = G.big && G.insp >= INSP.big;
    const cost = big ? 3 : ROUTES[G.show].c;
    title = '該開播了';
    c = [{ i: 'live', t: `開播：${big ? '大企劃・' : ''}${ROUTES[G.show].n}`,
      s: `心力 −${cost}　${big ? '靈感 −' + INSP.big : G.insp >= INSP.show ? '靈感 −' + INSP.show : '靈感不夠，陽春版'}　準備 ${G.prep}/2` +
        (G.big && !big ? '　靈感不夠做大企劃，改成一般版' : '') + (G.heart < cost ? '　心力不夠，會硬撐' : '') + '。開播後你會坐進聊天室當草民', on: startStream }];
  }
  if (G.day === 7) { title = '一週的最後一天'; c = [{ i: 'sleep', t: '睡覺', s: rest, on: () => nextDay(false) }]; }
  // 當天有到新階段的話，先看完當天的結果，按下一步時才播劇情
  c = c.map(x => ({ ...x, on: () => story(x.on) }));
  if (G.ideaN) {
    c.push({ i: 'idea', t: '找靈感小遊戲', s: `可玩可不玩。8 秒內抓到 3 個點子，靈感再 +${INSP.mini * G.ideaN}`, on: ideaIntro });
  }
  view({ mode: 'day', mood: namiMood(), sky: G.day === 6 ? 1 : 3, title, text: G.dayText, choices: c });
  const P = G.play;
  G.play = null;
  if (!P || AUTO) return;
  const sc = $('.scene');
  const txt = $('.msg p');
  let i = 0;
  const tick = () => {
    if (!sc.isConnected) return; // 玩家已經按了別的
    sc.className = 'scene t' + P.skies[i];
    txt.textContent = P.lines.slice(0, i + 1).join('\n');
    if (++i < P.lines.length) setTimeout(tick, 700);
  };
  tick();
}

// ---------- 找靈感小遊戲（可選）：不玩是普通的 +2，玩了每次找靈感再多 1 ----------
let MINI = []; // 小遊戲的計時器
function stopMini() { MINI.forEach(clearInterval); MINI = []; }

function ideaIntro() {
  if (AUTO && !location.search.includes('mini')) return ideaDone(rnd(8));
  view({ mode: 'day', mood: namiMood(), sky: 1, title: '找靈感小遊戲',
    text: '把今天出門看到的東西再想一遍。\n8 秒內點亮飄上來的燈泡，抓到 3 個以上就有額外的靈感。\n灰色的雜念不要點，點到會扣分。',
    choices: [{ i: 'idea', t: '開始', on: ideaGame }, { t: '← 不玩了', on: dayEnd }] });
}

function ideaGame() {
  let score = 0;
  let left = 8;
  stopMini();
  V = { mode: 'mini', choices: [] }; // 小遊戲期間沒有可以用數字鍵選的選項
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
  MINI.push(setInterval(() => {
    for (const o of bubs) {
      o.y += o.v;
      if (o.y > 520) o.el.remove(); else o.el.style.transform = `translateY(${-o.y}px)`;
    }
    bubs = bubs.filter(o => o.y <= 520);
  }, 30));
  spawn();
  MINI.push(setInterval(spawn, 420));
  if (location.search.includes('freeze')) return; // 截圖測試用：不倒數
  MINI.push(setInterval(() => {
    left--;
    $('#mTime').textContent = left;
    if (left > 0) return;
    ideaDone(score);
  }, 1000));
}

function ideaDone(score) {
  stopMini();
  const add = score >= 3 ? INSP.mini * G.ideaN : 0;
  G.insp = clamp(G.insp + add, 0, INSP.max);
  G.dayText += `\n【小遊戲】抓到 ${score} 個點子。` + (add ? `靈感再 +${add}。` : '沒有多想出什麼。');
  G.ideaN = 0;
  dayEnd();
}

function nextDay(replan) {
  const n = night(G);
  G.day++;
  G.skip = n.grey ? 1 : 0;
  G.morning = n.grey ? '灰色的早晨。她躺到中午才起來，少了一個時段。' : `早上。回復了 ${n.g} 格心力。`;
  if (G.day > 7) return weekEnd();
  if (G.day === 7) return review(0, G.morning);
  replan ? plan(G.morning) : runDay();
}

// ---------- 直播：玩家是聊天室裡的草民 ----------
const say = (n, t, c) => G.cur.chat.push({ n, t, c });

function startStream() {
  const k = G.show;
  const big = G.big && G.insp >= INSP.big && G.r[k].st >= 2;
  let used = 0;
  if (big) { G.insp -= INSP.big; used = 2; } else if (G.insp >= INSP.show) { G.insp -= INSP.show; used = 1; }
  const pushed = spend(G, big ? 3 : ROUTES[k].c);
  G.cur = { k, big, q: G.r[k].st + G.prep + used - (pushed ? 1 : 0), seg: 0, max: 3, shows: rnd(4), tips: 0, over: false, bonus: G.buzz * 200,
    clips: [], chat: [], viewers: 40 + rnd(30) + G.buzz * 15, wished: false, cap: '', mood: 'normal', m: null };
  G.buzz = 0;
  say('路過的草', '草安～');
  segment('「各位草安～」薰草開播了。' + (pushed ? '\n（心力不夠，她硬撐著開台。）' : ''));
}

// 一句旁白，按「繼續」前進
function line(cap, then, mood, note) {
  const C = G.cur;
  C.cap = cap;
  C.mood = mood || 'normal';
  view({ mode: 'night', line: note || '節目進行中', choices: [{ t: '繼續 ▶', s: '空白鍵也可以', on: then }] });
}

// 每一段先出現一幕，再輪到草民
function segment(pre) {
  const C = G.cur;
  const R = ROUTES[C.k];
  const show = () => {
    let cap;
    if (C.seg % 2 === 0) {
      // 整季問過的題目先不重複，全部問完再重來
      if (G.asked.length >= PROMPTS.length) G.asked = [];
      const p = pick(PROMPTS.filter((_, i) => !G.asked.includes(i)));
      G.asked.push(PROMPTS.indexOf(p));
      C.m = { type: 'ask', p };
      say(p.from, p.q, 'hl');
      cap = `她唸出留言：「${p.q}」\n她想了一下，還沒回答。`;
    } else if (Math.random() < clamp(0.6 - 0.12 * C.q, 0.12, 0.7)) {
      C.m = { type: 'slip', text: pick(R.slips) };
      say(pick(FANS), '欸？');
      cap = C.m.text + '\n她停住了。';
    } else {
      C.m = { type: 'ok' };
      say(pick(FANS), pick(AMBIENT));
      cap = R.ok[C.shows++ % R.ok.length];
    }
    C.viewers += rnd(5) - 1;
    C.cap = cap;
    C.mood = 'normal';
    turn();
  };
  pre ? line(pre, show) : show();
}

// 輪到草民：六個位置固定，選一件事
function turn() {
  const C = G.cur;
  const m = C.m.type;
  const A = m === 'ask' ? ['照實說也沒關係喔', '接住她：她會照實回答，多一段真心片段'] : m === 'slip' ? ['笑死，好可愛', '接住她：她會笑出來，多一段真心片段'] : [ROUTES[C.k].praise, '稱讚這一段：她的壓力減輕'];
  const B = m === 'ask' ? ['想聽精靈的回答！', '要她維持人設：不會有片段'] : m === 'slip' ? ['這不是薰草', '要她維持人設：她會圓回去，壓力增加'] : ['可以更好吧？', '嚴格的草民：她的壓力增加'];
  const l = locked();
  const ask = m === 'ask' ? '她還沒回答。你是聊天室裡的一位草民，要做什麼？' : m === 'slip' ? '她出包了。' + (G.kept >= 2 ? '她現在比較放得開，沒有人接也可能自己笑出來。' : '沒有人接住的話，她會自己圓回去，壓力增加。') + '你是聊天室裡的一位草民，要做什麼？' : '你是聊天室裡的一位草民，要做什麼？';
  view({ mode: 'night', line: ask, onSay: AI.on ? freeSay : null, choices: [
    { i: 'chat', t: `留言「${A[0]}」`, s: A[1], on: () => resolve('warm', A[0]) },
    { i: 'chat', t: `留言「${B[0]}」`, s: B[1], on: () => resolve('cold', B[0]) },
    { i: 'wish', t: l.length && !C.wished ? `許願：想看${ROUTES[l[0]].n}` : '許願', off: !l.length || C.wished,
      s: C.wished ? '今晚已經許過了' : l.length ? `SC ${nt(PAY.wish)}　解鎖新企劃，做不做由她決定` : '沒有還沒解鎖的企劃', on: () => resolve('wish') },
    { i: 'coin', t: '打賞（小）', s: `SC ${nt(PAY.scS)}`, on: () => resolve('tip1') },
    { i: 'coin', t: '打賞（大）', s: `SC ${nt(PAY.scL)}　給太多她會有壓力`, on: () => resolve('tip4') },
    { i: 'quiet', t: '沉默', s: G.kept >= 2 ? '只是看著。留下過兩段以後，她自己也會鬆開' : '只是看著，她照人設接', on: () => resolve('quiet') }] });
  if (AUTO && AI.on && Math.random() < 0.5) freeSay(pick(['今天的歌好好聽', '好無聊喔', '晚餐吃什麼', '薰草加油', '爛死了', '最喜歡薰草的聲音']));
}

function freeSay(t) {
  const C = G.cur;
  say('你', esc(t), 'me');
  view({ mode: 'night', line: '她正在看留言……', choices: [] });
  aiScore(t, C.k).then(sc => {
    say('評分', `${['惡意', '負面', '普通', '友善', '很溫暖'][sc.tone + 2]}・${sc.relevant ? '切題' : '離題'}（${sc.by}）`, 'sys');
    resolve(!sc.relevant || !sc.tone ? 'quiet' : sc.tone > 0 ? 'warm' : 'cold', null, true);
  });
}

// 草民做的事，決定她怎麼接剛剛那一幕
function resolve(act, text, said) {
  const C = G.cur;
  const R = ROUTES[C.k];
  const m = C.m;
  let pre = '';
  if (text) say('你', text, 'me');
  if (act === 'wish') {
    const w = locked()[0];
    C.wished = true; G.r[w].st = 1; C.tips += PAY.wish;
    say('你', `SC ${nt(PAY.wish)}　想看薰草的${ROUTES[w].n}！`, 'sc');
    pre = `「${ROUTES[w].n}嗎……我想想喔。」\n★ 解鎖了「${ROUTES[w].n}」企劃。`;
  }
  if (act === 'tip1') { C.tips += PAY.scS; say('你', `SC ${nt(PAY.scS)}　辛苦了`, 'sc'); pre = '「謝謝你的 SC～」'; }
  if (act === 'tip4') { C.tips += PAY.scL; say('你', `SC ${nt(PAY.scL)}　一直支持妳`, 'sc'); pre = '「欸、這麼多……謝謝。」'; }
  if (!C.over && C.tips > 300 + C.q * 200) { C.over = true; addStress(2); pre += '\n她頓了一下。（收得比這場值得的多，壓力上升）'; }

  const warm = act === 'warm';
  const cold = act === 'cold';
  const open = !cold && (warm || G.kept >= 2); // 留下過兩段以後，沒人推她也會自己鬆開
  const before = C.clips.length;
  const clip = t => C.clips.push({ k: C.k, text: t, by: warm ? '你的留言' : '她自己' });
  let out = '';
  let mood = 'normal';
  if (cold && m.type !== 'ok') G.held = (G.held || 0) + 1; // 草民要她維持人設的次數，算進「完美」那一邊
  if (m.type === 'ask') {
    const p = m.p;
    if (open) { out = p.b + '\n說完她自己先笑了。'; mood = 'laugh'; clip(`${p.from}問「${p.q}」，她回${p.b}`); say(pick(FANS), '今天的薰草好鬆'); }
    else out = cold || stage() === 0 ? p.a : p.c;
  } else if (m.type === 'slip') {
    if (open) { out = '她笑出聲。不是薰草的笑法。'; mood = 'laugh'; clip(m.text + '她笑了出來。'); say(pick(FANS), '笑死'); }
    else {
      addStress(cold ? 2 : 1);
      out = cold ? '她看到了你的留言。聊天室安靜了一秒，她馬上圓了回去。' : '她馬上圓了回去，聲音沒有抖。';
      say(pick(FANS), '沒事沒事');
    }
  } else if (warm) { addStress(-1); mood = 'laugh'; out = '她看到你的留言，笑了一下。「謝謝～」'; }
  else if (cold) { addStress(1); out = '她看到了，頓了一下。「……我會再加油的。」'; }
  C.seg++;
  line([pre, out].filter(Boolean).join('\n') || '她繼續往下播。', () => {
    if (C.seg < C.max) return segment();
    C.max === 3 ? extendAsk() : closing();
  }, mood, C.clips.length > before ? '★ 多了一段真心片段。明天回看時，由奈實決定留不留。' : '');
}

// 收尾時由奈實決定要不要加長
function extendAsk() {
  const C = G.cur;
  view({ mode: 'night', line: '（回到奈實）收尾了，聊天室還在動。要多播一段嗎？', choices: [
    { i: 'live', t: '加長直播', s: G.heart < 1 ? '心力不夠' : '心力 −1　多一段　下播後直接睡', off: G.heart < 1, on: () => {
      G.heart--; C.ext = true; C.max = 4;
      segment('「留言好熱鬧，那再多聊一下好了。」'); } },
    { i: 'sleep', t: '準時下播', s: '下播後還能做一件事', on: closing }] });
}

function closing() {
  say(pick(FANS), '晚安～');
  line('「今天就到這裡，草民晚安。」', offAir);
}

function offAir() {
  const C = G.cur;
  const gross = C.tips + 200 + C.q * 100 + rnd(5) * 50 + C.bonus; // 你的 SC ＋ 其他草民的
  const total = Math.round(gross * PAY.cut);
  const n = C.clips.length;
  G.money += total;
  let m = `（回到奈實）下播後三十秒。\n${n ? '她摘下耳機，想起剛剛那聲笑，耳朵有點熱。' : '她摘下耳機，房間很安靜。'}\n今晚的 SC 共 ${nt(gross)}（其中你給了 ${nt(C.tips)}），平台抽三成後入帳 ${nt(total)}。`;
  if (C.over) m += '\n「收了這麼多，下次不能出錯。」';
  m += n ? `\n有 ${n} 段不像薰草、像她自己的片段。明天要決定留不留。` : '\n今晚沒有哪一段脫稿。';
  G.clips = C.clips;
  if (C.big && G.r[C.k].st >= 3) G.bigDone = C.k;
  G.prep = 0;
  G.show = 'talk';
  G.big = false;
  const ext = C.ext;
  G.cur = null;
  const c = ext ? [{ i: 'sleep', t: '直接睡', s: '加長之後沒有力氣做別的事', on: () => nextDay(false) }] : [
    { i: 'cut', t: '剪輯精華', off: G.week === 4, s: G.week === 4 ? '這一季沒有下一場了' : `下一場多一些人來看，SC 多 ${nt(200)} 左右（抽成前）`, on: () => { G.buzz = 1; nextDay(false); } },
    { i: 'chat', t: '經營社群', s: `靈感 +${INSP.social}`, on: () => { G.insp = clamp(G.insp + INSP.social, 0, INSP.max); nextDay(false); } },
    { i: 'sleep', t: '早點睡', s: '多睡一點，明早多回 1 格心力', on: () => { G.early = true; nextDay(false); } }];
  view({ mode: 'day', mood: namiMood(), sky: 3, title: '下播了', text: m, choices: c });
}

// ---------- 隔天回看：只看真心片段 ----------
function grow() {
  let m = '';
  for (const k in ROUTES) {
    const r = G.r[k];
    if (r.st === 2 && r.kept >= 2) { r.st = 3; G.story.push([k, 3]); m += `\n★ ${ROUTES[k].n}有了自己的風格（③）。這不是練出來的。`; }
    if (r.st === 3 && G.bigDone === k) { r.st = 4; G.story.push([k, 4]); m += `\n★ ${ROUTES[k].n}的季末大企劃成了代表作（④）。`; }
  }
  G.bigDone = null;
  return m;
}

function review(i, pre) {
  const total = G.clips.length;
  if (i >= total) {
    G.clips = [];
    G.morning = '';
    const text = pre + (total ? '\n回看完了。' : '\n回看昨晚的直播。每一段都很順，沒有需要決定的地方。') + grow();
    return story(() => view({ mode: 'day', mood: namiMood(), sky: 0, title: '回看日', text, choices: [
      { i: 'live', t: '照行程過完今天', on: runDay },
      { i: 'prep', t: '改今天的行程', s: '回到週曆', on: () => plan('回看完了。今天剩下的時間要做什麼？') }] }));
  }
  const c = G.clips[i];
  const r = G.r[c.k];
  view({ mode: 'day', mood: 'laugh', sky: 0, title: `回看昨晚　真心片段 ${i + 1}/${total}`,
    text: `${pre}\n\n【昨晚・${ROUTES[c.k].n}】${c.text}\n——這一段，是她自己。（起因：${c.by}）`, choices: [
      { i: 'heart', t: '留下', s: `讓草民看到這個她。壓力 +1，${ROUTES[c.k].n}的真心片段 ${r.st >= 3 ? '已經夠了' : r.kept + '/2'}`, on: () => {
        r.kept++; G.kept++; addStress(1);
        review(i + 1, '留下了。她有點不安，但沒有按下刪除。'); } },
      { i: 'cut', t: '剪掉', s: '回放保持完美。' + (r.st === 1 && r.exp < 2 ? `${ROUTES[c.k].n}的練習進度 +1` : '把力氣放在不出錯上'), on: () => {
        G.cut++;
        if (r.st === 1) r.exp = Math.min(2, r.exp + 1);
        review(i + 1, '剪掉了。回放裡的薰草很完美。'); } }] });
}

// ---------- 週末、夢、期末、結算 ----------
function weekEnd() {
  G.day = 7;
  let bill = `這週的開銷 ${nt(PAY.living)}（吃飯、交通、網路）。`;
  if (G.money >= PAY.living) { G.money -= PAY.living; bill += `付完還剩 ${nt(G.money)}，要撐到下個月的生活費入帳。`; }
  else { bill += `手上只有 ${nt(G.money)}，不夠的跟家裡開口了，被唸了幾句。（壓力上升）`; G.money = 0; addStress(2); }
  const m = `第 ${G.week} 週結束。\n${bill}\n留下 ${G.kept} 段，剪掉 ${G.cut} 段。壓力：${STRESS[stage()]}。`;
  const next = G.week === 4 ? [{ t: '入睡', s: '季末夢', on: () => dream(true) }]
    : G.week === 2 ? [{ t: '入睡', s: '今晚會作夢', on: () => dream(false) }]
      : [{ t: '下一週', on: () => nextWeek('') }];
  view({ mode: 'day', mood: namiMood(), sky: 3, title: '週末', text: m, choices: next });
}

function nextWeek(wake) {
  G.week++;
  G.day = 1;
  G.done = [];
  let gone = 0;
  for (const row of G.plan) row.forEach((a, i) => { if (a && a.startsWith('skill:') && G.r[a.slice(6)].st !== 1) { row[i] = null; gone++; } });
  const m = `新的一週。${wake}${G.morning.startsWith('灰色') ? '\n' + G.morning : ''}\n上週的行程先留著，可以直接改。${gone ? `已經練不上去的 ${gone} 格先拿掉了。` : ''}`;
  G.morning = '';
  plan(m);
}

function dream(final) {
  const perfect = G.cut + (G.held || 0) > G.kept;
  const t = final
    ? (perfect ? '「最近的回放，都很好。」\n理想中的薰草看起來很滿意。她的話越來越少。' : '「妳留下了那些片段。」\n她看著妳。「那是我嗎？」')
    : (stage() ? '「妳看起來很累。」\n「可是草民在等。」' : '「昨天那一場，可以更好。」');
  const ans = (a, d, wake) => () => { G.dream.push(a); addStress(d); final ? exam() : nextWeek(wake); };
  view({ mode: 'dream', title: final ? '季末夢' : '短夢', text: t, choices: [
    { t: '照理想做', s: '「我會做得更好。」', on: ans('照理想做', 1, '醒來之後，肩膀有點緊。（壓力上升）') },
    { t: '說出感受', s: '「我有點累。」', on: ans('說出感受', -2, '醒來之後，胸口鬆了一點。（壓力下降）') },
    { t: '沉默', s: '……', on: ans('沉默', 0, '') }] });
}

function exam() {
  const p = passRate();
  view({ mode: 'day', mood: namiMood(), sky: 0, title: '上學期期末', text: `期末考。\n這一季的學習度 ${G.study}%，合格機率約 ${p}%。`, choices: [
    { i: 'class', t: '進考場', s: `合格機率 ${p}%`, on: () => { G.exam = Math.random() * 100 < p; ending(); } }] });
}

function ending() {
  const laugh = G.kept === 0 ? '想像' : G.kept < 4 ? '流露' : '保留';
  const skills = Object.keys(ROUTES).map(k => `${ROUTES[k].n} ${ST[G.r[k].st]}`).join('　');
  const goals = [2, 3, 4].filter(n => Object.keys(G.r).some(k => G.r[k].st >= n)).length + (G.exam ? 1 : 0);
  clearSave();
  const t = `這一季結束了。四個目標達成 ${goals} 個，手上還有 ${nt(G.money)}。\n${skills}\n留下 ${G.kept} 段，剪掉 ${G.cut} 段。笑聲：${laugh}。\n` +
    `期末：${G.exam ? '合格。' : '沒過。下學期有幾週要被補考佔掉。'}\n夢裡的回答：${G.dream.join('、')}。\n` +
    (G.cut + (G.held || 0) > G.kept ? '回放裡的薰草一直很完美。' : G.kept ? '有幾段笑聲留在了頻道上。' : '這一季沒有特別的片段。') +
    '\n留下或剪掉，都沒有標準答案。';
  if (AUTO) document.title = 'AUTO-DONE';
  view({ mode: 'day', mood: G.kept ? 'laugh' : 'normal', sky: 0, title: '第一季　結算', text: t, choices: [{ t: '再玩一次', on: title }] });
}

// ---------- 啟動 ----------
window.addEventListener('error', e => { document.title = 'ERR ' + e.message; });
title();
if (location.search.includes('ai=rule')) { AI.on = true; AI.mode = 'rule'; aiNote('AI 留言：簡易規則評分。'); }
else if (/[?&]ai\b/.test(location.search)) aiLoad();

// 自動測試：網址加 ?auto 會隨機排程、隨機點到結算為止；&stop=plan|day|night|dream|mini|story 停在該畫面
if (AUTO) {
  const stop = new URLSearchParams(location.search).get('stop');
  const after = +new URLSearchParams(location.search).get('after') || 0;
  let hits = 0;
  const timer = setInterval(() => {
    if (document.title !== '中之夢　試玩原型') return clearInterval(timer);
    if (stop && document.body.className === stop && G && hits++ >= after) return clearInterval(timer);
    if (stop === 'story' && V && V.title && V.title.startsWith('劇情')) return clearInterval(timer);
    const b = [...document.querySelectorAll('button[data-i]:not(:disabled)')];
    if (b.length) pick(b).click();
  }, 1);
}
