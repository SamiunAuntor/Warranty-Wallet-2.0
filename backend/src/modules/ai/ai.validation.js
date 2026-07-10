const { z } = require("zod");

const extractInvoiceSchema = z.object({
    file: z.any(),
});

module.exports = {
    extractInvoiceSchema,
};