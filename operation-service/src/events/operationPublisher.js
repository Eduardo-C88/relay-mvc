// const { getChannel } = require("../utils/rabbitmq");

// const QUEUES = [
//   "PurchaseRequestCreated",
//   "PurchaseRequestConfirmed",
//   "BorrowRequestCreated",
//   "BorrowRequestConfirmed",
// ];

// /**
//  * Initialize all queues at startup
//  */
// async function initOperationPublisher() {
//   const channel = getChannel();
//   if (!channel) {
//     console.error("Cannot init OperationPublisher, channel not ready");
//     return;
//   }

//   for (const queue of QUEUES) {
//     await channel.assertQueue(queue, { durable: true });
//   }

//   console.log("✅ Operation queues initialized:", QUEUES.join(", "));
// }

// /**
//  * Generic publish helper
//  */
// function publishToQueue(queue, payload) {
//   const channel = getChannel();
//   if (!channel) {
//     console.error(`RabbitMQ channel not initialized. Failed to send to ${queue}`);
//     return;
//   }

//   try {
//     channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), { persistent: true });
//     console.log(`📤 Published event to ${queue}`);
//   } catch (err) {
//     console.error(`Failed to publish to ${queue}:`, err);
//   }
// }

// // Specific publishers
// function publishPurchaseCreated(purchase) {
//   publishToQueue("PurchaseRequestCreated", purchase);
// }

// function publishPurchaseConfirmed(purchase) {
//   publishToQueue("PurchaseRequestConfirmed", purchase);
// }

// function publishBorrowCreated(borrow) {
//   publishToQueue("BorrowRequestCreated", borrow);
// }

// function publishBorrowConfirmed(borrow) {
//   publishToQueue("BorrowRequestConfirmed", borrow);
// }

// module.exports = {
//   initOperationPublisher,
//   publishPurchaseCreated,
//   publishPurchaseConfirmed,
//   publishBorrowCreated,
//   publishBorrowConfirmed,
// };

const { initPublisher, publishEvent } = require("../messaging/publisher");
const EVENTS = require("../messaging/events");

async function initOperationMessaging() {
  await initPublisher([
    EVENTS.PURCHASE_REQUESTED,
    EVENTS.PURCHASE_APPROVED,
    EVENTS.PURCHASE_REJECTED,
    EVENTS.PURCHASE_COMPLETED,
    EVENTS.BORROW_REQUESTED,
    EVENTS.BORROW_APPROVED,
    EVENTS.BORROW_REJECTED,
    EVENTS.BORROW_COMPLETED,
  ]);
}

function publishPurchaseRequested(data) {
  publishEvent(EVENTS.PURCHASE_REQUESTED, "PurchaseRequested", data);
}

function publishPurchaseApproved(data) {
  publishEvent(EVENTS.PURCHASE_APPROVED, "PurchaseApproved", data);
}

function publishPurchaseRejected(data) {
  publishEvent(EVENTS.PURCHASE_REJECTED, "PurchaseRejected", data);
}

function publishPurchaseCompleted(data) {
  publishEvent(EVENTS.PURCHASE_COMPLETED, "PurchaseCompleted", data);
}

function publishBorrowRequested(data) {
  publishEvent(EVENTS.BORROW_REQUESTED, "BorrowRequested", data);
}

function publishBorrowApproved(data) {
  publishEvent(EVENTS.BORROW_APPROVED, "BorrowApproved", data);
}

function publishBorrowRejected(data) {
  publishEvent(EVENTS.BORROW_REJECTED, "BorrowRejected", data);
}

function publishBorrowCompleted(data) {
  publishEvent(EVENTS.BORROW_COMPLETED, "BorrowCompleted", data);
}

module.exports = {
  initOperationMessaging,
  publishPurchaseRequested,
  publishPurchaseApproved,
  publishPurchaseRejected,
  publishPurchaseCompleted,
  publishBorrowRequested,
  publishBorrowApproved,
  publishBorrowRejected,
  publishBorrowCompleted,
};
