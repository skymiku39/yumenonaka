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
const has = t => btns().some(b => !b.disabled && b.textContent.includes(t));
async function begin() {
  await click('開始');
  await click('歌回');
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
    const order = ['再玩一次', '開播', '繼續 ▶', '照實說也沒關係', '笑死，好可愛', '準時下播', '早點睡', '直接睡', '留下', '照行程過完今天', '睡覺，過下一天', '睡覺', '下一週', '入睡', '說出感受', '進考場'];
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
SCRIPTS.full = async () => { await begin(); await advance(null, 1500); out(text()); out(state()); };
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
const TAIL = ['照行程過完今天', '睡覺，過下一天', '睡覺', '下一週', '入睡', '進考場'];
async function play(o) {
  await click('開始'); await click(o.skill || '歌回');
  let lastWeek = 0;
  for (let i = 0; i < 2000; i++) {
    if (has('再玩一次')) break;
    if (d.body.className === 'plan') {
      const w = f.contentWindow.eval('G.week'), day = f.contentWindow.eval('G.day');
      if (w !== lastWeek && day === 1) { lastWeek = w; if (o.week) await o.week(w); }
      btns().find(b => b.dataset.i === '0').click(); await sleep(30); continue;
    }
    let done = false;
    for (const t of BASE.concat(o.order, TAIL)) if (has(t)) { await click(t); done = true; break; }
    if (!done) { out('STUCK: ' + btns().map(b => b.textContent).join(' / ')); break; }
  }
  out(text()); out(state());
}
const ALLDAYS = [1, 2, 3, 4, 5, 6, 7];
async function fillAll(name) { await click(name); for (const dd of ALLDAYS) { d.querySelector(`.dh[data-d="${dd}"]`).click(); await sleep(15); } }
// 完美主義：要她維持人設，有片段就剪掉
SCRIPTS.perfect = () => play({ order: ['想聽精靈的回答', '這不是薰草', '可以更好吧', '準時下播', '剪輯精華', '早點睡', '剪掉', '照理想做'],
  week: async w => { if (w === 1) await setup(); else if (has('歌回')) await click('歌回'); } });
// 什麼都不排
SCRIPTS.lazy = () => play({ order: ['沉默', '準時下播', '早點睡', '剪掉', '沉默'] });
// 不休息，只上班和練習
SCRIPTS.overwork = () => play({ order: ['打賞（小）', '加長直播', '準時下播', '直接睡', '經營社群', '留下', '照理想做'],
  week: async w => { if (w === 1) { await fillAll('上班'); await fillAll('練習雜談'); await fillAll('準備直播'); } } });
// 每段都給大額 SC
SCRIPTS.tipper = () => play({ order: ['打賞（大）', '準時下播', '早點睡', '留下', '說出感受'], week: async w => { if (w === 1) await setup(); } });
// 一直許願，其餘沉默；整週看電影
SCRIPTS.wish = () => play({ skill: '雜談', order: ['許願', '沉默', '加長直播', '準時下播', '直接睡', '早點睡', '留下', '沉默'],
  week: async w => { if (w === 1) await fillAll('看電影'); } });
// 只靠吃好料過日子，看錢花光會怎樣
SCRIPTS.spender = () => play({ order: ['沉默', '準時下播', '早點睡', '剪掉', '沉默'], week: async w => { if (w === 1) await fillAll('吃點好的'); } });

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
SCRIPTS.title = async () => {};
SCRIPTS.howto = async () => { await click('怎麼玩'); };
