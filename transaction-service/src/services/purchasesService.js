const { prisma } = require("../models/prismaClient");
const { publishPurchaseCreated } = require("../events/transactionPublisher");
const { publishPurchaseConfirmed } = require("../events/transactionPublisher");

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

exports.approvePurchaseReq = async (resourceId) => {
  const updatedPurchase = await prisma.purchases.updateMany({
    where: { resourceId, statusId: 4 }, // Only update if status is 'Pending'
    data: { statusId: 5 }, // Approved
  });

  publishPurchaseConfirmed({
    resourceId: resourceId,
    statusId: 5,
  });

  return updatedPurchase;
};
