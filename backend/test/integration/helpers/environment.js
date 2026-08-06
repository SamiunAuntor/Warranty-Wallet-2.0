const assertSafeTestDatabase = (value) => {
    if (!value) {
        throw new Error("TEST_DATABASE_URL is required for integration tests.");
    }

    let url;
    try {
        url = new URL(value);
    } catch {
        throw new Error("TEST_DATABASE_URL must be a valid PostgreSQL URL.");
    }

    if (!url.protocol.startsWith("postgres")) {
        throw new Error("Integration tests require PostgreSQL.");
    }

    const databaseName = url.pathname.replace(/^\//, "").toLowerCase();
    if (!databaseName.includes("test")) {
        throw new Error(
            `Refusing to use database "${databaseName}" because its name does not contain "test".`,
        );
    }

    return value;
};

const integrationEnabled = () => Boolean(process.env.TEST_DATABASE_URL);

const configureIntegrationEnvironment = () => {
    const databaseUrl = assertSafeTestDatabase(process.env.TEST_DATABASE_URL);
    process.env.NODE_ENV = "test";
    process.env.ENABLE_TEST_AUTH = "true";
    process.env.DATABASE_URL = databaseUrl;
    process.env.CLIENT_URL = "http://localhost:3000";
    process.env.STRIPE_SECRET_KEY ||= "sk_test_integration_placeholder";
    process.env.GEMINI_API_KEY ||= "integration-placeholder";
    return databaseUrl;
};

module.exports = {
    assertSafeTestDatabase,
    configureIntegrationEnvironment,
    integrationEnabled,
};
