import express from "express";

import * as testController from "@controllers/testController.js";

const router = express.Router();

router.get("/", testController.getTestData);

export default router;
