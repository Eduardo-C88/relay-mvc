const { consume } = require("../messaging/consumer");
const EVENTS = require("../messaging/events");
const purchasesService = require("../services/purchasesService");

async function startOperationConsumers() {
  // Consume purchase requested events
  await consume(EVENTS.RESOURCE_RESERVED, async (purchase) => {
    console.log(`Processing PurchaseRequested for resource ${purchase.resourceId}`);
    await purchasesService.resourceAvailable(purchase.purchaseId, purchase.ownerId);
  });

  // Consume Resource reservation failed events
  await consume(EVENTS.RESOURCE_RESERVATION_FAILED, async (purchase) => {
    console.log(`Processing PurchaseRejected for resource ${purchase.resourceId}`);
    await purchasesService.resourceFailed(purchase.purchaseId);
  });
}

module.exports = {
  startOperationConsumers,
};
