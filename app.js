/* =========================================================================
   app.js — 苺優駿 / JAPAN STRAWBERRY DERBY 2027

   モーションの値は motion_research.md の実測にそろえている。
     入り 320ms cubic-bezier(.16,1,.3,1) / 抜け 180ms cubic-bezier(.5,0,.75,0)
     微細 150ms / 開閉 400ms / 罫 480ms cubic-bezier(0,0,.25,1)
     連鎖は20ms刻み・合計400msで打ち切り。抜けは遅延ゼロで尺を縮める。
     ドラッグの着地は時間ではなく減衰 v += (t-v)*(1-exp(-6*dt))
   ========================================================================= */
(function () {
'use strict';

var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
var RACE_AT = new Date('2027-05-22T12:00:00+09:00').getTime();
var Q0 = new URLSearchParams(location.search);
var SLOW = matchMedia('(prefers-reduced-motion: reduce)').matches || Q0.get('still') === '1';
var Q = Q0;

/* ---------------- 状態 ---------------- */
var S = (function () { try { return JSON.parse(localStorage.getItem('iy27') || '{}'); } catch (e) { return {}; } })();
function save() { try { localStorage.setItem('iy27', JSON.stringify(S)); } catch (e) {} }
if (Q.get('demo')) { S.owner = +Q.get('demo'); S.no = S.no || 'ICY-2027-4821'; S.raced = Q.get('raced') === '1'; }
function L(no) { return LINES[no - 1]; }

/* ---------------- 採点（実数だけで決まる） ---------------- */
var JW = [
  { ratio: .40, firm: .10, heat: .40, wt: .10 }, { ratio: .70, firm: .10, heat: .10, wt: .10 },
  { ratio: .05, firm: .70, heat: .10, wt: .15 }, { ratio: .10, firm: .15, heat: .60, wt: .15 },
  { ratio: .30, firm: .25, heat: .25, wt: .20 }
];
var NRM = (function () {
  var c = {}; AXES.forEach(function (a) { c[a.k] = LINES.map(a.f); });
  return LINES.map(function (l) { var o = {}; AXES.forEach(function (a) { o[a.k] = norm(c[a.k], a.f(l)); }); return o; });
})();
function jScore(j, i) { var w = JW[j], n = NRM[i]; return n.ratio * w.ratio + n.firm * w.firm + n.heat * w.heat + n.wt * w.wt; }
function expert(i) { var s = 0; for (var j = 0; j < 5; j++) s += jScore(j, i); return s / 5; }
var CLUB = (function () {
  var r = LINES.map(function (l, i) { return Math.exp(expert(i) * 3.1) * (.92 + Math.random() * .16); });
  var t = r.reduce(function (a, b) { return a + b; }, 0); return r.map(function (v) { return v / t; });
})();
function fin(i) { var m = Math.max.apply(null, CLUB); return .7 * expert(i) + .3 * (CLUB[i] / m); }
var WIN = (function () { var b = 0; for (var i = 1; i < 6; i++) if (fin(i) > fin(b)) b = i; return b; })();
function order() { return LINES.map(function (l, i) { return { i: i, v: fin(i) }; }).sort(function (a, b) { return b.v - a.v; }); }
function placeOf(no) { var o = order(); for (var k = 0; k < o.length; k++) if (o[k].i === no - 1) return k + 1; return 0; }

/* ---------------- 小道具 ---------------- */
var EO = 'cubic-bezier(.16,1,.3,1)';
function raf2(fn) { requestAnimationFrame(function () { requestAnimationFrame(fn); }); }
function on(el, cls, d) { setTimeout(function () { el && el.classList.add(cls || 'on'); }, d || 0); }
function stagger(els, cls, step, start) {
  step = step || 20; start = start || 0;
  var n = els.length, cap = 400, st = n * step > cap ? cap / n : step;
  els.forEach(function (e, i) { on(e, cls, start + i * st); });
}
function segs(str) {
  if (window.Intl && Intl.Segmenter) {
    try { return Array.from(new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(str), function (s) { return s.segment; }); }
    catch (e) {}
  }
  return str.split('');
}
/* 明朝見出しを1文字ずつ、下から立ち上げる（フェードではなくマスク） */
function charReveal(el, delay, step) {
  if (!el) return;
  var txt = el.textContent, lines = txt.split('\n');
  el.textContent = ''; el.setAttribute('translate', 'no');
  var k = 0, D = SLOW ? 1 : 640, ST = SLOW ? 0 : (step || 42), DL = SLOW ? 0 : (delay || 0);
  lines.forEach(function (line, li) {
    if (li) el.appendChild(document.createElement('br'));
    segs(line).forEach(function (c) {
      var o = document.createElement('span'), i2 = document.createElement('i');
      o.className = 'rc'; i2.textContent = c === ' ' ? '\u00a0' : c;
      i2.style.transitionDelay = (DL + k * ST) + 'ms';
      o.appendChild(i2); el.appendChild(o);
      k++;
    });
  });
  if (el.dataset.accent) {
    var ac = el.dataset.accent.split(',').map(Number);
    $$('.rc', el).forEach(function (x, i2) { if (ac.indexOf(i2) >= 0) x.style.color = 'var(--rd)'; });
  }
  setTimeout(function () { $$('.rc', el).forEach(function (x) { x.classList.add('on'); }); }, 30);
}
function countTo(el, to, dec, ms) {
  var t0 = performance.now(), D = ms || 1100;
  (function step(t) {
    var k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 4);   // easeOutQuart
    el.textContent = (to * e).toFixed(dec || 0);
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}
function bars(root, d) {
  setTimeout(function () {
    $$('[data-w]', root).forEach(function (b, i) {
      setTimeout(function () { b.style.width = b.dataset.w + '%'; }, i * 60);
    });
  }, d || 120);
}
function toast(t) {
  var e = $('#toast'); e.textContent = t; e.classList.add('on');
  clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove('on'); }, 2200);
  if (navigator.vibrate) try { navigator.vibrate(12); } catch (x) {}
}

/* ---------------- 画面遷移 ---------------- */
var cur = '', hist = [];
var V = {}, TAB = { home: 1, club: 1, race: 1 };
function go(name, push) {
  if (name === cur) return;
  var from = $('#v-' + cur), to = $('#v-' + name);
  if (from) {
    from.classList.add('out'); from.classList.remove('on');
    setTimeout(function () { from.classList.remove('out'); }, 200);
  }
  if (push !== false && cur) hist.push(cur);
  cur = name;
  document.body.classList.toggle('nofoot', !TAB[name]);
  document.body.classList.toggle('plain', name !== 'home');
  $$('#tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.go === name); });
  to.scrollTop = 0;
  V[name]();
  void to.offsetHeight;
  to.classList.add('on');
  setTimeout(stageNow, 24);
}
function back() { go(hist.pop() || 'home', false); }
function stageNow() {
  var v = $('#v-' + cur), st = $('.stage', v);
  if (!st) { Field.hide(); return; }
  if (st.dataset.ring) return;
  Field.apply(st.dataset.shape || 'dust', st, {
    dir: st.dataset.dir || 'radial',
    spread: st.dataset.spread ? +st.dataset.spread : undefined
  });
}

/* ---------------- 左右のレールと飾り ---------------- */
function chrome() {
  $('#railL').innerHTML =
    '<b>JAPAN<br>STRAWBERRY<br>DERBY</b><span class="bar"></span>' +
    'A SWEETER<br>TOMORROW' +
    '<div class="jp" style="margin-top:16px">いちごの可能性は、<br>まだ始まったばかり。</div>';
  $('#railR').innerHTML =
    '<div class="jp" style="color:#6E6E6E">まだ見ぬ<br>いちごの<br>未来を、<br>いっしょに。</div>' +
    '<span class="bar"></span>' +
    'SEEDING<br>A BRIGHTER<br>TOMORROW';
  var d = $('#deco'), h = '';
  [[26, 150], [400, 96], [34, 640], [406, 700], [200, 58]].forEach(function (p) {
    h += '<i class="xh" style="left:' + p[0] + 'px;top:' + p[1] + 'px"></i>';
  });
  [[70, 300], [372, 250], [120, 560], [340, 470], [50, 430], [300, 620]].forEach(function (p) {
    h += '<i class="sq" style="left:' + p[0] + 'px;top:' + p[1] + 'px"></i>';
  });
  d.innerHTML = h;
  d.style.cssText = 'position:absolute;inset:0;z-index:4;pointer-events:none';
  $$('.xh,.sq', d).forEach(function (e) { e.classList.add('pop'); });
}

/* =========================================================================
   HOME
   ========================================================================= */
var idx = Math.max(0, Math.min(5, +(Q.get('line') || 0)));
V.home = function () {
  var v = $('#v-home');
  if (!v._done) {
    v._done = 1;
    v.innerHTML =
      '<div class="pad" style="padding-top:62px;text-align:center">' +
        '<svg viewBox="0 0 44 24" style="width:44px;height:24px;fill:none;stroke:#E4002B;stroke-width:1.4"><path d="M3 22 L10 7 L16 15 L22 3 L28 15 L34 7 L41 22 Z"/></svg>' +
        '<h1 class="big" id="ttl" data-accent="0" style="margin-top:6px">苺優駿</h1>' +
        '<div class="lbl track pre" id="sub1" style="margin-top:12px">JAPAN STRAWBERRY DERBY</div>' +
        '<div class="mc" id="sub2" style="margin-top:10px;font-size:14px;letter-spacing:.3em;color:#5C5C5C">次の夏を代表する一粒を選ぼう</div>' +
      '</div>' +
      '<div class="hero">' +
        '<div class="stage" id="ringstage" data-ring="1"></div>' +
        '<div class="rings" id="rings"><i></i><i></i><i></i></div>' +
        '<div class="carotouch" id="caro"></div>' +
        '<div class="labels" id="labels"></div>' +
        '<button class="arw l" id="arwL">‹</button><button class="arw r" id="arwR">›</button>' +
        '<div class="swipehint" id="sh">‹　DRAG　›</div>' +
        '<div class="dots" id="dots">' + LINES.map(function (l, i) { return '<i data-i="' + i + '"></i>'; }).join('') + '</div>' +
      '</div>' +
      '<div class="card rise" id="hcard"></div>' +
      '<div style="height:20px"></div>';
    buildCaro();
  }
  paintHome();
};

function dnaSVG() {
  var p = '', q = '';
  for (var i = 0; i <= 46; i++) {
    var t = i / 46, y = t * 190, a = t * Math.PI * 2 * 2.4;
    p += '<circle cx="' + (59 + Math.sin(a) * 34) + '" cy="' + y + '" r="1.5"/>';
    q += '<circle cx="' + (59 + Math.sin(a + Math.PI) * 34) + '" cy="' + y + '" r="1.2"/>';
    if (i % 4 === 0) {
      var x1 = 59 + Math.sin(a) * 34, x2 = 59 + Math.sin(a + Math.PI) * 34;
      for (var k = 1; k < 5; k++) q += '<circle cx="' + (x1 + (x2 - x1) * k / 5) + '" cy="' + y + '" r=".8"/>';
    }
  }
  return '<svg class="dna" viewBox="0 0 118 190"><g fill="#E4002B" opacity=".55">' + p + '</g>' +
         '<g fill="#E4002B" opacity=".22">' + q + '</g></svg>';
}

function buildCaro() {
  Field.ring(LINES.map(function (l) { return l.shape; }), $('#ringstage'), {
    index: idx,
    onIndex: function (i) { idx = i; paintHome(); },
    onFrame: function (slots) {
      var lb = $('#labels'); if (!lb) return;
      if (!lb._n) { lb.innerHTML = LINES.map(function (l) { return '<span>' + l.name + '</span>'; }).join(''); lb._n = 1; }
      var sp = lb.children;
      for (var i = 0; i < slots.length; i++) {
        var s = slots[i];
        sp[i].style.left = s.x + 'px';
        sp[i].style.opacity = Math.max(0, s.k * 1.4 - .25);
        sp[i].classList.toggle('on', s.k > .985);
      }
    }
  });
  var t = $('#caro'), down = false, lx = 0, moved = 0;
  t.addEventListener('pointerdown', function (e) { down = true; moved = 0; lx = e.clientX; try { t.setPointerCapture(e.pointerId); } catch (x) {} $('#sh').style.opacity = 0; });
  t.addEventListener('pointermove', function (e) {
    if (!down) return;
    var d = e.clientX - lx; lx = e.clientX; moved += Math.abs(d);
    Field.spin(-d);
  });
  var up = function () { if (!down) return; down = false; Field.release(); };
  t.addEventListener('pointerup', up); t.addEventListener('pointercancel', up);
  t.addEventListener('wheel', function (e) {
    e.preventDefault(); Field.spin(e.deltaY > 0 ? 24 : -24);
    clearTimeout(t._w); t._w = setTimeout(function () { Field.release(); }, 130);
  }, { passive: false });
  $('#arwL').onclick = function () { Field.ringTo((idx + 5) % 6); };
  $('#arwR').onclick = function () { Field.ringTo((idx + 1) % 6); };
  $$('#dots i').forEach(function (d) { d.onclick = function () { Field.ringTo(+d.dataset.i); }; });
}

function paintHome() {
  var l = LINES[idx], c = $('#hcard'); if (!c) return;
  $$('#dots i').forEach(function (x, i) { x.classList.toggle('on', i === idx); });
  var m = [['☀', '甘さ', l.radar.甘さ], ['〰', '香り', l.radar.香り], ['💧', 'みずみずしさ', l.radar.果汁]];
  c.innerHTML = dnaSVG() +
    '<div class="ctag">A SMALL<br>STRAWBERRY<br>A BIGGER<br>TOMORROW</div>' +
    '<div class="nohead"><div class="n">' + l.name + '</div></div>' +
    '<div class="lbl" style="margin-top:10px">CANDIDATE No.0' + l.no + '　系統 ' + l.ln + '</div>' +
    '<h2 class="copy" id="hcopy" style="margin-top:14px">' + l.copy.join('\n') + '</h2>' +
    '<p class="b" style="margin-top:14px;max-width:78%">' + l.desc + '</p>' +
    '<div style="margin-top:16px">' + m.map(function (x) {
      return '<div class="mrow"><span class="ic">' + x[0] + '</span><span class="k">' + x[1] + '</span>' +
        '<span class="bar"><i data-w="' + x[2] + '"></i></span>' +
        '<span class="v">' + (x[2] / 10).toFixed(1) + '</span></div>';
    }).join('') + '</div>' +
    '<div class="cta"><button class="btn" id="godetail">' + l.name + 'の詳細を見る<span class="ar">→</span></button>' +
    '<button class="fav' + (S.fav === l.no ? ' on' : '') + '" id="fav">♥</button></div>';
  c.querySelector('.n').style.fontSize = l.name.length > 4 ? '34px' : '40px';
  $('#godetail').onclick = function () { go('detail'); };
  $('#fav').onclick = function () {
    S.fav = S.fav === l.no ? 0 : l.no; save();
    $('#fav').classList.toggle('on', S.fav === l.no);
    if (navigator.vibrate) try { navigator.vibrate(10); } catch (x) {}
  };
  charReveal($('#hcopy'), 60, 34);
  bars(c, 160);
}

/* =========================================================================
   DETAIL（能力 / 血統 / 育種者）
   ========================================================================= */
var dTab = Math.max(0, Math.min(2, +(Q.get('tab') || 0)));
V.detail = function () {
  var l = LINES[idx], v = $('#v-detail');
  v.innerHTML =
    '<button class="close" id="cls">閉じる<i>✕</i></button>' +
    '<div class="hero" style="height:300px">' +
      '<div class="stage" data-shape="' + l.shape + '" data-dir="right" data-spread="70" style="position:absolute;inset:8px 0 40px"></div>' +
      '<div class="rings" style="top:46px"><i></i><i></i><i></i></div>' +
      '<div class="lbl" style="position:absolute;left:24px;bottom:8px">No.0' + l.no + '</div>' +
    '</div>' +
    '<div class="card">' + dnaSVG() +
      '<div class="ctag">A SMALL<br>STRAWBERRY<br>A BIGGER<br>TOMORROW</div>' +
      '<div class="nohead"><div class="n" style="font-size:' + (l.name.length > 4 ? 32 : 40) + 'px">' + l.name + '</div>' +
        '<div class="sep"></div><div class="cand">' + l.kanji + '<br>CANDIDATE No.0' + l.no + '</div></div>' +
      '<h2 class="copy" id="dcopy" style="margin-top:14px">' + l.copy.join('\n') + '</h2>' +
      '<div class="tabs3" id="t3">' +
        ['能力', '血統', '育種者'].map(function (t, i) {
          return '<button data-t="' + i + '"' + (i === dTab ? ' class="on"' : '') + '>' + t + '</button>';
        }).join('') + '<i class="ink"></i></div>' +
      '<div id="tbody"></div>' +
      '<div class="cta"><button class="btn" id="own">この品種の苺主になる<span class="ar">→</span></button>' +
      '<button class="fav' + (S.fav === l.no ? ' on' : '') + '" id="fav2">♥</button></div>' +
    '</div><div style="height:24px"></div>';
  $('#cls').onclick = back;
  $('#own').onclick = function () {
    S.owner = l.no; S.no = S.no || ('ICY-2027-' + (1000 + Math.floor(Math.random() * 8999)));
    S.raced = false; save(); toast('苺主 ' + S.no);
    setTimeout(function () { go('race'); }, 620);
  };
  $('#fav2').onclick = function () {
    S.fav = S.fav === l.no ? 0 : l.no; save(); $('#fav2').classList.toggle('on', S.fav === l.no);
  };
  $$('#t3 button').forEach(function (b) {
    b.onclick = function () { dTab = +b.dataset.t; paintTabs(); };
  });
  charReveal($('#dcopy'), 80, 34);
  paintTabs();
};
function paintTabs() {
  var l = LINES[idx];
  $$('#t3 button').forEach(function (b, i) { b.classList.toggle('on', i === dTab); });
  var b = $$('#t3 button')[dTab], ink = $('#t3 .ink');
  if (b && ink) { ink.style.width = (b.offsetWidth * .64) + 'px'; ink.style.transform = 'translateX(' + (b.offsetLeft + b.offsetWidth * .18) + 'px)'; }
  var t = $('#tbody');
  t.innerHTML = dTab === 0 ? abilHTML(l) : dTab === 1 ? treeHTML(l) : brdHTML(l);
  if (dTab === 0) { animRadar(l); bars(t, 200); }
  if (dTab === 1) { wireTree(); setTimeout(function () { $('.tree').classList.add('on'); }, 80); }
  if (dTab === 2) { stagger($$('.gal figure', t), 'on', 30, 240); countTo($('#byr'), l.breeder.years, 0, 1100); }
}

var RAX = ['甘さ', '香り', '硬さ', '酸味', '果汁'];
var RR = 66, RC = 110;                         // 網の半径 / 中心（viewBox 220）
function rpt(i, f) {
  var a = -Math.PI / 2 + i * Math.PI * 2 / 5;
  return [RC + Math.cos(a) * RR * f, RC + Math.sin(a) * RR * f];
}
function abilHTML(l) {
  var web = '';
  [1, .75, .5, .25].forEach(function (f) {
    web += '<polygon class="web" points="' + RAX.map(function (k, i) { return rpt(i, f).join(','); }).join(' ') + '"/>';
  });
  RAX.forEach(function (k, i) {
    var p = rpt(i, 1);
    web += '<line class="ax" x1="' + RC + '" y1="' + RC + '" x2="' + p[0] + '" y2="' + p[1] + '"/>';
  });
  var labs = RAX.map(function (k, i) {
    var p = rpt(i, 1.30), an = i === 0 ? 'middle' : (p[0] > RC + 4 ? 'start' : (p[0] < RC - 4 ? 'end' : 'middle'));
    var dy = i === 0 ? -6 : (p[1] > RC ? 12 : 0);
    return '<text class="rn" x="' + p[0] + '" y="' + (p[1] + dy) + '" text-anchor="' + an + '">' + k + '</text>' +
           '<text class="rv" x="' + p[0] + '" y="' + (p[1] + dy + 15) + '" text-anchor="' + an + '">' + l.radar[k] + '</text>';
  }).join('');
  return '<div class="abil">' +
    '<svg class="radar" viewBox="0 0 220 220">' + web +
      '<polygon class="area" id="rarea" points="' + RAX.map(function () { return RC + ',' + RC; }).join(' ') + '"/>' +
      RAX.map(function (k, i) { var p = rpt(i, l.radar[k] / 100); return '<circle class="dot" cx="' + p[0] + '" cy="' + p[1] + '" r="3.4"/>'; }).join('') +
      labs +
    '</svg>' +
    '<div>' + RAX.map(function (k) {
      return '<div class="mrow" style="grid-template-columns:40px 1fr 30px;gap:8px"><span class="k" style="font-size:12px">' + k + '</span>' +
        '<span class="bar"><i data-w="' + l.radar[k] + '"></i></span><span class="v" style="font-size:13px">' + l.radar[k] + '</span></div>';
    }).join('') + '</div></div>' +
    '<p class="b" style="margin-top:16px">' + l.flavor + '</p>' +
    '<div class="pedfoot" style="margin-top:14px"><span>FLAVOR PROFILE</span><span>No.0' + l.no + '</span></div>' +
    '<div class="sec"><b>MEASURED</b><span>' + l.from + '</span></div>' +
    [['糖度', l.brix], ['酸度', l.acid], ['果実硬度', l.firm], ['一果重', l.wt + 'g'], ['果形', l.form]].map(function (x) {
      return '<div class="row"><span class="k">' + x[0] + '</span><span class="v">' + x[1] + '</span></div>';
    }).join('');
}
function animRadar(l) {
  var area = $('#rarea'); if (!area) return;
  var target = RAX.map(function (k, i) { return rpt(i, l.radar[k] / 100); });
  var t0 = performance.now(), D = SLOW ? 1 : 900;
  (function step(t) {
    var k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(2, -10 * k);   // easeOutExpo
    area.setAttribute('points', target.map(function (p) {
      return (RC + (p[0] - RC) * e) + ',' + (RC + (p[1] - RC) * e);
    }).join(' '));
    if (k < 1) requestAnimationFrame(step);
  })(t0);
  stagger($$('.radar .dot'), 'on', 60, 420);
}

function tIc(k) {
  var p = { sun: '<circle cx="9" cy="9" r="3.4"/><g stroke-linecap="round"><path d="M9 1v2.2M9 14.8V17M1 9h2.2M14.8 9H17M3.4 3.4l1.6 1.6M13 13l1.6 1.6M14.6 3.4L13 5M5 13l-1.6 1.6"/></g>',
           wave: '<path d="M1 11c2-3.4 4-3.4 6 0s4 3.4 6 0 3-2.6 4-1.4"/><path d="M1 6.4c2-3.4 4-3.4 6 0s4 3.4 6 0 3-2.6 4-1.4"/>',
           shield: '<path d="M9 1.6 2.6 4.2v5c0 3.6 2.6 6.3 6.4 7.2 3.8-.9 6.4-3.6 6.4-7.2v-5z"/>',
           temp: '<path d="M11 10.4V3.4a2 2 0 1 0-4 0v7a3.6 3.6 0 1 0 4 0z"/><path d="M9 6.6v5.2"/>' };
  return '<svg viewBox="0 0 18 18" style="width:17px;height:17px;fill:none;stroke:#E4002B;stroke-width:1.3">' + (p[k] || '') + '</svg>';
}
function imgFor(nm) {
  var h = 0; for (var i = 0; i < nm.length; i++) h = (h * 31 + nm.charCodeAt(i)) | 0;
  return LINES[Math.abs(h) % 6].img;
}
function node(cls, cap, nm, img) {
  return '<div class="node ' + cls + '"><div class="cap">' + cap + '</div>' +
    '<div class="ph" style="background-image:url(' + (img || imgFor(nm)) + ')"></div>' +
    '<div class="nm">' + nm + '</div></div>';
}
function treeHTML(l) {
  return '<div class="tree" id="tree">' +
    '<div class="lbl" style="margin-bottom:4px">FAMILY TREE</div>' +
    '<div class="mc" style="font-size:14px;margin-bottom:14px">このいちごが生まれた、系譜。</div>' +
    '<svg class="link" id="wires"></svg>' +
    '<div class="gen">' + node('', '祖父A-1', l.ss) + node('', '祖母A-2', l.sd) +
      node('', '祖父B-1', l.bms) + node('', '祖母B-2', l.dd) + '</div>' +
    '<div class="gen2">' + node('p', '親 A', l.sire, imgFor(l.sire)) + node('p', '親 B', l.dam, imgFor(l.dam)) + '</div>' +
    '<div class="gen3">' + node('me', '', l.name, l.img) + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:18px">' +
      '<div class="traits" style="grid-template-columns:1fr;gap:0"><h5>受け継いだ特性</h5>' +
        l.traitL.map(function (x, i) { return '<li><span class="ic">' + (i ? tIc('wave') : tIc('sun')) + '</span>' + x + '</li>'; }).join('') + '</div>' +
      '<div class="traits r" style="grid-template-columns:1fr;gap:0"><h5>受け継いだ特性</h5>' +
        l.traitR.map(function (x, i) { return '<li><span class="ic">' + (i ? tIc('temp') : tIc('shield')) + '</span>' + x + '</li>'; }).join('') + '</div>' +
    '</div>' +
    '<div class="taphint">☝　タップでそれぞれのいちごの詳細を見られます</div>' +
    '<div class="sec"><b>INBREEDING</b><span>近交係数</span></div>' +
    '<div class="ped2">' +
      '<div class="pc big" style="grid-area:s"><b>父</b><span>' + l.sire + '</span></div>' +
      '<div class="pc" style="grid-area:ss"><b>父の父</b><span>' + l.ss + '</span></div>' +
      '<div class="pc" style="grid-area:sd"><b>父の母</b><span>' + l.sd + '</span></div>' +
      '<div class="pc big" style="grid-area:d"><b>母</b><span>' + l.dam + '</span></div>' +
      '<div class="pc bms" style="grid-area:ds"><b>母の父</b><span>' + l.bms + '</span></div>' +
      '<div class="pc" style="grid-area:dd"><b>母の母</b><span>' + l.dd + '</span></div>' +
    '</div>' +
    '<div class="pedfoot"><span>' + l.cross + '</span><span>F = ' + l.ci.toFixed(3) + '</span></div>' +
  '</div>';
}

function wireTree() {
  var tr = $('#tree'), sv = $('#wires'); if (!tr || !sv) return;
  var box = tr.getBoundingClientRect();
  var g = $$('.gen .node', tr), p = $$('.gen2 .node', tr), me = $('.gen3 .node', tr);
  var c = function (el, edge) {
    var r = $('.ph', el).getBoundingClientRect();
    return { x: r.left - box.left + r.width / 2, y: (edge === 'top' ? r.top : r.bottom) - box.top };
  };
  var d = '', rd = '';
  [[0, 1, 0], [2, 3, 1]].forEach(function (grp) {
    var pa = c(p[grp[2]], 'top'), mid = (c(g[grp[0]], 'bottom').y + pa.y) / 2;
    [grp[0], grp[1]].forEach(function (i) {
      var a = c(g[i], 'bottom');
      d += 'M' + a.x + ' ' + a.y + ' V' + mid + ' H' + pa.x + ' V' + pa.y + ' ';
    });
  });
  var mt = c(me, 'top'), mid2 = (c(p[0], 'bottom').y + mt.y) / 2;
  [0, 1].forEach(function (i) {
    var a = c(p[i], 'bottom');
    rd += 'M' + a.x + ' ' + a.y + ' V' + mid2 + ' H' + mt.x + ' V' + mt.y + ' ';
  });
  sv.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
  sv.style.height = box.height + 'px';
  sv.innerHTML = '<path d="' + d + '"/><path class="r" d="' + rd + '"/>';
  $$('path', sv).forEach(function (x) {
    var len = 0; try { len = x.getTotalLength(); } catch (e) { len = 600; }
    x.style.setProperty('--len', len);
  });
}
function brdHTML(l) {
  var b = l.breeder;
  return '<div class="brd">' +
    '<div class="ph" style="background-image:url(' + b.photo + ')"><em>いちごの<br>未来を、<br>つくる仕事。</em></div>' +
    '<div><div class="lbl">育種責任者</div>' +
      '<div class="nm">' + b.name + '</div><div class="ro">' + b.roma + '</div>' +
      '<div class="qt">' + b.quote + '</div></div>' +
  '</div>' +
  '<p class="b" style="margin-top:14px">' + b.text + '</p>' +
  '<div class="bstat">' +
    '<div><div class="k">育種歴</div><div class="v"><span id="byr">0</span><em>年</em></div></div>' +
    '<div><div class="k">選抜</div><div class="v">' + b.seedlings + '<em>株</em></div></div>' +
    '<div><div class="k">開発</div><div class="v">' + b.dev + '<em>年</em></div></div>' +
  '</div>' +
  '<div class="lbl" style="margin-top:18px">KEYWORD</div>' +
  '<div class="chips">' + b.keys.map(function (k) { return '<span>' + k + '</span>'; }).join('') + '</div>' +
  '<div class="gal">' +
    '<figure class="rise"><div class="im" style="background-image:url(img/w1.png)"></div><figcaption>実生をひとつひとつ、見つめて。</figcaption></figure>' +
    '<figure class="rise"><div class="im" style="background-image:url(img/w2.png)"></div><figcaption>候補を、何度も食べ比べる。</figcaption></figure>' +
    '<figure class="rise"><div class="im" style="background-image:url(img/w3.png)"></div><figcaption>いちごの、あたらしい季節を。</figcaption></figure>' +
  '</div>';
}

/* =========================================================================
   RACE
   ========================================================================= */
var RS = { t: 0, tm: 0 };
V.race = function () {
  var v = $('#v-race');
  if (!S.owner) {
    v.innerHTML = '<div class="hero" style="height:230px"><div class="stage" data-shape="horses" data-dir="left" data-spread="70" style="position:absolute;inset:0"></div></div>' +
      '<div class="card"><div class="lbl">JUDGING</div>' +
      '<h2 class="copy" style="margin-top:12px">先に、応援する<br>一粒を決める。</h2>' +
      '<p class="b" style="margin-top:14px">審査は、苺主になってから意味を持ちます。</p>' +
      '<div class="cta"><button class="btn" data-go="home">出走表へ<span class="ar">→</span></button></div></div>';
    return;
  }
  renderRace(!!S.raced);
};
function renderRace(done) {
  var v = $('#v-race');
  v.innerHTML =
    '<div class="hero" style="height:210px"><div class="stage" data-shape="horses" data-dir="left" data-spread="62" style="position:absolute;inset:0"></div></div>' +
    '<div class="rail2"><i id="r2"></i></div>' +
    '<div class="phase">' + ['PADDOCK', 'EXPERT', 'CLUB VOTE', 'RESULT'].map(function (p, i) {
      return '<span data-p="' + i + '">' + p + '</span>'; }).join('') + '</div>' +
    '<div class="pad"><div class="sec"><b>LIVE JUDGING</b><span id="clk">00:00</span></div></div>' +
    '<div class="board" id="board" style="height:' + (6 * 56) + 'px">' +
      LINES.map(function (l, i) {
        return '<div class="lrow" data-i="' + i + '" style="transform:translateY(' + (i * 56) + 'px)">' +
          '<span class="pos">' + (i + 1) + '</span><span class="wk" style="background:' + l.wc + '"></span>' +
          '<span class="nm">' + l.name + '</span><span class="sc">0.0</span>' +
          '<span class="bar"><i></i></span></div>';
      }).join('') + '</div>' +
    '<div class="pad"><div class="jgrid" id="jg">' + JUDGES.map(function (j, i) {
      return '<div data-j="' + i + '"><b>' + j.n + '</b><span>WAIT</span></div>'; }).join('') + '</div>' +
      '<div class="cta"><button class="btn o" id="skip">' + (done ? '結果を見る' : '結果まで飛ばす') + '</button></div>' +
    '</div><div style="height:20px"></div>';
  $('#skip').onclick = function () { stopRace(); endRace(); };
  if (done) { paint(1); return; }
  startRace();
}
function startRace() {
  stopRace(); RS.t = 0;
  RS.tm = setInterval(function () {
    RS.t += .1;
    if (RS.t >= 24) { stopRace(); endRace(); return; }
    paint(RS.t / 24);
  }, 100);
}
function stopRace() { clearInterval(RS.tm); RS.tm = 0; }
function paint(k) {
  var r = $('#r2'); if (!r) return;
  r.style.width = (k * 100) + '%';
  var c = $('#clk'); if (c) c.textContent = '00:' + String(Math.round(k * 24)).padStart(2, '0');
  var ph = k < .13 ? 0 : k < .62 ? 1 : k < .9 ? 2 : 3;
  $$('.phase span').forEach(function (s) { s.classList.toggle('on', +s.dataset.p === ph); });
  var jd = Math.max(0, Math.min(5, Math.floor((k - .13) / .098)));
  $$('#jg div').forEach(function (d, i) {
    d.classList.toggle('on', i < jd);
    $('span', d).textContent = i < jd ? 'IN' : (i === jd ? 'JUDGING' : 'WAIT');
  });
  var ck = Math.max(0, Math.min(1, (k - .62) / .28));
  var vals = LINES.map(function (l, i) {
    var e = 0; for (var j = 0; j < jd; j++) e += jScore(j, i);
    e = jd ? e / jd : 0;
    var cf = jd / 5, m = Math.max.apply(null, CLUB);
    return .7 * e * cf + .3 * (CLUB[i] / m) * ck;
  });
  var ord = vals.map(function (v, i) { return { i: i, v: v }; }).sort(function (a, b) { return b.v - a.v; });
  var mx = Math.max.apply(null, vals) || 1;
  ord.forEach(function (o, rank) {
    var row = $('.lrow[data-i="' + o.i + '"]');
    row.style.transform = 'translateY(' + (rank * 56) + 'px)';
    $('.pos', row).textContent = rank + 1;
    $('.sc', row).textContent = (o.v * 100).toFixed(1);
    $('.bar i', row).style.width = (o.v / mx * 100) + '%';
    row.classList.toggle('lead', rank === 0);
  });
  if (k > .93) {
    var st = $('#v-race .stage');
    if (st && st.dataset.shape !== LINES[WIN].shape) {
      st.dataset.shape = LINES[WIN].shape; st.dataset.dir = 'radial';
      if (cur === 'race') stageNow();
    }
  }
}
function endRace() { paint(1); S.raced = true; save(); if (cur === 'race') setTimeout(function () { go('result'); }, 820); }

/* =========================================================================
   RESULT
   ========================================================================= */
V.result = function () {
  var w = LINES[WIN], v = $('#v-result'), pl = S.owner ? placeOf(S.owner) : 0;
  v.innerHTML =
    '<div class="hero" style="height:320px">' +
      '<div class="stage" data-shape="' + w.shape + '" data-dir="right" data-spread="84" style="position:absolute;inset:10px 0 30px"></div>' +
      '<div class="rings" style="top:54px"><i></i><i></i><i></i></div></div>' +
    '<div class="card" style="text-align:center">' +
      '<div class="lbl">WINNER　枠' + w.no + '　' + w.name + '</div>' +
      '<h1 class="big" id="crown" style="margin-top:14px;font-size:44px">' + CROWN.name + '</h1>' +
      '<div class="lbl" style="margin-top:10px">' + CROWN.kana + '　/　' + CROWN.roma + '</div>' +
      '<p class="b" style="margin-top:20px">この一系統だけが正式な品種名を持ち、<br>翌年から生産をひろげる。</p>' +
      '<div class="sec" style="text-align:left"><b>WHAT IT MEANS</b><span>日本初</span></div>' +
      '<p class="b" style="margin-top:14px;text-align:left">5月末まで品質が落ちない系統が日本一になった。それは、夏に食べられるいちごが生まれたということ。</p>' +
      (S.owner ? '<div class="sec" style="text-align:left"><b>YOUR LINE</b><span>' + (S.no || '') + '</span></div>' +
        '<div class="row"><span class="wk" style="background:' + L(S.owner).wc + '"></span>' +
        '<span class="k">' + L(S.owner).name + '</span><span class="v">' + pl + '<em>着</em></span></div>' +
        '<p class="b" style="margin-top:14px;text-align:left">' +
        (S.owner === w.no ? '応援した系統が勝った。翌年、この系統は交配親になる。'
                          : '届かなかった。出走した6系統は、すべて翌年の交配親として残る。') + '</p>' : '') +
      '<div class="cta"><button class="btn" data-go="club">クラブへ<span class="ar">→</span></button></div>' +
    '</div><div style="height:24px"></div>';
  charReveal($('#crown'), 420, 90);
};

/* =========================================================================
   CLUB
   ========================================================================= */
var cSel = [];
V.club = function () {
  var v = $('#v-club'), mine = S.owner ? L(S.owner) : null, w = LINES[WIN];
  v.innerHTML =
    '<div class="hero" style="height:210px"><div class="stage" data-shape="dna" data-dir="radial" data-spread="24" style="position:absolute;inset:0"></div></div>' +
    '<div class="card">' +
      '<div class="lbl">OWNERS CLUB</div>' +
      '<h2 class="copy" id="ccopy" style="margin-top:10px">苺主になる、<br>ということ。</h2>' +
      '<p class="b" style="margin-top:14px">決められるのは、どれを応援するかだけ。オッズも馬券も賞金もありません。結果は自分では選べない。</p>' +
      (mine ? '<div class="row" style="margin-top:12px"><span class="wk" style="background:' + mine.wc + '"></span>' +
        '<span class="k">応援している系統</span><span class="v">' + mine.name + '</span></div>' +
        '<div class="row"><span class="k">苺主番号</span><span class="v">' + (S.no || '') + '</span></div>' +
        '<div class="row"><span class="k">第1回 苺優駿</span><span class="v">' +
        (S.raced ? placeOf(S.owner) + '<em>着</em>' : '未審査') + '</span></div>'
       : '<p class="b" style="margin-top:12px">まだ系統を選んでいません。</p>') +
      '<div class="sec"><b>CROSSING</b><span>設計してみる</span></div>' +
      '<p class="b" style="margin-top:12px">交配親を2つ選ぶ。生まれる系統は自分では決められない。形質は確率で受け継がれ、番号が振られる。</p>' +
      '<div class="pick" id="pick" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-top:14px">' +
        LINES.map(function (l, i) {
          return '<button data-i="' + i + '" style="border:1px solid var(--line);border-radius:14px;padding:12px 6px;text-align:center">' +
            '<span style="display:block;width:16px;height:16px;margin:0 auto;border-radius:4px;border:1px solid rgba(0,0,0,.16);background:' + l.wc + '"></span>' +
            '<span class="nm2" style="display:block;margin-top:8px;font-size:11px">' + l.name + '</span></button>';
        }).join('') + '</div>' +
      '<div class="cta"><button class="btn" id="cross" disabled>交配する<span class="ar">→</span></button></div>' +
      '<div id="cout"></div>' +
      (S.child ? childCard(S.child) : '') +
      '<div class="sec"><b>2028 ENTRIES</b><span>第2回 出走候補</span></div>' +
      nextYear().map(function (e) {
        return '<div class="row"><span class="wk" style="background:' + e.wc + '"></span>' +
          '<span class="k">' + e.ln + '</span><span class="v" style="font-size:10px;letter-spacing:.12em">' + e.p + '</span></div>';
      }).join('') +
      '<p class="b" style="margin-top:14px">' + CROWN.name + ' は走らない。翌年からは、その子が走る。</p>' +
      '<div class="sec"><b>QUESTIONS</b><span>想定問答</span></div>' +
      QA.map(function (q) {
        return '<div class="qa"><button><span class="q">' + q[0] + '</span><span class="pm"></span></button>' +
          '<div class="a"><p>' + q[1] + '</p></div></div>';
      }).join('') +
      '<div class="sec"><b>CREDIT</b><span>2027</span></div>' +
      '<p class="b" style="margin-top:12px">企画：桑田航希　／　CULTA 課題提出用のプロトタイプ。</p>' +
    '</div><div style="height:24px"></div>';
  charReveal($('#ccopy'), 60, 34);
  $$('#pick button').forEach(function (b) {
    b.onclick = function () {
      var i = +b.dataset.i, at = cSel.indexOf(i);
      if (at >= 0) cSel.splice(at, 1); else { if (cSel.length === 2) cSel.shift(); cSel.push(i); }
      $$('#pick button').forEach(function (x) {
        var s = cSel.indexOf(+x.dataset.i) >= 0;
        x.style.borderColor = s ? '#111' : ''; x.style.background = s ? '#111' : '';
        $('.nm2', x).style.color = s ? '#fff' : '';
      });
      $('#cross').disabled = cSel.length !== 2;
    };
  });
  $('#cross').onclick = function () {
    var c = cross(LINES[cSel[0]], LINES[cSel[1]]); S.child = c; save();
    $('#cout').innerHTML = childCard(c);
    $('#cout').firstElementChild.classList.add('fade');
    toast('NEW LINE ' + c.ln);
  };
  $$('.qa button', v).forEach(function (b) {
    b.onclick = function () {
      var qa = b.parentNode, a = $('.a', qa), o = qa.classList.toggle('open');
      a.style.maxHeight = o ? a.scrollHeight + 'px' : 0;
    };
  });
};
function nextYear() {
  var o = [
    { ln: 'i-28-02', wc: '#E4002B', p: CROWN.name + ' × クロガネ' },
    { ln: 'i-28-05', wc: '#111', p: CROWN.name + ' × トキワ' },
    { ln: 'i-28-09', wc: '#1B4FD8', p: 'カゼカオル × ' + CROWN.name }
  ];
  if (S.child) o.unshift({ ln: S.child.ln, wc: '#E8B800', p: S.child.a + ' × ' + S.child.b });
  return o;
}
function cross(a, b) {
  var mid = function (x, y, s) { return (x + y) / 2 + (Math.random() - .5) * s; };
  var an = function (l) { return [l.sire, l.dam, l.bms]; };
  var sh = an(a).filter(function (x) { return an(b).indexOf(x) >= 0; }).length;
  return {
    ln: 'i-28-' + String(1 + Math.floor(Math.random() * 40)).padStart(2, '0'),
    a: a.name, b: b.name,
    brix: mid(a.brix, b.brix, 1.1).toFixed(1),
    firm: Math.round(mid(a.firm, b.firm, 12)),
    wt: mid(a.wt, b.wt, 4).toFixed(1),
    form: Math.random() < .5 ? a.form : b.form,
    ci: (0.0625 * sh + (a.ci + b.ci) / 4).toFixed(3)
  };
}
function childCard(c) {
  return '<div style="border:1px solid #111;border-radius:22px;padding:20px;margin-top:18px">' +
    '<div class="lbl">YOUR LINE</div>' +
    '<div class="en" style="font-size:20px;letter-spacing:.12em;margin-top:8px">' + c.ln + '</div>' +
    '<div class="row" style="margin-top:10px"><span class="k">両親</span><span class="v" style="font-size:11px">' + c.a + ' × ' + c.b + '</span></div>' +
    '<div class="row"><span class="k">糖度</span><span class="v">' + c.brix + '</span></div>' +
    '<div class="row"><span class="k">果実硬度</span><span class="v">' + c.firm + '</span></div>' +
    '<div class="row"><span class="k">一果重</span><span class="v">' + c.wt + '<em>g</em></span></div>' +
    '<div class="row" style="border:0"><span class="k">近交係数</span><span class="v">' + c.ci + '</span></div></div>';
}

/* =========================================================================
   起動：最初の2.4秒
   ========================================================================= */
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-go]'); if (t) go(t.dataset.go);
});
chrome();
Field.init($('#field'));
Field.preload(['berry1', 'berry2', 'berry3', 'berry4', 'berry5', 'berry6', 'horses', 'dna'], function () {
  var st = Q.get('v') || '';
  var start = (location.hash || '').replace('#', '');
  go(V[start] ? start : (S.owner ? (S.raced ? 'club' : 'race') : 'home'));
  intro();
});
function intro() {
  if (cur !== 'home') { $('#sub1').classList.remove('pre'); return; }
  var d = SLOW ? 0 : 1;
  setTimeout(function () { $$('#deco .xh,#deco .sq').forEach(function (e, i) { on(e, 'on', i * 60); }); }, 200 * d);
  charReveal($('#ttl'), 620 * d, 120 * d);
  setTimeout(function () { $('#sub1').classList.remove('pre'); }, 1100 * d);
  setTimeout(function () { on($('#hcard'), 'on', 0); }, 1500 * d);
  if (!d) { $('#hcard').classList.add('on'); $$('#deco .xh,#deco .sq').forEach(function (e) { e.classList.add('on'); }); }
}
window.addEventListener('resize', function () { setTimeout(stageNow, 80); });
})();
