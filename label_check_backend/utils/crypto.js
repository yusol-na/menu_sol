const path = require('path');
const crypto = require("crypto");
const secret = process.env.CONTACT_SECRET;

require("dotenv").config({path: path.join(__dirname, '..', 'env')});  

if (!secret) {
  // 친절한 에러 메시지 (서버가 바로 꺼지는 대신 이유를 알려 줌)
  console.error(
    "[CRYPTO] CONTACT_SECRET가 .env에 없습니다. 예) CONTACT_SECRET=랜덤문자열"
  );
  // 개발 중에는 바로 종료하는 게 원인 파악에 쉬움
  process.exit(1);
}

// 문자열 보장
const key = crypto.createHash("sha256").update(String(secret), "utf8").digest();
const iv = Buffer.alloc(16, 0); // 데모용 고정 IV (운영에서는 레코드별 랜덤 IV 권장)

function encryptContact(contact) {
  if (contact == null || contact === "") return null; // 방어코드
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let enc = cipher.update(String(contact), "utf8", "base64");
  enc += cipher.final("base64");
  return enc;
}

function decryptContact(encrypted) {
  if (!encrypted) return null;
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let dec = decipher.update(String(encrypted), "base64", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

module.exports = { encryptContact, decryptContact };