const paymentSuccessTemplate = ({ userName, amount, }) => {
    return `
        <h2>Payment Successful</h2>

        <p>Hello ${userName},</p>

        <p>

        Your Premium subscription payment of

        <strong>$${amount}</strong>

        was successful.

        </p>

        <p>

        Thank you for supporting WarrantyWallet.

        </p>

    `;

};

module.exports = paymentSuccessTemplate;