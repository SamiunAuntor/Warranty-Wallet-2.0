const express = require("express");

const router = express.Router();

const controller = require("./document.controller");

const auth = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const upload = require("../../middlewares/upload.middleware");

const { createDocumentSchema, documentIdSchema } = require("./document.validation");

router.post("/products/:productId/documents", auth, upload.multiple, validate(createDocumentSchema), controller.uploadDocuments);

router.get("/products/:productId/documents", auth, controller.getDocuments);

router.get("/documents/statistics", auth, controller.getDocumentStatistics);

router.get("/documents/:id", auth, validate(documentIdSchema), controller.getDocument);

router.patch("/documents/:id", auth, upload.single, validate(documentIdSchema), controller.replaceDocument);

router.delete("/documents/:id", auth, validate(documentIdSchema), controller.deleteDocument);

module.exports = router;