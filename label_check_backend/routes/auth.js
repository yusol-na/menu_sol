const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require(path.join(__dirname, '..', 'db'));
const router = express.Router();

const validate = require('../middleware/validate');              // ← 폴더명이 'middleware'인지 'middlewares'인지 확인!
const { register, login } = require('../schemas/authSchemas');
const { getActiveSecret } = require('../utils/jwtKeys');
const { encryptContact } = require('../utils/crypto');           // AES 암호화 유틸

/* 회원가입 */
router.post('/register', validate(register), async (req, res) => {
  try {
    const { username, password, name, email, mobile, homeTel } = req.body;

    // 1) 아이디 중복
    const [dup] = await db.query('SELECT 1 FROM USERS WHERE USERNAME = ?', [username]);
    if (dup.length) {
      return res.status(409).json({ success:false, code:'DUP_ID', message:'이미 사용 중인 아이디입니다.' });
    }

    // 2) 비번 해시
    const hashed = await bcrypt.hash(password, 10);

    // 3) DB 저장 (휴대폰/집전화는 암호화해서 컬럼명에 맞게)
    const [result] = await db.query(
      `INSERT INTO USERS
         (USERNAME, PASSWORD_HASH, NAME, EMAIL, MOBILE_ENCRYPTED, HOME_TEL_ENCRYPTED)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        username,
        hashed,
        name,
        email,
        encryptContact(mobile),                 // 필수
        homeTel ? encryptContact(homeTel) : null // 선택(null 허용)
      ]
    );

    return res.status(201).json({
      success: true,
      message: '회원가입 성공',
      userId: result.insertId,
    });
  } catch (err) {
    console.error('[REGISTER ERROR]', {
      code: err.code,
      message: err.message,
      sqlMessage: err.sqlMessage,
      sql: err.sql,
    });
    return res.status(500).json({ success:false, code:'INTERNAL_ERROR', message:'서버 내부 오류' });
  }
});

/* 로그인 */
router.post('/login', validate(login), async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('[LOGIN TRY]', username); // ← 누가 시도하는지

    const [rows] = await db.query('SELECT * FROM USERS WHERE USERNAME = ?', [username]);
    if (!rows.length) {
      console.log('[LOGIN FAIL] no user');
      return res.status(401).json({ success:false, code:'LOGIN_FAIL', message:'아이디/비번 오류' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.PASSWORD_HASH);
    if (!ok) {
      console.log('[LOGIN FAIL] bad password');
      return res.status(401).json({ success:false, code:'LOGIN_FAIL', message:'아이디/비번 오류' });
    }

    const { kid, secret } = getActiveSecret();
    const token = jwt.sign(
      { id: user.ID, username: user.USERNAME, role: user.ROLE },
      secret,
      { expiresIn: '1h', header: { kid } }
    );

    console.log('[LOGIN OK]', username);
    return res.json({ success:true, token });
  } catch (err) {
    console.error('로그인 오류:', err);
    return res.status(500).json({ success:false, code:'INTERNAL_ERROR', message:'서버 내부 오류' });
  }
});

module.exports = router;