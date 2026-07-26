const reportRepository = require("./report.repository");

const excelGenerator = require("../../shared/report/excel.generator");
const pdfGenerator = require("../../shared/report/pdf.generator");

const ApiError = require("../../utils/ApiError");

const exportProductsExcel = async (user, query) => {

    const rows = await reportRepository.getProductsReport({

        userId: user.id,

        isAdmin:
            user.role === "ADMIN",

        filters: query,

    });

    const workbook = await excelGenerator.generateExcel({

        sheetName: "Products",

        columns: [

            {
                header: "Product",
                key: "name",
                width: 25,
            },

            {
                header: "Brand",
                key: "brand",
                width: 20,
            },

            {
                header: "Category",
                key: "category",
                width: 20,
            },

            {
                header: "Purchase Date",
                key: "purchaseDate",
                width: 18,
            },

            {
                header: "Warranty Ends",
                key: "expiryDate",
                width: 18,
            },

            {
                header: "Status",
                key: "status",
                width: 18,
            },

            {
                header: "Price",
                key: "purchasePrice",
                width: 15,
            },

        ],

        rows: rows.map(product => ({

            name:
                product.name,

            brand:
                product.brand,

            category:
                product.category.name,

            purchaseDate:
                product.purchaseDate,

            expiryDate:
                product.expiryDate,

            status:
                product.warrantyStatus,

            purchasePrice:
                Number(product.purchasePrice),

        })),

    });

    return workbook;

};

const exportProductsPDF = async (user, query) => {

    const rows = await reportRepository.getProductsReport({

        userId:
            user.id,

        isAdmin:
            user.role === "ADMIN",

        filters:
            query,

    });

    return pdfGenerator.generatePDF({

        title:
            "Products Report",

        rows: rows.map(product => ({

            Product:
                product.name,

            Brand:
                product.brand,

            Category:
                product.category.name,

            Warranty:
                product.warrantyStatus,

            Price:
                Number(product.purchasePrice),

        })),

    });

};

const exportWarrantyExcel = async (user, query) => {

    const rows = await reportRepository.getWarrantyReport({

        userId:
            user.id,

        isAdmin:
            user.role === "ADMIN",

        filters:
            query,

    });

    return excelGenerator.generateExcel({

        sheetName:
            "Warranty",

        columns: [

            {
                header: "Product",
                key: "name",
                width: 25
            },

            {
                header: "Expiry",
                key: "expiryDate",
                width: 18
            },

            {
                header: "Status",
                key: "status",
                width: 18
            }

        ],

        rows: rows.map(item => ({

            name:
                item.name,

            expiryDate:
                item.expiryDate,

            status:
                item.status,

        })),

    });

};

const exportWarrantyPDF = async (user, query) => {

    const rows = await reportRepository.getWarrantyReport({

        userId:
            user.id,

        isAdmin:
            user.role === "ADMIN",

        filters:
            query,

    });

    return pdfGenerator.generatePDF({

        title:
            "Warranty Report",

        rows: rows.map(item => ({

            Product:
                item.name,

            Expiry:
                item.expiryDate,

            Status:
                item.status,

        })),

    });

};

const exportPaymentsExcel = async (user, query) => {

    const rows = await reportRepository.getPaymentReport({

        userId: user.id,

        isAdmin:
            user.role === "ADMIN",

        filters: query,

    });

    return excelGenerator.generateExcel({

        sheetName: "Payments",

        columns: [

            {
                header: "Payment ID",
                key: "id",
                width: 28,
            },

            {
                header: "Customer",
                key: "customer",
                width: 25,
            },

            {
                header: "Amount",
                key: "amount",
                width: 15,
            },

            {
                header: "Currency",
                key: "currency",
                width: 12,
            },

            {
                header: "Status",
                key: "status",
                width: 15,
            },

            {
                header: "Date",
                key: "createdAt",
                width: 20,
            },

        ],

        rows: rows.map(payment => ({

            id: payment.id,

            customer:
                payment.user.name,

            amount:
                Number(payment.amount),

            currency:
                payment.currency,

            status:
                payment.status,

            createdAt:
                payment.createdAt,

        })),

    });

};

const exportPaymentsPDF = async (user, query) => {

    const rows = await reportRepository.getPaymentReport({

        userId: user.id,

        isAdmin:
            user.role === "ADMIN",

        filters: query,

    });

    return pdfGenerator.generatePDF({

        title: "Payment Report",

        rows: rows.map(payment => ({

            Customer: payment.user.name,

            Amount: Number(payment.amount),

            Status: payment.status,

            Date: payment.createdAt,

        })),

    });

};

const exportRevenueExcel = async (query) => {

    const rows = await reportRepository.getRevenueReport(query);

    return excelGenerator.generateExcel({

        sheetName: "Revenue",

        columns: [

            {
                header: "Customer",
                key: "customer",
                width: 25,
            },

            {
                header: "Amount",
                key: "amount",
                width: 15,
            },

            {
                header: "Date",
                key: "createdAt",
                width: 20,
            },

        ],

        rows: rows.map(payment => ({

            customer:
                payment.user.name,

            amount:
                Number(payment.amount),

            createdAt:
                payment.createdAt,

        })),

    });

};

const exportRevenuePDF = async (query) => {

    const rows = await reportRepository.getRevenueReport(query);

    return pdfGenerator.generatePDF({

        title: "Revenue Report",

        rows: rows.map(payment => ({

            Customer: payment.user.name,

            Amount: Number(payment.amount),

            Date: payment.createdAt,

        })),

    });

};

const exportUsersExcel = async (query) => {

    const rows = await reportRepository.getUserReport(query);

    return excelGenerator.generateExcel({

        sheetName: "Users",

        columns: [

            {
                header: "Name",
                key: "name",
                width: 25,
            },

            {
                header: "Email",
                key: "email",
                width: 35,
            },

            {
                header: "Plan",
                key: "plan",
                width: 15,
            },

            {
                header: "Role",
                key: "role",
                width: 15,
            },

            {
                header: "Products",
                key: "products",
                width: 15,
            },

        ],

        rows: rows.map(user => ({

            name: user.name,

            email: user.email,

            plan: user.plan,

            role: user.role,

            products:
                user._count.products,

        })),

    });

};

const exportUsersPDF = async (query) => {

    const rows = await reportRepository.getUserReport(query);

    return pdfGenerator.generatePDF({

        title: "User Report",

        rows: rows.map(user => ({

            Name: user.name,

            Email: user.email,

            Plan: user.plan,

            Role: user.role,

        })),

    });

};

const exportCategoriesExcel = async () => {

    const rows = await reportRepository.getCategoryReport();

    return excelGenerator.generateExcel({

        sheetName: "Categories",

        columns: [

            {
                header: "Category",
                key: "name",
                width: 30,
            },

            {
                header: "Products",
                key: "products",
                width: 20,
            },

        ],

        rows: rows.map(category => ({

            name: category.name,

            products:
                category._count.products,

        })),

    });

};

const exportCategoriesPDF = async () => {

    const rows = await reportRepository.getCategoryReport();

    return pdfGenerator.generatePDF({

        title: "Category Report",

        rows: rows.map(category => ({

            Category: category.name,

            Products:
                category._count.products,

        })),

    });

};


module.exports = {

    exportProductsExcel,
    exportProductsPDF,

    exportWarrantyExcel,
    exportWarrantyPDF,

    exportPaymentsExcel,
    exportPaymentsPDF,

    exportRevenueExcel,
    exportRevenuePDF,

    exportUsersExcel,
    exportUsersPDF,

    exportCategoriesExcel,
    exportCategoriesPDF,

};
