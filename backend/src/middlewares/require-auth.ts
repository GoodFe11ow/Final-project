import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { publicUserSelect } from "../lib/public-user-select.js";

export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            ok:false,
            message: "Unauthorized",
        });
    }

    const token = authHeader.slice("Bearer ".length);
    
    let payload: string | JwtPayload;
    
    try {
        payload = jwt.verify(token, env.APP_JWT_SECRET);
    } catch {
        return res.status(401).json({
            ok: false,
            message: "Unauthorized",
        });
    }

    if (typeof payload === "string" || typeof payload.userId !== "string") {
        return res.status(401).json({
            ok: false,
            message: "Unauthorized",
        });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: payload.userId,
            },
            select: publicUserSelect,
        });

        if(!user) {
            return res.status(401).json({
                ok: false,
                message: "Unauthorized",
            });
        }

        req.user = user;

        return next();
    } catch (error) {
        return next(error);
    }
}
