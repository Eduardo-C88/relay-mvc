const { getChannel } = require("../utils/rabbitmq");

const USER_EXCHANGE = "user_events";

/**
 * Initialize exchange
 */
async function initUserPublisher() {
  const channel = getChannel();
  if (!channel) return;

  await channel.assertExchange(USER_EXCHANGE, 'fanout', { durable: true });
  console.log("✅ User publisher exchange initialized");
}

/**
 * Publish a message to the user_events exchange
 */
function publishUserEvent(eventName, payload) {
  const channel = getChannel();
  if (!channel) return;

  channel.publish(
    USER_EXCHANGE,
    '',
    Buffer.from(JSON.stringify(payload)),
    { persistent: true }
  );
  console.log(`📤 Published ${eventName} event`);
}

function publishUserCreated(user) {
  publishUserEvent("UserCreated", user);
}

function publishUserUpdated(user) {
  publishUserEvent("UserUpdated", user);
}

module.exports = { initUserPublisher, publishUserCreated, publishUserUpdated };
