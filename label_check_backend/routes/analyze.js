const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const runYOLO = require("../yolomock");
const runOCR = require("../ocrmock");

// multer 설정: 업로드 파일 임시 저장 디렉토리
const upload = multer({
  dest: "uploads/",
});

// POST /analyze 라우터
router.post("/", upload.single("image"), async (req, res) => {
  console.log("분석 라우터에 도달함!");
  console.log("req.file:", req.file);

  try {
    const imagePath = req.file.path;

    // 1. YOLO 분석 실행
    console.log("YOLO 실행 시작");
    const isDefective = await runYOLO(imagePath);
    console.log("YOLO 결과:", isDefective);

    // 2. OCR 실행
    console.log("OCR 실행 시작");
    const ocrText = await runOCR(imagePath);
    console.log("OCR 결과:", ocrText);

    // 3. 분석 완료 후 파일 삭제 (보안 목적)
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("파일 삭제 오류:", err);
      } else {
        console.log("분석 완료 후 업로드 파일 삭제됨");
      }
    });

    // 4. 클라이언트에 결과 전송
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