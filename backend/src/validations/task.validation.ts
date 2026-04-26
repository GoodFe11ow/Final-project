import { z } from "zod";

export const createTaskSchema = z.object({
    title: z.string().trim().min(1, "title is required"),
    description: z.string().trim().min(1, "description cannot be empty").optional(),
    userId: z.string().trim().min(1, "userId is required"),
});

export const taskIdParamsSchema = z.object({
    id: z.string().trim().cuid("task id must be a valid cuid"),
});

export const updateTaskStatusSchema = z.object({
    isCompleted: z.boolean(),
})

export const getTasksQuerySchema = z.object({
    userId: z.string().trim().min(1, "userId is required").optional(),
    isCompleted: z
    .enum(["true", "false"])
    .transform((value)=> value === "true")
    .optional(),
})