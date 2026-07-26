const ApiError = require("../../utils/ApiError");
const toSlug = require("../../utils/slug");
const repository = require("./brand.repository");

const createBrand = async (payload) => {
    if (await repository.findByName(payload.name)) throw new ApiError(409, "Brand already exists.");
    return repository.create({ ...payload, slug: toSlug(payload.name) });
};

const getBrands = (includeInactive = false) => includeInactive ? repository.findAll() : repository.findAllActive();

const updateBrand = async (id, payload) => {
    const brand = await repository.findById(id);
    if (!brand) throw new ApiError(404, "Brand not found.");
    if (payload.name && payload.name.toLowerCase() !== brand.name.toLowerCase()) {
        if (await repository.findByName(payload.name)) throw new ApiError(409, "Brand already exists.");
        payload.slug = toSlug(payload.name);
    }
    return repository.update(id, payload);
};

const deactivateBrand = async (id) => {
    if (!await repository.findById(id)) throw new ApiError(404, "Brand not found.");
    return repository.update(id, { isActive: false });
};

module.exports = { createBrand, getBrands, updateBrand, deactivateBrand };
