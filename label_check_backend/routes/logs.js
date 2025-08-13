const express = require("express");
const router = express.Router();
const db = require("../db");

// 미들웨어
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");

//  1. 수정/삭제 로그 기록 함수 (외부에서 import해서 사용할 용도)
async function recordLog(questionId, actionType, userId) {
  try {
    await db.query(
      `INSERT INTO QUESTION_LOGS (Q_ID, ACTION, ACTION_USER_ID)
       VALUES (?, ?, ?)`,
      [questionId, actionType, userId]
    );
  } catch (err) {
    console.error("로그 기록 실패:", err);
  }
}

//  2. 관리자만 로그 전체 조회 가능
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT LOG_ID, Q_ID, ACTION, ACTION_TIME, ACTION_USER_ID
      FROM QUESTION_LOGS
      ORDER BY ACTION_TIME DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("로그 조회 실패:", err);
    res.status(500).json({ message: "로그 조회 실패" });
  }
});

module.exports = router;
