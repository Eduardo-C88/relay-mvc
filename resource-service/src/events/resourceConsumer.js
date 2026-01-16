// const { getChannel } = require("../utils/rabbitmq");
// const { createOrUpdateUserProfile } = require('../services/userProfileService');
// const resourceService = require("../services/resourcesService");

// /**
//  * Generic helper to consume messages from a queue
//  */
// async function consumeQueue(queueName, handler, { prefetch = 1 } = {}) {
//   let channel = getChannel();
//   if (!channel) {
//     console.error(`RabbitMQ channel not ready for ${queueName}`);
//     return;
//   }

//   await channel.assertQueue(queueName, { durable: true });
//   channel.prefetch(prefetch);

//   console.log(`✅ Waiting for messages on queue: ${queueName}`);

//   channel.consume(queueName, async (msg) => {
//     if (!msg || !msg.content) return;

//     try {
//       const payload = JSON.parse(msg.content.toString());
//       await handler(payload);
//       channel.ack(msg);
//     } catch (err) {
//       console.error(`❌ Error processing message from ${queueName}:`, err);
//       channel.nack(msg, false, false); // discard bad message
//     }
//   });
// }

// /**
//  * Generic helper to consume fanout exchange
//  */
// async function consumeFanout(exchangeName, queueName, handler) {
//   let channel = getChannel();
//   if (!channel) {
//     console.error(`RabbitMQ channel not ready for exchange ${exchangeName}`);
//     return;
//   }

//   await channel.assertExchange(exchangeName, 'fanout', { durable: true });
//   const q = await channel.assertQueue(queueName, { durable: true });
//   await channel.bindQueue(q.queue, exchangeName, '');
//   channel.prefetch(1);

//   console.log(`✅ Waiting for messages on fanout exchange ${exchangeName} -> queue ${queueName}`);

//   channel.consume(q.queue, async (msg) => {
//     if (!msg || !msg.content) return;

//     try {
//       const payload = JSON.parse(msg.content.toString());
//       await handler(payload);
//       channel.ack(msg);
//     } catch (err) {
//       console.error(`❌ Error processing fanout message from ${exchangeName}:`, err);
//       channel.nack(msg, false, false);
//     }
//   });
// }

// /**
//  * Specific consumers
//  */
// async function startUserEventsConsumer() {
//   await consumeFanout('user_events', 'resource_service_user_sync', async (user) => {
//     console.log(`Processing User Event: ${user.id || user.userId}`);
//     await createOrUpdateUserProfile(user);
//     console.log(`User profile synced for ID: ${user.id || user.userId}`);
//   });
// }

// async function startPurchaseRequestConsumer() {
//   await consumeQueue('PurchaseRequestCreated', async (purchase) => {
//     console.log(`Processing PurchaseRequestCreated for resource ${purchase.resourceId}`);
//     await resourceService.changeResourceStatus(purchase.resourceId, purchase.statusId);
//   });
// }

// async function startPurchaseConfirmedConsumer() {
//   await consumeQueue('PurchaseRequestConfirmed', async (purchase) => {
//     console.log(`Processing PurchaseRequestConfirmed for resource ${purchase.resourceId}`);
//     await resourceService.changeResourceStatus(purchase.resourceId, purchase.statusId);
//   });
// }

// module.exports = {
//   startUserEventsConsumer,
//   startPurchaseRequestConsumer,
//   startPurchaseConfirmedConsumer,
// };

const { consume } = require("../messaging/consumer");
const EVENTS = require("../messaging/events");
const { createOrUpdateUserProfile } = require('../services/userProfileService');
const resourceService = require("../services/resourcesService");
const { publishResourceReserved, publishResourceReservationFailed } = require("./resourcePublisher");

async function startResourceConsumers() {
  // Consume user created/updated events
  await consume(EVENTS.USER_CREATED, async (message) => {
    console.log("RAW EVENT:", JSON.stringify(message, null, 2));
    // console.log(`Processing UserCreated event for ID: ${user.userId}`);
    // await createOrUpdateUserProfile(user);
    // console.log(`User profile synced for ID: ${user.userId}`);
  });

  await consume(EVENTS.USER_UPDATED, async (user) => {
    console.log(`Processing UserUpdated event for ID: ${user.userId}`);
    await createOrUpdateUserProfile(user);
    console.log(`User profile synced for ID: ${user.userId}`);
  });

  // Consume purchase request created events
  await consume(EVENTS.PURCHASE_REQUESTED, async (purchase) => {
    try {
      console.log(`Processing PurchaseRequestRequested for resource ${purchase.resourceId}`);
      const ownerId = await resourceService.validatePurchaseRequest(purchase.resourceId, purchase.buyerId);

      await resourceService.reserveResource(purchase.resourceId);

      publishResourceReserved({
        purchaseId: purchase.purchaseId,
        resourceId: purchase.resourceId,
        ownerId: ownerId,
      });
    } catch (error) {
      console.error(`Resource reservation failed for resource ${purchase.resourceId}:`, error);
      // Here you would publish a reservation failed event
      publishResourceReservationFailed({
        purchaseId: purchase.purchaseId,
        resourceId: purchase.resourceId,
        reason: error.message,  
      });
    }
  });

  // Consume purchase approved events
  await consume(EVENTS.PURCHASE_APPROVED, async (purchase) => {
    console.log(`Processing PurchaseApproved for resource ${purchase.resourceId}`);
    await resourceService.resourceApproved(purchase.resourceId);
  });

  // Consume purchase rejected events
  await consume(EVENTS.PURCHASE_REJECTED, async (purchase) => {
    console.log(`Processing PurchaseRejected for resource ${purchase.resourceId}`);
    await resourceService.resourceRejected(purchase.resourceId);
  });
}

module.exports = {
  startResourceConsumers,
};  