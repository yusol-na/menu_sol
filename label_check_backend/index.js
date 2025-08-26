require('dotenv').config(); 
require('dotenv').config({ path: __dirname + '/.env' });

// 디버그
console.log('[DEBUG] CONTACT_SECRET =', JSON.stringify(process.env.CONTACT_SECRET));


const express = require('express');   // Node.js 웹 서버 프레임워크
const cors = require('cors');         // CORS(도메인 간 요청 허용) 처리
const helmet = require('helmet');     // 보안 관련 HTTP 헤더 자동 설정
const cron = require('node-cron');
const { cleanup } = require('./jobs/cleanupUploads');

// 라우터들 (회원가입/로그인, 분석, 질문, 답변, 로그 기능 담당)
const authRouter = require('./routes/auth');
const analyzeRouter = require('./routes/analyze');
const questionRouter = require('./routes/questions');
const answerRouter = require('./routes/answer');
const logsRouter  = require('./routes/logs');

// 보안 관련 미들웨어 (레이트 리밋, 에러 정의, 로깅)
const { apiLimiter, authLimiter } = require('./middleware/limits');
const { ApiError } = require('./utils/errors');
const { logError } = require('./utils/logger');

// MySQL 연결 풀 가져오기
let pool = null;
try {
  pool = require('./db'); // mysql2/promise pool export
} catch (_) {}            // DB 모듈이 없으면 무시

const app = express();

// 매시 5분에 한 번씩
cron.schedule('5 * * * *', cleanup);

// ── HTTPS 강제(프록시 뒤) + HSTS ─────────────────────────
app.enable('trust proxy'); // nginx/ALB 등 프록시 뒤에서 클라 IP/프로토콜 신뢰
if (process.env.NODE_ENV === 'production') {
  // HTTP로 들어오면 301로 https 이동
  app.use((req, res, next) => {
    const xfProto = req.get('x-forwarded-proto');
    if (req.secure || xfProto === 'https') return next();
    return res.redirect(301, `https://${req.get('host')}${req.originalUrl}`);
  });

  // HSTS(브라우저가 강제로 https만 쓰도록 유도)
  app.use(
    helmet.hsts({
      maxAge: 31536000, // 1년(초 단위)
      includeSubDomains: false, // 서브도메인까지 적용하려면 true
      preload: false,           // HSTS Preload 목록 등록 시 true
    })
  );
}

/* ── 보안/미들웨어 ── */
app.use(helmet({ crossOriginResourcePolicy: false }));  // 보안 헤더 적용
app.use(express.json({ limit: '10mb' }));               // JSON 요청 본문 처리 (최대 10MB)

// HTTPS 강제 (운영 환경에서만 적용, 프록시/로드밸런서 뒤에 있을 때)
app.enable('trust proxy');
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.secure || req.get('x-forwarded-proto') === 'https') return next();
    return res.redirect(301, `https://${req.get('host')}${req.originalUrl}`);
  });
}

// CORS 설정 (프론트엔드 주소만 허용)
const ALLOW_ORIGINS = [
  'http://localhost:5173',
  'http://192.168.111.164:5173',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOW_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
}));

// 레이트리밋 (요청 횟수 제한)        
app.use(apiLimiter);                    // 모든 요청에 적용
app.use('/auth/login', authLimiter);    // 로그인 시도 횟수 제한
app.use('/auth/register', authLimiter); // 회원가입 시도 횟수 제한

/* ── 헬스체크 ── */
// 서버가 정상 동작 중인지 확인하는 엔드포인트
app.get('/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'dev' });
});

// DB 연결이 정상인지 확인하는 엔드포인트
app.get('/db-check', async (req, res) => {
  if (!pool?.query) return res.status(200).json({ db: 'skip', note: 'no db module' });
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    res.json({ db: 'ok', now: rows[0].now });
  } catch (err) {
    res.status(500).json({ db: 'fail', error: err.message });
  }
});

/* ── 라우터 등록 ── */
app.use('/auth', authRouter);           // 회원가입/로그인
app.use('/analyze', analyzeRouter);     // 이미지 분석 (YOLO+OCR)
app.use('/questions', questionRouter); // 질문 CRUD
app.use('/answers', answerRouter);     // 관리자 답변
app.use('/logs', logsRouter);          // 질문 수정/삭제 로그

const multerErrors = require('./middleware/multerErrors');
app.use(multerErrors); 

/* ── 404 & 에러 핸들러 ── */
// 존재하지 않는 경로 처리
app.use((req, res, next) => next(new ApiError(404, 'NOT_FOUND', '존재하지 않는 경로입니다.')));

// 모든 에러를 중앙에서 처리
app.use((err, req, res, next) => {
  logError(err, req); //에러 로그 기록
  if (err.status && err.code) {
    return res.status(err.status).json({ success: false, code: err.code, message: err.message });
  }
  return res.status(500).json({ success: false, code: 'INTERNAL_ERROR', message: '서버 내부 오류' });
});

/* ── 서버 시작 ── */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버 실행 중: http://0.0.0.0:${PORT}`);
});


