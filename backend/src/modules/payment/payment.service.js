const stripe = require("../../config/stripe");
const prisma = require("../../config/prisma");

const paymentRepository = require("./payment.repository");

const notificationService = require("../notification/notification.service");
const activityService = require("../activity/activity.service");

const emailService = require("../../services/email.service");

const paymentTemplate = require("../../templates/paymentSuccess.template");

const ApiError = require("../../utils/ApiError");

const { pagination } = require("../../utils/query");

const { PREMIUM_PRICE, CURRENCY, } = require("./payment.constant");

const CLIENT_URL = process.env.CLIENT_URL;

const createCheckoutSession = async (user) => {
    if (user.plan === "PREMIUM") {

        throw new ApiError(
            400,
            "You already have Premium."
        );

    }

    const session = await stripe.checkout.sessions.create({

        mode: "payment",

        payment_method_types: [
            "card",
        ],

        customer_email:
            user.email,

        metadata: {
            userId: user.id,
        },

        line_items: [
            {
                quantity: 1,

                price_data: {

                    currency:
                        CURRENCY,

                    product_data: {

                        name:
                            "WarrantyWallet Premium",

                    },

                    unit_amount:
                        PREMIUM_PRICE *
                        100,

                },
            },
        ],

        success_url:
            `${CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
            `${CLIENT_URL}/payment/cancel`,
    });

    await paymentRepository.createPayment({

        userId: user.id,

        amount: PREMIUM_PRICE,

        currency: CURRENCY,

        stripeSessionId:
            session.id,

        paymentMethod:
            "STRIPE",

        status: "PENDING",
    });

    return {
        url: session.url,
    };
};


const handleWebhook = async (session) => {
    const payment = await paymentRepository.findPaymentBySessionId(
        session.id
    );

    if (!payment) {

        throw new ApiError(
            404,
            "Payment not found."
        );

    }

    if (
        payment.status ===
        "SUCCESS"
    ) {

        return;

    }

    await prisma.$transaction(
        async () => {

            await paymentRepository.updatePayment(
                payment.id,
                {
                    status:
                        "SUCCESS",

                    stripePaymentIntent:
                        session.payment_intent,
                }
            );

            const now =
                new Date();

            const expires =
                new Date();

            expires.setFullYear(
                now.getFullYear() + 1
            );

            const subscription =
                await paymentRepository.findSubscription(
                    payment.userId
                );

            if (
                subscription
            ) {

                await paymentRepository.updateSubscription(
                    payment.userId,
                    {
                        latestPaymentId:
                            payment.id,

                        plan:
                            "PREMIUM",

                        startsAt:
                            now,

                        expiresAt:
                            expires,

                        isActive:
                            true,
                    }
                );

            } else {

                await paymentRepository.createSubscription(
                    {

                        userId:
                            payment.userId,

                        latestPaymentId:
                            payment.id,

                        plan:
                            "PREMIUM",

                        startsAt:
                            now,

                        expiresAt:
                            expires,

                    }
                );

            }

            await paymentRepository.upgradeUserPlan(

                payment.userId,

                "PREMIUM"

            );

        }
    );


    await notificationService.notifyPaymentSuccess({

        userId:
            payment.userId,

        amount:
            PREMIUM_PRICE,

    });

    await activityService.logPaymentSuccess({

        userId:
            payment.userId,

        paymentId:
            payment.id,

        amount:
            PREMIUM_PRICE,

    });

    const user =
        payment.user;

    if (user) {

        await emailService.sendEmail({

            to:
                user.email,

            subject:
                "Premium Activated",

            html:
                paymentTemplate({

                    userName:
                        user.name,

                    amount:
                        PREMIUM_PRICE,

                }),

        });

    }

};

const getPaymentHistory = async (user, query) => {
    const {
        skip,
        take,
        page,
        limit,
    } = pagination(query);

    const payments =
        await paymentRepository.paymentHistory({

            userId:
                user.id,

            skip,

            take,

        });

    const total =
        await paymentRepository.paymentCount(

            user.id

        );

    return {

        data:
            payments,

        meta: {

            page,

            limit,

            total,

            totalPages:
                Math.ceil(
                    total /
                    limit
                ),

        },

    };

};

const getSubscription = async (userId) => {
    return paymentRepository.findSubscription(

        userId

    );

};

module.exports = {
    createCheckoutSession,
    handleWebhook,
    getPaymentHistory,
    getSubscription,
};