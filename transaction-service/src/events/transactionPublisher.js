let purchasesChannel;

async function initTransactionPublisher(ch) {
  purchasesChannel = ch;
  await purchasesChannel.assertQueue("PurchaseRequestCreated");
}

function publishPurchaseCreated(purchase) {
  if (!purchasesChannel) throw new Error("RabbitMQ channel not initialized");
  purchasesChannel.sendToQueue(
    "PurchaseRequestCreated",
    Buffer.from(JSON.stringify(purchase))
  );
}

function publishPurchaseConfirmed(purchase) {
  if (!purchasesChannel) throw new Error("RabbitMQ channel not initialized");
  purchasesChannel.sendToQueue(
    "PurchaseRequestConfirmed",
    Buffer.from(JSON.stringify(purchase))
  );
}

module.exports = { initTransactionPublisher, publishPurchaseCreated, publishPurchaseConfirmed };