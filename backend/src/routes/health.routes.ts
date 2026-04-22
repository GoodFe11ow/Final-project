import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { he } from 'zod/locales';

const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
    return res.status(200).json({
        ok: true,
        message: "Backend is running",
    });
});

healthRouter.get("/health/db", async (_req, res, next) =>{
    try {
        await prisma.$queryRaw`SELECT 1`;

        return res.status(200).json({
            ok: true,
            message: "Database connection is healthy"
        })
    } catch (error) {
        return next(error)
    }
})

export default healthRouter;
