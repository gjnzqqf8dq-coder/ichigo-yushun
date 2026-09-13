/* =========================================================================
   app.js — 日本いちごダービー ｜ 苺優駿
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
          '<b>日本いちごダービー</b></div>' +
        '<div class="hsub">次の夏を代表する一粒を選ぶ</div>' +
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
  var l = LINES[idx];
  $$('#dots button').forEach(function (x, i) { x.classList.toggle('on', i === idx); });
  var n = $('#hname'); if (!n) return;
  n.innerHTML = '<div class="no">CANDIDATE No.0' + l.no + '</div>' +
    '<div class="nm">' + l.name + '</div><div class="kj">' + l.kanji + '　' + l.ln + '</div>';
  $('#hstat').innerHTML = [['糖度', l.brix, ''], ['果実硬度', l.firm, ''], ['一果重', l.wt, 'g']].map(function (x) {
    return '<div><div class="k">' + x[0] + '</div><div class="v num">' + x[1] + (x[2] ? '<em>' + x[2] + '</em>' : '') + '</div></div>';
  }).join('');
  $('#openT').textContent = l.name + 'を見る';
  $('#fav').classList.toggle('on', S.fav === l.no);
}

/* =========================================================================
   図鑑 — 知る
   ========================================================================= */
var dTab = Math.max(0, Math.min(2, +(Q.get('tab') || 0)));
V.dex = function () {
  var l = LINES[idx], v = $('#v-dex');
  v.innerHTML =
    '<div class="dbar"><button id="cls">' + IC.back + '一覧へ</button>' +
      '<button id="fav2" style="color:' + (S.fav === l.no ? 'var(--rd)' : 'var(--g2)') + '">' + IC.heart + '</button></div>' +
    '<div class="dhero"><div class="stage" data-shape="' + l.shape + '" data-spread="96"></div></div>' +
    '<div class="dhead"><div class="no">CANDIDATE No.0' + l.no + '</div>' +
      '<div class="nm">' + l.name + '</div>' +
      '<div class="cp">' + l.copy[0] + l.copy[1] + '</div></div>' +
    '<div class="seg" id="seg"><i class="ink"></i>' +
      ['能力', '血統', '育種者'].map(function (t, i) {
        return '<button data-t="' + i + '"' + (i === dTab ? ' class="on"' : '') + '>' + t + '</button>'; }).join('') + '</div>' +
    '<div class="dbody" id="dbody"></div>' +
    '<div class="dfoot"><button class="btn" id="own">' +
      (S.owner === l.no ? 'この品種の苺主です' : 'この品種の苺主になる') + '<span class="ar">→</span></button></div>';
  $('#cls').onclick = function () { go('home'); };
  $('#fav2').onclick = function () { S.fav = S.fav === l.no ? 0 : l.no; save();
    $('#fav2').style.color = S.fav === l.no ? 'var(--rd)' : 'var(--g2)'; };
  $('#own').onclick = function () {
    S.owner = l.no; S.no = S.no || ('ICY-2027-' + (1000 + Math.floor(Math.random() * 8999))); save();
    toast('苺主になりました　' + S.no); setTimeout(function () { go('club'); }, 700);
  };
  $$('#seg button').forEach(function (b) { b.onclick = function () { dTab = +b.dataset.t; paintTabs(); }; });
  paintTabs();
};
function paintTabs() {
  var l = LINES[idx];
  $$('#seg button').forEach(function (b, i) { b.classList.toggle('on', i === dTab); });
  var b = $$('#seg button')[dTab], ink = $('#seg .ink');
  if (b && ink) { ink.style.width = b.offsetWidth + 'px'; ink.style.transform = 'translateX(' + b.offsetLeft + 'px)'; }
  var t = $('#dbody');
  t.innerHTML = dTab === 0 ? abil(l) : dTab === 1 ? tree(l) : brd(l);
  t.scrollTop = 0;
  if (dTab === 0) { radar(l); bars(t, 150); }
  if (dTab === 1) { wire(); setTimeout(function () { var e = $('.tree'); if (e) e.classList.add('on'); }, 80); }
  rise(t, 60);
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
  return '<div class="radarbox rise"><svg class="radar" viewBox="0 0 192 192">' + web +
      '<polygon class="area" id="rarea" points="' + RAX.map(function () { return RC + ',' + RC; }).join(' ') + '"/>' +
      RAX.map(function (k, i) { var p = rpt(i, l.radar[k] / 100); return '<circle class="dot" cx="' + p[0] + '" cy="' + p[1] + '" r="3"/>'; }).join('') + labs + '</svg>' +
    '<div>' + RAX.map(function (k) {
      return '<div class="vrow"><span class="k">' + k + '</span><span class="bar"><i data-w="' + l.radar[k] + '"></i></span>' +
        '<span class="v">' + l.radar[k] + '</span></div>'; }).join('') + '</div></div>' +
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
    '<p class="hint">円をタップすると、その祖先が渡した形質が出ます</p><div style="height:20px"></div>';
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
      '<figure><div class="im" style="background-image:url(img/w1.jpg)"></div><figcaption>実生をひとつひとつ、見つめて。</figcaption></figure>' +
      '<figure><div class="im" style="background-image:url(img/w2.jpg)"></div><figcaption>候補を、何度も食べ比べる。</figcaption></figure>' +
      '<figure><div class="im" style="background-image:url(img/w3.jpg)"></div><figcaption>いちごの、あたらしい季節を。</figcaption></figure>' +
    '</div><div style="height:20px"></div>';
}

/* =========================================================================
   クラブ / READ
   ========================================================================= */
V.club = function () {
  var v = $('#v-club'), mine = S.owner ? LINES[S.owner - 1] : null;
  v.innerHTML = '<div class="scroll"><div class="ptop">' +
    '<div class="kicker">OWNERS CLUB</div>' +
    '<h1 class="disp" style="margin-top:10px">苺主になる、<br>ということ。</h1>' +
    '<p class="body" style="margin-top:14px">決められるのは、どれを応援するかだけ。オッズも馬券も賞金もない。結果は自分では選べない。</p>' +
    (mine ? '<div class="club"><div class="hd"><span class="wk" style="background:' + mine.wc + '"></span>' +
      '<div><div class="nm">' + mine.no + '号　' + mine.name + '</div><div class="rl">あなたが応援している系統</div></div>' +
      '<div class="mem"><b>' + (S.no || '') + '</b><span>OWNER ID</span></div></div></div>' : '') +
    '<div class="sec"><b>CLUBS</b><span>' + CLUBS.length + '団体</span></div>' +
    CLUBS.map(function (c) {
      return '<div class="club"><div class="hd"><span class="av" style="background-image:url(' + c.photo + ')"></span>' +
        '<div><div class="nm">' + c.name + '</div><div class="rl">' + c.rep + '　' + c.repRole + '</div></div>' +
        '<div class="mem"><b>' + c.members.toLocaleString() + '</b><span>MEMBERS</span></div></div><p>' + c.text + '</p></div>';
    }).join('') +
    '<div class="sec"><b>CROSSING</b><span>交配を設計する</span></div>' +
    '<p class="body" style="margin-top:12px">交配親を2つ選ぶ。生まれる系統は自分では決められない。形質は確率で受け継がれる。</p>' +
    '<div class="pick" id="pick">' + LINES.map(function (l, i) {
      return '<button data-i="' + i + '"><span class="sw" style="background:' + l.wc + '"></span>' +
        '<span class="n2">' + l.no + '号 ' + l.name + '</span></button>'; }).join('') + '</div>' +
    '<button class="btn" id="cross" disabled style="margin-top:14px;opacity:.3">交配する<span class="ar">→</span></button>' +
    '<div id="cout"></div>' + (S.child ? child(S.child) : '') +
    '<div style="height:40px"></div></div></div>';
  var sel = [];
  $$('#pick button').forEach(function (b) { b.onclick = function () {
    var i = +b.dataset.i, at = sel.indexOf(i);
    if (at >= 0) sel.splice(at, 1); else { if (sel.length === 2) sel.shift(); sel.push(i); }
    $$('#pick button').forEach(function (x) { x.classList.toggle('on', sel.indexOf(+x.dataset.i) >= 0); });
    var c = $('#cross'); c.disabled = sel.length !== 2; c.style.opacity = sel.length === 2 ? 1 : .3; }; });
  $('#cross').onclick = function () {
    var c = cross(LINES[sel[0]], LINES[sel[1]]); S.child = c; save();
    $('#cout').innerHTML = child(c); $('#cout').firstElementChild.classList.add('fade'); toast('新しい系統 ' + c.ln); };
};
function cross(a, b) {
  var m = function (x, y, s) { return (x + y) / 2 + (Math.random() - .5) * s; };
  var an = function (l) { return [l.sire, l.dam, l.bms]; };
  var sh = an(a).filter(function (x) { return an(b).indexOf(x) >= 0; }).length;
  return { ln: 'i-28-' + String(1 + Math.floor(Math.random() * 40)).padStart(2, '0'), a: a.name, b: b.name,
    brix: m(a.brix, b.brix, 1.1).toFixed(1), firm: Math.round(m(a.firm, b.firm, 12)),
    ci: (0.0625 * sh + (a.ci + b.ci) / 4).toFixed(3) };
}
function child(c) {
  return '<div class="club" style="margin-top:16px"><div class="kicker">YOUR LINE</div>' +
    '<div class="nm" style="font-family:var(--serif);font-size:20px;margin-top:6px">' + c.ln + '</div>' +
    '<div class="row" style="margin-top:8px"><span class="k">両親</span><span class="v" style="font-weight:500;font-size:12px">' + c.a + ' × ' + c.b + '</span></div>' +
    '<div class="row"><span class="k">糖度</span><span class="v">' + c.brix + '</span></div>' +
    '<div class="row"><span class="k">果実硬度</span><span class="v">' + c.firm + '</span></div>' +
    '<div class="row" style="border:0"><span class="k">近交係数</span><span class="v">' + c.ci + '</span></div></div>';
}
V.about = function () {
  var v = $('#v-about');
  v.innerHTML = '<div class="scroll"><div class="ptop">' +
    '<div class="kicker">READ</div>' +
    '<h1 class="disp" style="margin-top:10px">東京優駿と同じ日に、<br>いちごの日本一を決める。</h1>' +
    '<div class="sec"><b>THE NAME</b><span>名前の由来</span></div>' +
    '<p class="body" style="margin-top:12px">日本ダービーの正式名称は東京優駿。優駿とは、すぐれた馬のこと。苺優駿は、そのいちご版という意味です。</p>' +
    '<div class="sec"><b>WHY THE DERBY</b><span>なぜこの日か</span></div>' +
    '<p class="body" style="margin-top:12px">東京優駿は三歳のその年しか出られず、去勢馬は出走できません。血統をつないできた結果を、一日で見届ける競走です。品種改良も、同じことをしている。</p>' +
    '<div class="sec"><b>RULES</b><span>出走条件</span></div>' +
    [['出走', 'まだ商品化されていない6系統のみ'], ['審査', '専門家5分野のブラインド70％＋苺主投票30％'],
     ['賞', 'なし。優勝系統だけが品種名を得る'], ['翌年', '優勝系統は交配親になり、その子が走る']].map(function (x) {
      return '<div class="row"><span class="k">' + x[0] + '</span><span class="v" style="font-weight:500;font-size:12.5px">' + x[1] + '</span></div>'; }).join('') +
    '<div class="sec"><b>QUESTIONS</b><span>想定問答</span></div>' +
    QA.map(function (q) { return '<div class="qa"><button><span class="q">' + q[0] + '</span><span class="pm"></span></button><div class="a"><p>' + q[1] + '</p></div></div>'; }).join('') +
    '<div class="sec"><b>CREDIT</b><span>2027</span></div>' +
    '<p class="body" style="margin-top:12px">企画：桑田航希　／　CULTA 課題提出用のプロトタイプ。</p>' +
    '<div style="height:40px"></div></div></div>';
  $$('.qa button', v).forEach(function (b) { b.onclick = function () {
    var qa = b.parentNode, a = $('.a', qa), o = qa.classList.toggle('open');
    a.style.maxHeight = o ? a.scrollHeight + 'px' : 0; }; });
};

/* ---------- 起動 ---------- */
document.addEventListener('click', function (e) { var t = e.target.closest('[data-go]'); if (t) go(t.dataset.go); });
(function () { var pre = ['img/w1.jpg', 'img/w2.jpg', 'img/w3.jpg'];
  LINES.forEach(function (l) { pre.push(l.breeder.photo); }); CLUBS.forEach(function (c) { pre.push(c.photo); });
  pre.forEach(function (u) { var im = new Image(); im.src = u; }); })();
Field.init($('#photo'), $('#field'));
Field.preload(['berry1', 'berry2', 'berry3', 'berry4', 'berry5', 'berry6'], function () {
  var st = (location.hash || '').replace('#', '');
  go(V[st] ? st : 'home');
});
window.addEventListener('resize', function () { setTimeout(stage, 80); });
})();
