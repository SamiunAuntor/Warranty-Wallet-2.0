const stripe = require("../../config/stripe");
const prisma = require("../../config/prisma");
const paymentRepository = require("./payment.repository");
const notificationService = require("../notification/notification.service");
const activityService = require("../activity/activity.service");
const emailService = require("../../services/email.service");
const paymentTemplate = require("../../templates/paymentSuccess.template");
const ApiError = require("../../utils/ApiError");
const { pagination } = require("../../utils/query");
const { PLAN_CONFIG, PAID_PLANS } = require("../../constants/plans");
const { CURRENCY } = require("./payment.constant");

const CLIENT_URL = process.env.CLIENT_URL;

const createCheckoutSession = async (user, plan) => {
    if (!PAID_PLANS.includes(plan)) {
        throw new ApiError(400, "Checkout is only available for Plus and Pro plans.");
    }

    if (user.plan === plan) {
        throw new ApiError(400, `You already have the ${PLAN_CONFIG[plan].name} plan.`);
    }

    if (PAID_PLANS.includes(user.plan)) {
        throw new ApiError(
            400,
            "Plan changes for active subscriptions are not available through checkout."
        );
    }

    const selectedPlan = PLAN_CONFIG[plan];
    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: user.email,
        metadata: {
            userId: user.id,
            plan,
        },
        subscription_data: {
            metadata: {
                userId: user.id,
                plan,
            },
        },
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: CURRENCY,
                    product_data: {
                        name: `Warranty Wallet ${selectedPlan.name}`,
                    },
                    recurring: {
                        interval: "month",
                    },
                    unit_amount: selectedPlan.price * 100,
                },
            },
        ],
        success_url: `${CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${CLIENT_URL}/payment/cancel`,
    });

    await paymentRepository.createPayment({
        userId: user.id,
        amount: selectedPlan.price,
        currency: CURRENCY,
        stripeSessionId: session.id,
        paymentMethod: "STRIPE",
        plan,
        status: "PENDING",
    });

    return { url: session.url };
};

const handleWebhook = async (session) => {
    const payment = await paymentRepository.findPaymentBySessionId(session.id);

    if (!payment) {
        throw new ApiError(404, "Payment not found.");
    }

    if (payment.status === "SUCCESS") return;

    const plan = session.metadata?.plan;
    if (!PAID_PLANS.includes(plan)) {
        throw new ApiError(400, "Stripe session contains an invalid plan.");
    }

    const selectedPlan = PLAN_CONFIG[plan];
    const now = new Date();
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + 1);

    await prisma.$transaction(async (tx) => {
        await tx.payment.update({
            where: { id: payment.id },
            data: {
                status: "SUCCESS",
                stripePaymentIntent: session.payment_intent || null,
            },
        });

        const subscription = await tx.subscription.findUnique({
            where: { userId: payment.userId },
        });
        const subscriptionPayload = {
            latestPaymentId: payment.id,
            stripeCustomerId: session.customer || null,
            stripeSubscriptionId: session.subscription || null,
            plan,
            status: "ACTIVE",
            startsAt: now,
            expiresAt: expires,
            isActive: true,
        };

        if (subscription) {
            await tx.subscription.update({
                where: { userId: payment.userId },
                data: subscriptionPayload,
            });
        } else {
            await tx.subscription.create({
                data: {
                    userId: payment.userId,
                    ...subscriptionPayload,
                },
            });
        }

        await tx.user.update({
            where: { id: payment.userId },
            data: { plan },
        });
    });

    await notificationService.notifyPaymentSuccess({
        userId: payment.userId,
        amount: selectedPlan.price,
        planName: selectedPlan.name,
    });

    await activityService.logPaymentSuccess({
        userId: payment.userId,
        paymentId: payment.id,
        amount: selectedPlan.price,
    });

    if (payment.user) {
        await emailService.sendEmail({
            to: payment.user.email,
            subject: `${selectedPlan.name} Plan Activated`,
            html: paymentTemplate({
                userName: payment.user.name,
                amount: selectedPlan.price,
                planName: selectedPlan.name,
            }),
        });
    }
};

const confirmCheckoutSession = async (user, sessionId) => {
    const payment = await paymentRepository.findPaymentBySessionId(sessionId);

    if (!payment || payment.userId !== user.id) {
        throw new ApiError(404, "Checkout session not found.");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== "complete" || session.payment_status !== "paid") {
        throw new ApiError(409, "Payment has not completed yet.");
    }

    await handleWebhook(session);

    return {
        payment: await paymentRepository.findPaymentBySessionId(sessionId),
        subscription: await paymentRepository.findSubscription(user.id),
    };
};

const getPaymentHistory = async (user, query) => {
    const { skip, take, page, limit } = pagination(query);
    const payments = await paymentRepository.paymentHistory({ userId: user.id, skip, take });
    const total = await paymentRepository.paymentCount(user.id);

    return {
        data: payments,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getSubscription = async (user) => {
    const pendingPayment = await paymentRepository.findLatestPendingPayment(user.id);

    if (pendingPayment) {
        try {
            const session = await stripe.checkout.sessions.retrieve(
                pendingPayment.stripeSessionId
            );
            if (session.status === "complete" && session.payment_status === "paid") {
                await handleWebhook(session);
            }
        } catch (error) {
            console.error("Pending checkout reconciliation failed:", error.message);
        }
    }

    return paymentRepository.findSubscription(user.id);
};

const getPlans = () =>
    Object.entries(PLAN_CONFIG).map(([id, config]) => ({
        id,
        ...config,
    }));

module.exports = {
    createCheckoutSession,
    confirmCheckoutSession,
    handleWebhook,
    getPaymentHistory,
    getSubscription,
    getPlans,
};
