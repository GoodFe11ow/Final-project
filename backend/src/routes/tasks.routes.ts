import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { createTaskSchema,
        taskIdParamsSchema,
        updateTaskStatusSchema,
        getTasksQuerySchema
 } from "../validations/task.validation.js"
import { userInfo } from "node:os";

const tasksRouter = Router();



tasksRouter.get("/tasks", async (req, res, next) => {
    try {
        const queryResult = getTasksQuerySchema.safeParse(req.query);

        if(!queryResult.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid query params",
                errors: queryResult.error.flatten().fieldErrors,
            });
        }

        const tasks = await prisma.task.findMany({
                where: {
                    ...(queryResult.data.userId
                        ? {userId: queryResult.data.userId}
                        : {}),
                    ...(queryResult.data.isCompleted !== undefined
                        ? {isCompleted: queryResult.data.isCompleted} : {})
                },
                orderBy: {
                    createdAt: "desc"
                }
        });

        return res.status(200).json({
            ok: true,
            data: tasks,
        })
    } catch (error) {
        return next(error);
    }
})

tasksRouter.post("/tasks", async (req, res, next) => {
    try {
        const result = createTaskSchema.safeParse(req.body);

        if(!result.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid request body",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const { title, description, userId } = result.data;

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

tasksRouter.get("/tasks/:id", async (req, res, next) => {
    try {
        const  result = taskIdParamsSchema.safeParse(req.params);

        if(!result.success) {
            return res.status(400).json({
            ok: false,
            message: "Invalid task id",
            errors: result.error.flatten().fieldErrors,
        });
       }

       const task = await prisma.task.findUnique({
        where: {
            id: result.data.id,
        }
       })

       if (!task) {
        return res.status(404).json({
            ok:false,
            message: "Task not found",
        });
       }

       return res.status(200).json({
        ok: true,
        data: task,
       })
    } catch (error) {
        return next(error);
    }
})

tasksRouter.delete("/tasks/:id", async (req, res, next) => {
    try {
        const result = taskIdParamsSchema.safeParse(req.params);

        if(!result.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid task id",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const existingTask = await prisma.task.findUnique({
            where: {
                id: result.data.id,
            }
        })

        if(!existingTask) {
            return res.status(404).json({
                ok: false,
                message: "Task not found",

            });
        }

        await prisma.task.delete({
            where: {
                id: result.data.id,
            }
        })

        return res.status(200).json({
            ok: true,
            message: "Task delete successfully"
        })
    } catch (error) {
        return next(error);
    }
})

tasksRouter.patch("/tasks/:id", async (req, res, next) => {
    try {
        const  paramsResult = taskIdParamsSchema.safeParse(req.params);

        if(!paramsResult.success) {
            return res.status(400).json({
                ok:false,
                message: "Invalid task id",
                errors: paramsResult.error.flatten().fieldErrors,
            })
        }

        const bodyResult = updateTaskStatusSchema.safeParse(req.body);

        if(!bodyResult.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid request body",
                errors: bodyResult.error.flatten().fieldErrors,
            })
        }

        const existingTask = await prisma.task.findUnique({
            where: {
                id: paramsResult.data.id,
            }
        })

        if(!existingTask) {
            return res.status(404).json({
                ok: false,
                message: "Task not found"
            });
        }

        const updateTask = await prisma.task.update({
            where: {
                id: paramsResult.data.id,
            },
            data: {
                isCompleted: bodyResult.data.isCompleted
            }
        });

        return res.status(200).json({
            ok: true,
            data: updateTask,
        })
    } catch (error) {
        next(error)
    }
})
export default tasksRouter;