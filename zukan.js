/* =========================================================================
   zukan.js — ポケモン公式ずかんの詳細ページの組み方をそのまま当てたもの
   ・能力値は15セグメント。value/100*15 を満たす
   ・前後の個体へ移動、左右の矢印、下にも前後
   ========================================================================= */
(function () {
'use strict';
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
var Q = new URLSearchParams(location.search);
var SLOW = matchMedia('(prefers-reduced-motion: reduce)').matches || Q.get('still') === '1';
var S = (function () { try { return JSON.parse(localStorage.getItem('iy27') || '{}'); } catch (e) { return {}; } })();
function save() { try { localStorage.setItem('iy27', JSON.stringify(S)); } catch (e) {} }

var idx = Math.max(0, Math.min(5, +(Q.get('line') || 0)));
var CELLS = 15;                       /* 本家と同じ段数 */
var AX = [['甘さ', '甘さ'], ['香り', '香り'], ['硬さ', '硬さ'], ['酸味', '酸味'], ['果汁', '果汁']];

function toast(t) {
  var e = $('#toast'); e.textContent = t; e.classList.add('on');
  clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove('on'); }, 2000);
}
function imgFor(nm) { var h = 0; for (var i = 0; i < nm.length; i++) h = (h * 31 + nm.charCodeAt(i)) | 0; return LINES[Math.abs(h) % 6].img; }
function pod(cls, cap, nm, img, show) {
  return '<div class="pod ' + cls + '"><div class="cap">' + cap + '</div>' +
    '<div class="ph" style="background-image:url(' + (img || imgFor(nm)) + ')"></div>' +
    '<div class="nm">' + (show || nm) + '</div></div>';
}
function cells(v) {
  var n = Math.round(v / 100 * CELLS), h = '';
  for (var i = 0; i < CELLS; i++) h += '<i' + (i < n ? ' class="fill"' : '') + '></i>';
  return h;
}

function render() {
  var l = LINES[idx], b = l.breeder;
  var prev = LINES[(idx + 5) % 6], next = LINES[(idx + 1) % 6];
  $('#page').innerHTML =
    '<div class="head"><div class="no">No.0' + l.no + '　CANDIDATE</div>' +
      '<div class="nm">' + l.name + '</div><div class="kj">' + l.kanji + '　' + l.ln + '</div></div>' +

    '<div class="hero"><div class="stage" data-shape="' + l.shape + '"></div>' +
      '<button class="arw l" id="pv"><svg viewBox="0 0 26 34"><path d="M18 3 6 17l12 14"/></svg></button>' +
      '<button class="arw r" id="nx"><svg viewBox="0 0 26 34"><path d="M8 3l12 14L8 31"/></svg></button>' +
      '<div class="pn l">' + prev.no + '号</div><div class="pn r">' + next.no + '号</div></div>' +

    '<div class="types"><span><i style="background:' + l.wc + '"></i>枠' + l.no + '</span>' +
      '<span>' + l.form + '</span></div>' +

    '<div class="spec">' +
      '<dl><dt>けいとう</dt><dd>' + l.ln + '</dd></dl>' +
      '<dl><dt>そだち</dt><dd>' + l.from + '</dd></dl>' +
      '<dl><dt>おもさ</dt><dd>' + l.wt + ' g</dd></dl>' +
      '<dl><dt>とうど</dt><dd>' + l.brix + '　<span style="color:var(--g2);font-weight:400">糖酸比 ' + (l.brix / l.acid).toFixed(1) + '</span></dd></dl>' +
    '</div>' +
    '<p class="desc">' + l.desc + '</p>' +

    '<div class="stats"><div class="ttl">のうりょく<em>ABILITY</em></div>' +
      AX.map(function (a) {
        return '<div class="srow"><span class="k">' + a[1] + '</span>' +
          '<span class="cells" data-v="' + l.radar[a[0]] + '">' + cells(l.radar[a[0]]) + '</span>' +
          '<span class="v">' + l.radar[a[0]] + '</span></div>';
      }).join('') +
      '<div class="srow"><span class="k">耐暑性</span><span class="cells" data-v="' + l.heat + '">' + cells(l.heat) + '</span>' +
      '<span class="v">' + l.heat + '</span></div></div>' +

    '<div class="evo"><div class="ttl">けいとう<em>PEDIGREE</em></div>' +
      '<div class="chain">' + pod('', '親A', l.sire) + '<div class="arrow"></div>' +
        pod('me', '', l.name, l.img, l.no + '号') + '<div class="arrow l"></div>' + pod('', '親B', l.dam) + '</div>' +
      '<div class="gp"><div>祖父A<b>' + l.ss + '</b>祖母A<b>' + l.sd + '</b></div>' +
        '<div>祖父B<b>' + l.bms + '</b>祖母B<b>' + l.dd + '</b></div></div>' +
      '<div class="inb"><span>近交係数　' + l.cross + '</span><b>' + l.ci.toFixed(3) + '</b></div></div>' +

    '<div class="brd"><div class="ttl">いくしゅしゃ<em>BREEDER</em></div>' +
      '<div class="bwrap"><div class="ph" style="background-image:url(' + b.photo + ')"></div>' +
      '<div><div class="nm">' + b.name + '</div><div class="ro">' + b.roma + '</div>' +
      '<div class="qt">' + b.quote + '</div><div class="tx">' + b.text + '</div></div></div></div>' +

    '<div class="foot"><button class="own" id="own">' +
      (S.owner === l.no ? 'この品種の苺主です' : 'この品種の苺主になる') + '<span class="ar">→</span></button>' +
      '<div class="nav2"><button id="pv2"><svg viewBox="0 0 18 24"><path d="M12 3 4 12l8 9"/></svg>' + prev.no + '号　' + prev.name + '</button>' +
      '<button id="nx2">' + next.no + '号　' + next.name + '<svg viewBox="0 0 18 24"><path d="M6 3l8 9-8 9"/></svg></button></div></div>';

  $('#pv').onclick = $('#pv2').onclick = function () { move(-1); };
  $('#nx').onclick = $('#nx2').onclick = function () { move(1); };
  $('#own').onclick = function () {
    S.owner = l.no; S.no = S.no || ('ICY-2027-' + (1000 + Math.floor(Math.random() * 8999))); save();
    $('#own').firstChild.nodeValue = 'この品種の苺主です'; toast('苺主になりました　' + S.no);
  };
  Field.apply(l.shape, $('.stage'), { dir: 'right', spread: 120 });
  fillBars();
}
/* 本家と同じで、段が下から立ち上がって満ちていく */
function fillBars() {
  $$('.cells').forEach(function (c, r) {
    var cs = $$('i', c);
    cs.forEach(function (e, i) {
      e.classList.remove('on');
      setTimeout(function () { e.classList.add('on'); }, SLOW ? 0 : 140 + r * 70 + i * 26);
    });
  });
}
function move(d) {
  idx = (idx + d + 6) % 6;
  var u = new URL(location); u.searchParams.set('line', idx); history.replaceState(null, '', u);
  render();
  if ($('#shell').scrollTop !== undefined) $('#shell').scrollTop = 0;
  window.scrollTo(0, 0);
}
Field.init($('#photo'), $('#field'));
Field.preload(['berry1', 'berry2', 'berry3', 'berry4', 'berry5', 'berry6'], render);
window.addEventListener('resize', function () { setTimeout(function () { Field.apply(LINES[idx].shape, $('.stage'), { dir: 'right', spread: 120 }); }, 80); });
})();
