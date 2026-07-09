const pagination = (query) => {

    const page = Number(query.page) || 1;

    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;

    return {
        skip,
        take: limit,
        page,
        limit,
    };
};

module.exports = pagination;