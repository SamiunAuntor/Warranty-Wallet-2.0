const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const app = express();

// Security
app.use(helmet());

// Compression
app.use(compression());

// CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

// Logger
app.use(morgan("dev"));

// Body Parser
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Health Check

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "WarrantyWallet API is running",
    });
});

module.exports = app;