const productRepository = require("./product.repository");
const categoryRepository = require("../category/category.repository");
const brandRepository = require("../brand/brand.repository");
const userRepository = require("../user/user.repository");

const ApiError = require("../../utils/ApiError");

const { PRODUCT_LIMIT } = require("./product.constant");

const { calculateExpiryDate, calculateWarrantyStatus, } = require("./product.utils");

const { pagination, search, sort } = require("../../utils/query");
const { deliverReminder, calendarDaysBetween, shouldSendImmediateReminder } = require("../../jobs/warranty.job");

const warrantyFields = (payload, product = null) => {
    const hasWarranty = payload.hasWarranty ?? product?.hasWarranty ?? true;

    if (!hasWarranty) {
        return {
            hasWarranty: false,
            warrantyDuration: null,
            warrantyType: null,
            expiryDate: null,
            warrantyStatus: "NO_WARRANTY",
        };
    }

    const warrantyDuration = payload.warrantyDuration !== undefined
        ? payload.warrantyDuration
        : product?.warrantyDuration;
    const warrantyType = payload.warrantyType !== undefined
        ? payload.warrantyType
        : product?.warrantyType;
    const purchaseDate = payload.purchaseDate || product?.purchaseDate;

    if (!warrantyDuration || !warrantyType) {
        throw new ApiError(
            400,
            "Warranty duration and warranty type are required for assets with a warranty."
        );
    }

    const expiryDate = calculateExpiryDate(purchaseDate, warrantyDuration);

    return {
        hasWarranty: true,
        warrantyDuration,
        warrantyType,
        expiryDate,
        warrantyStatus: calculateWarrantyStatus(expiryDate),
    };
};

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

    // Enforce the asset limit for every subscription tier.
    const assetLimit = PRODUCT_LIMIT[user.plan];
    const totalProducts = await productRepository.countUserProducts(user.id);

    if (!assetLimit) {
        throw new ApiError(500, `Unsupported user plan: ${user.plan}.`);
    }
    if (category.isActive === false) throw new ApiError(400, "Selected category is inactive.");

    if (payload.brandId) {
        const brand = await brandRepository.findById(payload.brandId);
        if (!brand || !brand.isActive) throw new ApiError(404, "Brand not found.");
        payload.brand = brand.name;
    }

    if (totalProducts >= assetLimit) {
        throw new ApiError(
            403,
            `${user.plan} users can add up to ${assetLimit} assets. Upgrade your plan to add more.`
        );
    }

    // Check duplicate serial number
    if (payload.serialNumber) {
        const duplicate = await productRepository.findBySerialNumber(user.id, payload.serialNumber);

        if (duplicate) {
            throw new ApiError(409, "Serial number already exists.");
        }
    }

    const warranty = warrantyFields(payload);

    const product = await productRepository.create({
        ...payload,

        userId: user.id,

        ...warranty,
    });

    if (product.expiryDate) {
        const daysRemaining = calendarDaysBetween(new Date(), product.expiryDate);
        const preferences = await userRepository.findPreferences(user.id);
        if (shouldSendImmediateReminder(daysRemaining, preferences)) {
            await deliverReminder({ ...product, user }, daysRemaining).catch((error) => {
                console.error(`Immediate warranty reminder failed for product ${product.id}:`, error);
            });
        }
    }

    return product;
};

const getProducts = async (user, query) => {
    const { skip, take } = pagination(query);

    const where = {
        userId: user.id,

        ...search(query.search, [
            "name",
            "brand",
        ]),

        ...(query.categoryId && { categoryId: query.categoryId }),

        ...(query.warrantyStatus && { warrantyStatus: query.warrantyStatus }),

        ...(query.lifecycleStatus && { lifecycleStatus: query.lifecycleStatus }),
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

const getProductById = async (id, user) => {
    const product = await productRepository.findById(id);

    if (!product) {
        throw new ApiError(
            404,
            "Product not found."
        );
    }

    if (product.userId !== user.id && user.role !== "ADMIN") {
        throw new ApiError(403, "Forbidden.");
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
        if (category.isActive === false) throw new ApiError(400, "Selected category is inactive.");
    }

    if (payload.brandId) {
        const brand = await brandRepository.findById(payload.brandId);
        if (!brand || !brand.isActive) throw new ApiError(404, "Brand not found.");
        payload.brand = brand.name;
    }

    if (payload.serialNumber && payload.serialNumber !== product.serialNumber) {
        const duplicate = await productRepository.findBySerialNumber(user.id, payload.serialNumber);

        if (duplicate) {
            throw new ApiError(409, "Serial number already exists.");
        }
    }

    const warranty = warrantyFields(payload, product);

    return productRepository.update(
        id,
        {
            ...payload,

            ...warranty,
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
