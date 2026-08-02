const express = require("express");

const warrantyJob = require("../jobs/warranty.job");

const router = express.Router();

router.get("/warranty", async (req, res, next) => {
    try {
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
