/* =========================================================================
   field.js v3 — 写真そのものが粒に崩れる
   2枚のキャンバスで描く。
     #photo … いちごの写真。右側ほど画素を落として粒に変える（毎フレーム抜け方が変わる＝チリチリ）
     #field … 飛んでいく粒と、周囲に散る粒。ImageData 直書き
   単体（single）と、横一列の手持ち（strip）の2モード。
   ========================================================================= */
(function (g) {
'use strict';

var RED = [228, 20, 46], GREY = [150, 150, 150];
var ACC = [[186,186,186],[40,40,40],[228,20,46],[27,79,216],[232,184,0],[15,138,76]];

var pc, px2, fc, fx, W = 0, H = 0, DPR = 1, CW = 0, CH = 0;
var img = null, buf = null, N = 0, NH = 0, raf = 0;
var cache = {}, t0 = performance.now();
var ptr = { x: -9999, y: -9999, on: false };
var slow = g.matchMedia('(prefers-reduced-motion: reduce)').matches;

var px, py, vx, vy, tx, ty, cr, cg, cb, Tr, Tg, Tb, lag, ph, sp, sz, al, Ta, jit, seed, hx, hy, hz, hn;

var mode = 'none', single = null;
var strip = { names: [], el: null, box: null, off: 0, target: 0, drag: false, idx: 0, cb: null, frame: null, vel: 0, last: 0 };

/* ---------------- 写真の読み込みと、崩れる側の点 ---------------- */
function scan(im) {
  var S = 320, aw, ah;
  if (im.naturalWidth >= im.naturalHeight) { aw = S; ah = Math.round(S * im.naturalHeight / im.naturalWidth); }
  else { ah = S; aw = Math.round(S * im.naturalWidth / im.naturalHeight); }
  var c = document.createElement('canvas'); c.width = aw; c.height = ah;
  var x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(im, 0, 0, aw, ah);
  var d = x.getImageData(0, 0, aw, ah).data;
  var xs = [], ys = [], rs = [], gs = [], bs = [], pal = [];
  for (var y = 0; y < ah; y += 2) for (var q = 0; q < aw; q += 2) {
    var i = (y * aw + q) * 4;
    if (d[i + 3] < 24) continue;
    var r = d[i], gg = d[i + 1], b = d[i + 2];
    if (r > 248 && gg > 246 && b > 243) continue;
    xs.push(q); ys.push(y); rs.push(r); gs.push(gg); bs.push(b);
  }
  var n = xs.length;
  for (var k = 0; k < 40; k++) { var j = (k * 3571) % n; pal.push([rs[j], gs[j], bs[j]]); }
  // 白抜き画像：写真描画用。白を透明にしておく
  var full = x.getImageData(0, 0, aw, ah), fd = full.data;
  for (var p = 0; p < fd.length; p += 4) {
    if (fd[p] > 248 && fd[p + 1] > 246 && fd[p + 2] > 243) fd[p + 3] = 0;
  }
  var cut = document.createElement('canvas'); cut.width = aw; cut.height = ah;
  cut.getContext('2d').putImageData(full, 0, 0);
  return { im: cut, w: aw, h: ah, n: n, x: Float32Array.from(xs), y: Float32Array.from(ys),
           r: Uint8Array.from(rs), g: Uint8Array.from(gs), b: Uint8Array.from(bs), pal: pal };
}
var SRC = {};
for (var bi = 1; bi <= 6; bi++) SRC['berry' + bi] = 'img/berry' + bi + '.png';
function shape(name, cb) {
  if (cache[name]) return cb(cache[name]);
  var im = new Image();
  im.onload = function () { cache[name] = scan(im); cb(cache[name]); };
  im.onerror = function () { cb(null); };
  im.src = SRC[name] || name;
}
function preload(names, done) {
  var left = names.length; if (!left) return done && done();
  names.forEach(function (n) { shape(n, function () { if (--left === 0 && done) done(); }); });
}

/* ---------------- 初期化 ---------------- */
function count() { var a = g.innerWidth * g.innerHeight; return a < 380000 ? 9000 : a < 900000 ? 12000 : 15000; }
function alloc(n) {
  px = new Float32Array(n); py = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n);
  tx = new Float32Array(n); ty = new Float32Array(n);
  cr = new Float32Array(n); cg = new Float32Array(n); cb = new Float32Array(n);
  Tr = new Uint8Array(n); Tg = new Uint8Array(n); Tb = new Uint8Array(n);
  lag = new Float32Array(n); ph = new Float32Array(n); sp = new Float32Array(n); sz = new Uint8Array(n);
  al = new Float32Array(n); Ta = new Float32Array(n); jit = new Float32Array(n); seed = new Uint32Array(n);
  hx = new Float32Array(n); hy = new Float32Array(n); hz = new Float32Array(n); hn = new Float32Array(n);
  for (var i = 0; i < n; i++) {
    px[i] = W / 2 + (Math.random() - .5) * W * 1.4; py[i] = H / 2 + (Math.random() - .5) * H * 1.4;
    cr[i] = cg[i] = cb[i] = 236; lag[i] = Math.random(); ph[i] = Math.random() * 6.283; sp[i] = .45 + Math.random() * .95;
    sz[i] = Math.random() < .3 ? 2 : 1; seed[i] = (Math.random() * 4294967295) >>> 0;
    hx[i] = Math.random(); hy[i] = Math.random(); hz[i] = Math.random(); hn[i] = Math.random() * 4000;
  }
}
function resize() {
  DPR = Math.min(2, g.devicePixelRatio || 1);
  W = fc.clientWidth; H = fc.clientHeight; CW = Math.round(W * DPR); CH = Math.round(H * DPR);
  fc.width = CW; fc.height = CH; pc.width = CW; pc.height = CH;
  px2.setTransform(DPR, 0, 0, DPR, 0, 0);
  img = fx.createImageData(CW, CH); buf = new Uint32Array(img.data.buffer);
}
function init(photoCanvas, fieldCanvas) {
  pc = photoCanvas; px2 = pc.getContext('2d'); fc = fieldCanvas; fx = fc.getContext('2d');
  resize(); N = count(); NH = Math.round(N * .34); alloc(N);
  g.addEventListener('resize', function () { resize(); if (mode === 'single' && single) apply(single.name, single.el, single.opt); if (mode === 'strip') strip.box = rect(strip.el); });
  g.addEventListener('pointermove', function (e) { var b = fc.getBoundingClientRect(); ptr.x = e.clientX - b.left; ptr.y = e.clientY - b.top; ptr.on = true; });
  g.addEventListener('pointerleave', function () { ptr.on = false; });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) loop(performance.now()); });
  loop(performance.now());
}
function rect(el) {
  var cbx = fc.getBoundingClientRect(), r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
  if (r && (r.width > 2 || r.height > 2)) return { left: r.left - cbx.left, top: r.top - cbx.top, width: r.width, height: r.height };
  return { left: 0, top: 0, width: W, height: H };
}

/* ---------------- 写真を粒に崩しながら描く ---------------- */
/* dir: 崩れる向き。'right' なら右端ほど画素が抜ける。k: 崩れ強さ 0..1 */
function drawBerry(S, cx, cy, sc, alpha, dir, k) {
  var w = S.w * sc, h = S.h * sc;
  px2.globalAlpha = alpha;
  px2.drawImage(S.im, cx - w / 2, cy - h / 2, w, h);
  px2.globalAlpha = 1;
  if (k <= 0 || slow) return;
  // 崩れ：右側に白い抜けを打つ（＝粒に変わったように見える）。毎フレーム位置が変わる
  var x0 = Math.round(cx - w / 2), y0 = Math.round(cy - h / 2);
  var holes = Math.round(w * h * .22 * k);
  px2.fillStyle = '#fff';
  for (var i = 0; i < holes; i++) {
    var u = Math.random(), v = Math.random();
    if (dir === 'right') { u = 1 - Math.pow(1 - u, .45); if (u < .38) continue; }
    else if (dir === 'left') { u = Math.pow(u, .45); if (u > .62) continue; }
    else { var dd = Math.hypot(u - .5, v - .5) * 2; if (dd < .55) continue; }
    var s = Math.random() < .3 ? 2 : 1;
    px2.fillRect(x0 + u * w, y0 + v * h, s, s);
  }
}

/* ---------------- single ---------------- */
function apply(name, el, opt) {
  opt = opt || {}; mode = 'single';
  shape(name, function (S) {
    if (!S) return;
    var box = rect(el);
    var sc = Math.min(box.width / S.w, box.height / S.h) * (opt.pad == null ? .96 : opt.pad);
    var cx = box.left + box.width / 2, cy = box.top + box.height / 2, dir = opt.dir || 'right';
    single = { name: name, el: el, opt: opt, S: S, cx: cx, cy: cy, sc: sc, dir: dir };
    var spread = opt.spread == null ? Math.min(box.width, box.height) * .5 : opt.spread;
    var CN = N - NH, M = S.n;
    for (var i = 0; i < CN; i++) {
      var q = seed[i] % M, u = S.x[q] / S.w, v = S.y[q] / S.h, t;
      if (dir === 'right') t = Math.max(0, (u - .45) / .55); else if (dir === 'left') t = Math.max(0, (.55 - u) / .55);
      else t = Math.max(0, Math.hypot(u - .5, v - .5) * 2 - .5) * 2;
      t = Math.pow(t, 1.4);
      var fly = t * (.15 + lag[i] * .85);
      var ca = dir === 'left' ? -1 : dir === 'right' ? 1 : (u - .5) * 2, sa = dir === 'left' || dir === 'right' ? (ph[i] - 3.14) * .28 : (v - .5) * 2;
      tx[i] = cx + (S.x[q] - S.w / 2) * sc + ca * fly * spread;
      ty[i] = cy + (S.y[q] - S.h / 2) * sc + sa * fly * spread;
      Tr[i] = S.r[q]; Tg[i] = S.g[q]; Tb[i] = S.b[q];
      jit[i] = .3 + fly * 1.6;
      Ta[i] = t < .02 ? 0 : (.35 + (1 - fly) * .6);   // 崩れていない側は写真に任せて粒を出さない
    }
    halo(box, S.pal, opt.halo == null ? 1 : opt.halo);
  });
}
var hBox = null, hPal = null, hK = 1, hT = 0;
function halo(box, pal, k) {
  hBox = box; hPal = pal; hK = k;
  var cx = box.left + box.width / 2, cy = box.top + box.height / 2;
  var rw = Math.max(box.width, W * .98), rh = Math.max(box.height * 1.6, box.height + 160);
  for (var i = N - NH; i < N; i++) {
    var c = (seed[i] % 3 === 0) ? RED : (seed[i] % 7 === 0 ? ACC[seed[i] % 6] : pal[seed[i] % pal.length]);
    var a = hx[i] * 6.283, d = Math.pow(hy[i], .5);
    tx[i] = cx + Math.cos(a) * d * rw * .6; ty[i] = cy + Math.sin(a) * d * rh * .6;
    Tr[i] = c[0]; Tg[i] = c[1]; Tb[i] = c[2];
    jit[i] = .9 + hz[i] * 1.6;
    Ta[i] = k * (.18 + (1 - d) * .55) * (.4 + hz[i]);
  }
}

/* ---------------- strip（手持ちの横一列） ---------------- */
function makeStrip(names, el, opt) {
  opt = opt || {};
  preload(names, function () {
    mode = 'strip';
    strip.names = names; strip.el = el; strip.box = rect(el);
    strip.cb = opt.onIndex || null; strip.frame = opt.onFrame || null;
    strip.idx = opt.index || 0; strip.off = strip.target = strip.idx;
  });
}
function spin(dx) { if (mode !== 'strip') return; strip.drag = true; strip.off -= dx / 150; strip.vel = -dx / 150; }
function release() {
  if (mode !== 'strip') return; strip.drag = false;
  var land = strip.off + strip.vel * 6;                // 慣性で着地点を投影
  strip.target = Math.round(land); snapTo(strip.target);
}
function snapTo(t) {
  var n = strip.names.length, i = ((Math.round(t) % n) + n) % n;
  if (i !== strip.idx) { strip.idx = i; if (strip.cb) strip.cb(i); }
}
function ringTo(i) {
  if (mode !== 'strip') return;
  var n = strip.names.length, cur = ((Math.round(strip.off) % n) + n) % n, d = i - cur;
  if (d > n / 2) d -= n; if (d < -n / 2) d += n;
  strip.target = Math.round(strip.off) + d; snapTo(strip.target);
}
function stripFrame(now) {
  var n = strip.names.length, box = strip.box; if (!n || !box) return;
  var dt = Math.min(.05, (now - (strip.last || now)) / 1000); strip.last = now;
  if (!strip.drag) strip.off += (strip.target - strip.off) * (1 - Math.exp(-6 * dt));   // λ=6
  var cx = box.left + box.width / 2, base = box.top + box.height * .78;  // 底を揃える
  var slots = [], sum = 0;
  for (var k = -3; k <= 3; k++) {
    var rel = k - (strip.off - Math.round(strip.off));           // 中央からの距離（連続）
    var item = (((Math.round(strip.off) + k) % n) + n) % n;
    var S = cache[strip.names[item]]; if (!S) continue;
    var ad = Math.abs(rel);
    var scl = ad < 1 ? 1 - .60 * ad : ad < 2 ? .40 - .08 * (ad - 1) : .32 - .06 * (ad - 2);
    var spacing = box.width * .125;
    var x = cx + Math.sign(rel) * (Math.min(ad, 1) * box.width * .30 + Math.max(0, ad - 1) * spacing);
    var big = Math.min(box.width * .56 / S.w, box.height * .66 / S.h);
    var sc = big * scl, h = S.h * sc;
    var a = ad < 1 ? 1 : ad < 1.5 ? .95 : ad < 2.5 ? .85 : .5;
    slots.push({ S: S, x: x, y: base - h / 2, sc: sc, al: a, k: Math.max(0, 1 - ad), i: item, ad: ad });
  }
  // 写真：奥から手前へ
  px2.clearRect(0, 0, W, H);
  slots.slice().sort(function (a, b) { return b.ad - a.ad; }).forEach(function (s) {
    drawBerry(s.S, s.x, s.y, s.sc, s.al, 'right', s.k * .9);
  });
  // 粒：手前の一粒だけ右へ崩れる
  var front = slots[0]; for (var j = 1; j < slots.length; j++) if (slots[j].k > front.k) front = slots[j];
  var S2 = front.S, CN = N - NH, M = S2.n, spread = box.width * .34;
  for (var i = 0; i < CN; i++) {
    var q = seed[i] % M, u = S2.x[q] / S2.w;
    var t = Math.pow(Math.max(0, (u - .45) / .55), 1.4), fly = t * (.15 + lag[i] * .85);
    tx[i] = front.x + (S2.x[q] - S2.w / 2) * front.sc + fly * spread;
    ty[i] = front.y + (S2.y[q] - S2.h / 2) * front.sc + (ph[i] - 3.14) * .28 * fly * spread;
    Tr[i] = S2.r[q]; Tg[i] = S2.g[q]; Tb[i] = S2.b[q]; jit[i] = .3 + fly * 1.6;
    Ta[i] = t < .02 ? 0 : front.k * (.35 + (1 - fly) * .6);
  }
  if (now - hT > 320) { hT = now; halo({ left: front.x - box.height * .4, top: front.y - box.height * .4, width: box.height * .8, height: box.height * .8 }, S2.pal, .7); }
  if (strip.frame) strip.frame(slots.map(function (s) { return { x: s.x, k: s.k, i: s.i, ad: s.ad }; }));
}

function hide() { mode = 'none'; single = null; px2.clearRect(0, 0, W, H); for (var i = 0; i < N; i++) { Ta[i] = 0; al[i] = 0; } }

/* ---------------- 描画ループ ---------------- */
function loop(now) {
  raf = requestAnimationFrame(loop);
  if (!buf) return;
  var tt = now - t0;
  if (mode === 'strip') stripFrame(now);
  else if (mode === 'single' && single) {
    px2.clearRect(0, 0, W, H);
    drawBerry(single.S, single.cx, single.cy, single.sc, 1, single.dir, .9);
    if (hBox && now - hT > 320) { hT = now; halo(hBox, hPal, hK); }
  }
  buf.fill(0);
  var k = slow ? .2 : .066, damp = slow ? .55 : .845, rnd = Math.random, D = DPR;
  for (var i = 0; i < N; i++) {
    var kk = k * (.55 + lag[i] * .9);
    vx[i] = (vx[i] + (tx[i] - px[i]) * kk) * damp; vy[i] = (vy[i] + (ty[i] - py[i]) * kk) * damp;
    px[i] += vx[i]; py[i] += vy[i];
    if (ptr.on) { var dx = px[i] - ptr.x, dy = py[i] - ptr.y, d2 = dx * dx + dy * dy;
      if (d2 < 7000 && d2 > .5) { var f = (1 - d2 / 7000) * 3 / Math.sqrt(d2); px[i] += dx * f; py[i] += dy * f; } }
    cr[i] += (Tr[i] - cr[i]) * .09; cg[i] += (Tg[i] - cg[i]) * .09; cb[i] += (Tb[i] - cb[i]) * .09;
    al[i] += (Ta[i] - al[i]) * .075;
    if (al[i] < .015) continue;
    if (i >= N - NH) { hn[i] -= 16.7; if (hn[i] < 0) { hx[i] = rnd(); hy[i] = rnd(); hn[i] = 2200 + rnd() * 5200; } }
    var fl = slow ? 1 : (.6 + .4 * Math.sin(tt * .0136 * sp[i] + ph[i] * 3.1)), j = jit[i];
    var X = (px[i] + (slow ? 0 : (rnd() - .5) * j * 2.2)) * D, Y = (py[i] + (slow ? 0 : (rnd() - .5) * j * 2.2)) * D;
    var xi = X | 0, yi = Y | 0; if (xi < 0 || yi < 0 || xi >= CW - 1 || yi >= CH - 1) continue;
    var A = (al[i] * fl * 255) | 0; if (A > 255) A = 255;
    var col = (A << 24) | ((cb[i] | 0) << 16) | ((cg[i] | 0) << 8) | (cr[i] | 0), o = yi * CW + xi;
    buf[o] = col; if (sz[i] === 2) { buf[o + 1] = col; buf[o + CW] = col; buf[o + CW + 1] = col; }
  }
  fx.putImageData(img, 0, 0);
}

g.Field = { init: init, apply: apply, hide: hide, preload: preload, strip: makeStrip, spin: spin, release: release, ringTo: ringTo,
  index: function () { return strip.idx; } };
})(window);
