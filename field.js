/* =========================================================================
   field.js — パーティクルフィールド
   画面全体にひとつだけ存在する粒子の層。画面が変わると、粒子は消えずに
   次のかたちへ流れていく。いちご・馬・DNA・日本列島は、すべて同じ粒子。
   ========================================================================= */
(function (g) {
  'use strict';

  var RED = [228, 0, 43], DRED = [196, 18, 46], INK = [20, 20, 20], GREY = [158, 158, 158];
  var cv, ctx, W = 0, H = 0, DPR = 1, P = [], N = 0, raf = 0;
  var cache = {}, last = null, t0 = performance.now();
  var ptr = { x: -9999, y: -9999, on: false };
  var slow = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function targetCount() {
    var a = window.innerWidth * window.innerHeight;
    if (a < 380000) return 3200;
    if (a < 900000) return 4600;
    return 5600;
  }

  /* ---------- かたちの供給元 ---------- */

  function scan(im, tint) {
    var S = 300, aw, ah;
    if (im.naturalWidth >= im.naturalHeight) { aw = S; ah = Math.round(S * im.naturalHeight / im.naturalWidth); }
    else { ah = S; aw = Math.round(S * im.naturalWidth / im.naturalHeight); }
    var c = document.createElement('canvas'); c.width = aw; c.height = ah;
    var x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(im, 0, 0, aw, ah);
    var d = x.getImageData(0, 0, aw, ah).data, pts = [];
    for (var y = 0; y < ah; y += 2) {
      for (var px = 0; px < aw; px += 2) {
        var i = (y * aw + px) * 4;
        if (d[i + 3] < 24) continue;
        var r = d[i], gg = d[i + 1], b = d[i + 2];
        if (r > 250 && gg > 248 && b > 245) continue;
        if (!tint) {   // 白に近い果肉は、白地で消えないところまで落とす
          var L = r * 0.299 + gg * 0.587 + b * 0.114;
          if (L > 186) { var f = 186 / L; r *= f; gg *= f; b *= f; }
        }
        pts.push([px, y, tint ? tint[0] : r | 0, tint ? tint[1] : gg | 0, tint ? tint[2] : b | 0]);
      }
    }
    return { pts: pts, w: aw, h: ah };
  }

  function dnaShape() {
    var w = 190, h = 300, pts = [], turns = 3.0, n = 520;
    for (var i = 0; i < n; i++) {
      var t = i / n, y = t * h, ph = t * Math.PI * 2 * turns, amp = w * 0.30;
      pts.push([w / 2 + Math.sin(ph) * amp, y, RED[0], RED[1], RED[2]]);
      pts.push([w / 2 + Math.sin(ph + Math.PI) * amp, y, GREY[0], GREY[1], GREY[2]]);
      if (i % 10 === 0) {
        var x1 = w / 2 + Math.sin(ph) * amp, x2 = w / 2 + Math.sin(ph + Math.PI) * amp;
        for (var k = 0; k <= 8; k++) pts.push([x1 + (x2 - x1) * k / 8, y, GREY[0], GREY[1], GREY[2]]);
      }
    }
    return { pts: pts, w: w, h: h };
  }

  function ringShape() {
    var s = 300, pts = [], c = s / 2;
    for (var k = 0; k < 3; k++) {
      var rad = c * (0.94 - k * 0.2), n = Math.round(rad * 5.4);
      for (var i = 0; i < n; i++) {
        var a = i / n * Math.PI * 2;
        pts.push([c + Math.cos(a) * rad, c + Math.sin(a) * rad,
          k === 0 ? RED[0] : GREY[0], k === 0 ? RED[1] : GREY[1], k === 0 ? RED[2] : GREY[2]]);
      }
    }
    return { pts: pts, w: s, h: s };
  }

  function dustShape() {
    var w = 300, h = 300, pts = [];
    for (var i = 0; i < 1400; i++) {
      pts.push([Math.random() * w, Math.random() * h, GREY[0], GREY[1], GREY[2]]);
    }
    return { pts: pts, w: w, h: h };
  }

  var SRC = {
    horse:  { url: 'img/horse.png',  tint: DRED },
    horses: { url: 'img/horses.png', tint: DRED },
    japan:  { url: 'img/japan.png',  tint: RED  },
    dna:    { gen: dnaShape },
    ring:   { gen: ringShape },
    dust:   { gen: dustShape }
  };
  for (var i = 1; i <= 6; i++) SRC['berry' + i] = { url: 'img/berry' + i + '.png' };

  function shape(name, cb) {
    if (cache[name]) return cb(cache[name]);
    var s = SRC[name];
    if (!s) return cb(cache.dust || (cache.dust = dustShape()));
    if (s.gen) { cache[name] = s.gen(); return cb(cache[name]); }
    var im = new Image();
    im.onload = function () { cache[name] = scan(im, s.tint); cb(cache[name]); };
    im.onerror = function () { cache[name] = dustShape(); cb(cache[name]); };
    im.src = s.url;
  }

  /* 使う画像を先に読んでおく */
  function preload(names) { names.forEach(function (n) { shape(n, function () {}); }); }

  /* ---------- 本体 ---------- */

  function resize() {
    DPR = Math.min(2, g.devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function init(canvas) {
    cv = canvas; ctx = cv.getContext('2d');
    resize();
    N = targetCount();
    P = [];
    for (var i = 0; i < N; i++) {
      P.push({
        x: W / 2 + (Math.random() - 0.5) * W, y: H / 2 + (Math.random() - 0.5) * H,
        vx: 0, vy: 0, tx: W / 2, ty: H / 2,
        r: 235, g: 235, b: 235, Tr: 235, Tg: 235, Tb: 235,
        lag: Math.random(), ph: Math.random() * 6.283, sp: 0.45 + Math.random() * 0.9,
        sz: 1.0 + Math.random() * 1.1, a: 0, Ta: 0, off: 0
      });
    }
    g.addEventListener('resize', function () { resize(); if (last) apply(last.name, last.el, last.opt); });
    g.addEventListener('pointermove', function (e) { var b = cv.getBoundingClientRect(); ptr.x = e.clientX - b.left; ptr.y = e.clientY - b.top; ptr.on = true; });
    g.addEventListener('pointerleave', function () { ptr.on = false; });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) loop(performance.now());
    });
    loop(performance.now());
  }

  /* el = ステージになる要素。そこに収まるように配置する */
  function apply(name, el, opt) {
    opt = opt || {};
    last = { name: name, el: el, opt: opt };
    shape(name, function (S) {
      var cb = cv.getBoundingClientRect(), r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
      var box = (r && (r.width > 2 || r.height > 2))
        ? { left: r.left - cb.left, top: r.top - cb.top, width: r.width, height: r.height }
        : { left: 0, top: 0, width: W, height: H };
      var pad = opt.pad == null ? 0.94 : opt.pad;
      var s = Math.min(box.width / S.w, box.height / S.h) * pad;
      var cx = box.left + box.width / 2, cy = box.top + box.height / 2;
      var M = S.pts.length, stride = 1, dir = opt.dir || 'radial';
      var spread = opt.spread == null ? Math.min(box.width, box.height) * 0.30 : opt.spread;
      for (var i = 0; i < N; i++) {
        var p = P[i], q = S.pts[(i * 7919) % M];
        var bx = cx + (q[0] - S.w / 2) * s, by = cy + (q[1] - S.h / 2) * s;
        // 崩れ具合: dir 側の端ほど大きく飛ぶ
        var u = (q[0] / S.w), v = (q[1] / S.h), t;
        if (dir === 'left') t = 1 - u; else if (dir === 'right') t = u;
        else if (dir === 'up') t = 1 - v; else if (dir === 'down') t = v;
        else t = Math.min(1, Math.hypot(u - 0.5, v - 0.5) * 2);
        var fly = Math.pow(Math.max(0, Math.min(1, t)), 2.3) * (0.22 + p.lag * 0.78);
        var ang = dir === 'left' ? Math.PI : dir === 'right' ? 0 : dir === 'up' ? -Math.PI / 2
          : dir === 'down' ? Math.PI / 2 : Math.atan2(v - 0.5, u - 0.5);
        p.tx = bx + Math.cos(ang) * fly * spread + (p.ph - 3.14) * fly * 5;
        p.ty = by + Math.sin(ang) * fly * spread + (p.sp - 0.9) * fly * 22;
        p.Tr = q[2]; p.Tg = q[3]; p.Tb = q[4];
        p.off = fly;
        p.Ta = (opt.alpha == null ? 1 : opt.alpha) * (fly > 0.05 ? 0.26 + (1 - fly) * 0.72 : 1);
      }
      stride = stride;
    });
  }

  function hide() { last = null; for (var i = 0; i < N; i++) P[i].Ta = 0; }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    var tt = (now - t0);
    ctx.clearRect(0, 0, W, H);
    var k = slow ? 0.16 : 0.062, damp = slow ? 0.55 : 0.845;
    for (var i = 0; i < N; i++) {
      var p = P[i];
      var kk = k * (0.55 + p.lag * 0.9);
      p.vx = (p.vx + (p.tx - p.x) * kk) * damp;
      p.vy = (p.vy + (p.ty - p.y) * kk) * damp;
      p.x += p.vx; p.y += p.vy;

      if (ptr.on) {
        var dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
        if (d2 < 9000 && d2 > 0.5) {
          var f = (1 - d2 / 9000) * 3.2 / Math.sqrt(d2);
          p.x += dx * f; p.y += dy * f;
        }
      }

      p.r += (p.Tr - p.r) * 0.09; p.g += (p.Tg - p.g) * 0.09; p.b += (p.Tb - p.b) * 0.09;
      p.a += (p.Ta - p.a) * 0.07;
      if (p.a < 0.012) continue;

      var wob = slow ? 0 : (0.9 + p.off * 5.2);
      var ox = Math.sin(tt * 0.00075 * p.sp + p.ph) * wob;
      var oy = Math.cos(tt * 0.00061 * p.sp + p.ph) * wob * 0.8;
      ctx.globalAlpha = p.a;
      ctx.fillStyle = 'rgb(' + (p.r | 0) + ',' + (p.g | 0) + ',' + (p.b | 0) + ')';
      ctx.fillRect(p.x + ox, p.y + oy, p.sz, p.sz);
    }
    ctx.globalAlpha = 1;
  }

  g.Field = { init: init, apply: apply, hide: hide, preload: preload, RED: RED, INK: INK };
})(window);
