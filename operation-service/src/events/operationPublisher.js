let purchasesChannel;

async function initTransactionPublisher(ch) {
  purchasesChannel = ch;

  // Purchases queues
  await purchasesChannel.assertQueue("PurchaseRequestCreated");
  await purchasesChannel.assertQueue("PurchaseRequestConfirmed");

  // Borrowings queues
  await purchasesChannel.assertQueue("BorrowRequestCreated");
  await purchasesChannel.assertQueue("BorrowRequestConfirmed");
}

function publishPurchaseCreated(purchase) {
  if (!purchasesChannel) throw new Error("RabbitMQ channel not initialized");

  purchasesChannel.sendToQueue(
    "PurchaseRequestCreated",
    Buffer.from(JSON.stringify(purchase)),
    { persistent: true }
  );
}

function publishPurchaseConfirmed(purchase) {
  if (!purchasesChannel) throw new Error("RabbitMQ channel not initialized");

  purchasesChannel.sendToQueue(
    "PurchaseRequestConfirmed",
    Buffer.from(JSON.stringify(purchase)),
    { persistent: true }
  );
}

function publishBorrowCreated(borrow) {
  if (!purchasesChannel) throw new Error("RabbitMQ channel not initialized");

  purchasesChannel.sendToQueue(
    "BorrowRequestCreated",
    Buffer.from(JSON.stringify(borrow)),
    { persistent: true }
  );
}

function publishBorrowConfirmed(borrow) {
  if (!purchasesChannel) throw new Error("RabbitMQ channel not initialized");

  purchasesChannel.sendToQueue(
    "BorrowRequestConfirmed",
    Buffer.from(JSON.stringify(borrow)),
    { persistent: true }
  );
}

module.exports = {
  initTransactionPublisher,
  publishPurchaseCreated,
  publishPurchaseConfirmed,
  publishBorrowCreated,
  publishBorrowConfirmed,
};
