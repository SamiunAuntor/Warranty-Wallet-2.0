const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");

const app = express();

const webhookRoutes = require("./routes/webhook.route");

app.use(helmet());

app.use(cors({
    origin: env.CLIENT_URL,
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

const routes = require("./routes");

app.use("/api/v1", routes);

const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/error.middleware");

app.use(notFound);

app.use(errorHandler);

module.exports = app;
