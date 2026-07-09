const repository = require("./user.repository");

const syncUser = async (payload) => {
    let user = await repository.findByFirebaseUid(payload.firebaseUid);

    if (!user) {
        user = await repository.createUser(payload);
    } else {
        user = await repository.updateUser(user.id, {
            name: payload.name,
            photo: payload.photo,
        });
    }

    return user;
};

const getProfile = async (id) => {
    return repository.findById(id);
};

const updateProfile = async (id, payload) => {
    return repository.updateUser(id, payload);
};

module.exports = {
    syncUser,
    getProfile,
    updateProfile,
};