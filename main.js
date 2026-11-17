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
  living2: 4500,    // 畢業後的每週開銷，加上房租（docs/03 2.20）
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
  prep: { n: '準備直播', i: 'prep', s: '心力 −1　準備 +1（最多 2）。準備滿 2 次，開播前比較不緊張' },
  // 以下只會由關鍵週的事件放進週曆，玩家不能自己排（docs/03 2.20）
  makeup: { n: '補考', i: 'class', s: '上學期期末沒過，補考或補交作業。心力 −1　學習度 +3', fixed: true },
  dinner: { n: '同學聚餐', i: 'heart', s: 'NT$500　壓力 −2', fixed: true },
  repair: { n: '等師傅', i: 'cloud', s: '房東找人修水管，要在家等', fixed: true },
  resume: { n: '寫履歷', i: 'prep', s: '和同學一起寫履歷', fixed: true },
  retake: { n: '重修', i: 'class', s: '延畢的重修課。心力 −1', fixed: true },
  workshop: { n: '工作坊', i: 'class', s: '付費的工作坊，佔一整天', fixed: true },
};
// 休息的方式：出門的要花錢，錢不夠就改成在家
const REST = {
  home: { n: '在家休息', t: '在家休息', i: 'rest', cost: 0, heart: 1, stress: 1, insp: 0, once: true, msg: '在家泡了杯茶，什麼都不做。' },
  eat: { n: '吃點好的', t: '吃好料', i: 'heart', cost: 300, heart: 2, stress: 1, insp: 0, msg: '出門吃了一頓想吃很久的。' },
  movie: { n: '看電影', t: '看電影', i: 'live', cost: 350, heart: 1, stress: 2, insp: INSP.movie, msg: '一個人去看了場電影，散場時腦袋裡多了點東西。' },
};
const restSub = r => (r.cost ? '出門。' : '') + `心力 +${r.heart}　壓力 −${r.stress}${r.once ? '（一天只算一次）' : ''}${r.insp ? '　靈感 +' + r.insp : ''}　${r.cost ? '−' + nt(r.cost) : '不花錢'}`;
const STUDY_DAYS = [2, 4]; // 大四研習只開在這幾天（1＝週一）
// 設備：一次性購買，只影響演出品質（docs/03 2.13 A4）
const GEAR = {
  mic: { n: '新麥克風', cost: 2500, s: '之後每場品質 +1（出包變少、SC 變多）' },
  light: { n: '補光燈', cost: 1200, s: '之後每場觀看 +10' },
};
// 笑聲三階段與「說不出口」（docs/03 2.14）
const LAUGH = ['想像', '流露', '保留'];
const laughOf = n => (n === 0 ? 0 : n < 4 ? 1 : 2);
// 說得出口的程度 ＝ 笑聲階段 − 壓力的扣分；不到選項的深度就劃掉
const voiceLv = () => laughOf(G.kept) - stage();
const sayable = depth => voiceLv() >= depth;
// 草民被認得（docs/03 2.15）
const FAME = ['陌生', '眼熟', '常客'];
const fameOf = n => (n < 4 ? 0 : n < 9 ? 1 : 2);
const ME = '一株草'; // 玩家在聊天室的 ID
// 季初方針（docs/03 2.16）
const LETGO = { study: '研習', practice: '練習', perfect: '完美', money: '錢' };
const need = k => (G.focus === k ? 3 : 5); // 專心的路線練 3 次到 ②，其他 5 次
// 蒙太奇的重心（docs/03 2.16）。base 是三週的開銷扣掉那段時間的生活費
const MONTAGE_BASE = 0;
const MONTAGE = {
  practice: { n: '多練習', s: '專心路線練習 +2　壓力 +1', cards: ['錄下自己的聲音重聽', '同一段練到第十遍', '筆記本又寫滿一本'] },
  rest: { n: '多休息', s: '壓力 −3', cards: ['睡到自然醒', '去公園坐了一個下午', '把房間整理乾淨'] },
  work: { n: '多工作', s: `錢 +${'NT$2,400'}　壓力 +2`, cards: ['多排了幾個班', '店長說妳最近很穩', '下班的公車上睡著'] },
  live: { n: '多直播', s: '錢 +NT$1,200　被認得 +2　壓力 +1　下一場多一些人來看', cards: ['多開了兩場雜談', '聊天室多了幾個新名字', '回放的觀看數慢慢往上'] },
  study: { n: '多研習', s: '學習度 +20　錢 −NT$450　壓力 +1', cards: ['坐在第一排抄筆記', '和同學借了上週的講義', '期末的範圍終於看完一輪'] },
};
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
  if (a === 'study' && (!canStudy() || !STUDY_DAYS.includes(d))) return false;
  return true;
}
const AUTO = location.search.includes('auto');
// 試 Q5 的 A（docs/03 7.7）：網址加 pace 時，同一條路線一季最多升一層（① 的解鎖不算）
// pace=tree 更嚴：整棵樹一季只能升一層（6.7「一季大約推進一層」的字面意思）
const PACE = location.search.includes('pace');
const PACE_TREE = location.search.includes('pace=tree');
const canRise = r => !PACE || (PACE_TREE ? !Object.values(G.r).some(x => x.up === G.season) : r.up !== G.season);

const TEST = (AUTO || location.search.includes('seed=')) && !location.search.includes('forcesave'); // 測試時不讀寫存檔
const SAVE_KEY = 'yumenonaka-save-v4'; // 欄位改過就換版本，舊存檔不讀
function save(note) {
  if (TEST) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ G: { ...G, cur: null, play: null }, note })); } catch (e) { /* 不能存就算了 */ }
}
function loadSave() {
  if (TEST) return null;
  try { const v = JSON.parse(localStorage.getItem(SAVE_KEY)); return v && v.G && v.G.plan && v.G.r && v.G.asked && v.G.seasons ? v : null; } catch (e) { return null; }
}
function clearSave() { if (TEST) return; try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* 沒關係 */ } }

let G = null;
let V = null;
let showTree = location.search.includes('tree'); // 網址加 tree 可直接打開技能樹（測試用）

function newGame(first, seasons) {
  G = { week: 1, day: 1, heart: 4, stress: 2, money: PAY.start + PAY.allowance, insp: INSP.show, study: 0, prep: 0, buzz: 0,
    rested: false, pushed: false, kept: 0, cut: 0, dream: [], clips: [], bigDone: null, cur: null, r: {},
    plan: DAYS.map((_, i) => Array(i === 5 ? 2 : 4).fill(null)), done: [], brush: 'rest:home', show: 'talk', big: false, story: [], asked: [], skip: 0, morning: '', exam: null,
    stat: { push: 0, grey: 0, over: 0, near: 0, stuck: 0, warm: 0, self: 0, guilt: 0, crisis: 0, ask: 0, peak: 0, sc: 0, work: 0, made: 0, due: 0, kept: 0 },
    gear: {}, polish: 0, fame: 0, focus: first, letgo: null, wk: { study: 0, practice: 0, grey: 0 }, lastGrey: 0, lock: [], deadline: null, crisis: false,
    season: 1, seasons: seasons || 1, makeup: 0, promise: null, resume: false, examLog: [], focusLog: [], offLive: false, called: false, montage: [] };
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
  if (r.st === 1) return `練習 ${r.exp}/${need(k)} →「上手」${G.focus === k ? '（專心）' : ''}`;
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
  if (S === G) G.stat.push++;
  S.stress = clamp(S.stress + 2, 0, 10);
  return true;
}

function step(S, a, real) {
  const o = { a, t: '', i: 'quiet', warn: '', msg: '' };
  const cost = c => { if (spend(S, c)) { o.warn = '硬撐'; return '（心力不夠，她硬撐了過去。）'; } return ''; };
  if (!a) { o.t = ''; o.msg = '沒排事情，發了一會兒呆。'; return o; }
  if (a === 'work') {
    o.t = '上班'; o.i = 'work';
    const x = cost(1); S.money += PAY.work; if (real) { G.stat.work++; G.wk.work = (G.wk.work || 0) + 1; } S.stress = clamp(S.stress + 1, 0, 10);
    o.msg = `在店裡站了四個小時。薪水 ${nt(PAY.work)}。` + x + (real && Math.random() < 0.2 ? unlockRandom('打工時碰到相關的工作') : '');
  } else if (a === 'study') {
    o.t = '研習'; o.i = 'class';
    if (S.money < PAY.study) { o.warn = S.maybe ? '看打賞夠不夠' : '錢不夠'; o.msg = '想去研習，但講義和車錢湊不出來。'; return o; }
    const x = cost(1); S.study = clamp(S.study + 7, 0, 100); S.money -= PAY.study; if (real) G.wk.study++;
    o.msg = `到學校上大四研習，坐在後排抄筆記。講義與車錢 ${nt(PAY.study)}。` + x + (real && Math.random() < 0.15 ? unlockRandom('研習剛好講到') : '');
  } else if (a === 'idea') {
    o.t = '找靈感'; o.i = 'idea';
    if (S.insp >= INSP.max) { o.warn = '靈感已滿'; o.msg = '出門走了一圈，但腦袋已經裝不下了。'; }
    else { S.insp = clamp(S.insp + INSP.idea, 0, INSP.max); o.msg = `出門走了一圈，記下幾個想法。靈感 +${INSP.idea}。` + (real && Math.random() < 0.25 ? unlockRandom('路上看到有趣的東西') : ''); }
  } else if (a === 'prep') {
    o.t = '準備直播'; o.i = 'prep';
    if (G.week === 4 && G.season === G.seasons && (S.maybe || G.day === 7)) { o.warn = '沒有下一場'; o.msg = '這一季的直播都播完了，沒有東西要準備。'; }
    else if (S.prep >= 2) { o.warn = '已經準備好'; o.msg = '流程已經排好了，沒有東西可以再準備。'; }
    else { const x = cost(1); S.prep++; o.msg = '排了流程，試了一下麥克風。' + x; }
  } else if (a === 'makeup') {
    o.t = '補考'; o.i = 'class';
    const x = cost(1); S.study = clamp(S.study + 3, 0, 100);
    o.msg = '補交上學期的作業，一個人坐在空教室裡寫完。' + x;
  } else if (a === 'dinner') {
    o.t = '聚餐'; o.i = 'heart';
    if (S.money < 500) { o.warn = '錢不夠'; o.msg = '想去聚餐，但錢不夠，只好說臨時有事。'; return o; }
    S.money -= 500; S.stress = clamp(S.stress - 2, 0, 10);
    o.msg = '和同學吃了頓飯，花了 NT$500。有人問「妳最近在忙什麼？」她說「就……打工啊。」其他時候都很開心。';
  } else if (a === 'repair') {
    o.t = '等師傅'; o.i = 'cloud';
    o.msg = '在家等修水管的師傅，什麼都做不了。';
  } else if (a === 'retake') {
    o.t = '重修'; o.i = 'class';
    const x = cost(1);
    o.msg = '重修。教室裡都是學弟妹。' + x;
  } else if (a === 'workshop') {
    o.t = '工作坊'; o.i = 'class';
    o.msg = '在工作坊待了一整段，和不認識的人一起練習。';
  } else if (a === 'resume') {
    o.t = '寫履歷'; o.i = 'prep';
    o.msg = '和同學一起寫履歷。「興趣與專長」那一欄，她空著。';
  } else if (a.startsWith('rest')) {
    let r = REST[a.slice(5)] || REST.home;
    let pre = '';
    if (S.money < r.cost) { o.warn = S.maybe ? '看打賞夠不夠' : '錢不夠，改在家'; pre = `本來想${r.n}，但錢不夠。`; r = REST.home; }
    o.t = r.t; o.i = r.i;
    S.money -= r.cost;
    // 在家休息的降壓一天只算一次；出門的休息每次都算（docs/03 2.18）
    const calm = r === REST.home && S.rested ? 0 : r.stress;
    S.heart = clamp(S.heart + r.heart, 0, HMAX()); S.stress = clamp(S.stress - calm, 0, 10); S.insp = clamp(S.insp + r.insp, 0, INSP.max); S.rested = true;
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
      const x = cost(1); r.exp++; if (real) G.wk.practice++;
      o.msg = `練了一輪${n}。`;
      if (r.exp >= need(k) && canRise(r)) { r.st = 2; r.exp = 0; r.up = G.season; o.msg += `\n★ ${n}到了「${ST[2]}」。`; if (real) G.story.push([k, 2]); }
      else if (r.exp >= need(k)) { r.exp = need(k); o.msg += `\n（${n}這一季已經升過一層，下一季才會到「${ST[2]}」。）`; }
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
  S.heart = clamp(S.heart + g, 0, HMAX());
  S.rested = false;
  S.pushed = false;
  if (s === 2) S.stress = clamp(S.stress - 3, 0, 10);
  if (S === G) { if (s === 2) G.stat.grey++; G.stat.peak = Math.max(G.stat.peak, S.stress); }
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
    if (d === 6 && G.offLive) {
      live = { off: true };
      S.heart = clamp(S.heart + 2, 0, HMAX()); S.stress = clamp(S.stress - 3, 0, 10); S.maybe = true;
    } else if (d === 6) {
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

// 小時鐘：排行程與直播畫面用（4.16 第 10 項）
function miniClock(h, m, label, night) {
  const hh = (h % 12) * 30 + m * 0.5;
  return `<span class="mclock ${night ? 'night' : ''}"><span class="face"><i class="hh" style="transform:rotate(${hh}deg)"></i><i class="mm" style="transform:rotate(${m * 6}deg)"></i></span><b>${label}</b></span>`;
}
const SEG_TIME = [[20, 0], [20, 40], [21, 20], [22, 0]]; // 開場、中段、收尾、加長

function pips(n, max, cls) {
  let h = '';
  for (let i = 0; i < max; i++) h += `<span class="pip ${cls} ${i < n ? 'on' : ''}"></span>`;
  return `<span class="pips">${h}</span>`;
}

function buttons() {
  return `<div class="choices">${V.choices.map((c, i) =>
    `<button data-i="${i}" class="${c.i ? '' : 'plain'}${c.x ? ' struck' : ''}" ${c.off ? 'disabled' : ''}>` +
    (c.i ? `<span class="stk ic">${ICON[c.i]}</span>` : '') +
    `<b>${c.t}</b>${c.s ? `<small>${c.s}</small>` : ''}</button>`).join('')}</div>`;
}

function topbar() {
  const s = stage();
  return `<header class="top">
    <span class="when"><b>${seasonLabel(G)}第 ${G.week} 週　${DAYS[Math.min(G.day, 7) - 1]}</b></span>
    <span class="gauge" data-g="heart">心力 ${pips(G.heart, HMAX(), '')}</span>
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
      ${hasExam() ? goal(G.exam === true, `第 4 週${G.season === 4 ? '畢業考' : '期末'}，合格機率 ${passRate()}%`) : '<li>□ 這季沒有期末，學習度留到學期末一起算</li>'}</ul>
    <h3>技能樹<button class="mini-btn" data-act="tree">看整棵樹</button></h3><ul class="tree">${tree}</ul>
    <h3>她和你</h3><ul class="goals wrap">
      <li>方針：專心${ROUTES[G.focus].n}${G.letgo ? `，放下${LETGO[G.letgo]}` : ''}</li>
      <li>笑聲：${LAUGH[laughOf(G.kept)]}（留下 ${G.kept} 段）　說得出口：${['很難', '一點點', '可以', '比較能'][clamp(voiceLv() + 1, 0, 3)]}</li>
      <li>她認得你：${FAME[fameOf(G.fame)]}${G.gear.mic || G.gear.light ? '　設備：' + Object.keys(G.gear).map(k => GEAR[k].n).join('、') : ''}</li></ul></section>`;
}

function treeModal() {
  const how = ['解鎖：草民許願、打工、找靈感或研習', '練習 3 次，不是專心的路線 5 次（回看時剪掉片段也會加進度）', '回看時留下 2 段真心片段', `第 4 週做季末大企劃（要先有 ③，靈感 ${INSP.big}）`];
  const col = k => {
    const r = G.r[k];
    return `<div class="branch"><h4>${ROUTES[k].n}</h4>` + [0, 1, 2, 3].map(i => {
      const prog = r.st !== i ? '' : i === 1 ? `　${r.exp}/${need(k)}` : i === 2 ? `　${r.kept}/2` : '';
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
  if (a.startsWith('skill')) { const k = a.slice(6); return { i: 'practice', n: '練習' + ROUTES[k].n, s: `心力 −1　進度 ${G.r[k].exp}/${need(k)}，練滿就到「② 上手」${G.focus === k ? '（這季專心的路線）' : '（不是專心的路線，比較慢）'}` }; }
  return ACTS[a];
}
const descHTML = a => { const x = actInfo(a); return `<b>${x.n}</b>${x.s}`; };

function palette() {
  const list = (canStudy() ? ['study', 'work'] : ['work']).concat(Object.keys(ROUTES).filter(k => G.r[k].st === 1).map(k => 'skill:' + k),
    ['idea', 'prep'], Object.keys(REST).map(k => 'rest:' + k), ['erase']);
  const chips = list.map(a => { const x = actInfo(a); return `<button class="chip ${G.brush === a ? 'on' : ''}" data-act="brush" data-a="${a}">` +
    `<span class="stk">${ICON[x.i]}</span>${x.n}</button>`; }).join('');
  return `<div class="chips">${chips}</div><p class="desc" id="desc">${descHTML(G.brush)}</p>`;
}

const showName = () => (G.big ? '大企劃・' : '') + ROUTES[G.show].n;

// 直播內容要在排行程時先決定。沒決定就是雜談；準備是針對這個內容做的
function showRow() {
  let wk = G.day === 7 ? G.week + 1 : G.week;
  if (wk > 4 && G.season === G.seasons) return '<h3 class="step">① 直播都播完了</h3>';
  if (wk > 4) wk = 1; // 下一季的第 1 週
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
  // 撐不住的一週可以休播（docs/03 2.16）
  if (G.crisis && G.day <= 6) {
    bigRow += `<p class="bigrow"><button class="chip ${G.offLive ? 'on' : ''}" data-act="off" ${lock ? 'disabled' : ''}><span class="stk">${ICON.sleep}</span>這週休播</button>` +
      '<small>直播日晚上不開台，改成休息：壓力 −3　心力 +2　沒有片段。休播不是失敗</small></p>';
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
  const L = F.live && !F.live.off ? F.live : null;
  const t = [];
  if (G.crisis && !G.offLive && G.day < 6) t.push('這週她撐不住了。可以在 ① 選「這週休播」，讓她休息一晚。');
  if (G.deadline) t.unshift(`期中報告：這週研習要上 ${G.deadline.need} 次，目前排了 ${G.plan.flat().filter(a => a === 'study').length + G.wk.study} 次。`);
  if (n('硬撐')) t.push(`有 ${n('硬撐')} 格會硬撐（心力不夠）。多排一點休息，或少做一件事。`);
  if (L && L.push) t.push('照這樣排，開播時心力不夠。直播日之前留一點休息。');
  if (L && L.fall) t.push(`開播時靈感不到 ${INSP.big}，季末大企劃會變成一般版。`);
  else if (L && L.insp < INSP.show) t.push('開播時靈感不夠，只能播陽春版。排一次找靈感。');
  if (L && L.prep < 2) t.push(`開播前的準備只有 ${L.prep}/2。準備越足，失誤越少、SC 越多；滿 2 次開播前也比較不緊張。`);
  if (n('錢不夠')) t.push('有幾格的錢不夠。排一班上班，或等直播的 SC 入帳。');
  const left = G.plan.slice(G.day - 1).flat();
  const can = Object.keys(ROUTES).filter(k => G.r[k].st === 1);
  if (can.length && !Object.keys(G.r).some(k => G.r[k].st >= 2) && !left.some(a => a && a.startsWith('skill:'))) {
    t.push(`還沒有路線到「② 上手」，這週也沒排練習。專心的${ROUTES[G.focus].n}練滿 3 次就到。`);
  }
  if (canStudy() && STUDY_DAYS.some(d => d >= G.day) && G.study < 100 && !left.includes('study')) t.push('這週沒排大四研習。研習只開在週二、週四，晚上不開。');
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
  if (L && L.off) return h + '<div class="onair" style="grid-column:7;grid-row:4 / span 2"><b>休播</b><small>晚上好好休息<br>壓力 −3　心力 +2</small></div></div>';
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
    const [ch, cm] = SEG_TIME[Math.min(C.seg, 3)];
    app.innerHTML = `<header class="top"><span class="badge-live">LIVE</span>${miniClock(ch, cm, `${ch}:${String(cm).padStart(2, '0')}`, true)}<span class="when"><b>${C.big ? '季末大企劃・' : ''}${ROUTES[C.k].n}</b></span>
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
        <div class="note"><span class="stk face">${STK.nami(namiMood())}</span><p>${V.text}</p>${miniClock(9, 0, `${DAYS[Math.min(G.day, 7) - 1]}　上午 9:00`)}</div>
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
    if (a.dataset.act === 'off' && !a.disabled) { G.offLive = !G.offLive; plan(G.offLive ? '這週休播。直播日晚上好好休息。' : '這週還是照常開台。'); }
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
  if (ACTS[a] && ACTS[a].fixed) return [];
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
    choices: sv ? [{ i: 'live', t: '繼續上次', s: `${seasonLabel(sv.G)}第 ${sv.G.week} 週　${DAYS[sv.G.day - 1]}`, on: () => { G = sv.G; plan(sv.note); } },
      { i: 'cut', t: '從頭開始：一季', s: '會蓋掉上次的進度', on: () => pickSkill(1) }, { i: 'class', t: '從頭開始：第一年', s: '會蓋掉上次的進度', on: () => pickSkill(4) }, { i: 'wish', t: '從頭開始：三年', s: '會蓋掉上次的進度', on: () => pickSkill(12) }, how]
      : [{ i: 'live', t: '開始', s: '一季四週', on: () => pickSkill(1) }, { i: 'class', t: '第一年', s: '四季，大四一整年。到畢業為止', on: () => pickSkill(4) }, { i: 'wish', t: '三年', s: '十二季，完整的骨架。第三年最後一場決定結局', on: () => pickSkill(12) }, how] });
}

function howTo() {
  view({ mode: 'title', text: '【一週怎麼過】\n' +
    '① 排行程：先決定這週直播播什麼，再把行動放進週曆。紅字是照這樣排會出的問題。\n' +
    '② 過日子：一天一天看結果。每天睡前可以選擇繼續，或隔天早上回週曆改行程。\n' +
    '③ 直播日：你變成聊天室裡的一位草民。每一段先出現一幕，再輪到你選一件事。用留言接住她，她就會露出自己，多一段真心片段。但她壓力緊繃時，第一次會接不住；撐不住時，誰都接不住。\n' +
    '④ 回看日：回到奈實，決定那些真心片段要留下還是剪掉。留下換的是她自己（③ 風格），剪掉換的是頻道（下一場多一些人來看）。\n' +
    '季初先選方針：專心一條路線、放下一件事。關鍵週之間是三週的蒙太奇，選一個重心帶過。每個關鍵週開頭有一件事（請託、期限、電話等）。\n' +
    '「第一年」模式有四季：第 2 季末是上學期期末，第 4 季末是畢業結算。\n\n' +
    '【這一季的目標】\n' +
    '・把一條路線練到「② 上手」（練習 3 次）\n' +
    '・留下 2 段真心片段，長出「③ 風格」（這個不是練出來的）\n' +
    '・第 4 週做季末大企劃，成為「④ 代表作」\n' +
    '・第 4 週期末考：大四研習上得越多，合格機率越高\n\n' +
    '【要顧的東西】\n' +
    '心力：做事會用掉，休息和睡覺會回來；不夠還硬做就是硬撐。\n' +
    '壓力：硬撐、上班、出包、SC 收得太多、留下片段的不安都會累積，休息會減輕；太高隔天會起不來。\n' +
    '錢：家裡每月匯一次生活費，每週有固定開銷，不夠就要上班或靠直播的 SC。存下來的錢可以買設備。\n' +
    '笑聲與說不出口：留下的片段越多，她越說得出口；壓力越高，越說不出口。說不出口的選項會被劃掉。\n' +
    '她認得你：直播時每做一件不是沉默的事，她就多認得你一點。認得你以後才能許新企劃；變成常客後，她緊繃時也接得住你的話。',
    choices: [{ t: '← 回到標題', on: title }] });
}

function pickSkill(seasons) {
  view({ mode: 'title', text: '奈實已經播了兩年多。雜談是基本功，另外選一項她擅長的：',
    choices: Object.keys(ROUTES).map(k => ({ i: 'live', t: ROUTES[k].n,
      s: k === 'talk' ? '只專心雜談，練習已經有底子' : '開場就會，而且練習已經有底子',
      on: () => { newGame(k, seasons); policy(() => weekEvent(t => plan(t + '\n' + `大四開學，直播已經兩年多了。家裡這個月的生活費 ${nt(PAY.allowance)} 入帳了，下一筆要等下個月。\n照 ①②③ 的順序排好這一週。直播在第 6 天，隔天回看。`))); } })) });
}

// 季初方針：專心一條路線、放下一件事。沒達成不算失敗（docs/03 2.16）
function policy(then) {
  const open = Object.keys(ROUTES).filter(k => G.r[k].st);
  view({ mode: 'title', text: '【季初方針】\n這一季要專心哪一條路線？\n專心的路線練 3 次就到「② 上手」，其他路線要 5 次。',
    choices: open.map(k => ({ i: 'practice', t: `專心：${ROUTES[k].n}`, s: `現在 ${ST[G.r[k].st]}`, on: () => { G.focus = k; letgoPick(then); } })) });
}

function letgoPick(then) {
  const pickIt = k => () => { G.letgo = k; G.focusLog.push([G.focus, k]); then(); };
  view({ mode: 'title', text: `【季初方針】\n專心${ROUTES[G.focus].n}。\n那這一季，要放下哪一件事？放下的事，沒做到也不會自責。`, choices: [
    canStudy() ? { i: 'class', t: '放下：研習', s: '這季沒去研習也不會自責。期末還是要考', on: pickIt('study') }
      : { i: 'coin', t: '放下：錢', s: '這季沒賺錢也不會焦慮。開銷照付', on: pickIt('money') },
    { i: 'practice', t: '放下：練習', s: '這季沒練習也不會自責', on: pickIt('practice') },
    { i: 'heart', t: '放下：完美', s: '這季留下真心片段時，不會不安', on: pickIt('perfect') }] });
}

// 這一季有沒有期末：一季模式在季末考；第一年模式在第 2 季（上學期）和第 4 季（畢業）考
const hasExam = () => G.seasons === 1 || (G.season <= 4 && G.season % 2 === 0);
// 三年模式用：第幾年、每週開銷、心力上限、還能不能研習（docs/03 2.20、2.23）
const yearOf = () => Math.ceil(G.season / 4);
const living = () => (yearOf() >= 2 ? PAY.living2 + (G.rentUp ? 300 : 0) : PAY.living);
const HMAX = () => (G.retake ? 4 : 5);
const canStudy = () => yearOf() === 1;
// 「第 2 年第 1 季」或「第 3 季」
const seasonLabel = g => (g.seasons > 4 ? `第 ${Math.ceil(g.season / 4)} 年第 ${(g.season - 1) % 4 + 1} 季　` : g.seasons > 1 ? `第 ${g.season} 季　` : '');
// 開播前的緊張：第二年起，笑聲到「保留」就只有大企劃會緊張（2.18 C4）
const nerveOf = big => Math.max(0, (big ? 2 : yearOf() >= 2 && laughOf(G.kept) === 2 ? 0 : 1) - (G.prep >= 2 ? 1 : 0));
const absWeek = () => (G.season - 1) * 4 + G.week;
// 主要路線：方針紀錄裡專心最多次的路線，平手看最近的（docs/03 2.19）
function mainRoute() {
  const n = {};
  G.focusLog.forEach(([k]) => { n[k] = (n[k] || 0) + 1; });
  const top = Math.max(0, ...Object.values(n));
  const tied = G.focusLog.map(([k]) => k).filter(k => n[k] === top);
  return tied.length ? tied[tied.length - 1] : G.focus;
}
// 每週開始時重設拿不掉的格子；上學期期末沒過的話，下學期頭兩週有補考（docs/03 2.6）
function startLocks() {
  G.lock = [];
  if (G.retake) G.lock.push({ d: 2, s: 0, a: 'retake' }, { d: 2, s: 1, a: 'retake' }, { d: 4, s: 0, a: 'retake' }, { d: 4, s: 1, a: 'retake' });
  if (G.owe) { G.lock.push({ d: 1, s: 0, a: 'work' }, { d: 1, s: 1, a: 'work' }); G.owe = false; }
  if (G.fulltime === G.season) G.lock.push({ d: 1, s: 0, a: 'work' }, { d: 1, s: 1, a: 'work' }, { d: 3, s: 0, a: 'work' }, { d: 3, s: 1, a: 'work' });
  if (G.makeup > 0) { G.lock.push({ d: 2, s: 0, a: 'makeup' }, { d: 4, s: 0, a: 'makeup' }); G.makeup--; }
}

// 關鍵週的事件：每個關鍵週開頭有一件事，讓這週有自己的壓力（docs/03 2.18、2.20）
// 依「季-週」查表。沒有事件的週，如果有到期的承諾，就變成「承諾到期」
const deadline = (title, text, name) => then => view({ mode: 'day', mood: namiMood(), sky: 0, title, text,
  choices: [{ i: 'class', t: '知道了', s: `這週研習 2 次以上。沒做到：學習度 −10${G.letgo === 'study' ? '（放下了研習，壓力不加）' : '、壓力 +2'}`,
    on: () => { G.deadline = { need: 2, name }; then(`${name}：這週研習要上 2 次。`); } }] });

const EVENTS = {
  // 第 1 季（秋）
  '1-1': then => {
    const no = sayable(0);
    view({ mode: 'day', mood: namiMood(), sky: 0, title: '店長傳來的訊息',
      text: '「這週三下午到傍晚，可以幫忙代個班嗎？有人臨時請假。」',
      choices: [
        { i: 'work', t: '「好，沒問題。」', s: `週三下午～傍晚排上班，拿不掉　+${nt(PAY.work)}`, on: () => {
          G.lock.push({ d: 3, s: 1, a: 'work' }, { d: 3, s: 2, a: 'work' }); then('答應了店長，週三下午到傍晚要代班。'); } },
        { i: 'chat', t: '「這週不太方便……」', off: !no, x: !no, s: no ? '拒絕。店長說沒關係' : '還說不出口', on: () => then('跟店長說這週不行。店長回了一個「OK」的貼圖。') }] });
  },
  '1-2': deadline('研習的期中報告', '研習的老師說，期中報告要在週四的課上交。\n這週的兩次研習（週二、週四）都要到，才來得及做完。', '期中報告'),
  '1-3': then => familyCall('「最近怎樣？書有沒有在讀？下學期就要準備找工作了吧。」', then),
  // 第 2 季（冬）
  '2-1': then => view({ mode: 'day', mood: namiMood(), sky: 2, title: '同學的群組',
    text: '「週五晚上要不要聚一下？好久沒見了～」\n群組裡已經有五六個人說要去。',
    choices: [
      { i: 'heart', t: '「好啊！」', s: '週五傍晚排聚餐，拿不掉　NT$500　壓力 −2', off: G.money < 500, on: () => {
        G.lock.push({ d: 5, s: 2, a: 'dinner' }); then('週五傍晚和同學聚餐。'); } },
      { i: 'quiet', t: '「這週有事，下次！」', s: '不去。什麼都不會發生', on: () => then('沒去聚餐。群組裡的照片，她滑過去了。') }] }),
  '2-3': then => view({ mode: 'day', mood: namiMood(), sky: 0, title: '房東的訊息',
    text: '「樓上漏水，週二上午會有師傅來修，要麻煩妳在家。」',
    choices: [{ i: 'cloud', t: '「好的。」', s: '週二上午要在家等師傅，拿不掉', on: () => { G.lock.push({ d: 2, s: 0, a: 'repair' }); then('週二上午要在家等修水管的師傅。'); } }] }),
  // 第 3 季（春）
  '3-1': then => {
    const no = sayable(1);
    view({ mode: 'day', mood: namiMood(), sky: 0, title: '店長傳來的訊息',
      text: '「最近人手不夠，這週一上午和週四下午，可以多排妳嗎？」\n上學期她已經答應過一次了。',
      choices: [
        { i: 'work', t: '「好。」', s: `週一上午～下午、週四下午～傍晚排上班，拿不掉　+${nt(PAY.work * 2)}`, on: () => {
          G.lock.push({ d: 1, s: 0, a: 'work' }, { d: 1, s: 1, a: 'work' }, { d: 4, s: 1, a: 'work' }, { d: 4, s: 2, a: 'work' }); then('答應了店長，這週多排兩班。'); } },
        { i: 'chat', t: '「這週真的排不出來。」', off: !no, x: !no, s: no ? '拒絕。第二次拒絕比較難（深度 1）' : '還說不出口（第二次拒絕比較難，深度 1）', on: () => then('跟店長說排不出來。店長說「好喔」，沒有貼圖。') }] });
  },
  '3-2': deadline('畢業專題的進度報告', '畢業專題要交進度報告了。\n這週的兩次研習都要到，才來得及和老師討論。', '進度報告'),
  '3-3': then => familyCall('「下學期了，工作找得怎麼樣？有沒有在投履歷？」', then),
  // 第 4 季（夏）
  '4-1': then => view({ mode: 'day', mood: namiMood(), sky: 0, title: '同學的邀請',
    text: '「週三要不要一起去圖書館寫履歷？大家互相看一下。」',
    choices: [
      { i: 'prep', t: '「好，一起。」', s: '週三上午到傍晚寫履歷，拿不掉。壓力 +1（大家都寫得出來）', on: () => {
        G.lock.push({ d: 3, s: 0, a: 'resume' }, { d: 3, s: 1, a: 'resume' }, { d: 3, s: 2, a: 'resume' }); G.resume = true; addStress(1); then('週三要和同學一起寫履歷。'); } },
      { i: 'quiet', t: '「我再想想。」', s: '不去', on: () => then('沒有去。履歷的檔案還是空白的。') }] }),
  '4-2': then => {
    const can = sayable(1);
    view({ mode: 'day', mood: namiMood(), sky: 2, title: '同學的群組',
      text: '「我拿到 offer 了！！」\n群組裡一排恭喜。接著有人問：「那妳呢？」',
      choices: [
        { i: 'chat', t: '「恭喜！我還在找。」', s: '壓力 +2', on: () => { addStress(2); then('她打完那句話，把手機蓋在桌上。'); } },
        { i: 'chat', t: '「我有在做自己的事。」', off: !can, x: !can, s: can ? '壓力不變' : '還說不出口', on: () => then('「什麼事？」她沒有回。但說出來的那一刻，好像沒那麼慌了。') },
        { i: 'quiet', t: '已讀', s: '壓力 +1', on: () => { addStress(1); then('她沒有回。群組的話題很快換掉了。'); } }] });
  },
  '4-3': deadline('畢業專題發表', '下週要發表畢業專題了。\n這週的兩次研習都要到，把投影片做完。', '畢業專題發表'),
};

// ---- 第二、三年的事件（docs/03 2.20、2.23）。第 2 週都空著，留給承諾到期 ----
// 工作坊：畢業後條件鎖的第四個來源（2.13 A5）。付費、佔一整天
const workshop = (title, text) => then => {
  const fee = 1500;
  view({ mode: 'day', mood: namiMood(), sky: 0, title, text: text + `\n報名費 ${nt(fee)}，週三一整天。`,
    choices: [
      { i: 'class', t: '報名', off: G.money < fee, s: G.money < fee ? '錢不夠' : `${nt(fee)}　週三上午到傍晚，拿不掉。解鎖一個還沒開的企劃（都開了的話，靈感 +4）`, on: () => {
        G.money -= fee;
        G.lock.push({ d: 3, s: 0, a: 'workshop' }, { d: 3, s: 1, a: 'workshop' }, { d: 3, s: 2, a: 'workshop' });
        const l = locked();
        let got;
        if (l.length) { G.r[l[0]].st = 1; got = `★ 解鎖了「${ROUTES[l[0]].n}」企劃。`; } else { G.insp = clamp(G.insp + 4, 0, INSP.max); got = '靈感 +4。'; }
        then(`報名了工作坊。${got}`); } },
      { i: 'quiet', t: '算了', s: '不報名', on: () => then('沒有報名。') }] });
};
// 同學的消息：恭喜／說得出口的話／已讀（同 4-2 的模式）
const news = (title, text, line) => then => {
  const can = sayable(1);
  view({ mode: 'day', mood: namiMood(), sky: 2, title, text,
    choices: [
      { i: 'chat', t: '「恭喜！」', s: '壓力 +2', on: () => { addStress(2); then('她打完那句話，把手機蓋在桌上。'); } },
      { i: 'chat', t: line, off: !can, x: !can, s: can ? '壓力不變' : '還說不出口', on: () => then('說出來的那一刻，好像沒那麼慌了。') },
      { i: 'quiet', t: '已讀', s: '壓力 +1', on: () => { addStress(1); then('她沒有回。'); } }] });
};
// 翻出剪掉的片段：第三年，剪掉的夠多才有（2.19）
function digFolder(then) {
  const can = sayable(1);
  const k = Object.keys(ROUTES).find(r => G.r[r].st === 2);
  view({ mode: 'day', mood: namiMood(), sky: 3, title: '剪掉的資料夾',
    text: `深夜，她打開那個沒有名字的資料夾。\n裡面有 ${G.cut} 段。每一段的她，都在笑。`,
    choices: [
      { i: 'heart', t: '留下其中一段', off: !can, x: !can, s: can ? `移進收藏冊。${k ? `${ROUTES[k].n}補上「③ 風格」` : '笑聲往前一步'}（深度 1）` : '還說不出口（深度 1）', on: () => {
        G.cut--; G.kept++;
        if (k) { G.r[k].st = 3; G.r[k].up = G.season; G.story.push([k, 3]); }
        then('她把其中一段拖回收藏冊。看了很久，沒有刪。'); } },
      { i: 'cut', t: '全部刪掉', s: '資料夾清空。理想中的薰草的方向會定為「標準」', on: () => { G.cut = 0; G.forceDir = '標準'; then('資料夾清空了。回放裡的薰草，一直都很完美。'); } },
      { i: 'quiet', t: '關掉資料夾', s: '什麼都不變，之後不會再出現', on: () => then('她關掉資料夾，去睡了。') }] });
}

Object.assign(EVENTS, {
  // 第二年（畢業後）
  '5-1': then => {
    const no = sayable(1);
    view({ mode: 'day', mood: namiMood(), sky: 0, title: '店長傳來的訊息',
      text: '「畢業了吧？那要不要多排一點班？週一和週三的上午。」',
      choices: [
        { i: 'work', t: '「好。」', s: `週一、週三上午～下午排上班，拿不掉　+${nt(PAY.work * 2)}`, on: () => {
          G.lock.push({ d: 1, s: 0, a: 'work' }, { d: 1, s: 1, a: 'work' }, { d: 3, s: 0, a: 'work' }, { d: 3, s: 1, a: 'work' }); then('答應了店長，這週多排兩班。'); } },
        { i: 'chat', t: '「這週真的排不出來。」', off: !no, x: !no, s: no ? '拒絕（深度 1）' : '還說不出口（深度 1）', on: () => then('跟店長說排不出來。') }] });
  },
  '5-3': then => familyCall('「工作找到了嗎？還是要繼續打工？」', then),
  '6-1': workshop('聲音表演工作坊', '在社群上看到一個聲音表演的工作坊。'),
  '6-3': then => view({ mode: 'day', mood: namiMood(), sky: 2, title: '同學的群組',
    text: '「大家都上班了，只有週五晚上有空～要不要聚一下？」',
    choices: [
      { i: 'heart', t: '「好啊！」', s: '週五傍晚排聚餐，拿不掉　NT$500　壓力 −2', off: G.money < 500, on: () => { G.lock.push({ d: 5, s: 2, a: 'dinner' }); then('週五傍晚和同學聚餐。'); } },
      { i: 'quiet', t: '「這週有事，下次！」', s: '不去', on: () => then('沒去聚餐。') }] }),
  '7-1': then => view({ mode: 'day', mood: namiMood(), sky: 0, title: '房東的訊息',
    text: '「不好意思，下個月起房租要調一點。」',
    choices: [{ i: 'coin', t: '「……好的。」', s: '之後每週開銷 +NT$300', on: () => { G.rentUp = true; then('房租漲了。每週的開銷又多了一點。'); } }] }),
  '7-3': then => familyCall('「最近還好嗎？錢夠不夠用？」', then),
  '8-1': workshop('遊戲實況工作坊', '朋友轉傳了一個遊戲實況的工作坊。'),
  '8-3': news('同學的群組', '「我升組長了！」\n群組裡一排恭喜。有人問：「那妳呢？最近在幹嘛？」', '「我在做自己的事。」'),
  // 第三年（出路與收入）
  '9-1': then => {
    const no = sayable(1);
    view({ mode: 'day', mood: namiMood(), sky: 0, title: '店長找她談',
      text: '「要不要轉正職？這一季先試試看，週一和週三的上午到下午。」\n薪水穩定。時間就少了。',
      choices: [
        { i: 'work', t: '「好，我試試看。」', s: '這一季每週一、週三上午～下午都是上班，拿不掉', on: () => { G.fulltime = G.season; startLocks(); then('答應了店長，這一季先試正職。'); } },
        { i: 'chat', t: '「我想再想想。」', off: !no, x: !no, s: no ? '拒絕（深度 1）' : '還說不出口（深度 1）', on: () => then('跟店長說想再想想。店長說「不急」。') }] });
  },
  '9-3': then => familyCall('「明年就二十五了，有沒有想過以後要做什麼？」', then),
  '10-1': then => (G.cut >= 5 ? digFolder(then) : workshop('歌唱工作坊', '附近的音樂教室開了一個歌唱工作坊。')(then)),
  '10-3': news('同學的群組', '「我要結婚了！」\n群組裡一排恭喜。有人問：「妳呢？有什麼打算？」', '「我想先把自己的事做好。」'),
  '11-1': workshop('朗讀工作坊', '圖書館辦了一個朗讀的工作坊。'),
  // 第三年的家人電話：「其實我有在直播」降到深度 2（2.19）
  '11-3': then => familyCall('「妳最近到底在忙什麼？每次問都說還好。」', then, null, 2),
  '12-1': then => view({ mode: 'day', mood: namiMood(), sky: 3, title: '最後一季',
    text: '第三年的最後一季。\n她看著頻道的首頁，算了一下，已經播了快五年。',
    choices: [{ t: '繼續 ▶', on: () => then('這一季的最後一場直播，會是一個段落。') }] }),
});

function weekEvent(then) {
  const ev = EVENTS[`${G.season}-${G.week}`];
  if (ev) return ev(then);
  // 承諾到期：只在中間兩週、沒有別的事、也不是撐不住的時候（docs/03 2.16）
  if ((G.week === 2 || G.week === 3) && !G.crisis && G.promise && absWeek() - G.promise.at >= 2) return promiseDue(then);
  return then('');
}

function promiseDue(then) {
  G.stat.due++;
  const k = G.promise.k;
  const n = ROUTES[k].n;
  view({ mode: 'day', mood: namiMood(), sky: 2, title: '承諾到期',
    text: `社群上有草民留言：「上次說要播的${n}呢～？」\n她答應過的。`,
    choices: [
      { i: 'live', t: `這週就播${n}`, s: '直播內容改成這個。播了就算做到', on: () => { setShowQuiet(k); then(`這週播${n}，兌現上次的承諾。`); } },
      { i: 'quiet', t: '再等等', s: '壓力 +1。兩週後還會再被問', on: () => { addStress(1); G.promise.at = absWeek(); then('她回了一句「快了快了」，心裡有點虛。'); } }] });
}
// 不經過 plan() 的換內容，給事件用
function setShowQuiet(k) { G.show = k; G.big = false; G.prep = 0; }

// 家人電話：每季一通。至少一個回答是說不出口的（docs/03 2.14、2.17）
function familyCall(q, then, more, liveDepth) {
  const ld = liveDepth || 3;
  const tell = ld < 3 && sayable(ld);
  const can = sayable(1);
  const done = t => () => then(`家裡的電話講完了。\n${t}`);
  view({ mode: 'day', mood: namiMood(), sky: 0, title: '家裡打來的電話',
    text: `手機響了。是家裡。\n${q}`,
    choices: [
      { i: 'chat', t: '「都很好啊。」', s: '壓力 +1（說謊也累）', on: () => { addStress(1); done('「那就好。」掛掉之後，她在床邊坐了一會兒。')(); } },
      ...(more || []).map(m => ({ ...m, on: () => { m.fx(); done(m.after)(); } })),
      { i: 'chat', t: '「最近有點累。」', off: !can, x: !can, s: can ? '壓力 −1' : '還說不出口', on: () => { addStress(-1); done('「累就早點睡，不要一直熬夜。」家人沒有多問。她說好。')(); } },
      { i: 'chat', t: '「其實我有在直播。」', off: !tell, x: !tell, s: tell ? `壓力 −2。說出來以後，就收不回去了（深度 ${ld}）` : ld === 3 ? '還說不出口（第一年都說不出口）' : `還說不出口（深度 ${ld}）`,
        on: () => { G.told = true; addStress(-2); done('電話那頭安靜了很久。「……是喔。那妳自己要想清楚。」掛掉之後，她的手還在抖。但胸口是鬆的。')(); } }] });
}

// 蒙太奇：關鍵週之間約三週，選一個重心一次結算（docs/03 2.16）
function montage(then) {
  const apply = k => () => {
    const M = MONTAGE[k];
    let note = '';
    if (k === 'practice') {
      const r = G.r[G.focus];
      addStress(1);
      if (r.st === 1) {
        r.exp += 2;
        if (r.exp >= need(G.focus) && canRise(r)) { r.st = 2; r.exp = 0; r.up = G.season; G.story.push([G.focus, 2]); note = `★ ${ROUTES[G.focus].n}到了「${ST[2]}」。`; }
        else note = `${ROUTES[G.focus].n}的練習 +2。`;
      } else note = `${ROUTES[G.focus].n}練得很順，但再上去不是練出來的。`;
    }
    if (k === 'rest') { addStress(-3); note = '壓力減輕了不少。'; }
    if (k === 'work') { G.money += 2400; addStress(2); note = `多賺了 ${nt(2400)}。`; }
    if (k === 'live') { G.money += 1200; G.fame += 2; G.buzz = 1; addStress(1); note = `直播多賺了 ${nt(1200)}，下一場會多一些人來看。`; }
    if (k === 'study') { G.study = clamp(G.study + 20, 0, 100); G.money -= 450; addStress(1); note = `學習度 +20，講義與車錢 ${nt(450)}。`; }
    G.money += MONTAGE_BASE;
    let bill = MONTAGE_BASE ? `這三週的開銷扣掉生活費，少了 ${nt(-MONTAGE_BASE)}。` : '這三週的開銷，剛好被那段時間的生活費抵掉。';
    if (G.money < 0) { G.money = 0; G.stat.ask++; addStress(2); bill += '錢不夠，跟家裡開口了。（壓力上升）'; }
    G.montage.push(M.n);
    view({ mode: 'day', mood: namiMood(), sky: 1, title: `蒙太奇：${M.n}`,
      text: M.cards.map(c => '・' + c).join('\n') + `\n\n${note}\n${bill}`, choices: [{ t: '繼續 ▶', on: () => story(then) }] });
  };
  view({ mode: 'day', mood: namiMood(), sky: 1, title: '接下來的三週',
    text: '到下一個關鍵週之前，日子一天一天過去。\n這段時間的重心放在哪裡？（一次結算，不用排行程）',
    choices: Object.keys(MONTAGE).filter(k => k !== 'study' || canStudy()).map(k => ({ i: { practice: 'practice', rest: 'rest', work: 'work', live: 'live', study: 'class' }[k], t: MONTAGE[k].n, s: MONTAGE[k].s, on: apply(k) })) });
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
  if (isLocked(d, s)) return plan('這格是答應過、或躲不掉的事，拿不掉。');
  if (!allowed(a, d, s)) return plan(s === 3 ? `${actInfo(a).n}不能排在晚上。` : canStudy() ? '大四研習只開在週二和週四，其他天排不進去。' : '畢業了，沒有研習。');
  const same = row[s] === a;
  if (a === 'work' && !same) {
    const t = s + 1 < row.length && allowed('work', d, s + 1) ? s + 1 : s - 1;
    if (isLocked(d, t)) return plan('旁邊那格是答應過、或躲不掉的事，拿不掉。');
    clearCell(row, s); clearCell(row, t);
    row[s] = row[t] = 'work';
  } else {
    clearCell(row, s);
    if (a !== 'erase' && !same) row[s] = a;
  }
  plan();
}

// 答應過的事佔住的格子，每次排行程都放回去（docs/03 2.18）
const isLocked = (d, s) => (G.lock || []).some(c => c.d === d && c.s === s);
function plan(note) {
  for (const c of G.lock || []) if (c.d >= G.day) G.plan[c.d - 1][c.s] = c.a;
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
  // 設備是一次性購買，不佔時段（docs/03 2.13 A4）
  const gear = Object.keys(GEAR).filter(k => !G.gear[k]).map(k => ({ i: 'coin', t: `買${GEAR[k].n}`, s: `${nt(GEAR[k].cost)}　${GEAR[k].s}`, off: G.money < GEAR[k].cost,
    on: () => { G.gear[k] = true; G.money -= GEAR[k].cost; plan(`買了${GEAR[k].n}，花了 ${nt(GEAR[k].cost)}。`); } }));
  view({ mode: 'plan', text, choices: [{ i: 'live', t: G.day === 1 ? '開始這一週' : `從${DAYS[G.day - 1]}繼續`,
    s: empty ? `還有 ${empty} 格沒排，空著就是發呆` : '行程排滿了', on: runDay }].concat(gear) });
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
  if (G.day === 6 && G.offLive) {
    title = '今晚休播';
    c = [{ i: 'sleep', t: '休播，早點休息', s: '不開台。壓力 −3　心力 +2　這週沒有片段', on: () => {
      addStress(-3); G.heart = clamp(G.heart + 2, 0, HMAX()); G.clips = []; G.prep = 0; G.show = 'talk'; G.big = false; G.rested = true;
      nextDay(false); } }];
  } else if (G.day === 6) {
    const big = G.big && G.insp >= INSP.big;
    const cost = big ? 3 : ROUTES[G.show].c;
    title = '該開播了';
    c = [{ i: 'live', t: `開播：${big ? '大企劃・' : ''}${ROUTES[G.show].n}`,
      s: `心力 −${cost}　${big ? '靈感 −' + INSP.big : G.insp >= INSP.show ? '靈感 −' + INSP.show : '靈感不夠，陽春版'}　準備 ${G.prep}/2　緊張：壓力 +${nerveOf(big)}` +
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
  if (n.grey) G.wk.grey = (G.wk.grey || 0) + 1;
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
  // 第一年的壓力主軸「怕演不好」：開播前會緊張，大企劃更緊張；準備滿了可以抵掉一點（docs/03 2.18）
  const nerve = nerveOf(big);
  addStress(nerve);
  let kept = '';
  if (G.promise && G.promise.k === k) { G.promise = null; G.stat.kept++; addStress(-1); G.fame++; kept = `\n「上次答應要播的${ROUTES[k].n}，今天來了～」（做到了答應的事，壓力 −1）`; }
  // 剪掉的片段讓回放保持完美，下一場多一些人來看（docs/03 2.13 A3）
  const polish = Math.min(3, G.polish);
  G.cur = { k, big, q: G.r[k].st + G.prep + used - (pushed ? 1 : 0) + (G.gear.mic ? 1 : 0), seg: 0, max: 3, shows: rnd(4), tips: 0, over: false,
    bonus: G.buzz * 200 + polish * 100, clips: [], chat: [], viewers: 40 + rnd(30) + G.buzz * 15 + polish * 8 + (G.gear.light ? 10 : 0),
    wished: false, cap: '', mood: 'normal', m: null, near: false, polish };
  G.buzz = 0;
  G.polish = 0;
  say('路過的草', '草安～');
  // 常客記得上次回放留下了什麼（docs/03 2.22 H1）
  if (G.rv && G.rv.keep) say('茶泡', '上次那段笑死，我存起來了');
  if (G.rv && G.rv.cut) say('小穗', '上次的回放好完美～');
  G.rv = null;
  const hi = fameOf(G.fame) ? `\n她看到你的 ID：「啊，${ME}${fameOf(G.fame) === 2 ? '來了。今天也在呢。' : '又來了～'}」` : '';
  segment('「各位草安～」薰草開播了。' + hi + kept + (pushed ? '\n（心力不夠，她硬撐著開台。）' : '') + (nerve ? `\n（開播前手心都是汗。壓力 +${nerve}）` : '\n（準備得夠，開播前沒那麼緊張。）'));
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
  // 她接不接得住，看她當天的壓力（docs/03 2.13 A1）。玩家白天就知道她的狀態，所以小字照實寫
  const s = stage();
  const regular = fameOf(G.fame) === 2;
  const catchNote = s === 2 ? '她今天撐不住，接不住任何話；但你的留言會讓她好過一點'
    : s === 1 && !C.near ? (regular ? '她今天比較緊，但她認得你，接得住' : '她今天比較緊，第一次可能接不住') : '';
  const A = m === 'ask' ? ['照實說也沒關係喔', catchNote || '接住她：她會照實回答，多一段真心片段'] : m === 'slip' ? ['笑死，好可愛', catchNote || '接住她：她會笑出來，多一段真心片段'] : [ROUTES[C.k].praise, C.eased ? '稱讚這一段：她今晚已經好過一點了，這次只是被看到' : '稱讚這一段：她的壓力減輕（一場只有一次有效）'];
  const B = m === 'ask' ? ['想聽精靈的回答！', '要她維持人設：不會有片段'] : m === 'slip' ? ['這不是薰草', '要她維持人設：她會圓回去，壓力增加'] : ['可以更好吧？', '嚴格的草民：她的壓力增加'];
  const l = locked();
  const self = G.kept >= 2 && s === 0; // 留下過兩段、而且壓力平穩時，沒人推她也會自己鬆開
  const ask = m === 'ask' ? '她還沒回答。你是聊天室裡的一位草民，要做什麼？' : m === 'slip' ? '她出包了。' + (self ? '她現在比較放得開，沒有人接也可能自己笑出來。' : '沒有人接住的話，她會自己圓回去，壓力增加。') + '你是聊天室裡的一位草民，要做什麼？' : '你是聊天室裡的一位草民，要做什麼？';
  // 許願跟著「被認得」的階段：陌生只能點話題，眼熟以後才能許新企劃（docs/03 2.15）
  const small = fameOf(G.fame) === 0;
  const wish = small ? { t: '許願：點一個話題', off: C.wished, s: C.wished ? '今晚已經許過了' : `SC ${nt(PAY.wish)}　她照著聊，這場的品質 +1。她認得你以後才能許新企劃` }
    : { t: l.length && !C.wished ? `許願：想看${ROUTES[l[0]].n}` : '許願', off: !l.length || C.wished,
      s: C.wished ? '今晚已經許過了' : l.length ? `SC ${nt(PAY.wish)}　解鎖新企劃，做不做由她決定` : '沒有還沒解鎖的企劃' };
  view({ mode: 'night', line: ask, onSay: AI.on ? freeSay : null, choices: [
    { i: 'chat', t: `留言「${A[0]}」`, s: A[1], on: () => resolve('warm', A[0]) },
    { i: 'chat', t: `留言「${B[0]}」`, s: B[1], on: () => resolve('cold', B[0]) },
    { i: 'wish', ...wish, on: () => resolve('wish') },
    { i: 'coin', t: '打賞（小）', s: `SC ${nt(PAY.scS)}`, on: () => resolve('tip1') },
    { i: 'coin', t: '打賞（大）', s: `SC ${nt(PAY.scL)}　給太多她會有壓力`, on: () => resolve('tip4') },
    { i: 'quiet', t: '沉默', s: self ? '只是看著。她現在可能自己鬆開；她自己鬆開的片段，留下時算兩段' : '只是看著，她照人設接', on: () => resolve('quiet') }] });
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
  if (act !== 'quiet' || said) G.fame += act === 'wish' ? 2 : 1; // 不是沉默的事都會讓她多認得你一點；許願比較顯眼，算兩次
  if (act === 'wish' && C.wished) act = 'quiet';
  if (act === 'wish' && fameOf(G.fame - 2) === 0) {
    C.wished = true; C.tips += PAY.wish; C.q++;
    say('你', `SC ${nt(PAY.wish)}　想聽薰草聊聊最近喜歡的東西！`, 'sc');
    pre = '「好啊，那這段就聊這個～」\n她照著你點的話題聊下去，這一段比較熱鬧。（這場的品質 +1）';
  } else if (act === 'wish' && locked().length) {
    const w = locked()[0];
    C.wished = true; G.r[w].st = 1; C.tips += PAY.wish;
    if (!G.promise) { G.promise = { k: w, at: absWeek() }; G.stat.made++; } // 她答應下次播（docs/03 2.20）
    say('你', `SC ${nt(PAY.wish)}　想看薰草的${ROUTES[w].n}！`, 'sc');
    pre = `「${ROUTES[w].n}嗎……好，下次播給你看。」\n★ 解鎖了「${ROUTES[w].n}」企劃。她答應了，要記得做。`;
  }
  if (act === 'tip1') { C.tips += PAY.scS; say('你', `SC ${nt(PAY.scS)}　辛苦了`, 'sc'); pre = '「謝謝你的 SC～」'; }
  if (act === 'tip4') { C.tips += PAY.scL; say('你', `SC ${nt(PAY.scL)}　一直支持妳`, 'sc'); pre = '「欸、這麼多……謝謝。」'; }
  if (!C.over && C.tips > 300 + C.q * 200) { C.over = true; G.stat.over++; addStress(2); pre += '\n她頓了一下。（收得比這場值得的多，壓力上升）'; }

  const warm = act === 'warm';
  const cold = act === 'cold';
  const s = stage();
  // 接住她：平穩接得住；緊繃時同一場第一次接不住（常客除外）；撐不住時接不住（docs/03 2.13 A1）
  let near = false;
  let stuck = false;
  let open = false;
  if (warm && m.type !== 'ok') {
    if (s === 2) { stuck = true; G.stat.stuck++; }
    else if (s === 1 && !C.near && fameOf(G.fame) < 2) { near = true; C.near = true; G.stat.near++; }
    else open = true;
  } else if (!cold) open = G.kept >= 2 && s === 0; // 留下過兩段、壓力平穩時，沒人推她也會自己鬆開
  const ease = () => { if (C.eased) return '（她已經好過一點了，再多的留言也只是被看到。）'; C.eased = true; addStress(-1); return '（壓力減輕）'; };
  const before = C.clips.length;
  const notKaoru = () => { if (G.kept >= 2 && !C.notKaoru && G.nkSeason !== G.season && Math.random() < 0.35) { C.notKaoru = true; G.nkSeason = G.season; say('夜貓草', '……這不是薰草吧', 'hl'); } };
  const clip = t => { notKaoru(); G.stat[warm ? 'warm' : 'self']++; C.clips.push({ k: C.k, text: t, by: warm ? '你的留言' : '她自己' }); };
  let out = '';
  let mood = 'normal';
  if (cold && m.type !== 'ok') G.held = (G.held || 0) + 1; // 草民要她維持人設的次數，算進「完美」那一邊
  if (m.type === 'ask') {
    const p = m.p;
    if (open) { out = p.b + '\n說完她自己先笑了。'; mood = 'laugh'; clip(`${p.from}問「${p.q}」，她回${p.b}`); say(pick(FANS), '今天的薰草好鬆'); }
    else if (near) out = `她差點照實說，笑了一下又收回去：「沒有啦～」\n${p.c}`;
    else if (stuck) out = `${p.c}\n她接不住。但她看到了你的留言，聲音放軟了一點。` + ease();
    else out = cold || s === 0 ? p.a : p.c;
  } else if (m.type === 'slip') {
    if (open) { out = '她笑出聲。不是薰草的笑法。'; mood = 'laugh'; clip(m.text + '她笑了出來。'); say(pick(FANS), '笑死'); }
    else if (near) { out = '她差點笑出來，又忍住了。「沒事沒事～」'; say(pick(FANS), '沒事沒事'); }
    else if (stuck) { out = '她馬上圓了回去。看到你的留言，小聲說了句謝謝。' + ease(); say(pick(FANS), '沒事沒事'); }
    else {
      addStress(cold ? 2 : 1);
      out = cold ? '她看到了你的留言。聊天室安靜了一秒，她馬上圓了回去。' : '她馬上圓了回去，聲音沒有抖。';
      say(pick(FANS), '沒事沒事');
    }
  } else if (warm) { mood = 'laugh'; out = '她看到你的留言，笑了一下。「謝謝～」' + ease(); }
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
  G.stat.sc += total;
  let m = `（回到奈實）下播後三十秒。\n${n ? '她摘下耳機，想起剛剛那聲笑，耳朵有點熱。' : '她摘下耳機，房間很安靜。'}\n今晚的 SC 共 ${nt(gross)}（其中你給了 ${nt(C.tips)}），平台抽三成後入帳 ${nt(total)}。`;
  if (C.notKaoru) { addStress(1); G.stat.nk = (G.stat.nk || 0) + 1; m += '\n「這不是薰草吧」那則留言，她看了好幾遍。（壓力 +1）'; }
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
    { i: 'cut', t: '剪輯精華', off: G.week === 4 && G.season === G.seasons, s: G.week === 4 && G.season === G.seasons ? '沒有下一場了' : `下一場多一些人來看，SC 多 ${nt(200)} 左右（抽成前）`, on: () => { G.buzz = 1; nextDay(false); } },
    { i: 'chat', t: '經營社群', s: `靈感 +${INSP.social}`, on: () => { G.insp = clamp(G.insp + INSP.social, 0, INSP.max); nextDay(false); } },
    { i: 'sleep', t: '早點睡', s: '多睡一點，明早多回 1 格心力', on: () => { G.early = true; nextDay(false); } }];
  view({ mode: 'day', mood: namiMood(), sky: 3, title: '下播了', text: m, choices: c });
}

// ---------- 隔天回看：只看真心片段 ----------
function grow() {
  let m = '';
  for (const k in ROUTES) {
    const r = G.r[k];
    if (r.st === 2 && r.kept >= 2 && canRise(r)) { r.st = 3; r.up = G.season; G.story.push([k, 3]); m += `\n★ ${ROUTES[k].n}有了自己的風格（③）。這不是練出來的。`; }
    if (r.st === 3 && G.bigDone === k && canRise(r)) { r.st = 4; r.up = G.season; G.story.push([k, 4]); m += `\n★ ${ROUTES[k].n}的季末大企劃成了代表作（④）。`; }
  }
  G.bigDone = null;
  return m;
}

function review(i, pre) {
  const total = G.clips.length;
  if (i === 0) G.rv = { keep: 0, cut: 0 };
  if (i >= total) {
    G.clips = [];
    G.morning = '';
    const text = pre + (total ? '\n回看完了。' : G.offLive ? '\n昨晚休播了。社群上有幾個草民留言：「好好休息～」「等妳回來」。' : '\n回看昨晚的直播。每一段都很順，沒有需要決定的地方。') + grow();
    return story(() => view({ mode: 'day', mood: namiMood(), sky: 0, title: '回看日', text, choices: [
      { i: 'live', t: '照行程過完今天', on: runDay },
      { i: 'prep', t: '改今天的行程', s: '回到週曆', on: () => plan('回看完了。今天剩下的時間要做什麼？') }] }));
  }
  const c = G.clips[i];
  const r = G.r[c.k];
  view({ mode: 'day', mood: 'laugh', sky: 0, title: `回看昨晚　真心片段 ${i + 1}/${total}`,
    text: `${pre}\n\n【昨晚・${ROUTES[c.k].n}】${c.text}\n——這一段，是她自己。（起因：${c.by}）`, choices: [
      // 留下換的是「她自己」，剪掉換的是「頻道」（docs/03 2.13 A3）。放下「完美」的這一季，留下不會不安
      { i: 'heart', t: '留下', s: `讓草民看到這個她。${G.letgo === 'perfect' ? '這季放下了完美，不會不安' : '壓力 +1'}，${ROUTES[c.k].n}的真心片段 ${r.st >= 3 ? '已經夠了' : r.kept + '/2'}${c.by === '她自己' ? '（她自己鬆開的，算兩段）' : ''}　收進收藏冊`, on: () => {
        r.kept += c.by === '她自己' ? 2 : 1; G.kept++; G.rv.keep++; // 她自己鬆開的片段比較珍貴，③ 的進度算兩段（docs/03 7.3 D1）
        if (G.letgo !== 'perfect') addStress(1);
        review(i + 1, G.letgo === 'perfect' ? '留下了。這一季說好不要求完美，她看著那一段，沒有太多不安。' : '留下了。她有點不安，但沒有按下刪除。'); } },
      { i: 'cut', t: '剪掉', s: `回放保持完美：下一場多一些人來看，SC 多 ${nt(100)} 左右。` + (r.st === 1 && r.exp < need(c.k) - 1 ? `${ROUTES[c.k].n}的練習進度 +1` : '') + '　收進剪掉的資料夾', on: () => {
        G.cut++; G.polish++; G.rv.cut++;
        if (r.st === 1) r.exp = Math.min(need(c.k) - 1, r.exp + 1);
        review(i + 1, '剪掉了。回放裡的薰草很完美。剪下來的那段，存進了一個沒有名字的資料夾。'); } }] });
}

// ---------- 週末、夢、期末、結算 ----------
function weekEnd() {
  G.day = 7;
  const L = living();
  let bill = `這週的開銷 ${nt(L)}（${yearOf() >= 2 ? '房租、' : ''}吃飯、交通、網路）。`;
  if (G.money >= L) { G.money -= L; bill += `付完還剩 ${nt(G.money)}，${yearOf() >= 2 ? '之後的錢要靠上班和直播。' : '要撐到下個月的生活費入帳。'}`; }
  // 第一年跟家裡開口；畢業後家裡不給了，只好刷卡，下週一被迫多排一班補回來（docs/03 2.23）
  else if (yearOf() >= 2) { bill += `手上只有 ${nt(G.money)}，不夠的先刷卡了。下週一要多排一班補回來。（壓力上升）`; G.money = 0; G.stat.ask++; G.owe = true; addStress(2); }
  else { bill += `手上只有 ${nt(G.money)}，不夠的跟家裡開口了，被唸了幾句。（壓力上升）`; G.money = 0; G.stat.ask++; addStress(2); }
  // 沒做的事會讓她自責，季初放下的那一項除外（docs/03 2.16）
  const guilt = [];
  if (canStudy() && G.letgo !== 'study' && G.study < 100 && !G.wk.study) guilt.push('這週一次研習都沒去');
  // 畢業後：錢快不夠又沒上班，會焦慮（放下「錢」的那季不會）
  if (!canStudy() && G.letgo !== 'money' && !G.wk.work && G.money < living() * 2) guilt.push('這週一毛錢都沒賺');
  // 只看專心的那條路線：它已經練不上去（② 以上）就不會自責
  if (G.letgo !== 'practice' && G.r[G.focus].st === 1 && !G.wk.practice) guilt.push(`這週都沒有練${ROUTES[G.focus].n}`);
  if (guilt.length) { addStress(guilt.length); G.stat.guilt += guilt.length; }
  // 期中報告之類的期限（docs/03 2.18）
  let due = '';
  if (G.deadline) {
    if (G.wk.study < G.deadline.need) {
      G.study = clamp(G.study - 10, 0, 100);
      if (G.letgo !== 'study') addStress(2);
      due = `\n${G.deadline.name}沒做完，交了一份很趕的版本。學習度 −10${G.letgo !== 'study' ? '，壓力上升' : '（這季放下了研習，沒有太自責）'}。`;
    } else due = `\n${G.deadline.name}準時交出去了。`;
    G.deadline = null;
  }
  G.lastGrey = G.wk.grey || 0;
  G.wk = { study: 0, practice: 0, grey: 0 };
  const m = `第 ${G.week} 週結束。\n${bill}${due}` + (guilt.length ? `\n睡前她想到：「${guilt.join('，')}。」（壓力上升）` : '') +
    `\n留下 ${G.kept} 段，剪掉 ${G.cut} 段。壓力：${STRESS[stage()]}。`;
  const next = G.week === 4 ? [{ t: '入睡', s: '季末夢', on: () => dream(true) }]
    : G.week === 2 ? [{ t: '入睡', s: '今晚會作夢', on: () => dream(false) }]
      : [{ t: '下一週', s: '先過三週的日常', on: () => montage(() => nextWeek('')) }];
  view({ mode: 'day', mood: namiMood(), sky: 3, title: '週末', text: m, choices: next });
}

function nextWeek(wake) {
  G.week++;
  G.day = 1;
  G.done = [];
  G.offLive = false;
  startLocks();
  // 中間兩個關鍵週由事件插入。原型只做「撐不住」：這一週開始時壓力撐不住（docs/03 2.16）
  G.crisis = (G.week === 2 || G.week === 3) && (stage() === 2 || G.morning.startsWith('灰色') || G.lastGrey >= 2);
  if (G.crisis) { G.skip = 4; G.stat.crisis++; }
  let gone = 0;
  for (const row of G.plan) row.forEach((a, i) => { if (a && a.startsWith('skill:') && G.r[a.slice(6)].st !== 1) { row[i] = null; gone++; } });
  const m = `新的一週。${wake}` + (G.crisis ? '\n【撐不住的一週】週一她整天起不來。這週可以選擇休播。' : G.morning.startsWith('灰色') ? '\n' + G.morning : '') +
    `\n上週的行程先留著，可以直接改。${gone ? `已經練不上去的 ${gone} 格先拿掉了。` : ''}`;
  G.morning = '';
  weekEvent(t => plan((t ? t + '\n' : '') + m));
}

function dream(final) {
  const perfect = G.cut + (G.held || 0) > G.kept;
  const t = final
    ? (perfect ? '「最近的回放，都很好。」\n理想中的薰草看起來很滿意。她的話越來越少。' : '「妳留下了那些片段。」\n她看著妳。「那是我嗎？」')
    : (stage() ? '「妳看起來很累。」\n「可是草民在等。」' : '「昨天那一場，可以更好。」');
  const ans = (a, d, wake) => () => { G.dream.push(a); addStress(d); final ? seasonEnd() : montage(() => nextWeek(wake)); };
  // 說不出口的選項照樣列出來，但劃掉（docs/03 2.14）
  const feel = sayable(0);
  const c = [
    { t: '照理想做', s: '「我會做得更好。」', on: ans('照理想做', 1, '醒來之後，肩膀有點緊。（壓力上升）') },
    { t: '說出感受', s: feel ? '「我有點累。」' : '「我有點累。」——還說不出口', off: !feel, x: !feel, on: ans('說出感受', -2, '醒來之後，胸口鬆了一點。（壓力下降）') },
    { t: '沉默', s: '……', on: ans('沉默', 0, '') }];
  if (final && !perfect) {
    const me = sayable(2);
    c.splice(2, 0, { t: '「那也是我。」', s: me ? '承認那些片段' : '還說不出口', off: !me, x: !me, on: ans('那也是我', -2, '') });
  }
  view({ mode: 'dream', title: final ? '季末夢' : '短夢', text: t, choices: c });
}

// 季末：有期末就考，最後一季走結局，其他季進下一季（docs/03 2.20）
function seasonEnd() {
  if (hasExam()) return exam();
  afterExam();
}

function exam() {
  const p = passRate();
  const name = G.seasons === 1 || G.season === 2 ? '上學期期末' : '年底期末（畢業結算）';
  view({ mode: 'day', mood: namiMood(), sky: 0, title: name, text: `期末考。\n這學期的學習度 ${G.study}%，合格機率約 ${p}%。`, choices: [
    { i: 'class', t: '進考場', s: `合格機率 ${p}%`, on: () => {
      G.exam = Math.random() * 100 < p;
      G.examLog.push(`${name}${G.exam ? '合格' : '沒過'}`);
      afterExam(); } }] });
}

function afterExam() {
  if (G.season === 4 && G.seasons > 1) return yearEndCall(G.seasons > 4 ? seasonSummary : lastWords);
  if (G.season < G.seasons) return seasonSummary();
  lastWords();
}

function seasonSummary() {
  G.treeLog = (G.treeLog || []).concat([Object.keys(ROUTES).map(k => G.r[k].st).join('')]); // 分析用：每季結束時的技能樹
  const skills = Object.keys(ROUTES).map(k => `${ROUTES[k].n} ${ST[G.r[k].st]}`).join('　');
  const ex = hasExam() ? `\n${G.examLog[G.examLog.length - 1]}。${G.exam ? (G.season === 4 ? '她畢業了。' : '') : G.season === 4 ? '延畢了。第二年第一季要重修，心力上限少 1 格。' : '下學期頭兩週要補考，佔掉週二、週四的上午。'}` : '';
  view({ mode: 'day', mood: namiMood(), sky: 3, title: `${seasonLabel(G).trim()}結束`,
    text: `${seasonLabel(G)}結束了。${ex}\n${skills}\n留下 ${G.kept} 段，剪掉 ${G.cut} 段。笑聲：${LAUGH[laughOf(G.kept)]}。手上 ${nt(G.money)}。`,
    choices: [{ i: 'live', t: '下一季', s: '先選季初方針', on: nextSeason }] });
}

function nextSeason() {
  if (hasExam() && G.season < 4) { if (!G.exam) G.makeup = 2; G.study = 0; } // 新學期，學習度重新算（6.10 的 6f）
  const wasRetake = G.retake;
  G.retake = false;
  G.season++;
  // 延畢：第二年第一季整季重修，心力上限少 1 格（docs/03 2.6 的 DEBUFF A）
  if (G.season === 5 && G.retakePending) { G.retake = true; G.retakePending = false; G.heart = Math.min(G.heart, 4); }
  G.week = 1;
  G.day = 1;
  G.done = [];
  G.offLive = false;
  G.crisis = false;
  G.exam = null;
  G.called = false;
  if (G.season <= 4) G.money += PAY.allowance;
  startLocks();
  for (const row of G.plan) row.forEach((a, i) => { if (a && a.startsWith('skill:') && G.r[a.slice(6)].st !== 1) row[i] = null; });
  const name = ['秋', '冬', '春', '夏'][(G.season - 1) % 4];
  const intro = `${seasonLabel(G)}（${name}）。` + (G.season <= 4 ? `家裡的生活費 ${nt(PAY.allowance)} 入帳了。` : '') + (G.season === 3 ? '\n下學期開始了。' : '') +
    (G.season === 5 ? `\n${G.retake ? '延畢了。這一季每週二、週四的上午和下午要重修，心力上限少 1 格。' : '畢業了。'}家裡的生活費停了，每週開銷加上房租變成 ${nt(living())}。` : '') +
    (wasRetake ? '\n重修結束，延後畢業了。心力上限回來了。' : '') +
    (G.season === 9 ? '\n第三年了。' : '') + (G.season === 12 ? '\n第三年的最後一季。第 4 週是最後一場直播。' : '') +
    (G.makeup ? '\n這兩週的週二、週四上午要補考。' : '');
  policy(() => weekEvent(t => plan((t ? t + '\n' : '') + intro)));
}

// 第一年的最後：畢業結算之後，家裡打來（docs/03 2.20）
function yearEndCall(then) {
  const pass = G.exam;
  if (!pass) { addStress(2); G.retakePending = true; }
  const q = pass ? '「畢業了！太好了。那工作找得怎麼樣？家裡的生活費就給到這個月喔。」'
    : '「延畢？……那要再兩個月。生活費我們沒辦法再給了。」（壓力上升）';
  const more = G.resume ? [{ i: 'prep', t: '「我有在準備了。」', s: '壓力 −1（和同學寫過履歷）', fx: () => addStress(-1), after: '「那就好，有需要再說。」這句話是真的，只是不完整。' }] : [];
  familyCall(q, () => then(), more);
}

// 理想中的薰草的方向：夢裡最常選的回答，平手看最後一場（docs/03 2.19）
function direction() {
  if (G.forceDir) return G.forceDir; // 剪掉的資料夾全部刪掉的話，方向定為「標準」（2.19）
  const n = { 標準: 0, 和解: 0, 告別: 0 };
  const of = a => (a === '照理想做' ? '標準' : a === '沉默' ? '告別' : '和解');
  G.dream.forEach(a => n[of(a)]++);
  const top = Math.max(...Object.values(n));
  const tied = Object.keys(n).filter(k => n[k] === top);
  return tied.length === 1 ? tied[0] : of(G.dream[G.dream.length - 1] || '沉默');
}

// 最後一場直播說的那句話決定結局。完整版在第三年最後一季；原型放在第一季的結算前試規則（docs/03 2.19）
function lastWords() {
  const dir = direction();
  const main = mainRoute();
  const lv = voiceLv();
  const savings = G.money >= living() * 3;
  const opt = (t, depth, end, extra, why) => {
    const ok = lv >= depth && extra !== false;
    return { i: 'chat', t, off: !ok, x: !ok, s: ok ? `→ ${end}（深度 ${depth}）` : extra === false ? why : `還說不出口（深度 ${depth}，現在 ${lv}）`,
      on: () => { G.end = end; G.endLine = t; ending(); } };
  };
  const c = [
    opt('「我會繼續，用我自己的方式。」', 2 + (dir === '標準' ? 1 : dir === '和解' ? -1 : 0), '調整後繼續'),
    opt('「謝謝大家，薰草就到這裡。」', 0, '完成階段並結束活動', G.r[main].st >= 2, `${ROUTES[main].n}（主要路線）還沒到 ②`),
    opt('「我想休息一陣子。」', 0, '暫停後再規劃'),
    { i: 'quiet', t: '照常收播，什麼都沒說', s: '→ 暫停後再規劃（沒有說明的版本）', on: () => { G.end = '暫停後再規劃'; G.endLine = ''; ending(); } }];
  G.savings = savings;
  view({ mode: 'day', mood: namiMood(), sky: 3, title: G.seasons > 4 ? '最後一場的那句話' : '試玩：最後一場的那句話',
    text: (G.seasons > 4 ? '第三年的最後一場直播。\n' : `（完整版裡，這是第三年最後一場直播。原型在${G.seasons > 1 ? '第一年' : '這一季'}結束時試結局的規則。）\n`) + `收播前，聊天室還在動。她想說點什麼。\n\n理想中的薰草的方向：${dir}。主要路線：${ROUTES[main].n}（${ST[G.r[main].st]}）。\n笑聲：${LAUGH[laughOf(G.kept)]}，壓力：${STRESS[stage()]}，說得出口的程度 ${lv}。存款：${nt(G.money)}${savings ? '（夠撐三個月）' : '（撐不到三個月）'}。`,
    choices: c });
}

function ending() {
  const laugh = LAUGH[laughOf(G.kept)];
  const skills = Object.keys(ROUTES).map(k => `${ROUTES[k].n} ${ST[G.r[k].st]}`).join('　');
  const goals = [2, 3, 4].filter(n => Object.keys(G.r).some(k => G.r[k].st >= n)).length + (G.exam ? 1 : 0);
  clearSave();
  const year = G.seasons > 1;
  // 一年的紀錄很長，同樣的項目改成計數
  const tally = arr => { const n = {}; arr.forEach(x => { n[x] = (n[x] || 0) + 1; }); return Object.keys(n).map(k => (n[k] > 1 ? `${k} ×${n[k]}` : k)).join('、'); };
  const policyLog = tally(G.focusLog.map(([f, l]) => `專心${ROUTES[f].n}、放下${LETGO[l]}`));
  const t = (G.seasons > 4 ? `三年結束了。${G.examLog.includes('年底期末（畢業結算）合格') ? '她準時畢業。' : '她延畢過一季。'}手上還有 ${nt(G.money)}。${G.told ? '家裡知道她在直播了。' : ''}\n`
    : year ? `第一年結束了。${G.exam ? '她畢業了。' : '她延畢了，第二年開頭要重修兩個月。'}手上還有 ${nt(G.money)}。\n`
    : `這一季結束了。四個目標達成 ${goals} 個，手上還有 ${nt(G.money)}。\n`) +
    `${skills}\n留下 ${G.kept} 段，剪掉 ${G.cut} 段。笑聲：${laugh}。\n` +
    (year ? `期末：${G.examLog.join('、')}。\n` : `期末：${G.exam ? '合格。' : '沒過。下學期有幾週要被補考佔掉。'}\n`) +
    `夢裡的回答：${tally(G.dream)}。\n` +
    `方針紀錄：${policyLog}。蒙太奇：${tally(G.montage) || '（沒有）'}。\n` +
    `收藏冊 ${G.kept} 段，剪掉的資料夾 ${G.cut} 段。她認得你：${FAME[fameOf(G.fame)]}。\n` +
    (G.end ? `結局${G.seasons > 4 ? '' : '（試玩）'}：${G.end}${G.endLine ? '。她說：' + G.endLine : '。她什麼都沒說，照常收播。'}${G.end === '暫停後再規劃' ? (G.savings ? '存款夠，這是有計畫的休息。' : '存款不夠，她回去多排班，頻道先放著。') : ''}\n` : '') +
    (G.cut + (G.held || 0) > G.kept ? '回放裡的薰草一直很完美。' : G.kept ? '有幾段笑聲留在了頻道上。' : `這一${year ? '年' : '季'}沒有特別的片段。`) +
    '\n留下或剪掉，都沒有標準答案。';
  if (AUTO) document.title = 'AUTO-DONE';
  view({ mode: 'day', mood: G.kept ? 'laugh' : 'normal', sky: 0, title: G.seasons > 4 ? '三年　結算' : year ? '第一年　結算' : '第一季　結算', text: t, choices: [{ t: '再玩一次', on: title }] });
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
