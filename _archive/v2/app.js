/* =========================================================================
   app.js — 苺優駿 / JAPAN STRAWBERRY DERBY
   画面は3つ。クラブ / ホーム / はじめに。図鑑はホームから開く別ページ。
   スクロールしないと数値が見えない、という状態を作らない。
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

/* ---------------- 小道具 ---------------- */
function seg(str) {
  if (window.Intl && Intl.Segmenter) {
    try { return Array.from(new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(str), function (s) { return s.segment; }); }
    catch (e) {}
  }
  return str.split('');
}
function charReveal(el, delay, step) {
  if (!el) return;
  var lines = el.textContent.split('\n'), k = 0;
  var DL = SLOW ? 0 : (delay || 0), ST = SLOW ? 0 : (step || 40);
  el.textContent = ''; el.setAttribute('translate', 'no');
  lines.forEach(function (line, li) {
    if (li) el.appendChild(document.createElement('br'));
    seg(line).forEach(function (c) {
      var o = document.createElement('span'), i = document.createElement('i');
      o.className = 'rc'; i.textContent = c === ' ' ? ' ' : c;
      i.style.transitionDelay = (DL + k * ST) + 'ms';
      o.appendChild(i); el.appendChild(o); k++;
    });
  });
  setTimeout(function () { $$('.rc', el).forEach(function (x) { x.classList.add('on'); }); }, 24);
}
function bars(root, d) {
  setTimeout(function () {
    $$('[data-w]', root).forEach(function (b, i) {
      setTimeout(function () { b.style.width = b.dataset.w + '%'; }, i * 55);
    });
  }, d || 110);
}
function countTo(el, to, ms) {
  if (!el) return;
  if (SLOW) { el.textContent = to; return; }
  var t0 = performance.now(), D = ms || 1000;
  (function step(t) {
    var k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 4);
    el.textContent = Math.round(to * e);
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}
function toast(t) {
  var e = $('#toast'); e.textContent = t; e.classList.add('on');
  clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove('on'); }, 2000);
  if (navigator.vibrate) try { navigator.vibrate(10); } catch (x) {}
}
function ico(k) {
  var p = {
    sun: '<circle cx="9" cy="9" r="3.2"/><path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.5 3.5l1.4 1.4M13.1 13.1l1.4 1.4M14.5 3.5l-1.4 1.4M4.9 13.1l-1.4 1.4" stroke-linecap="round"/>',
    wave: '<path d="M1 11.5c2-3.2 4-3.2 6 0s4 3.2 6 0 3-2.4 4-1.3"/><path d="M1 6.6c2-3.2 4-3.2 6 0s4 3.2 6 0 3-2.4 4-1.3"/>',
    shield: '<path d="M9 1.6 2.8 4.2v5c0 3.5 2.5 6.1 6.2 7 3.7-.9 6.2-3.5 6.2-7v-5z"/>',
    temp: '<path d="M11 10.6V3.5a2 2 0 1 0-4 0v7.1a3.5 3.5 0 1 0 4 0z"/>'
  };
  return '<svg viewBox="0 0 18 18" style="width:16px;height:16px;fill:none;stroke:var(--rd);stroke-width:1.35">' + (p[k] || '') + '</svg>';
}

/* ---------------- ルーター ---------------- */
var cur = '', V = {}, TAB = { home: 1, club: 1, about: 1 };
function go(name) {
  if (name === cur) return;
  var from = $('#v-' + cur), to = $('#v-' + name);
  if (!to) return;
  if (from) { from.classList.add('out'); from.classList.remove('on'); setTimeout(function () { from.classList.remove('out'); }, 220); }
  cur = name;
  document.body.classList.toggle('nofoot', !TAB[name]);
  $$('#tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.go === name); });
  to.scrollTop = 0;
  V[name]();
  void to.offsetHeight;
  to.classList.add('on');
  setTimeout(stageNow, 20);
}
function stageNow() {
  var v = $('#v-' + cur), st = v && $('.stage', v);
  if (!st) { Field.hide(); return; }
  if (st.dataset.ring) return;
  Field.apply(st.dataset.shape || 'dust', st, {
    dir: st.dataset.dir || 'radial',
    spread: st.dataset.spread ? +st.dataset.spread : undefined
  });
}

/* =========================================================================
   HOME — いちごが6つ並び、手前の一粒が大きい
   ========================================================================= */
var idx = Math.max(0, Math.min(5, +(Q.get('line') || 0)));
V.home = function () {
  var v = $('#v-home');
  if (!v._b) {
    v._b = 1;
    v.classList.add('noscroll');
    v.innerHTML =
      '<div class="hhead">' +
        '<svg class="cr" viewBox="0 0 44 24"><path d="M3 22 L10 7 L16 15 L22 3 L28 15 L34 7 L41 22 Z"/></svg>' +
        '<h1 class="big" id="ttl">苺優駿</h1>' +
        '<div class="sub">新しい一粒を、選ぶ。</div>' +
      '</div>' +
      '<div class="rowstage">' +
        '<div class="stage" id="ringstage" data-ring="1"></div>' +
        '<div class="rings"><i></i><i></i><i></i></div>' +
        '<div class="caro" id="caro"></div>' +
        '<div class="labels" id="labels"></div>' +
        '<button class="arw l" id="aL"><svg viewBox="0 0 14 14"><path d="M9 2 4 7l5 5"/></svg></button>' +
        '<button class="arw r" id="aR"><svg viewBox="0 0 14 14"><path d="M5 2l5 5-5 5"/></svg></button>' +
        '<div class="dots" id="dots">' + LINES.map(function (l, i) { return '<i data-i="' + i + '"></i>'; }).join('') + '</div>' +
      '</div>' +
      '<div class="hfoot"><div class="hstat" id="hstat"></div>' +
      '<button class="btn" id="open"><span id="openT"></span><span class="ar">→</span></button></div>';
    buildCaro();
    $('#open').onclick = function () { go('dex'); };
    $('#caro').addEventListener('click', function () { if (!$('#caro')._moved) go('dex'); });
  }
  paintHome();
};
function buildCaro() {
  Field.ring(LINES.map(function (l) { return l.shape; }), $('#ringstage'), {
    index: idx,
    onIndex: function (i) { idx = i; paintHome(); },
    onFrame: function (slots) {
      var lb = $('#labels'); if (!lb) return;
      if (!lb._n) { lb.innerHTML = LINES.map(function (l) { return '<span>' + l.name + '</span>'; }).join(''); lb._n = 1; }
      for (var i = 0; i < slots.length; i++) {
        var s = slots[i], e = lb.children[i];
        e.style.left = s.x + 'px';
        e.style.opacity = Math.max(0, s.k * 1.5 - .3);
        e.classList.toggle('on', s.k > .985);
      }
    }
  });
  var t = $('#caro'), down = false, lx = 0;
  t.addEventListener('pointerdown', function (e) { down = true; t._moved = 0; lx = e.clientX; try { t.setPointerCapture(e.pointerId); } catch (x) {} });
  t.addEventListener('pointermove', function (e) {
    if (!down) return;
    var d = e.clientX - lx; lx = e.clientX; t._moved += Math.abs(d); Field.spin(-d);
  });
  var up = function () { if (!down) return; down = false; Field.release(); };
  t.addEventListener('pointerup', up); t.addEventListener('pointercancel', up);
  t.addEventListener('wheel', function (e) {
    e.preventDefault(); Field.spin(e.deltaY > 0 ? 24 : -24);
    clearTimeout(t._w); t._w = setTimeout(function () { Field.release(); }, 130);
  }, { passive: false });
  $('#aL').onclick = function () { Field.ringTo((idx + 5) % 6); };
  $('#aR').onclick = function () { Field.ringTo((idx + 1) % 6); };
  $$('#dots i').forEach(function (d) { d.onclick = function () { Field.ringTo(+d.dataset.i); }; });
}
function paintHome() {
  var l = LINES[idx];
  $$('#dots i').forEach(function (x, i) { x.classList.toggle('on', i === idx); });
  var hs = $('#hstat'); if (!hs) return;
  hs.innerHTML = [['BRIX', l.brix], ['FIRMNESS', l.firm], ['HEAT', l.heat]].map(function (x) {
    return '<div><div class="k">' + x[0] + '</div><div class="v">' + x[1] + '</div></div>';
  }).join('');
  $('#openT').textContent = l.name + 'を開く';
}

/* =========================================================================
   図鑑
   ========================================================================= */
var dTab = Math.max(0, Math.min(2, +(Q.get('tab') || 0)));
V.dex = function () {
  var l = LINES[idx], v = $('#v-dex');
  v.classList.add('noscroll');
  v.innerHTML =
    '<div class="dexhero">' +
      '<div class="stage" data-shape="' + l.shape + '" data-dir="radial" data-spread="30"></div>' +
      '<div class="rings"><i></i><i></i><i></i></div>' +
      '<div class="lbl no">CANDIDATE No.0' + l.no + '</div>' +
    '</div>' +
    '<div class="dexcard">' +
      '<div class="dexhead"><div class="nm">' + l.name + '</div><div class="sp"></div>' +
        '<div class="cd">' + l.kanji + '<br>' + l.ln + '</div></div>' +
      '<div class="dexcopy" id="dcopy">' + l.copy.join('') + '</div>' +
      '<div class="seg" id="seg">' + ['パラメーター', '血統図', '育種者'].map(function (t, i) {
        return '<button data-t="' + i + '"' + (i === dTab ? ' class="on"' : '') + '>' + t + '</button>'; }).join('') + '</div>' +
      '<div class="dexbody" id="dbody"></div>' +
      '<div class="dexfoot">' +
        '<div class="cta"><button class="btn" id="join">' +
          (S.owner === l.no ? 'このクラブに入っています' : 'この品種の苺主になる') + '<span class="ar">→</span></button>' +
          '<button class="fav' + (S.fav === l.no ? ' on' : '') + '" id="fav">♥</button></div>' +
        '<button class="dexclose" id="cls">閉じる<i>✕</i></button>' +
      '</div>' +
    '</div>';
  $$('#seg button').forEach(function (b) { b.onclick = function () { dTab = +b.dataset.t; paintDex(); }; });
  $('#cls').onclick = function () { go('home'); };
  $('#fav').onclick = function () { S.fav = S.fav === l.no ? 0 : l.no; save(); $('#fav').classList.toggle('on', S.fav === l.no); };
  $('#join').onclick = function () {
    S.owner = l.no; S.no = S.no || ('ICY-2027-' + (1000 + Math.floor(Math.random() * 8999))); save();
    toast('苺主 ' + S.no); setTimeout(function () { go('club'); }, 620);
  };
  charReveal($('#dcopy'), 90, 30);
  paintDex();
};
function paintDex() {
  var l = LINES[idx];
  $$('#seg button').forEach(function (b, i) { b.classList.toggle('on', i === dTab); });
  var t = $('#dbody');
  t.innerHTML = dTab === 0 ? abilHTML(l) : dTab === 1 ? treeHTML(l) : brdHTML(l);
  t.scrollTop = 0;
  if (dTab === 0) { animRadar(l); bars(t, 180); }
  if (dTab === 1) { wireTree(); setTimeout(function () { var e = $('.tree'); if (e) e.classList.add('on'); }, 70); }
  if (dTab === 2) { countTo($('#byr'), l.breeder.years, 1000); }
}

/* --- パラメーター --- */
var RAX = ['甘さ', '香り', '硬さ', '酸味', '果汁'], RR = 62, RC = 106;
function rpt(i, f) {
  var a = -Math.PI / 2 + i * Math.PI * 2 / 5;
  return [RC + Math.cos(a) * RR * f, RC + Math.sin(a) * RR * f];
}
function abilHTML(l) {
  var web = '';
  [1, .75, .5, .25].forEach(function (f) {
    web += '<polygon class="web" points="' + RAX.map(function (k, i) { return rpt(i, f).join(','); }).join(' ') + '"/>';
  });
  RAX.forEach(function (k, i) { var p = rpt(i, 1); web += '<line class="ax" x1="' + RC + '" y1="' + RC + '" x2="' + p[0] + '" y2="' + p[1] + '"/>'; });
  var labs = RAX.map(function (k, i) {
    var p = rpt(i, 1.34), an = i === 0 ? 'middle' : (p[0] > RC + 4 ? 'start' : (p[0] < RC - 4 ? 'end' : 'middle'));
    var dy = i === 0 ? -8 : (p[1] > RC ? 11 : 0);
    return '<text class="rn" x="' + p[0] + '" y="' + (p[1] + dy) + '" text-anchor="' + an + '">' + k + '</text>' +
           '<text class="rv" x="' + p[0] + '" y="' + (p[1] + dy + 15) + '" text-anchor="' + an + '">' + l.radar[k] + '</text>';
  }).join('');
  return '<div class="abil">' +
    '<svg class="radar" viewBox="0 0 212 212">' + web +
      '<polygon class="area" id="rarea" points="' + RAX.map(function () { return RC + ',' + RC; }).join(' ') + '"/>' +
      RAX.map(function (k, i) { var p = rpt(i, l.radar[k] / 100); return '<circle class="dot" cx="' + p[0] + '" cy="' + p[1] + '" r="3.2"/>'; }).join('') + labs +
    '</svg>' +
    '<div>' + RAX.map(function (k) {
      return '<div class="mrow"><span class="k">' + k + '</span><span class="bar"><i data-w="' + l.radar[k] + '"></i></span>' +
        '<span class="v">' + l.radar[k] + '</span></div>';
    }).join('') + '</div></div>' +
    '<p class="b" style="margin-top:10px">' + l.flavor + '</p>' +
    '<div class="sec"><b>MEASURED</b><span>' + l.from + '</span></div>' +
    [['糖度 Brix', l.brix], ['酸度', l.acid], ['果実硬度', l.firm], ['一果重', l.wt + ' g'], ['果形', l.form]].map(function (x) {
      return '<div class="row"><span class="k">' + x[0] + '</span><span class="v">' + x[1] + '</span></div>';
    }).join('') + '<div style="height:12px"></div>';
}
function animRadar(l) {
  var area = $('#rarea'); if (!area) return;
  var T = RAX.map(function (k, i) { return rpt(i, l.radar[k] / 100); });
  if (SLOW) { area.setAttribute('points', T.map(function (p) { return p.join(','); }).join(' ')); return; }
  var t0 = performance.now();
  (function step(t) {
    var k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(2, -10 * k);
    area.setAttribute('points', T.map(function (p) { return (RC + (p[0] - RC) * e) + ',' + (RC + (p[1] - RC) * e); }).join(' '));
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}

/* --- 血統図 --- */
function imgFor(nm) {
  var h = 0; for (var i = 0; i < nm.length; i++) h = (h * 31 + nm.charCodeAt(i)) | 0;
  return LINES[Math.abs(h) % 6].img;
}
function node(cls, cap, nm, img) {
  return '<button class="node ' + cls + '" data-n="' + nm + '"><div class="cap">' + cap + '</div>' +
    '<div class="ph" style="background-image:url(' + (img || imgFor(nm)) + ')"></div>' +
    '<div class="nm">' + nm + '</div></button>';
}
function treeHTML(l) {
  return '<div class="tree" id="tree"><svg class="link" id="wires"></svg>' +
    '<div class="gen">' + node('', '祖父A', l.ss) + node('', '祖母A', l.sd) + node('', '祖父B', l.bms) + node('', '祖母B', l.dd) + '</div>' +
    '<div class="gen2">' + node('p', '親A', l.sire) + node('p', '親B', l.dam) + '</div>' +
    '<div class="gen3">' + node('me', '', l.name, l.img) + '</div>' +
    '<div class="geneinfo" id="ginfo"></div>' +
    '<div class="traits"><div><h5>親Aから</h5>' +
      l.traitL.map(function (x, i) { return '<li><span class="ic">' + ico(i ? 'wave' : 'sun') + '</span>' + x + '</li>'; }).join('') + '</div>' +
      '<div class="r"><h5>親Bから</h5>' +
      l.traitR.map(function (x, i) { return '<li><span class="ic">' + ico(i ? 'temp' : 'shield') + '</span>' + x + '</li>'; }).join('') + '</div></div>' +
    '<div class="sec"><b>INBREEDING</b><span>' + l.cross + '</span></div>' +
    '<div class="row"><span class="k">近交係数 F</span><span class="v">' + l.ci.toFixed(3) + '</span></div>' +
    '<div style="height:12px"></div></div>';
}
function geneInfo(nm, l) {
  var g = $('#ginfo'); if (!g) return;
  var a = ANC[nm] || [l.kanji, l.desc];
  g.innerHTML = '<div class="t"><span class="lbl" style="margin-right:8px">' + nm + '</span>' + a[0] + '</div><div class="d">' + a[1] + '</div>';
  g.classList.remove('fade'); void g.offsetWidth; g.classList.add('fade');
}
function wireTree() {
  var tr = $('#tree'), sv = $('#wires'); if (!tr || !sv) return;
  var l = LINES[idx], box = tr.getBoundingClientRect();
  var g = $$('.gen .node', tr), p = $$('.gen2 .node', tr), me = $('.gen3 .node', tr);
  var c = function (el, edge) {
    var r = $('.ph', el).getBoundingClientRect();
    return { x: r.left - box.left + r.width / 2, y: (edge === 'top' ? r.top : r.bottom) - box.top };
  };
  var d = '', rd = '';
  [[0, 1, 0], [2, 3, 1]].forEach(function (q) {
    var pa = c(p[q[2]], 'top'), mid = (c(g[q[0]], 'bottom').y + pa.y) / 2;
    [q[0], q[1]].forEach(function (i) {
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
  $$('path', sv).forEach(function (x) { var n = 600; try { n = x.getTotalLength(); } catch (e) {} x.style.setProperty('--len', n); });
  $$('.node', tr).forEach(function (b) {
    b.onclick = function () {
      $$('.node', tr).forEach(function (o) { o.classList.remove('sel'); });
      b.classList.add('sel'); geneInfo(b.dataset.n, l);
    };
  });
  geneInfo(l.bms, l);
  $$('.node', tr).forEach(function (b) { if (b.dataset.n === l.bms) b.classList.add('sel'); });
}

/* --- 育種者 --- */
function brdHTML(l) {
  var b = l.breeder;
  return '<div class="brd"><div class="ph" style="background-image:url(' + b.photo + ')"></div>' +
    '<div><div class="lbl">育種責任者</div><div class="nm">' + b.name + '</div>' +
    '<div class="ro">' + b.roma + '</div><div class="qt">' + b.quote + '</div></div></div>' +
    '<p class="b" style="margin-top:12px">' + b.text + '</p>' +
    '<div class="bstat">' +
      '<div><div class="k">育種歴</div><div class="v"><span id="byr">0</span><em>年</em></div></div>' +
      '<div><div class="k">選抜</div><div class="v">' + b.seedlings + '<em>株</em></div></div>' +
      '<div><div class="k">開発</div><div class="v">' + b.dev + '<em>年</em></div></div></div>' +
    '<div class="chips">' + b.keys.map(function (k) { return '<span>' + k + '</span>'; }).join('') + '</div>' +
    '<div class="gal">' +
      '<figure><div class="im" style="background-image:url(img/w1.png)"></div><figcaption>実生をひとつひとつ、見つめて。</figcaption></figure>' +
      '<figure><div class="im" style="background-image:url(img/w2.png)"></div><figcaption>候補を、何度も食べ比べる。</figcaption></figure>' +
      '<figure><div class="im" style="background-image:url(img/w3.png)"></div><figcaption>いちごの、あたらしい季節を。</figcaption></figure>' +
    '</div><div style="height:12px"></div>';
}

/* =========================================================================
   苺主クラブ
   ========================================================================= */
V.club = function () {
  var v = $('#v-club'), mine = S.owner ? LINES[S.owner - 1] : null;
  v.classList.remove('noscroll');
  v.innerHTML =
    '<div class="ctop">' +
      '<div class="lbl">OWNERS CLUB</div>' +
      '<h1 class="big" id="ccopy" style="margin-top:8px;font-size:25px">苺主になる、\nということ。</h1>' +
      '<p class="b" style="margin-top:12px">決められるのは、どれを応援するかだけ。オッズも馬券も賞金もない。結果は自分では選べない。</p>' +
      (mine ? '<div class="clubcard" style="margin-top:16px"><div class="hd">' +
        '<span class="wk" style="background:' + mine.wc + '"></span>' +
        '<div><div class="nm">' + mine.name + '</div><div class="rl">あなたが応援している系統</div></div>' +
        '<div class="mem"><b>' + (S.no || '') + '</b><span>OWNER ID</span></div></div></div>' : '') +
      '<div class="sec"><b>CLUBS</b><span>' + CLUBS.length + '団体</span></div>' +
      CLUBS.map(function (c) {
        return '<div class="clubcard" style="margin-top:10px"><div class="hd">' +
          '<span class="av" style="background-image:url(' + c.photo + ')"></span>' +
          '<div><div class="nm">' + c.name + '</div><div class="rl">' + c.rep + '　' + c.repRole + '</div></div>' +
          '<div class="mem"><b>' + c.members.toLocaleString() + '</b><span>MEMBERS</span></div></div>' +
          '<p>' + c.text + '</p></div>';
      }).join('') +
      '<div class="sec"><b>CROSSING</b><span>交配を設計する</span></div>' +
      '<p class="b" style="margin-top:10px">交配親を2つ選ぶ。生まれる系統は自分では決められない。形質は確率で受け継がれる。</p>' +
      '<div class="pick" id="pick">' + LINES.map(function (l, i) {
        return '<button data-i="' + i + '"><span class="sw" style="background:' + l.wc + '"></span>' +
          '<span class="nm2">' + l.name + '</span></button>'; }).join('') + '</div>' +
      '<button class="btn" id="cross" disabled style="margin-top:14px">交配する<span class="ar">→</span></button>' +
      '<div id="cout"></div>' + (S.child ? childCard(S.child) : '') +
      '<div style="height:110px"></div>' +
    '</div>';
  charReveal($('#ccopy'), 60, 30);
  var sel = [];
  $$('#pick button').forEach(function (b) {
    b.onclick = function () {
      var i = +b.dataset.i, at = sel.indexOf(i);
      if (at >= 0) sel.splice(at, 1); else { if (sel.length === 2) sel.shift(); sel.push(i); }
      $$('#pick button').forEach(function (x) { x.classList.toggle('on', sel.indexOf(+x.dataset.i) >= 0); });
      $('#cross').disabled = sel.length !== 2;
    };
  });
  $('#cross').onclick = function () {
    var c = cross(LINES[sel[0]], LINES[sel[1]]); S.child = c; save();
    $('#cout').innerHTML = childCard(c); $('#cout').firstElementChild.classList.add('fade');
    toast('NEW LINE ' + c.ln);
  };
};
function cross(a, b) {
  var m = function (x, y, s) { return (x + y) / 2 + (Math.random() - .5) * s; };
  var an = function (l) { return [l.sire, l.dam, l.bms]; };
  var sh = an(a).filter(function (x) { return an(b).indexOf(x) >= 0; }).length;
  return { ln: 'i-28-' + String(1 + Math.floor(Math.random() * 40)).padStart(2, '0'),
    a: a.name, b: b.name, brix: m(a.brix, b.brix, 1.1).toFixed(1),
    firm: Math.round(m(a.firm, b.firm, 12)), wt: m(a.wt, b.wt, 4).toFixed(1),
    ci: (0.0625 * sh + (a.ci + b.ci) / 4).toFixed(3) };
}
function childCard(c) {
  return '<div class="clubcard" style="margin-top:14px"><div class="lbl">YOUR LINE</div>' +
    '<div class="nm" style="font-size:19px;margin-top:6px">' + c.ln + '</div>' +
    '<div class="row" style="margin-top:8px"><span class="k">両親</span><span class="v" style="font-size:11px">' + c.a + ' × ' + c.b + '</span></div>' +
    '<div class="row"><span class="k">糖度</span><span class="v">' + c.brix + '</span></div>' +
    '<div class="row"><span class="k">果実硬度</span><span class="v">' + c.firm + '</span></div>' +
    '<div class="row" style="border:0"><span class="k">近交係数</span><span class="v">' + c.ci + '</span></div></div>';
}

/* =========================================================================
   はじめに
   ========================================================================= */
V.about = function () {
  var v = $('#v-about'); v.classList.remove('noscroll');
  v.innerHTML =
    '<div class="ctop">' +
      '<div class="lbl">READ</div>' +
      '<h1 class="big" id="acopy" style="margin-top:8px;font-size:25px">東京優駿と同じ日に、\nいちごの日本一を決める。</h1>' +
      '<div class="sec"><b>THE NAME</b><span>名前の由来</span></div>' +
      '<p class="b" style="margin-top:10px">日本ダービーの正式名称は東京優駿。優駿とは、すぐれた馬のこと。苺優駿は、そのいちご版という意味です。</p>' +
      '<div class="sec"><b>WHY THE DERBY</b><span>なぜこの日か</span></div>' +
      '<p class="b" style="margin-top:10px">東京優駿は三歳のその年しか出られず、去勢馬は出走できません。血統をつないできた結果を、一日で見届ける競走です。品種改良も、同じことをしている。</p>' +
      '<div class="sec"><b>RULES</b><span>出走条件</span></div>' +
      [['出走', 'まだ商品化されていない6系統のみ'], ['審査', '専門家5分野のブラインド70%＋苺主投票30%'],
       ['賞', 'なし。優勝系統だけが品種名を得る'], ['翌年', '優勝系統は交配親になり、その子が走る']].map(function (x) {
        return '<div class="row"><span class="k">' + x[0] + '</span><span class="v" style="font-family:var(--jp);font-size:11.5px">' + x[1] + '</span></div>';
      }).join('') +
      '<div class="sec"><b>QUESTIONS</b><span>想定問答</span></div>' +
      QA.map(function (q) {
        return '<div class="qa"><button><span class="q">' + q[0] + '</span><span class="pm"></span></button><div class="a"><p>' + q[1] + '</p></div></div>';
      }).join('') +
      '<div class="sec"><b>CREDIT</b><span>2027</span></div>' +
      '<p class="b" style="margin-top:10px">企画：桑田航希　／　CULTA 課題提出用のプロトタイプ。</p>' +
      '<div style="height:110px"></div>' +
    '</div>';
  charReveal($('#acopy'), 60, 26);
  $$('.qa button', v).forEach(function (b) {
    b.onclick = function () {
      var qa = b.parentNode, a = $('.a', qa), o = qa.classList.toggle('open');
      a.style.maxHeight = o ? a.scrollHeight + 'px' : 0;
    };
  });
};

/* ---------------- 起動 ---------------- */
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-go]'); if (t) go(t.dataset.go);
});
Field.init($('#field'));
Field.preload(['berry1', 'berry2', 'berry3', 'berry4', 'berry5', 'berry6', 'dna'], function () {
  var st = (location.hash || '').replace('#', '');
  go(V[st] ? st : 'home');
  if (cur === 'home') charReveal($('#ttl'), SLOW ? 0 : 480, SLOW ? 0 : 120);
});
window.addEventListener('resize', function () { setTimeout(stageNow, 80); });
})();
