import { Router } from "express";
import healthRouter from "./health.routes.js";
import tasksRouter from "./tasks.routes.js";
import authRouter from "./auth.routes.js";
import focusSessionRouter from "./focus-session.js";
import statsRouter from "./stats.routes.js";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(tasksRouter);
router.use(focusSessionRouter);
router.use(statsRouter);

export default router;