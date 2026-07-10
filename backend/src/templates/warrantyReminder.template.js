const warrantyReminderTemplate = ({ userName, productName, expiryDate }) => {
    return `
    <div style="font-family:Arial">

        <h2>Warranty Reminder</h2>

        <p>Hello ${userName},</p>

        <p>Your warranty for
        <strong>${productName}</strong>
        will expire on
        <strong>${expiryDate}</strong>.</p>

        <p>Please renew your warranty if available.</p>

        <hr/>

        <small>
            WarrantyWallet
        </small>

    </div>
    `;
};

module.exports = warrantyReminderTemplate;