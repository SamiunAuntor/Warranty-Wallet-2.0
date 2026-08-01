const express = require("express");

const env = require("../config/env");
const warrantyJob = require("../jobs/warranty.job");

const router = express.Router();

router.get("/warranty", async (req, res, next) => {
    try {
        const authorization = req.get("authorization");

        if (!env.CRON_SECRET || authorization !== `Bearer ${env.CRON_SECRET}`) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized cron request.",
            });
        }

        await warrantyJob.run();

        return res.status(200).json({
            success: true,
            message: "Warranty maintenance completed.",
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
