const winston = require('winston');
const path = require('path');
const fs = require('fs');

const LOG_DIR = path.join(__dirname,'..','logs');
if(!fs.existsSync(LOG_DIR))fs.mkdirSync(LOG_DIR);
/*
redact(obj)
- 민감 정보(비밀번호, 토큰 등)를 로그에 그대로 남기면 안 되므로
  이 함수에서 미리 가려줌 ("***" 로 치환)
 */
const redact = (obj) => {
  const clone = JSON.parse(JSON.stringify(obj || {})); // 원본 복사
  for(const k of Object.keys(clone)){
    const key = k.toLocaleLowerCase();
    if(['password','password_hash','token','authorization','phone'].includes(keys)){
      clone[k] = '***'
    }
  }
    return clone;
  if (clone.password) clone.password = '***';
  if (clone.PASSWORD) clone.PASSWORD = '***';
  if (clone.token) clone.token = '***';
  if (clone.Authorization) clone.Authorization = '***';
  if (clone.phone) clone.phone = '***';

};

/*
 winston 로거 생성
- level: 로그 레벨 (production에서는 info, 개발 중에는 debug)
- transports: 로그를 어디에 남길지 (여기서는 콘솔 출력)
 */
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format:winston.format.json(),
  transports: [new winston.transports.Console(),new winston.transports.File({filename:path.join(LOG_DIR,'app.log')})],});

/*
 logError(err, req)
- 에러 발생 시 로그를 남기는 함수
- code, message, 요청 경로, HTTP 메서드, 요청 body, 헤더 등을 기록
- 민감한 값은 redact()로 가려줌
- production 환경에서는 stack(자세한 에러 위치) 제외
 */
function logError(err, req) {
  logger.error('Error', {
    code: err.code,                     // 에러 코드 (ex: BAD_REQUEST)
    message: err.message,               // 에러 메시지
    path: req?.path,                    // 요청 경로
    method: req?.method,                // 요청 HTTP 메서드
    body: redact(req?.body),            // 요청 body (민감정보 가려짐)
    headers: redact({ Authorization: req?.headers?.authorization }), // 인증 헤더 마스킹
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack, // 개발 환경에서만 stack 표시
  });
}

// 외부에서 사용 가능하게 export
module.exports = { logger, logError, redact };