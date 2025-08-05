// JWT 인증 미들 웨어 
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "토큰 없음" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 이후 라우터에서 사용 가능
    next();
  } catch (err) {
    res.status(401).json({ message: "토큰 유효하지 않음" });
  }
}

module.exports = verifyToken;