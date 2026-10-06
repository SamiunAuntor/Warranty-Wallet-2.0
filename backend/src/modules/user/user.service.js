const repository = require("./user.repository");
const ApiError = require("../../utils/ApiError");
const firebase = require("../../config/firebase");
const { uploadFile } = require("../../services/upload.service");
const deleteCloudinaryFile = require("../../utils/deleteCloudinaryFile");
const { hasValidFileSignature } = require("../../utils/fileValidation");

const syncUser = async (firebaseUser, payload) => {
    if (!firebaseUser.uid || !firebaseUser.email) throw new ApiError(400, "Your Firebase account does not provide a usable email address.");
    const existing = await repository.findByFirebaseUid(firebaseUser.uid);
    const providerPhoto = payload.photoURL || firebaseUser.picture || null;
    const preserveCustomAvatar = existing?.avatarSource === "CUSTOM";
    const email = firebaseUser.email.trim().toLowerCase();
    // Keep a name the user already chose. Only replace the generated
    // email-prefix fallback, which a client may create while registration
    // is still finishing.
    const generatedName = email.split("@")[0];
    const keepExistingName = existing && existing.name && existing.name !== generatedName;
    return repository.syncUser({
        firebaseUid: firebaseUser.uid,
        email,
        emailVerified: Boolean(firebaseUser.email_verified),
        name: keepExistingName ? existing.name : payload.name.trim(),
        ...(!preserveCustomAvatar && providerPhoto ? { photoURL: providerPhoto, avatarSource: "GOOGLE" } : {}),
        lastLoginAt: new Date(),
    });
};

const getProfile = (id) => repository.findById(id);
const updateProfile = (id, payload) => repository.updateUser(id, payload);
const getPreferences = (userId) => repository.getPreferences(userId);
const updatePreferences = (userId, payload) => repository.updatePreferences(userId, payload);

const updateAvatar = async (user, file) => {
    if (!file) throw new ApiError(400, "Choose a profile photo to upload.");
    if (!file.mimetype.startsWith("image/") || !hasValidFileSignature(file)) throw new ApiError(400, "Profile photos must be valid JPG, PNG, or WebP images.");
    const uploaded = await uploadFile(file.buffer, `WarrantyWallet/images/profile-photos/${user.id}`);
    try {
        await firebase.auth().updateUser(user.firebaseUid, { photoURL: uploaded.secure_url });
        const updated = await repository.updateUser(user.id, { photoURL: uploaded.secure_url, avatarPublicId: uploaded.public_id, avatarSource: "CUSTOM" });
        if (user.avatarPublicId) await deleteCloudinaryFile(user.avatarPublicId).catch(() => undefined);
        return updated;
    } catch (error) {
        await deleteCloudinaryFile(uploaded.public_id).catch(() => undefined);
        throw error;
    }
};

module.exports = { syncUser, getProfile, updateProfile, updateAvatar, getPreferences, updatePreferences };
