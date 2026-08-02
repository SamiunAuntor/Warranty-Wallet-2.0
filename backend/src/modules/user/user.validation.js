const { z } = require("zod");

const syncUserSchema = z.object({ body: z.object({ name: z.string().min(2), photoURL: z.string().url().optional() }) });
const updateProfileSchema = z.object({ body: z.object({ name: z.string().trim().min(2).max(100).optional(), phone: z.string().trim().min(7).max(30).nullable().optional() }).refine((body) => Object.keys(body).length > 0, "At least one field is required.") });
const updatePreferencesSchema = z.object({
    body: z.object({
        warrantyReminders: z.boolean().optional(),
        claimUpdates: z.boolean().optional(),
        reminderDays: z.array(z.number().int().min(1).max(365)).min(1).max(5).transform((days) => [...new Set(days)].sort((a, b) => b - a)).optional(),
        timezone: z.string().trim().min(1).max(100).refine((value) => { try { Intl.DateTimeFormat("en-US", { timeZone: value }); return true; } catch { return false; } }, "Choose a valid IANA timezone.").optional(),
        currency: z.enum(["USD", "BDT", "EUR", "GBP", "CAD", "AUD"]).optional(),
        dateFormat: z.enum(["MMM_D_YYYY", "DD_MM_YYYY", "MM_DD_YYYY"]).optional(),
    }).refine((body) => Object.keys(body).length > 0, "At least one preference is required."),
});

module.exports = { syncUserSchema, updateProfileSchema, updatePreferencesSchema };
