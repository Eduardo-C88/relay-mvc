const { getChannel } = require("../utils/rabbitmq");

async function consume(queue, handler, { prefetch = 1 } = {}) {
  const channel = getChannel();
  if (!channel) throw new Error("RabbitMQ channel not ready");

  await channel.assertQueue(queue, { durable: true });
  channel.prefetch(prefetch);

  console.log(`✅ Listening on queue: ${queue}`);

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());
      await handler(event);
      channel.ack(msg);
    } catch (err) {
      console.error(`❌ Error processing ${queue}:`, err);
      channel.nack(msg, false, false);
    }
  });
}

module.exports = {
  consume,
};
