const { z } = require("zod");

const idSchema = z.object({
    params: z.object({
        id: z.string().cuid(),
    }),
});

const listUsersSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).optional(),

        limit: z.coerce.number().min(1).max(100).optional(),

        search: z.string().trim().optional(),

        role: z.enum([
            "USER",
            "ADMIN",
        ]).optional(),

        plan: z.enum([
            "FREE",
            "PREMIUM",
        ]).optional(),

        status: z.enum([
            "ACTIVE",
            "BLOCKED",
            "DELETED",
        ]).optional(),

        sortBy: z.enum([
            "createdAt",
            "name",
            "email",
        ]).optional(),

        sortOrder: z.enum([
            "asc",
            "desc",
        ]).optional(),
    }),
});

const listProductsSchema = z.object({
    query: z.object({

        page: z.coerce.number().min(1).optional(),

        limit: z.coerce.number().min(1).max(100).optional(),

        search: z.string().trim().optional(),

        status: z.enum([
            "ACTIVE",
            "EXPIRING_SOON",
            "EXPIRED",
        ]).optional(),

        categoryId: z.string().cuid().optional(),

        userId: z.string().cuid().optional(),

        sortBy: z.enum([
            "createdAt",
            "purchaseDate",
            "expiryDate",
            "purchasePrice",
        ]).optional(),

        sortOrder: z.enum([
            "asc",
            "desc",
        ]).optional(),
    }),
});

const listPaymentsSchema = z.object({
    query: z.object({

        page: z.coerce.number().min(1).optional(),

        limit: z.coerce.number().min(1).max(100).optional(),

        status: z.enum([
            "PENDING",
            "SUCCESS",
            "FAILED",
            "REFUNDED",
        ]).optional(),

        paymentMethod: z.enum([
            "STRIPE",
        ]).optional(),

        sortOrder: z.enum([
            "asc",
            "desc",
        ]).optional(),
    }),
});

const broadcastNotificationSchema = z.object({
    body: z.object({

        title: z.string()
            .trim()
            .min(3)
            .max(100),

        message: z.string()
            .trim()
            .min(5)
            .max(1000),

        type: z.enum([
            "SYSTEM",
        ]),

    }),
});

module.exports = {

    idSchema,

    listUsersSchema,

    listProductsSchema,

    listPaymentsSchema,

    broadcastNotificationSchema,

};