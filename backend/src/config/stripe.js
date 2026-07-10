const Stripe = require("stripe");

const env = require("./env");

module.exports = new Stripe(
    env.STRIPE_SECRET_KEY
);