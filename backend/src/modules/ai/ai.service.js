const ai = require("../../config/gemini");

const ApiError = require("../../utils/ApiError");
const { z } = require("zod");

const extractedDocumentSchema = z.object({
    productName: z.string().nullable().optional(),
    brand: z.string().nullable().optional(),
    purchaseDate: z.string().nullable().optional(),
    purchasePrice: z.number().nullable().optional(),
    sellerName: z.string().nullable().optional(),
    invoiceNumber: z.string().nullable().optional(),
    warrantyDuration: z.number().int().nonnegative().nullable().optional(),
    confidence: z.number().min(0).max(1).nullable().optional(),
});

const extractInvoice = async (file) => {

    if (!file) {

        throw new ApiError(
            400,
            "Invoice is required."
        );

    }

    const prompt = `
You are an invoice extraction assistant.

Extract the following fields.

Return ONLY valid JSON.

{
  "productName":"",
  "brand":"",
  "purchaseDate":"",
  "purchasePrice":0,
  "sellerName":"",
  "invoiceNumber":"",
  "warrantyDuration":null
}

Rules

If unknown use null.

Do not explain anything.

No markdown.

No comments.

`;

    const response =
        await ai.models.generateContent({

            model: "gemini-2.5-flash",

            contents: [

                {
                    inlineData: {

                        mimeType:
                            file.mimetype,

                        data:
                            file.buffer.toString(
                                "base64"
                            ),

                    },

                },

                {
                    text: prompt,
                },

            ],

        });

    const text = response.text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();

    try {

        return extractedDocumentSchema.parse(JSON.parse(text));

    } catch {

        throw new ApiError(
            500,
            "Gemini returned invalid JSON."
        );

    }

};

module.exports = {
    extractInvoice,
    extractedDocumentSchema,
};
