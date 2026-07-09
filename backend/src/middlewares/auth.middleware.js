const admin = require("../config/firebase");
const prisma = require("../config/prisma");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = await admin.auth().verifyIdToken(token);

        const user = await prisma.user.findUnique({
            where: {
                firebaseUid: decoded.uid,
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Account suspended",
            });
        }

        req.user = user;

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = authMiddleware;