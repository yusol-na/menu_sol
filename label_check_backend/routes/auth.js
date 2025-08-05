const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

//  1. 테스트용 사용자 계정 목록 (DB 대신 사용)
const users = [
  { id: 1, username: "admin", password: "password123" },
];

//  2. 로그인 라우터
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // 사용자 찾기
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }

  // JWT 토큰 생성
  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // 토큰 전송
  res.json({ token });
});

module.exports = router;