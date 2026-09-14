/* =========================================================================
   app.js — 新・いちご優駿 ｜ 旬を、走り切れ。
   1画面に1つの仕事。ホームは「選ぶ」だけ、図鑑は「知る」だけ。
   ========================================================================= */
(function () {
'use strict';
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
var Q = new URLSearchParams(location.search);
var SLOW = matchMedia('(prefers-reduced-motion: reduce)').matches || Q.get('still') === '1';
var S = (function () { try { return JSON.parse(localStorage.getItem('iy27') || '{}'); } catch (e) { return {}; } })();
function save() { try { localStorage.setItem('iy27', JSON.stringify(S)); } catch (e) {} }
if (Q.get('demo')) { S.owner = +Q.get('demo'); S.no = S.no || 'ICY-2027-4821'; }

var IC = {
  sun:'<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="3.4"/><path d="M10 1.6v2.3M10 16.1v2.3M1.6 10h2.3M16.1 10h2.3M4.1 4.1l1.6 1.6M14.3 14.3l1.6 1.6M15.9 4.1l-1.6 1.6M5.7 14.3l-1.6 1.6"/></svg>',
  wave:'<svg viewBox="0 0 20 20"><path d="M2 12.8c2-3.4 4-3.4 6 0s4 3.4 6 0 3-2.6 4-1.5"/><path d="M2 7.6c2-3.4 4-3.4 6 0s4 3.4 6 0 3-2.6 4-1.5"/></svg>',
  drop:'<svg viewBox="0 0 20 20"><path d="M10 2.2C7.2 5.7 4.2 8.7 4.2 12A5.8 5.8 0 0 0 15.8 12C15.8 8.7 12.8 5.7 10 2.2z"/></svg>',
  shield:'<svg viewBox="0 0 20 20"><path d="M10 2 3.4 4.7v5.2c0 3.7 2.6 6.4 6.6 7.4 4-1 6.6-3.7 6.6-7.4V4.7z"/><path d="M7.2 10l2 2 3.6-3.8"/></svg>',
  temp:'<svg viewBox="0 0 20 20"><path d="M12.1 11.4V4.1a2.1 2.1 0 1 0-4.2 0v7.3a3.7 3.7 0 1 0 4.2 0z"/><path d="M10 7.2v5.6"/></svg>',
  heart:'<svg viewBox="0 0 22 20"><path d="M11 18.3S2.2 12.7 2.2 6.9A4.3 4.3 0 0 1 11 5a4.3 4.3 0 0 1 8.8 1.9c0 5.8-8.8 11.4-8.8 11.4z"/></svg>',
  back:'<svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5"/></svg>',
  next:'<svg viewBox="0 0 16 16"><path d="M6 3l5 5-5 5"/></svg>',
  x:'<svg viewBox="0 0 16 16"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>'
};
function bars(root, d) {
  setTimeout(function () { $$('[data-w]', root).forEach(function (b, i) {
    setTimeout(function () { b.style.width = b.dataset.w + '%'; }, i * 55); }); }, d || 90);
}
function rise(root, d) {
  setTimeout(function () { $$('.rise', root).forEach(function (e, i) {
    setTimeout(function () { e.classList.add('on'); }, i * 45); }); }, d || 40);
}
function toast(t) {
  var e = $('#toast'); e.textContent = t; e.classList.add('on');
  clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove('on'); }, 2000);
  if (navigator.vibrate) try { navigator.vibrate(8); } catch (x) {}
}
function sign(n) { return (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n); }

/* ---------- ルーター ---------- */
var cur = '', V = {}, TAB = { home: 1, club: 1, about: 1 };
function go(name) {
  if (name === cur) return;
  var from = $('#v-' + cur), to = $('#v-' + name); if (!to) return;
  if (from) { from.classList.add('out'); from.classList.remove('on'); setTimeout(function () { from.classList.remove('out'); }, 240); }
  cur = name;
  document.body.classList.toggle('nofoot', !TAB[name]);
  $$('#tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.go === name); });
  V[name](); void to.offsetHeight; to.classList.add('on');
  setTimeout(stage, 24);
}
function stage() {
  var v = $('#v-' + cur), st = v && $('.stage', v);
  if (!st) { Field.hide(); return; }
  if (st.dataset.strip) { Field.strip(LINES.map(function (l) { return l.shape; }), st, { index: idx, onIndex: onIdx, onFrame: onFrame }); return; }
  Field.apply(st.dataset.shape, st, { dir: 'right', spread: st.dataset.spread ? +st.dataset.spread : 110 });
}

/* =========================================================================
   HOME — 選ぶ
   ========================================================================= */
var idx = Math.max(0, Math.min(5, +(Q.get('line') || 0)));
V.home = function () {
  var v = $('#v-home');
  if (!v._b) {
    v._b = 1;
    v.innerHTML =
      '<div class="hwrap">' +
        '<div class="hbar"><svg viewBox="0 0 44 24"><path d="M3 22 L10 7 L16 15 L22 3 L28 15 L34 7 L41 22 Z"/></svg>' +
          '<b>新・いちご優駿</b></div>' +
        '<div class="hsub">旬を、走り切れ。</div>' +
        '<div class="rbar"><div class="rail">' + RACE.legs.map(function (g, i) {
          return '<b class="' + (i < RACE.now ? 'on' : i === RACE.now ? 'last' : '') +
            '" style="left:calc(4.5px + (100% - 9px) * ' + (i / 5) + ')"></b>'; }).join('') + '</div>' +
          '<div class="rms"><span' + (RACE.now < 2 ? ' class="on"' : '') + '>3月</span>' +
          '<span' + (RACE.now > 1 && RACE.now < 4 ? ' class="on"' : '') + '>4月</span>' +
          '<span' + (RACE.now > 3 ? ' class="on"' : '') + '>5月末</span></div></div>' +
        '<div class="stagewrap">' +
          '<div class="stage" id="strip" data-strip="1"></div>' +
          '<div class="hits" id="hits"></div>' +
          '<button class="chev l" id="cL">' + IC.back + '</button>' +
          '<button class="chev r" id="cR"><svg viewBox="0 0 16 16"><path d="M6 3l5 5-5 5"/></svg></button>' +
        '</div>' +
        '<div class="hname" id="hname"></div>' +
        '<div class="hdots" id="dots">' + LINES.map(function (l, i) {
          return '<button data-i="' + i + '" aria-label="' + l.no + '号"></button>'; }).join('') + '</div>' +
        '<div class="hstat" id="hstat"></div>' +
        '<div class="hfoot"><div class="cta">' +
          '<button class="btn" id="open"><span id="openT"></span><span class="ar">→</span></button>' +
          '<button class="icbtn" id="fav">' + IC.heart + '</button></div></div>' +
      '</div>';
    Field.strip(LINES.map(function (l) { return l.shape; }), $('#strip'), { index: idx, onIndex: onIdx, onFrame: onFrame });
    var t = $('#hits'), down = false, lx = 0;
    t.addEventListener('pointerdown', function (e) { down = true; t._m = 0; lx = e.clientX; try { t.setPointerCapture(e.pointerId); } catch (x) {} });
    t.addEventListener('pointermove', function (e) { if (!down) return; var d = e.clientX - lx; lx = e.clientX; t._m += Math.abs(d); Field.spin(d); });
    var up = function () { if (!down) return; down = false; Field.release(); };
    t.addEventListener('pointerup', up); t.addEventListener('pointercancel', up);
    t.addEventListener('click', function (e) {
      if (t._m > 8) return;
      var b = e.target.closest('.hit'); if (!b) return;
      var i = +b.dataset.i;
      if (i === idx) go('dex'); else Field.ringTo(i);
    });
    t.addEventListener('wheel', function (e) { e.preventDefault(); Field.spin(e.deltaY > 0 ? -26 : 26);
      clearTimeout(t._w); t._w = setTimeout(function () { Field.release(); }, 130); }, { passive: false });
    $('#cL').onclick = function () { Field.ringTo((idx + 5) % 6); };
    $('#cR').onclick = function () { Field.ringTo((idx + 1) % 6); };
    $$('#dots button').forEach(function (b) { b.onclick = function () { Field.ringTo(+b.dataset.i); }; });
    $('#open').onclick = function () { go('dex'); };
    $('#fav').onclick = function () { var l = LINES[idx]; S.fav = S.fav === l.no ? 0 : l.no; save();
      $('#fav').classList.toggle('on', S.fav === l.no); };
  }
  paintHome();
};
function onIdx(i) { idx = i; paintHome(); }
function onFrame(slots) {
  var ht = $('#hits'); if (!ht) return;
  if (ht.children.length !== slots.length) ht.innerHTML = slots.map(function () { return '<button class="hit"></button>'; }).join('');
  for (var i = 0; i < slots.length; i++) {
    var s = slots[i], h = ht.children[i];
    var vis = s.ad <= 2.6, w = s.ad < 1 ? 148 : s.ad < 2 ? 86 : 58;
    h.dataset.i = s.i;
    h.style.left = (s.x - w / 2) + 'px'; h.style.width = w + 'px';
    h.style.display = vis ? 'block' : 'none';
  }
}
function paintHome() {
  var l = LINES[idx], r = rankAt(RACE.now, l.no), gap = l.race[RACE.now] - l.race[0];
  $$('#dots button').forEach(function (x, i) { x.classList.toggle('on', i === idx); });
  var n = $('#hname'); if (!n) return;
  n.innerHTML = '<div class="no' + (r === 1 ? ' w' : '') + '">' +
      (r === 1 ? RACE.year + ' 優駿　WINNER' : 'CANDIDATE No.0' + l.no) + '</div>' +
    '<div class="nm">' + l.name + '</div><div class="kj">' + l.kanji + '　' + l.ln + '</div>';
  $('#hstat').innerHTML =
    '<div><div class="k">最終順位</div><div class="v num' + (r === 1 ? ' w' : '') + '">' + r + '<em>位</em></div></div>' +
    '<div><div class="k">5月の糖度</div><div class="v num">' + l.brix + '</div></div>' +
    '<div><div class="k">3月比</div><div class="v num ' + (gap >= 0 ? 'up' : 'dn') + '">' + sign(gap) + '</div></div>';
  $('#openT').textContent = l.name + 'を見る';
  $('#fav').classList.toggle('on', S.fav === l.no);
}

/* =========================================================================
   図鑑 — 知る
   ========================================================================= */
var DTABS = ['経過', '能力', '血統', '育種者'];
var dTab = Math.max(0, Math.min(3, +(Q.get('tab') || 0)));
V.dex = function () {
  var l = LINES[idx], v = $('#v-dex'), win = rankAt(RACE.now, l.no) === 1;
  v.innerHTML =
    '<div class="dbar"><button id="cls">' + IC.back + '一覧へ</button>' +
      '<button id="fav2" style="color:' + (S.fav === l.no ? 'var(--rd)' : 'var(--g2)') + '">' + IC.heart + '</button></div>' +
    '<div class="dhero"><div class="stage" data-shape="' + l.shape + '" data-spread="96"></div></div>' +
    '<div class="dhead"><div class="no' + (win ? ' w' : '') + '">' +
      (win ? RACE.year + ' 新・いちご優駿　WINNER' : 'CANDIDATE No.0' + l.no) + '</div>' +
      '<div class="nm">' + l.name + '</div>' +
      '<div class="cp">' + l.copy[0] + l.copy[1] + '</div></div>' +
    '<div class="seg q4" id="seg"><i class="ink"></i>' +
      DTABS.map(function (t, i) {
        return '<button data-t="' + i + '"' + (i === dTab ? ' class="on"' : '') + '>' + t + '</button>'; }).join('') + '</div>' +
    '<div class="dbody" id="dbody"></div>' +
    '<div class="dfoot"><button class="btn" id="own">' +
      (S.owner === l.no ? 'いちご券を見る' : 'このいちご券を購入する') +
      '<span class="ar">→</span></button></div>';
  $('#cls').onclick = function () { go('home'); };
  $('#fav2').onclick = function () { S.fav = S.fav === l.no ? 0 : l.no; save();
    $('#fav2').style.color = S.fav === l.no ? 'var(--rd)' : 'var(--g2)'; };
  $('#own').onclick = function () { issue(l); };
  $$('#seg button').forEach(function (b) { b.onclick = function () { dTab = +b.dataset.t; paintTabs(); }; });
  paintTabs();
  if (Q.get('tk') === '1') setTimeout(function () { issue(l); }, 260);   /* 撮影・デモ用 */
};
function paintTabs() {
  var l = LINES[idx];
  $$('#seg button').forEach(function (b, i) { b.classList.toggle('on', i === dTab); });
  var b = $$('#seg button')[dTab], ink = $('#seg .ink');
  if (b && ink) { ink.style.width = b.offsetWidth + 'px'; ink.style.transform = 'translateX(' + b.offsetLeft + 'px)'; }
  var t = $('#dbody');
  t.innerHTML = dTab === 0 ? runs(l) : dTab === 1 ? abil(l) : dTab === 2 ? tree(l) : brd(l);
  t.scrollTop = 0;
  if (dTab === 0) setTimeout(function () { var e = $('#runs'); if (e) e.classList.add('go'); }, 90);
  if (dTab === 1) radar(l);
  if (dTab === 2) { wire(); setTimeout(function () { var e = $('.tree'); if (e) e.classList.add('on'); }, 80); }
  rise(t, 60);
}

/* --- 経過：春をどう走ったか --------------------------------------------- */
var CX0 = 30, CX1 = 310, CY0 = 16, CYG = 24;
function cx(i) { return CX0 + i * (CX1 - CX0) / 5; }
function cy(r) { return CY0 + (r - 1) * CYG; }
function rpath(no) { return rankSeq(no).map(function (r, i) { return (i ? 'L' : 'M') + cx(i).toFixed(1) + ' ' + cy(r); }).join(' '); }
function runs(l) {
  var me = rankSeq(l.no), g = '', others = '', r, i;
  for (r = 1; r <= 6; r++) {
    g += '<line class="g" x1="' + CX0 + '" y1="' + cy(r) + '" x2="' + CX1 + '" y2="' + cy(r) + '"/>' +
         '<text class="rk" x="' + (CX0 - 11) + '" y="' + (cy(r) + 3.6) + '">' + r + '</text>';
  }
  for (i = 0; i < 6; i++) g += '<line class="v" x1="' + cx(i) + '" y1="' + cy(1) + '" x2="' + cx(i) + '" y2="' + cy(6) + '"/>';
  LINES.forEach(function (o) { if (o.no !== l.no) others += '<path class="o" d="' + rpath(o.no) + '"/>'; });
  var dots = me.map(function (rr, k) {
    return '<circle class="d' + (k === RACE.now ? ' last' : '') + '" cx="' + cx(k) + '" cy="' + cy(rr) +
      '" r="' + (k === RACE.now ? 5 : 3.2) + '"/>'; }).join('');
  var mons = [[0, 1, '3月'], [2, 3, '4月'], [4, 5, '5月']].map(function (m) {
    return '<text class="mo" x="' + ((cx(m[0]) + cx(m[1])) / 2) + '" y="' + (cy(6) + 26) + '">' + m[2] + '</text>'; }).join('');
  var gap = l.race[RACE.now] - l.race[0];

  return '<div class="runs rise" id="runs">' +
      '<div class="rhd"><b>順位の推移</b><span>' + RACE.year + '　3/10 → 5/25</span></div>' +
      '<svg class="rchart" viewBox="0 0 320 186">' + g + others +
        '<path class="me" d="' + rpath(l.no) + '"/>' + dots + mons + '</svg>' +
      '<div class="rsum"><div><span>3月</span><b>' + me[1] + '位</b></div>' +
        '<div><span>4月</span><b>' + me[3] + '位</b></div>' +
        '<div><span>5月末</span><b class="' + (me[5] === 1 ? 'w' : '') + '">' + me[5] + '位</b></div>' +
        '<div><span>3月比</span><b class="' + (gap >= 0 ? 'up' : 'dn') + '">' + sign(gap) + '</b></div></div>' +
    '</div>' +
    '<p class="note rise">' + l.note + '</p>' +
    '<div class="legs rise">' + RACE.legs.map(function (x, k) {
      return '<div' + (k === RACE.now ? ' class="on"' : '') + '><span class="dt num">' + x.d + '</span>' +
        '<span class="tt">' + x.t + '</span><span class="sc num">' + l.race[k] + '</span>' +
        '<span class="rr num">' + rankAt(k, l.no) + '位</span></div>'; }).join('') + '</div>' +
    '<div style="height:20px"></div>';
}

/* --- 能力 --- */
var RAX = ['甘さ', '香り', '硬さ', '酸味', '果汁'], RR = 58, RC = 96;
function rpt(i, f) { var a = -Math.PI / 2 + i * Math.PI * 2 / 5; return [RC + Math.cos(a) * RR * f, RC + Math.sin(a) * RR * f]; }
function abil(l) {
  var web = '';
  [1, .75, .5, .25].forEach(function (f) {
    web += '<polygon class="web" points="' + RAX.map(function (k, i) { return rpt(i, f).join(','); }).join(' ') + '"/>'; });
  RAX.forEach(function (k, i) { var p = rpt(i, 1); web += '<line class="ax" x1="' + RC + '" y1="' + RC + '" x2="' + p[0] + '" y2="' + p[1] + '"/>'; });
  var labs = RAX.map(function (k, i) {
    var p = rpt(i, 1.32), an = i === 0 ? 'middle' : (p[0] > RC + 4 ? 'start' : 'end'), dy = i === 0 ? -11 : (p[1] > RC ? 13 : 0);
    return '<text class="rn" x="' + p[0] + '" y="' + (p[1] + dy) + '" text-anchor="' + an + '">' + k + '</text>' +
           '<text class="rv" x="' + p[0] + '" y="' + (p[1] + dy + 16) + '" text-anchor="' + an + '">' + l.radar[k] + '</text>';
  }).join('');
  return '<div class="ahd rise"><b>最終計測</b><span>5月25日</span></div>' +
    '<div class="radarbox rise"><svg class="radar" viewBox="0 0 192 192">' + web +
      '<polygon class="area" id="rarea" points="' + RAX.map(function () { return RC + ',' + RC; }).join(' ') + '"/>' +
      RAX.map(function (k, i) { var p = rpt(i, l.radar[k] / 100); return '<circle class="dot" cx="' + p[0] + '" cy="' + p[1] + '" r="3"/>'; }).join('') + labs + '</svg></div>' +
    '<p class="note rise">' + l.flavor + '</p>' +
    '<div class="dl rise">' + [['糖度 Brix', l.brix], ['酸度', l.acid], ['糖酸比', (l.brix / l.acid).toFixed(1)],
      ['果実硬度', l.firm], ['一果重', l.wt + ' g'], ['果形', l.form], ['耐暑性', l.heat], ['産地', l.from]]
      .map(function (x) { return '<div><span>' + x[0] + '</span><b>' + x[1] + '</b></div>'; }).join('') + '</div>' +
    '<div style="height:20px"></div>';
}
function radar(l) {
  var a = $('#rarea'); if (!a) return;
  var T = RAX.map(function (k, i) { return rpt(i, l.radar[k] / 100); });
  if (SLOW) { a.setAttribute('points', T.map(function (p) { return p.join(','); }).join(' ')); return; }
  var t0 = performance.now();
  (function step(t) { var k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(2, -10 * k);
    a.setAttribute('points', T.map(function (p) { return (RC + (p[0] - RC) * e) + ',' + (RC + (p[1] - RC) * e); }).join(' '));
    if (k < 1) requestAnimationFrame(step); })(t0);
}

/* --- 血統 --- */
function imgFor(nm) { var h = 0; for (var i = 0; i < nm.length; i++) h = (h * 31 + nm.charCodeAt(i)) | 0; return LINES[Math.abs(h) % 6].img; }
function node(cls, cap, nm, img, show) {
  return '<button class="node ' + cls + '" data-n="' + nm + '"><div class="cap">' + cap + '</div>' +
    '<div class="ph" style="background-image:url(' + (img || imgFor(nm)) + ')"></div>' +
    '<div class="nm">' + (show || nm) + '</div></button>';
}
function tree(l) {
  return '<div class="tree rise" id="tree"><svg class="link" id="wires"></svg>' +
    '<div class="gen">' + node('', '祖父A', l.ss) + node('', '祖母A', l.sd) + node('', '祖父B', l.bms) + node('', '祖母B', l.dd) + '</div>' +
    '<div class="gen2">' + node('p', '親A', l.sire) + node('p', '親B', l.dam) + '</div>' +
    '<div class="gen3">' + node('me', '', l.name, l.img, l.no + '号') + '</div></div>' +
    '<div class="gcard rise" id="ginfo"></div>' +
    '<div class="inh rise"><div><h5>親Aから</h5>' +
      l.traitL.map(function (x, i) { return '<li><span class="ic">' + (i ? IC.wave : IC.sun) + '</span>' + x + '</li>'; }).join('') + '</div>' +
      '<div class="r"><h5>親Bから</h5>' +
      l.traitR.map(function (x, i) { return '<li><span class="ic">' + (i ? IC.temp : IC.shield) + '</span>' + x + '</li>'; }).join('') + '</div></div>' +
    '<div class="dl rise"><div><span>近交係数 F</span><b>' + l.ci.toFixed(3) + '</b></div>' +
      '<div><span>共通祖先</span><b style="font-family:var(--sans);font-weight:500;font-size:12px">' + l.cross + '</b></div></div>' +
    '<div style="height:20px"></div>';
}
function ginfo(nm, l) {
  var g = $('#ginfo'); if (!g) return;
  var a = ANC[nm] || [l.kanji, l.desc];
  g.innerHTML = '<div class="t"><b>' + nm + '</b>' + a[0] + '</div><div class="d">' + a[1] + '</div>';
  g.classList.remove('fade'); void g.offsetWidth; g.classList.add('fade');
}
function wire() {
  var tr = $('#tree'), sv = $('#wires'); if (!tr || !sv) return;
  var l = LINES[idx], box = tr.getBoundingClientRect();
  var g = $$('.gen .node', tr), p = $$('.gen2 .node', tr), me = $('.gen3 .node', tr);
  var c = function (el, edge) { var r = $('.ph', el).getBoundingClientRect();
    return { x: r.left - box.left + r.width / 2, y: (edge === 'top' ? r.top : r.bottom) - box.top }; };
  var d = '', rd = '';
  [[0, 1, 0], [2, 3, 1]].forEach(function (q) {
    var pa = c(p[q[2]], 'top'), mid = (c(g[q[0]], 'bottom').y + pa.y) / 2;
    [q[0], q[1]].forEach(function (i) { var a = c(g[i], 'bottom');
      d += 'M' + a.x + ' ' + a.y + ' V' + mid + ' H' + pa.x + ' V' + pa.y + ' '; });
  });
  var mt = c(me, 'top'), mid2 = (c(p[0], 'bottom').y + mt.y) / 2;
  [0, 1].forEach(function (i) { var a = c(p[i], 'bottom');
    rd += 'M' + a.x + ' ' + a.y + ' V' + mid2 + ' H' + mt.x + ' V' + mt.y + ' '; });
  sv.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height); sv.style.height = box.height + 'px';
  sv.innerHTML = '<path d="' + d + '"/><path class="r" d="' + rd + '"/>';
  $$('path', sv).forEach(function (x) { var n = 600; try { n = x.getTotalLength(); } catch (e) {} x.style.setProperty('--len', n); });
  $$('.node', tr).forEach(function (b) { b.onclick = function () {
    $$('.node', tr).forEach(function (o) { o.classList.remove('sel'); });
    b.classList.add('sel'); ginfo(b.dataset.n, l); }; });
  ginfo(l.bms, l);
  $$('.node', tr).forEach(function (b) { if (b.dataset.n === l.bms) b.classList.add('sel'); });
}

/* --- 育種者 --- */
function brd(l) {
  var b = l.breeder;
  return '<div class="brd rise"><div class="ph" style="background-image:url(' + b.photo + ')"><em>いちごの<br>未来を、<br>つくる仕事。</em></div>' +
    '<div><div class="role">育種責任者</div><div class="nm">' + b.name + '</div><div class="ro">' + b.roma + '</div>' +
    '<div class="qt">' + b.quote + '</div></div></div>' +
    '<p class="btext rise">' + b.text + '</p>' +
    '<div class="bstat rise"><div><div class="k">育種歴</div><div class="v">' + b.years + '<em>年</em></div></div>' +
    '<div><div class="k">選抜</div><div class="v">' + b.seedlings + '<em>株</em></div></div>' +
    '<div><div class="k">開発</div><div class="v">' + b.dev + '<em>年</em></div></div></div>' +
    '<div class="chips rise">' + b.keys.map(function (k) { return '<span>' + k + '</span>'; }).join('') + '</div>' +
    '<div class="gal rise">' +
      '<figure><div class="im" style="background-image:url(img/w1.webp)"></div><figcaption>実生をひとつひとつ、見つめて。</figcaption></figure>' +
      '<figure><div class="im" style="background-image:url(img/w2.webp)"></div><figcaption>隔週で、候補を食べ比べる。</figcaption></figure>' +
      '<figure><div class="im" style="background-image:url(img/w3.webp)"></div><figcaption>いちごの、あたらしい季節を。</figcaption></figure>' +
    '</div><div style="height:20px"></div>';
}


/* =========================================================================
   いちご券 — 印刷した実券をそのまま画面に起こす
   ========================================================================= */
function ticket(l) {
  return '<div class="tk"><img src="img/tk' + l.no + '.webp" decoding="async" alt="いちご券　' + l.no + '号 ' + l.name + '"></div>';
}
function tkline(l) {
  var r = rankAt(RACE.now, l.no), gap = l.race[RACE.now] - l.race[0];
  return '<div class="tkline"><b>' + l.no + '号　' + l.name + '</b>' +
    '<span>最終 ' + r + '着</span><span>3月比 ' + sign(gap) + '</span></div>';
}
function fitTicket(el, max) {
  var sh = $('#shell'), w = Math.min(max, (sh ? sh.clientWidth : 375) - 48);
  if (el) el.style.setProperty('--tw', w + 'px');
}
/* ---- 会員証 ---- */
function cardNo(c) {
  S.cno = S.cno || {};
  if (!S.cno[c.id]) S.cno[c.id] = c.code + '-' + RACE.year + '-' + (1000 + Math.floor(Math.random() * 8999));
  return S.cno[c.id];
}
function myClub() { for (var i = 0; i < CLUBS.length; i++) if (CLUBS[i].id === S.club) return CLUBS[i]; return null; }
function card(c) {
  var l = LINES[c.line - 1];
  return '<div class="cd" style="--ac:' + c.wc + '"><div class="cbg"></div><div class="cin">' +
    '<div class="ch"><b>CULTA　ICHIGO YUSHUN</b><span>OWNERS CLUB</span></div>' +
    '<div class="cnm">' + c.name + '</div>' +
    '<div class="cln"><span class="wk" style="background:' + l.wc + '"></span>' + l.no + '号　' + l.name + '</div>' +
    '<div class="cft"><div><span>MEMBER No.</span><b>' + cardNo(c) + '</b></div>' +
    '<div><span>ISSUED</span><b>' + RACE.year + '.05.25</b></div></div>' +
    '</div><div class="cbar"></div></div>';
}

/* 押した瞬間に弾けて、券や会員証がふわっと出てくる */
function pop(o) {
  var sh = $('#shell'), old = $('#tkw'); if (old) old.parentNode.removeChild(old);
  var dots = '', col = (!o.color || o.color === '#FFFFFF') ? '#a8a8a8' : o.color;
  for (var i = 0; i < 44; i++) {
    var a = Math.random() * 6.283, rr = 64 + Math.random() * 190;
    dots += '<i style="--x:' + Math.round(Math.cos(a) * rr) + 'px;--y:' + Math.round(Math.sin(a) * rr) +
      'px;animation-delay:' + (Math.random() * 90 | 0) + 'ms;background:' + (i % 4 ? 'var(--rd)' : col) + '"></i>';
  }
  var d = document.createElement('div'); d.id = 'tkw';
  var sr = sh.getBoundingClientRect(), bt = o.from && $(o.from);
  if (bt) { var br = bt.getBoundingClientRect();
    d.style.setProperty('--bx', Math.round(br.left + br.width / 2 - sr.left) + 'px');
    d.style.setProperty('--by', Math.round(br.top + br.height / 2 - sr.top) + 'px'); }
  d.innerHTML = '<div class="bkd"></div><div class="ring"></div><div class="ring b"></div>' +
    '<div class="burst">' + dots + '</div>' +
    '<div class="stg">' + o.art + '<div class="shine"></div></div>' +
    '<div class="msg"><b>' + o.title + '</b><span>' + o.sub + '</span>' +
      '<span class="id">' + o.id + '</span></div>' +
    '<button class="btn go">' + o.cta + '<span class="ar">→</span></button>';
  sh.appendChild(d);
  fitTicket($('.stg > div', d), o.max || 330);
  void d.offsetHeight;
  d.classList.add('on');
  if (navigator.vibrate) try { navigator.vibrate([6, 40, 14]); } catch (x) {}
  var close = function () { d.classList.remove('on');
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); if (o.then) o.then(); }, 240); };
  $('.go', d).onclick = close;
  $('.bkd', d).onclick = close;
}
function issue(l) {
  var first = S.owner !== l.no;
  S.owner = l.no; S.no = S.no || ('ICY-' + RACE.year + '-' + (1000 + Math.floor(Math.random() * 8999))); save();
  pop({ art: ticket(l), color: l.wc, from: '#own', max: 330,
    title: first ? 'いちご券を購入しました' : 'あなたのいちご券',
    sub: l.no + '号　' + l.name + '　／　最終 ' + rankAt(RACE.now, l.no) + '着',
    id: S.no, cta: 'クラブで見る', then: function () { go('club'); } });
}
function joinClub(c) {
  var first = S.club !== c.id;
  S.club = c.id; cardNo(c); save();
  pop({ art: card(c), color: c.wc, from: '#join', max: 320,
    title: first ? '会員証を発行しました' : 'あなたの会員証',
    sub: c.name + '　／　' + c.base,
    id: cardNo(c), cta: 'クラブで見る', then: function () { go('club'); } });
}

/* =========================================================================
   いちご券 / READ
   ========================================================================= */
V.club = function () {
  var v = $('#v-club'), mine = S.owner ? LINES[S.owner - 1] : null, mc = myClub();
  v.innerHTML = '<div class="scroll"><div class="ptop">' +
    '<div class="kicker">ICHIGO TICKET</div>' +
    '<h1 class="disp" style="margin-top:10px">いちご券と、<br>応援クラブ。</h1>' +
    '<p class="body" style="margin-top:14px">いちご券は、6系統のうちどれが5月末まで走り切るかを予想して買うカードです。当たっても払い戻しはありません。売上はそのまま次の品種改良に回ります。</p>' +
    (mine ? '<div class="mytk"><div class="cap"><b>YOUR TICKET</b><span>' + (S.no || '') + '</span></div>' +
      ticket(mine) + tkline(mine) + '</div>'
          : '<div class="empt">まだいちご券を持っていません。<br>ホームから系統を選ぶと購入できます。</div>') +
    (mc ? '<div class="sec"><b>MEMBERSHIP</b><span>会員証</span></div>' +
      '<div class="mycd">' + card(mc) + '</div>' : '') +
    '<div class="sec"><b>CLUBS</b><span>応援クラブ ' + CLUBS.length + '団体</span></div>' +
    '<p class="body" style="margin-top:12px">系統ごとに、生活者が自分たちで作った会です。圃場に通い、計測に立ち会っている会もあります。</p>' +
    CLUBS.map(function (c, i) {
      return '<button class="club tap" data-c="' + i + '"><div class="hd">' +
        '<span class="av" style="background-image:url(' + c.photo + ')"></span>' +
        '<div><div class="nm">' + c.name + '</div><div class="rl">' + c.rep + '　' + c.repRole + '</div></div>' +
        '<div class="mem"><b>' + c.members.toLocaleString() + '</b><span>MEMBERS</span></div>' +
        '<span class="cv">' + IC.next + '</span></div><p>' + c.text + '</p></button>';
    }).join('') +
    '<div style="height:40px"></div></div></div>';
  if (mine) fitTicket($('.mytk .tk', v), 400);
  if (mc) fitTicket($('.mycd .cd', v), 340);
  $$('.club.tap', v).forEach(function (b) { b.onclick = function () { team = +b.dataset.c; go('team'); }; });
};

/* ---- クラブの中 ---- */
var team = 0;
V.team = function () {
  var c = CLUBS[team], l = LINES[c.line - 1], v = $('#v-team');
  var r = rankAt(RACE.now, l.no), joined = S.club === c.id;
  v.innerHTML =
    '<div class="dbar"><button id="tback">' + IC.back + 'クラブへ</button></div>' +
    '<div class="scroll"><div class="tpad">' +
      '<div class="thero"><span class="av" style="background-image:url(' + c.photo + ')"></span>' +
        '<div><div class="kicker">SUPPORTERS CLUB</div>' +
        '<h2 class="head" style="margin-top:5px">' + c.name + '</h2>' +
        '<div class="rl">' + c.rep + '　' + c.repRole + '</div></div></div>' +
      '<div class="bstat" style="margin-top:16px">' +
        '<div><div class="k">会員</div><div class="v">' + c.members.toLocaleString() + '</div></div>' +
        '<div><div class="k">発足</div><div class="v" style="font-size:15px">' + c.born + '</div></div>' +
        '<div><div class="k">集まり</div><div class="v" style="font-size:15px">' + c.meets + '</div></div></div>' +
      '<p class="btext">' + c.text + '</p>' +
      '<div class="sec"><b>SUPPORTING</b><span>応援している系統</span></div>' +
      '<button class="lnk" id="toline"><span class="wk" style="background:' + l.wc + '"></span>' +
        '<div><div class="n1">' + l.no + '号　' + l.name + '</div>' +
        '<div class="n2">' + l.ln + '　／　最終 ' + r + '着</div></div>' + IC.next + '</button>' +
      '<div class="sec"><b>ACTIVITIES</b><span>していること</span></div>' +
      c.acts.map(function (a, i) {
        return '<button class="act tap" data-k="a" data-i="' + i + '">' +
          '<div class="t">' + a.t + IC.next + '</div><div class="d">' + a.d + '</div></button>'; }).join('') +
      '<div class="sec"><b>VOICE</b><span>代表のことば</span></div>' +
      '<p class="voice">' + c.word + '</p>' +
      '<div class="sec"><b>LOG</b><span>この春の記録</span></div>' +
      c.log.map(function (g, i) {
        return '<button class="lg tap" data-k="l" data-i="' + i + '">' +
          '<span class="d num">' + g.d + '</span><span class="t">' + g.t + '</span>' +
          '<span class="cv">' + IC.next + '</span></button>'; }).join('') +
      '<div class="sec"><b>JOIN</b><span>入会</span></div>' +
      '<p class="body" style="margin-top:12px">入会に費用はかかりません。' + c.base +
        'の集まりに一度来てもらうのが、条件です。会員証を発行します。</p>' +
      '<button class="btn' + (joined ? ' ghost' : '') + '" id="join" style="margin-top:14px">' +
        (joined ? '会員証を見る' : 'この会に入る') + '<span class="ar">→</span></button>' +
      '<div style="height:40px"></div></div></div>';
  $('#tback').onclick = function () { go('club'); };
  $('#toline').onclick = function () { idx = l.no - 1; dTab = 0; go('dex'); };
  $$('.tap', v).forEach(function (b) { b.onclick = function () {
    post = { c: team, k: b.dataset.k, i: +b.dataset.i }; go('post'); }; });
  $('#join').onclick = function () { joinClub(c); };
  if (Q.get('cd') === '1') setTimeout(function () { joinClub(c); }, 260);   /* 撮影・デモ用 */
};

/* ---- 記事 ---- */
var post = { c: 0, k: 'a', i: 0 };
V.post = function () {
  var c = CLUBS[post.c], a = (post.k === 'a' ? c.acts : c.log)[post.i], v = $('#v-post');
  var kind = post.k === 'a' ? ['ACTIVITY', '活動'] : ['LOG', '記録'];
  v.innerHTML =
    '<div class="dbar"><button id="pback">' + IC.back + c.name + '</button></div>' +
    '<div class="scroll"><div class="tpad">' +
      '<div class="phd"><span class="k">' + kind[0] + '</span><span class="dt num">' + a.date + '</span></div>' +
      '<h1 class="disp" style="margin-top:10px;font-size:24px;line-height:1.45">' + a.h + '</h1>' +
      '<div class="pby">' + c.name + '　' + kind[1] + 'の記録</div>' +
      a.p.map(function (x) { return '<p class="ptxt">' + x + '</p>'; }).join('') +
      (a.n ? '<div class="pnum">' + a.n.map(function (x) {
        return '<div><span>' + x[0] + '</span><b>' + x[1] + '</b></div>'; }).join('') + '</div>' : '') +
      '<div class="psig">' + c.rep + '　' + c.repRole + '</div>' +
      '<div style="height:40px"></div></div></div>';
  $('#pback').onclick = function () { go('team'); };
};

V.about = function () {
  var v = $('#v-about'), w = LINES[CROWN.line - 1];
  v.innerHTML = '<div class="scroll"><div class="ptop">' +
    '<div class="kicker">READ</div>' +
    '<h1 class="disp" style="margin-top:10px">いちごの旬が<br>終わる季節を、<br>新しい春いちごが<br>決まる季節へ。</h1>' +
    '<p class="body" style="margin-top:16px">CULTAは、一般に約10年かかるいちごの品種改良を、AIを使って約2年に縮めている。掛け合わせ、育て、特徴を見極め、選ぶ。その過程そのものを公開したのが、新・いちご優駿です。</p>' +
    '<div class="sec"><b>WHY THE RACE</b><span>なぜ競馬なのか</span></div>' +
    '<p class="body" style="margin-top:12px">親から特徴を受け継いで生まれ、育てられ、実力を見られ、優れたものが選ばれ、その結果が次の世代へつながる。CULTAの育種は、もともと競馬と同じ構造を持っている。違うのは、いちごだけ「生まれるまで」が見えていないことでした。</p>' +
    '<div class="sec"><b>THE COURSE</b><span>春が、コースになる</span></div>' +
    '<p class="body" style="margin-top:12px">一般的ないちごは、暖かくなるほど品質を保つのが難しくなる。CULTAが開発しているのは、5月末まで甘さを保てる可能性を持つ品種。だからレースは一日では終わりません。3月から5月末までの春そのものが、コースです。</p>' +
    '<div class="sec"><b>RULES</b><span>出走条件</span></div>' +
    [['出走', 'まだ発売されていない品種候補6系統のみ'], ['計測', '3月10日から5月25日まで、隔週で6回'],
     ['項目', RACE.axes], ['優駿', '5月末に最も高い品質を保った系統'],
     ['いちご券', '予想して買う。払い戻しはない'],
     ['売上', 'そのまま次の品種改良へ'],
     ['賞', 'なし。優駿だけが正式な品種名を得る'], ['翌年', '走った系統が交配親になり、その子が走る']].map(function (x) {
      return '<div class="row"><span class="k">' + x[0] + '</span><span class="v" style="font-weight:500;font-size:12.5px">' + x[1] + '</span></div>'; }).join('') +
    '<div class="sec"><b>' + RACE.year + ' WINNER</b><span>売り場へ</span></div>' +
    '<div class="crown"><div class="l">' + RACE.year + ' 新・いちご優駿　WINNER</div>' +
      '<div class="n">' + CROWN.name + '</div>' +
      '<div class="k">' + CROWN.kana + '　／　' + w.no + '号 ' + w.name + '（' + w.ln + '）</div>' +
      '<p>走り切った系統は、ここで初めて品種名を与えられる。この一行を帯に巻いて、翌年の春、売り場に並ぶ。</p></div>' +
    '<div class="sec"><b>QUESTIONS</b><span>想定問答</span></div>' +
    QA.map(function (q) { return '<div class="qa"><button><span class="q">' + q[0] + '</span><span class="pm"></span></button><div class="a"><p>' + q[1] + '</p></div></div>'; }).join('') +
    '<div style="height:40px"></div></div></div>';
  $$('.qa button', v).forEach(function (b) { b.onclick = function () {
    var qa = b.parentNode, a = $('.a', qa), o = qa.classList.toggle('open');
    a.style.maxHeight = o ? a.scrollHeight + 'px' : 0; }; });
};

/* ---------- 起動 ---------- */
['gesturestart', 'gesturechange', 'gestureend'].forEach(function (e) {
  document.addEventListener(e, function (ev) { ev.preventDefault(); }, { passive: false }); });
document.addEventListener('dblclick', function (e) { e.preventDefault(); }, { passive: false });
window.addEventListener('resize', function () { var t = $('#tkw'); if (t) fitTicket($('.tk', t), 330); });
document.addEventListener('click', function (e) { var t = e.target.closest('[data-go]'); if (t) go(t.dataset.go); });
/* ホームが出てから、その先で使う写真を裏で読む（最初の表示を遅らせない） */
function warm() {
  var pre = ['img/w1.webp', 'img/w2.webp', 'img/w3.webp'];
  LINES.forEach(function (l) { pre.push(l.breeder.photo); pre.push(l.img); });
  CLUBS.forEach(function (c) { pre.push(c.photo); });
  pre.push('img/plate.webp'); pre.push('img/tk' + (idx + 1) + '.webp');
  var i = 0;
  (function step() { if (i >= pre.length) return;
    var im = new Image(); im.onload = im.onerror = function () { setTimeout(step, 60); };
    im.src = pre[i++]; })();
}
Field.init($('#photo'), $('#field'));
Field.preload(['berry1', 'berry2', 'berry3', 'berry4', 'berry5', 'berry6'], function () {
  var st = (location.hash || '').replace('#', '');
  go(V[st] ? st : 'home');
  setTimeout(warm, 900);
});
window.addEventListener('resize', function () { setTimeout(stage, 80); });
})();
