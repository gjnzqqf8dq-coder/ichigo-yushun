/* =========================================================================
   app.js — 日本いちごダービー ｜ 苺優駿
   送られたモック4枚（ホーム／能力／血統／育種者）に合わせて組む。
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

/* ---------- 小道具 ---------- */
function seg(str) {
  if (window.Intl && Intl.Segmenter) { try { return Array.from(new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(str), function (s) { return s.segment; }); } catch (e) {} }
  return str.split('');
}
function charReveal(el, delay, step) {
  if (!el) return;
  var lines = el.innerHTML.split('<br>'), k = 0, DL = SLOW ? 0 : (delay || 0), ST = SLOW ? 0 : (step || 40);
  el.innerHTML = ''; el.setAttribute('translate', 'no');
  lines.forEach(function (line, li) {
    if (li) el.appendChild(document.createElement('br'));
    var tmp = document.createElement('span'); tmp.innerHTML = line;
    Array.from(tmp.childNodes).forEach(function (nd) {
      var red = nd.nodeType === 1;
      seg(nd.textContent).forEach(function (c) {
        var o = document.createElement('span'), i = document.createElement('i');
        o.className = 'rc'; i.textContent = c; if (red) i.style.color = 'var(--rd)';
        i.style.transitionDelay = (DL + k * ST) + 'ms'; o.appendChild(i); el.appendChild(o); k++;
      });
    });
  });
  setTimeout(function () { $$('.rc', el).forEach(function (x) { x.classList.add('on'); }); }, 24);
}
function bars(root, d) { setTimeout(function () { $$('[data-w]', root).forEach(function (b, i) { setTimeout(function () { b.style.width = b.dataset.w + '%'; }, i * 55); }); }, d || 110); }
function toast(t) { var e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove('on'); }, 2000); }
var IC = {
  sun: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="3.4"/><path d="M10 1.5v2.4M10 16.1v2.4M1.5 10h2.4M16.1 10h2.4M4 4l1.7 1.7M14.3 14.3 16 16M16 4l-1.7 1.7M5.7 14.3 4 16"/></svg>',
  wave: '<svg viewBox="0 0 20 20"><path d="M2 13c2-3.6 4-3.6 6 0s4 3.6 6 0 3-2.8 4-1.6"/><path d="M2 7.6c2-3.6 4-3.6 6 0s4 3.6 6 0 3-2.8 4-1.6"/></svg>',
  drop: '<svg viewBox="0 0 20 20"><path d="M10 2C7.1 5.6 4 8.8 4 12.2A6 6 0 0 0 16 12.2C16 8.8 12.9 5.6 10 2z"/></svg>',
  shield: '<svg viewBox="0 0 20 20"><path d="M10 1.8 3 4.6v5.5c0 3.9 2.8 6.8 7 7.8 4.2-1 7-3.9 7-7.8V4.6z"/><path d="M7 10l2 2 4-4"/></svg>',
  temp: '<svg viewBox="0 0 20 20"><path d="M12.2 11.6V4a2.2 2.2 0 1 0-4.4 0v7.6a3.9 3.9 0 1 0 4.4 0z"/><path d="M10 7v6"/></svg>',
  heart: '<svg viewBox="0 0 22 20"><path d="M11 18.5S2 12.8 2 6.9A4.4 4.4 0 0 1 11 5a4.4 4.4 0 0 1 9 1.9c0 5.9-9 11.6-9 11.6z"/></svg>',
  hand: '<svg viewBox="0 0 20 20"><path d="M8 11V4.5a1.3 1.3 0 0 1 2.6 0V10"/><path d="M10.6 9.5a1.3 1.3 0 0 1 2.6 0V11"/><path d="M13.2 10.6a1.3 1.3 0 0 1 2.6 0v3.2c0 2.6-2 4.7-4.6 4.7H10c-1.4 0-2.7-.7-3.5-1.8L4 13.5a1.3 1.3 0 0 1 2-1.6L8 14"/></svg>'
};
function dnaSVG(w, h, op) {
  var p = '', q = '', cx = w / 2, amp = w * .3, turns = 2.4, n = 48;
  for (var i = 0; i <= n; i++) {
    var t = i / n, y = t * h, a = t * Math.PI * 2 * turns;
    p += '<circle cx="' + (cx + Math.sin(a) * amp) + '" cy="' + y + '" r="1.5"/>';
    q += '<circle cx="' + (cx + Math.sin(a + Math.PI) * amp) + '" cy="' + y + '" r="1.2"/>';
    if (i % 4 === 0) { var x1 = cx + Math.sin(a) * amp, x2 = cx + Math.sin(a + Math.PI) * amp; for (var k = 1; k < 5; k++) q += '<circle cx="' + (x1 + (x2 - x1) * k / 5) + '" cy="' + y + '" r=".8"/>'; }
  }
  return '<svg class="dna" viewBox="0 0 ' + w + ' ' + h + '"><g fill="#e4142e" opacity="' + (op || .6) + '">' + p + '</g><g fill="#e4142e" opacity="' + ((op || .6) * .4) + '">' + q + '</g></svg>';
}
function railsHTML() {
  return '<div class="rail l">JAPAN<br>STRAWBERRY<br>DERBY<span class="bar"></span>A<br>SWEETER<br>TOMORROW' +
    '<div class="jp" style="margin-top:20px">いちごの<br>可能性は、<br>まだ始まった<br>ばかり。</div>' +
    '<div class="more" style="margin-top:6px">BORN FROM<br>NATURE<br>DRIVEN BY<br>SCIENCE.</div></div>' +
    '<div class="rail r"><div class="jp k">まだ見ぬ<br>いちごの<br>未来を、<br>いっしょに。</div>' +
    '<div style="margin-top:14px">SEEDING<br>A BRIGHTER<br>TOMORROW</div><span class="bar"></span><span class="more">FUTURE<br>STRAWBERRIES<br>FOR A<br>BRIGHTER<br>TOMORROW</span></div>';
}
function deco() {
  var d = $('#deco'), h = '';
  [[26,120,''],[404,96,''],[300,80,''],[40,606,''],[300,632,'r'],[398,640,''],[62,262,'r'],[236,58,''],[382,290,'']].forEach(function (p) {
    h += '<i class="xh ' + p[2] + '" style="left:' + p[0] + 'px;top:' + p[1] + 'px"></i>';
  });
  var r = 13;
  for (var i = 0; i < 46; i++) { r = (r * 9301 + 49297) % 233280; var x = r / 233280 * 430; r = (r * 9301 + 49297) % 233280; var y = r / 233280 * 900; r = (r * 9301 + 49297) % 233280;
    h += '<i class="sq' + (r / 233280 < .25 ? ' b' : '') + '" style="left:' + x.toFixed(0) + 'px;top:' + y.toFixed(0) + 'px;opacity:' + (.35 + (r / 233280) * .6).toFixed(2) + '"></i>'; }
  d.innerHTML = h;
}

/* ---------- ルーター ---------- */
var cur = '', V = {}, TAB = { home: 1, club: 1, about: 1 };
function go(name) {
  if (name === cur) return;
  var from = $('#v-' + cur), to = $('#v-' + name); if (!to) return;
  if (from) { from.classList.add('out'); from.classList.remove('on'); setTimeout(function () { from.classList.remove('out'); }, 220); }
  cur = name;
  document.body.classList.toggle('nofoot', !TAB[name]);
  $$('#tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.go === name); });
  to.scrollTop = 0; V[name](); void to.offsetHeight; to.classList.add('on');
  setTimeout(stageNow, 20);
}
function stageNow() {
  var v = $('#v-' + cur), st = v && $('.stage', v);
  if (!st) { Field.hide(); return; }
  if (st.dataset.strip) { Field.strip(LINES.map(function (l) { return l.shape; }), st, { index: idx, onIndex: stripIdx, onFrame: stripFrame }); return; }
  Field.apply(st.dataset.shape, st, { dir: st.dataset.dir || 'right', spread: st.dataset.spread ? +st.dataset.spread : undefined });
}

/* =========================================================================
   HOME
   ========================================================================= */
var idx = Math.max(0, Math.min(5, +(Q.get('line') || 0)));
V.home = function () {
  var v = $('#v-home');
  if (!v._b) {
    v._b = 1; v.classList.add('fixed');
    v.innerHTML = railsHTML() +
      '<div class="hh"><svg class="crown" viewBox="0 0 44 24"><path d="M3 22 L10 7 L16 15 L22 3 L28 15 L34 7 L41 22 Z"/></svg>' +
        '<h1 id="ttl"><em>日</em>本いち<em>ご</em>ダービー</h1><div class="sub">次の夏を代表する一粒を選ぼう</div></div>' +
      '<div class="caro"><div class="stage" id="stripstage" data-strip="1" style="inset:0"></div>' +
        '<div class="circ" id="circ" style="width:176px;height:176px;top:126px"><i></i><i></i><b class="t n"></b><b class="t s"></b><b class="t w"></b><b class="t e"></b></div>' +
        '<div class="touch" id="touch"></div><div class="hits" id="hits"></div><div class="labels" id="labels"></div>' +
        '<button class="chev l" id="cL"><svg viewBox="0 0 14 18"><path d="M10 2 3 9l7 7"/></svg></button>' +
        '<button class="chev r" id="cR"><svg viewBox="0 0 14 18"><path d="M4 2l7 7-7 7"/></svg></button>' +
        '<div class="dots" id="dots">' + LINES.map(function (l, i) { return '<button data-i="' + i + '" aria-label="' + l.no + '号"></button>'; }).join('') + '</div></div>' +
      '<div class="card" id="hcard"></div>';
    buildStrip();
  }
  paintHome();
};
function stripIdx(i) { idx = i; paintHome(); }
function stripFrame(slots) {
  var lb = $('#labels'), ht = $('#hits'); if (!lb) return;
  if (lb.children.length !== slots.length) {
    lb.innerHTML = slots.map(function () { return '<span></span>'; }).join('');
    if (ht) ht.innerHTML = slots.map(function () { return '<button class="hit"></button>'; }).join('');
  }
  for (var i = 0; i < slots.length; i++) {
    var s = slots[i], e = lb.children[i];
    e.textContent = LINES[s.i].no + '号'; e.style.left = s.x + 'px';
    e.dataset.i = s.i;
    var vis = s.ad <= 3.2;
    e.style.opacity = vis ? 1 : 0;
    e.style.pointerEvents = vis ? 'auto' : 'none';
    e.classList.toggle('on', s.k > .96);
    if (ht) {
      var h = ht.children[i], w = s.ad < 1 ? 150 : s.ad < 2 ? 92 : 62;
      h.dataset.i = s.i;
      h.style.left = (s.x - w / 2) + 'px'; h.style.width = w + 'px';
      h.style.display = vis ? 'block' : 'none';
    }
  }
}
function buildStrip() {
  Field.strip(LINES.map(function (l) { return l.shape; }), $('#stripstage'), { index: idx, onIndex: stripIdx, onFrame: stripFrame });
  var t = $('#touch'), down = false, lx = 0;
  t.addEventListener('pointerdown', function (e) { down = true; t._m = 0; lx = e.clientX; try { t.setPointerCapture(e.pointerId); } catch (x) {} });
  t.addEventListener('pointermove', function (e) { if (!down) return; var d = e.clientX - lx; lx = e.clientX; t._m += Math.abs(d); Field.spin(d); });
  var up = function () { if (!down) return; down = false; Field.release(); };
  t.addEventListener('pointerup', up); t.addEventListener('pointercancel', up);
  t.addEventListener('click', function () { if (t._m < 8) go('dex'); });
  $('#cL').onclick = function () { Field.ringTo((idx + 5) % 6); };
  $('#cR').onclick = function () { Field.ringTo((idx + 1) % 6); };
  $$('#dots button').forEach(function (b) { b.onclick = function () { Field.ringTo(+b.dataset.i); }; });
  $('#labels').addEventListener('click', function (e) {
    var sp = e.target.closest('span'); if (!sp || sp.dataset.i == null) return;
    var i = +sp.dataset.i;
    if (i === idx) go('dex'); else Field.ringTo(i);
  });
  var hits = $('#hits');
  hits.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var i = +b.dataset.i;
    if (i === idx) go('dex'); else Field.ringTo(i);
  });
}
function paintHome() {
  var l = LINES[idx], c = $('#hcard'); if (!c) return;
  $$('#dots button').forEach(function (x, i) { x.classList.toggle('on', i === idx); });
  var m = [['sun', '甘さ', l.radar.甘さ], ['wave', '香り', l.radar.香り], ['drop', 'みずみずしさ', l.radar.果汁]];
  c.innerHTML = dnaSVG(120, 170, .6) + '<div class="ctag">A SMALL<br>STRAWBERRY<br>A BIGGER<br>TOMORROW</div>' +
    '<div class="nohead"><div class="n">' + l.no + '<small>号</small></div><div class="sep"></div>' +
      '<div class="cand">CANDIDATE<br>No.0' + l.no + '<b>' + l.name + '　' + l.kanji + '</b></div></div>' +
    '<h2 class="copy" id="hcopy">' + l.copy[0] + '<br>' + l.copy[1] + '</h2>' +
    '<p class="b" style="margin-top:12px;padding-right:44px">' + l.desc + '</p>' +
    '<div class="h3"><div>' + m.map(function (x) {
      return '<div class="mrow"><span class="ic">' + IC[x[0]] + '</span><span class="k">' + x[1] + '</span><span class="bar"><i data-w="' + x[2] + '"></i></span><span class="v">' + (x[2] / 10).toFixed(1) + '</span></div>';
    }).join('') + '</div><div class="flav"><div class="lbl">FLAVOR PROFILE</div><p>' + l.flavor + '</p></div></div>' +
    '<div class="cta"><button class="btn" id="open">' + l.no + '号の詳細を見る<span class="ar">→</span></button>' +
    '<button class="fav' + (S.fav === l.no ? ' on' : '') + '" id="fav">' + IC.heart + '</button></div>';
  $('#open').onclick = function () { go('dex'); };
  $('#fav').onclick = function () { S.fav = S.fav === l.no ? 0 : l.no; save(); $('#fav').classList.toggle('on', S.fav === l.no); };
  charReveal($('#hcopy'), 60, 30); bars(c, 160);
}

/* =========================================================================
   詳細（能力 / 血統 / 育種者）
   ========================================================================= */
var dTab = Math.max(0, Math.min(2, +(Q.get('tab') || 0)));
V.dex = function () {
  var l = LINES[idx], v = $('#v-dex');
  v.classList.add('fixed');
  v.innerHTML = railsHTML() + '<button class="close" id="cls">閉じる<i>✕</i></button>' + '<div class="dexpage">' +
    '<div class="hero">' +
      '<div class="stage" data-shape="' + l.shape + '" data-dir="right" data-spread="120"></div>' +
      '<div class="circ"><i></i><i></i><b class="t n"></b><b class="t s"></b><b class="t w"></b><b class="t e"></b></div>' +
      '<div class="tag" style="left:24px;top:98px">No.0' + l.no + '</div>' +
      '<div class="tag" style="left:24px;top:116px;line-height:1.6;font-size:7.2px">FRAGARIA × SCIENCE<br>= A SWEETER<br>TOMORROW</div>' +
    '</div>' +
    '<div class="card dex">' + dnaSVG(96, 140, .6) + '<div class="ctag">A SMALL<br>STRAWBERRY<br>A BIGGER<br>TOMORROW</div>' +
      '<div class="nohead"><div class="n">' + l.no + '<small>号</small></div><div class="sep"></div>' +
        '<div class="cand">CANDIDATE<br>No.0' + l.no + '<b>' + l.name + '　' + l.kanji + '</b></div></div>' +
      '<h2 class="copy" id="dcopy">' + l.copy[0] + '<br>' + l.copy[1] + '</h2>' +
      '<div class="tabs3" id="t3">' + ['能力', '血統', '育種者'].map(function (t, i) { return '<button data-t="' + i + '"' + (i === dTab ? ' class="on"' : '') + '>' + t + '</button>'; }).join('') + '</div>' +
      '<div class="dexbody" id="tbody"></div>' +
      '<div class="cta"><button class="btn long" id="own">この品種の苺主になる<span class="ar">→</span></button>' +
      '<button class="fav' + (S.fav === l.no ? ' on' : '') + '" id="fav2">' + IC.heart + '</button></div>' +
    '</div></div>';
  $('#cls').onclick = function () { go('home'); };
  $('#own').onclick = function () { S.owner = l.no; S.no = S.no || ('ICY-2027-' + (1000 + Math.floor(Math.random() * 8999))); save(); toast('苺主 ' + S.no); setTimeout(function () { go('club'); }, 600); };
  $('#fav2').onclick = function () { S.fav = S.fav === l.no ? 0 : l.no; save(); $('#fav2').classList.toggle('on', S.fav === l.no); };
  $$('#t3 button').forEach(function (b) { b.onclick = function () { dTab = +b.dataset.t; paintTabs(); }; });
  charReveal($('#dcopy'), 80, 30); paintTabs();
};
function paintTabs() {
  var l = LINES[idx]; $$('#t3 button').forEach(function (b, i) { b.classList.toggle('on', i === dTab); });
  var t = $('#tbody'); t.innerHTML = dTab === 0 ? abilHTML(l) : dTab === 1 ? treeHTML(l) : brdHTML(l);
  if (dTab === 0) { animRadar(l); bars(t, 200); }
  if (dTab === 1) { wireTree(); setTimeout(function () { var e = $('.tree'); if (e) e.classList.add('on'); }, 70); }
}
var RAX = ['甘さ', '香り', '硬さ', '酸味', '果汁'], RR = 66, RC = 100;
function rpt(i, f) { var a = -Math.PI / 2 + i * Math.PI * 2 / 5; return [RC + Math.cos(a) * RR * f, RC + Math.sin(a) * RR * f]; }
function abilHTML(l) {
  var web = '';
  [1, .75, .5, .25].forEach(function (f) { web += '<polygon class="web" points="' + RAX.map(function (k, i) { return rpt(i, f).join(','); }).join(' ') + '"/>'; });
  RAX.forEach(function (k, i) { var p = rpt(i, 1); web += '<line class="ax" x1="' + RC + '" y1="' + RC + '" x2="' + p[0] + '" y2="' + p[1] + '"/>'; });
  [[1, '100'], [.75, '75'], [.5, '50'], [.25, '25']].forEach(function (g) { web += '<text class="rg" x="' + (RC + 3) + '" y="' + (RC - RR * g[0] + 3) + '">' + g[1] + '</text>'; });
  var labs = RAX.map(function (k, i) {
    var p = rpt(i, 1.3), an = i === 0 ? 'middle' : (p[0] > RC + 4 ? 'start' : 'end'), dy = i === 0 ? -12 : (p[1] > RC ? 14 : 0);
    return '<text class="rn" x="' + p[0] + '" y="' + (p[1] + dy) + '" text-anchor="' + an + '">' + k + '</text><text class="rv" x="' + p[0] + '" y="' + (p[1] + dy + 17) + '" text-anchor="' + an + '">' + l.radar[k] + '</text>';
  }).join('');
  return '<div class="abil"><svg class="radar" viewBox="0 0 200 200">' + web +
      '<polygon class="area" id="rarea" points="' + RAX.map(function () { return RC + ',' + RC; }).join(' ') + '"/>' +
      RAX.map(function (k, i) { var p = rpt(i, l.radar[k] / 100); return '<circle class="dot" cx="' + p[0] + '" cy="' + p[1] + '" r="3"/>'; }).join('') + labs + '</svg>' +
    '<div class="r">' + RAX.map(function (k) { return '<div class="mrow2"><span class="k">' + k + '</span><span class="bar"><i data-w="' + l.radar[k] + '"></i></span><span class="v">' + l.radar[k] + '</span></div>'; }).join('') +
      '<p class="b" style="margin-top:12px;font-size:11px">' + l.flavor + '</p>' +
      '<div class="fpline"><span>FLAVOR PROFILE</span><i></i><span>No.0' + l.no + '</span></div></div></div>' +
    '<div class="meas">' + [['糖度 Brix', l.brix], ['酸度', l.acid], ['果実硬度', l.firm], ['一果重', l.wt + ' g'], ['果形', l.form], ['耐暑性', l.heat]]
      .map(function (x) { return '<div><span>' + x[0] + '</span><b>' + x[1] + '</b></div>'; }).join('') + '</div>';
}
function animRadar(l) {
  var area = $('#rarea'); if (!area) return;
  var T = RAX.map(function (k, i) { return rpt(i, l.radar[k] / 100); });
  if (SLOW) { area.setAttribute('points', T.map(function (p) { return p.join(','); }).join(' ')); return; }
  var t0 = performance.now();
  (function step(t) { var k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(2, -10 * k);
    area.setAttribute('points', T.map(function (p) { return (RC + (p[0] - RC) * e) + ',' + (RC + (p[1] - RC) * e); }).join(' '));
    if (k < 1) requestAnimationFrame(step); })(t0);
}
function imgFor(nm) { var h = 0; for (var i = 0; i < nm.length; i++) h = (h * 31 + nm.charCodeAt(i)) | 0; return LINES[Math.abs(h) % 6].img; }
function node(cls, cap, nm, img, show) {
  return '<button class="node ' + cls + '" data-n="' + nm + '"><div class="cap">' + cap + '</div><div class="ph" style="background-image:url(' + (img || imgFor(nm)) + ')"></div><div class="nm">' + (show || nm) + '</div></button>';
}
function treeHTML(l) {
  return '<div class="tree" id="tree"><div class="dnabg">' + dnaSVG(60, 200, .3).replace('class="dna"', 'style="position:absolute;left:42%;top:30px;width:56px;height:200px"') + '</div>' +
    '<svg class="link" id="wires"></svg>' +
    '<div class="head"><div><div class="t">FAMILY TREE</div><div class="s">このいちごが生まれた、系譜。</div></div><div class="r">INHERITING<br>A SWEETER<br>TOMORROW</div></div>' +
    '<div class="gen">' + node('', '祖父A-1', l.ss) + node('', '祖母A-2', l.sd) + node('', '祖父B-1', l.bms) + node('', '祖母B-2', l.dd) + '</div>' +
    '<div class="gen2">' + node('p', '親 A', l.sire) + node('p', '親 B', l.dam) + '</div>' +
    '<div class="gen3">' + node('me', '', l.name, l.img, l.no + '号') + '</div>' +
    '<div class="traits"><div><h5>受け継いだ特性</h5>' + l.traitL.map(function (x, i) { return '<li><span class="ic">' + (i ? IC.wave : IC.sun) + '</span>' + x + '</li>'; }).join('') + '</div>' +
      '<div class="r"><h5>受け継いだ特性</h5>' + l.traitR.map(function (x, i) { return '<li><span class="ic">' + (i ? IC.temp : IC.shield) + '</span>' + x + '</li>'; }).join('') + '</div></div>' +
    '<div class="taphint" id="ginfo">' + IC.hand + 'タップでそれぞれのいちごの詳細を見られます</div></div>';
}
function geneInfo(nm, l, quiet) { var g = $('#ginfo'); if (!g || quiet) return; var a = ANC[nm] || [l.kanji, l.desc];
  g.className = 'gline'; g.innerHTML = '<b>' + nm + '</b><span>' + a[0] + '　' + a[1] + '</span>'; g.classList.add('fade'); }
function wireTree() {
  var tr = $('#tree'), sv = $('#wires'); if (!tr || !sv) return;
  var l = LINES[idx], box = tr.getBoundingClientRect(), g = $$('.gen .node', tr), p = $$('.gen2 .node', tr), me = $('.gen3 .node', tr);
  var c = function (el, edge) { var r = $('.ph', el).getBoundingClientRect(); return { x: r.left - box.left + r.width / 2, y: (edge === 'top' ? r.top : r.bottom) - box.top }; };
  var d = '', rd = '';
  [[0, 1, 0], [2, 3, 1]].forEach(function (q) { var pa = c(p[q[2]], 'top'), mid = (c(g[q[0]], 'bottom').y + pa.y) / 2;
    [q[0], q[1]].forEach(function (i) { var a = c(g[i], 'bottom'); d += 'M' + a.x + ' ' + a.y + ' V' + mid + ' H' + pa.x + ' V' + pa.y + ' '; }); });
  var mt = c(me, 'top'), mid2 = (c(p[0], 'bottom').y + mt.y) / 2;
  [0, 1].forEach(function (i) { var a = c(p[i], 'bottom'); rd += 'M' + a.x + ' ' + a.y + ' V' + mid2 + ' H' + mt.x + ' V' + mt.y + ' '; });
  sv.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height); sv.style.height = box.height + 'px';
  sv.innerHTML = '<path d="' + d + '"/><path class="r" d="' + rd + '"/>';
  $$('path', sv).forEach(function (x) { var n = 600; try { n = x.getTotalLength(); } catch (e) {} x.style.setProperty('--len', n); });
  $$('.node', tr).forEach(function (b) { b.onclick = function () { $$('.node', tr).forEach(function (o) { o.classList.remove('sel'); }); b.classList.add('sel'); geneInfo(b.dataset.n, l); }; });
  geneInfo(l.bms, l, true); $$('.node', tr).forEach(function (b) { if (b.dataset.n === l.bms) b.classList.add('sel'); });
}
function brdHTML(l) {
  var b = l.breeder;
  return '<div class="brd"><div class="ph" style="background-image:url(' + b.photo + ')"><em>いちごの<br>未来を、<br>つくる仕事。</em></div>' +
    '<div><div class="role">育種責任者</div><div class="nm">' + b.name + '</div><div class="ro">' + b.roma + '</div><div class="qt">' + b.quote + '</div><div class="tx">' + b.text + '</div>' +
    '<div class="bstat"><div><div class="k">育種歴</div><div class="v">' + b.years + '<em>年</em></div></div><div><div class="k">選抜</div><div class="v">' + b.seedlings + '<em>株</em></div></div><div><div class="k">開発</div><div class="v">' + b.dev + '<em>年</em></div></div></div>' +
    '<div class="kw">KEYWORD</div><div class="chips">' + b.keys.map(function (k) { return '<span>' + k + '</span>'; }).join('') + '</div></div></div>' +
    '<div class="gal"><figure><div class="im" style="background-image:url(img/w1.jpg)"></div><figcaption>実生をひとつひとつ、見つめて。</figcaption></figure>' +
    '<figure><div class="im" style="background-image:url(img/w2.jpg)"></div><figcaption>候補を、何度も食べ比べる。</figcaption></figure>' +
    '<figure><div class="im" style="background-image:url(img/w3.jpg)"></div><figcaption>いちごの、あたらしい季節を。</figcaption></figure></div>';
}

/* =========================================================================
   クラブ / READ
   ========================================================================= */
V.club = function () {
  var v = $('#v-club'), mine = S.owner ? LINES[S.owner - 1] : null;
  v.innerHTML = '<div class="plain"><div class="lbl">OWNERS CLUB</div><h1 id="ccopy">苺主になる、<br>ということ。</h1>' +
    '<p class="b" style="margin-top:10px">決められるのは、どれを応援するかだけ。オッズも馬券も賞金もない。結果は自分では選べない。</p>' +
    (mine ? '<div class="clubcard"><div class="hd"><span class="wk" style="background:' + mine.wc + '"></span><div><div class="nm">' + mine.no + '号　' + mine.name + '</div><div class="rl">あなたが応援している系統</div></div><div class="mem"><b>' + (S.no || '') + '</b><span>OWNER ID</span></div></div></div>' : '') +
    '<div class="sec"><b>CLUBS</b><span>' + CLUBS.length + '団体</span></div>' +
    CLUBS.map(function (c) { return '<div class="clubcard"><div class="hd"><span class="av" style="background-image:url(' + c.photo + ')"></span><div><div class="nm">' + c.name + '</div><div class="rl">' + c.rep + '　' + c.repRole + '</div></div><div class="mem"><b>' + c.members.toLocaleString() + '</b><span>MEMBERS</span></div></div><p>' + c.text + '</p></div>'; }).join('') +
    '<div class="sec"><b>CROSSING</b><span>交配を設計する</span></div><p class="b" style="margin-top:10px">交配親を2つ選ぶ。生まれる系統は自分では決められない。形質は確率で受け継がれる。</p>' +
    '<div class="pick" id="pick">' + LINES.map(function (l, i) { return '<button data-i="' + i + '"><span class="sw" style="background:' + l.wc + '"></span><span class="nm2">' + l.no + '号 ' + l.name + '</span></button>'; }).join('') + '</div>' +
    '<div class="cta"><button class="btn" id="cross" disabled>交配する<span class="ar">→</span></button></div><div id="cout"></div>' + (S.child ? childCard(S.child) : '') +
    '<div style="height:110px"></div></div>';
  charReveal($('#ccopy'), 60, 30);
  var sel = [];
  $$('#pick button').forEach(function (b) { b.onclick = function () { var i = +b.dataset.i, at = sel.indexOf(i); if (at >= 0) sel.splice(at, 1); else { if (sel.length === 2) sel.shift(); sel.push(i); }
    $$('#pick button').forEach(function (x) { x.classList.toggle('on', sel.indexOf(+x.dataset.i) >= 0); }); $('#cross').disabled = sel.length !== 2; }; });
  $('#cross').onclick = function () { var c = cross(LINES[sel[0]], LINES[sel[1]]); S.child = c; save(); $('#cout').innerHTML = childCard(c); $('#cout').firstElementChild.classList.add('fade'); toast('NEW LINE ' + c.ln); };
};
function cross(a, b) { var m = function (x, y, s) { return (x + y) / 2 + (Math.random() - .5) * s; }, an = function (l) { return [l.sire, l.dam, l.bms]; };
  var sh = an(a).filter(function (x) { return an(b).indexOf(x) >= 0; }).length;
  return { ln: 'i-28-' + String(1 + Math.floor(Math.random() * 40)).padStart(2, '0'), a: a.name, b: b.name, brix: m(a.brix, b.brix, 1.1).toFixed(1), firm: Math.round(m(a.firm, b.firm, 12)), ci: (0.0625 * sh + (a.ci + b.ci) / 4).toFixed(3) }; }
function childCard(c) { return '<div class="clubcard"><div class="lbl">YOUR LINE</div><div class="nm" style="font-family:var(--serif);font-size:19px;margin-top:6px">' + c.ln + '</div>' +
  '<div class="row" style="margin-top:8px"><span class="k">両親</span><span class="v" style="font-family:var(--sans);font-size:11px">' + c.a + ' × ' + c.b + '</span></div><div class="row"><span class="k">糖度</span><span class="v">' + c.brix + '</span></div><div class="row"><span class="k">果実硬度</span><span class="v">' + c.firm + '</span></div><div class="row" style="border:0"><span class="k">近交係数</span><span class="v">' + c.ci + '</span></div></div>'; }
V.about = function () {
  var v = $('#v-about');
  v.innerHTML = '<div class="plain"><div class="lbl">READ</div><h1 id="acopy">東京優駿と同じ日に、<br>いちごの日本一を決める。</h1>' +
    '<div class="sec"><b>THE NAME</b><span>名前の由来</span></div><p class="b" style="margin-top:10px">日本ダービーの正式名称は東京優駿。優駿とは、すぐれた馬のこと。苺優駿は、そのいちご版という意味です。</p>' +
    '<div class="sec"><b>WHY THE DERBY</b><span>なぜこの日か</span></div><p class="b" style="margin-top:10px">東京優駿は三歳のその年しか出られず、去勢馬は出走できません。血統をつないできた結果を、一日で見届ける競走です。品種改良も、同じことをしている。</p>' +
    '<div class="sec"><b>RULES</b><span>出走条件</span></div>' +
    [['出走', 'まだ商品化されていない6系統のみ'], ['審査', '専門家5分野のブラインド70%＋苺主投票30%'], ['賞', 'なし。優勝系統だけが品種名を得る'], ['翌年', '優勝系統は交配親になり、その子が走る']].map(function (x) { return '<div class="row"><span class="k">' + x[0] + '</span><span class="v" style="font-family:var(--sans);font-size:11.5px">' + x[1] + '</span></div>'; }).join('') +
    '<div class="sec"><b>QUESTIONS</b><span>想定問答</span></div>' + QA.map(function (q) { return '<div class="qa"><button><span class="q">' + q[0] + '</span><span class="pm"></span></button><div class="a"><p>' + q[1] + '</p></div></div>'; }).join('') +
    '<div class="sec"><b>CREDIT</b><span>2027</span></div><p class="b" style="margin-top:10px">企画：桑田航希　／　CULTA 課題提出用のプロトタイプ。</p><div style="height:110px"></div></div>';
  charReveal($('#acopy'), 60, 26);
  $$('.qa button', v).forEach(function (b) { b.onclick = function () { var qa = b.parentNode, a = $('.a', qa), o = qa.classList.toggle('open'); a.style.maxHeight = o ? a.scrollHeight + 'px' : 0; }; });
};

/* ---------- 起動 ---------- */
document.addEventListener('click', function (e) { var t = e.target.closest('[data-go]'); if (t) go(t.dataset.go); });
deco();
(function () { var pre = ['img/w1.jpg','img/w2.jpg','img/w3.jpg']; LINES.forEach(function (l) { pre.push(l.breeder.photo); }); CLUBS.forEach(function (c) { pre.push(c.photo); }); pre.forEach(function (u) { var im = new Image(); im.src = u; }); })();
Field.init($('#photo'), $('#field'));
Field.preload(['berry1', 'berry2', 'berry3', 'berry4', 'berry5', 'berry6'], function () {
  var st = (location.hash || '').replace('#', ''); go(V[st] ? st : 'home');
  if (cur === 'home') charReveal($('#ttl'), SLOW ? 0 : 420, SLOW ? 0 : 90);
});
window.addEventListener('resize', function () { setTimeout(stageNow, 80); });
})();
