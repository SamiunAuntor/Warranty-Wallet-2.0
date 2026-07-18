const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const env = require("./env");

if (!env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is required.");
}

let serviceAccount;

try {
    const serviceAccountJson = Buffer.from(
        env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        "base64"
    ).toString("utf8");
    serviceAccount = JSON.parse(serviceAccountJson);
} catch {
    throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_BASE64 must be a valid Base64-encoded Firebase service-account JSON file."
    );
}

const app = getApps().length
    ? getApps()[0]
    : initializeApp({ credential: cert(serviceAccount) });

module.exports = {
    auth: () => getAuth(app),
};
