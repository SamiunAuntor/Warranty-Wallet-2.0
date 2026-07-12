const productRepository = require("../modules/product/product.repository");

const notificationService = require("../modules/notification/notification.service");

const activityService = require("../modules/activity/activity.service");

const emailService = require("../services/email.service");

const warrantyReminderTemplate = require("../templates/warrantyReminder.template");

const processExpiringSoon = async () => {
    const today = new Date();

    const next30Days = new Date();

    next30Days.setDate(today.getDate() + 30);

    const products =
        await productRepository.findExpiringProducts(
            today,
            next30Days
        );

    for (const product of products) {

        try {

            await productRepository.updateStatus(
                product.id,
                "EXPIRING_SOON"
            );

            await notificationService.notifyWarrantyExpiry({

                userId: product.userId,

                productId: product.id,

                productName: product.name,

            });

            await activityService.logActivity({

                userId: product.userId,

                type: "PRODUCT_UPDATED",

                entity: "PRODUCT",

                entityId: product.id,

                title: "Warranty Reminder",

                description: `Warranty for "${product.name}" will expire soon.`,

            });

            if (product.user) {

                await emailService.sendEmail({

                    to: product.user.email,

                    subject: "Your warranty is expiring soon",

                    html: warrantyReminderTemplate({

                        userName: product.user.name,

                        productName: product.name,

                        expiryDate: product.expiryDate.toDateString(),

                    }),

                });

            }

        } catch (error) {

            console.error(
                `Warranty reminder failed for product ${product.id}:`,
                error
            );

        }

    }

};

const processExpired = async () => {
    const today = new Date();

    const products =
        await productRepository.findExpiredProducts(
            today
        );

    for (const product of products) {

        try {

            await productRepository.updateStatus(
                product.id,
                "EXPIRED"
            );

            await activityService.logActivity({

                userId: product.userId,

                type: "PRODUCT_UPDATED",

                entity: "PRODUCT",

                entityId: product.id,

                title: "Warranty Expired",

                description: `Warranty for "${product.name}" has expired.`,

            });

        } catch (error) {

            console.error(
                `Warranty expiry update failed for product ${product.id}:`,
                error
            );

        }

    }

};

const run = async () => {
    await processExpiringSoon();

    await processExpired();
};

module.exports = {
    run,
};
