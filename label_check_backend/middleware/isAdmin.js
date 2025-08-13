// 관리자가 아닌 타인이 접속시 에러 띄우는 코드 
function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "관리자 권한이 필요합니다." });
  }
  next();
}

module.exports = isAdmin;