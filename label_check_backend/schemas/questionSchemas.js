const { z } = require('zod');

/*
문의 유형(type)
"도입" 또는 "일반" 둘 중 하나만 가능
ENUM 검증 (미리 정의된 값만 허용)
*/
const type = z.enum(['도입','일반']);

/*
제목(title)
반드시 문자열
최소 1자 이상, 최대 255자 제한
*/
const title = z.string().min(1).max(255);

/*
내용(content)
반드시 문자열
최소 1자 이상, 최대 10,000자 제한 (문의 본문이므로 넉넉하게 허용)
*/
const content = z.string().min(1).max(10000);

/*
회사명(company)
선택 입력(optional)
최대 255자까지 허용
*/
const company = z.string().max(255).optional();

/*
연락처
선택 입력(optional)
최대 50자까지 허용 (전화번호, 이메일 등 저장 가능)
*/
const phone = z.string().max(50).optional();

/*
질문 생성(create) 검증 스키마
body에 { type, title, content, company?, phone? } 필드 필요
*/
exports.create = { body: z.object({ type, title, content, company, phone }) };

/*
질문 수정(update)검중 스키마
params: URL 경로에 숫자형 id 필수 (/questions/:id)
body: 생성과 동일한 구조 검증
*/
exports.update = { 
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  body: z.object({ type, title, content, company, phone })
};