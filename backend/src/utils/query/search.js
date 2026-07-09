const search = (searchTerm, fields) => {

    if (!searchTerm) return {};

    return {
        OR: fields.map((field) => ({
            [field]: {
                contains: searchTerm,
                mode: "insensitive",
            },
        })),
    };
};

module.exports = search;