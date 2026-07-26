const dashboardRepository = require("./dashboard.repository");
const { DASHBOARD_RANGE } = require("./dashboard.constant");
const ApiError = require("../../utils/ApiError");

const getUserDashboard = async (user) => {

    const userId = user.id;

    const [
        productStats,
        documentCount,
        notificationStats,
        recentNotifications,
        recentActivities,
        categoryDistribution,
        warrantyTimeline,
    ] = await Promise.all([

        dashboardRepository.getProductStatistics(userId),

        dashboardRepository.getDocumentStatistics(userId),

        dashboardRepository.getNotificationStatistics(userId),

        dashboardRepository.getRecentNotifications(userId),

        dashboardRepository.getRecentActivities(userId),

        dashboardRepository.getCategoryDistribution(userId),

        dashboardRepository.getWarrantyTimeline(userId),

    ]);

    return {

        products: {

            total: productStats.total,

            active: productStats.active,

            expiringSoon: productStats.expiringSoon,

            expired: productStats.expired,

        },

        purchaseValue: productStats.purchaseValue,

        documents: {

            total: documentCount,

        },

        notifications: notificationStats,

        recentNotifications,

        recentActivities,

        categoryDistribution,

        warrantyTimeline,

        plan: user.plan,

        paid: user.plan !== "BASIC",

    };

};

const getAdminDashboard = async (user) => {

    if (user.role !== "ADMIN") {

        throw new ApiError(
            403,
            "Access denied."
        );

    }

    const currentYear =
        new Date().getFullYear();

    const [

        statistics,

        recentPayments,

        monthlyRevenue,

        productGrowth,

    ] = await Promise.all([

        dashboardRepository.getAdminStatistics(),

        dashboardRepository.getRecentPayments(),

        dashboardRepository.getMonthlyRevenue(
            currentYear
        ),

        dashboardRepository.getProductGrowth(
            currentYear
        ),

    ]);

    return {

        overview: statistics,

        recentPayments,

        revenueChart: monthlyRevenue,

        productGrowth,

    };

};

const getRevenueAnalytics = async (year = new Date().getFullYear()) => {

    return dashboardRepository.getMonthlyRevenue(
        year
    );

};


const getProductGrowthAnalytics = async (year = new Date().getFullYear()) => {

    return dashboardRepository.getProductGrowth(
        year
    );

};


const getWarrantyAnalytics = async (userId) => {

    return dashboardRepository.getWarrantyTimeline(
        userId,
        20
    );

};

const getCategoryAnalytics = async (userId) => {

    return dashboardRepository.getCategoryDistribution(
        userId
    );

};

module.exports = {

    getUserDashboard,

    getAdminDashboard,

    getRevenueAnalytics,

    getProductGrowthAnalytics,

    getWarrantyAnalytics,

    getCategoryAnalytics,

};
