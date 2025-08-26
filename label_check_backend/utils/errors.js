/*
ApiError 클래스
- 모든 API 에러의 공통 구조를 정의
- status: HTTP 상태 코드 (400, 401, 403, 404 등)
- code: 에러 코드 (문자열, ex: 'BAD_REQUEST')
- message: 에러 메시지 (클라이언트에 전달할 설명)
 */
class ApiError extends Error {
  constructor(status, code, message) {
    super(message);       // 기본 Error(message) 속성 설정
    this.status = status; // HTTP 상태 코드
    this.code = code;     // 에러 코드 문자열
  }
}

/*
 자주 쓰이는 에러 헬퍼 함수들
- 필요할 때 new ApiError(...) 대신 짧게 호출 가능
- 일관된 포맷 보장을 위해 미리 정의
 */

// 잘못된 요청 (유효하지 않은 입력 등)
const BadRequest   = (msg = '잘못된 요청')   => new ApiError(400, 'BAD_REQUEST', msg);

// 인증 필요 (로그인 안 됨, 토큰 없음)
const Unauthorized = (msg = '인증 필요')     => new ApiError(401, 'UNAUTHORIZED', msg);

// 권한 없음 (로그인 했지만 관리자 권한 등 부족)
const Forbidden    = (msg = '권한 없음')     => new ApiError(403, 'FORBIDDEN', msg);

// 리소스를 찾을 수 없음 (없는 ID, 경로 등)
const NotFound     = (msg = '없음')         => new ApiError(404, 'NOT_FOUND', msg);

// export → 다른 곳에서 불러다 씀
module.exports = { ApiError, BadRequest, Unauthorized, Forbidden, NotFound };