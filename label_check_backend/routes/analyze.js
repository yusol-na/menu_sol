// routes/analyze.js

const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

const runYOLO = require('./yolomock');  
const runOCR  = require('./ocrmock');

const { BadRequest, InternalError } = require('../utils/errors');

/* ── 업로드 폴더 준비 ── */
// routes/ 폴더 기준으로 프로젝트 루트의 /uploads 사용
const uploadDir = path.join(__dirname, '..', 'uploads');

/* ── multer 설정 ── */
const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // 폴더 없으면 생성
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (e) {
      cb(e);
    }
  },
  filename: (req, file, cb) => {
    // 간단한 파일명(타임스탬프_원본명)
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!allowed.has(file.mimetype)) {
      return cb(new Error('허용되지 않는 파일 형식입니다.'));
    }
    cb(null, true);
  },
});

/* ── POST /analyze ── */
router.post('/', (req, res, next) => {
  // multer 에러를 표준 에러로 변환
  upload.single('image')(req, res, async (err) => {
    if (err) {
      // MulterError 또는 일반 에러 모두 400으로 응답
      return next(BadRequest(err.message || '업로드 실패'));
    }

    if (!req.file) {
      return next(BadRequest('파일이 필요합니다.'));
    }

    const filePath = req.file.path;

    try {
      // 1) YOLO: 불량 판정
      const isDefective = await runYOLO(filePath);
      // 2) OCR: 텍스트 추출
      const ocrText = await runOCR(filePath);

      return res.json({
        success: true,
        result: isDefective ? '불량' : '정상',
        ocrText,
      });
    } catch (e) {
      return next(InternalError('분석 중 오류가 발생했습니다.'));
    } finally {
      // 파일은 항상 정리
      try { await fs.unlink(filePath); } catch (_) {}
    }
  });
});

module.exports = router;