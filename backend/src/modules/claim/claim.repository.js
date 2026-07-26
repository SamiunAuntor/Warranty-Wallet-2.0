const prisma = require("../../config/prisma");

const list = ({ where, skip, take }) =>
    prisma.claim.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
        include: {
            product: {
                include: { category: true },
            },
            timeline: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
            _count: {
                select: {
                    timeline: true,
                    documents: true,
                },
            },
        },
    });

const count = (where) => prisma.claim.count({ where });

const findById = (id) =>
    prisma.claim.findUnique({
        where: { id },
        include: {
            product: {
                include: { category: true },
            },
            timeline: {
                orderBy: { createdAt: "desc" },
            },
            documents: {
                orderBy: { attachedAt: "desc" },
                include: { document: true },
            },
        },
    });

const findDocuments = (ids) =>
    prisma.document.findMany({
        where: { id: { in: ids } },
        select: {
            id: true,
            userId: true,
            productId: true,
        },
    });

const create = (payload, documentIds) =>
    prisma.claim.create({
        data: {
            ...payload,
            timeline: {
                create: {
                    status: payload.status,
                    title: payload.status === "SUBMITTED" ? "Claim submitted" : "Claim created",
                    description: payload.status === "SUBMITTED"
                        ? "The claim was submitted for review."
                        : "The claim was saved as a draft.",
                },
            },
            ...(documentIds.length > 0 && {
                documents: {
                    create: documentIds.map((documentId) => ({ documentId })),
                },
            }),
        },
        include: {
            product: { include: { category: true } },
            timeline: { orderBy: { createdAt: "desc" } },
            documents: { include: { document: true } },
        },
    });

const update = (claim, payload) =>
    prisma.$transaction(async (tx) => {
        const updated = await tx.claim.update({
            where: { id: claim.id },
            data: payload,
        });

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

        return updated;
    });

const remove = (id) => prisma.claim.delete({ where: { id } });

const addTimelineEvent = (claimId, payload) =>
    prisma.$transaction(async (tx) => {
        if (payload.status) {
            await tx.claim.update({
                where: { id: claimId },
                data: {
                    status: payload.status,
                    ...(payload.status === "SUBMITTED" && { filedAt: new Date() }),
                    ...(["RESOLVED", "REJECTED", "CANCELLED"].includes(payload.status) && {
                        resolvedAt: new Date(),
                    }),
                    ...(!["RESOLVED", "REJECTED", "CANCELLED"].includes(payload.status) && {
                        resolvedAt: null,
                    }),
                },
            });
        }

        return tx.claimTimelineEvent.create({
            data: {
                claimId,
                ...payload,
            },
        });
    });

const attachDocument = (claimId, documentId) =>
    prisma.claimDocument.create({
        data: { claimId, documentId },
        include: { document: true },
    });

const detachDocument = (claimId, documentId) =>
    prisma.claimDocument.delete({
        where: {
            claimId_documentId: { claimId, documentId },
        },
    });

module.exports = {
    list,
    count,
    findById,
    findDocuments,
    create,
    update,
    remove,
    addTimelineEvent,
    attachDocument,
    detachDocument,
};
