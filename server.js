const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const router = require("./app/routes/route");

const app = express();
app.set("port", process.env.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: false })); //body parser: Form 요청을 req.body에 넣어준다.

if (process.env.NODE_ENV === "prod") {
  app.use(morgan("combined"));
  app.use(cors("*"));
} else {
  app.use(morgan("dev"));
  app.use(cors("*"));
}

app.use("/", router);

/**
 * 404 에러 처리
 */
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === "prod" && err.status !== 404) {
    return res.status(500).send({
      statusCode: 500,
      message: "서버 에러",
    });
  } else {
    return res.status(500).send({
      statusCode: 500,
      message: "서버 에러",
      error: err,
    });
  }
});

app.listen(app.get("port"), "0.0.0.0", () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});
