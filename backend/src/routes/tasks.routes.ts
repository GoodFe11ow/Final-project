import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const tasksRouter = Router();

tasksRouter.get("/tasks", async (_req, res, next) => {
    try {
        const tasks = await prisma.task.findMany();

        return res.status(200).json({
            ok: true,
            message: tasks,
        })
    } catch (error) {
        return next(error)
    }
})

tasksRouter.post("/tasks", async (req, res, next) => {
    try {
        const { title, description, userId} = req.body as {
            title?: string;
            description?: string;
            userId?: string;
        };

        if(!title || !userId) {
            return res.status(400).json({
                ok: false,
                message: "title and userId are required",
            });
        }

        const task = await prisma.task.create({
            data: {
                title,
                description: description ?? null,
                userId
            }
        });

        return res.status(201).json({
            ok:true,
            data: task,
        })
    } catch (error) {
        return next(error);
    }
})
export default tasksRouter;