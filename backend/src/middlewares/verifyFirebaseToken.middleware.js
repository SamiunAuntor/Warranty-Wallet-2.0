const testIdentity = require("./integrationTestIdentity");

const verifyFirebaseToken = async (req, res, next) => {
    try {
        const testUser = testIdentity.fromRequest(req);
        if (testUser) {
            req.firebaseUser = testUser;
            return next();
        }

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
        const decoded = await admin.auth().verifyIdToken(token);

        req.firebaseUser = decoded;

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = verifyFirebaseToken;
