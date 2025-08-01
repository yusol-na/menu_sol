const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const analyzeRouter = require("./routes/analyze");

const app = express();

// 보안설정 추가, 웹 브라우저에서 백엔드에 요청할 때 헤더가 자동으로 붙여서 보안이 강화됨
app.use(helmet());

app.use(cors());
app.use("/analyze", analyzeRouter);

const PORT = 5000;



app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});