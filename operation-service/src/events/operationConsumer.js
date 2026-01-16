const { consume } = require("../messaging/consumer");
const EVENTS = require("../messaging/events");
const purchasesService = require("../services/purchasesService");

async function startOperationConsumers() {
  // Consume purchase requested events
  await consume(EVENTS.RESOURCE_RESERVED, async (purchase) => {
    console.log(`Processing ResourceReserved for resource ${purchase.payload.resourceId}`);
    await purchasesService.resourceAvailable(purchase.payload.purchaseId, purchase.payload.ownerId);
  });

  // Consume Resource reservation failed events
  await consume(EVENTS.RESOURCE_RESERVATION_FAILED, async (purchase) => {
    console.log(`Processing ResourceReservationFailed for resource ${purchase.payload.resourceId}`);
    await purchasesService.resourceFailed(purchase.payload.purchaseId);
  });
}

module.exports = {
  startOperationConsumers,
};
