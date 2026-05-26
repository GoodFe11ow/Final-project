import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import {
    registerSchema,
    loginSchema
} from "../validations/auth.validation.js";
import { env } from "../config/env.js"
import jwt from "jsonwebtoken"
import { requireAuth } from "../middlewares/require-auth.js";
import { publicUserSelect } from "../lib/public-user-select.js";
import { OAuth2Client } from "google-auth-library";


const authRouter = Router();
const DEMO_USER_EMAIL = "demo@productivity.app"
const DEMO_USER_NAME = "Demo User"
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

//User registration
authRouter.post("/auth/register", async (req, res, next) => {
    try {
        const result = registerSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid request body",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: result.data.email,
            },
        });

        if (existingUser) {
            return res.status(409).json({
                ok: false,
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
            select: publicUserSelect,
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

        if (!result.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid request body",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                email: result.data.email,
            },
            select: {
                ...publicUserSelect,
                passwordHash: true,
            }
        });

        if (!user) {
            return res.status(401).json({
                ok: false,
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            result.data.password,
            user.passwordHash,
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                ok: false,
                message: "Invalid email or password",
            });
        };

        const token = jwt.sign(
            { userId: user.id },
            env.APP_JWT_SECRET,
            { expiresIn: "7d" },
        );

        const { passwordHash, ...safeUser } = user;
        return res.status(200).json({
            ok: true,
            data: {
                token,
                user: safeUser,
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

//Demo user
authRouter.post("/auth/demo", async (req, res, next) => {
    try {
        if (!env.DEMO_MODE) {
            return res.status(404).json({
                ok: false,
                message: "Not found"
            });
        }

        let user = await prisma.user.findUnique({
            where: {
                email: DEMO_USER_EMAIL,
            },
            select: publicUserSelect,
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: DEMO_USER_NAME,
                    email: DEMO_USER_EMAIL,
                    passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
                },
                select: publicUserSelect,
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            env.APP_JWT_SECRET,
            { expiresIn: "7d" },
        );

        return res.status(200).json({
            ok: true,
            data: {
                token,
                user,
            },
        });
    } catch (error) {
        return next(error);
    }
})

//temporary for google validation
authRouter.post("/auth/google", async (req, res, next) => {
    try {
        const credential = req.body?.credential;

        if (typeof credential !== "string" || credential.trim().length === 0) {
            return res.status(400).json({
                ok: false,
                message: "Invalid request body"
            })
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if(!payload?.sub || !payload.email || payload.email_verified !== true) {
            return res.status(401).json({
                ok: false,
                message: "Invalid Google account"
            });
        }

        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name?.trim() || email.split("@")[0] || "User";

        let user = await prisma.user.findUnique({
            where: { googleId },
            select: publicUserSelect,
        });

        if(!user) {
            const existingUserByEmail = await prisma.user.findUnique({
                where: { email },
                select: {
                    ...publicUserSelect,
                    googleId: true,
                },
            });

            if(existingUserByEmail) {
                user = await prisma.user.update({
                    where: { id: existingUserByEmail.id },
                    data: { googleId },
                    select: publicUserSelect,
                });
            } else {
                user = await prisma.user.create({
                    data: {
                        email,
                        name,
                        googleId,
                        passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
                    },
                    select: publicUserSelect,
                });
            }
        }

        const token = jwt.sign(
            { userId: user?.id },
            env.APP_JWT_SECRET,
            { expiresIn: "7d" },
        );

        return res.status(200).json({
            ok: true,
            data: {
                token,
                user,
            },
        });
    } catch (error) {
        return next(error)
    }
})

export default authRouter;
