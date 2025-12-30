import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import router from "./routes/index.js";
import errorHandler from "@middleware/errorHandler.js";
import { responseHandler } from "@middleware/responseHandler";

dotenv.config();

const app = express();
app.set("port", process.env.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: false })); //body parser: Form 요청을 req.body에 넣어준다.
app.use(responseHandler);

app.use("/api", router);

app.use(errorHandler);

app.listen(app.get("port"), "0.0.0.0", () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});

export default app;
