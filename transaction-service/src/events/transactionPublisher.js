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

module.exports = { initTransactionPublisher, publishPurchaseCreated };