/* =========================================================================
   app.js — 苺優駿 ICHIGO YUSHUN 2027
   ========================================================================= */
(function () {
'use strict';

var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
var RACE_AT = new Date('2027-05-22T12:00:00+09:00').getTime();

/* ---------------- 状態 ---------------- */
var S = load();
function load() {
  try { return JSON.parse(localStorage.getItem('iy2027') || '{}'); } catch (e) { return {}; }
}
function save() { try { localStorage.setItem('iy2027', JSON.stringify(S)); } catch (e) {} }
function line(id) { return LINES.filter(function (l) { return l.ln === id; })[0]; }

/* ---------------- 採点 ---------------- */
var JW = [
  { ratio: .40, firm: .10, heat: .40, wt: .10 },
  { ratio: .70, firm: .10, heat: .10, wt: .10 },
  { ratio: .05, firm: .70, heat: .10, wt: .15 },
  { ratio: .10, firm: .15, heat: .60, wt: .15 },
  { ratio: .30, firm: .25, heat: .25, wt: .20 }
];
var NRM = (function () {
  var cols = {};
  AXES.forEach(function (a) { cols[a.k] = LINES.map(a.f); });
  return LINES.map(function (l) {
    var o = {};
    AXES.forEach(function (a) { o[a.k] = norm(cols[a.k], a.f(l)); });
    return o;
  });
})();
function judgeScore(j, i) {
  var w = JW[j], n = NRM[i];
  return n.ratio * w.ratio + n.firm * w.firm + n.heat * w.heat + n.wt * w.wt;
}
function expertOf(i) {
  var s = 0; for (var j = 0; j < 5; j++) s += judgeScore(j, i);
  return s / 5;
}
var CLUB = (function () {
  var raw = LINES.map(function (l, i) { return Math.exp(expertOf(i) * 3.1) * (0.9 + Math.random() * 0.2); });
  var sum = raw.reduce(function (a, b) { return a + b; }, 0);
  return raw.map(function (v) { return v / sum; });
})();
function finalOf(i) {
  var cm = Math.max.apply(null, CLUB);
  return 0.7 * expertOf(i) + 0.3 * (CLUB[i] / cm);
}
var WINNER = (function () {
  var bi = 0; for (var i = 1; i < LINES.length; i++) if (finalOf(i) > finalOf(bi)) bi = i;
  return bi;
})();
function ranking() {
  return LINES.map(function (l, i) { return { i: i, v: finalOf(i) }; })
    .sort(function (a, b) { return b.v - a.v; });
}

/* ---------------- 画面まわり ---------------- */
var cur = '', hist = [];
var VIEWS = {};
var TABS = { paddock: 1, race: 2, stable: 3, about: 4 };

function go(name, push) {
  if (name === cur) return;
  var from = $('#v-' + cur), to = $('#v-' + name);
  if (from) { from.classList.add('out'); from.classList.remove('on'); setTimeout(function () { from.classList.remove('out'); }, 460); }
  if (push !== false && cur) hist.push(cur);
  cur = name;
  document.body.classList.toggle('hasback', !TABS[name] && hist.length > 0);
  document.body.classList.toggle('nofoot', name === 'intro');
  $$('#tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.go === name); });
  to.scrollTop = 0;
  VIEWS[name]();
  void to.offsetHeight;              // 先に組み直してから見せる（背景タブでも確実に出る）
  to.classList.add('on');
  setTimeout(stageNow, 24);
}
function back() { var p = hist.pop() || 'paddock'; go(p, false); }

/* いまの画面のステージに粒子を寄せる */
function stageNow() {
  var v = $('#v-' + cur), st = $('.stage', v);
  if (!st) { Field.hide(); return; }
  Field.apply(st.dataset.shape || 'dust', st, {
    dir: st.dataset.dir || 'radial',
    spread: st.dataset.spread ? +st.dataset.spread : undefined,
    pad: st.dataset.pad ? +st.dataset.pad : undefined
  });
}

function toast(t) {
  var el = $('#toast'); el.textContent = t; el.classList.add('on');
  clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('on'); }, 2200);
}
function meters(root) {
  setTimeout(function () {
    $$('.meter i', root).forEach(function (i) { i.style.width = i.dataset.w + '%'; });
  }, 40);
}
function countUp(el, to, dec, ms) {
  var t0 = performance.now(), from = 0;
  (function step(t) {
    var k = Math.min(1, (t - t0) / (ms || 900)), e = 1 - Math.pow(1 - k, 3);
    el.textContent = (from + (to - from) * e).toFixed(dec || 0);
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}

/* ---------------- 01 OPENING ---------------- */
VIEWS.intro = function () {
  var v = $('#v-intro');
  if (v._done) return; v._done = 1;
  v.innerHTML =
    '<div class="stage" data-shape="berry3" data-dir="radial" data-spread="46"></div>' +
    '<div class="pad fade">' +
      '<div class="en xl">ICHIGO<br>YUSHUN</div>' +
      '<div class="en xs" style="margin-top:18px;letter-spacing:.34em">苺　優　駿</div>' +
      '<p class="b" style="margin-top:24px">東京優駿と同じ日に、<br>いちごの日本一を決める。</p>' +
      '<div class="sec"><b>FIRST RUNNING</b><span>2027.05.22 SUN 12:00</span></div>' +
      '<div class="cd" id="cd"></div>' +
      '<button class="btn k" style="margin-top:30px" data-go="paddock"><span class="ja">出走表を見る</span></button>' +
      '<div class="hint">6 LINES ・ NOT YET NAMED</div>' +
    '</div>' +
    '<i class="xh" style="left:24px;top:88px"></i><i class="xh" style="right:24px;bottom:40px"></i>';
  tickCD();
};
function tickCD() {
  var el = $('#cd'); if (!el) return;
  var d = Math.max(0, RACE_AT - Date.now()), s = Math.floor(d / 1000);
  var u = [[Math.floor(s / 86400), 'DAYS'], [Math.floor(s / 3600) % 24, 'HOURS'],
           [Math.floor(s / 60) % 60, 'MINUTES'], [s % 60, 'SECONDS']];
  el.innerHTML = u.map(function (x) {
    return '<div><b>' + String(x[0]).padStart(2, '0') + '</b><span>' + x[1] + '</span></div>';
  }).join('');
}

/* ---------------- 02 PADDOCK ---------------- */
var pIdx = 0;
VIEWS.paddock = function () {
  var v = $('#v-paddock');
  if (!v._done) {
    v._done = 1;
    v.innerHTML =
      '<div class="stage" data-shape="berry3" data-dir="radial" data-spread="30"></div>' +
      '<div class="dots" id="dots">' + LINES.map(function () { return '<i></i>'; }).join('') + '</div>' +
      '<div class="pad" style="margin-top:16px">' +
        '<div class="sec"><b>PADDOCK / 出走表</b><span>第1回 苺優駿</span></div>' +
        '<p class="b" style="margin-top:12px">走るのは、まだ商品化されていない系統だけ。' +
        'この6つは系統番号でしか呼ばれていない。</p>' +
      '</div>' +
      '<div class="deck" id="deck">' + LINES.map(cardHTML).join('') + '</div>' +
      '<div class="pad"><button class="btn k" style="margin-top:18px" id="pickbtn"></button>' +
      '<div class="hint">SWIPE　←　→</div></div>';
    var deck = $('#deck');
    deck.addEventListener('scroll', function () {
      var i = Math.round(deck.scrollLeft / (deck.firstElementChild.offsetWidth + 14));
      if (i !== pIdx && LINES[i]) { pIdx = i; syncPaddock(); }
    }, { passive: true });
    $('#pickbtn').onclick = function () { go('owner'); };
  }
  syncPaddock();
  meters(v);
};
function cardHTML(l) {
  var bars = [
    ['糖度', 'BRIX', l.brix, '', (l.brix - 12.4) / 2.2 * 100],
    ['糖酸比', 'SUGAR / ACID', (l.brix / l.acid).toFixed(1), '', ((l.brix / l.acid) - 15) / 6.5 * 100],
    ['果実硬度', 'FIRMNESS', l.firm, '', (l.firm - 68) / 30 * 100],
    ['一果重', 'FRUIT WEIGHT', l.wt, 'g', (l.wt - 20) / 10 * 100],
    ['耐暑性', 'HEAT TOLERANCE', l.heat, '', (l.heat - 58) / 34 * 100]
  ];
  return '<article class="card">' +
    '<div class="top"><span class="wk" style="background:' + l.wc + '"></span>' +
      '<span class="ln">' + l.ln + '</span>' +
      '<span class="fr">枠' + l.w + '　' + l.from + '</span></div>' +
    '<div class="note">' + l.note + '</div>' +
    bars.map(function (b) {
      return '<div style="margin-top:16px"><div class="row" style="border:0;padding:0">' +
        '<span class="k">' + b[0] + '<span class="en xs" style="margin-left:8px">' + b[1] + '</span></span>' +
        '<span class="v">' + b[2] + (b[3] ? '<em>' + b[3] + '</em>' : '') + '</span></div>' +
        '<div class="meter"><i data-w="' + Math.max(4, Math.min(100, b[4])).toFixed(0) + '"></i></div></div>';
    }).join('') +
    '<div class="sec" style="margin-top:22px"><b>PEDIGREE</b><span>近交係数 ' + l.ci.toFixed(3) + '</span></div>' +
    '<div class="ped" style="margin-top:12px">' +
      '<span class="k">父</span><span class="v">' + l.sire + '</span>' +
      '<span class="k">母</span><span class="v">' + l.dam + '</span>' +
      '<span class="k">母の父</span><span class="v">' + l.bms + '</span>' +
    '</div>' +
    '<div class="sec" style="margin-top:22px"><b>SELECTION</b><span>果形 ' + l.form + '</span></div>' +
    '<div class="steps">' + l.steps.map(function (s) { return '<span>' + s + '</span>'; }).join('') + '</div>' +
  '</article>';
}
function syncPaddock() {
  var l = LINES[pIdx], st = $('#v-paddock .stage');
  st.dataset.shape = l.shape;
  if (cur === 'paddock') stageNow();
  $$('#dots i').forEach(function (d, i) { d.classList.toggle('on', i === pIdx); });
  var b = $('#pickbtn');
  b.innerHTML = '<span class="ja">' + l.ln + ' のオーナーになる</span>';
}

/* ---------------- 03 OWNER ---------------- */
VIEWS.owner = function () {
  var l = LINES[pIdx], v = $('#v-owner');
  v.innerHTML =
    '<div class="stage" data-shape="' + l.shape + '" data-dir="down" data-spread="70" style="height:200px"></div>' +
    '<div class="pad fade">' +
      '<div class="sec"><b>OWNERS CLUB</b><span>一口 / 無償</span></div>' +
      '<h2 class="t" style="margin-top:16px">この系統の<br>オーナーになる。</h2>' +
      '<p class="b" style="margin-top:14px">オッズも馬券もありません。' +
      '決められるのは、どれを応援するかだけ。結果は自分では選べない。</p>' +
      '<div class="row" style="margin-top:20px"><span class="wk" style="background:' + l.wc + '"></span>' +
        '<span class="k">出走系統</span><span class="v">' + l.ln + '</span></div>' +
      '<div class="row"><span class="k">育成</span><span class="v">' + l.breeder + '</span></div>' +
      '<div class="row"><span class="k">産地</span><span class="v">' + l.from + '</span></div>' +
      '<button class="btn k" style="margin-top:26px" id="reg"><span class="ja">登録する</span></button>' +
      '<button class="btn o" style="margin-top:10px" id="cancel"><span class="ja">戻る</span></button>' +
      '<div class="hint">ONE OWNER, ONE LINE</div>' +
    '</div>';
  $('#reg').onclick = function () {
    S.owner = l.ln;
    S.no = S.no || ('ICY-2027-' + String(1000 + Math.floor(Math.random() * 8999)));
    S.raced = false; save();
    toast('OWNER ' + S.no);
    setTimeout(function () { go('race'); }, 700);
  };
  $('#cancel').onclick = back;
};

/* ---------------- 04 RACE ---------------- */
var RT = null;
VIEWS.race = function () {
  var v = $('#v-race');
  if (!S.owner) {
    v.innerHTML = '<div class="stage" data-shape="horses" data-dir="left" data-spread="90" style="height:200px"></div>' +
      '<div class="pad fade"><div class="sec"><b>JUDGING</b><span>審査</span></div>' +
      '<h2 class="t" style="margin-top:16px">先に、応援する<br>系統を決める。</h2>' +
      '<p class="b" style="margin-top:14px">審査は、応援した系統があるときだけ意味を持ちます。</p>' +
      '<button class="btn k" style="margin-top:24px" data-go="paddock"><span class="ja">出走表へ</span></button></div>';
    return;
  }
  if (S.raced) { renderRace(true); return; }
  renderRace(false);
};

function renderRace(done) {
  var v = $('#v-race');
  v.innerHTML =
    '<div class="stage" data-shape="horses" data-dir="left" data-spread="62"></div>' +
    '<div class="rail"><i id="rail"></i></div>' +
    '<div class="phase">' + ['PADDOCK', 'EXPERT', 'CLUB VOTE', 'RESULT']
      .map(function (p, i) { return '<span data-p="' + i + '">' + p + '</span>'; }).join('') + '</div>' +
    '<div class="pad"><div class="sec"><b>LIVE JUDGING</b><span id="clock">00:00</span></div></div>' +
    '<div class="board" id="board" style="height:' + (LINES.length * 54) + 'px;margin:8px 22px 0">' +
      LINES.map(function (l, i) {
        return '<div class="lrow" data-i="' + i + '" style="transform:translateY(' + (i * 54) + 'px)">' +
          '<span class="pos num">' + (i + 1) + '</span>' +
          '<span class="wk" style="background:' + l.wc + '"></span>' +
          '<span class="nm">' + l.ln + '</span>' +
          '<span class="sc num">0.0</span>' +
          '<span class="bar"><i></i></span></div>';
      }).join('') +
    '</div>' +
    '<div class="pad"><div class="jgrid" id="jg">' + JUDGES.map(function (j, i) {
      return '<div data-j="' + i + '"><b>' + j.n + '</b><span>WAIT</span></div>';
    }).join('') + '</div>' +
    '<button class="btn o" style="margin-top:22px" id="skip"><span class="ja">' +
      (done ? '結果を見る' : '結果まで飛ばす') + '</span></button></div>';

  $('#skip').onclick = function () { stopRace(); finishRace(); };
  if (done) { paint(1); return; }
  startRace();
}

var RS = { t: 0, timer: 0 };
function startRace() {
  stopRace();
  RS.t = 0;
  RS.timer = setInterval(function () {
    RS.t += 0.1;
    var T = 24;
    if (RS.t >= T) { stopRace(); finishRace(); return; }
    paint(RS.t / T);
  }, 100);
}
function stopRace() { clearInterval(RS.timer); RS.timer = 0; }

function paint(k) {
  var rail = $('#rail'); if (!rail) return;
  rail.style.width = (k * 100) + '%';
  var el = $('#clock'); if (el) {
    var s = Math.round(k * 24);
    el.textContent = '00:' + String(s).padStart(2, '0');
  }
  var ph = k < .13 ? 0 : k < .62 ? 1 : k < .9 ? 2 : 3;
  $$('.phase span').forEach(function (s) { s.classList.toggle('on', +s.dataset.p === ph); });

  // 専門家: 0.13→0.62 のあいだに5人が順に入る
  var jdone = Math.max(0, Math.min(5, Math.floor((k - .13) / .098)));
  $$('#jg div').forEach(function (d, i) {
    var on = i < jdone;
    d.classList.toggle('on', on);
    $('span', d).textContent = on ? 'IN' : (i === jdone ? 'JUDGING' : 'WAIT');
  });
  var clubK = Math.max(0, Math.min(1, (k - .62) / .28));

  var vals = LINES.map(function (l, i) {
    var e = 0;
    for (var j = 0; j < jdone; j++) e += judgeScore(j, i);
    e = jdone ? e / jdone : 0;
    var conf = jdone / 5;
    var cm = Math.max.apply(null, CLUB);
    var c = (CLUB[i] / cm) * clubK;
    return (0.7 * e * conf + 0.3 * c) / (0.7 * conf + 0.3 * clubK || 1) * (0.7 * conf + 0.3 * clubK);
  });
  var order = vals.map(function (v, i) { return { i: i, v: v }; })
    .sort(function (a, b) { return b.v - a.v; });
  var mx = Math.max.apply(null, vals) || 1;
  order.forEach(function (o, rank) {
    var row = $('.lrow[data-i="' + o.i + '"]');
    row.style.transform = 'translateY(' + (rank * 54) + 'px)';
    $('.pos', row).textContent = rank + 1;
    $('.sc', row).textContent = (o.v * 100).toFixed(1);
    $('.bar i', row).style.width = (o.v / mx * 100) + '%';
    row.classList.toggle('lead', rank === 0);
  });
  if (k > .93) {
    var st = $('#v-race .stage');
    if (st && st.dataset.shape !== LINES[WINNER].shape) {
      st.dataset.shape = LINES[WINNER].shape; st.dataset.dir = 'radial';
      if (cur === 'race') stageNow();
    }
  }
}
function finishRace() {
  paint(1);
  S.raced = true; save();
  if (cur === 'race') setTimeout(function () { go('result'); }, 900);
}

/* ---------------- 05 RESULT ---------------- */
VIEWS.result = function () {
  var v = $('#v-result'), w = LINES[WINNER];
  var rank = ranking(), mine = S.owner ? rank.findIndex(function (r) { return LINES[r.i].ln === S.owner; }) + 1 : 0;
  var hit = S.owner === w.ln;
  v.innerHTML =
    '<div class="stage" data-shape="' + w.shape + '" data-dir="radial" data-spread="58"></div>' +
    '<div class="pad fade">' +
      '<div class="en xs" style="letter-spacing:.34em">WINNER　枠' + w.w + '　' + w.ln + '</div>' +
      '<div class="reveal" id="rv" style="margin-top:14px"></div>' +
      '<div class="en xs" style="margin-top:10px">' + CROWN.ja + '</div>' +
      '<p class="b" style="margin-top:22px">この一系統だけが商品名を持ち、<br>翌年から生産をひろげる。</p>' +
      '<div class="sec" style="text-align:left"><b>WHAT IT MEANS</b><span>日本初</span></div>' +
      '<p class="b" style="margin-top:14px;text-align:left">5月末まで品質が落ちない系統が日本一になった。' +
      'それは、夏に食べられるいちごが生まれたということ。</p>' +
      '<div class="sec" style="text-align:left"><b>YOUR LINE</b><span>' + (S.no || '') + '</span></div>' +
      (S.owner
        ? '<div class="row"><span class="wk" style="background:' + line(S.owner).wc + '"></span>' +
          '<span class="k">' + S.owner + '</span><span class="v">' + mine + '<em>着</em></span></div>' +
          '<p class="b" style="margin-top:14px;text-align:left">' +
          (hit ? '応援した系統が勝った。翌年、この系統は交配親になる。'
               : '届かなかった。ただし出走した6系統は、すべて翌年の交配親として残る。') + '</p>'
        : '') +
      '<button class="btn k" style="margin-top:26px" data-go="stable"><span class="ja">厩舎へ</span></button>' +
      '<div class="hint">FINAL ORDER FIXED</div>' +
    '</div>';
  var s = CROWN.name.split('');
  $('#rv').innerHTML = s.map(function (c, i) {
    return '<span style="animation-delay:' + (300 + i * 55) + 'ms">' + (c === ' ' ? '&nbsp;' : c) + '</span>';
  }).join('');
};

/* ---------------- 06 STABLE ---------------- */
VIEWS.stable = function () {
  var v = $('#v-stable'), w = LINES[WINNER];
  var mine = S.owner ? line(S.owner) : null;
  var y28 = nextYear();
  v.innerHTML =
    '<div class="stage" data-shape="dna" data-dir="radial" data-spread="26" style="height:186px"></div>' +
    '<div class="pad">' +
      '<div class="sec"><b>STABLE / 厩舎</b><span>' + (S.no || 'NOT REGISTERED') + '</span></div>' +
      (mine
        ? '<div class="row" style="margin-top:6px"><span class="wk" style="background:' + mine.wc + '"></span>' +
          '<span class="k">応援した系統</span><span class="v">' + mine.ln + '</span></div>' +
          '<div class="row"><span class="k">第1回 苺優駿</span><span class="v">' +
          (S.raced ? (ranking().findIndex(function (r) { return LINES[r.i].ln === S.owner; }) + 1) + '<em>着</em>' : '未審査') + '</span></div>'
        : '<p class="b" style="margin-top:12px">まだ系統を選んでいません。</p>') +
      '<div class="sec"><b>CROSSING</b><span>設計してみる</span></div>' +
      '<p class="b" style="margin-top:12px">交配親を2つ選ぶ。生まれる系統は自分では決められない。' +
      '形質は確率で受け継がれ、番号が振られる。</p>' +
      '<button class="btn o" style="margin-top:16px" data-go="crossing"><span class="ja">交配を設計する</span></button>' +
      (S.child ? childCard(S.child) : '') +
      '<div class="sec"><b>2028 ENTRIES</b><span>第2回 出走候補</span></div>' +
      y28.map(function (e) {
        return '<div class="row"><span class="wk" style="background:' + e.wc + '"></span>' +
          '<span class="k">' + e.ln + '</span><span class="v" style="font-size:10px;letter-spacing:.14em">' +
          e.sire + '</span></div>';
      }).join('') +
      '<p class="b" style="margin-top:16px">' + CROWN.name + ' は走らない。翌年からは、その子が走る。</p>' +
    '</div>';
};
function nextYear() {
  var w = LINES[WINNER], out = [
    { ln: 'i-28-02', wc: w.wc, sire: CROWN.name + ' × i-26-12' },
    { ln: 'i-28-05', wc: '#111', sire: CROWN.name + ' × i-26-14' },
    { ln: 'i-28-09', wc: '#1B4FD8', sire: 'i-26-18 × ' + CROWN.name }
  ];
  if (S.child) out.unshift({ ln: S.child.ln, wc: '#E4002B', sire: S.child.sire + ' × ' + S.child.dam });
  return out;
}
function childCard(c) {
  return '<div class="childcard">' +
    '<div class="en xs">YOUR LINE</div>' +
    '<div class="en" style="font-size:19px;letter-spacing:.14em;margin-top:8px">' + c.ln + '</div>' +
    '<div class="row" style="margin-top:12px"><span class="k">両親</span><span class="v" style="font-size:10.5px">' +
      c.sire + ' × ' + c.dam + '</span></div>' +
    '<div class="row"><span class="k">糖度</span><span class="v">' + c.brix + '</span></div>' +
    '<div class="row"><span class="k">果実硬度</span><span class="v">' + c.firm + '</span></div>' +
    '<div class="row"><span class="k">一果重</span><span class="v">' + c.wt + '<em>g</em></span></div>' +
    '<div class="row"><span class="k">果形</span><span class="v" style="font-family:var(--jp);font-size:12px">' + c.form + '</span></div>' +
    '<div class="row" style="border:0"><span class="k">近交係数</span><span class="v">' + c.ci + '</span></div>' +
  '</div>';
}

/* ---------------- 07 CROSSING ---------------- */
var cSel = [];
VIEWS.crossing = function () {
  var v = $('#v-crossing');
  cSel = [];
  v.innerHTML =
    '<div class="stage" data-shape="dna" data-dir="radial" data-spread="30" style="height:200px"></div>' +
    '<div class="pad fade">' +
      '<div class="sec"><b>CROSSING</b><span>親を2つ</span></div>' +
      '<p class="b" style="margin-top:12px">選べるのはここまで。何が生まれるかは、選べない。</p>' +
      '<div class="pick" id="pick">' + LINES.map(function (l, i) {
        return '<button data-i="' + i + '"><span class="sw" style="background:' + l.wc + '"></span>' +
          '<span class="n">' + l.ln + '</span></button>';
      }).join('') + '</div>' +
      '<button class="btn k" style="margin-top:22px" id="cross" disabled><span class="ja">交配する</span></button>' +
      '<div id="cout"></div>' +
      '<div class="hint">TRAITS ARE INHERITED, NOT CHOSEN</div>' +
    '</div>';
  $$('#pick button').forEach(function (b) {
    b.onclick = function () {
      var i = +b.dataset.i, at = cSel.indexOf(i);
      if (at >= 0) cSel.splice(at, 1);
      else { if (cSel.length === 2) cSel.shift(); cSel.push(i); }
      $$('#pick button').forEach(function (x) { x.classList.toggle('on', cSel.indexOf(+x.dataset.i) >= 0); });
      $('#cross').disabled = cSel.length !== 2;
    };
  });
  $('#cross').onclick = function () {
    var c = cross(LINES[cSel[0]], LINES[cSel[1]]);
    S.child = c; save();
    $('#cout').innerHTML = childCard(c) +
      '<button class="btn o" style="margin-top:14px" data-go="stable"><span class="ja">厩舎で見る</span></button>';
    $('#cout').firstElementChild.classList.add('fade');
    var st = $('#v-crossing .stage');
    st.dataset.shape = (Math.random() < .5 ? LINES[cSel[0]] : LINES[cSel[1]]).shape;
    st.dataset.dir = 'radial'; stageNow();
    toast('NEW LINE ' + c.ln);
  };
};
function cross(a, b) {
  var mid = function (x, y, sp) { return (x + y) / 2 + (Math.random() - 0.5) * sp; };
  var anc = function (l) { return [l.sire, l.dam, l.bms]; };
  var shared = anc(a).filter(function (x) { return anc(b).indexOf(x) >= 0; }).length;
  var n = 1 + Math.floor(Math.random() * 40);
  return {
    ln: 'i-28-' + String(n).padStart(2, '0'),
    sire: a.ln, dam: b.ln,
    brix: mid(a.brix, b.brix, 1.1).toFixed(1),
    firm: Math.round(mid(a.firm, b.firm, 12)),
    wt: mid(a.wt, b.wt, 4).toFixed(1),
    form: Math.random() < .5 ? a.form : b.form,
    ci: (0.0625 * shared + (a.ci + b.ci) / 4).toFixed(3)
  };
}

/* ---------------- 08 ABOUT ---------------- */
VIEWS.about = function () {
  var v = $('#v-about');
  if (v._done) return; v._done = 1;
  v.innerHTML =
    '<div class="stage" data-shape="japan" data-dir="radial" data-spread="18" style="height:210px"></div>' +
    '<div class="pad">' +
      '<div class="sec"><b>THE NAME</b><span>名前の由来</span></div>' +
      '<p class="b" style="margin-top:12px">日本ダービーの正式名称は東京優駿。優駿とは、すぐれた馬のこと。' +
      '苺優駿は、そのいちご版という意味です。</p>' +
      '<div class="sec"><b>WHY THE DERBY</b><span>なぜこの日か</span></div>' +
      '<p class="b" style="margin-top:12px">東京優駿は三歳のその年しか出られず、去勢馬は出走できません。' +
      '血統をつないできた結果を一日で見届ける競走です。品種改良も、同じことをしている。</p>' +
      '<div class="sec"><b>QUESTIONS</b><span>想定問答</span></div>' +
      QA.map(function (q, i) {
        return '<div class="qa"><button data-q="' + i + '"><span class="q">' + q[0] + '</span>' +
          '<span class="pm"></span></button><div class="a"><p>' + q[1] + '</p></div></div>';
      }).join('') +
      '<div class="sec"><b>CREDIT</b><span>2027</span></div>' +
      '<p class="b" style="margin-top:12px">企画：桑田航希　／　CULTA 課題提出用のプロトタイプ。' +
      'オッズ・馬券・賞金はありません。</p>' +
    '</div>';
  $$('.qa button').forEach(function (b) {
    b.onclick = function () {
      var qa = b.parentNode, a = $('.a', qa), open = qa.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : 0;
    };
  });
};

/* ---------------- 起動 ---------------- */
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-go]'); if (!t) return;
  go(t.dataset.go);
});
$('#back').onclick = back;

Field.init($('#field'));
Field.preload(['berry3', 'horses', 'horse', 'japan', 'dna']);
setInterval(tickCD, 1000);
setInterval(function () {
  var d = Math.max(0, RACE_AT - Date.now()), s = Math.floor(d / 1000);
  $('#rt').textContent = 'T−' + Math.floor(s / 86400) + 'D ' +
    String(Math.floor(s / 3600) % 24).padStart(2, '0') + ':' +
    String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' +
    String(s % 60).padStart(2, '0');
}, 1000);

var Q = new URLSearchParams(location.search);
if (Q.get('demo')) { S.owner = Q.get('demo'); S.no = S.no || 'ICY-2027-4821'; S.raced = Q.get('raced') === '1'; }
var START = (location.hash || '').replace('#', '');
go(VIEWS[START] ? START : (S.owner ? (S.raced ? 'stable' : 'race') : 'intro'));
window.addEventListener('resize', function () { setTimeout(stageNow, 60); });
})();
