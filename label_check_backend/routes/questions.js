const express = require('express');
const router = express.Router();
const db = require('../db');

// 미들웨어 & 유틸
const validate = require('../middleware/validate');
const { create, update } = require('../schemas/questionSchemas');
const verifyToken = require('../middleware/verifyToken');
const { encryptContact } = require('../utils/crypto');
const { recordLog } = require('./logs');
const { InternalError, Forbidden } = require('../utils/errors');

/* 질문 생성 (POST /questions) */
router.post('/', verifyToken, validate(create), async (req, res, next) => {
  try {
    const { type, title, content, company, phone } = req.body;
    const encPhone = phone ? encryptContact(phone) : null;

    await db.query(
      `INSERT INTO QUESTIONS (USER_ID, TYPE, TITLE, CONTENT, COMPANY, PHONE_ENCRYPTED)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, type, title, content, company || null, encPhone]
    );

    return res.json({ success: true, message: '등록되었습니다.' });
  } catch (err) {
    return next(InternalError('질문 등록 실패'));
  }
});

/* 질문 수정 (PUT /questions/:id) */
router.put('/:id', verifyToken, validate(update), async (req, res, next) => {
  const qid = req.params.id;
  try {
    // 소유권 확인
    const [own] = await db.query('SELECT USER_ID FROM QUESTIONS WHERE ID=?', [qid]);
    if (!own.length || own[0].USER_ID !== req.user.id) {
      return next(Forbidden('권한 없음'));
    }

    const { type, title, content, company, phone } = req.body;
    const encPhone = phone ? encryptContact(phone) : null;

    await db.query(
      `UPDATE QUESTIONS
         SET TYPE=?, TITLE=?, CONTENT=?, COMPANY=?, PHONE_ENCRYPTED=?, UPDATED_AT=NOW()
       WHERE ID=?`,
      [type, title, content, company || null, encPhone, qid]
    );

    await recordLog(qid, '수정', req.user.id);
    return res.json({ success: true, message: '수정되었습니다.' });
  } catch (err) {
    return next(InternalError('질문 수정 실패'));
  }
});

/* 질문 삭제 (DELETE /questions/:id) */
router.delete('/:id', verifyToken, async (req, res, next) => {
  const qid = req.params.id;
  try {
    // 소유권 확인
    const [own] = await db.query('SELECT USER_ID FROM QUESTIONS WHERE ID=?', [qid]);
    if (!own.length || own[0].USER_ID !== req.user.id) {
      return next(Forbidden('권한 없음'));
    }

    await db.query('DELETE FROM QUESTIONS WHERE ID=?', [qid]);
    await recordLog(qid, '삭제', req.user.id);

    return res.json({ success: true, message: '삭제되었습니다.' });
  } catch (err) {
    return next(InternalError('질문 삭제 실패'));
  }
});

module.exports = router;