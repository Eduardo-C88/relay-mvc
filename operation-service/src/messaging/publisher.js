const { getChannel } = require("../utils/rabbitmq");

async function initPublisher(queues = []) {
  const channel = getChannel();
  if (!channel) throw new Error("RabbitMQ channel not ready");

  for (const queue of queues) {
    await channel.assertQueue(queue, { durable: true });
  }

  console.log("✅ Publisher initialized:", queues.join(", "));
}

function publishEvent(queue, eventType, payload) {
  const channel = getChannel();
  if (!channel) throw new Error("RabbitMQ channel not ready");

  const event = {
    eventType,
    payload,
    occurredAt: new Date().toISOString(),
  };

  channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify(event)),
    { persistent: true }
  );

  console.log(`📤 Event published → ${eventType}`);
}

module.exports = {
  initPublisher,
  publishEvent,
};
