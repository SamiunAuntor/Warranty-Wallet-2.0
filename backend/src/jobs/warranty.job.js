const productRepository = require("../modules/product/product.repository");
const notificationService = require("../modules/notification/notification.service");
const activityService = require("../modules/activity/activity.service");
const emailService = require("../services/email.service");
const warrantyReminderTemplate = require("../templates/warrantyReminder.template");

const startOfUtcDay = (value) => {
    const date = new Date(value);
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

const calendarDaysBetween = (from, to) =>
    Math.round((startOfUtcDay(to) - startOfUtcDay(from)) / 86400000);

const deliverReminder = async (product, daysRemaining) => {
    const notification = await notificationService.notifyWarrantyExpiry({ userId: product.userId, productId: product.id, productName: product.name, expiryDate: product.expiryDate, daysRemaining });
    if (product.user && !notification.emailSentAt) {
        await emailService.sendEmail({ to: product.user.email, subject: `Warranty expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`, html: warrantyReminderTemplate({ userName: product.user.name, productName: product.name, expiryDate: product.expiryDate.toDateString() }) });
        await notificationService.markReminderEmailSent(notification.id);
        await activityService.logActivity({ userId: product.userId, type: "PRODUCT_UPDATED", entity: "PRODUCT", entityId: product.id, title: "Warranty Reminder", description: `Warranty for "${product.name}" expires in ${daysRemaining} days.` });
    }
    return notification;
};

const processExpiringSoon = async () => {
    const today = new Date();
    const reminderWindow = new Date(today);
    reminderWindow.setDate(today.getDate() + 365);
    const products = await productRepository.findExpiringProducts(today, reminderWindow);

    for (const product of products) {
        try {
            const preferences = product.user?.preferences;
            const reminderDays = preferences?.reminderDays || [30, 14, 3];
            const daysRemaining = calendarDaysBetween(today, product.expiryDate);
            if (daysRemaining <= 30) await productRepository.updateWarrantyStatus(product.id, "EXPIRING_SOON");
            if (preferences?.warrantyReminders === false || !reminderDays.includes(daysRemaining)) continue;

            await deliverReminder(product, daysRemaining);
        } catch (error) {
            console.error(`Warranty reminder failed for product ${product.id}:`, error);
        }
    }
};

const processExpired = async () => {
    const products = await productRepository.findExpiredProducts(new Date());
    for (const product of products) {
        try {
            await productRepository.updateWarrantyStatus(product.id, "EXPIRED");
            if (product.user?.preferences?.warrantyReminders === false) continue;
            await notificationService.notifyWarrantyExpiry({ userId: product.userId, productId: product.id, productName: product.name, expiryDate: product.expiryDate, expired: true });
            await activityService.logActivity({ userId: product.userId, type: "PRODUCT_UPDATED", entity: "PRODUCT", entityId: product.id, title: "Warranty Expired", description: `Warranty for "${product.name}" has expired.` });
        } catch (error) {
            console.error(`Warranty expiry update failed for product ${product.id}:`, error);
        }
    }
};

const run = async () => { await processExpiringSoon(); await processExpired(); };
module.exports = { run, deliverReminder, calendarDaysBetween };
