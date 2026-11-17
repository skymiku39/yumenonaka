// 操作測試的腳本。每個 SCRIPTS.xxx 會照順序點畫面上的按鈕，最後把畫面文字和狀態印在測試頁下方。
// 前半是「照目標玩」的玩家停在各個畫面，後半是幾種不同的玩法各玩完一季。
const WEEK = [
  ['練習歌回', [[1, 0], [1, 1]]],
  ['大四研習', [[2, 0], [2, 1], [4, 0], [4, 1]]],
  ['上班', [[3, 0]]],
  ['找靈感', [[1, 2], [3, 2], [5, 3]]],
  ['準備直播', [[2, 2], [4, 2]]],
  ['練習雜談', [[5, 0], [5, 1], [7, 0]]],
  ['在家休息', [[1, 3], [2, 3], [3, 3], [4, 3], [5, 2], [6, 0], [6, 1], [7, 1], [7, 3]]],
];
// 分析用：一季下來的統計
const stats = () => f.contentWindow.eval('JSON.stringify({stat:G.stat,fame:G.fame,subs:G.subs,kept:G.kept,cut:G.cut,money:G.money,stress:G.stress,study:G.study,exam:G.exam,end:G.end,dir:direction(),season:G.season,tree:G.treeLog,exams:G.examLog,main:mainRoute(),promise:G.promise,r:Object.keys(G.r).map(k=>k+G.r[k].st).join(" ")})');
const has = t => btns().some(b => !b.disabled && b.textContent.includes(t));
// 季初方針：專心第一個能選的路線，放下指定的事
async function policy(letgo, focus) {
  const all = btns().filter(b => !b.disabled && b.textContent.startsWith('專心：'));
  const b = all.find(b => b.textContent.startsWith('專心：' + (focus || '歌回'))) || all[0];
  if (b) { b.click(); await sleep(30); }
  await click(letgo || '放下：練習');
  // 第 1 週的事件：店長問能不能代班。照目標玩的人拒絕，說不出口時只好答應
  if (has('「這週不太方便……」')) await click('「這週不太方便……」'); else if (has('「好，沒問題。」')) await click('「好，沒問題。」');
}
async function begin(letgo) {
  await click('開始');
  await click('歌回');
  await policy(letgo);
}
async function setup() {
  await click('歌回'); // ① 直播內容
  await fill(WEEK);
}
// 一直往前玩，直到 stop() 成立或一季結束
async function advance(stop, max = 400) {
  let lastWeek = 0;
  for (let i = 0; i < max; i++) {
    if (stop && stop()) return true;
    const mode = d.body.className;
    if (mode === 'plan') {
      const w = f.contentWindow.eval('G.week'), day = f.contentWindow.eval('G.day');
      if (w !== lastWeek && day === 1) {
        lastWeek = w;
        if (w === 1) await setup();
        else {
          if (has('歌回')) await click('歌回'); if (has('做成季末大企劃')) await click('做成季末大企劃');
        }
      }
      const go = btns().find(b => b.dataset.i === '0');
      go.click(); await sleep(30); continue;
    }
    const order = ['再玩一次', '開播', '繼續 ▶', '照實說也沒關係', '笑死，好可愛', '準時下播', '早點睡', '直接睡', '留下', '照行程過完今天', '睡覺，過下一天', '睡覺', '下一週', '知道了', '多練習', '「最近有點累。」', '「都很好啊。」', '入睡', '「那也是我。」', '說出感受', '照理想做', '進考場', '「我會繼續', '「謝謝大家', '「我想休息', '照常收播', '看結算'];
    if (has('再玩一次')) return false;
    let done = false;
    for (const t of order) if (has(t)) { await click(t); done = true; break; }
    if (!done) {
      // 直播中沒有對應留言時，選第一句留言
      const b = btns().find(b => !b.disabled && b.dataset.i === '0');
      if (!b) { out('STUCK: ' + btns().map(b => b.textContent).join(' / ')); return false; }
      b.click(); await sleep(30);
    }
  }
  out('MAX STEPS');
  return false;
}
SCRIPTS.plan1 = async () => { await begin(); await setup(); out(state()); };
SCRIPTS.day1mid = async () => { await begin(); await setup(); await click('開始這一週'); await sleep(1500); };
SCRIPTS.day1 = async () => { await begin(); await setup(); await click('開始這一週'); await sleep(5000); out(text()); };
SCRIPTS.stream = async () => { await begin(); await advance(() => d.body.className === 'night' && has('沉默')); out(text()); };
SCRIPTS.stream2 = async () => { await begin(); await advance(() => d.body.className === 'night' && has('沉默')); await click('照實說'); out(text()); };
SCRIPTS.extend = async () => { await begin(); await advance(() => has('準時下播')); };
SCRIPTS.offair = async () => { await begin(); await advance(() => has('早點睡')); out(text()); };
SCRIPTS.review = async () => { await begin(); await advance(() => has('剪掉')); out(text()); };
SCRIPTS.review2 = async () => { await begin(); await advance(() => has('照行程過完今天')); out(text()); };
SCRIPTS.weekend = async () => { await begin(); await advance(() => has('下一週')); out(text()); };
SCRIPTS.plan2 = async () => { await begin(); await advance(() => d.body.className === 'plan' && f.contentWindow.eval('G.week') === 2); out(state()); };
SCRIPTS.dream = async () => { await begin(); await advance(() => d.body.className === 'dream'); out(text()); };
SCRIPTS.story = async () => { await begin(); await advance(() => (d.querySelector('.menu h3') || {}).textContent.startsWith('劇情')); out(text()); };
SCRIPTS.plan4 = async () => { await begin(); await advance(() => d.body.className === 'plan' && f.contentWindow.eval('G.week') === 4); out(state()); };
SCRIPTS.exam = async () => { await begin(); await advance(() => has('進考場')); out(text()); };
SCRIPTS.tree = async () => { await begin(); await advance(() => d.body.className === 'plan' && f.contentWindow.eval('G.week') === 3); await click('看整棵樹'); };
SCRIPTS.full = async () => { await begin(); await advance(null, 1500); out(stats()); };
SCRIPTS.mini = async () => { await begin(); await setup(); await click('開始這一週'); await sleep(200); await click('找靈感小遊戲'); await click('開始'); await sleep(1500); };
SCRIPTS.save = async () => {
  f.contentWindow.localStorage.clear();
  await begin(); await setup(); await click('開始這一週'); await click('睡覺，明早改行程'); if (has('繼續 ▶')) await click('繼續 ▶');
  const before = state(); out('before ' + before);
  await new Promise(r => { f.onload = r; f.contentWindow.location.reload(); });
  d = f.contentDocument; await sleep(200);
  out('title buttons: ' + btns().map(b => b.textContent).join(' / '));
  await click('繼續上次');
  out('same state: ' + (state() === before) + ' | body.' + d.body.className);
  await click('從週二繼續'); await sleep(100); out(text());
  f.contentWindow.localStorage.clear();
};
SCRIPTS.save2 = async () => {
  f.contentWindow.localStorage.clear();
  await begin(); await setup();
  const filled = f.contentWindow.eval('JSON.stringify(G.plan)');
  await new Promise(r => { f.onload = r; f.contentWindow.location.reload(); });
  d = f.contentDocument; await sleep(200);
  await click('繼續上次');
  out('plan kept: ' + (f.contentWindow.eval('JSON.stringify(G.plan)') === filled) + ' show=' + f.contentWindow.eval('G.show'));
  f.contentWindow.localStorage.clear();
};
SCRIPTS.fillday = async () => {
  await begin(); await click('上班'); d.querySelector('.dh[data-d="3"]').click(); await sleep(20);
  await click('大四研習'); d.querySelector('.dh[data-d="2"]').click(); await sleep(20);
  d.querySelector('.dh[data-d="5"]').click(); await sleep(20);
  out(f.contentWindow.eval('JSON.stringify(G.plan.slice(1,5))') + ' note=' + text());
};

// ---- 不同玩法 ----
const BASE = ['再玩一次', '開播', '繼續 ▶'];
const TAIL = ['看結算', '下一季', '報名', '「好，我試試看。」', '「……好的。」', '留下其中一段', '「我在做自己的事。」', '「我想先把自己的事做好。」', '「恭喜！」', '「其實我有在直播。」', '「這週有事，下次！」', '算了', '關掉資料夾', '「好啊！」', '「好的。」', '「這週真的排不出來。」', '「好。」', '「好，一起。」', '「我有在準備了。」', '「我有在做自己的事。」', '「恭喜！我還在找。」', '這週就播', '知道了', '照行程過完今天', '睡覺，過下一天', '睡覺', '下一週', '多休息', '「最近有點累。」', '「都很好啊。」', '入睡', '進考場', '「我會繼續', '「謝謝大家', '「我想休息', '照常收播', '沉默', '照理想做'];
async function play(o) {
  await click(o.three ? '三年' : o.year ? '第一年' : '開始'); await click(o.skill || '歌回'); await policy(o.letgo, o.skill);
  let lastWeek = 0;
  for (let i = 0; i < (o.three ? 30000 : o.year ? 8000 : 2000); i++) {
    if (has('再玩一次')) break;
    // 第一年模式：每季開頭都要選方針
    if (btns().some(b => b.textContent.startsWith('專心：'))) { const sn = f.contentWindow.eval('G.season'); await policy(o.letgo, (o.foci && o.foci[sn - 1]) || o.skill); continue; }
    if (d.body.className === 'plan') {
      // 用整年的週數，第 1 季第 1 週才是 1
      const w = f.contentWindow.eval('(G.season - 1) * 4 + G.week'), day = f.contentWindow.eval('G.day');
      if (w !== lastWeek && day === 1) { lastWeek = w; if (o.week) await o.week(w); }
      btns().find(b => b.dataset.i === '0').click(); await sleep(30); continue;
    }
    let done = false;
    for (const t of BASE.concat(o.order, [o.montage || '多休息'], TAIL)) if (has(t)) { await click(t); done = true; break; }
    if (!done) { out('STUCK: ' + btns().map(b => b.textContent).join(' / ')); break; }
  }
  out(stats());
}
const ALLDAYS = [1, 2, 3, 4, 5, 6, 7];
async function fillAll(name) { await click(name); for (const dd of ALLDAYS) { d.querySelector(`.dh[data-d="${dd}"]`).click(); await sleep(15); } }
// 完美主義：要她維持人設，有片段就剪掉
SCRIPTS.perfect = () => play({ order: ['想聽精靈的回答', '這不是薰草', '可以更好吧', '準時下播', '剪輯精華', '早點睡', '剪掉', '照理想做'],
  week: async w => { if (w === 1) await setup(); else if (has('歌回')) await click('歌回'); } });
// 什麼都不排
SCRIPTS.lazy = () => play({ order: ['沉默', '準時下播', '早點睡', '剪掉', '沉默'] });
// 不休息，只上班和練習
SCRIPTS.overwork = () => play({ letgo: '放下：研習', order: ['打賞（小）', '加長直播', '準時下播', '直接睡', '經營社群', '留下', '照理想做'],
  week: async w => { if (w === 1) { await fillAll('上班'); await fillAll('練習雜談'); await fillAll('準備直播'); } } });
// 每段都給大額 SC
SCRIPTS.tipper = () => play({ order: ['打賞（大）', '準時下播', '早點睡', '留下', '說出感受'], week: async w => { if (w === 1) await setup(); } });
// 一直許願，其餘沉默；整週看電影
SCRIPTS.wish = () => play({ skill: '雜談', order: ['許願', '沉默', '加長直播', '準時下播', '直接睡', '早點睡', '留下', '沉默'],
  week: async w => { if (w === 1) await fillAll('看電影'); } });
// 只靠吃好料過日子，看錢花光會怎樣
SCRIPTS.spender = () => play({ order: ['沉默', '準時下播', '早點睡', '剪掉', '沉默'], week: async w => { if (w === 1) await fillAll('吃點好的'); } });

// 照目標排行程，但每段都接住她、回看全部剪掉
SCRIPTS.cutter = () => play({ letgo: '放下：研習', order: ['照實說也沒關係', '笑死，好可愛', '這段好好聽', '準時下播', '剪輯精華', '早點睡', '剪掉', '說出感受', '照理想做'],
  montage: '多直播', week: async w => { if (w === 1) await setup(); else if (has('歌回')) await click('歌回'); } });
// 照目標排行程，每段都接住她、全部留下；蒙太奇都休息
SCRIPTS.carer = () => play({ order: ['照實說也沒關係', '笑死，好可愛', '這段好好聽', '準時下播', '早點睡', '留下', '「那也是我。」', '說出感受', '照理想做'],
  week: async w => { if (w === 1) await setup(); else { if (has('歌回')) await click('歌回'); if (has('做成季末大企劃')) await click('做成季末大企劃'); } } });
// 同上，但放下研習、蒙太奇都練習（看壓力撐不撐得住）
SCRIPTS.grinder = () => play({ letgo: '放下：研習', montage: '多練習', order: ['照實說也沒關係', '笑死，好可愛', '這段好好聽', '準時下播', '早點睡', '留下', '「那也是我。」', '說出感受', '照理想做'],
  week: async w => { if (w === 1) { await fillAll('練習歌回'); await click('歌回'); } else { if (has('歌回')) await click('歌回'); if (has('做成季末大企劃')) await click('做成季末大企劃'); } } });
// 只顧生活：每天上班與休息，直播全部沉默
SCRIPTS.worker = () => play({ letgo: '放下：練習', montage: '多工作', order: ['沉默', '準時下播', '早點睡', '剪掉', '沉默'],
  week: async w => { if (w === 1) { await fillAll('在家休息'); await click('上班'); for (const dd of [1, 2, 3, 4, 5]) await cell(dd, 0); } } });

// 同 cutter，但最後一場選「謝謝大家」：剪掉的玩家也要能完成階段並結束活動（docs/03 2.8、2.19）
SCRIPTS.curtain = () => play({ letgo: '放下：研習', order: ['照實說也沒關係', '笑死，好可愛', '這段好好聽', '準時下播', '剪輯精華', '早點睡', '剪掉', '說出感受', '照理想做', '「謝謝大家'],
  montage: '多直播', week: async w => { if (w === 1) await setup(); else if (has('歌回')) await click('歌回'); } });

// ---- 第一年（四季） ----
const KEEPER = ['照實說也沒關係', '笑死，好可愛', '這段好好', '這波操作', '聲音好舒服', '準時下播', '早點睡', '留下', '「那也是我。」', '說出感受', '照理想做'];
const BIGWEEK = async w => { if (w === 1) await setup(); else { if (has('歌回')) await click('歌回'); if (has('做成季末大企劃')) await click('做成季末大企劃'); } };
SCRIPTS.yfull = () => play({ year: true, order: KEEPER, week: BIGWEEK });
// 同上，但每季換一條專心的路線，直播內容也跟著換
const ROTATE = async w => {
  if (w === 1) return setup();
  const k = f.contentWindow.eval('G.focus'); const n = f.contentWindow.eval('ROUTES[G.focus].n');
  if (has(n)) await click(n);
  if (f.contentWindow.eval('G.r[G.focus].st') === 1) { await click('練習' + n); for (const dd of [1, 5]) { if (!f.contentWindow.eval(`G.plan[${dd - 1}][0] === "skill:${k}"`)) await cell(dd, 0); } }
  if (has('做成季末大企劃')) await click('做成季末大企劃'); };
SCRIPTS.yrotate = () => play({ year: true, foci: ['歌回', '雜談', '遊戲', '聲音'], order: KEEPER, week: ROTATE });
SCRIPTS.ycutter = () => play({ year: true, letgo: '放下：研習', montage: '多直播', order: ['照實說也沒關係', '笑死，好可愛', '這段好好', '準時下播', '剪輯精華', '早點睡', '剪掉', '說出感受', '照理想做'], week: BIGWEEK });
SCRIPTS.ylazy = () => play({ year: true, order: ['沉默', '準時下播', '早點睡', '剪掉', '沉默'] });
SCRIPTS.yoverwork = () => play({ year: true, letgo: '放下：研習', order: ['打賞（小）', '加長直播', '準時下播', '直接睡', '經營社群', '留下', '照理想做'],
  week: async w => { if (w === 1) { await fillAll('上班'); await fillAll('練習雜談'); await fillAll('準備直播'); } } });
SCRIPTS.ywish = () => play({ year: true, skill: '雜談', order: ['許願', '沉默', '準時下播', '早點睡', '留下', '沉默'], week: async w => { if (w === 1) await fillAll('在家休息'); } });

// ---- 三年（十二季） ----
SCRIPTS.zfull = () => play({ three: true, foci: ['歌回', '雜談', '遊戲', '聲音', '歌回', '雜談', '遊戲', '聲音', '歌回', '雜談', '遊戲', '聲音'], order: KEEPER, week: ROTATE });
SCRIPTS.zcutter = () => play({ three: true, letgo: '放下：練習', montage: '多直播', order: ['照實說也沒關係', '笑死，好可愛', '這段好好', '準時下播', '剪輯精華', '早點睡', '剪掉', '說出感受', '照理想做'], week: BIGWEEK });
SCRIPTS.zlazy = () => play({ three: true, order: ['沉默', '準時下播', '早點睡', '剪掉', '沉默'] });

// ---- 針對特定規則的檢查 ----
// 先在 ① 留下兩段，回看日當天才練到 ②：應該當天就升到 ③
SCRIPTS.late3 = async () => {
  await begin(); await click('歌回');
  await fill([['練習歌回', [[7, 0], [7, 1]]], ['找靈感', [[1, 0]]]]);
  await advance(() => has('下一週'), 200);
  out('歌回應該是 ③：' + f.contentWindow.eval('JSON.stringify(G.r.sing)'));
};
// 壓力撐不住的隔天排了上午的班：應該顯示「沒趕上」，不是空格
SCRIPTS.grey = async () => {
  await begin();
  await fill([['上班', [[2, 0]]]]);
  f.contentWindow.eval('G.stress = 9');
  await click('開始這一週'); await click('睡覺，明早改行程');
  out(text());
  const c = d.querySelector('.cell[data-d="2"][data-s="1"]');
  out('週二下午的格子：' + c.textContent);
};
// 小遊戲進行中按數字鍵不應該有反應，也不應該出錯
SCRIPTS.minikeys = async () => {
  await begin(); await fill([['找靈感', [[1, 0]]]]);
  await click('開始這一週'); await sleep(100); await click('找靈感小遊戲'); await click('開始'); await sleep(500);
  for (const k of ['1', '2', '1']) { d.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })); await sleep(300); }
  out('小遊戲中 body.' + d.body.className);
  await sleep(9000);
  out('結束後 body.' + d.body.className + '　' + text().split('\n').pop());
};
// 第 1 週結束時壓力撐不住：第 2 週應該是「撐不住的一週」，週一整天起不來，可以休播
SCRIPTS.crisis = async () => {
  await begin(); await advance(() => has('下一週'));
  f.contentWindow.eval('G.stress = 9'); await click('下一週'); await click('多工作'); await click('繼續 ▶'); await click('知道了');
  out(text()); out('crisis=' + f.contentWindow.eval('G.crisis') + ' 週一：' + d.querySelector('.cell[data-d="1"][data-s="0"]').textContent);
  d.querySelector('[data-act="off"]').click(); await sleep(30);
  out('休播=' + f.contentWindow.eval('G.offLive') + '　' + d.querySelector('.onair').textContent);
  await advance(() => has('休播，早點休息')); await click('休播，早點休息'); out(text());
};
// 緊繃時第一次接住會接不住，第二次才接得住；撐不住時接不住
SCRIPTS.catch = async () => {
  await begin(); await advance(() => d.body.className === 'night' && has('沉默'));
  f.contentWindow.eval('G.stress = 6; G.cur.m = { type: "slip", text: "唱錯了。" }; turn()'); out('緊繃的小字：' + btns()[0].textContent);
  await click('笑死，好可愛'); out('第一次：' + text() + ' 片段=' + f.contentWindow.eval('G.cur.clips.length'));
  f.contentWindow.eval('G.cur.m = { type: "slip", text: "又唱錯了。" }; turn()'); await click('笑死，好可愛');
  out('第二次：' + text() + ' 片段=' + f.contentWindow.eval('G.cur.clips.length'));
  f.contentWindow.eval('G.stress = 9; G.cur.m = { type: "slip", text: "破音了。" }; turn()'); out('撐不住的小字：' + btns()[0].textContent);
  await click('笑死，好可愛'); out('撐不住：' + text() + ' 片段=' + f.contentWindow.eval('G.cur.clips.length') + ' 壓力=' + f.contentWindow.eval('G.stress'));
};
// 家人電話：沒有留下過片段時，「最近有點累」和「其實我有在直播」都被劃掉
SCRIPTS.call = async () => {
  await begin(); await advance(() => d.body.className === 'day' && (d.querySelector('.menu h3') || {}).textContent === '家裡打來的電話');
  f.contentWindow.eval('G.kept = 0; G.stress = 2; familyCall(t => plan(t))');
  out(btns().map(b => (b.classList.contains('struck') ? '[劃掉]' : '') + b.textContent).join(' / '));
};
// 設備：買了麥克風之後錢變少、之後每場品質 +1
SCRIPTS.gear = async () => {
  await begin(); f.contentWindow.eval('G.money = 5000; plan("")'); await click('買新麥克風');
  out(text() + ' money=' + f.contentWindow.eval('G.money') + ' gear=' + f.contentWindow.eval('JSON.stringify(G.gear)'));
};
// 結算畫面的「複製這局的紀錄」：要有結算、統計、每週一行
SCRIPTS.copylog = async () => {
  await begin(); await advance(() => has('複製這局的紀錄'), 1500); await click('複製這局的紀錄'); await sleep(100);
  const t = text(); const ls = t.split(String.fromCharCode(10));
  out(ls.slice(0, 3).join(' / ')); out('每週行數：' + ls.filter(l => /第 \d 週：/.test(l)).length);
};
// 尾聲：結局之後的四張卡，依序印出來
const epi = async () => {
  for (let k = 0; k < 4; k++) {
    const h = (d.querySelector('.menu h3') || {}).textContent;
    out(h + '｜' + text().split(String.fromCharCode(10)).join(' / '));
    await click(k < 3 ? '繼續 ▶' : '看結算');
  }
};
const atEpi = () => ((d.querySelector('.menu h3') || {}).textContent || '').startsWith('尾聲');
SCRIPTS.epilogue = async () => { await begin(); await advance(atEpi, 1500); await epi(); };
SCRIPTS.epicut = async () => { await begin(); f.contentWindow.eval('void 0'); await advance(() => has('剪掉') || atEpi(), 1500);
  while (!atEpi()) { if (has('剪掉')) await click('剪掉'); else await advance(() => has('剪掉') || atEpi(), 1500); }
  await epi(); };
// 混合企劃：兩條路線到 ② 才能勾；這場的片段留下時兩條都算
SCRIPTS.mix = async () => {
  await begin(); f.contentWindow.eval('G.r.talk.st = 2; G.r.sing.st = 2; plan("")');
  await click('歌回'); await click('做成混合企劃'); out(text()); await click('開始這一週');
  await advance(() => d.body.className === 'night' && has('沉默')); out('直播標題：' + d.querySelector('.top .when').textContent);
  await advance(() => has('剪掉')); out('留下的小字：' + btns()[0].textContent);
  const before = f.contentWindow.eval('G.r.talk.kept'); await click('留下'); out('雜談 kept：' + before + ' → ' + f.contentWindow.eval('G.r.talk.kept'));
};
SCRIPTS.title = async () => {};
SCRIPTS.howto = async () => { await click('怎麼玩'); };

// ---- 第 7 節還沒決定的選項（網址參數，test/run.py 的 EXTRA 會自動帶上）----
// q1：照顧得好的玩家，第 3 週也會緊繃到直播
SCRIPTS.weigh = async () => {
  await SCRIPTS.carer();
  const s = JSON.parse(stats());
  out(s.stat.q1 >= 1 && s.stat.peak >= 5 ? `OK 主線大事壓在心上 ${s.stat.q1} 次，最高壓力 ${s.stat.peak}，接不住 ${s.stat.near}` : 'ERR q1 沒有作用：' + JSON.stringify(s.stat));
};
// tight：一直剪掉、主要路線停在 ② 的玩家，一季拿不到謝幕
SCRIPTS.tightend = async () => {
  await SCRIPTS.cutter();
  const end = f.contentWindow.eval('G.end');
  out(end !== '完成階段並結束活動' ? 'OK 謝幕收緊，結局：' + end : 'ERR 謝幕沒有收緊');
};
// 剪掉的資料夾：沒留下過的玩家，「留下其中一段」預設說不出口（深度 1），q6 時說得出口（深度 0）
const digCheck = want => async () => {
  await begin();
  f.contentWindow.eval('G.cut = 6; G.kept = 0; G.stress = 2; digFolder(t => plan(t))');
  const ok = has('留下其中一段');
  out(ok === want ? `OK 留下其中一段：${ok ? '說得出口' : '說不出口'}` : `ERR 留下其中一段應該${want ? '說得出口' : '說不出口'}`);
  if (ok) { await click('留下其中一段'); out('收藏冊：' + f.contentWindow.eval('G.kept') + ' 段'); }
};
SCRIPTS.dig = digCheck(false);
SCRIPTS.q6dig = digCheck(true);
