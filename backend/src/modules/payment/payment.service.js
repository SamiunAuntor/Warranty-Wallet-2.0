const stripe = require("../../config/stripe");
const prisma = require("../../config/prisma");
const paymentRepository = require("./payment.repository");
const notificationService = require("../notification/notification.service");
const activityService = require("../activity/activity.service");
const emailService = require("../../services/email.service");
const paymentTemplate = require("../../templates/paymentSuccess.template");
const ApiError = require("../../utils/ApiError");
const { pagination } = require("../../utils/query");
const { PLAN, PLAN_CONFIG, PAID_PLANS } = require("../../constants/plans");
const { CURRENCY } = require("./payment.constant");

const CLIENT_URL = process.env.CLIENT_URL;

const stripeDate = (seconds) => (seconds ? new Date(seconds * 1000) : null);
const subscriptionItem = (subscription) => subscription.items?.data?.[0];
const periodStart = (subscription) =>
    subscription.current_period_start || subscriptionItem(subscription)?.current_period_start;
const periodEnd = (subscription) =>
    subscription.current_period_end || subscriptionItem(subscription)?.current_period_end;
const localStatus = (status) => ({
    active: "ACTIVE",
    trialing: "ACTIVE",
    incomplete: "INCOMPLETE",
    incomplete_expired: "EXPIRED",
    past_due: "PAST_DUE",
    unpaid: "PAST_DUE",
    canceled: "CANCELLED",
    paused: "EXPIRED",
}[status] || "EXPIRED");

const createCheckoutSession = async (user, plan) => {
    if (!PAID_PLANS.includes(plan)) {
        throw new ApiError(400, "Checkout is only available for Plus and Pro plans.");
    }
    if (user.plan === plan) {
        throw new ApiError(400, `You already have the ${PLAN_CONFIG[plan].name} plan.`);
    }
    if (PAID_PLANS.includes(user.plan)) {
        throw new ApiError(400, "Use the plan controls to change an active subscription.");
    }

    const selectedPlan = PLAN_CONFIG[plan];
    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: user.email,
        metadata: { userId: user.id, plan },
        subscription_data: { metadata: { userId: user.id, plan } },
        line_items: [{
            quantity: 1,
            price_data: {
                currency: CURRENCY,
                product_data: { name: `Warranty Wallet ${selectedPlan.name}` },
                recurring: { interval: "month" },
                unit_amount: selectedPlan.price * 100,
            },
        }],
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

const activateCheckout = async (session) => {
    const payment = await paymentRepository.findPaymentBySessionId(session.id);
    if (!payment) throw new ApiError(404, "Payment not found.");
    if (payment.status === "SUCCESS") return;

    const plan = session.metadata?.plan;
    if (!PAID_PLANS.includes(plan)) throw new ApiError(400, "Stripe session contains an invalid plan.");

    const stripeSubscription = session.subscription
        ? await stripe.subscriptions.retrieve(session.subscription)
        : null;
    const now = new Date();
    const fallbackEnd = new Date(now);
    fallbackEnd.setMonth(fallbackEnd.getMonth() + 1);
    const start = stripeDate(periodStart(stripeSubscription || {})) || now;
    const end = stripeDate(periodEnd(stripeSubscription || {})) || fallbackEnd;
    const priceId = subscriptionItem(stripeSubscription || {})?.price?.id || null;

    await prisma.$transaction(async (tx) => {
        await tx.payment.update({
            where: { id: payment.id },
            data: { status: "SUCCESS", stripePaymentIntent: session.payment_intent || null },
        });
        await tx.subscription.upsert({
            where: { userId: payment.userId },
            create: {
                userId: payment.userId,
                latestPaymentId: payment.id,
                stripeCustomerId: session.customer || null,
                stripeSubscriptionId: session.subscription || null,
                stripePriceId: priceId,
                plan,
                status: "ACTIVE",
                startsAt: start,
                expiresAt: end,
                currentPeriodStart: start,
                currentPeriodEnd: end,
                isActive: true,
            },
            update: {
                latestPaymentId: payment.id,
                stripeCustomerId: session.customer || null,
                stripeSubscriptionId: session.subscription || null,
                stripePriceId: priceId,
                plan,
                scheduledPlan: null,
                status: "ACTIVE",
                startsAt: start,
                expiresAt: end,
                currentPeriodStart: start,
                currentPeriodEnd: end,
                cancelAtPeriodEnd: false,
                cancelledAt: null,
                isActive: true,
            },
        });
        await tx.user.update({ where: { id: payment.userId }, data: { plan } });
    });

    const selectedPlan = PLAN_CONFIG[plan];
    await notificationService.notifyPaymentSuccess({ userId: payment.userId, amount: selectedPlan.price, planName: selectedPlan.name });
    await activityService.logPaymentSuccess({ userId: payment.userId, paymentId: payment.id, amount: selectedPlan.price });
    if (payment.user) {
        await emailService.sendEmail({
            to: payment.user.email,
            subject: `${selectedPlan.name} Plan Activated`,
            html: paymentTemplate({ userName: payment.user.name, amount: selectedPlan.price, planName: selectedPlan.name }),
        });
    }
};

// Kept as the checkout webhook entry point for compatibility with existing callers.
const handleWebhook = activateCheckout;

const confirmCheckoutSession = async (user, sessionId) => {
    const payment = await paymentRepository.findPaymentBySessionId(sessionId);
    if (!payment || payment.userId !== user.id) throw new ApiError(404, "Checkout session not found.");
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== "complete" || session.payment_status !== "paid") {
        throw new ApiError(409, "Payment has not completed yet.");
    }
    await activateCheckout(session);
    return {
        payment: await paymentRepository.findPaymentBySessionId(sessionId),
        subscription: await paymentRepository.findSubscription(user.id),
    };
};

const createPlanPrice = async (stripeSubscription, plan) => {
    const item = subscriptionItem(stripeSubscription);
    if (!item) throw new ApiError(409, "Stripe subscription has no billable item.");
    const product = typeof item.price.product === "string" ? item.price.product : item.price.product.id;
    return stripe.prices.create({
        currency: CURRENCY,
        unit_amount: PLAN_CONFIG[plan].price * 100,
        recurring: { interval: "month" },
        product,
        nickname: `Warranty Wallet ${PLAN_CONFIG[plan].name}`,
        metadata: { plan },
    });
};

const changePlan = async (user, targetPlan) => {
    const local = await paymentRepository.findSubscription(user.id);
    if (!local?.stripeSubscriptionId || !local.isActive) {
        throw new ApiError(409, "No active paid subscription was found.");
    }
    if (local.plan === targetPlan && !local.scheduledPlan) {
        throw new ApiError(400, `You already have the ${PLAN_CONFIG[targetPlan].name} plan.`);
    }

    const remote = await stripe.subscriptions.retrieve(local.stripeSubscriptionId);
    const item = subscriptionItem(remote);
    const price = await createPlanPrice(remote, targetPlan);
    const isUpgrade = PLAN_CONFIG[targetPlan].price > PLAN_CONFIG[local.plan].price;

    if (isUpgrade) {
        const updated = await stripe.subscriptions.update(remote.id, {
            items: [{ id: item.id, price: price.id }],
            proration_behavior: "always_invoice",
            payment_behavior: "error_if_incomplete",
            cancel_at_period_end: false,
            metadata: { ...remote.metadata, plan: targetPlan, scheduledPlan: "" },
        });
        const start = stripeDate(periodStart(updated));
        const end = stripeDate(periodEnd(updated));
        await prisma.$transaction([
            prisma.subscription.update({
                where: { userId: user.id },
                data: {
                    plan: targetPlan,
                    scheduledPlan: null,
                    stripePriceId: price.id,
                    status: localStatus(updated.status),
                    currentPeriodStart: start,
                    currentPeriodEnd: end,
                    expiresAt: end || local.expiresAt,
                    cancelAtPeriodEnd: false,
                    cancelledAt: null,
                    isActive: ["active", "trialing", "past_due"].includes(updated.status),
                },
            }),
            prisma.user.update({ where: { id: user.id }, data: { plan: targetPlan } }),
        ]);
        return { message: `${PLAN_CONFIG[targetPlan].name} is active now. Stripe applied any prorated charge.`, subscription: await paymentRepository.findSubscription(user.id) };
    }

    await stripe.subscriptions.update(remote.id, {
        items: [{ id: item.id, price: price.id }],
        proration_behavior: "none",
        cancel_at_period_end: false,
        metadata: { ...remote.metadata, plan: targetPlan, scheduledPlan: targetPlan, effectivePlan: local.plan },
    });
    await paymentRepository.updateSubscription(user.id, {
        scheduledPlan: targetPlan,
        stripePriceId: price.id,
        cancelAtPeriodEnd: false,
        cancelledAt: null,
    });
    return { message: `${PLAN_CONFIG[targetPlan].name} is scheduled for your next billing date.`, subscription: await paymentRepository.findSubscription(user.id) };
};

const cancelSubscription = async (user) => {
    const local = await paymentRepository.findSubscription(user.id);
    if (!local?.stripeSubscriptionId || !local.isActive) throw new ApiError(409, "No active paid subscription was found.");
    const remote = await stripe.subscriptions.update(local.stripeSubscriptionId, {
        cancel_at_period_end: true,
        metadata: { plan: local.plan, scheduledPlan: PLAN.BASIC, effectivePlan: local.plan },
    });
    return paymentRepository.updateSubscription(user.id, {
        scheduledPlan: PLAN.BASIC,
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
        currentPeriodEnd: stripeDate(periodEnd(remote)) || local.currentPeriodEnd,
    });
};

const resumeSubscription = async (user) => {
    const local = await paymentRepository.findSubscription(user.id);
    if (!local?.stripeSubscriptionId || !local.scheduledPlan) throw new ApiError(409, "No pending plan change was found.");
    const remote = await stripe.subscriptions.retrieve(local.stripeSubscriptionId);
    const item = subscriptionItem(remote);
    const price = await createPlanPrice(remote, local.plan);
    await stripe.subscriptions.update(local.stripeSubscriptionId, {
        items: [{ id: item.id, price: price.id }],
        proration_behavior: "none",
        cancel_at_period_end: false,
        metadata: { plan: local.plan, scheduledPlan: "", effectivePlan: local.plan },
    });
    return paymentRepository.updateSubscription(user.id, {
        scheduledPlan: null,
        stripePriceId: price.id,
        cancelAtPeriodEnd: false,
        cancelledAt: null,
    });
};

const synchronizeSubscription = async (remote, { renewal = false } = {}) => {
    const local = await paymentRepository.findSubscriptionByStripeId(remote.id);
    if (!local) return;
    const status = localStatus(remote.status);
    const start = stripeDate(periodStart(remote));
    const end = stripeDate(periodEnd(remote));
    const ended = status === "CANCELLED" || status === "EXPIRED";
    const renewalPlan = renewal && local.scheduledPlan ? local.scheduledPlan : null;
    const effectivePlan = ended ? PLAN.BASIC : (renewalPlan || local.plan);

    await prisma.$transaction([
        prisma.subscription.update({
            where: { id: local.id },
            data: {
                plan: effectivePlan,
                scheduledPlan: renewalPlan || ended ? null : local.scheduledPlan,
                status,
                stripePriceId: subscriptionItem(remote)?.price?.id || local.stripePriceId,
                currentPeriodStart: start,
                currentPeriodEnd: end,
                expiresAt: end || local.expiresAt,
                cancelAtPeriodEnd: Boolean(remote.cancel_at_period_end),
                cancelledAt: remote.canceled_at ? stripeDate(remote.canceled_at) : local.cancelledAt,
                isActive: !ended,
            },
        }),
        prisma.user.update({ where: { id: local.userId }, data: { plan: effectivePlan } }),
    ]);
};

const handleInvoicePaid = async (invoice) => {
    const invoiceSubscription = invoice.subscription || invoice.parent?.subscription_details?.subscription;
    const subscriptionId = typeof invoiceSubscription === "string" ? invoiceSubscription : invoiceSubscription?.id;
    if (!subscriptionId) return;
    const remote = await stripe.subscriptions.retrieve(subscriptionId);
    await synchronizeSubscription(remote, { renewal: invoice.billing_reason === "subscription_cycle" });
    const local = await paymentRepository.findSubscriptionByStripeId(subscriptionId);
    if (local?.scheduledPlan && invoice.billing_reason === "subscription_cycle") {
        await stripe.subscriptions.update(subscriptionId, {
            metadata: { plan: local.plan, scheduledPlan: "", effectivePlan: local.plan },
        });
    }
};

const handleInvoiceFailed = async (invoice) => {
    const invoiceSubscription = invoice.subscription || invoice.parent?.subscription_details?.subscription;
    const subscriptionId = typeof invoiceSubscription === "string" ? invoiceSubscription : invoiceSubscription?.id;
    if (!subscriptionId) return;
    const local = await paymentRepository.findSubscriptionByStripeId(subscriptionId);
    if (local) await paymentRepository.updateSubscription(local.userId, { status: "PAST_DUE", isActive: true });
};

const processStripeEvent = async (event) => {
    const previous = await paymentRepository.findWebhookEvent(event.id);
    if (previous?.processed) return;
    if (!previous) {
        await paymentRepository.createWebhookEvent({ stripeEventId: event.id, eventType: event.type, payload: event });
    }

    switch (event.type) {
        case "checkout.session.completed":
            await activateCheckout(event.data.object);
            break;
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
            await synchronizeSubscription(event.data.object);
            break;
        case "invoice.paid":
            await handleInvoicePaid(event.data.object);
            break;
        case "invoice.payment_failed":
            await handleInvoiceFailed(event.data.object);
            break;
        case "charge.refunded":
            if (event.data.object.payment_intent) {
                await prisma.payment.updateMany({ where: { stripePaymentIntent: event.data.object.payment_intent }, data: { status: "REFUNDED" } });
            }
            break;
        default:
            break;
    }
    await paymentRepository.markWebhookEventProcessed(event.id);
};

const getPaymentHistory = async (user, query) => {
    const { skip, take, page, limit } = pagination(query);
    const payments = await paymentRepository.paymentHistory({ userId: user.id, skip, take });
    const total = await paymentRepository.paymentCount(user.id);
    return { data: payments, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getSubscription = async (user) => {
    const pendingPayment = await paymentRepository.findLatestPendingPayment(user.id);
    if (pendingPayment) {
        try {
            const session = await stripe.checkout.sessions.retrieve(pendingPayment.stripeSessionId);
            if (session.status === "complete" && session.payment_status === "paid") await activateCheckout(session);
        } catch (error) {
            console.error("Pending checkout reconciliation failed:", error.message);
        }
    }
    const local = await paymentRepository.findSubscription(user.id);
    if (local?.stripeSubscriptionId) {
        try {
            const remote = await stripe.subscriptions.retrieve(local.stripeSubscriptionId);
            await synchronizeSubscription(remote);
        } catch (error) {
            console.error("Subscription reconciliation failed:", error.message);
        }
    }
    return paymentRepository.findSubscription(user.id);
};

const getPlans = () => Object.entries(PLAN_CONFIG).map(([id, config]) => ({ id, ...config }));

module.exports = {
    createCheckoutSession,
    confirmCheckoutSession,
    handleWebhook,
    processStripeEvent,
    changePlan,
    cancelSubscription,
    resumeSubscription,
    getPaymentHistory,
    getSubscription,
    getPlans,
};
