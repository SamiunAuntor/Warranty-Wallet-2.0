const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const warrantyReminderTemplate = ({ userName, productName, brand, category, expiryDate, daysRemaining, dashboardUrl }) => {
    const safe = {
        userName: escapeHtml(userName), productName: escapeHtml(productName), brand: escapeHtml(brand || "Not specified"),
        category: escapeHtml(category || "Not specified"), expiryDate: escapeHtml(expiryDate), daysRemaining: escapeHtml(daysRemaining),
        dashboardUrl: escapeHtml(dashboardUrl),
    };

    return `<!doctype html>
<html><body style="margin:0;background:#f5f6fc;font-family:Arial,sans-serif;color:#172033">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f6fc;padding:32px 12px"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e1e3ec;border-radius:16px;overflow:hidden">
      <tr><td align="center" style="background:#5947e8;padding:34px 24px;color:#ffffff"><div style="font-size:32px;line-height:1">⚠️</div><h1 style="margin:12px 0 0;font-size:28px">Warranty Expiring Soon</h1></td></tr>
      <tr><td style="padding:34px 32px">
        <p style="margin:0 0 18px;font-size:16px">Hello ${safe.userName},</p>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#535a68">Your asset warranty is approaching its expiration date. Review the information below and take any necessary action before coverage ends.</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f7fc;border-left:5px solid #5947e8;border-radius:10px"><tr><td style="padding:24px">
          <h2 style="margin:0 0 18px;font-size:23px">${safe.productName}</h2>
          <p style="margin:0 0 10px;color:#565d6c"><strong>Brand:</strong> ${safe.brand}</p>
          <p style="margin:0 0 10px;color:#565d6c"><strong>Category:</strong> ${safe.category}</p>
          <p style="margin:0 0 10px;color:#565d6c"><strong>Expiry date:</strong> ${safe.expiryDate}</p>
          <p style="margin:0;color:#565d6c"><strong>Days remaining:</strong> ${safe.daysRemaining} day${Number(daysRemaining) === 1 ? "" : "s"}</p>
        </td></tr></table>
        <div style="margin:22px 0;background:#fff8df;border:1px solid #f0cc65;border-radius:10px;padding:16px;color:#634d12;line-height:1.5"><strong>Action recommended:</strong> Check the product condition and submit any necessary claim before the warranty expires.</div>
        <div style="text-align:center;padding:18px 0 8px"><a href="${safe.dashboardUrl}" style="display:inline-block;background:#5947e8;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:9px;padding:14px 24px">View Asset Details</a></div>
        <p style="margin:24px 0 0;color:#656b77">Thank you for using <strong>Warranty Wallet</strong>.</p>
      </td></tr>
      <tr><td align="center" style="border-top:1px solid #eceef4;padding:20px;color:#858a95;font-size:12px">This is an automated warranty reminder from Warranty Wallet.</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
};

module.exports = warrantyReminderTemplate;
