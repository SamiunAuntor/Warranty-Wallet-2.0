const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const routes = require("./routes");

const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(compression());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Server Running",
    });
});

app.use("/api/v1", routes);

app.use(notFound);

app.use(errorHandler);

module.exports = app;