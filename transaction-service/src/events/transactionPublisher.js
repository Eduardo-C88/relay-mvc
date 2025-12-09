let purchasesChannel;

async function initTransactionPublisher(ch) {
  purchasesChannel = ch;
  await purchasesChannel.assertQueue("PurchaseRequestCreated");
  await purchasesChannel.assertQueue("PurchaseRequestConfirmed");
}

function publishPurchaseCreated(purchase) {
  if (!purchasesChannel) throw new Error("RabbitMQ channel not initialized");
  purchasesChannel.sendToQueue(
    "PurchaseRequestCreated",
    Buffer.from(JSON.stringify(purchase)), { persistent: true }
  );
}

function publishPurchaseConfirmed(purchase) {
  if (!purchasesChannel) throw new Error("RabbitMQ channel not initialized");
  purchasesChannel.sendToQueue(
    "PurchaseRequestConfirmed",
    Buffer.from(JSON.stringify(purchase)), { persistent: true }
  );
}

module.exports = { initTransactionPublisher, publishPurchaseCreated, publishPurchaseConfirmed };