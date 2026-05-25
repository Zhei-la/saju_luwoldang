// ============================================================
// 猷⑥썡??猷⑥썡???먮즺吏?- ?묒냽 肄붾뱶 寃利?API
// Railway??Luwoldang-Luwoldang-production ?꾨줈?앺듃??異붽???肄붾뱶
// ============================================================

// ?벀 ?꾩슂???⑦궎吏 (?대? ?ㅼ튂?쇱엳?ㅻ㈃ ?ㅽ궢)
// npm install express cors crypto

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();

// ============================================================
// 1截뤴깵 CORS ?ㅼ젙 (以묒슂!)
// ============================================================
app.use(cors({
  origin: [
    'https://zhei-la.github.io',      // GitHub Pages ?꾨찓??
    'https://Luwoldang.github.io',        // ?뱀떆 ?ㅻⅨ 怨꾩젙紐?
    'http://localhost:3000',           // 濡쒖뺄 ?뚯뒪??
    'http://localhost:5500',           // Live Server
    'null'                             // ?뚯씪 吏곸젒 ????
  ],
  methods: ['GET', 'POST'],
  credentials: false
}));

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://zhei-la.github.io');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ============================================================
// ?뱚 ?뺤쟻 ?뚯씪 ?쒕튃 (HTML, CSS, ?대?吏 ??
// ============================================================
// server.js? 媛숈? ?대뜑??HTML ?뚯씪?ㅼ쓣 ?먮룞?쇰줈 ?쒓났
app.use(express.static(__dirname));

// ============================================================
// 2截뤴깵 ?좏겙 ?앹꽦 ?⑥닔 (媛꾨떒??諛⑹떇)
// ============================================================
function generateToken(code) {
  const secret = process.env.TOKEN_SECRET || 'Luwoldang-secret-2025';
  return crypto
    .createHmac('sha256', secret)
    .update(code + Date.now().toString().slice(0, -5)) // 留뚮즺 踰꾪띁
    .digest('hex')
    .slice(0, 24);
}

function validateToken(token) {
  // 媛꾨떒 寃利? 24??hex 臾몄옄?댁씤吏 + 理쒓렐 30???대궡 諛쒓툒?먮뒗吏
  if (!token || token.length !== 24) return false;
  if (!/^[a-f0-9]+$/.test(token)) return false;

  // 理쒓렐 30???대궡 諛쒓툒???좏겙?몄? ?뺤씤 (留ㅻ떖 肄붾뱶 諛붾뚮㈃ ?먮룞 臾댄슚??
  const secret = process.env.TOKEN_SECRET || 'Luwoldang-secret-2025';
  const currentCode = process.env.Luwoldang_ACCESS_CODE || '';

  // ?ㅻ뒛 ?ы븿 理쒓렐 35???숈븞 ?좏슚???좏겙 ?앹꽦 踰붿쐞 泥댄겕
  for (let i = 0; i < 35; i++) {
    const pastDate = Date.now() - (i * 24 * 60 * 60 * 1000);
    const expected = crypto
      .createHmac('sha256', secret)
      .update(currentCode + pastDate.toString().slice(0, -5))
      .digest('hex')
      .slice(0, 24);
    if (expected === token) return true;
  }
  return false;
}

// ============================================================
// 3截뤴깵 肄붾뱶 寃利?API
// ============================================================
app.post('/api/verify', (req, res) => {
  const { code } = req.body;
  const validCode = process.env.Luwoldang_ACCESS_CODE;

  if (!validCode) {
    return res.status(500).json({
      success: false,
      message: '?쒕쾭 ?ㅼ젙 ?ㅻ쪟'
    });
  }

  if (!code) {
    return res.status(400).json({
      success: false,
      message: '肄붾뱶瑜??낅젰?댁＜?몄슂'
    });
  }

  // ??뚮Ц??臾댁떆, 怨듬갚 ?쒓굅
  if (code.trim().toLowerCase() === validCode.toLowerCase()) {
    const token = generateToken(validCode);
    console.log(`[?먮즺吏? ???묒냽 ?덉슜: ${new Date().toISOString()}`);
    return res.json({
      success: true,
      token: token,
      message: '?섏쁺?댁슂! ?뙵'
    });
  }

  console.log(`[?먮즺吏? ???섎せ??肄붾뱶: ${code} (${new Date().toISOString()})`);
  return res.status(401).json({
    success: false,
    message: '肄붾뱶媛 ?щ컮瑜댁? ?딆븘?? 猷⑥썡?밸떂猿?臾몄쓽?댁＜?몄슂!'
  });
});

// ============================================================
// 4截뤴깵 ?좏겙 ?뺤씤 API (?щ갑臾???
// ============================================================
app.get('/api/verify/check', (req, res) => {
  const { token } = req.query;
  if (validateToken(token)) {
    return res.json({ valid: true });
  }
  return res.json({ valid: false });
});

// ============================================================
// 5截뤴깵 ?쒕쾭 ?쒖옉 (湲곗〈 ?쒕쾭媛 ?대? ?덉쑝硫???遺遺꾩? ?ㅽ궢)
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`?뙵 猷⑥썡??猷⑥썡???먮즺吏??쒕쾭 ?ㅽ뻾: http://localhost:${PORT}`);
  console.log('Access code loaded');
});

// ============================================================
// ?뱷 Railway ?섍꼍蹂???ㅼ젙 諛⑸쾿
// ============================================================
// 1. Railway ??쒕낫????Luwoldang-Luwoldang-production ?꾨줈?앺듃 ?좏깮
// 2. Variables ???대┃
// 3. ?꾨옒 ?섍꼍蹂??異붽?:
//
//    Luwoldang_ACCESS_CODE  = 留ㅻ떖 諛붽씀??肄붾뱶 (?? Luwoldang1127)
//    TOKEN_SECRET        = ?꾨Т 臾몄옄??(?? my-super-secret-2025)
//
// 4. Deploy ?먮룞 ?ъ떆??
// 5. 留ㅻ떖 肄붾뱶 諛붽? ?뚮뒗 Luwoldang_ACCESS_CODE留??섏젙?섎㈃ ??
//    (湲곗〈???묒냽?덈뜕 ?щ엺?ㅼ? ?먮룞 濡쒓렇?꾩썐??

