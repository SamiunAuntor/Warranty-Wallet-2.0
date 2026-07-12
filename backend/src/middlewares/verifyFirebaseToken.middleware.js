const admin = require("../config/firebase");

const verifyFirebaseToken = async (req, res, next) => {
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

        req.firebaseUser = decoded;

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = verifyFirebaseToken;
