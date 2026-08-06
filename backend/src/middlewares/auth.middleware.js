const prisma = require("../config/prisma");
const testIdentity = require("./integrationTestIdentity");

const authMiddleware = async (req, res, next) => {
    try {
        const testUser = testIdentity.fromRequest(req);
        let decoded;

        if (testUser) {
            decoded = testUser;
        } else {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    success: false,
                    code: "UNAUTHORIZED",
                    message: "Unauthorized",
                });
            }

            const token = authHeader.split(" ")[1];
            const admin = require("../config/firebase");
            decoded = await admin.auth().verifyIdToken(token);
        }

        const user = await prisma.user.findUnique({
            where: {
                firebaseUid: decoded.uid,
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                code: "USER_NOT_FOUND",
                message: "User not found",
            });
        }

        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                code: "ACCOUNT_SUSPENDED",
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
