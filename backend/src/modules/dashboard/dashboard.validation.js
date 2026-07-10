const { z } = require("zod");

const dashboardSchema = z.object({

    query: z.object({

        range: z
            .enum([
                "WEEK",
                "MONTH",
                "YEAR",
            ])
            .optional(),

    }),

});

module.exports = {

    dashboardSchema,

};