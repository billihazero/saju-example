import express from "express";
import testRoute from "@routes/testRoute.js";

const router = express.Router();

router.use("/test", testRoute);

export default router;
