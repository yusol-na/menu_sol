const express = require("express");
const router = express.Router(); 
const db = require("../db");                        
const { encryptContact, decryptContact } = require("../utils/crypto"); 
const verifyToken = require("../middleware/verifyToken");  
const { recordLog } = require("./logs");                  // logs.js에서 export한 recordLog 함수



// 질문 수정 API
router.put("/:id", verifyToken, async (req, res) => {
  const questionId = req.params.id;
  const { type, title, content, company, q_contact } = req.body;
  const userId = req.user.id;

  try {
    // 사용자 소유 확인
    const [existing] = await db.query("SELECT * FROM QUESTIONS WHERE ID = ? AND USER_ID = ?", [questionId, userId]);
    if (!existing.length) {
      return res.status(403).json({ message: "수정 권한이 없습니다." });
    }

    const encryptedContact = encryptContact(q_contact);

    await db.query(
      `UPDATE QUESTIONS 
       SET TYPE = ?, TITLE = ?, CONTENT = ?, COMPANY = ?, PHONE_ENCRYPTED = ?, UPDATED_AT = NOW()
       WHERE ID = ?`,
      [type, title, content, company, encryptedContact, questionId]
    );

    await recordLog(questionId, "수정", userId);

    res.json({ message: "질문이 수정되었습니다." });
  } catch (err) {
    console.error("질문 수정 실패:", err);
    res.status(500).json({ error: "질문 수정 실패" });
  }
});

// 질문 삭제 API
router.delete("/:id", verifyToken, async (req, res) => {
  const questionId = req.params.id;
  const userId = req.user.id;

  try {
    // 사용자 소유 확인
    const [existing] = await db.query("SELECT * FROM QUESTIONS WHERE ID = ? AND USER_ID = ?", [questionId, userId]);
    if (!existing.length) {
      return res.status(403).json({ message: "삭제 권한이 없습니다." });
    }

    await db.query("DELETE FROM QUESTIONS WHERE ID = ?", [questionId]);

    await recordLog(questionId, "삭제", userId);

    res.json({ message: "질문이 삭제되었습니다." });
  } catch (err) {
    console.error("질문 삭제 실패:", err);
    res.status(500).json({ error: "질문 삭제 실패" });
  }
});

module.exports = router;

