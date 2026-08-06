const startTestServer = async (app) => {
    const server = await new Promise((resolve, reject) => {
        const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
        instance.once("error", reject);
    });

    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;

    const close = () => new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
    });

    const request = async (path, options = {}) => {
        const { uid, email, name, headers, ...init } = options;
        const requestHeaders = new Headers(headers);
        if (uid) requestHeaders.set("x-test-firebase-uid", uid);
        if (email) requestHeaders.set("x-test-email", email);
        if (name) requestHeaders.set("x-test-name", name);
        if (init.body && typeof init.body === "string" && !requestHeaders.has("content-type")) {
            requestHeaders.set("content-type", "application/json");
        }

        const response = await fetch(`${baseUrl}${path}`, { ...init, headers: requestHeaders });
        const contentType = response.headers.get("content-type") || "";
        const body = contentType.includes("application/json")
            ? await response.json()
            : await response.arrayBuffer();
        return { response, body };
    };

    return { baseUrl, close, request };
};

module.exports = { startTestServer };
