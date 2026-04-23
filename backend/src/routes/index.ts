import { Router } from "express";
import healthRouter from "./health.routes.js";
import tasksRouter from "./tasks.routes.js";

const router = Router();

router.use(healthRouter);
router.use(tasksRouter);    

export default router;