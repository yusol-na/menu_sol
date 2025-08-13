const jwt = require("jsonwebtoken");

// 토큰 검증 미들웨어
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  // 1. Authorization 헤더 존재 여부 확인
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization 헤더가 없습니다." });
  }

  // 2. Bearer 형식 체크
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "잘못된 인증 형식입니다. 'Bearer <token>'을 사용하세요." });
  }

  try {
    // 3. 토큰 검증 및 사용자 정보 추출
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. 토큰 payload에 필수 정보가 있는지 확인
    if (!decoded || !decoded.id || !decoded.username) {
      return res.status(403).json({ message: "토큰에 사용자 정보가 부족합니다." });
    }

    // 5. 요청 객체에 사용자 정보 저장
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role || "user", // 역할 정보도 있다면 함께 저장
    };

    next();
  } catch (err) {
    console.error("토큰 인증 실패:", err);
    return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
  }
}

module.exports = verifyToken;