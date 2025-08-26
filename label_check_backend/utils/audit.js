const db = require('../db');

/*
audit(event, options)
- 보안/관리 목적의 감사 로그(Audit Log)를 DB에 저장하는 함수
- 주요 정보: 이벤트명, 사용자 ID, 요청자 IP, User-Agent, 추가 메타데이터
 *
 * @param {string} event   - 기록할 이벤트 이름 (예: 'LOGIN_SUCCESS', 'PERMISSION_DENIED')
 * @param {object} options - 선택적 정보
 *   - userId: 이벤트를 발생시킨 사용자 ID (없으면 null)
 *   - req: 요청 객체 (IP, User-Agent 추출에 사용)
 *   - meta: 추가 정보(JSON으로 직렬화하여 저장)
 */
async function audit(event, { userId=null, req=null, meta=null } = {}) {
  try {
    const ip = req?.ip || null;                         // 요청자의 IP 주소
    const ua = req?.headers?.['user-agent'] || null;    // 요청자의 브라우저/환경 정보
    await db.query(
      'INSERT INTO AUDIT_LOGS (EVENT, USER_ID, IP, USER_AGENT, META) VALUES (?, ?, ?, ?, ?)',
      [event, userId, ip, ua, meta ? JSON.stringify(meta) : null] // meta는 JSON 문자열로 변환
    );
  } catch (e) {
    // 로그 저장 실패 시 서버 죽이지 않고 콘솔에만 경고 출력
    console.error('AUDIT FAIL', e.message);
  }
}

// 외부에서 사용 가능하게 export
module.exports = { audit };