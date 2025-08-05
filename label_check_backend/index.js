const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const analyzeRouter = require("./routes/analyze"); 
// 로그인 라우터 가져오기
const authRouter = require("./routes/authRouter"); 

const app = express();

// 보안설정 추가, 웹 브라우저에서 백엔드에 요청할 때 헤더가 자동으로 붙여서 보안이 강화됨
app.use(helmet({
  crossOriginResourcePolicy: false, // cors 허용 충돌 방지 
}));

app.use(express.json()); // JSON 데이터 받기

app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["POST"],
}));


app.use("/analyze", analyzeRouter);

app.use("/auth",authRouter); //로그인 라우터 등록

const PORT = 5000;



app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});