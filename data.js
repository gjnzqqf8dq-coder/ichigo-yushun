/* =========================================================================
   data.js — 第1回 苺優駿の出走系統
   出走するのは、まだ商品化されていない実験段階の系統だけ。
   枠番の色は中央競馬の帽色に合わせている（1白 2黒 3赤 4青 5黄 6緑）。
   商品名は、優勝した系統だけが後から与えられる。
   ========================================================================= */
const LINES = [
  {
    w: 1, wc: '#FFFFFF', wt: '#111', ln: 'i-26-07', img: 'img/berry1.png', shape: 'berry1',
    from: '福岡県久留米市', breeder: 'CULTA 育種第2圃場',
    brix: 13.1, acid: 0.78, firm: 84, wt: 24.6, form: '円錐形', heat: 71,
    sire: 'SNOW LILY', dam: 'DEEP RED', bms: 'CRIMSON ROOT', ci: 0.043,
    note: '果皮がほとんど白いまま熟す。棚持ちは長いが、日持ちの検査でだけ数字が出る。',
    steps: ['実生 12,400', '一次選抜 318', '二次選抜 41', '系統試験 9', '出走 1']
  },
  {
    w: 2, wc: '#111111', wt: '#fff', ln: 'i-26-12', img: 'img/berry2.png', shape: 'berry2',
    from: '佐賀県白石町', breeder: 'CULTA 育種第1圃場',
    brix: 13.4, acid: 0.72, firm: 95, wt: 26.4, form: '心臓形', heat: 78,
    sire: 'DEEP RED', dam: 'VELVET ONE', bms: 'KURO NO 3', ci: 0.112,
    note: '硬度95は6系統で最も高い。常温で四日、角が落ちない。色は黒に近い。',
    steps: ['実生 12,400', '一次選抜 318', '二次選抜 41', '系統試験 9', '出走 1']
  },
  {
    w: 3, wc: '#E4002B', wt: '#fff', ln: 'i-26-03', img: 'img/berry3.png', shape: 'berry3',
    from: '福岡県八女市', breeder: 'CULTA 育種第1圃場',
    brix: 14.2, acid: 0.68, firm: 92, wt: 28.1, form: '円錐形', heat: 86,
    sire: 'VELVET ONE', dam: 'RUBY GRACE', bms: 'CRIMSON ROOT', ci: 0.071,
    note: '糖酸比20.9。三十度の圃場で糖度が落ちなかったのはこの系統だけだった。',
    steps: ['実生 12,400', '一次選抜 318', '二次選抜 41', '系統試験 9', '出走 1']
  },
  {
    w: 4, wc: '#1B4FD8', wt: '#fff', ln: 'i-26-18', img: 'img/berry4.png', shape: 'berry4',
    from: '静岡県久能', breeder: 'CULTA 育種第3圃場',
    brix: 12.9, acid: 0.81, firm: 88, wt: 22.9, form: '楔形', heat: 64,
    sire: 'AZURE SEED', dam: 'SNOW LILY', bms: 'DEEP RED', ci: 0.038,
    note: '酸が高い。生食よりも加工の評価が先に立った。香りの成分量は6系統で最多。',
    steps: ['実生 12,400', '一次選抜 318', '二次選抜 41', '系統試験 9', '出走 1']
  },
  {
    w: 5, wc: '#E8B800', wt: '#111', ln: 'i-26-22', img: 'img/berry5.png', shape: 'berry5',
    from: '栃木県真岡市', breeder: 'CULTA 育種第2圃場',
    brix: 13.9, acid: 0.74, firm: 74, wt: 25.1, form: '心臓形', heat: 69,
    sire: 'GOLD VEIN', dam: 'RUBY GRACE', bms: 'VELVET ONE', ci: 0.094,
    note: '甘さは上位。ただし柔らかく、収穫の翌日までしか形が保たない。',
    steps: ['実生 12,400', '一次選抜 318', '二次選抜 41', '系統試験 9', '出走 1']
  },
  {
    w: 6, wc: '#0F8A4C', wt: '#fff', ln: 'i-26-14', img: 'img/berry6.png', shape: 'berry6',
    from: '奈良県橿原市', breeder: 'CULTA 育種第3圃場',
    brix: 13.6, acid: 0.70, firm: 81, wt: 22.2, form: '卵形', heat: 74,
    sire: 'CRIMSON ROOT', dam: 'GREEN NOTE', bms: 'SNOW LILY', ci: 0.056,
    note: '小さいが揃いがいい。一果重の分散が最も小さく、箱に詰めたときの見栄えが立つ。',
    steps: ['実生 12,400', '一次選抜 318', '二次選抜 41', '系統試験 9', '出走 1']
  }
];

/* 専門家のブラインド審査。数値だけで決まる（誰が選んだかは関係しない） */
const AXES = [
  { k: 'ratio', label: '糖酸比',   en: 'SUGAR / ACID', w: 0.34, f: l => l.brix / l.acid },
  { k: 'firm',  label: '果実硬度', en: 'FIRMNESS',     w: 0.28, f: l => l.firm },
  { k: 'heat',  label: '耐暑性',   en: 'HEAT TOLERANCE', w: 0.22, f: l => l.heat },
  { k: 'wt',    label: '一果重',   en: 'FRUIT WEIGHT', w: 0.16, f: l => l.wt }
];

function norm(vals, v) {
  const mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
  return mx === mn ? 0.5 : (v - mn) / (mx - mn);
}
function expertScores() {
  const cols = {};
  AXES.forEach(a => { cols[a.k] = LINES.map(a.f); });
  return LINES.map(l => {
    let s = 0, parts = {};
    AXES.forEach(a => { const n = norm(cols[a.k], a.f(l)); parts[a.k] = n; s += n * a.w; });
    return { ln: l.ln, score: s, parts: parts };
  });
}

const JUDGES = [
  { n: '果実生理', en: 'FRUIT PHYSIOLOGY' },
  { n: '官能評価', en: 'SENSORY PANEL' },
  { n: '流通品質', en: 'POSTHARVEST' },
  { n: '栽培適性', en: 'CULTIVATION' },
  { n: '育種', en: 'BREEDING' }
];

/* 優勝系統に与えられる商品名 */
const CROWN = { name: 'RED CROWN', ja: 'レッドクラウン' };

const QA = [
  ['なぜ日本ダービーと同じ日なのか',
   '東京優駿は、三歳のその年しか出られない。血統をつないできた結果を、一日で国民が見届ける唯一の競走です。品種改良も同じ構造を持っている。同じ日にやることで、説明なしにこの企画の意味が伝わります。'],
  ['なぜ市販の品種を走らせないのか',
   '順位がつくと、三位になった商品の売上が落ちます。傷つく人が出る企画は続きません。まだ商品化されていない系統だけなら、誰の売上も減らない。'],
  ['勝てなかった五系統はどうなるのか',
   '商品化はされません。ただし交配親としては残ります。翌年の出走表に、父や母の欄で名前が出てきます。'],
  ['賭けにならないのか',
   'オッズも馬券も賞金もありません。オーナーズクラブは一口馬主の応援の構造だけを借りていて、換金性のあるものは一切扱いません。'],
  ['審査は誰がするのか',
   '専門家五分野のブラインド審査が七割、オーナーズクラブの投票が三割です。専門家は系統番号しか見ません。'],
  ['一年で終わらないか',
   '優勝系統は翌年の交配親になります。その子がまた走る。血統が伸びていくので、二年目以降のほうが面白くなる設計です。']
];
