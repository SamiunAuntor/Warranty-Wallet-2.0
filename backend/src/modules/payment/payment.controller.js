const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");

const stripe = require("../../config/stripe");
const env = require("../../config/env");

const paymentService = require("./payment.service");

const createCheckout = asyncHandler(async (req, res) => {
    const session = await paymentService.createCheckoutSession(
        req.user,
        req.body.plan
    );

    return res.status(201).json(

        new ApiResponse(

            201,

            "Checkout session created successfully.",

            session

        )

    );

});

const webhook = async (req, res) => {

    const signature = req.headers["stripe-signature"];

    let event;

    try {

        event =
            stripe.webhooks.constructEvent(

                req.body,

                signature,

                env.STRIPE_WEBHOOK_SECRET

            );

    } catch (error) {

        return res.status(400).send(
            `Webhook Error: ${error.message}`
        );

    }

    await paymentService.processStripeEvent(event);

    res.status(200).json({
        received: true,
    });

};

const paymentHistory = asyncHandler(async (req, res) => {
    const payments = await paymentService.getPaymentHistory(

        req.user,

        req.query

    );

    return res.status(200).json(

        new ApiResponse(

            200,

            "Payment history fetched successfully.",

            payments.data,

            payments.meta

        )

    );

});

const subscription = asyncHandler(async (req, res) => {

    const subscription = await paymentService.getSubscription(req.user);

    return res.status(200).json(

        new ApiResponse(

            200,

            "Subscription fetched successfully.",

            subscription

        )

    );

});

const confirmCheckout = asyncHandler(async (req, res) => {
    const result = await paymentService.confirmCheckoutSession(
        req.user,
        req.body.sessionId
    );

    return res.status(200).json(
        new ApiResponse(200, "Subscription activated successfully.", result)
    );
});

const plans = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            "Plans fetched successfully.",
            paymentService.getPlans()
        )
    );
});

const changePlan = asyncHandler(async (req, res) => {
    const result = await paymentService.changePlan(req.user, req.body.plan);
    return res.status(200).json(new ApiResponse(200, result.message, {
        subscription: result.subscription,
        paymentUrl: result.paymentUrl,
    }));
});

const cancelSubscription = asyncHandler(async (req, res) => {
    const result = await paymentService.cancelSubscription(req.user);
    return res.status(200).json(new ApiResponse(200, "Subscription will end after the current billing period.", result));
});

const resumeSubscription = asyncHandler(async (req, res) => {
    const result = await paymentService.resumeSubscription(req.user);
    return res.status(200).json(new ApiResponse(200, "Subscription renewed successfully.", result));
});

module.exports = {
    createCheckout,
    confirmCheckout,
    webhook,
    paymentHistory,
    subscription,
    plans,
    changePlan,
    cancelSubscription,
    resumeSubscription,
};
