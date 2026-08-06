const uniquePrefix = `integration-${process.pid}-${Date.now()}`;

let sequence = 0;

const unique = (label) => `${uniquePrefix}-${label}-${++sequence}`;

const createDatabaseHarness = (prisma) => {
    const created = {
        userIds: new Set(),
        categoryIds: new Set(),
        brandIds: new Set(),
    };

    const createUser = async (overrides = {}) => {
        const suffix = unique("user");
        const user = await prisma.user.create({
            data: {
                firebaseUid: overrides.firebaseUid || suffix,
                name: overrides.name || "Integration User",
                email: overrides.email || `${suffix}@integration.test`,
                role: overrides.role || "USER",
                status: overrides.status || "ACTIVE",
                plan: overrides.plan || "BASIC",
                emailVerified: true,
            },
        });
        created.userIds.add(user.id);
        return user;
    };

    const createCategory = async (overrides = {}) => {
        const suffix = unique("category");
        const category = await prisma.category.create({
            data: {
                name: overrides.name || suffix,
                slug: overrides.slug || suffix,
                description: overrides.description || "Integration test category",
                isActive: overrides.isActive ?? true,
            },
        });
        created.categoryIds.add(category.id);
        return category;
    };

    const createBrand = async (overrides = {}) => {
        const suffix = unique("brand");
        const brand = await prisma.brand.create({
            data: {
                name: overrides.name || suffix,
                slug: overrides.slug || suffix,
                isActive: overrides.isActive ?? true,
            },
        });
        created.brandIds.add(brand.id);
        return brand;
    };

    const createProduct = async (userId, categoryId, overrides = {}) => (
        prisma.product.create({
            data: {
                userId,
                categoryId,
                name: overrides.name || "Integration Asset",
                brand: overrides.brand || "Integration Brand",
                serialNumber: overrides.serialNumber || unique("serial"),
                purchasePrice: overrides.purchasePrice || 999.99,
                purchaseDate: overrides.purchaseDate || new Date("2026-01-15T00:00:00.000Z"),
                hasWarranty: overrides.hasWarranty ?? true,
                warrantyDuration: overrides.warrantyDuration ?? 12,
                warrantyType: overrides.warrantyType || "MANUFACTURER",
                expiryDate: overrides.expiryDate || new Date("2027-01-15T00:00:00.000Z"),
                warrantyStatus: overrides.warrantyStatus || "ACTIVE",
            },
        })
    );

    const createDocument = async (userId, productId, overrides = {}) => (
        prisma.document.create({
            data: {
                userId,
                productId,
                fileName: overrides.fileName || "integration-receipt.pdf",
                fileType: overrides.fileType || "application/pdf",
                fileSize: overrides.fileSize || 128,
                fileUrl: overrides.fileUrl || `https://example.com/${unique("document")}.pdf`,
                publicId: overrides.publicId || unique("public-id"),
                provider: overrides.provider || "integration",
            },
        })
    );

    const cleanup = async () => {
        const userIds = [...created.userIds];
        if (userIds.length) {
            await prisma.user.deleteMany({ where: { id: { in: userIds } } });
        }

        const categoryIds = [...created.categoryIds];
        if (categoryIds.length) {
            await prisma.category.deleteMany({ where: { id: { in: categoryIds } } });
        }

        const brandIds = [...created.brandIds];
        if (brandIds.length) {
            await prisma.brand.deleteMany({ where: { id: { in: brandIds } } });
        }
    };

    return {
        createBrand,
        createCategory,
        createDocument,
        createProduct,
        createUser,
        cleanup,
        unique,
    };
};

module.exports = { createDatabaseHarness };
