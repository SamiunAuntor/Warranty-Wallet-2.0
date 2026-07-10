const productRepository = require("./product.repository");
const categoryRepository = require("../category/category.repository");

const ApiError = require("../../utils/ApiError");

const { PRODUCT_LIMIT } = require("./product.constant");

const { calculateExpiryDate, calculateWarrantyStatus, } = require("./product.utils");

const { pagination, search, filter, sort } = require("../../utils/query");

const createProduct = async (user, payload) => {
    // Check category exists
    const category = await categoryRepository.findById(
        payload.categoryId
    );

    if (!category) {
        throw new ApiError(
            404,
            "Category not found."
        );
    }

    // Check plan limit
    if (user.plan === "FREE") {
        const totalProducts =
            await productRepository.countUserProducts(
                user.id
            );

        if (totalProducts >= PRODUCT_LIMIT.FREE) {
            throw new ApiError(403, "Free users can only add up to 10 products. Upgrade to Premium.");
        }
    }

    // Check duplicate serial number
    if (payload.serialNumber) {
        const duplicate = await productRepository.findBySerialNumber(user.id, payload.serialNumber);

        if (duplicate) {
            throw new ApiError(409, "Serial number already exists.");
        }
    }

    // Calculate expiry
    const expiryDate = calculateExpiryDate(payload.purchaseDate, payload.warrantyDuration);

    // Calculate status
    const status = calculateWarrantyStatus(expiryDate);

    return productRepository.create({
        ...payload,

        userId: user.id,

        expiryDate,

        status,
    });
};

const getProducts = async (user, query) => {
    const { skip, take } = pagination(query);

    const where = {
        userId: user.id,

        ...search(query.search, [
            "name",
            "brand",
        ]),

        ...filter(query),
    };

    const orderBy = sort(query);

    const products = await productRepository.findMany({ where, orderBy, skip, take });

    const total = await productRepository.count(where);

    return {
        data: products,

        meta: {
            page:
                Number(query.page) || 1,

            limit: take,

            total,

            totalPages: Math.ceil(
                total / take
            ),
        },
    };
};

const getProductById = async (id) => {
    const product = await productRepository.findById(id);

    if (!product) {
        throw new ApiError(
            404,
            "Product not found."
        );
    }

    return product;
};

const updateProduct = async (id, payload, user) => {
    const product = await productRepository.findById(id);

    if (!product) {
        throw new ApiError(404, "Product not found.");
    }

    if (product.userId !== user.id && user.role !== "ADMIN") {
        throw new ApiError(403, "Forbidden.");
    }

    if (payload.categoryId) {
        const category = await categoryRepository.findById(
            payload.categoryId
        );

        if (!category) {
            throw new ApiError(404, "Category not found.");
        }
    }

    if (payload.serialNumber && payload.serialNumber !== product.serialNumber) {
        const duplicate = await productRepository.findBySerialNumber(user.id, payload.serialNumber);

        if (duplicate) {
            throw new ApiError(409, "Serial number already exists.");
        }
    }

    let expiryDate = product.expiryDate;

    let status = product.status;

    if (payload.purchaseDate || payload.warrantyDuration) {
        expiryDate = calculateExpiryDate(payload.purchaseDate || product.purchaseDate, payload.warrantyDuration || product.warrantyDuration);

        status = calculateWarrantyStatus(expiryDate);
    }

    return productRepository.update(
        id,
        {
            ...payload,

            expiryDate,

            status,
        }
    );
};

const deleteProduct = async (id, user) => {
    const product = await productRepository.findById(id);

    if (!product) {
        throw new ApiError(404, "Product not found.");
    }

    if (product.userId !== user.id && user.role !== "ADMIN") {
        throw new ApiError(403, "Forbidden.");
    }

    return productRepository.softDelete(id);
};

const getDashboardStats = async (userId) => {
    const stats = await productRepository.dashboardStats(userId);

    const latest = await productRepository.latestProducts(userId);

    return { stats, latest };
};

module.exports = {
    createProduct,

    getProducts,

    getProductById,

    updateProduct,

    deleteProduct,

    getDashboardStats,
};