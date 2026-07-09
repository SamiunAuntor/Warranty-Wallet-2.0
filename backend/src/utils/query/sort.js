const sort = (query) => {

    const sortBy = query.sortBy || "createdAt";

    const sortOrder = query.sortOrder || "desc";

    return {
        [sortBy]: sortOrder,
    };
};

module.exports = sort;