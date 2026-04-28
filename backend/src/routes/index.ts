import { Router } from "express";
import healthRouter from "./health.routes.js";
import tasksRouter from "./tasks.routes.js";
import authRouter from "./auth.routes.js";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(tasksRouter);    

export default router;