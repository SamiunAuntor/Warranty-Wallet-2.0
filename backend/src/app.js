const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");

const app = express();

app.set("trust proxy", 1);

const webhookRoutes = require("./routes/webhook.route");

app.use(helmet());

const allowedOrigins = (env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
}));

app.use(compression());

app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.use("/api/v1/webhooks", webhookRoutes);

app.use(express.json());

app.use(express.urlencoded({
    extended: true,
}));

app.use(cookieParser());

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Warranty Wallet API is healthy.",
        environment: env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
    });
});

const cronRoutes = require("./routes/cron.route");

app.use("/api/v1/cron", cronRoutes);

const routes = require("./routes");

app.use("/api/v1", routes);

const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/error.middleware");

app.use(notFound);

app.use(errorHandler);

module.exports = app;
