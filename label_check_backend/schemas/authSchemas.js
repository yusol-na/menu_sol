// label_check_backend/schemas/authSchemas.js
const { z } = require('zod');

// 공백 제거는 내장 .trim() 사용 (ZodString 그대로 유지)
const username = z.string().trim().min(3, '아이디는 3자 이상').max(50, '아이디는 50자 이하');

const password = z.string()
  .min(8, '비밀번호는 8자 이상')
  .regex(/[A-Za-z]/, '영문자 포함 필요')
  .regex(/[0-9]/, '숫자 포함 필요')
  .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, '특수문자 포함 필요');

const name = z.string().trim().min(1, '이름은 필수').max(100, '이름은 100자 이하');
const email = z.string().trim().email('이메일 형식 오류');
const phone = z.string().trim().regex(/^[-0-9\s()+]{7,20}$/, '전화번호 형식 오류');

// homeTel: 빈문자열("")이면 null 로 변환, 아니면 phone 규칙 적용
const homeTel = z.preprocess(
  v => (typeof v === 'string' && v.trim() === '' ? null : v),
  phone.nullable()
);

exports.register = {
  body: z.object({
    username,
    password,
    name,
    email,
    mobile: phone, // 필수
    homeTel,       // 선택("" -> null)
  }),
};

exports.login = {
  body: z.object({
    username,
    password,
  }),
};