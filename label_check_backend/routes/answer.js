const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");

router.post("/answer", verifyToken, isAdmin, async (req, res) => {
  const { question_id, content } = req.body;

  try {
    // 답변 저장
    await db.query(
      `INSERT INTO ANSWERS (QUESTION_ID, ADMIN_ID, CONTENT) VALUES (?, ?, ?)`,
      [question_id, req.user.id, content]
    );

    // 질문 상태 업데이트 (답변 완료)
    await db.query(
      `UPDATE QUESTIONS SET IS_ANSWERED = true, ADMIN_VIEWED = true WHERE ID = ?`,
      [question_id]
    );

    res.status(200).json({ message: "답변이 등록되었습니다." });
  } catch (err) {
    console.error("답변 등록 오류:", err);
    res.status(500).json({ message: "답변 등록 실패" });
  }
});

module.exports = router;