const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require("path");
const router = express.Router();

// 라우터들
const authRouter = require('./routes/auth');
const analyzeRouter = require('./routes/analyze');
const questionRouter = require('./routes/questions');
const answerRouter = require('./routes/answer');
const logsRouter = require('./routes/logs');

console.log('authRouter    =', typeof authRouter);
console.log('analyzeRouter =', typeof analyzeRouter);
console.log('questionRouter=', typeof questionRouter);
console.log('answerRouter  =', typeof answerRouter);


require('dotenv').config({ path: path.join(__dirname, '.env') }); // .env 경로 고정

// (선택) DB 헬스체크용 - db.js가 있다면 사용
let pool = null;
try {
  pool = require('./db');   // 이렇게 (db.js가 module.exports = pool 이니까)
} catch (_) {}
  console.warn

const app = express();

/* ── 보안/미들웨어 ── */
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '10mb' })); // 큰 본문 대비

// 필요 시 여러 오리진 허용 (로컬/사내IP 등)
const allowedOrigins = [
  'http://localhost:5173',
  // 'http://192.168.111.249:5173', // 필요하면 주석 해제
];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

/* ── 헬스체크 ── */
app.get('/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'dev' });
});

app.get('/db-check', async (req, res) => {
  if (!pool) return res.status(200).json({ db: 'skip', note: 'no db module' });
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    res.json({ db: 'ok', now: rows[0].now });
  } catch (err) {
    res.status(500).json({ db: 'fail', error: err.message });
  }
});

/* ── 라우터 등록 ── */
app.use('/auth', authRouter);
app.use('/analyze', analyzeRouter);
app.use('/questions', questionRouter);
app.use('/answers', answerRouter);
app.use('/logs', logsRouter); // logs 라우터 내부에 verifyToken + isAdmin 적용되어 있어야 함
router.get('/', (req, res) => {
  res.send('User Page');
});

/* ── 404 & 에러 핸들러 ── */
app.use((req, res) => res.status(404).json({ message: '존재하지 않는 경로입니다.' }));
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
  res.status(500).json({ message: '서버 내부 오류' });
});

/* ── 서버 시작 ── */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버 실행 중: http://0.0.0.0:${PORT}`);
});

module.exports = router;