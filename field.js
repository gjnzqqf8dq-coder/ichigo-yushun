/* =========================================================================
   field.js — パーティクルフィールド
   画面にひとつだけ存在する粒子の層。画面が変わっても粒子は消えず、
   次のかたちへ流れていく。いちご・馬・DNA・日本列島はすべて同じ粒子。

   ふたつのモード
     single … かたちをひとつ、指定の枠に置く
     ring   … 6つのかたちを奥行きのある輪に並べ、回す
   どちらにも「まわりに散る粒（halo）」がついていて、常にちらついている。
   ========================================================================= */
(function (g) {
'use strict';

var RED = [228, 0, 43], DRED = [196, 18, 46], GREY = [150, 150, 150];
/* 散る粒に混ぜる差し色＝枠番の色（1白 2黒 3赤 4青 5黄 6緑） */
var ACC = [[186,186,186],[26,26,26],[228,0,43],[27,79,216],[232,184,0],[15,138,76]];
var cv, ctx, W = 0, H = 0, DPR = 1, P = [], N = 0, NH = 0, raf = 0;
var cache = {}, t0 = performance.now();
var ptr = { x: -9999, y: -9999, on: false };
var slow = g.matchMedia('(prefers-reduced-motion: reduce)').matches;

var mode = 'none';
var single = null;                       // {S, box, opt}
var ring = { shapes: [], box: null, rot: 0, vel: 0, drag: false, idx: 0, cb: null, opt: {} };
var glow = null, solids = [];            // 実体として描くもの

/* ---------------- かたちの供給 ---------------- */

function scan(im, tint) {
  var S = 320, aw, ah;
  if (im.naturalWidth >= im.naturalHeight) { aw = S; ah = Math.round(S * im.naturalHeight / im.naturalWidth); }
  else { ah = S; aw = Math.round(S * im.naturalWidth / im.naturalHeight); }
  var c = document.createElement('canvas'); c.width = aw; c.height = ah;
  var x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(im, 0, 0, aw, ah);
  var d = x.getImageData(0, 0, aw, ah).data, pts = [], pal = [];
  for (var y = 0; y < ah; y += 2) {
    for (var px = 0; px < aw; px += 2) {
      var i = (y * aw + px) * 4;
      if (d[i + 3] < 24) continue;
      var r = d[i], gg = d[i + 1], b = d[i + 2];
      if (r > 250 && gg > 248 && b > 245) continue;
      var L = r * 0.299 + gg * 0.587 + b * 0.114;
      if (!tint && L > 186) { var f = 186 / L; r *= f; gg *= f; b *= f; }
      pts.push([px, y, tint ? tint[0] : r | 0, tint ? tint[1] : gg | 0, tint ? tint[2] : b | 0]);
    }
  }
  for (var k = 0; k < 40; k++) { var q = pts[(k * 3571) % pts.length]; if (q) pal.push([q[2], q[3], q[4]]); }
  var o = { pts: pts, w: aw, h: ah, pal: pal.length ? pal : [GREY] };
  precalc(o); return o;
}

function gen(w, h, list) {
  var pal = []; for (var k = 0; k < 12; k++) { var q = list[(k * 97) % list.length]; pal.push([q[2], q[3], q[4]]); }
  var o = { pts: list, w: w, h: h, pal: pal };
  precalc(o); return o;
}
/* 崩れ量と方向は点ごとに固定なので、一度だけ計算しておく（毎フレームの三角関数を消す） */
function precalc(o) {
  for (var i = 0; i < o.pts.length; i++) {
    var q = o.pts[i], u = q[0] / o.w, v = q[1] / o.h;
    var t = Math.min(1, Math.hypot(u - .5, v - .5) * 2);
    var a = Math.atan2(v - .5, u - .5);
    q[5] = Math.pow(t, 2.4); q[6] = Math.cos(a); q[7] = Math.sin(a);
    q[8] = u; q[9] = v;
  }
}
function dnaShape() {
  var w = 190, h = 300, pts = [], turns = 3.0, n = 560;
  for (var i = 0; i < n; i++) {
    var t = i / n, y = t * h, ph = t * Math.PI * 2 * turns, amp = w * 0.30;
    pts.push([w / 2 + Math.sin(ph) * amp, y, RED[0], RED[1], RED[2]]);
    pts.push([w / 2 + Math.sin(ph + Math.PI) * amp, y, GREY[0], GREY[1], GREY[2]]);
    if (i % 10 === 0) {
      var x1 = w / 2 + Math.sin(ph) * amp, x2 = w / 2 + Math.sin(ph + Math.PI) * amp;
      for (var k = 0; k <= 8; k++) pts.push([x1 + (x2 - x1) * k / 8, y, GREY[0], GREY[1], GREY[2]]);
    }
  }
  return gen(w, h, pts);
}
function dustShape() {
  var w = 300, h = 300, pts = [];
  for (var i = 0; i < 1600; i++) pts.push([Math.random() * w, Math.random() * h, GREY[0], GREY[1], GREY[2]]);
  return gen(w, h, pts);
}

var SRC = {
  horse:  { url: 'img/horse.png',  tint: DRED },
  horses: { url: 'img/horses.png', tint: DRED },
  japan:  { url: 'img/japan.png',  tint: RED  },
  dna:    { fn: dnaShape },
  dust:   { fn: dustShape }
};
for (var bi = 1; bi <= 6; bi++) SRC['berry' + bi] = { url: 'img/berry' + bi + '.png', solid: true };

function shape(name, cb) {
  if (cache[name]) return cb(cache[name]);
  var s = SRC[name];
  if (!s) { cache[name] = dustShape(); return cb(cache[name]); }
  if (s.fn) { cache[name] = s.fn(); return cb(cache[name]); }
  var im = new Image();
  im.onload = function () { var o = scan(im, s.tint); if (s.solid) o.im = im; cache[name] = o; cb(o); };
  im.onerror = function () { cache[name] = dustShape(); cb(cache[name]); };
  im.src = s.url;
}
function preload(names, done) {
  var left = names.length;
  names.forEach(function (n) { shape(n, function () { if (--left === 0 && done) done(); }); });
}

/* 実体を、崩れていく側だけ透かす（粒子へつながるように） */
var fades = {};
function faded(S, name, dir) {
  if (!S.im || !dir || dir === 'radial') return S.im;
  var key = name + '|' + dir;
  if (fades[key]) return fades[key];
  var c = document.createElement('canvas');
  c.width = S.im.naturalWidth; c.height = S.im.naturalHeight;
  var x = c.getContext('2d');
  x.drawImage(S.im, 0, 0);
  var g0 = dir === 'left' ? [c.width, 0, 0, 0] : dir === 'right' ? [0, 0, c.width, 0]
    : dir === 'up' ? [0, c.height, 0, 0] : [0, 0, 0, c.height];
  var gr = x.createLinearGradient(g0[0], g0[1], g0[2], g0[3]);
  gr.addColorStop(0, 'rgba(0,0,0,0)');
  gr.addColorStop(0.46, 'rgba(0,0,0,0)');
  gr.addColorStop(0.80, 'rgba(0,0,0,.72)');
  gr.addColorStop(1, 'rgba(0,0,0,1)');
  x.globalCompositeOperation = 'destination-out';
  x.fillStyle = gr; x.fillRect(0, 0, c.width, c.height);
  fades[key] = c;
  return c;
}

/* ---------------- 初期化 ---------------- */

function count() {
  var a = g.innerWidth * g.innerHeight;
  return a < 380000 ? 5200 : a < 900000 ? 6800 : 7800;
}
function resize() {
  DPR = Math.min(2, g.devicePixelRatio || 1);
  W = cv.clientWidth; H = cv.clientHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
function init(canvas) {
  cv = canvas; ctx = cv.getContext('2d');
  resize();
  N = count(); NH = Math.round(N * 0.26);       // 後ろの四分の一は halo
  P = [];
  for (var i = 0; i < N; i++) {
    P.push({
      x: W / 2 + (Math.random() - .5) * W, y: H / 2 + (Math.random() - .5) * H,
      vx: 0, vy: 0, tx: W / 2, ty: H / 2,
      r: 240, g: 240, b: 240, Tr: 240, Tg: 240, Tb: 240,
      seed: (Math.random() * 1e6) | 0,
      lag: Math.random(), ph: Math.random() * 6.283, sp: .45 + Math.random() * .95,
      sz: 1.0 + Math.random() * .9, jit: .35, a: 0, Ta: 0, off: 0,
      hx: Math.random(), hy: Math.random(), hz: Math.random(), hnext: Math.random() * 4000
    });
  }
  g.addEventListener('resize', function () { resize(); relayout(); });
  g.addEventListener('pointermove', function (e) {
    var b = cv.getBoundingClientRect(); ptr.x = e.clientX - b.left; ptr.y = e.clientY - b.top; ptr.on = true;
  });
  g.addEventListener('pointerleave', function () { ptr.on = false; });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) loop(performance.now());
  });
  loop(performance.now());
}

function rect(el) {
  var cb = cv.getBoundingClientRect(), r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
  if (r && (r.width > 2 || r.height > 2))
    return { left: r.left - cb.left, top: r.top - cb.top, width: r.width, height: r.height };
  return { left: 0, top: 0, width: W, height: H };
}
function relayout() {
  if (mode === 'single' && single) apply(single.name, single.el, single.opt);
  if (mode === 'ring') ring.box = rect(ring.el);
}

/* ---------------- single ---------------- */

function apply(name, el, opt) {
  opt = opt || {};
  mode = 'single';
  shape(name, function (S) {
    single = { name: name, el: el, opt: opt, S: S, box: rect(el) };
    solids = [];
    var box = single.box;
    var s = Math.min(box.width / S.w, box.height / S.h) * (opt.pad == null ? .94 : opt.pad);
    var cx = box.left + box.width / 2, cy = box.top + box.height / 2;
    if (S.im) solids = [{ im: faded(S, name, opt.dir), S: S, x: cx, y: cy, sc: s, al: 1 }];
    var M = S.pts.length, dir = opt.dir || 'radial';
    var spread = opt.spread == null ? Math.min(box.width, box.height) * .18 : opt.spread;
    glow = { x: cx, y: cy, r: Math.max(box.width, box.height) * .62, c: S.pal[0] };
    for (var i = 0; i < N - NH; i++) {
      var p = P[i], q = S.pts[p.seed % M];
      var u = q[0] / S.w, v = q[1] / S.h, t;
      if (dir === 'left') t = 1 - u; else if (dir === 'right') t = u;
      else if (dir === 'up') t = 1 - v; else if (dir === 'down') t = v;
      else t = Math.min(1, Math.hypot(u - .5, v - .5) * 2);
      var fly = Math.pow(Math.max(0, Math.min(1, t)), 2.4) * (.2 + p.lag * .8);
      var ang = dir === 'left' ? Math.PI : dir === 'right' ? 0 : dir === 'up' ? -Math.PI / 2
        : dir === 'down' ? Math.PI / 2 : Math.atan2(v - .5, u - .5);
      p.tx = cx + (q[0] - S.w / 2) * s + Math.cos(ang) * fly * spread + (p.ph - 3.14) * fly * 4;
      p.ty = cy + (q[1] - S.h / 2) * s + Math.sin(ang) * fly * spread + (p.sp - .9) * fly * 18;
      p.Tr = q[2]; p.Tg = q[3]; p.Tb = q[4];
      p.off = fly; p.jit = .3 + fly * 1.6; p.szm = 1;
      p.Ta = S.im ? (fly > .04 ? .18 + (1 - fly) * .52 : .24)
                  : (fly > .04 ? .3 + (1 - fly) * .68 : 1);
    }
    halo(box, S.pal, opt.halo == null ? 1 : opt.halo);
  });
}

/* まわりに散る粒。中心から遠いほど疎で、ゆっくり居場所を変え続ける */
var haloBox = null, haloPal = null, haloK = 1, haloT = 0;
function halo(box, pal, k) {
  haloBox = box; haloPal = pal; haloK = k;
  var cx = box.left + box.width / 2, cy = box.top + box.height / 2;
  var rw = Math.max(box.width, W * .92), rh = Math.max(box.height * 1.5, box.height + 120);
  for (var i = N - NH; i < N; i++) {
    var p = P[i];
    var c = (p.seed % 4 === 0) ? ACC[p.seed % 6] : pal[p.seed % pal.length];
    var a = p.hx * 6.283, d = Math.pow(p.hy, .55);
    p.tx = cx + Math.cos(a) * d * rw * .56;
    p.ty = cy + Math.sin(a) * d * rh * .56;
    p.Tr = c[0]; p.Tg = c[1]; p.Tb = c[2];
    p.off = .8; p.jit = 1.1 + p.hz * 1.8; p.szm = .9 + p.hz * .8;
    p.Ta = k * (.16 + (1 - d) * .52) * (.45 + p.hz);
  }
}

/* ---------------- ring ---------------- */

function makeRing(names, el, opt) {
  opt = opt || {};
  preload(names, function () {
    mode = 'ring';
    ring.shapes = names.map(function (n) { return cache[n]; });
    ring.el = el; ring.box = rect(el); ring.opt = opt;
    ring.cb = opt.onIndex || null;
    ring.rot = -(ring.idx = opt.index || 0) * (6.283 / names.length);
    ring.target = ring.rot;
  });
}
function spin(dx) {
  if (mode !== 'ring') return;
  ring.drag = true; ring.vel = 0;
  ring.rot += dx * 0.0072;
}
function release() {
  if (mode !== 'ring') return;
  ring.drag = false;
  snap();
}
function snap() {
  var n = ring.shapes.length, step = 6.283 / n;
  var k = Math.round(-ring.rot / step);
  ring.target = -k * step;
  var idx = ((k % n) + n) % n;
  if (idx !== ring.idx) { ring.idx = idx; if (ring.cb) ring.cb(idx); }
}
function ringTo(i) {
  if (mode !== 'ring') return;
  var n = ring.shapes.length, step = 6.283 / n;
  var k = Math.round(-ring.rot / step);
  var d = i - (((k % n) + n) % n);
  if (d > n / 2) d -= n; if (d < -n / 2) d += n;
  ring.target = -(k + d) * step;
  ring.idx = i; if (ring.cb) ring.cb(i);
}

function ringTargets() {
  var n = ring.shapes.length, box = ring.box;
  if (!n || !box) return;
  if (!ring.drag) ring.rot += (ring.target - ring.rot) * 0.12;
  var cx = box.left + box.width / 2, cy = box.top + box.height / 2;
  var R = box.width * .50;
  var slot = [], tot = 0;
  for (var s = 0; s < n; s++) {
    var a = ring.rot + s * 6.283 / n;
    var z = Math.cos(a), k = (z + 1) / 2;
    var S = ring.shapes[s];
    var base = Math.min(box.width * .62 / S.w, box.height * .82 / S.h);
    var sc = base * (.22 + .78 * k * k);
    var al = .06 + .94 * Math.pow(k, 2.6);
    var w = sc * sc * Math.pow(al, 1.6);
    slot.push({ S: S, x: cx + Math.sin(a) * R, y: cy + (1 - k) * box.height * .06, sc: sc, al: al, k: k, w: w });
    tot += w;
  }
  var acc = 0;
  for (var s2 = 0; s2 < n; s2++) { slot[s2].lo = acc / tot; acc += slot[s2].w; slot[s2].hi = acc / tot; }
  var front = slot[0]; for (var s3 = 1; s3 < n; s3++) if (slot[s3].k > front.k) front = slot[s3];
  solids = [];
  slot.slice().sort(function (a, b) { return a.k - b.k; }).forEach(function (sl) {
    if (sl.S.im && sl.al > .04) solids.push({ im: sl.S.im, S: sl.S, x: sl.x, y: sl.y, sc: sl.sc, al: sl.al });
  });
  glow = { x: front.x, y: front.y, r: box.height * .58, c: front.S.pal[0] };

  var CN = N - NH;
  for (var i = 0; i < CN; i++) {
    var p = P[i], u = (p.seed % 10007) / 10007, sl = slot[0];
    for (var s4 = 0; s4 < n; s4++) if (u >= slot[s4].lo && u < slot[s4].hi) { sl = slot[s4]; break; }
    var S2 = sl.S, M = S2.pts.length, q = S2.pts[p.seed % M];
    var fly = q[5] * (.2 + p.lag * .8);
    var sp = box.height * .10 * (.35 + sl.k * .9);
    p.tx = sl.x + (q[0] - S2.w / 2) * sl.sc + q[6] * fly * sp;
    p.ty = sl.y + (q[1] - S2.h / 2) * sl.sc + q[7] * fly * sp;
    p.Tr = q[2]; p.Tg = q[3]; p.Tb = q[4];
    p.off = fly; p.jit = (.25 + fly * 1.5) * (.5 + sl.k * .7);
    p.szm = .70 + sl.k * .55;
    p.Ta = sl.al * (sl.S.im ? (fly > .04 ? .20 + (1 - fly) * .50 : .22)
                            : (fly > .04 ? .32 + (1 - fly) * .66 : 1));
  }
  halo({ left: front.x - box.height * .42, top: front.y - box.height * .42,
         width: box.height * .84, height: box.height * .84 }, front.S.pal, .62);
}

function hide() { mode = 'none'; glow = null; solids = []; for (var i = 0; i < N; i++) P[i].Ta = 0; }

/* ---------------- 描画 ---------------- */

function loop(now) {
  raf = requestAnimationFrame(loop);
  var tt = now - t0;
  if (mode === 'ring') ringTargets();

  ctx.clearRect(0, 0, W, H);
  if (glow) {
    var gd = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, glow.r);
    gd.addColorStop(0, 'rgba(' + glow.c[0] + ',' + glow.c[1] + ',' + glow.c[2] + ',.055)');
    gd.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gd; ctx.fillRect(glow.x - glow.r, glow.y - glow.r, glow.r * 2, glow.r * 2);
  }

  if (mode === 'single' && haloBox && now - haloT > 320) { haloT = now; halo(haloBox, haloPal, haloK); }
  for (var si = 0; si < solids.length; si++) {
    var so = solids[si], iw = so.S.w * so.sc, ih = so.S.h * so.sc;
    ctx.globalAlpha = so.al;
    ctx.drawImage(so.im, so.x - iw / 2, so.y - ih / 2, iw, ih);
  }
  ctx.globalAlpha = 1;

  var k = slow ? .18 : .065, damp = slow ? .55 : .845;
  for (var i = 0; i < N; i++) {
    var p = P[i];
    var kk = k * (.55 + p.lag * .9);
    p.vx = (p.vx + (p.tx - p.x) * kk) * damp;
    p.vy = (p.vy + (p.ty - p.y) * kk) * damp;
    p.x += p.vx; p.y += p.vy;

    if (ptr.on) {
      var dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
      if (d2 < 8000 && d2 > .5) { var f = (1 - d2 / 8000) * 3.4 / Math.sqrt(d2); p.x += dx * f; p.y += dy * f; }
    }

    p.r += (p.Tr - p.r) * .09; p.g += (p.Tg - p.g) * .09; p.b += (p.Tb - p.b) * .09;
    p.a += (p.Ta - p.a) * .07;
    if (p.a < .012) continue;

    // 遠い halo はゆっくり居場所を変え続ける（止まって見えないように）
    if (i >= N - NH) {
      p.hnext -= 16.7;
      if (p.hnext < 0) { p.hx = Math.random(); p.hy = Math.random(); p.hnext = 2200 + Math.random() * 5200; p.hmove = 1; }
    }

    var fl = slow ? 1 : (.62 + .38 * Math.sin(tt * .0135 * p.sp + p.ph * 3.1));
    var jx = slow ? 0 : (Math.random() - .5) * p.jit * 2.1;
    var jy = slow ? 0 : (Math.random() - .5) * p.jit * 2.1;
    var dr = slow ? 0 : Math.sin(tt * .00072 * p.sp + p.ph) * p.off * 5.5;

    ctx.globalAlpha = p.a * fl;
    ctx.fillStyle = 'rgb(' + (p.r | 0) + ',' + (p.g | 0) + ',' + (p.b | 0) + ')';
    var sz = p.sz * (p.szm || 1);
    ctx.fillRect(p.x + jx + dr, p.y + jy, sz, sz);
  }
  ctx.globalAlpha = 1;

}

g.Field = {
  init: init, apply: apply, hide: hide, preload: preload,
  ring: makeRing, spin: spin, release: release, ringTo: ringTo,
  ringIndex: function () { return ring.idx; },
  RED: RED
};
})(window);
