const { prisma } = require('../models/prismaClient');

exports.createPurchaseReq = async (purchaseData) => {
    const purchase = await prisma.purchases.create({
        data: purchaseData
    });
    return purchase;
};