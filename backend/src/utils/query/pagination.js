const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const toPositiveInteger = (value, fallback) => {
    const number = Number(value);

    if (!Number.isFinite(number) || number < 1) return fallback;

    return Math.floor(number);
};

const pagination = (query = {}) => {
    const page = toPositiveInteger(query.page, DEFAULT_PAGE);
    const requestedLimit = toPositiveInteger(query.limit, DEFAULT_LIMIT);
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const skip = (page - 1) * limit;

    return {
        skip,
        take: limit,
        page,
        limit,
    };
};

module.exports = pagination;
