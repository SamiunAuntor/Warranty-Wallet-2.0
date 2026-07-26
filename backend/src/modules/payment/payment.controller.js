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

    switch (event.type) {

        case "checkout.session.completed":

            await paymentService.handleWebhook(

                event.data.object

            );

            break;

        default:

            console.log(
                `Unhandled event ${event.type}`
            );

    }

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

    const subscription = await paymentService.getSubscription(
        req.user.id
    );

    return res.status(200).json(

        new ApiResponse(

            200,

            "Subscription fetched successfully.",

            subscription

        )

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

module.exports = {
    createCheckout,
    webhook,
    paymentHistory,
    subscription,
    plans,
};
