const path = require("path");             
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

const db = require(path.join(__dirname, "..", "db"));  

/* 비밀번호 유효성 검사 */
function validatePassword(password) {
  if (password.length < 8) return "비밀번호는 최소 8자 이상이어야 합니다.";
  if (!/[A-Za-z]/.test(password)) return "비밀번호에 영문자를 포함해주세요.";
  if (!/[0-9]/.test(password)) return "비밀번호에 숫자를 포함해주세요.";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    return "비밀번호에 특수문자를 포함해주세요.";
  return null;
}

/* 회원가입 */
router.post("/register", async (req, res) => {
  try {
    const { userid, password, name } = req.body;

    if (!userid || !password || !name) {
      return res.status(400).json({ message: "아이디/비밀번호/이름은 필수입니다." });
    }

    const msg = validatePassword(password);
    if (msg) return res.status(400).json({ message: msg });

    const [dup] = await db.query("SELECT 1 FROM USERS WHERE USERID = ?", [userid]);
    if (dup.length) return res.status(409).json({ message: "이미 사용 중인 아이디입니다." });

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO USERS (USERID, PASSWORD_HASH, NAME) VALUES (?, ?, ?)",
      [username, hashed, name]
    );

    return res.status(201).json({ message: "회원가입 성공", userid: result.insertId });
  } catch (err) {
    console.error("회원가입 오류:", {
      code: err.code,
      message: err.message,
      sql: err.sql,
      sqlMessage: err.sqlMessage,
    });
    return res.status(500).json({ message: "서버 내부 오류" });
  }
});

/* 로그인 */
router.post("/login", async (req, res) => {
  try {
    const { userid, password } = req.body;

    const [rows] = await db.query("SELECT * FROM USERS WHERE USERID = ?", [userid]);
    if (!rows.length) return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.PASSWORD_HASH);
    if (!ok) return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });

    if (!process.env.JWT_SECRET) {
      console.error("환경변수 JWT_SECRET 누락!");
      return res.status(500).json({ message: "서버 내부 오류" });
    }

    const token = jwt.sign(
      { id: user.ID, userid: user.USERID, role: user.ROLE },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token });
  } catch (err) {
    console.error("로그인 오류:", {
      code: err.code,
      message: err.message,
      sql: err.sql,
      sqlMessage: err.sqlMessage,
    });
    return res.status(500).json({ message: "서버 내부 오류" });
  }
});


module.exports = router;

