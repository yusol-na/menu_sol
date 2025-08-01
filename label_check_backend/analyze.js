const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const runYOLO = require("../yolomock");
const runOCR = require("./ocrmock");

// 업로드 디렉토리 설정
const upload = multer({
  dest: "uploads/",
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;

    // YOLO 불량 판단 모의 실행
    const isDefective = await runYOLO(imagePath);

    // OCR 텍스트 추출 모의 실행
    const ocrText = await runOCR(imagePath);

    // 삭제는 선택사항 (여기선 파일 유지)
    // fs.unlinkSync(imagePath);

    return res.json({
      result: isDefective ? "불량" : "정상",
      ocrText,
    });
  } catch (error) {
    console.error("분석 중 오류:", error);
    return res.status(500).json({
      result: "판정 오류",
      ocrText: "OCR 실패",
    });
  }
});

module.exports = router;