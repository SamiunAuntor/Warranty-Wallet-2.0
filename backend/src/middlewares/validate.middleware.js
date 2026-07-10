module.exports = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

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