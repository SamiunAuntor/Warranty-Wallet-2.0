const repository = require("./user.repository");
const ApiError = require("../../utils/ApiError");

const syncUser = async (firebaseUser, payload) => {
    if (!firebaseUser.uid || !firebaseUser.email) {
        throw new ApiError(400, "Your Firebase account does not provide a usable email address.");
    }

    return repository.syncUser({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email.trim().toLowerCase(),
        emailVerified: Boolean(firebaseUser.email_verified),
        name: payload.name.trim(),
        photoURL: payload.photoURL,
        lastLoginAt: new Date(),
    });
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
