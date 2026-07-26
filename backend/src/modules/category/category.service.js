const ApiError = require("../../utils/ApiError");
const repository = require("./category.repository");
const toSlug = require("../../utils/slug");

const createCategory = async (payload) => {
    const exists = await repository.findByName(payload.name);

    if (exists) {
        throw new ApiError(409, "Category already exists.");
    }

    return repository.create({ ...payload, slug: toSlug(payload.name) });
};

const getCategories = () => repository.findAll();

const updateCategory = async (id, payload) => {
    const category = await repository.findById(id);

    if (!category) {
        throw new ApiError(404, "Category not found.");
    }

    if (payload.name && payload.name.toLowerCase() !== category.name.toLowerCase()) {
        if (await repository.findByName(payload.name)) {
            throw new ApiError(409, "Category already exists.");
        }
        payload.slug = toSlug(payload.name);
    }
    return repository.update(id, payload);
};

const deleteCategory = async (id) => {
    const category = await repository.findById(id);

    if (!category) {
        throw new ApiError(404, "Category not found.");
    }

    return repository.update(id, { isActive: false });
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
};
