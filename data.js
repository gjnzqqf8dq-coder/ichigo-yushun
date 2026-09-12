/* =========================================================================
   data.js — 苺優駿 / 日本いちごダービー 2027
   走るのは、まだ商品化されていない6系統。名前はまだない。
   枠番の色は中央競馬の帽色（1白 2黒 3赤 4青 5黄 6緑）。
   ========================================================================= */
const LINES = [
  {
    no: 1, name: 'ユキアカリ', kanji: '雪明', roma: 'YUKIAKARI', wc: '#FFFFFF', ln: 'i-26-07', img: 'img/berry1.png', shape: 'berry1',
    from: '福岡県久留米市', farm: 'CULTA 育種第2圃場',
    copy: ['雪の色のまま、', '甘くなる。'],
    desc: '果皮が白いまま熟す系統。やわらかい香りと、ととのった酸味。棚持ちが長く、遠くまで運べる。',
    flavor: 'ひとくちめは静か。あとから蜜のような甘さが上がってくる。冷やすほど輪郭がはっきりする。',
    brix: 13.1, acid: 0.78, firm: 84, wt: 24.6, heat: 71, form: '円錐形',
    radar: { 甘さ: 54, 香り: 66, 硬さ: 65, 酸味: 70, 果汁: 72 },
    sire: 'SNOW LILY', ss: 'WHITE PEARL', sd: 'ECHIGO 3',
    dam: 'DEEP RED', bms: 'CRIMSON ROOT', dd: 'AKANE 7',
    ci: 0.000, cross: '共通祖先なし',
    traitL: ['白い果皮', 'やわらかな香り'], traitR: ['棚持ち', '酸のバランス'],
    breeder: {
      name: '佐藤 遥', roma: 'SATO HARUKA', photo: 'img/br1.png',
      quote: '「白いのに、ちゃんと甘い。」',
      text: '白い果実は見た目で敬遠されます。だからこそ、食べた瞬間に評価がひっくり返る一粒を探しました。全国1,842株の実生から、この1号にたどり着きました。',
      years: 8, seedlings: '1,842', dev: 2,
      keys: ['白系果皮', '長期棚持ち', '春〜初夏']
    }
  },
  {
    no: 2, name: 'クロガネ', kanji: '黒鉄', roma: 'KUROGANE', wc: '#111111', ln: 'i-26-12', img: 'img/berry2.png', shape: 'berry2',
    from: '佐賀県白石町', farm: 'CULTA 育種第1圃場',
    copy: ['四日たっても、', '角が落ちない。'],
    desc: '硬度95。6系統で最も硬い。常温で四日置いても形が崩れず、色は黒に近いところまで濃くなる。',
    flavor: '噛んだ瞬間に音がする。果汁は控えめで、味が最後まで散らない。',
    brix: 13.4, acid: 0.72, firm: 95, wt: 26.4, heat: 78, form: '心臓形',
    radar: { 甘さ: 62, 香り: 58, 硬さ: 91, 酸味: 50, 果汁: 61 },
    sire: 'DEEP RED', ss: 'CRIMSON ROOT', sd: 'AKANE 7',
    dam: 'VELVET ONE', bms: 'CRIMSON ROOT', dd: 'SILK 12',
    ci: 0.031, cross: 'CRIMSON ROOT 3×3',
    traitL: ['果実硬度', '濃い果皮色'], traitR: ['日持ち', '輸送耐性'],
    breeder: {
      name: '大島 悠真', roma: 'OSHIMA YUMA', photo: 'img/br2.png',
      quote: '「壊れないいちごを、つくりたかった。」',
      text: 'いちごが売り場で傷むのは、運び方ではなく品種の問題です。硬さを上げると味が痩せる。その両立だけを2年追いかけました。',
      years: 11, seedlings: '2,310', dev: 2,
      keys: ['硬度95', '輸送耐性', '濃色']
    }
  },
  {
    no: 3, name: 'アカツキ', kanji: '暁', roma: 'AKATSUKI', wc: '#E4002B', ln: 'i-26-03', img: 'img/berry3.png', shape: 'berry3',
    from: '福岡県八女市', farm: 'CULTA 育種第1圃場',
    copy: ['太陽をあびて、', 'もっと、あたらしい甘さへ。'],
    desc: '糖酸比20.9。三十度の圃場で糖度が落ちなかったのは、6系統でこの系統だけだった。',
    flavor: 'ひとくちで広がる、やわらかな甘み。あとから感じるすっきりとした酸味が、夏にぴったりの爽やかさを残す。',
    brix: 14.2, acid: 0.68, firm: 92, wt: 28.1, heat: 86, form: '円錐形',
    radar: { 甘さ: 84, 香り: 88, 硬さ: 84, 酸味: 37, 果汁: 86 },
    sire: 'VELVET ONE', ss: 'CRIMSON ROOT', sd: 'SILK 12',
    dam: 'RUBY GRACE', bms: 'CRIMSON ROOT', dd: 'HANA 5',
    ci: 0.031, cross: 'CRIMSON ROOT 3×3',
    traitL: ['甘さ', '香り'], traitR: ['硬さ', '暑さへの強さ'],
    breeder: {
      name: '三宅 千尋', roma: 'MIYAKE CHIHIRO', photo: 'img/br3.png',
      quote: '「5月にも、摘みたてのおいしさを。」',
      text: 'いちごのシーズンを、もっと長く。その想いから、全国の1,842株の実生の中で、たったひとつ、この3号にたどり着きました。季節を越えて、変わらないおいしさを、これからも。',
      years: 8, seedlings: '1,842', dev: 2,
      keys: ['高速育種', '硬さ×甘さ', '春〜初夏']
    }
  },
  {
    no: 4, name: 'カゼカオル', kanji: '風薫', roma: 'KAZEKAORU', wc: '#1B4FD8', ln: 'i-26-18', img: 'img/berry4.png', shape: 'berry4',
    from: '静岡県久能', farm: 'CULTA 育種第3圃場',
    copy: ['香りだけで、', '誰のものか分かる。'],
    desc: '香気成分の総量が6系統で最も多い。酸が高く、生食よりも先に加工の評価が立った系統。',
    flavor: '鼻に抜ける香りが長い。酸がしっかりしているので、乳製品と合わせると輪郭が出る。',
    brix: 12.9, acid: 0.81, firm: 88, wt: 22.9, heat: 64, form: '楔形',
    radar: { 甘さ: 49, 香り: 94, 硬さ: 75, 酸味: 80, 果汁: 79 },
    sire: 'AZURE SEED', ss: 'BLUE NOTE', sd: 'SHIZU 2',
    dam: 'SNOW LILY', bms: 'WHITE PEARL', dd: 'ECHIGO 3',
    ci: 0.000, cross: '共通祖先なし',
    traitL: ['香気成分量', '酸味'], traitR: ['果形の揃い', '加工適性'],
    breeder: {
      name: '岸本 蓮', roma: 'KISHIMOTO REN', photo: 'img/br4.png',
      quote: '「甘いだけの果物は、飽きられる。」',
      text: '甘さの競争からは降りました。香りと酸が立つ系統は、菓子と乳製品の世界で強い。生食で一番になれなくても、使われる場所がある。',
      years: 6, seedlings: '1,504', dev: 2,
      keys: ['高香気', '加工適性', '低温伸長']
    }
  },
  {
    no: 5, name: 'ミツシズク', kanji: '蜜雫', roma: 'MITSUSHIZUKU', wc: '#E8B800', ln: 'i-26-22', img: 'img/berry5.png', shape: 'berry5',
    from: '栃木県真岡市', farm: 'CULTA 育種第2圃場',
    copy: ['その日のうちに、', '食べてほしい。'],
    desc: '果汁が多く、甘さも上位。ただし柔らかく、収穫の翌日までしか形が保たない系統。',
    flavor: '噛むというより、ほどける。果汁が先に来て、香りが後から追いつく。',
    brix: 13.9, acid: 0.74, firm: 74, wt: 25.1, heat: 69, form: '心臓形',
    radar: { 甘さ: 76, 香り: 71, 硬さ: 42, 酸味: 57, 果汁: 90 },
    sire: 'GOLD VEIN', ss: 'AMBER 4', sd: 'KOGANE 9',
    dam: 'RUBY GRACE', bms: 'CRIMSON ROOT', dd: 'HANA 5',
    ci: 0.000, cross: '共通祖先なし',
    traitL: ['果汁量', '甘さ'], traitR: ['早生性', '果皮の艶'],
    breeder: {
      name: '白井 奈央', roma: 'SHIRAI NAO', photo: 'img/br5.png',
      quote: '「運べない味を、守りたい。」',
      text: '柔らかいことは欠点として扱われます。でも、産地でしか食べられない味が消えていくほうが損失だと思っています。直売と観光農園だけを見て育てました。',
      years: 9, seedlings: '1,990', dev: 2,
      keys: ['高果汁', '直売向き', '早生']
    }
  },
  {
    no: 6, name: 'トキワ', kanji: '常磐', roma: 'TOKIWA', wc: '#0F8A4C', ln: 'i-26-14', img: 'img/berry6.png', shape: 'berry6',
    from: '奈良県橿原市', farm: 'CULTA 育種第3圃場',
    copy: ['小さくても、', '全部そろっている。'],
    desc: '一果重の分散が最も小さい。粒は小さいが揃いがよく、箱に詰めたときの見栄えが立つ。',
    flavor: '甘さと酸のバランスが真ん中。どの粒を食べても同じ味がする、という強さがある。',
    brix: 13.6, acid: 0.70, firm: 81, wt: 22.2, heat: 74, form: '卵形',
    radar: { 甘さ: 68, 香り: 63, 硬さ: 58, 酸味: 43, 果汁: 68 },
    sire: 'CRIMSON ROOT', ss: 'OGURA 2', sd: 'MOMO 1',
    dam: 'GREEN NOTE', bms: 'CRIMSON ROOT', dd: '来歴不詳',
    ci: 0.063, cross: 'CRIMSON ROOT 2×3',
    traitL: ['果形の揃い', '糖酸バランス'], traitR: ['収量', '秀品率'],
    breeder: {
      name: '東 郁弥', roma: 'AZUMA IKUYA', photo: 'img/br6.png',
      quote: '「揃っていることが、いちばん難しい。」',
      text: '大きい粒を一つ作るより、同じ粒を千個作るほうが難しい。ばらつきの小さい系統は、農家の手取りをそのまま増やします。',
      years: 14, seedlings: '2,760', dev: 2,
      keys: ['秀品率', '低分散', '多収']
    }
  }
];

/* 5分野の専門家ブラインド審査。数値だけで決まる */
const AXES = [
  { k: 'ratio', label: '糖酸比',   en: 'SUGAR / ACID',   f: l => l.brix / l.acid },
  { k: 'firm',  label: '果実硬度', en: 'FIRMNESS',       f: l => l.firm },
  { k: 'heat',  label: '耐暑性',   en: 'HEAT TOLERANCE', f: l => l.heat },
  { k: 'wt',    label: '一果重',   en: 'FRUIT WEIGHT',   f: l => l.wt }
];
function norm(vals, v) {
  const mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
  return mx === mn ? 0.5 : (v - mn) / (mx - mn);
}
const JUDGES = [
  { n: '果実生理', en: 'FRUIT PHYSIOLOGY' },
  { n: '官能評価', en: 'SENSORY PANEL' },
  { n: '流通品質', en: 'POSTHARVEST' },
  { n: '栽培適性', en: 'CULTIVATION' },
  { n: '育種',     en: 'BREEDING' }
];
/* 優勝した系統だけが、正式な品種名を与えられる */
const CROWN = { name: '夏明', kana: 'なつあけ', roma: 'NATSUAKE' };

const QA = [
  ['なぜ日本ダービーと同じ日なのか',
   '東京優駿は、三歳のその年しか出られない。血統をつないできた結果を、一日で国民が見届ける唯一の競走です。品種改良も同じ構造を持っている。同じ日にやることで、説明なしにこの企画の意味が伝わります。'],
  ['なぜ市販の品種を走らせないのか',
   '順位がつくと、三位になった商品の売上が落ちます。傷つく人が出る企画は続きません。まだ商品化されていない系統だけなら、誰の売上も減らない。'],
  ['勝てなかった五系統はどうなるのか',
   '商品化はされません。ただし交配親としては残ります。翌年の出走表に、父や母の欄で名前が出てきます。'],
  ['賭けにならないのか',
   'オッズも馬券も賞金もありません。苺主は一口馬主の応援の構造だけを借りていて、換金性のあるものは一切扱いません。'],
  ['審査は誰がするのか',
   '専門家五分野のブラインド審査が七割、苺主クラブの投票が三割です。専門家は系統番号しか見ません。'],
  ['一年で終わらないか',
   '優勝系統は翌年の交配親になります。その子がまた走る。血統が伸びていくので、二年目以降のほうが面白くなる設計です。']
];
