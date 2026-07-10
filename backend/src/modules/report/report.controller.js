const asyncHandler = require("../../utils/asyncHandler");

const reportService = require("./report.service");

const sendExcel = async (workbook, fileName, res) => {

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}.xlsx"`
    );

    await workbook.xlsx.write(res);

    res.end();

};

const sendPDF = (document, fileName, res) => {

    res.setHeader(
        "Content-Type",
        "application/pdf"
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}.pdf"`
    );

    document.pipe(res);

    document.end();

};

const exportProducts = asyncHandler(async (req, res) => {

    if (req.query.format === "PDF") {

        const pdf =
            await reportService.exportProductsPDF(
                req.user,
                req.query
            );

        return sendPDF(
            pdf,
            "Products_Report",
            res
        );

    }

    const workbook =
        await reportService.exportProductsExcel(
            req.user,
            req.query
        );

    return sendExcel(
        workbook,
        "Products_Report",
        res
    );

});

const exportWarranty = asyncHandler(async (req, res) => {

    if (req.query.format === "PDF") {

        const pdf =
            await reportService.exportWarrantyPDF(
                req.user,
                req.query
            );

        return sendPDF(
            pdf,
            "Warranty_Report",
            res
        );

    }

    const workbook =
        await reportService.exportWarrantyExcel(
            req.user,
            req.query
        );

    return sendExcel(
        workbook,
        "Warranty_Report",
        res
    );

});

const exportPayments = asyncHandler(async (req, res) => {

    if (req.query.format === "PDF") {

        const pdf =
            await reportService.exportPaymentsPDF(
                req.user,
                req.query
            );

        return sendPDF(
            pdf,
            "Payments_Report",
            res
        );

    }

    const workbook =
        await reportService.exportPaymentsExcel(
            req.user,
            req.query
        );

    return sendExcel(
        workbook,
        "Payments_Report",
        res
    );

});

const exportRevenue = asyncHandler(async (req, res) => {

    if (req.query.format === "PDF") {

        const pdf =
            await reportService.exportRevenuePDF(
                req.query
            );

        return sendPDF(
            pdf,
            "Revenue_Report",
            res
        );

    }

    const workbook =
        await reportService.exportRevenueExcel(
            req.query
        );

    return sendExcel(
        workbook,
        "Revenue_Report",
        res
    );

});

const exportUsers = asyncHandler(async (req, res) => {

    if (req.query.format === "PDF") {

        const pdf =
            await reportService.exportUsersPDF(
                req.query
            );

        return sendPDF(
            pdf,
            "Users_Report",
            res
        );

    }

    const workbook =
        await reportService.exportUsersExcel(
            req.query
        );

    return sendExcel(
        workbook,
        "Users_Report",
        res
    );

});

const exportCategories = asyncHandler(async (req, res) => {

    if (req.query.format === "PDF") {

        const pdf =
            await reportService.exportCategoriesPDF();

        return sendPDF(
            pdf,
            "Categories_Report",
            res
        );

    }

    const workbook =
        await reportService.exportCategoriesExcel();

    return sendExcel(
        workbook,
        "Categories_Report",
        res
    );

});

module.exports = {

    exportProducts,

    exportWarranty,

    exportPayments,

    exportRevenue,

    exportUsers,

    exportCategories,

};