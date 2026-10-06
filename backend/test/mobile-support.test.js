const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
require("dotenv").config();

const { checkoutSchema, mobileReturnSchema } = require("../src/modules/payment/payment.validation");

// user.service loads the Firebase Admin config, which needs real credentials.
// Replace it with a stub so the sync rules can be tested in isolation.
const firebaseConfigPath = path.resolve(__dirname, "../src/config/firebase.js");
require.cache[firebaseConfigPath] = {
    id: firebaseConfigPath,
    filename: firebaseConfigPath,
    loaded: true,
    exports: { auth: () => ({}) },
};
const userRepository = require("../src/modules/user/user.repository");
const userService = require("../src/modules/user/user.service");

test("checkout accepts app deep links as a return URL", () => {
    for (const returnUrl of ["warrantywallet://payment-return", "exp://192.168.0.5:8081/--/payment-return"]) {
        assert.equal(checkoutSchema.safeParse({ body: { plan: "PLUS", returnUrl } }).success, true);
    }
    assert.equal(checkoutSchema.safeParse({ body: { plan: "PRO" } }).success, true);
});

test("checkout rejects web return URLs so the redirect cannot be abused", () => {
    const result = checkoutSchema.safeParse({ body: { plan: "PLUS", returnUrl: "https://evil.example/steal" } });
    assert.equal(result.success, false);
    assert.equal(
        mobileReturnSchema.safeParse({ query: { status: "success", redirect: "javascript:alert(1)" } }).success,
        false,
    );
});

test("the mobile return endpoint redirects to the app with the session id", () => {
    const controller = require("../src/modules/payment/payment.controller");
    let redirect;
    controller.mobileReturn(
        { query: { status: "success", session_id: "cs_test_1", redirect: "warrantywallet://payment-return" } },
        { redirect: (status, url) => { redirect = { status, url }; } },
    );
    assert.equal(redirect.status, 302);
    assert.equal(redirect.url, "warrantywallet://payment-return?status=success&session_id=cs_test_1");
});

test("sync keeps a name the user chose", async (t) => {
    const find = userRepository.findByFirebaseUid;
    const sync = userRepository.syncUser;
    let saved;
    userRepository.findByFirebaseUid = async () => ({ name: "Ada Lovelace", avatarSource: "NONE" });
    userRepository.syncUser = async (payload) => { saved = payload; return payload; };
    t.after(() => { userRepository.findByFirebaseUid = find; userRepository.syncUser = sync; });

    await userService.syncUser({ uid: "uid-1", email: "ada@example.com" }, { name: "ada" });
    assert.equal(saved.name, "Ada Lovelace");
});

test("sync replaces the generated email-prefix name during registration", async (t) => {
    const find = userRepository.findByFirebaseUid;
    const sync = userRepository.syncUser;
    let saved;
    userRepository.findByFirebaseUid = async () => ({ name: "ada", avatarSource: "NONE" });
    userRepository.syncUser = async (payload) => { saved = payload; return payload; };
    t.after(() => { userRepository.findByFirebaseUid = find; userRepository.syncUser = sync; });

    await userService.syncUser({ uid: "uid-1", email: "ada@example.com" }, { name: "Ada Lovelace" });
    assert.equal(saved.name, "Ada Lovelace");
});
