const express = require("express");
const auth = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const controller = require("./claim.controller");
const {
    createClaimSchema,
    listClaimsSchema,
    claimIdSchema,
    updateClaimSchema,
    timelineEventSchema,
    attachDocumentSchema,
    detachDocumentSchema,
} = require("./claim.validation");

const router = express.Router();

router.use(auth);
router.get("/", validate(listClaimsSchema), controller.getClaims);
router.post("/", validate(createClaimSchema), controller.createClaim);
router.get("/:id", validate(claimIdSchema), controller.getClaim);
router.patch("/:id", validate(updateClaimSchema), controller.updateClaim);
router.delete("/:id", validate(claimIdSchema), controller.deleteClaim);
router.post("/:id/timeline", validate(timelineEventSchema), controller.addTimelineEvent);
router.post("/:id/documents", validate(attachDocumentSchema), controller.attachDocument);
router.delete("/:id/documents/:documentId", validate(detachDocumentSchema), controller.detachDocument);

module.exports = router;
