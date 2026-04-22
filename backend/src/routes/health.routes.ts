import { Router } from 'express';

const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
    return res.status(200).json({
        ok: true,
        message: "Backend is running",
    });
});

export default healthRouter;
