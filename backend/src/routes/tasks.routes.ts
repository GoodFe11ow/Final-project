import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { createTaskSchema,
        taskIdParamsSchema,
        updateTaskSchema,
        getTasksQuerySchema,
        createSubtaskSchema,
        subtaskIdParamsSchema,
        updateSubtaskSchema
 } from "../validations/task.validation.js"

const tasksRouter = Router();


// GET ALL TASKS
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

//MAKE NEW TASK
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

//GET ONE TASK
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
        },
        include: {
            subtasks: true
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

//DELETE TASK
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

//UPDATE TASK
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

        const bodyResult = updateTaskSchema.safeParse(req.body);

        if(!bodyResult.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid request body",
                errors: bodyResult.error.flatten().fieldErrors,
            })
        }

        const { title, description, isCompleted } = bodyResult.data;

        if(
            title === undefined && 
            description === undefined &&
            isCompleted === undefined
        ) {
            return res.status(400).json({
                ok: false,
                message: "At least one field is required to update"
            });
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
                ...(title !== undefined ? {title} : {}),
                ...(description !== undefined ? { description } : {}),
                ...(isCompleted !== undefined ? { isCompleted } : {}),
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

//MAKE ONE SUBTASK
tasksRouter.post("/tasks/:id/subtasks", async (req, res, next) => {
    try {
        const paramsResult = taskIdParamsSchema.safeParse(req.params);

        if(!paramsResult.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid task id",
                errors: paramsResult.error.flatten().fieldErrors,
            });
        }

        const bodyResult = createSubtaskSchema.safeParse(req.body);

        if(!bodyResult.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid request body",
                errors: bodyResult.error.flatten().fieldErrors,
            });
        }

        const existingTask = await prisma.task.findUnique({
            where: {
                id: paramsResult.data.id,
            },
        });

        if(!existingTask) {
            return res.status(404).json({
                ok: false,
                message: "Task not found",
            });
        }

        const subtask = await prisma.subtasks.create({
            data: {
                title: bodyResult.data.title,
                taskId: paramsResult.data.id,
            },
        });

        return res.status(201).json({
            ok: true,
            data: subtask,
        });
    } catch (error) {
        return next(error);
    }
})

//UPDATE SUBTASK
tasksRouter.patch("/tasks/:taskId/subtasks/:subtaskId", async (req, res, next) => {
    try {
        const paramsResult = subtaskIdParamsSchema.safeParse(req.params);

        if(!paramsResult.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid params",
                errors: paramsResult.error.flatten().fieldErrors,
            });
        }

        const bodyResult = updateSubtaskSchema.safeParse(req.body);

        if(!bodyResult.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid request body",
                errors: bodyResult.error.flatten().fieldErrors,
            });
        }

        const { title, isCompleted } = bodyResult.data;

        if(title === undefined && isCompleted == undefined) {
            return res.status(400).json({
                ok: false,
                message: "At least one field required to update subtask"
            })
        }

        const existingTask = await prisma.task.findUnique({
            where: {
                id: paramsResult.data.taskId,
            },
        });

        if(!existingTask) {
            return res.status(404).json({
                ok: false,
                message: "Task not found",
            });
        }

        const existingSubtask = await prisma.subtasks.findUnique({
            where: {
                id: paramsResult.data.subtaskId,
            },
        });

        if (!existingSubtask || existingSubtask.taskId !== paramsResult.data.taskId) {
            return res.status(404).json({
                ok: false,
                message: "Subtask not found",
            });
        }

        const updatedSubtask = await prisma.subtasks.update({
            where: {
                id: paramsResult.data.subtaskId,
            },
            data: {
                ...(title !== undefined ? { title } : {}),
                ...(isCompleted !== undefined ? { isCompleted } : {}),
            },
        });

        return res.status(200).json({
            ok: true,
            data: updatedSubtask,
        })
    } catch (error) {
        return next(error);
    }
})

//DELETE SUBTASK
tasksRouter.delete("/tasks/:taskId/subtasks/:subtaskId", async (req, res, next) => {
    try {
    const paramsResult = subtaskIdParamsSchema.safeParse(req.params);

    if (!paramsResult.success) {
      return res.status(400).json({
        ok: false,
        message: "Invalid params",
        errors: paramsResult.error.flatten().fieldErrors,
      });
    }

    const existingTask = await prisma.task.findUnique({
      where: {
        id: paramsResult.data.taskId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        ok: false,
        message: "Task not found",
      });
    }

    const existingSubtask = await prisma.subtasks.findUnique({
      where: {
        id: paramsResult.data.subtaskId,
      },
    });

    if (!existingSubtask || existingSubtask.taskId !== paramsResult.data.taskId) {
      return res.status(404).json({
        ok: false,
        message: "Subtask not found",
      });
    }

    await prisma.subtasks.delete({
      where: {
        id: paramsResult.data.subtaskId,
      },
    });

    return res.status(200).json({
      ok: true,
      message: "Subtask deleted successfully",
    });
    } catch (error) {
        return next(error);
    }
})

//GET ONE SUBTASK
tasksRouter.get("/tasks/:taskId/subtasks/:subtaskId", async (req, res, next) => {
    try {
        const paramsResult = subtaskIdParamsSchema.safeParse(req.params);

        if(!paramsResult.success) {
            return res.status(400).json({
                ok: false,
                message: "Invalid params",
                errors: paramsResult.error.flatten().fieldErrors,
            });
        }

        const existingTask = await prisma.task.findUnique({
            where: {
                id: paramsResult.data.taskId,
            },
        });

        if(!existingTask) {
            return res.status(400).json({
                ok: false,
                message: "Task not found"
            });
        }

        const subtask = await prisma.subtasks.findUnique({
            where: {
                id: paramsResult.data.subtaskId,
            },
        });

        if(!subtask || subtask.taskId !== paramsResult.data.taskId) {
            return res.status(404).json({
                ok: false,
                message: "Subtask not found",
            });
        }

        return res.status(200).json({
            ok: true,
            data: subtask
        })
    } catch (error) {
        return next(error)
    }
})
export default tasksRouter;