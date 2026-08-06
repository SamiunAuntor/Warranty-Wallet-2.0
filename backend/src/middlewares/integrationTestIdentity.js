const enabled = () => (
    process.env.NODE_ENV === "test"
    && process.env.ENABLE_TEST_AUTH === "true"
);

const fromRequest = (req) => {
    if (!enabled()) return null;

    const uid = req.headers["x-test-firebase-uid"];
    if (typeof uid !== "string" || !uid.trim()) return null;

    const emailHeader = req.headers["x-test-email"];
    const nameHeader = req.headers["x-test-name"];

    return {
        uid: uid.trim(),
        email: typeof emailHeader === "string" && emailHeader.trim()
            ? emailHeader.trim()
            : `${uid.trim()}@integration.test`,
        name: typeof nameHeader === "string" && nameHeader.trim()
            ? nameHeader.trim()
            : "Integration Test User",
        email_verified: true,
    };
};

module.exports = { enabled, fromRequest };
