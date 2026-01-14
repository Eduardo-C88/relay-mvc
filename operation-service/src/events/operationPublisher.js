const { getChannel } = require("../utils/rabbitmq");

async function initOperationPublisher(ch) {
  purchasesChannel = getChannel();
  if (!purchasesChannel) return;

  await purchasesChannel.assertQueue("PurchaseRequestCreated", { durable: true });
  await purchasesChannel.assertQueue("PurchaseRequestConfirmed", { durable: true });
  await purchasesChannel.assertQueue("BorrowRequestCreated", { durable: true });
  await purchasesChannel.assertQueue("BorrowRequestConfirmed", { durable: true });
}

function publishPurchaseCreated(purchase) {
  const purchasesChannel = getChannel();
  if (!purchasesChannel) {
    console.error("RabbitMQ channel not initialized");
    return;
  }

  channel.sendToQueue(
    "PurchaseRequestCreated",
    Buffer.from(JSON.stringify(purchase)),
    { persistent: true }
  );
  console.log("Published PurchaseRequestCreated event");
}

function publishPurchaseConfirmed(purchase) {
  const purchasesChannel = getChannel();
  if (!purchasesChannel) {
    console.error("RabbitMQ channel not initialized");
    return;
  }

  channel.sendToQueue(
    "PurchaseRequestConfirmed",
    Buffer.from(JSON.stringify(purchase)),
    { persistent: true }
  );
  console.log("Published PurchaseRequestConfirmed event");
}

function publishBorrowCreated(borrow) {
  const purchasesChannel = getChannel();
  if (!purchasesChannel) {
    console.error("RabbitMQ channel not initialized");
    return;
  }

  channel.sendToQueue(
    "BorrowRequestCreated",
    Buffer.from(JSON.stringify(borrow)),
    { persistent: true }
  );
  console.log("Published BorrowRequestCreated event");
}

function publishBorrowConfirmed(borrow) {
  const purchasesChannel = getChannel();
  if (!purchasesChannel) {
    console.error("RabbitMQ channel not initialized");
    return;
  }

  channel.sendToQueue(
    "BorrowRequestConfirmed",
    Buffer.from(JSON.stringify(borrow)),
    { persistent: true }
  );
  console.log("Published BorrowRequestConfirmed event");
}

module.exports = {
  initOperationPublisher,
  publishPurchaseCreated,
  publishPurchaseConfirmed,
  publishBorrowCreated,
  publishBorrowConfirmed,
};
