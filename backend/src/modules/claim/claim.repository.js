const prisma = require("../../config/prisma");

const productInclude = { category: true };
const detailInclude = {
    product: { include: productInclude },
    timeline: { orderBy: { createdAt: "desc" } },
    documents: { orderBy: { attachedAt: "desc" }, include: { document: true } },
};

const list = ({ where, skip, take }) => prisma.claim.findMany({
    where,
    skip,
    take,
    orderBy: { updatedAt: "desc" },
    include: {
        product: { include: productInclude },
        _count: { select: { timeline: true, documents: true } },
    },
});

const count = (where) => prisma.claim.count({ where });
const findById = (id) => prisma.claim.findUnique({ where: { id }, include: detailInclude });
const findDocuments = (ids) => prisma.document.findMany({
    where: { id: { in: ids } },
    select: { id: true, userId: true, productId: true },
});

const create = (payload, evidence) => prisma.claim.create({
    data: {
        ...payload,
        timeline: {
            create: {
                status: payload.status,
                title: "Claim submitted",
                description: "The claim was added to this asset's history.",
            },
        },
        ...(evidence.length && {
            documents: {
                create: evidence.map((item) => ({ ...item, claimStage: payload.status })),
            },
        }),
    },
    include: detailInclude,
});

const update = (claim, payload) => prisma.$transaction(async (tx) => {
    await tx.claim.update({ where: { id: claim.id }, data: payload });
    if (payload.status && payload.status !== claim.status) {
        await tx.claimTimelineEvent.create({
            data: {
                claimId: claim.id,
                status: payload.status,
                title: `Status changed to ${payload.status.replaceAll("_", " ").toLowerCase()}`,
                description: payload.resolution || undefined,
            },
        });
    }
    return tx.claim.findUnique({ where: { id: claim.id }, include: detailInclude });
});

const remove = (id) => prisma.claim.delete({ where: { id } });
const addTimelineEvent = (claimId, payload) => prisma.claimTimelineEvent.create({ data: { claimId, ...payload } });
const attachDocument = (claimId, evidence) => prisma.claimDocument.create({ data: { claimId, ...evidence }, include: { document: true } });
const detachDocument = (claimId, documentId) => prisma.claimDocument.delete({ where: { claimId_documentId: { claimId, documentId } } });

module.exports = { list, count, findById, findDocuments, create, update, remove, addTimelineEvent, attachDocument, detachDocument };
