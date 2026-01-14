const { getChannel } = require("../utils/rabbitmq");

const QUEUES = [
  "PurchaseRequestCreated",
  "PurchaseRequestConfirmed",
  "BorrowRequestCreated",
  "BorrowRequestConfirmed",
];

/**
 * Initialize all queues at startup
 */
async function initOperationPublisher() {
  const channel = getChannel();
  if (!channel) {
    console.error("Cannot init OperationPublisher, channel not ready");
    return;
  }

  for (const queue of QUEUES) {
    await channel.assertQueue(queue, { durable: true });
  }

  console.log("✅ Operation queues initialized:", QUEUES.join(", "));
}

/**
 * Generic publish helper
 */
function publishToQueue(queue, payload) {
  const channel = getChannel();
  if (!channel) {
    console.error(`RabbitMQ channel not initialized. Failed to send to ${queue}`);
    return;
  }

  try {
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), { persistent: true });
    console.log(`📤 Published event to ${queue}`);
  } catch (err) {
    console.error(`Failed to publish to ${queue}:`, err);
  }
}

// Specific publishers
function publishPurchaseCreated(purchase) {
  publishToQueue("PurchaseRequestCreated", purchase);
}

function publishPurchaseConfirmed(purchase) {
  publishToQueue("PurchaseRequestConfirmed", purchase);
}

function publishBorrowCreated(borrow) {
  publishToQueue("BorrowRequestCreated", borrow);
}

function publishBorrowConfirmed(borrow) {
  publishToQueue("BorrowRequestConfirmed", borrow);
}

module.exports = {
  initOperationPublisher,
  publishPurchaseCreated,
  publishPurchaseConfirmed,
  publishBorrowCreated,
  publishBorrowConfirmed,
};
