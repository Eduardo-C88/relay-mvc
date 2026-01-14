const { getChannel } = require("../utils/rabbitmq");
const { createOrUpdateUserProfile } = require('../services/userProfileService');
const resourceService = require("../services/resourcesService");

/**
 * Consumes User Events (Created & Updated)
 * Listens to the 'user_events' Fanout Exchange.
 */
async function startUserEventsConsumer(channel) {
  if (!channel) channel = getChannel();
  if (!channel) {
    console.error("RabbitMQ channel not initialized for User Events");
    return;
  }

  const USER_EXCHANGE = "user_events";
  const QUEUE_NAME = "resource_service_user_sync"; // Single queue for this service's user sync

  try {
    // 1. Assert Exchange (Matches Publisher)
    await channel.assertExchange(USER_EXCHANGE, 'fanout', { durable: true });

    // 2. Assert Queue
    const q = await channel.assertQueue(QUEUE_NAME, { durable: true });

    // 3. Bind Queue to Exchange
    await channel.bindQueue(q.queue, USER_EXCHANGE, '');

    // 4. Prefetch (Process 1 message at a time)
    channel.prefetch(1);

    console.log(`Resource Service: Waiting for user events in ${q.queue}`);

    channel.consume(q.queue, async (msg) => {
      if (msg.content) {
        try {
          const user = JSON.parse(msg.content.toString());
          console.log(`Processing user event for ID: ${user.userId || user.id}`);

          // Both Create and Update logic are handled by upsert in your service
          await createOrUpdateUserProfile(user);

          channel.ack(msg);
        } catch (error) {
          console.error("Error processing User Event:", error);
          // Requeue = false (Discard or DLQ to prevent infinite loops on bad JSON)
          channel.nack(msg, false, false);
        }
      }
    });
  } catch (err) {
    console.error("Error setting up User Consumer:", err);
  }
}

/**
 * Consumes Purchase Request Created
 * Direct Queue (Point-to-Point)
 */
async function startPurchaseRequestConsumer(channel) {
  if (!channel) channel = getChannel();
  if (!channel) return;

  const QUEUE_NAME = "PurchaseRequestCreated";

  try {
    await channel.assertQueue(QUEUE_NAME, { durable: true }); // Ensure queue exists
    channel.prefetch(1);

    console.log(`Resource Service: Waiting for ${QUEUE_NAME}`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg.content) {
        try {
          const purchaseRequest = JSON.parse(msg.content.toString());
          
          await resourceService.changeResourceStatus(
            purchaseRequest.resourceId,
            purchaseRequest.statusId
          );

          channel.ack(msg);
        } catch (error) {
          console.error(`Error processing ${QUEUE_NAME}:`, error);
          channel.nack(msg, false, false);
        }
      }
    });
  } catch (err) {
    console.error(`Error setting up ${QUEUE_NAME} consumer:`, err);
  }
}

/**
 * Consumes Purchase Request Confirmed
 * Direct Queue (Point-to-Point)
 */
async function startPurchaseConfirmedConsumer(channel) {
  if (!channel) channel = getChannel();
  if (!channel) return;

  const QUEUE_NAME = "PurchaseRequestConfirmed";

  try {
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    channel.prefetch(1);

    console.log(`Resource Service: Waiting for ${QUEUE_NAME}`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg.content) {
        try {
          const purchaseConfirmed = JSON.parse(msg.content.toString());

          await resourceService.changeResourceStatus(
            purchaseConfirmed.resourceId,
            purchaseConfirmed.statusId
          );

          channel.ack(msg);
        } catch (error) {
          console.error(`Error processing ${QUEUE_NAME}:`, error);
          channel.nack(msg, false, false);
        }
      }
    });
  } catch (err) {
    console.error(`Error setting up ${QUEUE_NAME} consumer:`, err);
  }
}

module.exports = { 
  startUserEventsConsumer, 
  startPurchaseRequestConsumer, 
  startPurchaseConfirmedConsumer 
};