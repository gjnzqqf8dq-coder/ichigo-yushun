/* =========================================================================
   screens.js — 24画面の中身
   375×812。本文域は 812 − 44(status) − 66(tabbar) = 702px。
   ========================================================================= */
const V = [
  { n: 'RED CROWN', j: 'レッドクラウン', ln: 'CULTA i-25-03', img: 'img/berry3.png', brix: '14.2', w: '28.1', f: '92', sp: 'Conical',  c: '#E4002B', price: '3,980' },
  { n: 'SNOW VEIL', j: 'スノーヴェイル', ln: 'CULTA i-25-08', img: 'img/berry1.png', brix: '13.6', w: '24.6', f: '86', sp: 'Reniform', c: '#D8B7B0', price: '3,680' },
  { n: 'HINATA',    j: 'ヒナタ',        ln: 'CULTA i-25-11', img: 'img/berry4.png', brix: '14.6', w: '21.4', f: '78', sp: 'Wedged',   c: '#F0552B', price: '3,480' },
  { n: 'EMERALD',   j: 'エメラルド',    ln: 'CULTA i-25-14', img: 'img/berry6.png', brix: '13.6', w: '22.2', f: '81', sp: 'Ovoid',    c: '#118A4B', price: '3,280' },
  { n: 'MIDNIGHT',  j: 'ミッドナイト',  ln: 'CULTA i-25-19', img: 'img/berry2.png', brix: '13.4', w: '26.4', f: '95', sp: 'Cordate',  c: '#3A1014', price: '3,180' },
  { n: 'GOLDEN',    j: 'ゴールデン',    ln: 'CULTA i-25-22', img: 'img/berry5.png', brix: '13.9', w: '25.1', f: '74', sp: 'Cordate',  c: '#E8B800', price: '3,080' }
];
const bar = () => `<div class="sb"><span>9:41</span><i class="sig"></i></div>`;
const nav = a => `<div class="tabbar">` +
  ['HOME', 'RACE', 'STABLE', 'SHOP', 'MY'].map(t =>
    `<div class="${t === a ? 'on' : ''}"><i></i><span>${t}</span></div>`).join('') + `</div>`;
const cross = (x, y) => `<i class="xh" style="left:${x}px;top:${y}px"></i>`;
const hr = t => `<div class="secline en xs">${t}</div>`;

const SCREENS = [
/* ================= 01 SPLASH / BRAND ================= */
{ g: '01', gt: 'SPLASH / BRAND', gj: '世界を、甘くする。', id: 'Splash', h: `
  ${bar()}
  <div class="fill">
    <div class="crownmark"><svg viewBox="0 0 40 22"><path d="M2 20 L8 7 L14 14 L20 2 L26 14 L32 7 L38 20 Z"/></svg></div>
    <canvas data-p="berry" data-src="img/berry3.png" data-w="250" data-h="250" data-dir="radial" data-spread="70" data-anim="1"></canvas>
    <div class="en xl" style="margin-top:30px;line-height:1.12">ICHIGO<br>YUSHUN</div>
    <div class="en xs" style="margin-top:20px;line-height:1.9">STRAWBERRIES RACE<br>A BRIGHTER TOMORROW.</div>
    <div class="en xs" style="margin-top:26px;letter-spacing:.5em">2027</div>
  </div>${cross(30, 120)}${cross(330, 690)}` },

{ g: '01', gt: '', gj: '', id: 'Manifesto', h: `
  ${bar()}
  <div class="pad" style="padding-top:92px">
    <div class="jp-h">いちごに、<br>新しい勝ち方を。</div>
    <p class="jp-b" style="margin-top:30px">まだ名前のない系統だけが走る。<br>勝った一粒が、翌年の親になる。<br>育てた人と、選んだ人が、<br>同じ結果を待つ一日をつくる。</p>
    <div class="rulebox">
      <div><span class="en xs">RACE DAY</span><b class="en">2027.05.22</b></div>
      <div><span class="en xs">ENTRIES</span><b class="en">6 LINES</b></div>
    </div>
  </div>
  <canvas data-p="berry" data-src="img/berry1.png" data-w="150" data-h="150" data-dir="left" data-spread="80"
    style="position:absolute;right:-18px;top:512px;opacity:.45"></canvas>
  <div class="en xs" style="position:absolute;left:28px;bottom:52px;letter-spacing:.36em">SKIP</div>
  ${cross(30, 690)}${cross(300, 150)}` },

{ g: '01', gt: '', gj: '', id: 'World View', h: `
  ${bar()}
  <div class="fill">
    <canvas data-p="horse" data-w="300" data-anim="1"></canvas>
    <div class="en lg" style="margin-top:38px;line-height:1.4;text-align:center">A SWEETER<br>TOMORROW.</div>
    <p class="jp-b" style="margin-top:24px;text-align:center">東京優駿と同じ日に、<br>いちごの日本一を決める。</p>
  </div>
  <div class="footrow en xs"><span>ICHIGO YUSHUN</span><span>2027.05.22　TOKYO</span></div>` },

{ g: '01', gt: '', gj: '', id: 'Global Menu', h: `
  ${bar()}
  <div class="pad" style="padding-top:26px">
    <div class="en sm" style="letter-spacing:.34em">ICHIGO YUSHUN</div>
    <div class="menu">
      ${['RACE', 'BREEDING', 'STABLE', 'COMMUNITY', 'SHOP'].map(m =>
    `<div><i class="mi"></i><span class="en">${m}</span></div>`).join('')}
      <div class="plus">+</div>
    </div>
  </div>
  <canvas data-p="horses" data-w="330" style="position:absolute;left:22px;top:498px;opacity:.2"></canvas>
  <div class="footrow en xs" style="flex-direction:column;align-items:flex-start;gap:6px">
    <span>STRAWBERRIES RACE</span><span>A BRIGHTER TOMORROW.</span></div>` },

/* ================= 02 HOME / DASHBOARD ================= */
{ g: '02', gt: 'HOME / DASHBOARD', gj: '今、いちごの未来が動いている。', id: 'Home', h: `
  ${bar()}
  <div class="apbar"><span class="en sm">ICHIGO YUSHUN</span><i class="burger"></i></div>
  <div class="pad">
    <div class="en xs" style="margin-top:12px">TODAY</div>
    <div class="jp-h2" style="margin-top:10px">いちごの可能性は、<br>まだ終わらない。</div>
    <div class="orbit">
      <canvas data-p="berry" data-src="img/berry3.png" data-w="205" data-h="205" data-dir="radial" data-spread="40" data-anim="1"></canvas>
      <i class="ring r1"></i><i class="ring r2"></i><i class="ring r3"></i>
    </div>
    <div class="three" style="margin-top:14px">
      <div><div class="en xs">NEXT RACE</div><div class="big">05.22</div></div>
      <div><div class="en xs">ENTRIES</div><div class="big">6<i>lines</i></div></div>
      <div><div class="en xs">OWNERS</div><div class="big rd">7.8<i>k</i></div></div>
    </div>
    ${hr('MY LINE')}
    <div class="rank"><b class="en">—</b><img src="img/berry3.png"><span class="en sm">RED CROWN</span><em class="en">応援中</em></div>
  </div>${nav('HOME')}` },

{ g: '02', gt: '', gj: '', id: 'Live Dashboard', dark: 1, h: `
  ${bar()}
  <div class="apbar"><span class="live"><i></i>LIVE</span><span class="en sm">TOKYO / 1600m</span><i class="plus2">+</i></div>
  <canvas data-p="horses" data-w="339" data-dark="1" style="margin:8px auto 0"></canvas>
  <div class="pad">
    <svg class="chart" viewBox="0 0 320 74" preserveAspectRatio="none">
      <polyline points="0,58 26,50 52,56 78,38 104,44 130,26 156,34 182,18 208,28 234,12 260,22 286,8 320,16"/>
    </svg>
    <div class="three" style="margin-top:12px">
      <div><div class="en xs">SPEED</div><div class="big">56.3<i>km/h</i></div></div>
      <div><div class="en xs">SPLIT</div><div class="big">14.8<i>sec</i></div></div>
      <div><div class="en xs">FIRMNESS</div><div class="big rd">92<i>%</i></div></div>
    </div>
    ${hr('RUNNING ORDER')}
    ${V.slice(0, 4).map((v, i) =>
    `<div class="rank"><b class="en">${i + 1}</b><i class="wk" style="background:${v.c}"></i>
      <span class="en sm">${v.n}</span><em class="en">${(56.3 - i * 0.62).toFixed(1)}</em></div>`).join('')}
  </div>${nav('HOME')}` },

{ g: '02', gt: '', gj: '', id: 'Next Race', h: `
  ${bar()}
  <div class="apbar"><i class="burger"></i></div>
  <div class="pad" style="text-align:center">
    <div class="en" style="margin-top:14px;font-size:21px;letter-spacing:.18em">2027.05.22</div>
    <div class="en sm" style="margin-top:12px;letter-spacing:.3em">ICHIGO DERBY</div>
    <div class="en xs" style="margin-top:7px">TOKYO / 1600m</div>
    <div class="cd">
      ${[['3', 'DAYS'], ['12', 'HOURS'], ['03', 'MINUTES'], ['24', 'SECONDS']].map(c =>
    `<div><b>${c[0]}</b><span class="en xs">${c[1]}</span></div>`).join('')}
    </div>
    <svg class="course" viewBox="0 0 240 118">
      <ellipse cx="120" cy="59" rx="108" ry="46"/><ellipse cx="120" cy="59" rx="84" ry="30"/>
      <circle class="dot" cx="215" cy="52" r="4.5"/><circle class="dot2" cx="28" cy="66" r="3"/>
    </svg>
    <div class="btn-o en xs" style="margin-top:14px">VIEW COURSE</div>
    <div style="text-align:left">
      ${hr('ENTRIES')}
      ${V.slice(0, 3).map((v, i) =>
    `<div class="rank"><b class="en">${i + 1}</b><i class="wk" style="background:${v.c}"></i>
      <span class="en sm">${v.ln}</span><em class="en">${v.brix}</em></div>`).join('')}
    </div>
  </div>${nav('RACE')}` },

{ g: '02', gt: '', gj: '', id: 'Japan / Farms', h: `
  ${bar()}
  <div class="apbar"><i class="back"></i><i class="plus2">+</i></div>
  <div class="pad">
    <div class="en xs" style="margin-top:8px">JAPAN</div>
    <div class="jp-h2" style="margin-top:8px">いちごが、<br>日本を走っていく。</div>
    <canvas data-p="japan" data-w="150" style="margin:18px auto 2px"></canvas>
    <div class="farms">
      ${[['HOKKAIDO', 12], ['TOHOKU', 20], ['KANTO', 46], ['CHUBU', 37], ['KINKI', 27], ['KYUSHU', 31]].map(f =>
    `<div><i class="d"></i><span class="en xs">${f[0]}</span><b class="en xs">${f[1]} Farms</b><i class="ar"></i></div>`).join('')}
    </div>
  </div>${nav('RACE')}` },

/* ================= 03 RACE / DETAIL ================= */
{ g: '03', gt: 'RACE / DETAIL', gj: '一粒一粒が、物語を持っている。', id: 'Race Entrance', dark: 1, h: `
  ${bar()}
  <div class="apbar"><i class="back w"></i><span class="en sm">RACE</span><i class="plus2">+</i></div>
  <div class="pad" style="text-align:center">
    <div class="en" style="margin-top:10px;font-size:19px;letter-spacing:.24em">ICHIGO DERBY</div>
    <div class="en xs" style="margin-top:7px">TOKYO / 1600m</div>
  </div>
  <div class="stadium">
    <svg class="persp" viewBox="0 0 375 300" preserveAspectRatio="none">
      ${[0, 1, 2, 3, 4, 5, 6].map(i => `<line x1="${-120 + i * 100}" y1="300" x2="${150 + i * 12.5}" y2="70"/>`).join('')}
      ${[0, 1, 2, 3].map(i => `<line x1="0" y1="${300 - i * i * 22 - 60}" x2="375" y2="${300 - i * i * 22 - 60}"/>`).join('')}
    </svg>
    <canvas data-p="berry" data-src="img/berry3.png" data-w="150" data-h="150" data-dir="radial" data-spread="48" data-anim="1"
      style="position:absolute;left:50%;top:26px;transform:translateX(-50%)"></canvas>
  </div>
  <div class="en" style="position:absolute;bottom:92px;left:0;right:0;text-align:center;letter-spacing:.4em;font-size:13px">ENTER</div>
  <div class="footrow en xs"><span>6 LINES</span><span>NO NAME YET</span></div>` },

{ g: '03', gt: '', gj: '', id: 'Race Schedule', h: `
  ${bar()}
  <div class="apbar"><i class="back"></i><i class="plus2">+</i></div>
  <div class="tabs"><b>ALL</b><span>LIVE</span><span>UPCOMING</span></div>
  <div class="pad">
    ${[['05.22', 'ICHIGO DERBY', '12:00', 'TOKYO / 1600m', 1], ['06.12', 'EARLY SUMMER CUP', '13:10', 'KYOTO / 1600m'],
      ['07.03', 'SWEET STAKES', '13:20', 'SAPPORO / 1800m'], ['08.15', 'HARVEST MILE', '15:30', 'NIIGATA / 1600m'],
      ['09.20', 'AUTUMN CUP', '13:30', 'NAKAYAMA / 2000m'], ['11.07', 'BREEDERS TRIAL', '14:00', 'FUKUOKA / 1400m'],
      ['12.19', 'WINTER SELECTION', '13:00', 'HANSHIN / 1800m']].map(r =>
    `<div class="rr${r[4] ? ' hot' : ''}"><div class="dt en">${r[0]}<span class="en xs">${r[2]}</span></div>
      <div class="nm"><span class="en sm">${r[1]}</span><span class="en xs">${r[3]}</span></div>
      ${r[4] ? '<img src="img/berry3.png" class="thumb">' : '<i class="ar"></i>'}</div>`).join('')}
  </div>${nav('RACE')}` },

{ g: '03', gt: '', gj: '', id: 'Race Live Data', h: `
  ${bar()}
  <div class="apbar"><i class="back"></i><i class="burger"></i></div>
  <canvas data-p="horses" data-w="319" style="margin:2px auto 0"></canvas>
  <div class="pad">
    <div class="en sm" style="letter-spacing:.22em">ICHIGO DERBY</div>
    <div class="en xs" style="margin-top:4px">RACE 06 / TOKYO</div>
    ${hr('LIVE DATA')}
    ${V.map((v, i) =>
    `<div class="rank"><b class="en">${i + 1}</b><img src="${v.img}"><span class="en sm">${v.n}</span>
      <em class="en">${(56.3 - i * 0.62).toFixed(1)}</em></div>`).join('')}
  </div>${nav('RACE')}` },

{ g: '03', gt: '', gj: '', id: 'Strawberry Profile', h: `
  ${bar()}
  <div class="apbar"><i class="back"></i><i class="burger"></i></div>
  <div class="pad" style="text-align:center">
    <canvas data-p="berry" data-src="img/berry3.png" data-w="172" data-h="172" data-dir="right" data-spread="50" data-anim="1"
      style="margin:0 auto"></canvas>
    <div class="en" style="font-size:19px;letter-spacing:.2em;margin-top:2px">RED CROWN</div>
    <div class="jp-s" style="margin-top:5px">CULTA i-25-03　レッドクラウン</div>
    <div class="tabs c"><b>DATA</b><span>PEDIGREE</span><span>STORY</span></div>
    <div class="three" style="margin-top:16px;text-align:left">
      <div><div class="en xs">Brix</div><div class="big">14.2</div></div>
      <div><div class="en xs">Weight</div><div class="big">28.1<i>g</i></div></div>
      <div><div class="en xs">Firmness</div><div class="big">92<i>%</i></div></div>
    </div>
    <div style="text-align:left">
      ${hr('PEDIGREE')}
      <div class="rank"><span class="jp-s">父</span><em class="en">VELVET ONE</em></div>
      <div class="rank"><span class="jp-s">母</span><em class="en">RUBY GRACE</em></div>
      <div class="rank"><span class="jp-s">母の父</span><em class="en">CRIMSON ROOT</em></div>
    </div>
    <div class="btn-o en xs" style="margin-top:18px">応援する　<span class="hr">♥</span></div>
  </div>${nav('RACE')}` },

/* ================= 04 BREEDING / SCIENCE ================= */
{ g: '04', gt: 'BREEDING / SCIENCE', gj: 'テクノロジーで、いちごの未来を育てる。', id: 'Breeding', h: `
  ${bar()}
  <div class="apbar"><i class="back"></i><i class="plus2">+</i></div>
  <div class="pad" style="text-align:center">
    <div class="en sm" style="letter-spacing:.28em">BREEDING</div>
    <canvas data-p="dna" data-w="186" data-h="270" data-anim="1" style="margin:10px auto 0"></canvas>
    <div class="three" style="margin-top:12px;text-align:left">
      <div><div class="en xs">CROSSING</div><div class="big">2<i>years</i></div></div>
      <div><div class="en xs">SEEDLINGS</div><div class="big">12<i>k</i></div></div>
      <div><div class="en xs">SELECTED</div><div class="big rd">6<i>lines</i></div></div>
    </div>
    <div style="text-align:left">
      ${hr('THIS YEAR')}
      <div class="rank"><b class="en">01</b><span class="en sm">VELVET ONE × RUBY GRACE</span><em class="en">i-25-03</em></div>
      <div class="rank"><b class="en">02</b><span class="en sm">DEEP RED × SNOW LILY</span><em class="en">i-25-08</em></div>
    </div>
    <div class="btn-o en xs" style="margin-top:16px">育種プロセスを見る　›</div>
  </div>${nav('STABLE')}` },

{ g: '04', gt: '', gj: '', id: 'Process', h: `
  ${bar()}
  <div class="apbar"><i class="back"></i><span class="en sm">PROCESS</span><i class="plus2">+</i></div>
  <div class="pad">
    ${[['01', 'SELECTION', '選抜'], ['02', 'CROSS', '交配'], ['03', 'CULTURE', '培養'],
      ['04', 'ANALYSIS', '解析'], ['05', 'GROWTH', '育成'], ['06', 'RELEASE', '品種化']].map((p, i) =>
    `<div class="prow"><b class="en rd">${p[0]}</b><span class="pimg s${i}"></span>
      <span class="en sm">${p[1]}</span><span class="jp-s">${p[2]}</span></div>`).join('')}
    <p class="jp-b" style="margin-top:26px">交配から品種登録まで、本来は10年。<br>AIによる選抜で2年に縮める。</p>
  </div>${nav('STABLE')}` },

{ g: '04', gt: '', gj: '', id: 'LAB', h: `
  ${bar()}
  <div class="apbar"><i class="back"></i><span class="en sm">LAB</span><i class="burger"></i></div>
  <div class="pad" style="text-align:center">
    <div class="labwrap">
      <canvas data-p="berry" data-src="img/berry3.png" data-w="172" data-h="172" data-dir="radial" data-spread="30" data-anim="1"></canvas>
      <i class="ring r1"></i><i class="ring r3"></i>
      <i class="gl v"></i><i class="gl h"></i>
    </div>
    <div class="en" style="margin-top:14px;font-size:14px;letter-spacing:.24em">AI × PLANT SCIENCE</div>
    <p class="jp-b" style="margin-top:12px;text-align:center">画像解析で果形と色を数値にする。<br>味と硬さは、人が測って教え込む。</p>
    <div style="text-align:left">
      ${hr('MEASURED')}
      ${[['糖度', 'Brix', '14.2'], ['果実硬度', 'Firmness', '92'], ['一果重', 'Weight', '28.1g'], ['果形', 'Shape', 'Conical']].map(m =>
    `<div class="rank"><span class="jp-s">${m[0]}</span><span class="en xs" style="margin-left:8px">${m[1]}</span><em class="en">${m[2]}</em></div>`).join('')}
    </div>
  </div>${nav('STABLE')}` },

{ g: '04', gt: '', gj: '', id: 'Varieties', h: `
  ${bar()}
  <div class="apbar"><i class="back"></i><span class="en sm">VARIETIES</span><i class="burger"></i></div>
  <div class="tabs"><b>ALL</b><span>SWEET</span><span>FIRM</span><span>NEW</span></div>
  <div class="pad">
    ${V.map(v => `<div class="vrow"><img src="${v.img}">
      <div class="nm"><span class="en sm">${v.n}</span><span class="en xs">${v.ln}</span></div>
      <em class="en">${v.brix}</em><i class="ar"></i></div>`).join('')}
    <p class="jp-b" style="margin-top:24px">名前はまだ仮。<br>勝った一系統だけが、商品名を持つ。</p>
  </div>${nav('STABLE')}` },

/* ================= 05 COMMUNITY / SNS ================= */
{ g: '05', gt: 'COMMUNITY / SNS', gj: '好きが、いちごの未来をつくる。', id: 'Community Feed', h: `
  ${bar()}
  <div class="apbar"><span class="en sm">COMMUNITY</span><i class="burger"></i></div>
  <div class="tabs"><b>ALL</b><span>FOLLOW</span><span>EVENT</span></div>
  <div class="pad">
    <div class="post"><div class="u"><i class="av"></i><span class="en xs">sota</span><span class="en xs tm">3h</span></div>
      <canvas class="ph" data-p="berry" data-src="img/berry3.png" data-w="319" data-h="176" data-dir="up" data-spread="38"></canvas>
      <p class="jp-s">i-25-03、糖度が伸びてきた。<br>今年はこれに賭ける。</p>
      <div class="meta en xs"><span class="hr">♡</span> 2.4K　　💬 128</div></div>
    <div class="post"><div class="u"><i class="av"></i><span class="en xs">emi</span><span class="en xs tm">1d</span></div>
      <canvas class="ph" data-p="berry" data-src="img/berry5.png" data-w="319" data-h="176" data-dir="up" data-spread="38"></canvas>
      <p class="jp-s">5月22日、府中に行く。</p>
      <div class="meta en xs"><span class="hr">♡</span> 990　　💬 52</div></div>
  </div>${nav('HOME')}` },

{ g: '05', gt: '', gj: '', id: 'Post Detail', h: `
  ${bar()}
  <div class="apbar"><i class="back"></i><span class="en xs">haruka</span><i class="plus2">+</i></div>
  <div class="pad" style="text-align:center">
    <canvas data-p="berry" data-src="img/berry3.png" data-w="186" data-h="186" data-dir="up" data-spread="52" data-anim="1" style="margin:0 auto"></canvas>
    <p class="jp-h3" style="margin-top:8px">甘さの、その先へ。</p>
    <div class="tagrow en xs">#ichigoyushun　#i2503<br>#いちごのダービー</div>
    <div class="meta en xs" style="justify-content:center;margin-top:12px"><span class="hr">♡</span> 4.2K　　💬 216　　⤴</div>
    <div class="cmts">
      ${[['sota', '硬度92は反則でしょ'], ['mai', 'この系統、どこで食べられるの？'], ['kaito', '当日は府中で見る'], ['yuna', '母の父がクリムゾンなの納得']].map(c =>
    `<div><i class="av s"></i><span class="en xs">${c[0]}</span><span class="jp-s">${c[1]}</span></div>`).join('')}
    </div>
    <div class="cinput jp-s">コメントを追加…</div>
  </div>` },

{ g: '05', gt: '', gj: '', id: 'Event', h: `
  ${bar()}
  <div class="apbar"><i class="back"></i><span class="en sm">EVENT</span><i class="plus2">+</i></div>
  <div class="tabs"><b>ALL</b><span>RACE</span><span>POPUP</span><span>WORKSHOP</span></div>
  <div class="pad">
    ${[['ICHIGO DERBY 2027', '05.22 / TOKYO', 1], ['OWNERS MEETING', '2027.02.14 / ONLINE'],
      ['TASTING EVENT', '2027.04.10 / OSAKA'], ['CULTA LAB TOUR', '2027.06.05 / FUKUOKA'],
      ['CROSSING WORKSHOP', '2027.07.18 / TOKYO'], ['HARVEST DAY', '2027.09.03 / SAITAMA']].map(e =>
    `<div class="ev${e[2] ? ' hot' : ''}"><div class="en sm">${e[0]}</div><div class="en xs">${e[1]}</div></div>`).join('')}
  </div>${nav('STABLE')}` },

{ g: '05', gt: '', gj: '', id: 'Camera / Scan', dark: 1, h: `
  ${bar()}
  <div class="cam">
    <canvas data-p="berry" data-src="img/berry3.png" data-w="230" data-h="230" data-dir="radial" data-spread="34" data-anim="1"></canvas>
    <i class="fr tl"></i><i class="fr tr"></i><i class="fr bl"></i><i class="fr br"></i>
    <i class="scanmark"></i>
    <div class="jp-h3 w" style="position:absolute;left:0;right:0;bottom:140px;text-align:center">いちごの新しい勝ち方</div>
    <div class="en xs w" style="position:absolute;left:0;right:0;bottom:114px;text-align:center;letter-spacing:.3em">PHOTO・VIDEO</div>
    <div class="shutter"></div>
  </div>` },

/* ================= 06 SHOP / EXPERIENCE ================= */
{ g: '06', gt: 'SHOP / EXPERIENCE', gj: 'いちごを、もっと身近に。', id: 'Shop Top', h: `
  ${bar()}
  <div class="apbar"><span class="en sm">SHOP</span><i class="burger"></i></div>
  <div class="pad" style="text-align:center">
    <div class="cube">
      <canvas data-p="berry" data-src="img/berry3.png" data-w="130" data-h="130" data-dir="radial" data-spread="34" data-anim="1"></canvas>
      <i class="cf"></i>
    </div>
    <div class="en xs" style="margin-top:14px;letter-spacing:.26em">FROM FARM TO YOUR LIFE.</div>
    <div class="cats">
      ${['FRESH', 'SWEETS', 'GIFT', 'EXPERIENCE', 'OWNERS CLUB'].map((c, i) =>
    `<div><i class="d${i === 0 ? ' rd' : ''}"></i><span class="en sm">${c}</span><i class="ar"></i></div>`).join('')}
    </div>
  </div>${nav('SHOP')}` },

{ g: '06', gt: '', gj: '', id: 'Fresh List', h: `
  ${bar()}
  <div class="apbar"><i class="back"></i><span class="en sm">FRESH</span><i class="burger"></i></div>
  <div class="pad">
    ${V.map(v => `<div class="prow2"><img src="${v.img}">
      <div class="nm"><span class="en sm">${v.n}</span><span class="en xs">${v.ln}</span>
      <span class="en pr">¥${v.price}</span></div>
      <i class="ar"></i></div>`).join('')}
  </div>${nav('SHOP')}` },

{ g: '06', gt: '', gj: '', id: 'Product Detail', h: `
  ${bar()}
  <div class="apbar"><i class="back"></i><i class="burger"></i></div>
  <div class="pad" style="text-align:center">
    <canvas data-p="berry" data-src="img/berry3.png" data-w="186" data-h="186" data-dir="radial" data-spread="40" data-anim="1" style="margin:0 auto"></canvas>
    <div class="en" style="font-size:18px;letter-spacing:.2em;margin-top:0">RED CROWN</div>
    <p class="jp-h3" style="margin-top:10px">甘さは、世界を変える。</p>
    <p class="jp-b" style="margin-top:8px;text-align:center">糖度14.2、硬度92。<br>常温で三日、形が崩れない。</p>
    <div class="sizes">${['280g', '540g', '1,000g'].map((s, i) =>
    `<span class="${i === 0 ? 'on' : ''} en xs">${s}</span>`).join('')}</div>
    <div class="en" style="font-size:20px;margin-top:14px">¥3,980</div>
    <div class="buyrow"><i class="hr">♡</i><i class="cart"></i><div class="btn-k en xs">カートに追加</div></div>
    <div style="text-align:left">
      ${hr('SHIPPING')}
      <div class="rank"><span class="jp-s">発送</span><em class="en">05.24 →</em></div>
      <div class="rank"><span class="jp-s">産地</span><em class="en">FUKUOKA</em></div>
    </div>
  </div>${nav('SHOP')}` },

{ g: '06', gt: '', gj: '', id: 'Thank You', h: `
  ${bar()}
  <div class="fill" style="text-align:center">
    <div class="cube big">
      <canvas data-p="berry" data-src="img/berry3.png" data-w="120" data-h="120" data-dir="radial" data-spread="46" data-anim="1"></canvas>
      <i class="cf"></i>
    </div>
    <div class="en" style="margin-top:24px;font-size:17px;letter-spacing:.34em">THANK YOU</div>
    <p class="jp-h3" style="margin-top:14px">いちごのある、<br>よりよい未来へ。</p>
    <div class="btn-o en xs" style="margin-top:28px;padding:0 34px">注文を確認する　›</div>
  </div>${cross(36, 150)}${cross(320, 660)}` }
];
