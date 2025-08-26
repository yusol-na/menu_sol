const rateLimit = require('express-rate-limit');

/* authLimiter
- 회원가입, 로그인 같은 민감한 엔드포인트에 적용
- 15분 동안 최대 10번만 요청 가능 (과도한 시도 방지, brute-force 공격 차단)
*/
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분(밀리초 단위)
  max: 10,                  // 최대 10분 요청 허용
  standardHeaders: true,    // 응답 헤더에 rate limit 정보 포함
  legacyHeaders: false,    //  X-RateLimit-* 구식 헤더는 비활성화
  message: {               // 제한 초과 시 반환할 JSON 응답          
    success: false, code: 'RATE_LIMIT', 
    message: '잠시 후 다시 시도해주세요.' }, // 사용자 친화적인 메시지
});

/* 
  apiLimiter
  - 일반 API 전체에 적용하는 기본 레이트 리밋
  - 1분 동안 최대 120번 요청 가능 (DDoS 같은 대량 요청 방지)
*/
exports.apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 120,            // 최대 120번 요청 허용
  standardHeaders: true,
  legacyHeaders: false,
});