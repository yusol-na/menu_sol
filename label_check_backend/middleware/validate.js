const { ZodError } = require('zod');

/*
 validate 미들웨어
 * - 요청(req)의 body, query, params를 Zod 스키마로 검증
 * - 스키마에 맞지 않으면 400 에러와 함께 구체적인 오류 메시지 반환
 * - 맞으면 req 객체를 검증된 값으로 덮어씌움 (자동 정제 효과)
 *
 * @param {object} param0 - 검증할 대상 (body, query, params)
 * @returns {function} Express 미들웨어 함수
 */
function validate({ body, query, params } = {}) {
  return (req, res, next) => {
    try {
      if (body) req.body = body.parse(req.body);
      if (query) req.query = query.parse(req.query);
      if (params) req.params = params.parse(req.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // 디버그에 도움: 어떤 필드가 막혔는지 서버 콘솔에 출력
        console.log('[ZOD] issues:', err.issues);

        return res.status(400).json({
          success: false,
          code: 'VALIDATION_ERROR',
          message: '입력 값이 올바르지 않습니다.',
          errors: err.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
        });
      }
      next(err);
    }
  };
}

module.exports = validate;