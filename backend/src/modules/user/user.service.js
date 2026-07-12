const repository = require("./user.repository");

const syncUser = async (firebaseUser, payload) => {
    let user = await repository.findByFirebaseUid(firebaseUser.uid);

    if (!user) {
        user = await repository.createUser({
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: Boolean(firebaseUser.email_verified),
            name: payload.name,
            photoURL: payload.photoURL,
        });
    } else {
        user = await repository.updateUser(user.id, {
            name: payload.name,
            photoURL: payload.photoURL,
            emailVerified: Boolean(firebaseUser.email_verified),
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