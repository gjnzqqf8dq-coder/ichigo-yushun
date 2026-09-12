/* =========================================================================
   field.js — 粒子フィールド v2
   いちごは「実体＋まわりの粒」ではなく、実体そのものが数万の粒でできている。
   描画は ImageData への直接書き込み。文字列のfillStyleを毎フレーム作らないので
   3〜4万点でも落ちない。座標も色も TypedArray（SoA）で持つ。
   ========================================================================= */
(function (g) {
'use strict';

var RED = [228, 0, 43], DRED = [196, 18, 46], GREY = [150, 150, 150];
var ACC = [[186,186,186],[26,26,26],[228,0,43],[27,79,216],[232,184,0],[15,138,76]];

var cv, ctx, W = 0, H = 0, DPR = 1, CW = 0, CH = 0;
var img = null, buf = null, N = 0, NH = 0, raf = 0;
var cache = {}, t0 = performance.now();
var ptr = { x: -9999, y: -9999, on: false };
var slow = g.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- 粒（SoA） --- */
var px, py, vx, vy, tx, ty, cr, cg, cb, Tr, Tg, Tb, lag, ph, sp, sz, al, Ta, jit, seed, hx, hy, hz, hn;

var mode = 'none', single = null;
var ring = { shapes: [], el: null, box: null, rot: 0, target: 0, drag: false, idx: 0, cb: null, frame: null };

/* ---------------- かたち ---------------- */
function scan(im, tint) {
  var S = 340, aw, ah;
  if (im.naturalWidth >= im.naturalHeight) { aw = S; ah = Math.round(S * im.naturalHeight / im.naturalWidth); }
  else { ah = S; aw = Math.round(S * im.naturalWidth / im.naturalHeight); }
  var c = document.createElement('canvas'); c.width = aw; c.height = ah;
  var x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(im, 0, 0, aw, ah);
  var d = x.getImageData(0, 0, aw, ah).data;
  var xs = [], ys = [], rs = [], gs = [], bs = [], ts = [], cs = [], ss = [];
  for (var y = 0; y < ah; y++) {
    for (var q = 0; q < aw; q++) {
      var i = (y * aw + q) * 4;
      if (d[i + 3] < 24) continue;
      var r = d[i], gg = d[i + 1], b = d[i + 2];
      if (r > 249 && gg > 247 && b > 244) continue;
      var L = r * .299 + gg * .587 + b * .114;
      if (!tint && L > 188) { var f = 188 / L; r *= f; gg *= f; b *= f; }
      var u = q / aw, v = y / ah;
      var t = Math.min(1, Math.hypot(u - .5, v - .5) * 2);
      var a = Math.atan2(v - .5, u - .5);
      xs.push(q); ys.push(y);
      rs.push(tint ? tint[0] : r | 0); gs.push(tint ? tint[1] : gg | 0); bs.push(tint ? tint[2] : b | 0);
      ts.push(Math.pow(t, 2.6)); cs.push(Math.cos(a)); ss.push(Math.sin(a));
    }
  }
  var n = xs.length;
  var o = {
    n: n, w: aw, h: ah,
    x: Float32Array.from(xs), y: Float32Array.from(ys),
    r: Uint8Array.from(rs), g: Uint8Array.from(gs), b: Uint8Array.from(bs),
    t: Float32Array.from(ts), ca: Float32Array.from(cs), sa: Float32Array.from(ss),
    pal: []
  };
  for (var k = 0; k < 40; k++) { var j = (k * 3571) % n; o.pal.push([o.r[j], o.g[j], o.b[j]]); }
  return o;
}
function fromPts(w, h, arr) {   // arr: [x,y,r,g,b]
  var n = arr.length, o = {
    n: n, w: w, h: h,
    x: new Float32Array(n), y: new Float32Array(n),
    r: new Uint8Array(n), g: new Uint8Array(n), b: new Uint8Array(n),
    t: new Float32Array(n), ca: new Float32Array(n), sa: new Float32Array(n), pal: []
  };
  for (var i = 0; i < n; i++) {
    var p = arr[i], u = p[0] / w, v = p[1] / h;
    var t = Math.min(1, Math.hypot(u - .5, v - .5) * 2), a = Math.atan2(v - .5, u - .5);
    o.x[i] = p[0]; o.y[i] = p[1]; o.r[i] = p[2]; o.g[i] = p[3]; o.b[i] = p[4];
    o.t[i] = Math.pow(t, 2.6); o.ca[i] = Math.cos(a); o.sa[i] = Math.sin(a);
  }
  for (var k = 0; k < 12; k++) { var j = (k * 97) % n; o.pal.push([o.r[j], o.g[j], o.b[j]]); }
  return o;
}
function dnaShape() {
  var w = 200, h = 320, a = [], turns = 3.0, n = 900;
  for (var i = 0; i < n; i++) {
    var t = i / n, y = t * h, q = t * Math.PI * 2 * turns, amp = w * .30;
    a.push([w / 2 + Math.sin(q) * amp, y, RED[0], RED[1], RED[2]]);
    a.push([w / 2 + Math.sin(q + Math.PI) * amp, y, GREY[0], GREY[1], GREY[2]]);
    if (i % 16 === 0) {
      var x1 = w / 2 + Math.sin(q) * amp, x2 = w / 2 + Math.sin(q + Math.PI) * amp;
      for (var k = 0; k <= 10; k++) a.push([x1 + (x2 - x1) * k / 10, y, GREY[0], GREY[1], GREY[2]]);
    }
  }
  return fromPts(w, h, a);
}
function dustShape() {
  var w = 300, h = 300, a = [];
  for (var i = 0; i < 2400; i++) a.push([Math.random() * w, Math.random() * h, GREY[0], GREY[1], GREY[2]]);
  return fromPts(w, h, a);
}
var SRC = { dna: { fn: dnaShape }, dust: { fn: dustShape } };
for (var bi = 1; bi <= 6; bi++) SRC['berry' + bi] = { url: 'img/berry' + bi + '.png' };

function shape(name, cb) {
  if (cache[name]) return cb(cache[name]);
  var s = SRC[name];
  if (!s) { cache[name] = dustShape(); return cb(cache[name]); }
  if (s.fn) { cache[name] = s.fn(); return cb(cache[name]); }
  var im = new Image();
  im.onload = function () { cache[name] = scan(im, s.tint); cb(cache[name]); };
  im.onerror = function () { cache[name] = dustShape(); cb(cache[name]); };
  im.src = s.url;
}
function preload(names, done) {
  var left = names.length; if (!left) return done && done();
  names.forEach(function (n) { shape(n, function () { if (--left === 0 && done) done(); }); });
}

/* ---------------- 初期化 ---------------- */
function count() {
  var a = g.innerWidth * g.innerHeight;
  return a < 380000 ? 22000 : a < 900000 ? 30000 : 38000;
}
function alloc(n) {
  px = new Float32Array(n); py = new Float32Array(n);
  vx = new Float32Array(n); vy = new Float32Array(n);
  tx = new Float32Array(n); ty = new Float32Array(n);
  cr = new Float32Array(n); cg = new Float32Array(n); cb = new Float32Array(n);
  Tr = new Uint8Array(n); Tg = new Uint8Array(n); Tb = new Uint8Array(n);
  lag = new Float32Array(n); ph = new Float32Array(n); sp = new Float32Array(n);
  sz = new Uint8Array(n); al = new Float32Array(n); Ta = new Float32Array(n);
  jit = new Float32Array(n); seed = new Uint32Array(n);
  hx = new Float32Array(n); hy = new Float32Array(n); hz = new Float32Array(n); hn = new Float32Array(n);
  for (var i = 0; i < n; i++) {
    px[i] = W / 2 + (Math.random() - .5) * W * 1.6;
    py[i] = H / 2 + (Math.random() - .5) * H * 1.6;
    cr[i] = cg[i] = cb[i] = 236;
    lag[i] = Math.random(); ph[i] = Math.random() * 6.283; sp[i] = .45 + Math.random() * .95;
    sz[i] = Math.random() < .34 ? 2 : 1;
    seed[i] = (Math.random() * 4294967295) >>> 0;
    hx[i] = Math.random(); hy[i] = Math.random(); hz[i] = Math.random(); hn[i] = Math.random() * 4000;
  }
}
function resize() {
  DPR = Math.min(2, g.devicePixelRatio || 1);
  W = cv.clientWidth; H = cv.clientHeight;
  CW = Math.round(W * DPR); CH = Math.round(H * DPR);
  cv.width = CW; cv.height = CH;
  img = ctx.createImageData(CW, CH);
  buf = new Uint32Array(img.data.buffer);
}
function init(canvas) {
  cv = canvas; ctx = cv.getContext('2d');
  resize();
  N = count(); NH = Math.round(N * .16);
  alloc(N);
  g.addEventListener('resize', function () {
    resize();
    if (mode === 'single' && single) apply(single.name, single.el, single.opt);
    if (mode === 'ring') ring.box = rect(ring.el);
  });
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
  var cbx = cv.getBoundingClientRect(), r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
  if (r && (r.width > 2 || r.height > 2))
    return { left: r.left - cbx.left, top: r.top - cbx.top, width: r.width, height: r.height };
  return { left: 0, top: 0, width: W, height: H };
}

/* ---------------- single ---------------- */
function apply(name, el, opt) {
  opt = opt || {}; mode = 'single';
  shape(name, function (S) {
    single = { name: name, el: el, opt: opt, S: S };
    var box = rect(el);
    var s = Math.min(box.width / S.w, box.height / S.h) * (opt.pad == null ? .96 : opt.pad);
    var cx = box.left + box.width / 2, cy = box.top + box.height / 2;
    var dir = opt.dir || 'radial';
    var spread = opt.spread == null ? Math.min(box.width, box.height) * .16 : opt.spread;
    var CN = N - NH, M = S.n;
    for (var i = 0; i < CN; i++) {
      var q = seed[i] % M;
      var u = S.x[q] / S.w, v = S.y[q] / S.h, t;
      if (dir === 'left') t = Math.pow(1 - u, 2.6); else if (dir === 'right') t = Math.pow(u, 2.6);
      else if (dir === 'up') t = Math.pow(1 - v, 2.6); else if (dir === 'down') t = Math.pow(v, 2.6);
      else t = S.t[q];
      var fly = t * (.18 + lag[i] * .82);
      var ca = dir === 'left' ? -1 : dir === 'right' ? 1 : dir === 'up' ? 0 : dir === 'down' ? 0 : S.ca[q];
      var sa = dir === 'up' ? -1 : dir === 'down' ? 1 : (dir === 'left' || dir === 'right') ? (ph[i] - 3.14) * .18 : S.sa[q];
      tx[i] = cx + (S.x[q] - S.w / 2) * s + ca * fly * spread;
      ty[i] = cy + (S.y[q] - S.h / 2) * s + sa * fly * spread;
      Tr[i] = S.r[q]; Tg[i] = S.g[q]; Tb[i] = S.b[q];
      jit[i] = .28 + fly * 2.0;
      Ta[i] = fly > .03 ? .34 + (1 - fly) * .64 : 1;
    }
    halo(box, S.pal, opt.halo == null ? 1 : opt.halo);
  });
}
var hBox = null, hPal = null, hK = 1, hT = 0;
function halo(box, pal, k) {
  hBox = box; hPal = pal; hK = k;
  var cx = box.left + box.width / 2, cy = box.top + box.height / 2;
  var rw = Math.max(box.width, W * .9), rh = Math.max(box.height * 1.4, box.height + 120);
  for (var i = N - NH; i < N; i++) {
    var c = (seed[i] % 4 === 0) ? ACC[seed[i] % 6] : pal[seed[i] % pal.length];
    var a = hx[i] * 6.283, d = Math.pow(hy[i], .55);
    tx[i] = cx + Math.cos(a) * d * rw * .56;
    ty[i] = cy + Math.sin(a) * d * rh * .56;
    Tr[i] = c[0]; Tg[i] = c[1]; Tb[i] = c[2];
    jit[i] = 1.2 + hz[i] * 2.0;
    Ta[i] = k * (.14 + (1 - d) * .5) * (.45 + hz[i]);
  }
}

/* ---------------- ring ---------------- */
function makeRing(names, el, opt) {
  opt = opt || {};
  preload(names, function () {
    mode = 'ring';
    ring.shapes = names.map(function (n) { return cache[n]; });
    ring.el = el; ring.box = rect(el);
    ring.cb = opt.onIndex || null; ring.frame = opt.onFrame || null;
    ring.idx = opt.index || 0;
    ring.rot = ring.target = -ring.idx * (6.283 / names.length);
  });
}
function spin(dx) { if (mode !== 'ring') return; ring.drag = true; ring.rot += dx * .0072; }
function release() { if (mode !== 'ring') return; ring.drag = false; snap(); }
function snap() {
  var n = ring.shapes.length, st = 6.283 / n, k = Math.round(-ring.rot / st);
  ring.target = -k * st;
  var i = ((k % n) + n) % n;
  if (i !== ring.idx) { ring.idx = i; if (ring.cb) ring.cb(i); }
}
function ringTo(i) {
  if (mode !== 'ring') return;
  var n = ring.shapes.length, st = 6.283 / n, k = Math.round(-ring.rot / st);
  var d = i - (((k % n) + n) % n);
  if (d > n / 2) d -= n; if (d < -n / 2) d += n;
  ring.target = -(k + d) * st; ring.idx = i; if (ring.cb) ring.cb(i);
}
function ringTargets() {
  var n = ring.shapes.length, box = ring.box; if (!n || !box) return;
  if (!ring.drag) ring.rot += (ring.target - ring.rot) * .105;
  var cx = box.left + box.width / 2, cy = box.top + box.height / 2, R = box.width * .46;
  var slot = [], tot = 0;
  for (var s = 0; s < n; s++) {
    var a = ring.rot + s * 6.283 / n, z = Math.cos(a), k = (z + 1) / 2, S = ring.shapes[s];
    var base = Math.min(box.width * .66 / S.w, box.height * .82 / S.h);
    var sc = base * (.24 + .76 * k * k), av = .07 + .93 * Math.pow(k, 2.6);
    var w = sc * sc * Math.pow(av, 1.5);
    slot.push({ S: S, x: cx + Math.sin(a) * R, y: cy + (1 - k) * box.height * .05, sc: sc, al: av, k: k, w: w, i: s });
    tot += w;
  }
  var acc = 0;
  for (var s2 = 0; s2 < n; s2++) { slot[s2].lo = acc / tot; acc += slot[s2].w; slot[s2].hi = acc / tot; }
  var front = slot[0]; for (var s3 = 1; s3 < n; s3++) if (slot[s3].k > front.k) front = slot[s3];
  var CN = N - NH;
  for (var i = 0; i < CN; i++) {
    var u = (seed[i] % 100003) / 100003, sl = front;
    for (var s4 = 0; s4 < n; s4++) if (u >= slot[s4].lo && u < slot[s4].hi) { sl = slot[s4]; break; }
    var S2 = sl.S, q = seed[i] % S2.n;
    var fly = S2.t[q] * (.18 + lag[i] * .82), spr = box.height * .085 * (.3 + sl.k);
    tx[i] = sl.x + (S2.x[q] - S2.w / 2) * sl.sc + S2.ca[q] * fly * spr;
    ty[i] = sl.y + (S2.y[q] - S2.h / 2) * sl.sc + S2.sa[q] * fly * spr;
    Tr[i] = S2.r[q]; Tg[i] = S2.g[q]; Tb[i] = S2.b[q];
    jit[i] = (.24 + fly * 1.9) * (.55 + sl.k * .65);
    Ta[i] = sl.al * (fly > .03 ? .36 + (1 - fly) * .62 : 1);
  }
  halo({ left: front.x - box.height * .42, top: front.y - box.height * .42,
         width: box.height * .84, height: box.height * .84 }, front.S.pal, .55);
  if (ring.frame) ring.frame(slot);
}

function hide() { mode = 'none'; for (var i = 0; i < N; i++) Ta[i] = 0; }

/* ---------------- 描画 ---------------- */
function loop(now) {
  raf = requestAnimationFrame(loop);
  if (!buf) return;
  var tt = now - t0;
  if (mode === 'ring') ringTargets();
  else if (mode === 'single' && hBox && now - hT > 320) { hT = now; halo(hBox, hPal, hK); }

  buf.fill(0);
  var k = slow ? .2 : .066, damp = slow ? .55 : .845;
  var rnd = Math.random, D = DPR;
  for (var i = 0; i < N; i++) {
    var kk = k * (.55 + lag[i] * .9);
    vx[i] = (vx[i] + (tx[i] - px[i]) * kk) * damp;
    vy[i] = (vy[i] + (ty[i] - py[i]) * kk) * damp;
    px[i] += vx[i]; py[i] += vy[i];

    if (ptr.on) {
      var dx = px[i] - ptr.x, dy = py[i] - ptr.y, d2 = dx * dx + dy * dy;
      if (d2 < 7000 && d2 > .5) { var f = (1 - d2 / 7000) * 3.2 / Math.sqrt(d2); px[i] += dx * f; py[i] += dy * f; }
    }
    cr[i] += (Tr[i] - cr[i]) * .09; cg[i] += (Tg[i] - cg[i]) * .09; cb[i] += (Tb[i] - cb[i]) * .09;
    al[i] += (Ta[i] - al[i]) * .075;
    if (al[i] < .015) continue;

    if (i >= N - NH) {
      hn[i] -= 16.7;
      if (hn[i] < 0) { hx[i] = rnd(); hy[i] = rnd(); hn[i] = 2200 + rnd() * 5200; }
    }

    var fl = slow ? 1 : (.60 + .40 * Math.sin(tt * .0136 * sp[i] + ph[i] * 3.1));
    var j = jit[i];
    var X = (px[i] + (slow ? 0 : (rnd() - .5) * j * 2.2)) * D;
    var Y = (py[i] + (slow ? 0 : (rnd() - .5) * j * 2.2)) * D;
    var xi = X | 0, yi = Y | 0;
    if (xi < 0 || yi < 0 || xi >= CW - 1 || yi >= CH - 1) continue;

    var A = (al[i] * fl * 255) | 0; if (A > 255) A = 255;
    var col = (A << 24) | ((cb[i] | 0) << 16) | ((cg[i] | 0) << 8) | (cr[i] | 0);
    var o = yi * CW + xi;
    buf[o] = col;
    if (sz[i] === 2) { buf[o + 1] = col; buf[o + CW] = col; buf[o + CW + 1] = col; }
  }
  ctx.putImageData(img, 0, 0);
}

g.Field = {
  init: init, apply: apply, hide: hide, preload: preload,
  ring: makeRing, spin: spin, release: release, ringTo: ringTo,
  ringIndex: function () { return ring.idx; }, RED: RED
};
})(window);
