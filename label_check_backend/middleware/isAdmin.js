// 감사 로그 기록 유틸(중요 이벤트 : 접근 차단 등 기록용)
const { audit } = require('../utils/audit');

// 에러 헬퍼: 403 Forbidden 에러 객체 생성
const { Forbidden } = require('../utils/errors');

/**
isAdmin 미들웨어
- 요청한 사용자가 관리자 권한을 가지고 있는지 확인
- 관리자가 아니면 감사 로그 기록 후 403 Forbidden 에러 반환
 */
function isAdmin(req, res, next) {
  // 1. 사용자(role)가 'admin'이 아니면 접근 차단
  if (req.user?.role !== 'admin') {
  // 2. 감사 로그 남기기
    //    EVENT: "PERMISSION_DENIED"
    //    userId: 요청한 사용자 id
    //    meta: 어떤 경로(path)에서 차단되었는지 기록 
    audit('PERMISSION_DENIED', { req, userId: req.user?.id, meta:{ path: req.path } });

  // 3. Forbidden(403) 에러를 next()로 전달 → 에러 핸들러에서 처리
    return next(Forbidden('관리자 권한이 필요합니다.'));
  }
  
  // 4. 관리자인 경우 다음 미들웨어/라우터 실행
  next();
}

module.exports = isAdmin;