module.exports = (schema) => {
    return async (req, res, next) => {
        try {
            const validated = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            // Zod coercions and transforms only exist on the parsed result.
            // Pass that normalized data downstream instead of retaining the
            // original strings supplied by Express.
            if (validated.body !== undefined) req.body = validated.body;
            if (validated.params !== undefined) req.params = validated.params;

            // Express 5 exposes req.query through a getter. Mutate the existing
            // object instead of assigning to the property directly.
            if (validated.query !== undefined) {
                for (const key of Object.keys(req.query)) delete req.query[key];
                Object.assign(req.query, validated.query);
            }

            next();
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Validation Failed",
                errors: error.errors,
            });
        }
    };
};
