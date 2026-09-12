/* =========================================================================
   particles.js — 粒子エンジン
   画像の画素を走査して、輪郭が粒子へ崩れる絵をつくる。
   いちご＝img/berry*.png（実写）／馬・3頭・日本列島＝img/*.png（黒シルエット）
   ========================================================================= */
(function (global) {
  'use strict';

  const RED  = [228, 0, 43];
  const DRED = [190, 20, 45];
  const INK  = [26, 26, 26];
  const GREY = [150, 150, 150];

  /* 画素を走査して、白でない点を集める */
  function scanImage(src, W, H, tint) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(src, 0, 0, W, H);
    const d = x.getImageData(0, 0, W, H).data;
    const pts = [];
    const step = Math.max(1, Math.round(Math.sqrt(W * H) / 170));
    for (let y = 0; y < H; y += step) {
      for (let px = 0; px < W; px += step) {
        const i = (y * W + px) * 4;
        if (d[i + 3] < 24) continue;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        if (r > 244 && g > 240 && b > 236) continue;   // 白背景は捨てる
        pts.push({ x: px, y: y, c: tint || [r, g, b] });
      }
    }
    return pts;
  }

  /* 粒子の絵をひとつ作る
     o.dir 崩れる向き 'left'|'right'|'up'|'radial' / o.spread 飛距離 / o.anim 動かすか */
  function make(canvas, pts, W, H, o) {
    o = o || {};
    const dir = o.dir || 'left';
    const spread = o.spread == null ? W * 0.5 : o.spread;
    const dpr = Math.min(2, global.devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    const g = canvas.getContext('2d');
    g.scale(dpr, dpr);

    const P = pts.map(function (p) {
      var t;
      if (dir === 'left') t = 1 - p.x / W;
      else if (dir === 'right') t = p.x / W;
      else if (dir === 'up') t = 1 - p.y / H;
      else t = Math.hypot(p.x - W / 2, p.y - H / 2) / (Math.min(W, H) / 2);
      t = Math.max(0, Math.min(1, t));
      var fly = Math.pow(t, 1.7) * Math.random();
      var ang = dir === 'left' ? Math.PI : dir === 'right' ? 0 : dir === 'up' ? -Math.PI / 2
        : Math.atan2(p.y - H / 2, p.x - W / 2);
      var dist = fly * spread * (0.35 + Math.random() * 0.9);
      return {
        x: p.x + Math.cos(ang) * dist + (Math.random() - 0.5) * fly * 26,
        y: p.y + Math.sin(ang) * dist + (Math.random() - 0.5) * fly * 34,
        r: fly > 0.04 ? 0.5 + Math.random() * 1.25 : 0.62 + Math.random() * 0.9,
        a: fly > 0.04 ? (0.16 + (1 - fly) * 0.72) : 0.95,
        c: p.c,
        ph: Math.random() * Math.PI * 2,
        sp: 0.3 + Math.random() * 0.9,
        fly: fly
      };
    });

    function draw(time) {
      g.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], dx = 0, dy = 0;
        if (o.anim) {
          dx = Math.sin(time * 0.0009 * p.sp + p.ph) * p.fly * 5.5;
          dy = Math.cos(time * 0.0007 * p.sp + p.ph) * p.fly * 4.5;
        }
        g.globalAlpha = p.a;
        g.fillStyle = 'rgb(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ')';
        g.beginPath();
        g.arc(p.x + dx, p.y + dy, p.r, 0, 6.2832);
        g.fill();
      }
      g.globalAlpha = 1;
    }
    draw(0);
    if (o.anim) {
      var raf;
      var loop = function (t) { draw(t); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
      canvas._stop = function () { cancelAnimationFrame(raf); };
    }
    return canvas;
  }

  /* 画像から。H を省くと元画像の縦横比で決める */
  function fromImage(canvas, url, W, H, o) {
    var im = new Image();
    im.onload = function () {
      var h = H || Math.round(W * im.naturalHeight / im.naturalWidth);
      make(canvas, scanImage(im, W, h, o && o.tint), W, h, o);
    };
    im.src = url;
    return canvas;
  }

  function horse(canvas, W, o) {
    return fromImage(canvas, 'img/horse.png', W, null,
      Object.assign({ dir: 'left', spread: W * 0.40, tint: DRED }, o));
  }
  function horses(canvas, W, o) {
    return fromImage(canvas, 'img/horses.png', W, null,
      Object.assign({ dir: 'left', spread: W * 0.30, tint: DRED }, o));
  }
  function japan(canvas, W, o) {
    return fromImage(canvas, 'img/japan.png', W, null,
      Object.assign({ dir: 'radial', spread: W * 0.10, tint: RED }, o));
  }

  /* DNA 二重らせん（これだけは式から作る） */
  function dna(canvas, W, H, o) {
    var pts = [], turns = 3.1, n = 460;
    for (var i = 0; i < n; i++) {
      var t = i / n, y = t * H, ph = t * Math.PI * 2 * turns, amp = W * 0.24;
      pts.push({ x: W / 2 + Math.sin(ph) * amp, y: y, c: RED });
      pts.push({ x: W / 2 + Math.sin(ph + Math.PI) * amp, y: y, c: GREY });
      if (i % 11 === 0) {
        var x1 = W / 2 + Math.sin(ph) * amp, x2 = W / 2 + Math.sin(ph + Math.PI) * amp;
        for (var k = 0; k <= 7; k++) pts.push({ x: x1 + (x2 - x1) * k / 7, y: y, c: GREY });
      }
    }
    return make(canvas, pts, W, H, Object.assign({ dir: 'radial', spread: W * 0.18 }, o));
  }

  global.PT = { fromImage, horse, horses, japan, dna, make, RED, DRED, INK, GREY };
})(window);
