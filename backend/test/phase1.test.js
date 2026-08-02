const test = require("node:test");
const assert = require("node:assert/strict");

require("dotenv").config();

const categoryRepository = require("../src/modules/category/category.repository");
const productRepository = require("../src/modules/product/product.repository");
const productService = require("../src/modules/product/product.service");
const userRepository = require("../src/modules/user/user.repository");
const paymentRepository = require("../src/modules/payment/payment.repository");
const paymentService = require("../src/modules/payment/payment.service");
const stripe = require("../src/config/stripe");
const { PLAN_CONFIG } = require("../src/constants/plans");

const productPayload = {
    categoryId: "category-id",
    name: "Test asset",
    brand: "Test brand",
    purchasePrice: 100,
    purchaseDate: new Date("2026-01-01"),
    warrantyDuration: 12,
    warrantyType: "MANUFACTURER",
};

test("enforces the 5/100/500 asset limits", async (t) => {
    const originalFindCategory = categoryRepository.findById;
    const originalCountProducts = productRepository.countUserProducts;
    const originalCreateProduct = productRepository.create;
    const originalFindPreferences = userRepository.findPreferences;

    categoryRepository.findById = async () => ({ id: productPayload.categoryId });
    productRepository.create = async (payload) => payload;
    userRepository.findPreferences = async () => ({ warrantyReminders: true, reminderDays: [30, 7, 1] });

    t.after(() => {
        categoryRepository.findById = originalFindCategory;
        productRepository.countUserProducts = originalCountProducts;
        productRepository.create = originalCreateProduct;
        userRepository.findPreferences = originalFindPreferences;
    });

    for (const [plan, config] of Object.entries(PLAN_CONFIG)) {
        productRepository.countUserProducts = async () => config.assetLimit;

        await assert.rejects(
            productService.createProduct({ id: "user-id", plan }, productPayload),
            (error) =>
                error.statusCode === 403 &&
                error.message.includes(`${config.assetLimit} assets`)
        );

        productRepository.countUserProducts = async () => config.assetLimit - 1;
        const created = await productService.createProduct(
            { id: "user-id", plan },
            productPayload
        );

        assert.equal(created.userId, "user-id");
    }
});

test("builds correct Plus and Pro subscription checkout sessions", async (t) => {
    const originalCreateSession = stripe.checkout.sessions.create;
    const originalCreatePayment = paymentRepository.createPayment;
    const sessionRequests = [];
    const paymentRequests = [];

    stripe.checkout.sessions.create = async (request) => {
        sessionRequests.push(request);
        return {
            id: `session-${request.metadata.plan}`,
            url: `https://checkout.test/${request.metadata.plan}`,
        };
    };
    paymentRepository.createPayment = async (request) => {
        paymentRequests.push(request);
        return request;
    };

    t.after(() => {
        stripe.checkout.sessions.create = originalCreateSession;
        paymentRepository.createPayment = originalCreatePayment;
    });

    for (const plan of ["PLUS", "PRO"]) {
        const result = await paymentService.createCheckoutSession(
            {
                id: "user-id",
                email: "user@example.com",
                plan: "BASIC",
            },
            plan
        );
        const expected = PLAN_CONFIG[plan];
        const sessionRequest = sessionRequests.at(-1);
        const paymentRequest = paymentRequests.at(-1);

        assert.equal(result.url, `https://checkout.test/${plan}`);
        assert.equal(sessionRequest.mode, "subscription");
        assert.equal(sessionRequest.metadata.plan, plan);
        assert.equal(sessionRequest.subscription_data.metadata.plan, plan);
        assert.equal(sessionRequest.line_items[0].price_data.unit_amount, expected.price * 100);
        assert.equal(sessionRequest.line_items[0].price_data.recurring.interval, "month");
        assert.equal(paymentRequest.plan, plan);
        assert.equal(paymentRequest.amount, expected.price);
        assert.equal(paymentRequest.status, "PENDING");
    }

    await assert.rejects(
        paymentService.createCheckoutSession(
            {
                id: "user-id",
                email: "user@example.com",
                plan: "BASIC",
            },
            "BASIC"
        ),
        (error) => error.statusCode === 400
    );
});
