const { prisma } = require("../models/prismaClient");
const { publishPurchaseCreated } = require("../events/transactionPublisher");

exports.createPurchaseReq = async (purchaseData) => {
  const newPurchase = await prisma.purchases.create({
    data: purchaseData,
  });

  publishPurchaseCreated({
    resourceId: newPurchase.resourceId,
    statusId: newPurchase.statusId,
  });
  return newPurchase;
};
