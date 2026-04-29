import type { Prisma } from "../generated/prisma/client.js";

export const publicUserSelect = {
    id: true,
    name: true,
    email: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.UserSelect;