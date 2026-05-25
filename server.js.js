// ============================================================
// 루월당 루월당 자료집 - 접속 코드 검증 API
// Railway의 Luwoldang-Luwoldang-production 프로젝트에 추가할 코드
// ============================================================

// 📦 필요한 패키지 (이미 설치돼있다면 스킵)
// npm install express cors crypto

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();

// ============================================================
// 1️⃣ CORS 설정 (중요!)
// ============================================================
app.use(cors({
  origin: [
    'https://zhei-la.github.io',      // GitHub Pages 도메인
    'https://Luwoldang.github.io',        // 혹시 다른 계정명
    'http://localhost:3000',           // 로컬 테스트
    'http://localhost:5500',           // Live Server
    'null'                             // 파일 직접 열 때
  ],
  methods: ['GET', 'POST'],
  credentials: false
}));

app.use(express.json());

// ============================================================
// 📁 정적 파일 서빙 (HTML, CSS, 이미지 등)
// ============================================================
// server.js와 같은 폴더의 HTML 파일들을 자동으로 제공
app.use(express.static(__dirname));

// ============================================================
// 2️⃣ 토큰 생성 함수 (간단한 방식)
// ============================================================
function generateToken(code) {
  const secret = process.env.TOKEN_SECRET || 'Luwoldang-secret-2025';
  return crypto
    .createHmac('sha256', secret)
    .update(code + Date.now().toString().slice(0, -5)) // 만료 버퍼
    .digest('hex')
    .slice(0, 24);
}

function validateToken(token) {
  // 간단 검증: 24자 hex 문자열인지 + 최근 30일 이내 발급됐는지
  if (!token || token.length !== 24) return false;
  if (!/^[a-f0-9]+$/.test(token)) return false;

  // 최근 30일 이내 발급된 토큰인지 확인 (매달 코드 바뀌면 자동 무효화)
  const secret = process.env.TOKEN_SECRET || 'Luwoldang-secret-2025';
  const currentCode = process.env.Luwoldang_ACCESS_CODE || '';

  // 오늘 포함 최근 35일 동안 유효한 토큰 생성 범위 체크
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
// 3️⃣ 코드 검증 API
// ============================================================
app.post('/api/verify', (req, res) => {
  const { code } = req.body;
  const validCode = process.env.Luwoldang_ACCESS_CODE;

  if (!validCode) {
    return res.status(500).json({
      success: false,
      message: '서버 설정 오류'
    });
  }

  if (!code) {
    return res.status(400).json({
      success: false,
      message: '코드를 입력해주세요'
    });
  }

  // 대소문자 무시, 공백 제거
  if (code.trim().toLowerCase() === validCode.toLowerCase()) {
    const token = generateToken(validCode);
    console.log(`[자료집] ✅ 접속 허용: ${new Date().toISOString()}`);
    return res.json({
      success: true,
      token: token,
      message: '환영해요! 🌸'
    });
  }

  console.log(`[자료집] ❌ 잘못된 코드: ${code} (${new Date().toISOString()})`);
  return res.status(401).json({
    success: false,
    message: '코드가 올바르지 않아요. 루월당님께 문의해주세요!'
  });
});

// ============================================================
// 4️⃣ 토큰 확인 API (재방문 시)
// ============================================================
app.get('/api/verify/check', (req, res) => {
  const { token } = req.query;
  if (validateToken(token)) {
    return res.json({ valid: true });
  }
  return res.json({ valid: false });
});

// ============================================================
// 5️⃣ 서버 시작 (기존 서버가 이미 있으면 이 부분은 스킵)
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌸 루월당 루월당 자료집 서버 실행: http://localhost:${PORT}`);
  console.log(`   접속 코드: ${process.env.Luwoldang_ACCESS_CODE ? '✅ 설정됨' : '❌ 미설정 (환경변수 Luwoldang_ACCESS_CODE 추가 필요)'}`);
});

// ============================================================
// 📝 Railway 환경변수 설정 방법
// ============================================================
// 1. Railway 대시보드 → Luwoldang-Luwoldang-production 프로젝트 선택
// 2. Variables 탭 클릭
// 3. 아래 환경변수 추가:
//
//    Luwoldang_ACCESS_CODE  = 매달 바꾸실 코드 (예: Luwoldang1127)
//    TOKEN_SECRET        = 아무 문자열 (예: my-super-secret-2025)
//
// 4. Deploy 자동 재시작
// 5. 매달 코드 바꿀 때는 Luwoldang_ACCESS_CODE만 수정하면 끝!
//    (기존에 접속했던 사람들은 자동 로그아웃됨)
