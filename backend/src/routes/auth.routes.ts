import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { registerSchema,
         loginSchema
 } from "../validations/auth.validation.js";
import { env } from "../config/env.js"
import jwt from "jsonwebtoken"
import { requireAuth } from "../middlewares/require-auth.js";


const authRouter = Router();

//User registration
authRouter.post("/auth/register", async (req, res, next) =>{
    try {
        const result = registerSchema.safeParse(req.body);

        if(!result.success) {
            return res.status(400).json({
                ok:false,
                message: "Invalid request body",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: result.data.email,
            },
        });

        if(existingUser) {
            return res.status(409).json({
                ok:false,
                message: "User already exist",
            });
        }

        const passwordHash = await bcrypt.hash(result.data.password, 10);

        const user = await prisma.user.create({
            data: {
                name: result.data.name,
                email: result.data.email,
                passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return res.status(201).json({
            ok: true,
            data: user
        })
    } catch (error) {
        return next(error);
    }
});

//User login
authRouter.post("/auth/login", async (req, res, next) => {
    try {
        const result = loginSchema.safeParse(req.body);

        if(!result.success) {
            return res.status(400).json({
                ok:false,
                message: "Invalid request body",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                email: result.data.email,
            },
        });

        if(!user) {
            return res.status(401).json({
                ok: false,
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            result.data.password,
            user.passwordHash,
        );

        if(!isPasswordValid) {
            return res.status(401).json({
                ok:false,
                message: "Invalid email or password",
            });
        };

        const token = jwt.sign(
            { userId: user.id },
            env.APP_JWT_SECRET,
            { expiresIn: "7d"},
        );

        return res.status(200).json({
            ok: true,
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            },
        });
    } catch (error) {
        return next(error);
    }
})

authRouter.get("/auth/me", requireAuth, (req, res) => {
    return res.status(200).json({
        ok: true,
        data: req.user,
    })
})
export default authRouter;
