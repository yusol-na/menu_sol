const jwt = require('jsonwebtoken');
const { getSecretByKid } = require('../utils/jwtKeys');

/*
 verifyToken 미들웨어
- 모든 요청에서 JWT 토큰이 있는지 확인하고
- 올바른 서명키(kid 기반)로 검증한 뒤
- 사용자 정보를 req.user에 저장
 */
function verifyToken(req, res, next) {
// 1. Authorization 헤더 확인: "Bearer <토큰>"
  const h = req.headers.authorization || '';
  const [scheme, token] = h.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success:false, code:'NO_TOKEN', message:'토큰 없음' });
  }
  try {
    // 2. 토큰 헤더 부분(Base64) 해석 → kid 추출
    const headerB64 = token.split('.')[0]; // 토큰 구조: header.payload.signature
    const decodedHeader = JSON.parse(Buffer.from(headerB64, 'base64').toString('utf8'));
    const kid = decodedHeader.kid;

    // 3. kid에 맞는 secret 가져오기
    const secret = getSecretByKid(kid);

    // 4. 토큰 검증
    const payload = jwt.verify(token, secret);

    // 5. payload 유효성 확인
    if (!payload?.id) throw new Error('payload invalid');

    // 6. 요청 객체에 사용자 정보 저장
    req.user = { id: payload.id, username: payload.username, role: payload.role || 'user' }; // role 없으면 기본 user
    next(); // 다음 미들웨어/라우터 실행
  } catch (e) {
    return res.status(401).json({ success:false, code:'INVALID_TOKEN', message:'유효하지 않은 토큰' });
  }
}

module.exports = verifyToken;